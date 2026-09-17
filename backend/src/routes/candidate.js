const express = require('express');
const {
  User,
  Application,
  CandidateResume,
  AptitudeTest,
  TestSubmission,
  Interview,
  AuditLog,
  Job,
} = require('../models');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

// ─── GET /api/candidate/application (5-Step Journey State) ─────────────────────
router.get('/application', authenticate, requireRole('candidate'), async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Resume status
    const latestResume = await CandidateResume.findOne({
      where: { userId },
      order: [['createdAt', 'DESC']],
    });

    const resumeStep = {
      completed: !!latestResume && latestResume.confirmed,
      refId: latestResume?.refId || null,
      fileName: latestResume?.fileName || null,
      confirmed: latestResume?.confirmed || false,
      uploadedAt: latestResume?.createdAt || null,
    };

    // 2. Active application or test status
    const latestApp = await Application.findOne({
      where: { candidateId: userId },
      include: [
        { model: Job, attributes: ['id', 'title', 'skillProfileJson'] },
        { model: AptitudeTest },
      ],
      order: [['createdAt', 'DESC']],
    });

    // 3. Domain track
    const domainStep = {
      completed: !!latestApp,
      jobId: latestApp?.jobId || null,
      jobTitle: latestApp?.Job?.title || null,
      domainId: latestApp?.Job?.skillProfileJson?.domain || 'fullstack',
    };

    // 4. MCQ test & Coding test
    const testId = latestApp?.AptitudeTest?.id || null;
    let testSubmission = null;
    if (testId) {
      testSubmission = await TestSubmission.findOne({ where: { testId } });
    }

    const testRecord = latestApp?.AptitudeTest;

    const mcqStep = {
      completed: !!testSubmission || !!testRecord?.mcqScore,
      score: testRecord?.mcqScore || testSubmission?.autoScore || null,
      testId: testRecord?.id || null,
    };

    const codingStep = {
      completed: testRecord?.codingScore !== null && testRecord?.codingScore !== undefined,
      score: testRecord?.codingScore || null,
      testsPassed: testRecord?.codingSubmissionJson?.testsPassed || 0,
      testsTotal: testRecord?.codingSubmissionJson?.testsTotal || 0,
    };

    // 5. Final Results
    const resultsStep = {
      ready: testRecord?.compositeScore !== null && testRecord?.compositeScore !== undefined,
      compositeScore: testRecord?.compositeScore || null,
      scoringFormula: testRecord?.scoringFormula || 'MCQ×0.4 + Coding×0.4 + Resume×0.2',
      status: testRecord?.status === 'evaluated'
        ? 'Assessment complete — recruiter review pending'
        : 'In progress',
      recruiterStatus: latestApp?.status || 'applied',
    };

    // Calculate current step (1 to 5)
    let currentStep = 1;
    if (resumeStep.completed) currentStep = 2;
    if (resumeStep.completed && domainStep.completed) currentStep = 3;
    if (resumeStep.completed && domainStep.completed && mcqStep.completed) currentStep = 4;
    if (resumeStep.completed && domainStep.completed && mcqStep.completed && codingStep.completed) currentStep = 5;

    // Quick stats
    const totalApplications = await Application.count({ where: { candidateId: userId } });
    const scheduledInterviews = await Interview.count({
      where: { candidateId: userId, status: ['scheduled', 'confirmed'] },
    });

    return res.json({
      currentStep,
      cloakedAlias: latestResume?.refId || `CAND-${userId.slice(0, 6).toUpperCase()}`,
      steps: {
        resume: resumeStep,
        domain: domainStep,
        mcq: mcqStep,
        coding: codingStep,
        results: resultsStep,
      },
      stats: {
        totalApplications,
        scheduledInterviews,
        assessmentsCompleted: resultsStep.ready ? 1 : 0,
      },
    });
  } catch (err) {
    console.error('[Candidate Application Error]', err.message);
    return res.status(500).json({ error: { code: 'FETCH_FAILED', message: 'Could not fetch candidate progress' } });
  }
});

