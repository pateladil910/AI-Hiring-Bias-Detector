document.addEventListener('DOMContentLoaded', () => {
  ParityNav.renderHeader(11);

  const candidate = ParityStore.get('candidate') || { name: 'Alex Vance' };
  document.getElementById('cand-name-txt').textContent = candidate.name;

  const scores = ParityStore.get('scores') || {
    mcqScore: 92,
    codingScore: 88,
    aptitudeScore: 95,
    resumeMatchScore: 90,
    compositeScore: 91,
    verdict: 'STRONG FIT'
  };

  // Render main gauge
  renderParityGauge('composite-gauge', scores.compositeScore || 91, 'COMPOSITE SCORE');

  // Update section values and mini bars
  document.getElementById('comp-verdict-pill').textContent = `${scores.verdict || 'STRONG FIT'} · ${scores.compositeScore || 91} COMPOSITE SCORE`;

  setScoreBar('bar-mcq', 'score-mcq', scores.mcqScore || 92);
  setScoreBar('bar-coding', 'score-coding', scores.codingScore || 88);
  setScoreBar('bar-apt', 'score-apt', scores.aptitudeScore || 95);
  setScoreBar('bar-res', 'score-res', scores.resumeMatchScore || 90);
});

function setScoreBar(barId, scoreId, scoreVal) {
  const bar = document.getElementById(barId);
  const text = document.getElementById(scoreId);
  if (bar) bar.style.width = `${scoreVal}%`;
  if (text) text.textContent = `${scoreVal}%`;
}
