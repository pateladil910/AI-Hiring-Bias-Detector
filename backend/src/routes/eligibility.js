const express = require('express');
const axios = require('axios');
const {
  Application,
  Job,
  AptitudeTest,
  TestSubmission,
  EligibilityVerdict,
  AuditLog,
} = require('../models');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// ─── Helper: compute resume skill match ──────────────────────────────────────
// Counts how many JD tech_stack tags appear in the anonymised resume text.
// Returns a fraction 0.0–1.0. Pure server-side — no demographic signals used.
function computeResumeSkillMatch(skillProfileJson, anonymisedText) {
  const techStack = skillProfileJson?.tech_stack || [];
  if (!techStack.length || !anonymisedText) return 0;

  const lowerText = anonymisedText.toLowerCase();
  const matched = techStack.filter((tag) => lowerText.includes(tag.toLowerCase().trim()));
  return matched.length / techStack.length;
}

// ─── POST /api/eligibility/compute/:applicationId ─────────────────────────────
// Recruiter triggers eligibility computation after test is completed.
// Fetches all required signals → calls AI service → stores EligibilityVerdict.
router.post(
  '/compute/:applicationId',
  authenticate,
  requireRole('recruiter', 'hr_lead', 'admin'),
  async (req, res) => {
    const { applicationId } = req.params;

    try {
      // ── Fetch application + job + test + submission ───────────────────────
      const application = await Application.findByPk(applicationId, {
        include: [{ model: Job, attributes: ['id', 'title', 'skillProfileJson', 'createdBy'] }],
      });

      if (!application) {
        return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Application not found' } });
      }

      // Check job ownership
      if (
        application.Job.createdBy !== req.user.id &&
        !['admin', 'hr_lead'].includes(req.user.role)
      ) {
        return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Access denied' } });
      }

      // Must be in test_completed status (or later, if re-computing)
      const allowedStatuses = ['test_completed', 'eligible', 'not_eligible', 'needs_review'];
      if (!allowedStatuses.includes(application.status)) {
        return res.status(409).json({
          error: {
            code: 'INVALID_STATUS',
            message: `Cannot compute eligibility for application in '${application.status}' status. Test must be completed first.`,
          },
        });
      }

      // Fetch the linked test + submission
      const aptitudeTest = await AptitudeTest.findOne({ where: { applicationId } });
      if (!aptitudeTest) {
        return res.status(409).json({
          error: { code: 'NO_TEST', message: 'No aptitude test found for this application' },
        });
      }

      const submission = await TestSubmission.findOne({ where: { testId: aptitudeTest.id } });
      if (!submission) {
        return res.status(409).json({
          error: { code: 'NO_SUBMISSION', message: 'Candidate has not submitted the test yet' },
        });
      }

      // ── Compute resume skill match (server-side, no demographics) ─────────
      const resumeSkillMatch = computeResumeSkillMatch(
        application.Job.skillProfileJson,
        application.anonymisedText || ''
      );

      // ── Call AI eligibility service ───────────────────────────────────────
      let eligibilityResult;
      try {
        const aiRes = await axios.post(
          `${AI_SERVICE_URL}/eligibility`,
          {
            application_id: applicationId,
            test_score: submission.autoScore ?? 0,
            resume_skill_match: resumeSkillMatch,
            llm_confidence: submission.llmConfidence ?? 1.0,
          },
          { timeout: 15000 }
        );
        eligibilityResult = aiRes.data;
      } catch (aiErr) {
        console.error('[ELIGIBILITY] AI service failed:', aiErr.message);
        return res.status(503).json({
          error: { code: 'AI_SERVICE_ERROR', message: 'AI eligibility service unavailable. Please try again.' },
        });
      }

      // ── Upsert EligibilityVerdict ─────────────────────────────────────────
      const [verdict, created] = await EligibilityVerdict.findOrCreate({
        where: { applicationId },
        defaults: {
          applicationId,
          verdict: eligibilityResult.verdict,
          explanation: eligibilityResult.explanation,
          modelVersion: eligibilityResult.model_version,
          scoreDetail: {
            testScore: submission.autoScore,
            resumeSkillMatch,
            llmConfidence: submission.llmConfidence,
          },
        },
      });

      // If verdict already existed, update it (re-compute allowed)
      if (!created) {
        verdict.verdict = eligibilityResult.verdict;
        verdict.explanation = eligibilityResult.explanation;
        verdict.modelVersion = eligibilityResult.model_version;
        verdict.scoreDetail = {
          testScore: submission.autoScore,
          resumeSkillMatch,
          llmConfidence: submission.llmConfidence,
        };
        verdict.overriddenBy = null;
        verdict.overrideReason = null;
        verdict.overriddenAt = null;
        await verdict.save();
      }

      // ── Update application status based on verdict ────────────────────────
      const statusMap = {
        eligible:      'eligible',
        not_eligible:  'not_eligible',
        needs_review:  'needs_review',
      };
      application.status = statusMap[eligibilityResult.verdict] || 'needs_review';
      await application.save();

      // ── Audit log ─────────────────────────────────────────────────────────
      await AuditLog.create({
        action: 'ELIGIBILITY_COMPUTED',
        entityType: 'eligibility_verdict',
        entityId: verdict.id,
        userId: req.user.id,
        reason: `AI eligibility engine computed verdict: ${eligibilityResult.verdict}`,
        meta: {
          applicationId,
          jobId: application.Job.id,
          testScore: submission.autoScore,
          resumeSkillMatch,
          verdict: eligibilityResult.verdict,
          modelVersion: eligibilityResult.model_version,
        },
      });

      return res.status(created ? 201 : 200).json({
        verdict: {
          id: verdict.id,
          verdict: verdict.verdict,
          explanation: verdict.explanation,
          modelVersion: verdict.modelVersion,
          scoreDetail: verdict.scoreDetail,
          createdAt: verdict.createdAt,
        },
        applicationStatus: application.status,
      });
    } catch (err) {
      console.error('[ELIGIBILITY COMPUTE ERROR]', err.message);
      return res.status(500).json({ error: { code: 'COMPUTE_FAILED', message: 'Failed to compute eligibility' } });
    }
  }
);

