const express = require('express');
const { body, validationResult } = require('express-validator');
const { Job } = require('../models');
const { authenticate, requireRole } = require('../middleware/auth');

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
      attributes: ['id', 'title', 'biasScore', 'status', 'createdAt'],
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

// ─── GET /api/jobs/:id — Get a single job ─────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Job not found' },
      });
    }
    return res.json({ job });
  } catch (err) {
    console.error('[JOB GET ERROR]', err.message);
    return res.status(500).json({
      error: { code: 'FETCH_FAILED', message: 'Failed to fetch job' },
    });
  }
});

// ─── POST /api/jobs — Create a job (recruiters/hr_lead/admin only) ────────────
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
        // biasScore and skillProfileJson are set by the AI service in Phase 1
      });

      return res.status(201).json({ job });
    } catch (err) {
      console.error('[JOB CREATE ERROR]', err.message);
      return res.status(500).json({
        error: { code: 'CREATE_FAILED', message: 'Failed to create job' },
      });
    }
  }
);

module.exports = router;
