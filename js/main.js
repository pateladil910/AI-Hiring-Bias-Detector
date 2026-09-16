document.addEventListener('DOMContentLoaded', () => {
  // Stats Counter Animation
  const statNumbers = document.querySelectorAll('.stat-number');
  statNumbers.forEach(stat => {
    const target = parseFloat(stat.getAttribute('data-target') || '0');
    if (!target) return;

    let count = 0;
    const speed = target / 30;
    const update = () => {
      count += speed;
      if (count < target) {
        stat.textContent = target % 1 === 0 ? Math.ceil(count).toLocaleString() : count.toFixed(1);
        setTimeout(update, 30);
      } else {
        stat.textContent = target % 1 === 0 ? target.toLocaleString() : target.toFixed(1);
      }
    };
    update();
  });

  // Render initial bias meter demo on index page if present
  if (document.getElementById('index-bias-meter')) {
    renderBiasMeter('index-bias-meter', 99.8, 'OBJECTIVITY INDEX');
  }
});