// ─── GET /api/eligibility/:applicationId ─────────────────────────────────────
// Retrieve the stored verdict for a given application.
// Candidates can view their own; recruiters can view for their job's applicants.
router.get('/:applicationId', authenticate, async (req, res) => {
  try {
    const application = await Application.findByPk(req.params.applicationId, {
      include: [{ model: Job, attributes: ['id', 'createdBy'] }],
    });

    if (!application) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Application not found' } });
    }

    // Candidate can only view their own
    if (req.user.role === 'candidate' && application.candidateId !== req.user.id) {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Access denied' } });
    }

    // Recruiter can only view for their job (or admin/compliance)
    if (['recruiter', 'hr_lead'].includes(req.user.role)) {
      if (application.Job.createdBy !== req.user.id && req.user.role !== 'hr_lead') {
        return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Access denied' } });
      }
    }

    const verdict = await EligibilityVerdict.findOne({
      where: { applicationId: req.params.applicationId },
    });

    if (!verdict) {
      return res.json({ verdict: null });
    }

    return res.json({
      verdict: {
        id: verdict.id,
        verdict: verdict.verdict,
        explanation: verdict.explanation,
        modelVersion: verdict.modelVersion,
        scoreDetail: verdict.scoreDetail,
        overriddenBy: verdict.overriddenBy,
        overrideReason: verdict.overrideReason,
        overriddenAt: verdict.overriddenAt,
        createdAt: verdict.createdAt,
        updatedAt: verdict.updatedAt,
      },
    });
  } catch (err) {
    console.error('[ELIGIBILITY GET ERROR]', err.message);
    return res.status(500).json({ error: { code: 'FETCH_FAILED', message: 'Failed to fetch verdict' } });
  }
});

