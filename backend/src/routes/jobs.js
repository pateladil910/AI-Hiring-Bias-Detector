const express = require('express');
const { body, validationResult } = require('express-validator');
const { Job, AuditLog } = require('../models');
const { authenticate, requireRole } = require('../middleware/auth');
const { analyzeJD } = require('../services/biasDetectionService');

const router = express.Router();

const handleValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: errors.array() },
    });
  }
  return null;
};

// ─── GET /api/jobs — List published jobs (public) ─────────────────────────────
router.get('/', async (_req, res) => {
  try {
    const jobs = await Job.findAll({
      where: { status: 'published' },
      attributes: ['id', 'title', 'biasScore', 'skillProfileJson', 'status', 'createdAt'],
      order: [['createdAt', 'DESC']],
    });
    return res.json({ jobs });
  } catch (err) {
    console.error('[JOBS LIST ERROR]', err.message);
    return res.status(500).json({
      error: { code: 'FETCH_FAILED', message: 'Failed to fetch jobs' },
    });
  }
});

// ─── GET /api/jobs/my — List recruiter's own jobs (all statuses) ───────────────
router.get('/my', authenticate, requireRole('recruiter', 'hr_lead', 'admin'), async (req, res) => {
  try {
    const jobs = await Job.findAll({
      where: { createdBy: req.user.id },
      attributes: ['id', 'title', 'biasScore', 'skillProfileJson', 'status', 'createdAt'],
      order: [['createdAt', 'DESC']],
    });
    return res.json({ jobs });
  } catch (err) {
    console.error('[MY JOBS ERROR]', err.message);
    return res.status(500).json({ error: { code: 'FETCH_FAILED', message: 'Failed to fetch your jobs' } });
  }
});

// ─── GET /api/jobs/:id — Get a single job ─────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Job not found' } });
    }
    return res.json({ job });
  } catch (err) {
    console.error('[JOB GET ERROR]', err.message);
    return res.status(500).json({ error: { code: 'FETCH_FAILED', message: 'Failed to fetch job' } });
  }
});

// ─── POST /api/jobs — Create a job draft ──────────────────────────────────────
router.post(
  '/',
  authenticate,
  requireRole('recruiter', 'hr_lead', 'admin'),
  [
    body('title').trim().notEmpty().withMessage('Job title is required'),
    body('rawText').trim().isLength({ min: 50 }).withMessage('Job description must be at least 50 characters'),
  ],
  async (req, res) => {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return;

    try {
      const { title, rawText } = req.body;

      const job = await Job.create({
        title,
        rawText,
        orgId: req.user.orgId,
        createdBy: req.user.id,
        status: 'draft',
      });

      return res.status(201).json({ job });
    } catch (err) {
      console.error('[JOB CREATE ERROR]', err.message);
      return res.status(500).json({ error: { code: 'CREATE_FAILED', message: 'Failed to create job' } });
    }
  }
);

// ─── PUT /api/jobs/:id — Update JD text ───────────────────────────────────────
router.put(
  '/:id',
  authenticate,
  requireRole('recruiter', 'hr_lead', 'admin'),
  [
    body('title').optional().trim().notEmpty(),
    body('rawText').optional().trim().isLength({ min: 50 }),
  ],
  async (req, res) => {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return;

    try {
      const job = await Job.findByPk(req.params.id);
      if (!job) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Job not found' } });
      if (job.createdBy !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'You do not own this job' } });
      }
      if (job.status === 'published') {
        return res.status(409).json({ error: { code: 'ALREADY_PUBLISHED', message: 'Published jobs cannot be edited directly. Unpublish first.' } });
      }

      const { title, rawText } = req.body;
      if (title) job.title = title;
      if (rawText) {
        job.rawText = rawText;
        // Reset bias score when text changes — must re-analyze
        job.biasScore = null;
        job.skillProfileJson = null;
      }
      await job.save();

      return res.json({ job });
    } catch (err) {
      console.error('[JOB UPDATE ERROR]', err.message);
      return res.status(500).json({ error: { code: 'UPDATE_FAILED', message: 'Failed to update job' } });
    }
  }
);

// ─── POST /api/jobs/:id/analyze — Run full bias scan ─────────────────────────
router.post(
  '/:id/analyze',
  authenticate,
  requireRole('recruiter', 'hr_lead', 'admin'),
  async (req, res) => {
    try {
      const job = await Job.findByPk(req.params.id);
      if (!job) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Job not found' } });
      if (job.createdBy !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Access denied' } });
      }

      const analysis = await analyzeJD(job.id, job.rawText);

      if (!analysis.error) {
        job.biasScore = analysis.score;
        job.skillProfileJson = analysis.skill_profile;
        await job.save();
      }

      return res.json({
        job: { id: job.id, biasScore: job.biasScore, skillProfileJson: job.skillProfileJson },
        analysis,
      });
    } catch (err) {
      console.error('[JOB ANALYZE ERROR]', err.message);
      return res.status(500).json({ error: { code: 'ANALYZE_FAILED', message: 'Bias analysis failed' } });
    }
  }
);

// ─── PATCH /api/jobs/:id/publish — Publish a JD ──────────────────────────────
router.patch(
  '/:id/publish',
  authenticate,
  requireRole('recruiter', 'hr_lead', 'admin'),
  async (req, res) => {
    try {
      const job = await Job.findByPk(req.params.id);
      if (!job) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Job not found' } });
      if (job.createdBy !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Access denied' } });
      }

      // Require bias scan before publishing — never publish unscanned JDs (rules.md §6)
      if (job.biasScore === null) {
        return res.status(422).json({
          error: {
            code: 'SCAN_REQUIRED',
            message: 'Run a bias scan before publishing. A job cannot go live without being scanned.',
          },
        });
      }

      job.status = 'published';
      await job.save();

      // Audit log
      await AuditLog.create({
        action: 'JOB_PUBLISHED',
        entityType: 'job',
        entityId: job.id,
        userId: req.user.id,
        reason: `Published with bias score ${job.biasScore}`,
      });

      return res.json({ job });
    } catch (err) {
      console.error('[JOB PUBLISH ERROR]', err.message);
      return res.status(500).json({ error: { code: 'PUBLISH_FAILED', message: 'Failed to publish job' } });
    }
  }
);

// ─── PATCH /api/jobs/:id/unpublish — Take a JD offline ───────────────────────
router.patch(
  '/:id/unpublish',
  authenticate,
  requireRole('recruiter', 'hr_lead', 'admin'),
  async (req, res) => {
    try {
      const job = await Job.findByPk(req.params.id);
      if (!job || (job.createdBy !== req.user.id && req.user.role !== 'admin')) {
        return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Job not found' } });
      }
      job.status = 'draft';
      await job.save();
      return res.json({ job });
    } catch (err) {
      return res.status(500).json({ error: { code: 'UNPUBLISH_FAILED', message: 'Failed to unpublish job' } });
    }
  }
);

module.exports = router;
