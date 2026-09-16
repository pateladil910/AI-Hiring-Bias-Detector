document.addEventListener('DOMContentLoaded', () => {
  ParityNav.renderHeader(9);

  const domain = ParityStore.get('domain') || { title: 'Full Stack Engineering' };
  document.getElementById('domain-title-txt').textContent = domain.title;

  const scores = ParityStore.get('scores') || { resumeMatchScore: 90 };
  renderParityGauge('resume-gauge', scores.resumeMatchScore || 90, 'SKILL MATCH SCORE');
});
