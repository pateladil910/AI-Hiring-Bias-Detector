document.addEventListener('DOMContentLoaded', () => {
  ParityNav.renderHeader(8);
  startEvaluationProcess();
});

function startEvaluationProcess() {
  const percentEl = document.getElementById('eval-percent');
  const fillEl = document.getElementById('eval-fill');

  let pct = 0;

  const interval = setInterval(() => {
    pct += 5;
    if (pct > 100) pct = 100;

    percentEl.textContent = `${pct}%`;
    fillEl.style.width = `${pct}%`;

    if (pct >= 20) {
      setEvalItemState('e-sec-1', 'active', 'Calculating MCQ answer key matrix...');
    }
    if (pct >= 40) {
      setEvalItemState('e-sec-1', 'completed', '✅ MCQ Scored: 92% Correct');
      setEvalItemState('e-sec-2', 'active', 'Analyzing AST syntax & LRU algorithm complexity...');
    }
    if (pct >= 75) {
      setEvalItemState('e-sec-2', 'completed', '✅ Coding Scored: 88% (O(1) Time Verified)');
      setEvalItemState('e-sec-3', 'active', 'Evaluating logical reasoning accuracy...');
    }
    if (pct >= 100) {
      clearInterval(interval);
      setEvalItemState('e-sec-3', 'completed', '✅ Aptitude Scored: 95% Logical Accuracy');

      // Auto advance to Step 09 Resume Analysis
      setTimeout(() => {
        window.location.href = '../09-resume-analysis/index.html';
      }, 700);
    }
  }, 100);
}

function setEvalItemState(id, state, statusText) {
  const item = document.getElementById(id);
  if (!item) return;

  item.className = `eval-item ${state}`;
  const statusEl = item.querySelector('.e-status');
  if (statusEl && statusText) {
    statusEl.textContent = statusText;
  }
}
