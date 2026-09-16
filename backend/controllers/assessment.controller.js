/**
 * Assessment Controller — Complete Workflow
 * PDF §5 Steps 6-10 | PDF §9 Scoring | PDF §10 Audit
 *
 * Routes:
 *   POST   /api/assessment/start          — create attempt
 *   GET    /api/assessment/:id            — get state (safe, no answer keys)
 *   PUT    /api/assessment/:id/answers    — autosave answers
 *   POST   /api/assessment/:id/code-run  — sandbox code execution
 *   POST   /api/assessment/:id/submit    — score and finalize
 *   GET    /api/assessment/results/me    — candidate's own results
 */
const path = require('path');
const fs   = require('fs');
const vm   = require('vm');

const Assessment = require('../models/Assessment.model');
const Candidate  = require('../models/candidate.model');
const AuditLog   = require('../models/AuditLog.model');

// ─── Load Static Data Files ───────────────────────────────────────
const DATA_PATH = path.join(__dirname, '../../data');

function loadQuestions() {
  try {
    return JSON.parse(fs.readFileSync(path.join(DATA_PATH, 'questions.json'), 'utf-8'));
  } catch (e) {
    console.error('[Assessment] Failed to load questions.json:', e.message);
    return { mcq: [], aptitude: [], coding: null };
  }
}

function loadDomains() {
  try {
    return JSON.parse(fs.readFileSync(path.join(DATA_PATH, 'domains.json'), 'utf-8'));
  } catch (e) {
    console.error('[Assessment] Failed to load domains.json:', e.message);
    return [];
  }
}

// Strip answer keys before sending to client
function sanitizeQuestions(questions) {
  return {
    mcq: (questions.mcq || []).map(q => ({
      id: q.id,
      question: q.question,
      options:  q.options
      // NOTE: 'correct' field is intentionally excluded
    })),
    aptitude: (questions.aptitude || []).map(q => ({
      id: q.id,
      question: q.question,
      options:  q.options
      // NOTE: 'correct' field is intentionally excluded
    })),
    coding: questions.coding ? {
      id:          questions.coding.id,
      title:       questions.coding.title,
      description: questions.coding.description,
      constraints: questions.coding.constraints,
      example:     questions.coding.example,
      initialCode: questions.coding.initialCode,
      // testCases: only show non-hidden test cases
      testCases:   (questions.coding.testCases || [])
                     .filter(tc => !tc.isHidden)
                     .map(tc => ({ id: tc.id, description: tc.description, expectedOutput: tc.expectedOutput }))
    } : null
  };
}

// ─── Scoring Functions ────────────────────────────────────────────

/**
 * Score MCQ answers against the answer key.
 * Returns 0-100.
 */
function scoreMCQ(savedAnswers, questionsData) {
  const mcqAndApt = [...(questionsData.mcq || []), ...(questionsData.aptitude || [])];
  if (mcqAndApt.length === 0) return 0;
  let correct = 0;
  savedAnswers.forEach(saved => {
    const question = mcqAndApt.find(q => q.id === saved.questionId);
    if (question && question.correct === saved.answer) correct++;
  });
  return Math.round((correct / mcqAndApt.length) * 100);
}

/**
 * Score coding submission based on test case results.
 * Returns 0-100.
 */
function scoreCoding(codingSubmission) {
  if (!codingSubmission || codingSubmission.testsTotal === 0) return 0;
  return Math.round((codingSubmission.testsPassed / codingSubmission.testsTotal) * 100);
}

/**
 * Score resume match against domain required skills.
 * Returns 0-100.
 */
function scoreResumeMatch(candidateSkills, domainId) {
  const domains = loadDomains();
  const domain  = domains.find(d => d.id === domainId);
  if (!domain || !domain.requiredSkills || domain.requiredSkills.length === 0) return 0;

  const normalise = s => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  const candidateSet = new Set((candidateSkills || []).map(normalise));

  let matched = 0;
  domain.requiredSkills.forEach(required => {
    if (candidateSet.has(normalise(required))) matched++;
  });
  return Math.round((matched / domain.requiredSkills.length) * 100);
}

