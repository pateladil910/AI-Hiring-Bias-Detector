document.addEventListener('DOMContentLoaded', () => {
  ParityNav.renderHeader(6);

  const domain = ParityStore.get('domain') || { id: 'fullstack', title: 'Full Stack Engineering' };
  document.getElementById('domain-name-sub').textContent = domain.title;
  document.getElementById('gen-domain-lbl').textContent = domain.title;

  startGenerationProcess();
});

function startGenerationProcess() {
  const percentEl = document.getElementById('gen-percent');
  const fillEl = document.getElementById('gen-fill');
  const btn = document.getElementById('btn-begin-test');

  let pct = 0;
  const interval = setInterval(() => {
    pct += 4;
    if (pct > 100) pct = 100;

    percentEl.textContent = `${pct}%`;
    fillEl.style.width = `${pct}%`;

    // Step state toggles
    if (pct >= 25) {
      setStepState('g-step-1', 'completed');
      setStepState('g-step-2', 'active');
    }
    if (pct >= 55) {
      setStepState('g-step-2', 'completed');
      setStepState('g-step-3', 'active');
    }
    if (pct >= 85) {
      setStepState('g-step-3', 'completed');
      setStepState('g-step-4', 'active');
    }

    if (pct >= 100) {
      clearInterval(interval);
      setStepState('g-step-4', 'completed');

      btn.disabled = false;
      btn.classList.remove('btn-disabled');

      // Auto advance after 800ms
      setTimeout(() => {
        beginAssessmentNow();
      }, 800);
    }
  }, 100);
}

function setStepState(stepId, state) {
  const el = document.getElementById(stepId);
  if (!el) return;
  el.className = `gen-step-item ${state}`;
}

function beginAssessmentNow() {
  // Initialize timer state in sessionStorage (20 minutes = 1200 seconds)
  const timerState = {
    totalSeconds: 1200,
    remainingSeconds: 1200,
    startTime: Date.now()
  };
  ParityStore.set('timer', timerState);

  // Initialize empty answers object if not present
  if (!ParityStore.get('answers')) {
    ParityStore.set('answers', {
      mcq: {},
      coding: '// Write solution function here\nfunction solve(input) {\n  // Implementation\n  return input;\n}',
      aptitude: {}
    });
  }

  // Navigate to Step 07
  window.location.href = '../07-test/index.html';
}
