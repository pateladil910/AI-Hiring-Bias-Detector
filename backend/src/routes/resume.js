const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const axios = require('axios');
const FormData = require('form-data');
const pdfParse = require('pdf-parse');
const { CandidateResume, AuditLog } = require('../models');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../uploads/resumes');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `resume_${Date.now()}_${crypto.randomBytes(4).toString('hex')}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (_req, file, cb) => {
    const allowed = ['.pdf', '.docx', '.doc', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only .pdf, .docx, or .txt files are supported'));
    }
  },
});

// Fallback PII redaction and skill extraction
function redactAndExtractLocal(rawText) {
  const detectedMarkers = [];

  // Email redaction
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  let emailsFound = rawText.match(emailRegex);
  if (emailsFound) {
    detectedMarkers.push({ type: 'Email Address', count: emailsFound.length, example: '[REDACTED EMAIL]' });
  }
  let redacted = rawText.replace(emailRegex, '[REDACTED_EMAIL]');

  // Phone redaction
  const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
  let phonesFound = redacted.match(phoneRegex);
  if (phonesFound) {
    detectedMarkers.push({ type: 'Phone Number', count: phonesFound.length, example: '[REDACTED PHONE]' });
  }
  redacted = redacted.replace(phoneRegex, '[REDACTED_PHONE]');

  // Address/Location pattern
  const locRegex = /(?:address|location|residence):\s*[^\n]+/gi;
  if (redacted.match(locRegex)) {
    detectedMarkers.push({ type: 'Address / Location', count: 1, example: '[REDACTED LOCATION]' });
    redacted = redacted.replace(locRegex, 'Location: [REDACTED_LOCATION]');
  }

  // Common technical skills extraction
  const skillKeywords = [
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'Express', 'Python', 'Django', 'FastAPI',
    'PyTorch', 'TensorFlow', 'SQL', 'PostgreSQL', 'MongoDB', 'AWS', 'Docker', 'Kubernetes',
    'Git', 'CI/CD', 'REST APIs', 'GraphQL', 'TailwindCSS', 'HTML', 'CSS', 'Linux'
  ];

  const extractedSkills = skillKeywords.filter((skill) =>
    new RegExp(`\\b${skill}\\b`, 'i').test(rawText)
  );

  return {
    redactedText: redacted,
    detectedMarkers,
    extractedSkills: extractedSkills.length > 0 ? extractedSkills : ['Full Stack Development', 'Problem Solving', 'Software Engineering'],
    biasScore: 1.2,
  };
}