/**
 * Compute composite score.
 * Formula: MCQ*0.4 + Coding*0.4 + ResumeMatch*0.2
 */
function computeComposite(mcqScore, codingScore, resumeMatchScore) {
  const mcq    = mcqScore    ?? 0;
  const coding = codingScore ?? 0;
  const resume = resumeMatchScore ?? 0;
  return Math.round((mcq * 0.4) + (coding * 0.4) + (resume * 0.2));
}

// ─── Sandboxed Code Execution ─────────────────────────────────────
function runTestCase(code, testCase, timeout = 3000) {
  try {
    const logs = [];
    const sandbox = {
      console: {
        log: (...args) => logs.push(args.map(String).join(' ')),
        error: (...args) => logs.push('ERR: ' + args.map(String).join(' '))
      },
      setTimeout: undefined, setInterval: undefined, clearTimeout: undefined,
      process: undefined, require: undefined, __dirname: undefined, __filename: undefined,
      module: undefined, exports: undefined, global: undefined
    };
    vm.createContext(sandbox);

    // Run the candidate's code + assertion
    const script = `
${code}
// Test: ${testCase.description}
let __result__;
try {
  ${testCase.setup}
  __result__ = String(eval('${testCase.assertion.replace(/'/g, "\\'")}'));
} catch(e) {
  __result__ = 'ERROR: ' + e.message;
}
__result__;
`;
    const result = vm.runInContext(script, sandbox, { timeout });
    const actualOutput = result !== undefined ? String(result) : logs.join('\n');
    const passed = actualOutput === testCase.expectedOutput;

    return {
      id:             testCase.id,
      description:    testCase.description,
      passed,
      actualOutput:   testCase.isHidden ? (passed ? 'PASS' : 'FAIL') : actualOutput,
      expectedOutput: testCase.isHidden ? (passed ? 'PASS' : 'FAIL') : testCase.expectedOutput,
      error:          null
    };
  } catch (err) {
    return {
      id:             testCase.id,
      description:    testCase.isHidden ? 'Hidden test' : testCase.description,
      passed:         false,
      actualOutput:   'FAIL',
      expectedOutput: testCase.isHidden ? 'PASS' : testCase.expectedOutput,
      error:          err.name === 'Error' && err.message.includes('timed out')
                        ? 'Time limit exceeded (3000ms)'
                        : err.message
    };
  }
}

// ═══════════════════════════════════════════════════════════════════
//  POST /api/assessment/start
// ═══════════════════════════════════════════════════════════════════
exports.startAssessment = async (req, res) => {
  try {
    const { domainId } = req.body;
    if (!domainId) return res.status(400).json({ success: false, message: 'domainId is required.' });

    // Validate domain exists
    const domains = loadDomains();
    const domain  = domains.find(d => d.id === domainId);
    if (!domain) return res.status(404).json({ success: false, message: 'Domain not found.' });

    // Get candidate profile
    const candidate = await Candidate.findOne({ userId: req.user.id });
    if (!candidate) {
      return res.status(400).json({ success: false, message: 'Please upload your resume before starting the assessment.' });
    }
    if (candidate.redactionReviewStatus === 'pending_review') {
      return res.status(400).json({ success: false, message: 'Please confirm your resume profile before starting the assessment.' });
    }

    // Check for existing in-progress assessment
    const existing = await Assessment.findOne({ userId: req.user.id, status: 'in_progress' });
    if (existing) {
      const questions = sanitizeQuestions(loadQuestions());
      return res.json({
        success:      true,
        assessmentId: existing._id,
        domainId:     existing.domainId,
        status:       existing.status,
        startedAt:    existing.startedAt,
        questions,
        resumed:      true
      });
    }

    // Create new assessment — start in 'in_progress' immediately
    const assessment = await Assessment.create({
      candidateRef:      candidate.refId,
      userId:            req.user.id,
      domainId,
      rubricVersion:     domain.rubricVersion || '1.0',
      questionSetVersion: loadQuestions().version || '1.0',
      status:            'in_progress',
      startedAt:         new Date(),
      statusLabel:       'Assessment in progress',
      scoringFormula:    'Composite = (MCQ × 0.4) + (Coding × 0.4) + (ResumeMatch × 0.2)'
    });

    // Audit: assessment started
    await AuditLog.create({
      eventType:        'assessment_consistency',
      actorRole:        req.user.role,
      actorId:          req.user.id,
      targetRecord:     assessment._id.toString(),
      action:           'Assessment started',
      result:           'in_progress',
      rubricVersion:    domain.rubricVersion || '1.0',
      questionSetVersion: loadQuestions().version || '1.0',
      metadata: { domainId, candidateRef: candidate.refId }
    });

    const questions = sanitizeQuestions(loadQuestions());

    res.status(201).json({
      success:      true,
      assessmentId: assessment._id,
      domainId,
      domainTitle:  domain.title,
      status:       assessment.status,
      startedAt:    assessment.startedAt,
      durationMinutes: domain.timeMinutes || 30,
      scoringFormula:  assessment.scoringFormula,
      questions,
      message: 'Assessment started. Good luck!'
    });

  } catch (err) {
    console.error('[Assessment] startAssessment error:', err.message);
    res.status(500).json({ success: false, message: 'Could not start assessment. Please try again.' });
  }
};

