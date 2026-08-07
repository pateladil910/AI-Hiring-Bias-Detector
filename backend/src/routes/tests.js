const express = require('express');
const axios = require('axios');
const { AptitudeTest, TestSubmission, Application, Job, AuditLog } = require('../models');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// ─── Helper: strip answer keys before sending to candidate ───────────────────
// NEVER expose correct_index or rubric_keywords to the candidate during the test.
function sanitiseQuestionsForCandidate(questions) {
  return questions.map(({ correct_index, rubric_keywords, ...safe }) => safe); // eslint-disable-line no-unused-vars
}

// ─── POST /api/tests/generate/:applicationId ─────────────────────────────────
// Recruiter triggers test generation for a specific application.
// Calls AI service → stores AptitudeTest → updates application status to test_sent.
router.post(
  '/generate/:applicationId',
  authenticate,
  requireRole('recruiter', 'hr_lead', 'admin'),
  async (req, res) => {
    const { applicationId } = req.params;

    try {
      // Fetch application + linked job (need skill profile)
      const application = await Application.findByPk(applicationId, {
        include: [{ model: Job, attributes: ['id', 'title', 'skillProfileJson', 'status', 'createdBy'] }],
      });

      if (!application) {
        return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Application not found' } });
      }

      // Only the recruiter who owns the job (or admin) can generate a test
      if (
        application.Job.createdBy !== req.user.id &&
        !['admin', 'hr_lead'].includes(req.user.role)
      ) {
        return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Access denied' } });
      }

      // Only allow test generation for applications in 'applied' status
      if (!['applied', 'test_sent'].includes(application.status)) {
        return res.status(409).json({
          error: {
            code: 'INVALID_STATUS',
            message: `Cannot generate test for application in '${application.status}' status`,
          },
        });
      }

      // Check if test already exists — return existing if so
      const existingTest = await AptitudeTest.findOne({ where: { applicationId } });
      if (existingTest) {
        return res.json({
          test: {
            id: existingTest.id,
            timeLimitMinutes: existingTest.timeLimitMinutes,
            questionCount: existingTest.questionsJson.length,
            topicsCovered: existingTest.generatedFromSkillProfile?.topics_covered || [],
            modelVersion: existingTest.generatedFromSkillProfile?.model_version || 'unknown',
          },
          applicationStatus: application.status,
          alreadyExists: true,
        });
      }

      const skillProfile = application.Job.skillProfileJson || { primary_field: 'general', tech_stack: [] };

      // ── Call AI service to generate questions ─────────────────────────────
      let aiResult;
      try {
        const aiRes = await axios.post(
          `${AI_SERVICE_URL}/generate/test`,
          {
            job_id: application.Job.id,
            skill_profile: skillProfile,
            num_mcq: 8,
            num_short_answer: 2,
          },
          { timeout: 30000 }
        );
        aiResult = aiRes.data;
      } catch (aiErr) {
        console.error('[TESTS] AI service generate failed:', aiErr.message);
        return res.status(503).json({
          error: { code: 'AI_SERVICE_ERROR', message: 'AI service unavailable. Please try again.' },
        });
      }

      // ── Store test in DB ──────────────────────────────────────────────────
      const test = await AptitudeTest.create({
        applicationId,
        questionsJson: aiResult.questions,
        generatedFromSkillProfile: {
          skill_profile: skillProfile,
          topics_covered: aiResult.topics_covered,
          model_version: aiResult.model_version,
        },
        timeLimitMinutes: 30,
      });

      // Update application status → test_sent
      application.status = 'test_sent';
      await application.save();

      // Audit log
      await AuditLog.create({
        action: 'TEST_GENERATED',
        entityType: 'aptitude_test',
        entityId: test.id,
        userId: req.user.id,
        reason: 'Recruiter generated aptitude test for applicant',
        meta: {
          applicationId,
          jobId: application.Job.id,
          questionCount: aiResult.questions.length,
          modelVersion: aiResult.model_version,
        },
      });

      return res.status(201).json({
        test: {
          id: test.id,
          timeLimitMinutes: test.timeLimitMinutes,
          questionCount: aiResult.questions.length,
          topicsCovered: aiResult.topics_covered,
          modelVersion: aiResult.model_version,
        },
        applicationStatus: 'test_sent',
        alreadyExists: false,
      });
    } catch (err) {
      console.error('[TEST GENERATE ERROR]', err.message);
      return res.status(500).json({ error: { code: 'GENERATE_FAILED', message: 'Failed to generate test' } });
    }
  }
);

// ─── GET /api/tests/:testId ───────────────────────────────────────────────────
// Candidate fetches the test to take.
// IMPORTANT: strips correct_index and rubric_keywords before response.
router.get('/:testId', authenticate, async (req, res) => {
  try {
    const test = await AptitudeTest.findByPk(req.params.testId, {
      include: [
        {
          model: Application,
          attributes: ['id', 'candidateId', 'status', 'jobId'],
          include: [{ model: Job, attributes: ['id', 'title'] }],
        },
      ],
    });

    if (!test) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Test not found' } });
    }

    const isCandidate = req.user.role === 'candidate';
    const isRecruiterSide = ['recruiter', 'hr_lead', 'admin', 'compliance'].includes(req.user.role);

    // Candidate: can only access their own test
    if (isCandidate && test.Application.candidateId !== req.user.id) {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Access denied' } });
    }

    // Recruiter: verify job ownership
    if (isRecruiterSide) {
      const job = await Job.findByPk(test.Application.jobId);
      if (job.createdBy !== req.user.id && !['admin', 'compliance'].includes(req.user.role)) {
        return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Access denied' } });
      }
    }

    // Sanitise questions for candidate (no answers leaked)
    const questions = isCandidate
      ? sanitiseQuestionsForCandidate(test.questionsJson)
      : test.questionsJson;

    // Check if already submitted
    const submission = await TestSubmission.findOne({ where: { testId: test.id } });

    return res.json({
      test: {
        id: test.id,
        timeLimitMinutes: test.timeLimitMinutes,
        questions,
        jobTitle: test.Application.Job.title,
        applicationId: test.Application.id,
        topicsCovered: test.generatedFromSkillProfile?.topics_covered || [],
        alreadySubmitted: !!submission,
        submittedAt: submission?.submittedAt || null,
      },
    });
  } catch (err) {
    console.error('[TEST FETCH ERROR]', err.message);
    return res.status(500).json({ error: { code: 'FETCH_FAILED', message: 'Failed to fetch test' } });
  }
});

