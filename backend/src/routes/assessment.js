const express = require('express');
const vm = require('vm');
const { AptitudeTest, TestSubmission, Application, CandidateResume, Job, AuditLog } = require('../models');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

// ─── Domain Assessment Tracks Data ───────────────────────────────────────────
const DOMAINS = [
  {
    id: 'fullstack',
    name: 'Full Stack Engineering',
    description: 'Assess full lifecycle web engineering across modern React frontends and Node.js RESTful backends.',
    requiredSkills: ['React', 'Node.js', 'REST APIs', 'PostgreSQL / SQL', 'JavaScript/TypeScript', 'Git'],
    durationMinutes: 30,
    format: '5 MCQ Aptitude Questions + 1 Interactive Coding Challenge',
    mcqs: [
      {
        id: 'fs-1',
        question: 'Which HTTP method is defined as idempotent according to RFC 7231?',
        options: ['POST', 'PUT', 'PATCH', 'CONNECT'],
        correctIndex: 1,
        topic: 'Web Protocols',
      },
      {
        id: 'fs-2',
        question: 'In React 18, what is the primary purpose of the cleanup function returned from useEffect?',
        options: [
          'To force a synchronous re-render of the DOM',
          'To clean up subscriptions, timers, or event listeners before the component unmounts or re-runs the effect',
          'To clear browser cookies and localStorage',
          'To reset component state to initial values',
        ],
        correctIndex: 1,
        topic: 'React Architecture',
      },
      {
        id: 'fs-3',
        question: 'What is the performance benefit of creating a B-Tree index on a SQL table column?',
        options: [
          'Reduces search time complexity from O(N) full table scans to O(log N)',
          'Compresses database disk storage by 50%',
          'Prevents duplicate records from ever being inserted',
          'Automatically encrypts table data at rest',
        ],
        correctIndex: 0,
        topic: 'Database Optimization',
      },
      {
        id: 'fs-4',
        question: 'Why does a browser send an HTTP OPTIONS preflight request before certain cross-origin requests?',
        options: [
          'To compress the request payload for speed',
          'To check server CORS policy permissions before sending non-simple HTTP requests (e.g., custom headers or PUT/DELETE)',
          'To authenticate the user using HTTP Basic Auth',
          'To verify SSL certificate expiration',
        ],
        correctIndex: 1,
        topic: 'Web Security',
      },
      {
        id: 'fs-5',
        question: 'In Node.js, how does the libuv event loop handle asynchronous I/O operations without blocking execution?',
        options: [
          'It spawns a new OS thread for every single JavaScript function call',
          'It runs non-blocking OS system calls and delegates file/network tasks to an internal worker thread pool',
          'It halts execution until the operating system returns data',
          'It interprets JavaScript code line-by-line via Web Workers',
        ],
        correctIndex: 1,
        topic: 'Node.js Internals',
      },
    ],
    codingProblem: {
      id: 'cp-fs-1',
      title: 'Valid Balanced Parentheses & Brackets',
      instructions: `Write a function \`isValid(s)\` that takes a string \`s\` containing characters '(', ')', '{', '}', '[' and ']' and returns \`true\` if the input string is valid, or \`false\` otherwise.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
      starterCode: `function isValid(s) {
  // Your code here
  const stack = [];
  const map = { ')': '(', '}': '{', ']': '[' };
  
  for (let char of s) {
    if (char === '(' || char === '{' || char === '[') {
      stack.push(char);
    } else if (map[char]) {
      if (stack.pop() !== map[char]) return false;
    }
  }
  return stack.length === 0;
}`,
      testCases: [
        { input: '()', expected: true, description: 'Single matching pair ()' },
        { input: '()[]{}', expected: true, description: 'Multiple matching pairs ()[]{}' },
        { input: '(]', expected: false, description: 'Mismatched brackets (]' },
        { input: '([)]', expected: false, description: 'Incorrect nesting ([)]' },
        { input: '{[]}', expected: true, description: 'Properly nested brackets {[]}' },
      ],
    },
  },
  {
    id: 'frontend',
    name: 'Frontend Engineering',
    description: 'Evaluate user interface design, accessibility standards, state management, and modern browser APIs.',
    requiredSkills: ['React', 'TypeScript', 'CSS/TailwindCSS', 'Web Performance', 'Accessibility (a11y)'],
    durationMinutes: 30,
    format: '5 MCQ Questions + 1 Coding Challenge',
    mcqs: [
      {
        id: 'fe-1',
        question: 'Which CSS property creates a new stacking context for z-index without setting position relative/absolute?',
        options: ['display: flex', 'opacity: 0.99', 'margin: 0 auto', 'box-sizing: border-box'],
        correctIndex: 1,
        topic: 'CSS Internals',
      },
      {
        id: 'fe-2',
        question: 'What is the difference between debouncing and throttling a function?',
        options: [
          'Debounce delays execution until after a period of inactivity; throttle limits execution to at most once per time window',
          'Debounce is asynchronous while throttle is strictly synchronous',
          'Throttle cancels all pending timeouts while debounce runs immediately',
          'There is no functional difference; they are synonymous',
        ],
        correctIndex: 0,
        topic: 'UI Performance',
      },
      {
        id: 'fe-3',
        question: 'What is the primary accessibility purpose of the ARIA attribute aria-live="polite"?',
        options: [
          'Prevents keyboard users from focusing an element',
          'Instructs screen readers to announce dynamic DOM updates when the user is idle, without interrupting ongoing speech',
          'Forces the browser to display a modal popup',
          'Applies high contrast styles for visually impaired users',
        ],
        correctIndex: 1,
        topic: 'Accessibility (a11y)',
      },
      {
        id: 'fe-4',
        question: 'Why should keys in React lists be stable, unique identifiers rather than array indices?',
        options: [
          'Using indices breaks CSS styling',
          'Indices can cause unexpected component state bugs and inefficient re-renders when items are reordered or filtered',
          'React does not compile if array indices are passed',
          'Indices leak memory in the browser engine',
        ],
        correctIndex: 1,
        topic: 'React Virtual DOM',
      },
      {
        id: 'fe-5',
        question: 'Which web browser storage mechanism has the largest storage quota and supports structured asynchronous queries?',
        options: ['localStorage', 'sessionStorage', 'IndexedDB', 'HTTP Cookies'],
        correctIndex: 2,
        topic: 'Browser APIs',
      },
    ],
    codingProblem: {
      id: 'cp-fe-1',
      title: 'Flatten Nested Array',
      instructions: `Write a function \`flatten(arr)\` that recursively flattens a multi-dimensional array of arbitrary depth into a single flat array without using Array.prototype.flat().`,
      starterCode: `function flatten(arr) {
  // Your code here
  let result = [];
  for (let item of arr) {
    if (Array.isArray(item)) {
      result.push(...flatten(item));
    } else {
      result.push(item);
    }
  }
  return result;
}`,
      testCases: [
        { input: [1, [2, 3]], expected: [1, 2, 3], description: 'Depth 2 array' },
        { input: [1, [2, [3, [4]]]], expected: [1, 2, 3, 4], description: 'Deeply nested array' },
        { input: [[], [1], [2, [3]]], expected: [1, 2, 3], description: 'Array with empty sub-array' },
        { input: [42], expected: [42], description: 'Single element array' },
      ],
    },
  },
  {
    id: 'aiml',
    name: 'Artificial Intelligence & ML',
    description: 'Test applied machine learning concepts, NLP pipeline fundamentals, metric evaluation, and algorithmic fairness.',
    requiredSkills: ['Python', 'PyTorch/TensorFlow', 'NLP', 'Model Evaluation', 'Algorithmic Fairness'],
    durationMinutes: 30,
    format: '5 MCQ Questions + 1 Coding Challenge',
    mcqs: [
      {
        id: 'ai-1',
        question: 'In a medical screening or bias detection model where missing a positive case is costly, which metric should be prioritized?',
        options: ['Precision', 'Recall / Sensitivity', 'Accuracy', 'Specificity'],
        correctIndex: 1,
        topic: 'Evaluation Metrics',
      },
      {
        id: 'ai-2',
        question: 'Under the US EEOC Uniform Guidelines on Employee Selection, what is the Four-Fifths (80%) Rule used to identify?',
        options: [
          'The minimum passing grade on coding tests',
          'Evidence of disparate impact / adverse bias against a protected demographic group in hiring selection rates',
          'The percentage of resumes that must be processed by AI',
          'The required training data diversity ratio',
        ],
        correctIndex: 1,
        topic: 'Algorithmic Fairness',
      },
      {
        id: 'ai-3',
        question: 'What is the primary role of Self-Attention in the Transformer architecture?',
        options: [
          'To compute pairwise token relevance weights dynamically across the entire input sequence simultaneously',
          'To compress the embedding matrix into 8-bit integers',
          'To replace backpropagation with genetic algorithms',
          'To execute recurrence sequentially like an RNN',
        ],
        correctIndex: 0,
        topic: 'Transformer Architecture',
      },
      {
        id: 'ai-4',
        question: 'Which technique helps prevent overfitting in deep neural networks by randomly deactivating neurons during training?',
        options: ['Batch Normalization', 'Dropout', 'Learning Rate Warmup', 'Quantization'],
        correctIndex: 1,
        topic: 'Deep Learning',
      },
      {
        id: 'ai-5',
        question: 'What is Vector Cosine Similarity commonly used for in semantic search and resume matching?',
        options: [
          'Measuring the angular orientation between two high-dimensional embedding vectors regardless of their magnitude',
          'Calculating database disk read speed',
          'Sorting text alphabetically',
          'Generating random weights for model initialization',
        ],
        correctIndex: 0,
        topic: 'Vector Embeddings',
      },
    ],
    codingProblem: {
      id: 'cp-ai-1',
      title: 'Cosine Similarity of Two Vectors',
      instructions: `Write a function \`cosineSimilarity(vecA, vecB)\` that calculates the cosine similarity between two non-empty numerical vectors of equal length.
Formula: dotProduct(A, B) / (norm(A) * norm(B)). Round the result to 2 decimal places. Return 0 if either vector has norm 0.`,
      starterCode: `function cosineSimilarity(vecA, vecB) {
  // Your code here
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  const sim = dot / (Math.sqrt(normA) * Math.sqrt(normB));
  return Math.round(sim * 100) / 100;
}`,
      testCases: [
        { input: [[1, 2, 3], [1, 2, 3]], expected: 1, description: 'Identical vectors (sim = 1)' },
        { input: [[1, 0], [0, 1]], expected: 0, description: 'Orthogonal vectors (sim = 0)' },
        { input: [[1, 2, 3], [2, 4, 6]], expected: 1, description: 'Parallel scaled vectors (sim = 1)' },
        { input: [[1, 1], [1, -1]], expected: 0, description: 'Perpendicular vectors (sim = 0)' },
      ],
    },
  },
];

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
    domain.mcqs.forEach((q) => {
      if (mcqAnswers[q.id] === q.correctIndex) {
        mcqCorrect++;
      }
    });
    const mcqScore = Math.round((mcqCorrect / domain.mcqs.length) * 100);

    // 2. Calculate Coding Score using VM Sandbox
    const testCases = domain.codingProblem.testCases;
    let testsPassed = 0;

    if (code) {
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
          if (JSON.stringify(sandbox.outputResult) === JSON.stringify(tc.expected)) {
            testsPassed++;
          }
        } catch (_) {}
      }
    }
    const codingScore = Math.round((testsPassed / testCases.length) * 100);

    // 3. Resume Match Score from candidate skills
    const resume = await CandidateResume.findOne({ where: { userId: req.user.id } });
    let resumeScore = 80;
    if (resume?.extractedSkillsJson) {
      const skills = resume.extractedSkillsJson;
      const matched = domain.requiredSkills.filter((s) =>
        skills.some((sk) => sk.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(sk.toLowerCase()))
      );
      resumeScore = Math.min(100, Math.max(60, Math.round((matched.length / domain.requiredSkills.length) * 100)));
    }

    // 4. Transparent Mathematical Formula
    // Composite = (MCQ × 0.4) + (Coding × 0.4) + (Resume × 0.2)
    const compositeScore = Math.round((mcqScore * 0.4) + (codingScore * 0.4) + (resumeScore * 0.2));
    const scoringFormula = `(${mcqScore} × 0.4) + (${codingScore} × 0.4) + (${resumeScore} × 0.2) = ${compositeScore}`;

    // 5. Update Test record
    test.mcqScore = mcqScore;
    test.codingScore = codingScore;
    test.compositeScore = compositeScore;
    test.scoringFormula = 'MCQ×0.4 + Coding×0.4 + Resume×0.2';
    test.scoringExplanation = `Composite score calculated using verified weighted model: MCQ Aptitude (40%), Coding Sandbox Challenge (40%), and Anonymized Resume Match (20%).`;
    test.codingSubmissionJson = { code, language, testsPassed, testsTotal: testCases.length };
    test.status = 'evaluated';
    await test.save();

    // 6. Update TestSubmission
    await TestSubmission.create({
      testId: test.id,
      answersJson: mcqAnswers,
      autoScore: compositeScore,
      submittedAt: new Date(),
    });

    // 7. Update Application status
    if (test.applicationId) {
      const app = await Application.findByPk(test.applicationId);
      if (app) {
        app.status = 'test_completed';
        await app.save();
      }
    }

    // 8. Audit Log
    await AuditLog.create({
      action: 'TEST_SUBMITTED',
      entityType: 'aptitude_test',
      entityId: test.id,
      userId: req.user.id,
      reason: 'Candidate completed MCQ and coding challenge with algorithmic scoring',
      meta: { mcqScore, codingScore, resumeScore, compositeScore },
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
      status: 'Assessment complete — recruiter review pending',
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
          candidateResults.push({
            assessmentId: t.id,
            domainName: domain.name,
            domainId: t.domainId,
            mcqScore: t.mcqScore,
            codingScore: t.codingScore,
            compositeScore: t.compositeScore,
            scoringFormula: t.scoringFormula,
            scoringExplanation: t.scoringExplanation,
            status: 'Assessment complete — recruiter review pending',
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

    return res.json({
      assessmentId: test.id,
      domainName: domain.name,
      domainId: test.domainId,
      mcqScore: test.mcqScore,
      codingScore: test.codingScore,
      compositeScore: test.compositeScore,
      scoringFormula: `(${test.mcqScore || 0} × 0.4) + (${test.codingScore || 0} × 0.4) + (80 × 0.2) = ${test.compositeScore || 0}`,
      formulaTemplate: 'Composite = (MCQ × 0.4) + (Coding × 0.4) + (Resume × 0.2)',
      explanation: test.scoringExplanation,
      status: 'Assessment complete — recruiter review pending',
      completedAt: test.updatedAt,
    });
  } catch (err) {
    return res.status(500).json({ error: { code: 'FETCH_FAILED', message: 'Failed to fetch result detail' } });
  }
});

module.exports = router;
