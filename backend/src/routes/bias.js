/**
 * routes/bias.js — Bias Detection Proxy Routes
 *
 * POST /api/bias/deep-scan  (auth required — recruiter/admin)
 *   Proxies to Python FastAPI /scan-bias.
 *   Falls back to a rich mock if Python service is unreachable.
 *
 * POST /api/bias/quick-scan  (public, rate-limited)
 *   Lightweight lexicon scan — used by the landing page demo.
 *   Proxies to Python /analyze/jd/quick, or uses inline mock.
 *
 * POST /api/bias/accept-suggestion  (auth required)
 *   Writes a BIAS_SUGGESTION_ACCEPTED audit record with SHA-256 diff hash.
 *
 * POST /api/bias/dismiss-flag  (auth required)
 *   Writes a BIAS_FLAG_DISMISSED audit record.
 */

const express = require('express');
const crypto  = require('crypto');
const router  = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const { Job, AuditLog, AUDIT_ACTIONS } = require('../models');

const AI_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
const FETCH_TIMEOUT_MS = 8000;

// ─── Helper: fetch with timeout ───────────────────────────────────────────────
async function fetchWithTimeout(url, options = {}, timeoutMs = FETCH_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

// ─── Rich mock for demo mode (Python service offline) ─────────────────────────
const DEEP_SCAN_MOCK = {
  score: 54.0,
  rating: 'moderate_bias',
  model: 'mock-demo',
  flag_count: 4,
  flags: [
    {
      id: 'mock_1', phrase: 'rockstar', category: 'gender_coded',
      suggestion: 'skilled professional', severity: 'medium', start: 0, end: 8,
      explanation: 'Masculine-coded framing linked to lower application rates from women.',
      source: 'mock',
    },
    {
      id: 'mock_2', phrase: 'young', category: 'age_bias',
      suggestion: 'motivated', severity: 'high', start: 0, end: 5,
      explanation: 'Directly indicates preference for younger age demographic.',
      source: 'mock',
    },
    {
      id: 'mock_3', phrase: 'native English', category: 'pedigree_bias',
      suggestion: 'fluent in English', severity: 'high', start: 0, end: 13,
      explanation: 'Discriminates against non-native fluent speakers.',
      source: 'mock',
    },
    {
      id: 'mock_4', phrase: 'ninja', category: 'gender_coded',
      suggestion: 'expert engineer', severity: 'medium', start: 0, end: 5,
      explanation: 'Overly aggressive jargon that discourages diverse candidates.',
      source: 'mock',
    },
  ],
  structural_notes: [
    'No salary range disclosed — may deter female and minority applicants.',
    'Requirements list exceeds 12 items — consider trimming to essentials.',
  ],
  _fallback: true,
  _fallback_reason: 'Python AI service offline — showing demo results',
};

const QUICK_SCAN_MOCK = {
  score: 100.0,
  rating: 'fair_and_inclusive',
  flags: [],
  flag_count: 0,
  source: 'mock',
};

// ─── POST /api/bias/deep-scan ─────────────────────────────────────────────────
router.post('/deep-scan', authenticate, requireRole('recruiter', 'hr_lead', 'admin'), async (req, res) => {
  const { text, role_title, job_id } = req.body;

  if (!text || text.trim().length < 10) {
    return res.status(422).json({ error: { message: 'Text too short for deep scan (min 10 chars).' } });
  }

  let resultData = null;

  try {
    const aiRes = await fetchWithTimeout(`${AI_URL}/analyze/jd`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, role_title, jd_id: job_id }),
    });

    if (!aiRes.ok) {
      console.warn(`[Deep Scan] Python service returned ${aiRes.status} — using mock`);
      resultData = { ...DEEP_SCAN_MOCK, _fallback_reason: `Python service error ${aiRes.status}` };
    } else {
      resultData = await aiRes.json();
    }
  } catch (err) {
    // Connection refused or timeout — graceful mock fallback
    const reason = err.name === 'AbortError'
      ? 'Python AI service timed out — showing demo results'
      : 'Python AI service offline — showing demo results';
    console.warn(`[Deep Scan] Fallback activated: ${reason}`);
    resultData = { ...DEEP_SCAN_MOCK, _fallback_reason: reason };
  }

  // If job_id provided, persist the score and skill profile to the Job
  if (job_id && resultData && resultData.score !== undefined) {
    try {
      const job = await Job.findByPk(job_id);
      if (job) {
        job.biasScore = resultData.score;
        if (resultData.skill_profile) job.skillProfileJson = resultData.skill_profile;
        await job.save();
      }
    } catch (saveErr) {
      console.warn('[Deep Scan] Failed to update job score:', saveErr.message);
    }
  }

  return res.json(resultData);
});

// ─── POST /api/bias/quick-scan (public, no auth) ──────────────────────────────
router.post('/quick-scan', async (req, res) => {
  const { text, role_title } = req.body;

  if (!text || text.trim().length < 3) {
    return res.json({ score: 100, rating: 'fair_and_inclusive', flags: [], flag_count: 0 });
  }

  try {
    const aiRes = await fetchWithTimeout(`${AI_URL}/analyze/jd/quick`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, role_title }),
    }, 3000); // shorter timeout for live typing

    if (!aiRes.ok) {
      return res.json(QUICK_SCAN_MOCK);
    }

    const data = await aiRes.json();
    return res.json(data);
  } catch {
    // Silently return clean score — don't break the landing page
    return res.json(QUICK_SCAN_MOCK);
  }
});

// ─── POST /api/bias/accept-suggestion ────────────────────────────────────────
router.post('/accept-suggestion', authenticate, requireRole('recruiter', 'hr_lead', 'admin'), async (req, res) => {
  try {
    const { jobId, originalText, updatedText, flagPhrase, suggestion } = req.body;

    // SHA-256 diff hash captures the exact before/after state
    const diffHash = crypto
      .createHash('sha256')
      .update(`${originalText}|||${updatedText}`)
      .digest('hex');

    await AuditLog.create({
      action: AUDIT_ACTIONS.BIAS_SUGGESTION_ACCEPTED || 'BIAS_SUGGESTION_ACCEPTED',
      entityType: 'job',
      entityId: jobId || req.user.id,
      userId: req.user.id,
      meta: {
        flagPhrase,
        suggestion,
        diffHash,
        originalLength: originalText?.length,
        updatedLength: updatedText?.length,
      },
    });

    return res.json({ ok: true, diffHash });
  } catch (err) {
    console.error('[ACCEPT SUGGESTION ERROR]', err.message);
    // Non-critical — don't fail the UX if audit logging fails
    return res.json({ ok: true, diffHash: null });
  }
});

// ─── POST /api/bias/dismiss-flag ─────────────────────────────────────────────
router.post('/dismiss-flag', authenticate, requireRole('recruiter', 'hr_lead', 'admin'), async (req, res) => {
  try {
    const { jobId, flagPhrase, flagCategory, reason } = req.body;

    await AuditLog.create({
      action: AUDIT_ACTIONS.BIAS_FLAG_DISMISSED || 'BIAS_FLAG_DISMISSED',
      entityType: 'job',
      entityId: jobId || req.user.id,
      userId: req.user.id,
      meta: {
        flagPhrase,
        flagCategory,
        reason: reason || 'Bona fide occupational qualification',
      },
    });

    return res.json({ ok: true });
  } catch (err) {
    console.error('[DISMISS FLAG ERROR]', err.message);
    return res.json({ ok: true });
  }
});

module.exports = router;
