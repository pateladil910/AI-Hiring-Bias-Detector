document.addEventListener('DOMContentLoaded', () => {
  ParityNav.renderHeader(12);

  const candidate = ParityStore.get('candidate') || { name: 'Alex Vance' };
  document.getElementById('cand-name-display').textContent = candidate.name;

  const domain = ParityStore.get('domain') || { title: 'Full Stack Engineering' };
  document.getElementById('domain-name-display').textContent = `${domain.title} Specialist`;

  const scores = ParityStore.get('scores') || {
    compositeScore: 91,
    verdict: 'STRONG FIT',
    verdictCode: 'teal'
  };

  document.getElementById('cand-composite-num').textContent = `${scores.compositeScore || 91} / 100`;

  const verdictPill = document.getElementById('rec-verdict-pill');
  if (verdictPill) {
    if (scores.verdictCode === 'danger') {
      verdictPill.className = 'status-pill pill-danger verdict-main-pill';
      verdictPill.textContent = 'NOT A FIT — REJECT CANDIDATE PROFILE';
    } else if (scores.verdictCode === 'amber') {
      verdictPill.className = 'status-pill pill-amber verdict-main-pill';
      verdictPill.textContent = 'MODERATE FIT — REQUIRES TECHNICAL FOLLOW-UP';
    } else {
      verdictPill.className = 'status-pill pill-teal verdict-main-pill';
      verdictPill.textContent = 'STRONG FIT — RECOMMEND FOR TECHNICAL ONSITE';
    }
  }
});

function downloadReportPdf() {
  alert('Exporting Parity Verifiable Assessment Report (PDF). Download will start automatically.');
}

function restartAssessmentFlow() {
  if (confirm('Complete assessment and return to landing page? Session state will reset.')) {
    ParityStore.clear();
    window.location.href = '../01-landing/index.html';
  }
}
