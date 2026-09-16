// Intro Animation & Splash Loader Handler
function triggerIntroAnimation(force = false) {
  const overlay = document.getElementById('intro-animation-overlay');
  const bar = document.getElementById('intro-bar');
  const statusNum = document.getElementById('intro-status-num');
  const tickText = document.getElementById('intro-tick');

  if (!overlay) return;

  // Check if intro has already played in this browser session unless forced
  const hasPlayed = sessionStorage.getItem('hbd_intro_played');
  if (hasPlayed && !force) {
    overlay.style.display = 'none';
    return;
  }

  overlay.style.display = 'flex';
  overlay.classList.remove('hide');

  let pct = 0;
  const interval = setInterval(() => {
    pct += 4;
    if (pct > 100) pct = 100;

    if (bar) bar.style.width = `${pct}%`;
    if (statusNum) statusNum.textContent = `${pct}%`;

    if (tickText) {
      if (pct < 30) {
        tickText.textContent = '⚡ [01/04] Stripping Candidate Identifiers (Name, Gender, Age)...';
      } else if (pct < 60) {
        tickText.textContent = '🔍 [02/04] Constructing AST Skill & Complexity Vectors...';
      } else if (pct < 90) {
        tickText.textContent = '🛡️ [03/04] Verifying EEOC Demographic Neutrality Index...';
      } else {
        tickText.textContent = '✅ [04/04] Platform Ready · 100% Bias-Free Mode Active!';
      }
    }

    if (pct >= 100) {
      clearInterval(interval);
      sessionStorage.setItem('hbd_intro_played', 'true');
      setTimeout(() => {
        overlay.classList.add('hide');
        setTimeout(() => {
          overlay.style.display = 'none';
        }, 800);
      }, 500);
    }
  }, 40);
}

document.addEventListener('DOMContentLoaded', () => {
  triggerIntroAnimation(false);
});
