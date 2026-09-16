function startAssessmentTimer(durationSeconds = 1200, displayElId = 'timer-display', onComplete = null) {
  const displayEl = document.getElementById(displayElId);
  if (!displayEl) return;

  let remaining = AppStore.get('timer_seconds', durationSeconds);

  function update() {
    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;
    displayEl.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    if (remaining <= 60) {
      displayEl.style.color = 'var(--danger)';
    } else if (remaining <= 300) {
      displayEl.style.color = 'var(--warning)';
    }

    if (remaining <= 0) {
      clearInterval(interval);
      if (typeof onComplete === 'function') onComplete();
    }
  }

  update();

  const interval = setInterval(() => {
    remaining--;
    AppStore.set('timer_seconds', remaining);
    update();
  }, 1000);

  return interval;
}
