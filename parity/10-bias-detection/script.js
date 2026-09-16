document.addEventListener('DOMContentLoaded', () => {
  ParityNav.renderHeader(10);

  // Render test bias neutrality gauge (99.8% neutral score)
  renderParityGauge('bias-audit-gauge', 99.8, 'NEUTRALITY INDEX');
});
