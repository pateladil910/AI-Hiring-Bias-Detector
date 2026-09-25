const express = require('express');
const vm = require('vm');
const { AptitudeTest, TestSubmission, Application, CandidateResume, Job, AuditLog } = require('../models');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

// ─── Domain Assessment Tracks Data (20 MCQs/track + 20 min Coding Challenge) ───
const { DOMAINS } = require('../data/assessmentQuestions');

// Helper: strip answer key before sending to candidate
function stripAnswerKeys(domain) {
  return {
    id: domain.id,
    name: domain.name,
    description: domain.description,
    durationMinutes: domain.durationMinutes,
    format: domain.format,
    requiredSkills: domain.requiredSkills,
    mcqs: domain.mcqs.map((q) => ({
      id: q.id,
      question: q.question,
      options: q.options,
      topic: q.topic,
    })),
    codingProblem: {
      id: domain.codingProblem.id,
      title: domain.codingProblem.title,
      instructions: domain.codingProblem.instructions,
      starterCode: domain.codingProblem.starterCode,
      sampleTestCases: domain.codingProblem.testCases.slice(0, 2),
    },
  };
}

// ─── GET /api/assessment/domains ──────────────────────────────────────────────
router.get('/domains', (_req, res) => {
  const catalog = DOMAINS.map((d) => ({
    id: d.id,
    name: d.name,
    description: d.description,
    requiredSkills: d.requiredSkills,
    durationMinutes: d.durationMinutes,
    format: d.format,
    questionCount: d.mcqs.length,
  }));
  res.json({ domains: catalog });
});

// ─── POST /api/assessment/start ───────────────────────────────────────────────
router.post('/start', authenticate, requireRole('candidate'), async (req, res) => {
  try {
    const { domainId = 'fullstack', jobId } = req.body;
    const domain = DOMAINS.find((d) => d.id === domainId) || DOMAINS[0];

    // Check if candidate already has an active application
    let application = null;
    if (jobId) {
      application = await Application.findOne({
        where: { candidateId: req.user.id, jobId },
      });
    }

    if (!application) {
      // Find default job or create application
      const job = jobId ? await Job.findByPk(jobId) : await Job.findOne({ where: { status: 'published' } });
      if (job) {
        application = await Application.create({
          candidateId: req.user.id,
          jobId: job.id,
          anonymousAlias: `CAND-${req.user.id.slice(0, 6).toUpperCase()}`,
          status: 'test_sent',
        });
      }
    }

    // Check if an existing unfinished test exists for this candidate/application
    let test = null;
    if (application) {
      test = await AptitudeTest.findOne({
        where: { applicationId: application.id, status: 'in_progress' },
      });
    }

    if (!test) {
      const startedAt = new Date();
      const expiresAt = new Date(startedAt.getTime() + domain.durationMinutes * 60 * 1000);

      test = await AptitudeTest.create({
        applicationId: application ? application.id : null,
        domainId: domain.id,
        questionsJson: domain.mcqs,
        timeLimitMinutes: domain.durationMinutes,
        startedAt,
        expiresAt,
        status: 'in_progress',
      });

      await AuditLog.create({
        action: 'ASSESSMENT_STARTED',
        entityType: 'aptitude_test',
        entityId: test.id,
        userId: req.user.id,
        reason: `Candidate initiated timed assessment for track: ${domain.name}`,
        meta: { domainId: domain.id, expiresAt },
      });
    }

    const sanitized = stripAnswerKeys(domain);

    return res.status(201).json({
      assessmentId: test.id,
      domainId: domain.id,
      name: domain.name,
      timeLimitMinutes: test.timeLimitMinutes,
      startedAt: test.startedAt,
      expiresAt: test.expiresAt,
      remainingSeconds: Math.max(0, Math.floor((new Date(test.expiresAt).getTime() - Date.now()) / 1000)),
      questions: sanitized.mcqs,
      codingProblem: sanitized.codingProblem,
    });
  } catch (err) {
    console.error('[Assessment Start Error]', err.message);
    return res.status(500).json({ error: { code: 'START_FAILED', message: 'Could not start assessment' } });
  }
});

