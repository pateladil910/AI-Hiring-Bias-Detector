// Custom SVG Gauge & Chart Generator
function renderBiasMeter(containerId, scoreVal = 99.8, label = 'OBJECTIVITY INDEX') {
  const container = document.getElementById(containerId);
  if (!container) return;

  const angle = -90 + (scoreVal / 100) * 180;
  
  let color = '#059669'; // success green
  let statusText = 'EEOC VERIFIED · ZERO LEAKAGE';
  if (scoreVal < 80) {
    color = '#d97706';
    statusText = 'MODERATE SKEW DETECTED';
  } else if (scoreVal < 60) {
    color = '#e11d48';
    statusText = 'HIGH BIAS RISK';
  }

  container.innerHTML = `
    <div class="bias-meter-wrap">
      <svg class="bias-gauge-svg" viewBox="0 0 240 130">
        <defs>
          <linearGradient id="meterGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#e11d48"/>
            <stop offset="50%" stop-color="#d97706"/>
            <stop offset="100%" stop-color="#059669"/>
          </linearGradient>
        </defs>
        
        <path d="M 30 110 A 90 90 0 0 1 210 110" fill="none" stroke="#e2e8f0" stroke-width="14" stroke-linecap="round" />
        <path d="M 30 110 A 90 90 0 0 1 210 110" fill="none" stroke="url(#meterGrad)" stroke-width="8" stroke-linecap="round" />
        
        <g style="transform-origin: 120px 110px; transform: rotate(${angle}deg); transition: transform 1s cubic-bezier(0.16, 1, 0.3, 1);">
          <polygon points="120,25 116,110 124,110" fill="#0f172a"/>
          <circle cx="120" cy="110" r="7" fill="${color}"/>
        </g>
      </svg>
      
      <div class="bias-score-val" style="color: ${color}">${scoreVal}%</div>
      <div style="font-family: var(--font-heading); font-size: 0.75rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em; margin-top: 4px;">${label}</div>
      <span class="badge badge-success" style="margin-top: 8px;">${statusText}</span>
    </div>
  `;
}