// ─── POST /api/resume/upload ──────────────────────────────────────────────────
router.post('/upload', authenticate, requireRole('candidate'), upload.single('resume'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: { code: 'FILE_REQUIRED', message: 'No resume file uploaded' } });
  }

  try {
    const filePath = req.file.path;
    let rawText = '';

    // Extract text
    if (req.file.mimetype === 'application/pdf' || req.file.originalname.endsWith('.pdf')) {
      const dataBuffer = fs.readFileSync(filePath);
      const parsed = await pdfParse(dataBuffer);
      rawText = parsed.text;
    } else {
      rawText = fs.readFileSync(filePath, 'utf8');
    }

    let redactionResult;

    // Try AI Microservice first
    try {
      const form = new FormData();
      form.append('file', fs.createReadStream(filePath), req.file.originalname);
      const aiResponse = await axios.post(`${AI_SERVICE_URL}/analyze/resume`, form, {
        headers: form.getHeaders(),
        timeout: 10000,
      });

      const d = aiResponse.data;
      redactionResult = {
        redactedText: d.redacted_text || rawText,
        detectedMarkers: Array.isArray(d.redactions)
          ? d.redactions.map((r) => ({ type: r.category || 'PII Marker', count: 1, example: r.original_snippet || '[REDACTED]' }))
          : [{ type: 'Name & Contact', count: 1, example: '[REDACTED]' }],
        extractedSkills: d.extracted_skills || [],
        biasScore: d.bias_score || 1.4,
      };
    } catch (aiErr) {
      // Fallback to local regex redaction
      console.warn('[Resume Upload] AI microservice unavailable, using local redaction engine:', aiErr.message);
      redactionResult = redactAndExtractLocal(rawText);
    }

    // Generate cloaked reference ID e.g. CAND-8F3A2E
    const refId = `CAND-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    // Create CandidateResume record
    const resumeRecord = await CandidateResume.create({
      userId: req.user.id,
      refId,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      redactedText: redactionResult.redactedText,
      detectedMarkersJson: redactionResult.detectedMarkers,
      extractedSkillsJson: redactionResult.extractedSkills,
      biasScore: redactionResult.biasScore,
      confirmed: false,
      consentTimestamp: new Date(),
    });

    // Audit Log
    await AuditLog.create({
      action: 'RESUME_ANONYMIZED',
      entityType: 'candidate_resume',
      entityId: resumeRecord.id,
      userId: req.user.id,
      reason: 'Candidate uploaded resume for algorithmic anonymization',
      meta: {
        refId,
        fileName: req.file.originalname,
        markersCount: redactionResult.detectedMarkers.length,
      },
    });

    return res.status(201).json({
      success: true,
      refId,
      fileName: req.file.originalname,
      redactedText: redactionResult.redactedText,
      detectedMarkers: redactionResult.detectedMarkers,
      extractedSkills: redactionResult.extractedSkills,
      biasScore: redactionResult.biasScore,
      confirmed: false,
    });
  } catch (err) {
    console.error('[Resume Upload Error]', err.message);
    return res.status(500).json({ error: { code: 'UPLOAD_FAILED', message: 'Failed to process and anonymize resume' } });
  }
});

// ─── GET /api/resume/my ───────────────────────────────────────────────────────
router.get('/my', authenticate, requireRole('candidate'), async (req, res) => {
  try {
    const resume = await CandidateResume.findOne({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
    });

    if (!resume) {
      return res.json({ resume: null });
    }

    return res.json({
      resume: {
        id: resume.id,
        refId: resume.refId,
        fileName: resume.fileName,
        fileSize: resume.fileSize,
        redactedText: resume.redactedText,
        detectedMarkers: resume.detectedMarkersJson || [],
        extractedSkills: resume.extractedSkillsJson || [],
        biasScore: resume.biasScore,
        confirmed: resume.confirmed,
        createdAt: resume.createdAt,
      },
    });
  } catch (err) {
    console.error('[Resume Fetch Error]', err.message);
    return res.status(500).json({ error: { code: 'FETCH_FAILED', message: 'Could not fetch resume' } });
  }
});

// ─── GET /api/resume/profile/:refId ───────────────────────────────────────────
router.get('/profile/:refId', authenticate, async (req, res) => {
  try {
    const resume = await CandidateResume.findOne({ where: { refId: req.params.refId } });
    if (!resume) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Resume profile not found' } });
    }

    // Candidates can only view their own resume
    if (req.user.role === 'candidate' && resume.userId !== req.user.id) {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Access denied' } });
    }

    return res.json({
      refId: resume.refId,
      redactedText: resume.redactedText,
      detectedMarkers: resume.detectedMarkersJson || [],
      extractedSkills: resume.extractedSkillsJson || [],
      biasScore: resume.biasScore,
      confirmed: resume.confirmed,
      createdAt: resume.createdAt,
    });
  } catch (err) {
    return res.status(500).json({ error: { code: 'FETCH_FAILED', message: 'Could not load profile' } });
  }
});

// ─── POST /api/resume/confirm/:refId ──────────────────────────────────────────
router.post('/confirm/:refId', authenticate, requireRole('candidate'), async (req, res) => {
  try {
    const resume = await CandidateResume.findOne({
      where: { refId: req.params.refId, userId: req.user.id },
    });

    if (!resume) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Resume not found' } });
    }

    resume.confirmed = true;
    await resume.save();

    await AuditLog.create({
      action: 'RESUME_CONFIRMED',
      entityType: 'candidate_resume',
      entityId: resume.id,
      userId: req.user.id,
      reason: 'Candidate confirmed anonymized resume preview',
      meta: { refId: resume.refId },
    });

    return res.json({ success: true, message: 'Anonymized resume confirmed successfully', refId: resume.refId });
  } catch (err) {
    return res.status(500).json({ error: { code: 'CONFIRM_FAILED', message: 'Failed to confirm resume' } });
  }
});

module.exports = router;