// ─── GET /api/assessment/:id ──────────────────────────────────────────────────
router.get('/:id', authenticate, requireRole('candidate'), async (req, res) => {
  try {
    const test = await AptitudeTest.findByPk(req.params.id, {
      include: [{ model: Application }],
    });

    if (!test) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Assessment not found' } });
    }

    const domain = DOMAINS.find((d) => d.id === test.domainId) || DOMAINS[0];
    const sanitized = stripAnswerKeys(domain);
    const remainingSeconds = Math.max(0, Math.floor((new Date(test.expiresAt).getTime() - Date.now()) / 1000));

    return res.json({
      assessmentId: test.id,
      domainId: domain.id,
      name: domain.name,
      status: test.status,
      timeLimitMinutes: test.timeLimitMinutes,
      startedAt: test.startedAt,
      expiresAt: test.expiresAt,
      remainingSeconds,
      questions: sanitized.mcqs,
      codingProblem: sanitized.codingProblem,
    });
  } catch (err) {
    return res.status(500).json({ error: { code: 'FETCH_FAILED', message: 'Failed to retrieve assessment' } });
  }
});

// ─── PUT /api/assessment/:id/answers (Autosave) ────────────────────────────────
router.put('/:id/answers', authenticate, requireRole('candidate'), async (req, res) => {
  try {
    const { answers } = req.body;
    const test = await AptitudeTest.findByPk(req.params.id);
    if (!test) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Assessment not found' } });
    }

    let submission = await TestSubmission.findOne({ where: { testId: test.id } });
    if (!submission) {
      submission = await TestSubmission.create({
        testId: test.id,
        answersJson: answers || {},
        submittedAt: new Date(),
      });
    } else {
      submission.answersJson = answers || {};
      await submission.save();
    }

    return res.json({ success: true, savedAt: new Date().toISOString() });
  } catch (err) {
    return res.status(500).json({ error: { code: 'AUTOSAVE_FAILED', message: 'Autosave error' } });
  }
});

// ─── POST /api/assessment/:id/code-run (Sandboxed VM Execution) ───────────────
router.post('/:id/code-run', authenticate, requireRole('candidate'), async (req, res) => {
  const { code } = req.body;
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: { code: 'CODE_REQUIRED', message: 'Source code is required' } });
  }

  try {
    const test = await AptitudeTest.findByPk(req.params.id);
    const domain = DOMAINS.find((d) => d.id === (test?.domainId || 'fullstack')) || DOMAINS[0];
    const testCases = domain.codingProblem.testCases;

    const results = [];
    let testsPassed = 0;

    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      let executionOutput = null;
      let errorOccurred = null;
      let passed = false;

      try {
        // Isolated context with NO process, fs, or network
        const sandbox = {
          inputData: JSON.parse(JSON.stringify(tc.input)),
          outputResult: null,
          console: { log: () => {} },
        };
        const context = vm.createContext(sandbox);

        // Script to run user code and invoke the function
        const scriptCode = `
          ${code}
          try {
            if (typeof isValid === 'function') {
              outputResult = isValid(inputData);
            } else if (typeof flatten === 'function') {
              outputResult = flatten(inputData);
            } else if (typeof cosineSimilarity === 'function') {
              outputResult = cosineSimilarity(inputData[0], inputData[1]);
            }
          } catch(e) {
            outputResult = '__ERROR__: ' + e.message;
          }
        `;

        const script = new vm.Script(scriptCode);
        script.runInContext(context, { timeout: 3000 });

        executionOutput = sandbox.outputResult;
        if (JSON.stringify(executionOutput) === JSON.stringify(tc.expected)) {
          passed = true;
          testsPassed++;
        }
      } catch (runErr) {
        errorOccurred = runErr.message;
      }

      results.push({
        testCaseIndex: i + 1,
        description: tc.description,
        passed,
        expected: tc.expected,
        actual: executionOutput,
        error: errorOccurred,
      });
    }

    return res.json({
      environment: 'Demo Isolated VM Prototype (v3.0.0)',
      testsPassed,
      testsTotal: testCases.length,
      allPassed: testsPassed === testCases.length,
      results,
    });
  } catch (err) {
    console.error('[Code Run Error]', err.message);
    return res.status(500).json({ error: { code: 'RUNNER_ERROR', message: 'Failed to execute code in sandbox' } });
  }
});