// ═══════════════════════════════════════════════════════════════════
//  GET /api/assessment/:id
// ═══════════════════════════════════════════════════════════════════
exports.getAssessment = async (req, res) => {
  try {
    const assessment = await Assessment.findOne({
      _id:    req.params.id,
      userId: req.user.id
    });
    if (!assessment) return res.status(404).json({ success: false, message: 'Assessment not found.' });

    const questions = sanitizeQuestions(loadQuestions());

    res.json({
      success:       true,
      assessmentId:  assessment._id,
      domainId:      assessment.domainId,
      status:        assessment.status,
      statusLabel:   assessment.statusLabel,
      startedAt:     assessment.startedAt,
      submittedAt:   assessment.submittedAt,
      savedAnswers:  {
        mcq:     assessment.mcqAnswers,
        aptitude: assessment.aptitudeAnswers
      },
      questions,
      scoringFormula: assessment.scoringFormula
    });

  } catch (err) {
    console.error('[Assessment] getAssessment error:', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ═══════════════════════════════════════════════════════════════════
//  PUT /api/assessment/:id/answers  — autosave
// ═══════════════════════════════════════════════════════════════════
exports.saveAnswers = async (req, res) => {
  try {
    const { mcqAnswers, aptitudeAnswers } = req.body;

    const assessment = await Assessment.findOne({
      _id:    req.params.id,
      userId: req.user.id
    });

    if (!assessment) return res.status(404).json({ success: false, message: 'Assessment not found.' });
    if (assessment.status !== 'in_progress') {
      return res.status(400).json({ success: false, message: 'Cannot save answers — assessment is no longer in progress.' });
    }

    if (mcqAnswers && Array.isArray(mcqAnswers)) {
      assessment.mcqAnswers = mcqAnswers.map(a => ({
        questionId: a.questionId,
        answer:     a.answer,
        savedAt:    new Date()
      }));
    }
    if (aptitudeAnswers && Array.isArray(aptitudeAnswers)) {
      assessment.aptitudeAnswers = aptitudeAnswers.map(a => ({
        questionId: a.questionId,
        answer:     a.answer,
        savedAt:    new Date()
      }));
    }

    await assessment.save();

    res.json({
      success:   true,
      savedAt:   new Date().toISOString(),
      mcqCount:  assessment.mcqAnswers.length,
      aptCount:  assessment.aptitudeAnswers.length,
      message:   'Progress saved.'
    });

  } catch (err) {
    console.error('[Assessment] saveAnswers error:', err.message);
    res.status(500).json({ success: false, message: 'Could not save answers.' });
  }
};

// ═══════════════════════════════════════════════════════════════════
//  POST /api/assessment/:id/code-run
// ═══════════════════════════════════════════════════════════════════
exports.runCode = async (req, res) => {
  try {
    const { code, language } = req.body;

    if (!code || !code.trim()) {
      return res.status(400).json({ success: false, message: 'No code provided.' });
    }

    // Verify the assessment belongs to this user and is in-progress
    const assessment = await Assessment.findOne({ _id: req.params.id, userId: req.user.id });
    if (!assessment) return res.status(404).json({ success: false, message: 'Assessment not found.' });
    if (assessment.status !== 'in_progress') {
      return res.status(400).json({ success: false, message: 'Assessment is not active.' });
    }

    const questionsData = loadQuestions();
    const testCases     = (questionsData.coding && questionsData.coding.testCases) || [];

    if (testCases.length === 0) {
      return res.status(422).json({ success: false, message: 'No test cases configured for this problem.' });
    }

    // Run all test cases (only non-hidden for "Run" mode)
    const publicCases  = testCases.filter(tc => !tc.isHidden);
    const testResults  = publicCases.map(tc => runTestCase(code, tc, 3000));
    const testsPassed  = testResults.filter(r => r.passed).length;

    res.json({
      success:     true,
      testsPassed,
      testsTotal:  publicCases.length,
      testResults,
      metadata: {
        note:     '⚠️ Demo execution environment — sandboxed prototype only.',
        language: language || 'javascript',
        executedAt: new Date().toISOString()
      }
    });

  } catch (err) {
    console.error('[Assessment] runCode error:', err.message);
    res.status(500).json({ success: false, message: 'Code execution failed.' });
  }
};

// ═══════════════════════════════════════════════════════════════════
//  POST /api/assessment/:id/submit — final submission
// ═══════════════════════════════════════════════════════════════════
exports.submitAssessment = async (req, res) => {
  try {
    const assessment = await Assessment.findOne({
      _id:    req.params.id,
      userId: req.user.id
    });

    if (!assessment) return res.status(404).json({ success: false, message: 'Assessment not found.' });
    if (['submitted', 'evaluation_pending', 'complete', 'recruiter_review_pending', 'review_completed'].includes(assessment.status)) {
      return res.status(400).json({ success: false, message: 'Assessment has already been submitted.' });
    }

    // Accept final answers from body if provided
    const { mcqAnswers, aptitudeAnswers, code, language } = req.body;
    if (mcqAnswers)     assessment.mcqAnswers = mcqAnswers.map(a => ({ questionId: a.questionId, answer: a.answer, savedAt: new Date() }));
    if (aptitudeAnswers) assessment.aptitudeAnswers = aptitudeAnswers.map(a => ({ questionId: a.questionId, answer: a.answer, savedAt: new Date() }));

    assessment.status      = 'submitted';
    assessment.submittedAt = new Date();

    // ── Run ALL test cases for final score ────────────────────────
    const questionsData = loadQuestions();
    let   codingScore   = 0;
    let   testsPassed   = 0;
    let   testsTotal    = 0;
    let   allTestResults = [];

    if (code && questionsData.coding && questionsData.coding.testCases) {
      const allCases = questionsData.coding.testCases;
      testsTotal     = allCases.length;
      allTestResults = allCases.map(tc => runTestCase(code, tc, 3000));
      testsPassed    = allTestResults.filter(r => r.passed).length;
      codingScore    = scoreCoding({ testsPassed, testsTotal });

      assessment.codingSubmission = {
        code,
        language:     language || 'javascript',
        testsPassed,
        testsTotal,
        testResults:  allTestResults.map(r => ({
          testId:         r.id,
          description:    r.description,
          passed:         r.passed,
          actualOutput:   r.actualOutput,
          expectedOutput: r.expectedOutput,
          executionMs:    0
        })),
        submittedAt: new Date()
      };
    } else if (assessment.codingSubmission) {
      // use previously submitted code if no new code provided
      codingScore = scoreCoding(assessment.codingSubmission);
      testsPassed = assessment.codingSubmission.testsPassed;
      testsTotal  = assessment.codingSubmission.testsTotal;
    }

    // ── Score MCQ + Aptitude ──────────────────────────────────────
    const combinedAnswers = [
      ...assessment.mcqAnswers,
      ...assessment.aptitudeAnswers
    ];
    const mcqScore = scoreMCQ(combinedAnswers, questionsData);

    // ── Score Resume Match ────────────────────────────────────────
    const candidate = await Candidate.findOne({ userId: req.user.id });
    const resumeMatchScore = candidate
      ? scoreResumeMatch(candidate.skills, assessment.domainId)
      : 0;

    // ── Composite Score ───────────────────────────────────────────
    const compositeScore = computeComposite(mcqScore, codingScore, resumeMatchScore);

    // ── Build scoring explanation ─────────────────────────────────
    const scoringExplanation =
      `MCQ/Aptitude: ${mcqScore}/100 (weight 40%) = ${(mcqScore * 0.4).toFixed(1)}\n` +
      `Coding:       ${codingScore}/100 (weight 40%) = ${(codingScore * 0.4).toFixed(1)}\n` +
      `Resume Match: ${resumeMatchScore}/100 (weight 20%) = ${(resumeMatchScore * 0.2).toFixed(1)}\n` +
      `─────────────────────────────────\n` +
      `Composite:    ${compositeScore}/100`;

    // Save scores
    assessment.mcqScore          = mcqScore;
    assessment.aptitudeScore     = mcqScore; // combined
    assessment.codingScore       = codingScore;
    assessment.resumeMatchScore  = resumeMatchScore;
    assessment.compositeScore    = compositeScore;
    assessment.scoringFormula    = 'Composite = (MCQ × 0.4) + (Coding × 0.4) + (ResumeMatch × 0.2)';
    assessment.scoringExplanation = scoringExplanation;
    assessment.evaluatedAt       = new Date();
    assessment.status            = 'recruiter_review_pending';
    assessment.statusLabel       = 'Assessment complete — recruiter review pending';

    await assessment.save();

    // ── Audit: result traceability ────────────────────────────────
    await AuditLog.create({
      eventType:         'result_traceability',
      actorRole:         'system',
      actorId:           req.user.id,
      targetRecord:      assessment._id.toString(),
      action:            'Assessment scored and finalized',
      result:            'complete',
      rubricVersion:     assessment.rubricVersion,
      questionSetVersion: assessment.questionSetVersion,
      metadata: {
        compositeScore,
        mcqScore,
        codingScore,
        resumeMatchScore,
        formula:          'MCQ*0.4 + Coding*0.4 + ResumeMatch*0.2',
        testsPassed,
        testsTotal,
        timestamp:        new Date().toISOString()
      }
    });

    res.json({
      success:       true,
      status:        assessment.status,
      statusLabel:   assessment.statusLabel,
      scores: {
        mcq:          mcqScore,
        coding:       codingScore,
        resumeMatch:  resumeMatchScore,
        composite:    compositeScore
      },
      scoringFormula:      assessment.scoringFormula,
      scoringExplanation,
      codingTestResults: (assessment.codingSubmission?.testResults || []).map(r => ({
        id:       r.testId,
        desc:     r.description,
        passed:   r.passed,
        output:   r.actualOutput,
        expected: r.expectedOutput
      })),
      message: '✅ Assessment complete — recruiter review pending. Results saved.'
    });

  } catch (err) {
    console.error('[Assessment] submitAssessment error:', err.message);
    res.status(500).json({ success: false, message: 'Submission failed. Please try again.' });
  }
};

// ═══════════════════════════════════════════════════════════════════
//  GET /api/assessment/results/me
// ═══════════════════════════════════════════════════════════════════
exports.getCandidateResults = async (req, res) => {
  try {
    const assessments = await Assessment.find({ userId: req.user.id })
      .sort({ createdAt: -1 });

    if (!assessments.length) {
      return res.json({ success: true, results: [], message: 'No assessments found.' });
    }

    const results = assessments.map(a => ({
      assessmentId:      a._id,
      domainId:          a.domainId,
      status:            a.status,
      statusLabel:       a.statusLabel,
      scores: {
        mcq:          a.mcqScore,
        coding:       a.codingScore,
        resumeMatch:  a.resumeMatchScore,
        composite:    a.compositeScore
      },
      scoringFormula:      a.scoringFormula,
      scoringExplanation:  a.scoringExplanation,
      startedAt:           a.startedAt,
      submittedAt:         a.submittedAt,
      evaluatedAt:         a.evaluatedAt
    }));

    res.json({ success: true, results });

  } catch (err) {
    console.error('[Assessment] getCandidateResults error:', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};
