/* ═════════════════════════════════════════════════════════════════════
   PARITY PLATFORM UTILITIES & SESSION STATE MANAGER
   ═════════════════════════════════════════════════════════════════════ */

const STEPS = [
  { num: 1, id: '01-landing', name: 'Overview', path: '../01-landing/index.html' },
  { num: 2, id: '02-login', name: 'Authentication', path: '../02-login/index.html' },
  { num: 3, id: '03-upload-resume', name: 'Upload Resume', path: '../03-upload-resume/index.html' },
  { num: 4, id: '04-resume-parser', name: 'Parse Profile', path: '../04-resume-parser/index.html' },
  { num: 5, id: '05-select-domain', name: 'Select Domain', path: '../05-select-domain/index.html' },
  { num: 6, id: '06-generate-test', name: 'Generate Assessment', path: '../06-generate-test/index.html' },
  { num: 7, id: '07-test', name: 'Timed Assessment', path: '../07-test/index.html' },
  { num: 8, id: '08-evaluation', name: 'Auto Scoring', path: '../08-evaluation/index.html' },
  { num: 9, id: '09-resume-analysis', name: 'Skill Alignment', path: '../09-resume-analysis/index.html' },
  { num: 10, id: '10-bias-detection', name: 'Assessment Calibration', path: '../10-bias-detection/index.html' },
  { num: 11, id: '11-candidate-score', name: 'Score Matrix', path: '../11-candidate-score/index.html' },
  { num: 12, id: '12-recommendation', name: 'Final Verdict', path: '../12-recommendation/index.html' }
];

/* ── SESSION STORAGE PERSISTENCE ── */
const ParityStore = {
  get(key, defaultValue = null) {
    try {
      const item = sessionStorage.getItem(`parity_${key}`);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.warn('ParityStore read error:', e);
      return defaultValue;
    }
  },

  set(key, value) {
    try {
      sessionStorage.setItem(`parity_${key}`, JSON.stringify(value));
    } catch (e) {
      console.warn('ParityStore write error:', e);
    }
  },

  clear() {
    sessionStorage.clear();
  },

  /* Defaults helper */
  initDefaults() {
    if (!this.get('candidate')) {
      this.set('candidate', { name: 'Alex Vance', email: 'alex.vance@example.com' });
    }
    if (!this.get('resume')) {
      this.set('resume', {
        filename: 'Alex_Vance_Senior_Dev_Resume.pdf',
        parsed: {
          name: 'Alex Vance',
          email: 'alex.vance@example.com',
          phone: '+1 (555) 234-8901',
          skills: ['React', 'TypeScript', 'Node.js', 'System Architecture', 'PostgreSQL', 'GraphQL', 'AWS', 'Docker'],
          experience: [
            { role: 'Senior Full Stack Engineer', company: 'Apex Tech', period: '2021 – Present', description: 'Architected high-throughput React/Node microservices handling 2M daily requests.' },
            { role: 'Software Engineer', company: 'Nexus Systems', period: '2018 – 2021', description: 'Developed TypeScript UI design system and REST APIs.' }
          ],
          education: 'B.S. in Computer Science — State University (2018)'
        }
      });
    }
    if (!this.get('domain')) {
      this.set('domain', {
        id: 'fullstack',
        title: 'Full Stack Engineering',
        desc: 'Comprehensive evaluation covering Frontend (React/TS), Backend API design, and Database systems.'
      });
    }
    if (!this.get('testConfig')) {
      this.set('testConfig', {
        mcqCount: 5,
        codingCount: 1,
        aptitudeCount: 3,
        totalTimeMinutes: 20
      });
    }
    if (!this.get('scores')) {
      this.set('scores', {
        mcqScore: 92,
        codingScore: 88,
        aptitudeScore: 95,
        resumeMatchScore: 90,
        compositeScore: 91,
        verdict: 'STRONG FIT',
        verdictCode: 'teal'
      });
    }
  }
};