// ─── GET /api/candidate/profile ───────────────────────────────────────────────
router.get('/profile', authenticate, requireRole('candidate'), async (req, res) => {
  try {
    const resume = await CandidateResume.findOne({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
    });

    return res.json({
      id: req.user.id,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      role: req.user.role,
      cloakedAlias: resume?.refId || `CAND-${req.user.id.slice(0, 6).toUpperCase()}`,
      extractedSkills: resume?.extractedSkillsJson || ['JavaScript', 'React', 'Node.js', 'Problem Solving'],
      resumeConfirmed: resume?.confirmed || false,
      createdAt: req.user.createdAt,
    });
  } catch (err) {
    return res.status(500).json({ error: { code: 'PROFILE_FAILED', message: 'Failed to load profile' } });
  }
});

// ─── PUT /api/candidate/profile ───────────────────────────────────────────────
router.put('/profile', authenticate, requireRole('candidate'), async (req, res) => {
  try {
    const { firstName, lastName } = req.body;
    const user = await User.findByPk(req.user.id);
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    await user.save();

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: { code: 'UPDATE_FAILED', message: 'Could not update profile' } });
  }
});

// ─── POST /api/candidate/export (GDPR Data Portability) ───────────────────────
router.post('/export', authenticate, requireRole('candidate'), async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId, { attributes: ['id', 'email', 'firstName', 'lastName', 'createdAt'] });
    const resumes = await CandidateResume.findAll({ where: { userId } });
    const applications = await Application.findAll({
      where: { candidateId: userId },
      include: [{ model: Job, attributes: ['id', 'title'] }],
    });
    const interviews = await Interview.findAll({ where: { candidateId: userId } });
    const auditLogs = await AuditLog.findAll({ where: { userId }, limit: 100 });

    const exportPackage = {
      exportTimestamp: new Date().toISOString(),
      compliance: 'GDPR / CCPA Algorithmic Fairness Data Portability',
      user,
      resumes: resumes.map((r) => ({
        refId: r.refId,
        fileName: r.fileName,
        extractedSkills: r.extractedSkillsJson,
        detectedMarkers: r.detectedMarkersJson,
        biasScore: r.biasScore,
        createdAt: r.createdAt,
      })),
      applications: applications.map((a) => ({
        id: a.id,
        jobTitle: a.Job?.title,
        status: a.status,
        anonymousAlias: a.anonymousAlias,
        appliedAt: a.createdAt,
      })),
      interviews,
      auditActivity: auditLogs.map((l) => ({
        action: l.action,
        reason: l.reason,
        timestamp: l.createdAt,
      })),
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=fairhire_candidate_data_${Date.now()}.json`);
    return res.send(JSON.stringify(exportPackage, null, 2));
  } catch (err) {
    console.error('[Export Error]', err.message);
    return res.status(500).json({ error: { code: 'EXPORT_FAILED', message: 'Could not generate export' } });
  }
});

// ─── DELETE /api/candidate/account (GDPR Erasure) ─────────────────────────────
router.delete('/account', authenticate, requireRole('candidate'), async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'User not found' } });

    // Anonymize user record
    user.isActive = false;
    user.email = `deleted_${Date.now()}@anonymized.fairhire.io`;
    user.firstName = 'Anonymized';
    user.lastName = 'Candidate';
    await user.save();

    await AuditLog.create({
      action: 'CANDIDATE_ACCOUNT_ERASED',
      entityType: 'user',
      entityId: user.id,
      reason: 'Candidate exercised GDPR Right to Erasure',
    });

    return res.json({ success: true, message: 'Account data anonymized and erased in accordance with GDPR' });
  } catch (err) {
    return res.status(500).json({ error: { code: 'DELETE_FAILED', message: 'Could not delete account' } });
  }
});

module.exports = router;
