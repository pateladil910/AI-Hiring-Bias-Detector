/**
 * FairHire — Native Node.js Automated End-to-End System Test Suite
 * Tests all 8 Phases across AI Microservice, Backend API, and Database.
 */

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

let PASSED = 0;
let FAILED = 0;

function logTest(name, success, details = '') {
  if (success) {
    PASSED++;
    console.log(`  ✅ PASS: ${name}`);
  } else {
    FAILED++;
    console.log(`  ❌ FAIL: ${name} ${details ? `— ${details}` : ''}`);
  }
}

async function runTests() {
  console.log('================================================================');
  console.log('🚀 FAIRHIRE — AUTOMATED SYSTEM TESTING SUITE (NODE.JS RUNNER)');
  console.log('================================================================\n');

  // ─── 1. AI Microservice Direct Endpoints ────────────────────────────────────
  console.log('📦 TEST SUITE 1: AI Microservice Direct Endpoints (:8000)');
  try {
    // 1. Health
    const healthRes = await fetch(`${AI_SERVICE_URL}/health`);
    const healthData = await healthRes.json();
    logTest('AI Microservice Health Check', healthRes.ok && healthData.status === 'ok');

    // 2. Phase 1: JD Bias Scan
    const jdBiasRes = await fetch(`${AI_SERVICE_URL}/analyze/jd`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'We need a rockstar ninja developer who is a native English speaker to dominate in our fast-paced team.',
      }),
    });
    const jdBiasData = await jdBiasRes.json();
    logTest(
      'Phase 1: JD Bias Analysis & Skill Profiling',
      jdBiasRes.ok && jdBiasData.score !== undefined && Array.isArray(jdBiasData.flags) && jdBiasData.flags.length > 0,
      `Score: ${jdBiasData.score}, Flags count: ${jdBiasData.flag_count}`
    );

    // 3. Phase 2: Resume PII Anonymization
    const resumeRes = await fetch(`${AI_SERVICE_URL}/analyze/resume/text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        application_id: 'test-app-001',
        resume_text: 'John Doe. Phone: +1-555-0199. Email: john.doe@example.com. Address: 123 Main St, New York. Skilled in React, Node.js, Python, SQL.',
        anonymised: true,
      }),
    });
    const resumeData = await resumeRes.json();
    const anonymisedText = resumeData.anonymised_text || '';
    const nameMasked = !anonymisedText.includes('John Doe');
    const emailMasked = !anonymisedText.includes('john.doe@example.com');
    logTest(
      'Phase 2: Resume PII Anonymization',
      resumeRes.ok && nameMasked && emailMasked,
      `Name masked: ${nameMasked}, Email masked: ${emailMasked}`
    );

    // 4. Phase 3: Test Generation & Grading
    const testGenRes = await fetch(`${AI_SERVICE_URL}/generate/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        job_id: 'test-job-001',
        skill_profile: { tech_stack: ['react', 'node.js', 'sql'] },
        num_mcq: 4,
        num_short_answer: 1,
      }),
    });
    const testGenData = await testGenRes.json();
    const questions = testGenData.questions || [];
    logTest(
      'Phase 3: Skill-Tailored Test Generator',
      testGenRes.ok && questions.length > 0,
      `Questions generated: ${questions.length}`
    );

    // Grade test
    if (questions.length > 0) {
      const gradeRes = await fetch(`${AI_SERVICE_URL}/grade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          test_id: 'test-001',
          questions,
          answers: [{ question_id: questions[0].id, selected_index: 0 }],
        }),
      });
      const gradeData = await gradeRes.json();
      logTest(
        'Phase 3: Automated Test Grader',
        gradeRes.ok && gradeData.auto_score !== undefined,
        `Auto score: ${gradeData.auto_score}`
      );
    }

    // 5. Phase 4: Objective Eligibility Engine
    const eligRes = await fetch(`${AI_SERVICE_URL}/eligibility`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        application_id: 'app-001',
        test_score: 85.0,
        resume_skill_match: 0.75,
        llm_confidence: 1.0,
      }),
    });
    const eligData = await eligRes.json();
    logTest(
      'Phase 4: Objective Eligibility Engine (Eligible Case)',
      eligRes.ok && eligData.verdict === 'eligible' && eligData.explanation?.length > 10,
      `Verdict: ${eligData.verdict}`
    );

    // Borderline Case
    const borderRes = await fetch(`${AI_SERVICE_URL}/eligibility`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        application_id: 'app-002',
        test_score: 55.0,
        resume_skill_match: 0.50,
        llm_confidence: 0.9,
      }),
    });
    const borderData = await borderRes.json();
    logTest(
      'Phase 4: Borderline Score -> Needs Review Routing',
      borderRes.ok && borderData.verdict === 'needs_review',
      `Verdict: ${borderData.verdict}`
    );

    // 6. Phase 5: AI Chatbot Assistant
    const chatRes = await fetch(`${AI_SERVICE_URL}/chatbot/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role: 'candidate',
        message: 'How does blind screening protect my privacy?',
      }),
    });
    const chatData = await chatRes.json();
    logTest(
      'Phase 5: Contextual AI Chatbot Assistant',
      chatRes.ok && chatData.reply?.length > 20 && Array.isArray(chatData.suggestions) && chatData.suggestions.length > 0,
      `Suggestions: ${chatData.suggestions?.length}`
    );
  } catch (err) {
    logTest('AI Microservice Connection', false, err.message);
  }

  console.log();

  // ─── 2. Backend API & End-to-End Workflow ───────────────────────────────────
  console.log('🌐 TEST SUITE 2: Backend API & End-to-End Database Workflows (:5000)');
  try {
    // Health
    const bHealthRes = await fetch(`${BACKEND_URL}/health`);
    const bHealthData = await bHealthRes.json();
    logTest('Backend Service Health Check', bHealthRes.ok && bHealthData.status === 'ok');

    const timestamp = Date.now();
    const recruiterEmail = `recruiter_${timestamp}@test.com`;
    const candidateEmail = `candidate_${timestamp}@test.com`;
    const password = 'Password123!';

    // 1. Register Recruiter
    const recRegRes = await fetch(`${BACKEND_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Alice',
        lastName: 'Recruiter',
        email: recruiterEmail,
        password,
        role: 'recruiter',
        orgName: 'TechCorp Global',
      }),
    });
    const recRegData = await recRegRes.json();
    const recruiterToken = recRegData.token;
    logTest('Auth: Register Recruiter User', recRegRes.ok && recruiterToken !== undefined);

    // 2. Register Candidate
    const candRegRes = await fetch(`${BACKEND_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Bob',
        lastName: 'Applicant',
        email: candidateEmail,
        password,
        role: 'candidate',
      }),
    });
    const candRegData = await candRegRes.json();
    const candidateToken = candRegData.token;
    logTest('Auth: Register Candidate User', candRegRes.ok && candidateToken !== undefined);

    const recruiterHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${recruiterToken}` };
    const candidateHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${candidateToken}` };

    // 3. Create Job
    const jobCreateRes = await fetch(`${BACKEND_URL}/api/jobs`, {
      method: 'POST',
      headers: recruiterHeaders,
      body: JSON.stringify({
        title: `Full Stack Engineer (${timestamp})`,
        rawText: 'We are seeking a collaborative Full Stack Developer with strong React, Node.js, SQL, and Python proficiency.',
      }),
    });
    const jobCreateData = await jobCreateRes.json();
    const jobId = jobCreateData.job?.id;
    logTest('Jobs: Create Job Description', jobCreateRes.ok && jobId !== undefined);

    if (jobId) {
      // 4. Analyze & Publish
      const analyzeRes = await fetch(`${BACKEND_URL}/api/jobs/${jobId}/analyze`, {
        method: 'POST',
        headers: recruiterHeaders,
      });
      const analyzeData = await analyzeRes.json();
      logTest('Jobs: Analyze Bias & Extract Skills', analyzeRes.ok && analyzeData.job?.biasScore !== undefined);

      const pubRes = await fetch(`${BACKEND_URL}/api/jobs/${jobId}/publish`, {
        method: 'PATCH',
        headers: recruiterHeaders,
      });
      const pubData = await pubRes.json();
      logTest('Jobs: Publish Job', pubRes.ok && pubData.job?.status === 'published');

      // 5. Candidate Apply (FormData / Multipart)
      const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
      const bodyParts = [
        `--${boundary}`,
        'Content-Disposition: form-data; name="jobId"',
        '',
        jobId,
        `--${boundary}`,
        'Content-Disposition: form-data; name="coverLetter"',
        '',
        'Excited to apply for this engineering role!',
        `--${boundary}`,
        'Content-Disposition: form-data; name="resume"; filename="resume.txt"',
        'Content-Type: text/plain',
        '',
        'Bob Applicant. Email: bob@test.com. Phone: 555-1234. Experienced in React, Node.js, SQL, and Python backend systems.',
        `--${boundary}--`,
      ];
      const multipartBody = bodyParts.join('\r\n');

      const applyRes = await fetch(`${BACKEND_URL}/api/applications`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${candidateToken}`,
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
        },
        body: multipartBody,
      });
      const applyData = await applyRes.json();
      const appId = applyData.application?.id;
      logTest('Applications: Candidate Apply with Resume Upload', applyRes.ok && appId !== undefined);

      // 6. Recruiter Blind Candidate Review (Strict Zero-PII Check)
      const candListRes = await fetch(`${BACKEND_URL}/api/applications/job/${jobId}`, {
        headers: recruiterHeaders,
      });
      const candListData = await candListRes.json();
      const apps = candListData.applications || [];
      const piiLeaked = JSON.stringify(apps).toLowerCase().includes('bob') || JSON.stringify(apps).toLowerCase().includes('555-1234');
      logTest(
        'Privacy Rule: Zero PII Exposed in Recruiter Candidate View',
        candListRes.ok && !piiLeaked && apps.length > 0,
        `Applicants: ${apps.length}, PII Leaked: ${piiLeaked}`
      );

      // 7. Generate Test
      if (appId) {
        const testGenRes = await fetch(`${BACKEND_URL}/api/tests/generate/${appId}`, {
          method: 'POST',
          headers: recruiterHeaders,
        });
        const testGenData = await testGenRes.json();
        const testId = testGenData.test?.id;
        logTest('Tests: Recruiter Generates Aptitude Test', testGenRes.ok && testId !== undefined);

        // 8. Candidate Takes Test (Sanitised Check)
        if (testId) {
          const candGetTestRes = await fetch(`${BACKEND_URL}/api/tests/${testId}`, {
            headers: candidateHeaders,
          });
          const candGetTestData = await candGetTestRes.json();
          const candQuestions = candGetTestData.test?.questions || [];
          const answersLeaked = candQuestions.some((q) => q.correct_index !== undefined || q.rubric_keywords !== undefined);
          logTest(
            'Security Rule: Correct Answers & Rubrics Stripped for Candidate',
            candGetTestRes.ok && !answersLeaked && candQuestions.length > 0,
            `Questions: ${candQuestions.length}, Answers leaked: ${answersLeaked}`
          );

          // 9. Candidate Submits Test Answers
          const subAnswers = candQuestions
            .filter((q) => q.type === 'mcq')
            .map((q) => ({ question_id: q.id, selected_index: 0 }));
          const submitRes = await fetch(`${BACKEND_URL}/api/tests/${testId}/submit`, {
            method: 'POST',
            headers: candidateHeaders,
            body: JSON.stringify({ answers: subAnswers }),
          });
          const submitData = await submitRes.json();
          logTest(
            'Tests: Candidate Submits Test Answers & Auto-Graded',
            submitRes.ok && submitData.submission?.autoScore !== undefined
          );

          // 10. Recruiter Computes AI Eligibility
          const eligCompRes = await fetch(`${BACKEND_URL}/api/eligibility/compute/${appId}`, {
            method: 'POST',
            headers: recruiterHeaders,
          });
          const eligCompData = await eligCompRes.json();
          const verdictId = eligCompData.verdict?.id;
          logTest(
            'Eligibility: Compute AI Verdict with Plain-English Explanation',
            eligCompRes.ok && eligCompData.verdict?.verdict !== undefined && eligCompData.verdict?.explanation?.length > 10,
            `Verdict: ${eligCompData.verdict?.verdict}`
          );

          // 11. Recruiter Overrides Verdict
          if (verdictId) {
            const overrideRes = await fetch(`${BACKEND_URL}/api/eligibility/${verdictId}/override`, {
              method: 'PATCH',
              headers: recruiterHeaders,
              body: JSON.stringify({
                newVerdict: 'eligible',
                reason: 'Exceptional open-source contributions and portfolio approved by lead engineer.',
              }),
            });
            const overrideData = await overrideRes.json();
            logTest(
              'Eligibility: Recruiter Human Override with Mandatory Reason',
              overrideRes.ok && overrideData.verdict?.verdict === 'eligible'
            );
          }
        }
      }
    }

    // 12. Audit Trail Explorer & Stats
    const auditRes = await fetch(`${BACKEND_URL}/api/audit`, { headers: recruiterHeaders });
    const auditData = await auditRes.json();
    logTest('Audit: Fetch Compliance Audit Trail Logs', auditRes.ok && (auditData.logs?.length || 0) > 0);

    const auditStatsRes = await fetch(`${BACKEND_URL}/api/audit/stats`, { headers: recruiterHeaders });
    const auditStatsData = await auditStatsRes.json();
    logTest('Audit: Fetch Compliance Aggregate Statistics', auditStatsRes.ok && auditStatsData.totalLogs > 0);

    // 13. Dashboard Live Analytics
    const dashRes = await fetch(`${BACKEND_URL}/api/analytics/dashboard`, { headers: recruiterHeaders });
    const dashData = await dashRes.json();
    logTest(
      'Analytics: Live Dashboard KPI & Pipeline Funnel Calculation',
      dashRes.ok && dashData.kpis?.totalJobs > 0 && dashData.pipelineFunnel?.applied !== undefined,
      `Total Jobs: ${dashData.kpis?.totalJobs}, Total Apps: ${dashData.kpis?.totalApplications}`
    );

    // 14. Chatbot Session & Messaging
    const sessRes = await fetch(`${BACKEND_URL}/api/chatbot/session`, {
      method: 'POST',
      headers: candidateHeaders,
    });
    const sessData = await sessRes.json();
    const sessId = sessData.session?.id;
    logTest('Chatbot: Initialize User Session in Database', sessRes.ok && sessId !== undefined);

    if (sessId) {
      const msgRes = await fetch(`${BACKEND_URL}/api/chatbot/session/${sessId}/message`, {
        method: 'POST',
        headers: candidateHeaders,
        body: JSON.stringify({ message: 'Explain how fair hiring protects candidates.' }),
      });
      const msgData = await msgRes.json();
      logTest(
        'Chatbot: Send Message and Store Conversation History',
        msgRes.ok && msgData.assistantMessage?.content !== undefined
      );
    }
  } catch (err) {
    logTest('Backend API & End-to-End Workflows', false, err.message);
  }

  console.log('\n================================================================');
  console.log(`📊 FINAL TEST RESULTS: ${PASSED} PASSED | ${FAILED} FAILED`);
  console.log('================================================================');

  if (FAILED === 0) {
    console.log('🎉 ALL SYSTEM TESTS PASSED PERFECTLY WITH ZERO ERRORS!\n');
    process.exit(0);
  } else {
    console.log(`⚠️ ${FAILED} TEST(S) FAILED.\n`);
    process.exit(1);
  }
}

runTests();