/* Initialize defaults on first load */
ParityStore.initDefaults();

/* ── HEADER & STEP CALIBRATION RENDERER ── */
const ParityNav = {
  renderHeader(currentStepNum) {
    const headerEl = document.getElementById('parity-header');
    if (!headerEl) return;

    const candidate = ParityStore.get('candidate') || { name: 'Candidate' };
    const currentStep = STEPS.find(s => s.num === currentStepNum) || STEPS[0];

    let ticksHTML = '';
    STEPS.forEach(step => {
      let stateClass = '';
      if (step.num < currentStepNum) stateClass = 'completed';
      else if (step.num === currentStepNum) stateClass = 'active';

      ticksHTML += `<div class="calibration-tick ${stateClass}" title="Step ${step.num}: ${step.name}"></div>`;
    });

    headerEl.innerHTML = `
      <div class="header-container">
        <a href="../01-landing/index.html" class="brand-logo">
          <div class="brand-mark"></div>
          Parity
          <span class="brand-tag">v2.4 Instrument</span>
        </a>

        <div class="calibration-track-wrap">
          <div class="track-meta">
            <span>Calibration Track</span>
            <span class="track-step-name">Step ${String(currentStepNum).padStart(2, '0')} / 12 — ${currentStep.name}</span>
          </div>
          <div class="calibration-strip">
            ${ticksHTML}
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 12px;">
          <div id="nav-timer-slot"></div>
          <div class="user-pill">
            <span class="user-dot"></span>
            ${candidate.name.split(' ')[0]}
          </div>
        </div>
      </div>
    `;
  }
};

/* ── GAUGE COMPONENT RENDERER ── */
function renderParityGauge(containerId, scoreValue, labelText = 'CALIBRATION METRIC') {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Map 0-100 score to needle angle (-90deg to +90deg)
  const angle = -90 + (scoreValue / 100) * 180;
  
  let pillClass = 'pill-teal';
  let verdictText = 'BALANCED / LOW RISK';
  if (scoreValue < 60) {
    pillClass = 'pill-danger';
    verdictText = 'HIGH SKEW / REJECT';
  } else if (scoreValue < 80) {
    pillClass = 'pill-amber';
    verdictText = 'MODERATE SKEW / ACCEPTABLE';
  }

  container.innerHTML = `
    <div class="parity-gauge-container">
      <div class="gauge-svg-wrap">
        <svg class="gauge-svg" viewBox="0 0 240 130">
          <defs>
            <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#E2574C" />
              <stop offset="50%" stop-color="#E0A72E" />
              <stop offset="100%" stop-color="#4FD1C5" />
            </linearGradient>
          </defs>
          
          <!-- Outer Arc Track -->
          <path d="M 30 110 A 90 90 0 0 1 210 110" fill="none" stroke="#1D3236" stroke-width="14" stroke-linecap="round" />
          
          <!-- Colored Arc Overlay -->
          <path d="M 30 110 A 90 90 0 0 1 210 110" fill="none" stroke="url(#gaugeGrad)" stroke-width="8" stroke-linecap="round" />
          
          <!-- Ticks -->
          <line x1="30" y1="110" x2="22" y2="110" stroke="#5C7576" stroke-width="2" />
          <line x1="120" y1="20" x2="120" y2="12" stroke="#5C7576" stroke-width="2" />
          <line x1="210" y1="110" x2="218" y2="110" stroke="#5C7576" stroke-width="2" />

          <!-- Needle -->
          <g class="gauge-needle" style="transform: rotate(${angle}deg);">
            <polygon points="120,25 116,110 124,110" fill="#ECE8DE" />
            <circle cx="120" cy="110" r="7" fill="#4FD1C5" />
          </g>
        </svg>
      </div>

      <div class="gauge-val-display">${scoreValue}</div>
      <div class="mono-label" style="margin-top: 2px;">${labelText}</div>
      <div class="status-pill ${pillClass} gauge-verdict-pill">${verdictText}</div>
    </div>
  `;
}
