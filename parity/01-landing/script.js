document.addEventListener('DOMContentLoaded', () => {
  // Render Step 1 navigation header
  ParityNav.renderHeader(1);

  // Render live gauge demo
  renderParityGauge('landing-gauge', 94, 'BIAS SUPPRESSION INDEX');
});