// ─── POST /api/assessment/:id/submit ──────────────────────────────────────────
router.post('/:id/submit', authenticate, requireRole('candidate'), async (req, res) => {
  const { mcqAnswers = {}, code = '', language = 'javascript' } = req.body;

  try {
    const test = await AptitudeTest.findByPk(req.params.id);
    if (!test) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Assessment not found' } });
    }

    const domain = DOMAINS.find((d) => d.id === test.domainId) || DOMAINS[0];

    // 1. Calculate MCQ score
    let mcqCorrect = 0;
    const totalMCQs = domain.mcqs.length;
    domain.mcqs.forEach((q) => {
      if (mcqAnswers[q.id] !== undefined && Number(mcqAnswers[q.id]) === q.correctIndex) {
        mcqCorrect++;
      }
    });
    const mcqScore = totalMCQs > 0 ? Math.round((mcqCorrect / totalMCQs) * 100) : 0;

    // 2. Calculate Coding Score using VM Sandbox
    const testCases = domain.codingProblem.testCases || [];
    let testsPassed = 0;

    // Verify whether actual executable code was attempted (not empty or just empty function)
    const cleanCode = (code || '').replace(/\/\/.*|\/\*[\s\S]*?\*\//g, '').trim();
    const hasExecutableBody = /function\s+\w+\s*\([^)]*\)\s*\{[\s\S]*?[a-zA-Z0-9]+[\s\S]*?\}/.test(cleanCode);

    if (hasExecutableBody) {
      for (const tc of testCases) {
        try {
          const sandbox = { inputData: JSON.parse(JSON.stringify(tc.input)), outputResult: null };
          const context = vm.createContext(sandbox);
          const scriptCode = `
            ${code}
            if (typeof isValid === 'function') outputResult = isValid(inputData);
            else if (typeof flatten === 'function') outputResult = flatten(inputData);
            else if (typeof cosineSimilarity === 'function') outputResult = cosineSimilarity(inputData[0], inputData[1]);
          `;
          const script = new vm.Script(scriptCode);
          script.runInContext(context, { timeout: 3000 });
          if (
            sandbox.outputResult !== null &&
            sandbox.outputResult !== undefined &&
            JSON.stringify(sandbox.outputResult) === JSON.stringify(tc.expected)
          ) {
            testsPassed++;
          }
        } catch (_) {}
      }
    }
    const codingScore = testCases.length > 0 ? Math.round((testsPassed / testCases.length) * 100) : 0;

    // 3. Resume Match Score from actual uploaded candidate skills (NO FAKE DEFAULTS)
    const resume = await CandidateResume.findOne({
      where: { userId: req.user.id },
      order: [
        ['confirmed', 'DESC'],
        ['createdAt', 'DESC'],
      ],
    });
    let resumeScore = 0;
    let hasResume = false;
    let matchedSkills = [];
    let missingSkills = [...domain.requiredSkills];

    if (resume) {
      hasResume = true;
      const candidateSkills = (resume.extractedSkillsJson || []).map((s) => s.toLowerCase());
      const rawResumeText = (resume.redactedText || '').toLowerCase();

      matchedSkills = domain.requiredSkills.filter((reqSkill) => {
        // Split composite required skills like "PostgreSQL / SQL" or "JavaScript/TypeScript"
        const parts = reqSkill.split(/[\/,|]/).map((p) => p.trim().toLowerCase()).filter(Boolean);
        return parts.some((p) => {
          const inSkills = candidateSkills.some((cs) => cs === p || cs.includes(p) || p.includes(cs));
          const inText = rawResumeText.includes(p);
          const dbMatch = (p === 'sql' || p === 'postgresql') && (candidateSkills.includes('mongodb') || rawResumeText.includes('database'));
          return inSkills || inText || dbMatch;
        });
      });

      missingSkills = domain.requiredSkills.filter((s) => !matchedSkills.includes(s));
      resumeScore = domain.requiredSkills.length > 0
        ? Math.round((matchedSkills.length / domain.requiredSkills.length) * 100)
        : 100;
    }

    // 4. Transparent Mathematical Formula
    // Composite = (MCQ × 0.4) + (Coding × 0.4) + (Resume × 0.2)
    const compositeScore = Math.round((mcqScore * 0.4) + (codingScore * 0.4) + (resumeScore * 0.2));
    const scoringFormula = `(${mcqScore} × 0.4) + (${codingScore} × 0.4) + (${resumeScore} × 0.2) = ${compositeScore}`;

    // 5. AI Benchmark Analysis & Objective Hiring Recommendation
    let benchmarkTier = 'NEEDS_IMPROVEMENT';
    let tierBadge = 'Needs Substantial Improvement';
    let recommendation = 'Application Archived / Candidate Encouraged to Upskill';
    let recommendationSummary = 'The submission lacks verified working code, necessary aptitude answers, or resume skill evidence for this domain.';
    let statusLabel = 'Assessment Complete — Below Benchmark Threshold';

    if (compositeScore >= 85) {
      benchmarkTier = 'HIGH_PERFORMER';
      tierBadge = 'Exceptional Readiness';
      recommendation = 'Direct Fast-Track to Technical Onsite Interview';
      recommendationSummary = 'Demonstrated top-tier mastery across domain theory, algorithmic implementation, and verified background skill depth.';
      statusLabel = 'Assessment Complete — Fast-Track Interview Recommended';
    } else if (compositeScore >= 70) {
      benchmarkTier = 'INTERVIEW_READY';
      tierBadge = 'Meets Core Standards';
      recommendation = 'Proceed to Technical Screening Interview';
      recommendationSummary = 'Demonstrated functional proficiency in algorithms and domain aptitude. Verified readiness for team interview.';
      statusLabel = 'Assessment Complete — Recruiter Review Pending';
    } else if (compositeScore >= 50) {
      benchmarkTier = 'DEVELOPING';
      tierBadge = 'Developing / Borderline';
      recommendation = 'Targeted Technical Review Required';
      recommendationSummary = 'Partial test case completion or theory gaps identified. Recommend recruiter review before scheduling interview.';
      statusLabel = 'Assessment Complete — Additional Review Recommended';
    }

    const aiAnalysis = {
      benchmarkTier,
      tierBadge,
      compositeScore,
      passingThreshold: 70,
      isPassing: compositeScore >= 70,
      recommendation,
      recommendationSummary,
      hiringCriteria: {
        hiringRule: 'Candidates scoring 70+ with working code and verified skills are recommended for interview consideration without demographic exposure.',
        whoShouldHire: 'Hiring leads seeking candidates who demonstrably solve algorithmic problems in real-time and match key domain competencies.',
        whyThisScore: [
          mcqScore === 0 ? 'No MCQs were answered correctly (0/5 answered).' : `Aptitude MCQs: ${mcqCorrect}/${totalMCQs} answered correctly (${mcqScore}%).`,
          codingScore === 0 ? 'Coding challenge had 0 passing unit tests or was left unsolved.' : `Coding Sandbox: ${testsPassed}/${testCases.length} unit tests passed in VM (${codingScore}%).`,
          !hasResume ? 'No resume was uploaded (0% resume evidence contribution).' : `Resume Match: ${matchedSkills.length}/${domain.requiredSkills.length} domain skills verified in resume.`,
        ],
      },
      componentBreakdown: {
        mcq: { score: mcqScore, weight: 0.4, points: Number((mcqScore * 0.4).toFixed(1)), correct: mcqCorrect, total: totalMCQs },
        coding: { score: codingScore, weight: 0.4, points: Number((codingScore * 0.4).toFixed(1)), testsPassed, testsTotal: testCases.length },
        resume: { score: resumeScore, weight: 0.2, points: Number((resumeScore * 0.2).toFixed(1)), hasResume, matchedSkills, missingSkills },
      },
    };

    // 6. Update Test record
    test.mcqScore = mcqScore;
    test.codingScore = codingScore;
    test.compositeScore = compositeScore;
    test.scoringFormula = scoringFormula;
    test.scoringExplanation = `Composite score calculated using verified weighted model: MCQ Aptitude (${(mcqScore * 0.4).toFixed(1)} pts), Coding Sandbox (${(codingScore * 0.4).toFixed(1)} pts), and Anonymized Resume (${(resumeScore * 0.2).toFixed(1)} pts).`;
    test.codingSubmissionJson = {
      code,
      language,
      testsPassed,
      testsTotal: testCases.length,
      resumeScore,
      hasResume,
      matchedSkills,
      missingSkills,
      aiAnalysis,
    };
    test.status = 'evaluated';
    await test.save();

    // 7. Update TestSubmission
    await TestSubmission.create({
      testId: test.id,
      answersJson: mcqAnswers,
      autoScore: compositeScore,
      submittedAt: new Date(),
    });

    // 8. Update Application status
    if (test.applicationId) {
      const app = await Application.findByPk(test.applicationId);
      if (app) {
        app.status = compositeScore >= 70 ? 'test_completed' : 'needs_review';
        await app.save();
      }
    }

    // 9. Audit Log
    await AuditLog.create({
      action: 'TEST_SUBMITTED',
      entityType: 'aptitude_test',
      entityId: test.id,
      userId: req.user.id,
      reason: 'Candidate completed assessment with algorithmic evaluation',
      meta: { mcqScore, codingScore, resumeScore, compositeScore, benchmarkTier },
    });

    return res.json({
      success: true,
      assessmentId: test.id,
      domainName: domain.name,
      mcqScore,
      codingScore,
      resumeScore,
      compositeScore,
      scoringFormula,
      formulaSummary: 'Composite = (MCQ × 0.4) + (Coding × 0.4) + (Resume × 0.2)',
      status: statusLabel,
      aiAnalysis,
      completedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[Submit Assessment Error]', err.message);
    return res.status(500).json({ error: { code: 'SUBMIT_FAILED', message: 'Failed to grade and submit assessment' } });
  }
});

// ─── GET /api/assessment/results/me ───────────────────────────────────────────
router.get('/results/me', authenticate, requireRole('candidate'), async (req, res) => {
  try {
    const tests = await AptitudeTest.findAll({
      where: { status: 'evaluated' },
      order: [['updatedAt', 'DESC']],
    });

    // Filter tests where candidate is the applicant
    const candidateResults = [];
    for (const t of tests) {
      if (t.applicationId) {
        const app = await Application.findByPk(t.applicationId);
        if (app && app.candidateId === req.user.id) {
          const domain = DOMAINS.find((d) => d.id === t.domainId) || DOMAINS[0];
          const codingJson = t.codingSubmissionJson || {};
          candidateResults.push({
            assessmentId: t.id,
            domainName: domain.name,
            domainId: t.domainId,
            mcqScore: t.mcqScore ?? 0,
            codingScore: t.codingScore ?? 0,
            resumeScore: codingJson.resumeScore ?? 0,
            compositeScore: t.compositeScore ?? 0,
            scoringFormula: t.scoringFormula,
            scoringExplanation: t.scoringExplanation,
            aiAnalysis: codingJson.aiAnalysis || null,
            status: t.status,
            completedAt: t.updatedAt,
          });
        }
      }
    }

    return res.json({ results: candidateResults });
  } catch (err) {
    return res.status(500).json({ error: { code: 'FETCH_FAILED', message: 'Could not fetch assessment results' } });
  }
});

// ─── GET /api/assessment/results/:id ──────────────────────────────────────────
router.get('/results/:id', authenticate, requireRole('candidate'), async (req, res) => {
  try {
    const test = await AptitudeTest.findByPk(req.params.id);
    if (!test) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Result not found' } });
    }

    const domain = DOMAINS.find((d) => d.id === test.domainId) || DOMAINS[0];
    let codingJson = test.codingSubmissionJson || {};
    let resumeScore = codingJson.resumeScore ?? 0;
    let aiAnalysis = codingJson.aiAnalysis || null;

    // If resume score was 0 or unlinked, check if candidate has a confirmed resume and calculate truthful score
    if (resumeScore === 0) {
      const resume = await CandidateResume.findOne({
        where: { userId: req.user.id },
        order: [
          ['confirmed', 'DESC'],
          ['createdAt', 'DESC'],
        ],
      });
      if (resume) {
        const candidateSkills = (resume.extractedSkillsJson || []).map((s) => s.toLowerCase());
        const rawResumeText = (resume.redactedText || '').toLowerCase();
        const matchedSkills = domain.requiredSkills.filter((reqSkill) => {
          const parts = reqSkill.split(/[\/,|]/).map((p) => p.trim().toLowerCase()).filter(Boolean);
          return parts.some((p) => {
            const inSkills = candidateSkills.some((cs) => cs === p || cs.includes(p) || p.includes(cs));
            const inText = rawResumeText.includes(p);
            const dbMatch = (p === 'sql' || p === 'postgresql') && (candidateSkills.includes('mongodb') || rawResumeText.includes('database'));
            return inSkills || inText || dbMatch;
          });
        });
        const missingSkills = domain.requiredSkills.filter((s) => !matchedSkills.includes(s));
        resumeScore = domain.requiredSkills.length > 0
          ? Math.round((matchedSkills.length / domain.requiredSkills.length) * 100)
          : 100;

        codingJson.resumeScore = resumeScore;
        codingJson.hasResume = true;
        codingJson.matchedSkills = matchedSkills;
        codingJson.missingSkills = missingSkills;

        const mcqScore = test.mcqScore ?? 0;
        const codingScore = test.codingScore ?? 0;
        const compositeScore = Math.round((mcqScore * 0.4) + (codingScore * 0.4) + (resumeScore * 0.2));
        test.compositeScore = compositeScore;
        test.scoringFormula = `(${mcqScore} × 0.4) + (${codingScore} × 0.4) + (${resumeScore} × 0.2) = ${compositeScore}`;
        test.scoringExplanation = `Composite score calculated using verified weighted model: MCQ Aptitude (${(mcqScore * 0.4).toFixed(1)} pts), Coding Sandbox (${(codingScore * 0.4).toFixed(1)} pts), and Anonymized Resume (${(resumeScore * 0.2).toFixed(1)} pts).`;

        if (aiAnalysis && aiAnalysis.componentBreakdown) {
          aiAnalysis.compositeScore = compositeScore;
          aiAnalysis.componentBreakdown.resume = {
            score: resumeScore,
            weight: 0.2,
            points: Number((resumeScore * 0.2).toFixed(1)),
            hasResume: true,
            matchedSkills,
            missingSkills,
          };
          if (aiAnalysis.hiringCriteria && Array.isArray(aiAnalysis.hiringCriteria.whyThisScore)) {
            aiAnalysis.hiringCriteria.whyThisScore[2] = `Resume Match: ${matchedSkills.length}/${domain.requiredSkills.length} domain skills verified in resume (${resumeScore}%).`;
          }
        }
        test.codingSubmissionJson = codingJson;
        await test.save();
      }
    }

    return res.json({
      assessmentId: test.id,
      domainName: domain.name,
      domainId: test.domainId,
      mcqScore: test.mcqScore ?? 0,
      codingScore: test.codingScore ?? 0,
      resumeScore,
      compositeScore: test.compositeScore ?? 0,
      scoringFormula: test.scoringFormula || `(${test.mcqScore || 0} × 0.4) + (${test.codingScore || 0} × 0.4) + (${resumeScore} × 0.2) = ${test.compositeScore || 0}`,
      formulaTemplate: 'Composite = (MCQ × 0.4) + (Coding × 0.4) + (Resume × 0.2)',
      explanation: test.scoringExplanation,
      aiAnalysis,
      status: aiAnalysis?.recommendationSummary ? `Assessment Complete — ${aiAnalysis.tierBadge}` : 'Assessment Complete',
      completedAt: test.updatedAt,
    });
  } catch (err) {
    return res.status(500).json({ error: { code: 'FETCH_FAILED', message: 'Failed to fetch result detail' } });
  }
});

module.exports = router;
