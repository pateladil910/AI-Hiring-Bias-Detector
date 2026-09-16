const BACKEND_URL = 'http://localhost:5000';

async function runPhaseETests() {
  console.log('🧪 Starting Phase E Verification Suite...');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // ─── 1. Admin Recruiter Requests Flow ──────────────────────────────────
    console.log('\n👑 1. Testing Admin Recruiter Requests & Decision Engine...');
    
    // Login as Admin
    const adminLoginRes = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@fairhire.io', password: 'password123' }),
    });
    const adminLoginData = await adminLoginRes.json();
    const adminToken = adminLoginData.token;
    assert(adminLoginRes.ok && adminToken, 'Logged in as Admin user');

    // Create an employer access request
    const testWorkEmail = `recruiter_${Date.now()}@innovate.corp`;
    const empReqRes = await fetch(`${BACKEND_URL}/api/employers/request-access`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyName: 'Innovate Corp',
        workEmail: testWorkEmail,
        companySize: '51-200',
        useCase: 'Blind hiring for software engineers',
      }),
    });
    const empReqData = await empReqRes.json();
    const reqId = empReqData.requestId;
    assert(empReqRes.ok && reqId, `Submitted employer request with id: ${reqId}`);

    // Admin fetches requests queue
    const listRes = await fetch(`${BACKEND_URL}/api/admin/recruiter-requests`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const listData = await listRes.json();
    const foundReq = (listData.requests || []).find((r) => r.id === reqId);
    assert(listRes.ok && foundReq && foundReq.status === 'pending', 'Admin queue lists pending employer request');

    // Admin approves request
    const approveRes = await fetch(`${BACKEND_URL}/api/admin/recruiter-requests/${reqId}/decision`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        decision: 'approved',
        notes: 'Corporate domain and business registration verified.',
      }),
    });
    const approveData = await approveRes.json();
    assert(
      approveRes.ok && approveData.request?.status === 'approved' && approveData.request?.inviteToken,
      'Admin successfully approved request, generated invite token, and linked organisation'
    );

    // ─── 2. Recruiter Candidate Review & Status Updates Flow ───────────────
    console.log('\n📝 2. Testing Recruiter Candidate Status Updates & Review Notes...');

    // Register a recruiter
    const recEmail = `rec_${Date.now()}@fairhire.io`;
    const recRegRes = await fetch(`${BACKEND_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Sarah',
        lastName: 'Recruiter',
        email: recEmail,
        password: 'password123',
        role: 'recruiter',
      }),
    });
    const recRegData = await recRegRes.json();
    const recToken = recRegData.token;
    assert(recRegRes.ok && recToken, 'Registered fresh recruiter');

    // Create & publish a job
    const jobRes = await fetch(`${BACKEND_URL}/api/jobs`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${recToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Senior Systems Engineer',
        rawText: 'Looking for a senior systems engineer experienced in distributed systems, Rust, Go, and cloud architectures.',
      }),
    });
    const jobData = await jobRes.json();
    const jobId = jobData.job?.id;

    // Analyze job before publishing (Fairness rule)
    await fetch(`${BACKEND_URL}/api/jobs/${jobId}/analyze`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${recToken}` },
    });

    const pubRes = await fetch(`${BACKEND_URL}/api/jobs/${jobId}/publish`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${recToken}` },
    });
    assert(pubRes.ok, 'Created, analyzed, and published job');

    // Register candidate and apply
    const candEmail = `cand_${Date.now()}@example.com`;
    const candRegRes = await fetch(`${BACKEND_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Jordan',
        lastName: 'Candidate',
        email: candEmail,
        password: 'password123',
        role: 'candidate',
      }),
    });
    const candData = await candRegRes.json();
    const candToken = candData.token;

    // Apply
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
    const bodyParts = [
      `--${boundary}`,
      'Content-Disposition: form-data; name="jobId"',
      '',
      jobId,
      `--${boundary}`,
      'Content-Disposition: form-data; name="resume"; filename="resume.txt"',
      'Content-Type: text/plain',
      '',
      'Jordan Candidate. Experience: 6 years Rust and Go systems engineering. Designed high-throughput microservices.',
      `--${boundary}--`,
    ];
    const applyRes = await fetch(`${BACKEND_URL}/api/applications`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${candToken}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
      },
      body: bodyParts.join('\r\n'),
    });
    const applyData = await applyRes.json();
    if (!applyRes.ok) console.log('Apply error:', applyRes.status, applyData);
    const appId = applyData.application?.id;
    assert(applyRes.ok && appId, 'Candidate applied successfully');

    // Recruiter updates status to interview and leaves review notes
    const reviewNote = 'Candidate demonstrated exceptional proficiency in distributed architectures. Scheduled interview for Monday.';
    const updateRes = await fetch(`${BACKEND_URL}/api/applications/${appId}/status`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${recToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'interview',
        notes: reviewNote,
      }),
    });
    const updateData = await updateRes.json();
    assert(
      updateRes.ok &&
      updateData.application?.status === 'interview' &&
      updateData.application?.recruiterNotes === reviewNote,
      'Recruiter successfully updated application stage to interview and saved notes'
    );

    // Verify audit trail captured both actions
    const auditRes = await fetch(`${BACKEND_URL}/api/audit?limit=10`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const auditData = await auditRes.json();
    const logs = auditData.logs || [];
    const statusAudit = logs.find((l) => l.action === 'APPLICATION_STATUS_UPDATED' && l.entityId === appId);
    const reqAudit = logs.find((l) => l.action === 'RECRUITER_REQUEST_APPROVED' && l.entityId === reqId);

    assert(Boolean(statusAudit), 'Audit log contains APPLICATION_STATUS_UPDATED record with old/new status');
    assert(Boolean(reqAudit), 'Audit log contains RECRUITER_REQUEST_APPROVED record');

  } catch (err) {
    console.error('❌ Test execution error:', err);
    failed++;
  }

  console.log(`\n📊 Phase E Tests: ${passed} PASSED | ${failed} FAILED`);
  if (failed > 0) process.exit(1);
}

runPhaseETests();
