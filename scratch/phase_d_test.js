const API_URL = 'http://localhost:5000';

async function runPhaseDTests() {
  console.log('🧪 Starting Phase D Verification Suite...');
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

  // 1. Test Employer Request with consumer domain (@gmail.com)
  try {
    const res = await fetch(`${API_URL}/api/employers/request-access`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyName: 'Acme Corp', workEmail: 'recruiter@gmail.com' }),
    });
    const body = await res.json();
    assert(
      res.status === 400 && body.error?.message?.includes('Personal email providers'),
      'Blocked personal email (@gmail.com) rejected with 400 and clear message'
    );
  } catch (err) {
    assert(false, `Unexpected network failure on blocked email: ${err.message}`);
  }

  // 2. Test Employer Request with consumer domain (@yahoo.com)
  try {
    const res = await fetch(`${API_URL}/api/employers/request-access`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyName: 'Acme Corp', workEmail: 'recruiter@yahoo.com' }),
    });
    const body = await res.json();
    assert(
      res.status === 400 && body.error?.message?.includes('Personal email providers'),
      'Blocked personal email (@yahoo.com) rejected with 400'
    );
  } catch (err) {
    assert(false, `Unexpected network failure on blocked email: ${err.message}`);
  }

  // 3. Test Employer Request with valid corporate email (@acmetech.io)
  const corpEmail = `recruiter_${Date.now()}@acmetech.io`;
  try {
    const res = await fetch(`${API_URL}/api/employers/request-access`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyName: 'Acme Tech', workEmail: corpEmail, companySize: '51-200' }),
    });
    const body = await res.json();
    assert(
      res.status === 201 && body.requestId,
      'Valid corporate domain (@acmetech.io) accepted with 201 and requestId'
    );
  } catch (err) {
    assert(false, `Corporate domain should succeed: ${err.message}`);
  }

  // 4. Test Unverified User Auth flow
  const candidateEmail = `unverified_${Date.now()}@test.com`;
  try {
    // Register candidate
    const regRes = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Alice',
        lastName: 'Tester',
        email: candidateEmail,
        password: 'StrongPassword123!',
        role: 'candidate',
      }),
    });
    const regBody = await regRes.json();
    assert(regRes.status === 201, 'Registered candidate successfully');

    // Login candidate and verify emailVerified status returned
    const loginRes = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: candidateEmail,
        password: 'StrongPassword123!',
      }),
    });
    const loginBody = await loginRes.json();
    assert(
      loginRes.status === 200 && 'emailVerified' in loginBody.user,
      'Login response includes emailVerified boolean in user object'
    );

    // Resend verification
    const resendRes = await fetch(`${API_URL}/api/auth/resend-verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: candidateEmail }),
    });
    const resendBody = await resendRes.json();
    assert(
      resendRes.status === 200 && resendBody.message.includes('sent'),
      'Resend verification endpoint responds successfully'
    );
  } catch (err) {
    assert(false, `Auth flow error: ${err.message}`);
  }

  console.log(`\n📊 Phase D Tests: ${passed} PASSED | ${failed} FAILED`);
  if (failed > 0) {
    process.exit(1);
  }
}

runPhaseDTests();