// ─── POST /api/tests/:testId/submit ──────────────────────────────────────────
// Candidate submits answers.
// Calls AI grader → stores TestSubmission → updates application status.
router.post('/:testId/submit', authenticate, requireRole('candidate'), async (req, res) => {
  const { answers } = req.body;

  if (!answers || !Array.isArray(answers)) {
    return res.status(422).json({ error: { code: 'MISSING_ANSWERS', message: 'answers array is required' } });
  }

  try {
    const test = await AptitudeTest.findByPk(req.params.testId, {
      include: [{ model: Application, attributes: ['id', 'candidateId', 'status'] }],
    });

    if (!test) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Test not found' } });
    }

    // Candidate can only submit their own test
    if (test.Application.candidateId !== req.user.id) {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Access denied' } });
    }

    // Prevent double submission
    const existingSubmission = await TestSubmission.findOne({ where: { testId: test.id } });
    if (existingSubmission) {
      return res.status(409).json({
        error: { code: 'ALREADY_SUBMITTED', message: 'Test has already been submitted' },
      });
    }

    // ── Call AI grader ────────────────────────────────────────────────────────
    let gradeResult;
    try {
      const gradeRes = await axios.post(
        `${AI_SERVICE_URL}/grade`,
        {
          test_id: test.id,
          questions: test.questionsJson, // Full questions with correct_index (server-side only)
          answers,
        },
        { timeout: 30000 }
      );
      gradeResult = gradeRes.data;
    } catch (aiErr) {
      console.error('[TESTS] AI grader failed:', aiErr.message);
      // Graceful degradation: store submission without score, mark for manual review
      gradeResult = {
        auto_score: null,
        llm_confidence: null,
        breakdown: [],
        model_version: 'error-fallback',
      };
    }

    // ── Store submission ──────────────────────────────────────────────────────
    const submission = await TestSubmission.create({
      testId: test.id,
      answersJson: answers,
      autoScore: gradeResult.auto_score,
      llmConfidence: gradeResult.llm_confidence,
      breakdown: gradeResult.breakdown,
      submittedAt: new Date(),
    });

    // Update application status → test_completed
    const application = test.Application;
    application.status = 'test_completed';
    await application.save();

    // Audit log
    await AuditLog.create({
      action: 'TEST_SUBMITTED',
      entityType: 'test_submission',
      entityId: submission.id,
      userId: req.user.id,
      reason: 'Candidate submitted aptitude test',
      meta: {
        testId: test.id,
        applicationId: application.id,
        autoScore: gradeResult.auto_score,
        llmConfidence: gradeResult.llm_confidence,
      },
    });

    return res.status(201).json({
      submission: {
        id: submission.id,
        autoScore: submission.autoScore,
        llmConfidence: submission.llmConfidence,
        submittedAt: submission.submittedAt,
      },
      breakdown: gradeResult.breakdown,
      applicationStatus: 'test_completed',
    });
  } catch (err) {
    console.error('[TEST SUBMIT ERROR]', err.message);
    return res.status(500).json({ error: { code: 'SUBMIT_FAILED', message: 'Failed to submit test' } });
  }
});

// ─── GET /api/tests/by-application/:applicationId ────────────────────────────
// Recruiter views a candidate's test + submission result for a given application.
router.get(
  '/by-application/:applicationId',
  authenticate,
  requireRole('recruiter', 'hr_lead', 'admin', 'compliance'),
  async (req, res) => {
    try {
      const application = await Application.findByPk(req.params.applicationId, {
        include: [{ model: Job, attributes: ['id', 'title', 'createdBy'] }],
      });

      if (!application) {
        return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Application not found' } });
      }

      // Check job ownership
      if (
        application.Job.createdBy !== req.user.id &&
        !['admin', 'compliance'].includes(req.user.role)
      ) {
        return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Access denied' } });
      }

      const test = await AptitudeTest.findOne({
        where: { applicationId: req.params.applicationId },
      });

      if (!test) {
        return res.json({ test: null, submission: null });
      }

      const submission = await TestSubmission.findOne({ where: { testId: test.id } });

      return res.json({
        test: {
          id: test.id,
          timeLimitMinutes: test.timeLimitMinutes,
          questionCount: test.questionsJson.length,
          topicsCovered: test.generatedFromSkillProfile?.topics_covered || [],
          generatedAt: test.createdAt,
        },
        submission: submission
          ? {
              id: submission.id,
              autoScore: submission.autoScore,
              llmConfidence: submission.llmConfidence,
              breakdown: submission.breakdown,
              submittedAt: submission.submittedAt,
            }
          : null,
        applicationId: req.params.applicationId,
        jobTitle: application.Job.title,
      });
    } catch (err) {
      console.error('[TEST BY-APPLICATION ERROR]', err.message);
      return res.status(500).json({ error: { code: 'FETCH_FAILED', message: 'Failed to fetch test results' } });
    }
  }
);

module.exports = router;
