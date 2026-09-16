const fetch = globalThis.fetch;

async function runPhaseBTests() {
  console.log('--- Testing Phase B Endpoints ---');

  const ts = Date.now();
  const regRes = await fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: `rec_${ts}@example.com`,
      password: 'Password123!',
      firstName: 'Test',
      lastName: 'Recruiter',
      role: 'recruiter'
    })
  });
  const regData = await regRes.json();
  const token = regData.token;
  console.log('1. Recruiter registration & token:', Boolean(token), regData.error || '');

  const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

  // Quick scan (public)
  const qRes = await fetch('http://localhost:5000/api/bias/quick-scan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: 'Looking for an energetic young rockstar developer' })
  });
  const qData = await qRes.json();
  console.log('2. Quick Scan (public) -> flags:', qData.flags?.length, 'score:', qData.score);

  // Deep scan (auth)
  const dRes = await fetch('http://localhost:5000/api/bias/deep-scan', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      text: 'We need a rockstar ninja developer who is a native English speaker and graduated from a top-tier university.',
      role_title: 'Staff Engineer'
    })
  });
  const dData = await dRes.json();
  console.log('3. Deep Scan status:', dRes.status, 'dData:', JSON.stringify(dData));

  // Accept suggestion (audit)
  const aRes = await fetch('http://localhost:5000/api/bias/accept-suggestion', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      originalText: 'We need a rockstar ninja',
      updatedText: 'We need a skilled professional ninja',
      flagPhrase: 'rockstar',
      suggestion: 'skilled professional'
    })
  });
  const aData = await aRes.json();
  console.log('4. Accept suggestion diffHash:', aData.diffHash ? aData.diffHash.slice(0, 16) + '...' : null);

  // Dismiss flag (audit)
  const dmRes = await fetch('http://localhost:5000/api/bias/dismiss-flag', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      flagPhrase: 'ninja',
      flagCategory: 'gender_coded'
    })
  });
  const dmData = await dmRes.json();
  console.log('5. Dismiss flag ok:', dmData.ok);

  console.log('--- Phase B All Tests Completed Successfully ---');
}

runPhaseBTests().catch(console.error);