// ─── PATCH /api/eligibility/:verdictId/override ───────────────────────────────
// Human recruiter overrides the AI verdict.
// Requires a mandatory reason — written to AuditLog for full traceability.
router.patch(
  '/:verdictId/override',
  authenticate,
  requireRole('recruiter', 'hr_lead', 'admin'),
  async (req, res) => {
    const { newVerdict, reason } = req.body;

    if (!newVerdict || !reason || reason.trim().length < 10) {
      return res.status(422).json({
        error: {
          code: 'MISSING_FIELDS',
          message: 'newVerdict and a reason (min 10 characters) are required',
        },
      });
    }

    const validVerdicts = ['eligible', 'not_eligible', 'needs_review'];
    if (!validVerdicts.includes(newVerdict)) {
      return res.status(422).json({
        error: { code: 'INVALID_VERDICT', message: `verdict must be one of: ${validVerdicts.join(', ')}` },
      });
    }

    try {
      const verdict = await EligibilityVerdict.findByPk(req.params.verdictId, {
        include: [
          {
            model: Application,
            include: [{ model: Job, attributes: ['id', 'createdBy'] }],
          },
        ],
      });

      if (!verdict) {
        return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Verdict not found' } });
      }

      // Check job ownership
      if (
        verdict.Application.Job.createdBy !== req.user.id &&
        !['admin', 'hr_lead'].includes(req.user.role)
      ) {
        return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Access denied' } });
      }

      const previousVerdict = verdict.verdict;

      // Apply override
      verdict.verdict = newVerdict;
      verdict.overriddenBy = req.user.id;
      verdict.overrideReason = reason.trim();
      verdict.overriddenAt = new Date();
      await verdict.save();

      // Update application status
      const application = verdict.Application;
      application.status = newVerdict;   // eligible | not_eligible | needs_review
      await application.save();

      // Mandatory audit log
      await AuditLog.create({
        action: 'ELIGIBILITY_OVERRIDDEN',
        entityType: 'eligibility_verdict',
        entityId: verdict.id,
        userId: req.user.id,
        reason: reason.trim(),
        meta: {
          applicationId: verdict.applicationId,
          previousVerdict,
          newVerdict,
          overriddenBy: req.user.id,
        },
      });

      return res.json({
        verdict: {
          id: verdict.id,
          verdict: verdict.verdict,
          explanation: verdict.explanation,
          overriddenBy: verdict.overriddenBy,
          overrideReason: verdict.overrideReason,
          overriddenAt: verdict.overriddenAt,
        },
        applicationStatus: application.status,
      });
    } catch (err) {
      console.error('[ELIGIBILITY OVERRIDE ERROR]', err.message);
      return res.status(500).json({ error: { code: 'OVERRIDE_FAILED', message: 'Failed to apply override' } });
    }
  }
);

// ─── GET /api/eligibility/review-queue ───────────────────────────────────────
// Returns all needs_review applications for jobs owned by the requesting recruiter.
router.get(
  '/review-queue/all',
  authenticate,
  requireRole('recruiter', 'hr_lead', 'admin', 'compliance'),
  async (req, res) => {
    try {
      // Find all jobs owned by this recruiter (or all jobs for admin/compliance)
      const jobWhere = ['admin', 'compliance', 'hr_lead'].includes(req.user.role)
        ? {}
        : { createdBy: req.user.id };

      const jobs = await Job.findAll({
        where: jobWhere,
        attributes: ['id', 'title'],
      });
      const jobIds = jobs.map((j) => j.id);

      if (!jobIds.length) return res.json({ items: [] });

      // Find needs_review applications for those jobs
      const applications = await Application.findAll({
        where: { jobId: jobIds, status: 'needs_review' },
        include: [
          { model: Job, attributes: ['id', 'title'] },
        ],
        order: [['updatedAt', 'DESC']],
      });

      // Attach verdict + submission score to each application
      const items = await Promise.all(
        applications.map(async (app, idx) => {
          const test = await AptitudeTest.findOne({ where: { applicationId: app.id } });
          const submission = test
            ? await TestSubmission.findOne({ where: { testId: test.id } })
            : null;
          const verdict = await EligibilityVerdict.findOne({ where: { applicationId: app.id } });

          return {
            applicationId: app.id,
            anonymousLabel: `Candidate #${String(idx + 1).padStart(3, '0')}`,
            jobTitle: app.Job.title,
            jobId: app.Job.id,
            appliedAt: app.createdAt,
            testScore: submission?.autoScore ?? null,
            llmConfidence: submission?.llmConfidence ?? null,
            resumeSkillMatch: verdict?.scoreDetail?.resumeSkillMatch ?? null,
            verdict: verdict
              ? {
                  id: verdict.id,
                  verdict: verdict.verdict,
                  explanation: verdict.explanation,
                  scoreDetail: verdict.scoreDetail,
                  overriddenBy: verdict.overriddenBy,
                  overrideReason: verdict.overrideReason,
                  overriddenAt: verdict.overriddenAt,
                }
              : null,
          };
        })
      );

      return res.json({ items });
    } catch (err) {
      console.error('[REVIEW QUEUE ERROR]', err.message);
      return res.status(500).json({ error: { code: 'QUEUE_FAILED', message: 'Failed to load review queue' } });
    }
  }
);

module.exports = router;
