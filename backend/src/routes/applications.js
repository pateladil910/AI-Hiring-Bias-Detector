const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');
const { Application, Job, AuditLog, User } = require('../models');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// ─── Multer config: disk storage with extension validation ────────────────────
const uploadDir = path.join(__dirname, '../../uploads/resumes');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `resume-${unique}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowed = ['.pdf', '.docx', '.txt'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type. Allowed: ${allowed.join(', ')}`));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// ─── POST /api/applications — Submit application + upload resume ───────────────
router.post(
  '/',
  authenticate,
  requireRole('candidate'),
  upload.single('resume'),
  async (req, res) => {
    const { jobId } = req.body;

    if (!jobId) {
      return res.status(422).json({ error: { code: 'MISSING_JOB_ID', message: 'jobId is required' } });
    }

    // Must have uploaded a resume
    if (!req.file) {
      return res.status(422).json({ error: { code: 'MISSING_RESUME', message: 'Resume file is required' } });
    }

    try {
      // Verify job is published
      const job = await Job.findByPk(jobId);
      if (!job || job.status !== 'published') {
        fs.unlink(req.file.path, () => {});
        return res.status(404).json({ error: { code: 'JOB_NOT_FOUND', message: 'Job not found or not accepting applications' } });
      }

      // Check duplicate application
      const existing = await Application.findOne({
        where: { jobId, candidateId: req.user.id },
      });
      if (existing) {
        fs.unlink(req.file.path, () => {});
        return res.status(409).json({ error: { code: 'ALREADY_APPLIED', message: 'You have already applied to this job' } });
      }

      // Create initial application record
      const application = await Application.create({
        jobId,
        candidateId: req.user.id,
        resumeUrl: `/uploads/resumes/${req.file.filename}`,
        status: 'applied',
      });

      // ── Call AI service to parse + anonymise + scan resume ─────────────────
      let scanResult = null;
      try {
        const form = new FormData();
        form.append('file', fs.createReadStream(req.file.path), {
          filename: req.file.originalname,
          contentType: req.file.mimetype,
        });
        form.append('application_id', application.id);

        const aiRes = await axios.post(`${AI_SERVICE_URL}/analyze/resume`, form, {
          headers: form.getHeaders(),
          timeout: 20000,
        });
        scanResult = aiRes.data;

        // Save anonymised text + bias score
        application.anonymisedText = scanResult.anonymised_text;
        application.resumeBiasScore = scanResult.bias_score;
        await application.save();
      } catch (aiErr) {
        // Graceful degradation — application exists, AI scan deferred
        console.error('[APPLICATIONS] AI resume scan failed (graceful):', aiErr.message);
      }

      // Audit log
      await AuditLog.create({
        action: 'APPLICATION_SUBMITTED',
        entityType: 'application',
        entityId: application.id,
        userId: req.user.id,
        reason: 'Candidate submitted application',
        meta: {
          jobId,
          resumeBiasScore: scanResult?.bias_score ?? null,
          redactedFields: scanResult?.redacted_fields ?? [],
        },
      });

      return res.status(201).json({
        application: {
          id: application.id,
          jobId: application.jobId,
          status: application.status,
          resumeBiasScore: application.resumeBiasScore,
          createdAt: application.createdAt,
        },
        scan: scanResult
          ? {
              biasScore: scanResult.bias_score,
              biasExplanation: scanResult.bias_explanation,
              redactedFields: scanResult.redacted_fields,
              metadata: scanResult.metadata,
            }
          : { status: 'deferred' },
      });
    } catch (err) {
      console.error('[APPLICATION CREATE ERROR]', err.message);
      if (req.file) fs.unlink(req.file.path, () => {});
      return res.status(500).json({ error: { code: 'APPLY_FAILED', message: 'Failed to submit application' } });
    }
  }
);

// ─── GET /api/applications/my — Candidate views their own applications ─────────
router.get('/my', authenticate, requireRole('candidate'), async (req, res) => {
  try {
    const applications = await Application.findAll({
      where: { candidateId: req.user.id },
      include: [{ model: Job, attributes: ['id', 'title', 'status'] }],
      order: [['createdAt', 'DESC']],
    });
    return res.json({ applications });
  } catch (err) {
    console.error('[MY APPLICATIONS ERROR]', err.message);
    return res.status(500).json({ error: { code: 'FETCH_FAILED', message: 'Failed to fetch applications' } });
  }
});

// ─── GET /api/applications/job/:jobId — Recruiter sees applicants for a job ───
router.get(
  '/job/:jobId',
  authenticate,
  requireRole('recruiter', 'hr_lead', 'admin', 'compliance'),
  async (req, res) => {
    try {
      const job = await Job.findByPk(req.params.jobId);
      if (!job) {
        return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Job not found' } });
      }
      if (job.createdBy !== req.user.id && !['admin', 'compliance'].includes(req.user.role)) {
        return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Access denied' } });
      }

      const applications = await Application.findAll({
        where: { jobId: req.params.jobId },
        // IMPORTANT: Do NOT include PII (Candidate name/email) in this response.
        // Recruiter sees anonymised data only — per rules.md §3 (Anonymised Mode)
        attributes: ['id', 'status', 'resumeBiasScore', 'createdAt'],
        order: [['createdAt', 'DESC']],
      });

      return res.json({ applications, job: { id: job.id, title: job.title } });
    } catch (err) {
      console.error('[JOB APPLICATIONS ERROR]', err.message);
      return res.status(500).json({ error: { code: 'FETCH_FAILED', message: 'Failed to fetch applicants' } });
    }
  }
);

// ─── GET /api/applications/:id — Get a single application ─────────────────────
router.get('/:id', authenticate, async (req, res) => {
  try {
    const app = await Application.findByPk(req.params.id, {
      include: [{ model: Job, attributes: ['id', 'title', 'status', 'skillProfileJson'] }],
    });
    if (!app) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Application not found' } });

    // Candidate can see their own; recruiter/admin/compliance can see all
    const isCandidate = req.user.role === 'candidate';
    if (isCandidate && app.candidateId !== req.user.id) {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Access denied' } });
    }

    // Strip PII from candidate view too (they see anonymised version, not original raw text)
    const responseData = {
      ...app.toJSON(),
      // Never expose candidateId or raw resume text in API response
      candidateId: undefined,
      anonymisedText: isCandidate ? undefined : app.anonymisedText,
    };

    return res.json({ application: responseData });
  } catch (err) {
    return res.status(500).json({ error: { code: 'FETCH_FAILED', message: 'Failed to fetch application' } });
  }
});

module.exports = router;
