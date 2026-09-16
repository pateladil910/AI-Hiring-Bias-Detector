// MCQ Questions Database
const MCQ_QUESTIONS = [
  {
    id: 1,
    question: "In React 18, what is the main purpose of the useDeferredValue hook?",
    options: [
      "A) To cache expensive API call responses across component re-renders",
      "B) To defer updating a non-urgent part of the UI while keeping the input responsive",
      "C) To execute side-effects after DOM mutation synchronously",
      "D) To replace Redux store actions in server components"
    ],
    correct: 1
  },
  {
    id: 2,
    question: "Which database index structure is optimized for high-write write-ahead logging (WAL) and time-series analytical queries?",
    options: [
      "A) Standard B-Tree Index",
      "B) Log-Structured Merge (LSM) Tree",
      "C) R-Tree Spatial Index",
      "D) Inverted Full-Text Index"
    ],
    correct: 1
  },
  {
    id: 3,
    question: "What happens when a Node.js process executes an asynchronous fs.readFile call?",
    options: [
      "A) The main V8 thread blocks until disk IO returns",
      "B) The request is offloaded to the libuv thread pool, freeing the main event loop",
      "C) Node spawns a new OS process per file read request",
      "D) The call executes synchronously via web workers"
    ],
    correct: 1
  },
  {
    id: 4,
    question: "In TypeScript, what is the key difference between 'unknown' and 'any' types?",
    options: [
      "A) 'unknown' is a subtype of string, whereas 'any' is a subtype of object",
      "B) 'unknown' requires type checking or narrowing before performing operations on it",
      "C) 'any' disables compiler type checking; 'unknown' throws compile-time error if assigned",
      "D) There is no functional difference between them in TypeScript 4+"
    ],
    correct: 1
  },
  {
    id: 5,
    question: "Which HTTP header is essential to prevent Cross-Site Scripting (XSS) attacks in modern web applications?",
    options: [
      "A) Content-Security-Policy (CSP)",
      "B) Access-Control-Allow-Origin",
      "C) X-Frame-Options: DENY",
      "D) Cache-Control: no-store"
    ],
    correct: 0
  }
];

// Aptitude Questions Database
const APTITUDE_QUESTIONS = [
  {
    id: 1,
    question: "If a server cluster handles 1,200 requests per minute with an average latency of 50ms, how many concurrent requests are being processed on average (Little's Law)?",
    options: [
      "A) 1 Concurrent Request",
      "B) 6 Concurrent Requests",
      "C) 60 Concurrent Requests",
      "D) 600 Concurrent Requests"
    ],
    correct: 0
  },
  {
    id: 2,
    question: "Complete the logical pattern sequence: 2, 6, 12, 20, 30, 42, ?",
    options: [
      "A) 52",
      "B) 56",
      "C) 60",
      "D) 64"
    ],
    correct: 1
  },
  {
    id: 3,
    question: "Team A completes a sprint backlog in 10 days. Team B completes it in 15 days. If both teams work together, how many days will it take?",
    options: [
      "A) 6.0 Days",
      "B) 7.5 Days",
      "C) 8.0 Days",
      "D) 12.5 Days"
    ],
    correct: 0
  }
];

let currentSection = 1;
let currentMcqIdx = 0;
let currentAptIdx = 0;

let answers = {
  mcq: {},
  coding: '// LRU Cache Implementation\nclass LRUCache {\n  constructor(capacity) {\n    this.capacity = capacity;\n    this.map = new Map();\n  }\n\n  get(key) {\n    if (!this.map.has(key)) return -1;\n    const val = this.map.get(key);\n    this.map.delete(key);\n    this.map.set(key, val);\n    return val;\n  }\n\n  put(key, value) {\n    if (this.map.has(key)) this.map.delete(key);\n    this.map.set(key, value);\n    if (this.map.size > this.capacity) {\n      const firstKey = this.map.keys().next().value;\n      this.map.delete(firstKey);\n    }\n  }\n}',
  aptitude: {}
};

let timerInterval = null;

document.addEventListener('DOMContentLoaded', () => {
  ParityNav.renderHeader(7);

  // Restore saved answers if any
  const savedAnswers = ParityStore.get('answers');
  if (savedAnswers) {
    answers = savedAnswers;
  }

  // Restore code textarea
  const codeInput = document.getElementById('code-input');
  if (codeInput && answers.coding) {
    codeInput.value = answers.coding;
    updateLineNumbers();
  }

  startGlobalTimer();
  renderMcqQuestion();
  renderAptQuestion();
});

/* ── GLOBAL TIMER LOGIC ── */
function startGlobalTimer() {
  const timerSlot = document.getElementById('nav-timer-slot');
  if (!timerSlot) return;

  let timerData = ParityStore.get('timer') || { totalSeconds: 1200, remainingSeconds: 1200 };
  let remaining = timerData.remainingSeconds;

  function updateTimerUI() {
    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;
    const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    let warnClass = '';
    if (remaining <= 60) warnClass = 'danger';
    else if (remaining <= 300) warnClass = 'warning';

    timerSlot.innerHTML = `<div class="nav-timer ${warnClass}">⏱ ${timeStr}</div>`;

    // Quiet toast notifications
    const toast = document.getElementById('timer-toast');
    const toastText = document.getElementById('toast-text');

    if (remaining === 300 && toast) {
      toastText.textContent = 'Notice: 5 minutes remaining in test duration.';
      toast.style.display = 'flex';
      setTimeout(() => toast.style.display = 'none', 6000);
    } else if (remaining === 60 && toast) {
      toastText.textContent = 'Warning: 1 minute remaining — test will auto-submit on zero.';
      toast.style.display = 'flex';
    }

    if (remaining <= 0) {
      clearInterval(timerInterval);
      submitFullAssessment();
    }
  }

  updateTimerUI();

  timerInterval = setInterval(() => {
    remaining--;
    timerData.remainingSeconds = remaining;
    ParityStore.set('timer', timerData);

    updateTimerUI();
  }, 1000);
}

/* ── SECTION SWITCHING ── */
function switchSection(secNum) {
  currentSection = secNum;

  document.querySelectorAll('.sec-tab').forEach((tab, idx) => {
    if (idx + 1 === secNum) tab.classList.add('active');
    else tab.classList.remove('active');
  });

  document.querySelectorAll('.section-container').forEach((sec, idx) => {
    if (idx + 1 === secNum) sec.style.display = 'block';
    else sec.style.display = 'none';
  });
}

/* ── SECTION 1: MCQ LOGIC ── */
function renderMcqQuestion() {
  const q = MCQ_QUESTIONS[currentMcqIdx];
  
  document.getElementById('mcq-q-num').textContent = `QUESTION ${currentMcqIdx + 1} OF ${MCQ_QUESTIONS.length}`;
  document.getElementById('mcq-question-text').textContent = q.question;

  const container = document.getElementById('mcq-options-container');
  container.innerHTML = '';

  const selectedOpt = answers.mcq[q.id];

  q.options.forEach((optText, optIdx) => {
    const row = document.createElement('div');
    row.className = `mcq-opt-row ${selectedOpt === optIdx ? 'selected' : ''}`;
    row.onclick = () => selectMcqOption(q.id, optIdx);

    const letter = String.fromCharCode(65 + optIdx);
    row.innerHTML = `
      <div class="opt-badge">${letter}</div>
      <div class="opt-text">${optText.substring(3)}</div>
    `;

    container.appendChild(row);
  });

  renderMcqDots();

  // Navigation button states
  document.getElementById('btn-mcq-prev').disabled = (currentMcqIdx === 0);
}

function selectMcqOption(qId, optIdx) {
  answers.mcq[qId] = optIdx;
  ParityStore.set('answers', answers);
  renderMcqQuestion();
}

function renderMcqDots() {
  const dotsContainer = document.getElementById('mcq-dots');
  dotsContainer.innerHTML = '';

  MCQ_QUESTIONS.forEach((q, idx) => {
    const dot = document.createElement('div');
    let state = '';
    if (answers.mcq[q.id] !== undefined) state = 'answered';
    if (idx === currentMcqIdx) state = 'active';

    dot.className = `q-dot-btn ${state}`;
    dot.onclick = () => {
      currentMcqIdx = idx;
      renderMcqQuestion();
    };
    dotsContainer.appendChild(dot);
  });
}

function navMcqQuestion(dir) {
  currentMcqIdx += dir;
  if (currentMcqIdx < 0) currentMcqIdx = 0;
  if (currentMcqIdx >= MCQ_QUESTIONS.length) {
    currentMcqIdx = MCQ_QUESTIONS.length - 1;
    switchSection(2); // Auto move to coding
    return;
  }
  renderMcqQuestion();
}

/* ── SECTION 2: CODING LOGIC ── */
function handleCodeInput(e) {
  answers.coding = e.target.value;
  ParityStore.set('answers', answers);
  updateLineNumbers();
}

function updateLineNumbers() {
  const codeInput = document.getElementById('code-input');
  const lineNumbers = document.getElementById('line-numbers');
  if (!codeInput || !lineNumbers) return;

  const lines = codeInput.value.split('\n').length;
  let nums = '';
  for (let i = 1; i <= Math.max(lines, 12); i++) {
    nums += `${i}<br/>`;
  }
  lineNumbers.innerHTML = nums;
}

function mockRunCode() {
  const status = document.getElementById('run-status');
  status.textContent = 'Executing...';
  status.className = 'mono-val text-amber';

  setTimeout(() => {
    status.textContent = '✅ All 12 Test Cases Passed (O(1) Memory Verified)';
    status.className = 'mono-val text-teal';
  }, 900);
}

/* ── SECTION 3: APTITUDE LOGIC ── */
function renderAptQuestion() {
  const q = APTITUDE_QUESTIONS[currentAptIdx];

  document.getElementById('apt-q-num').textContent = `LOGICAL REASONING — QUESTION ${currentAptIdx + 1} OF ${APTITUDE_QUESTIONS.length}`;
  document.getElementById('apt-question-text').textContent = q.question;

  const container = document.getElementById('apt-options-container');
  container.innerHTML = '';

  const selectedOpt = answers.aptitude[q.id];

  q.options.forEach((optText, optIdx) => {
    const row = document.createElement('div');
    row.className = `mcq-opt-row ${selectedOpt === optIdx ? 'selected' : ''}`;
    row.onclick = () => selectAptOption(q.id, optIdx);

    const letter = String.fromCharCode(65 + optIdx);
    row.innerHTML = `
      <div class="opt-badge">${letter}</div>
      <div class="opt-text">${optText.substring(3)}</div>
    `;

    container.appendChild(row);
  });

  renderAptDots();
}

function selectAptOption(qId, optIdx) {
  answers.aptitude[qId] = optIdx;
  ParityStore.set('answers', answers);
  renderAptQuestion();
}

function renderAptDots() {
  const dotsContainer = document.getElementById('apt-dots');
  dotsContainer.innerHTML = '';

  APTITUDE_QUESTIONS.forEach((q, idx) => {
    const dot = document.createElement('div');
    let state = '';
    if (answers.aptitude[q.id] !== undefined) state = 'answered';
    if (idx === currentAptIdx) state = 'active';

    dot.className = `q-dot-btn ${state}`;
    dot.onclick = () => {
      currentAptIdx = idx;
      renderAptQuestion();
    };
    dotsContainer.appendChild(dot);
  });
}

function navAptQuestion(dir) {
  currentAptIdx += dir;
  if (currentAptIdx < 0) currentAptIdx = 0;
  if (currentAptIdx >= APTITUDE_QUESTIONS.length) {
    currentAptIdx = APTITUDE_QUESTIONS.length - 1;
  }
  renderAptQuestion();
}

/* ── SUBMIT FULL ASSESSMENT ── */
function submitFullAssessment() {
  if (timerInterval) clearInterval(timerInterval);

  // Calculate scores on merit
  let mcqCorrect = 0;
  MCQ_QUESTIONS.forEach(q => {
    if (answers.mcq[q.id] === q.correct) mcqCorrect++;
  });
  const mcqPct = Math.round((mcqCorrect / MCQ_QUESTIONS.length) * 100);

  let aptCorrect = 0;
  APTITUDE_QUESTIONS.forEach(q => {
    if (answers.aptitude[q.id] === q.correct) aptCorrect++;
  });
  const aptPct = Math.round((aptCorrect / APTITUDE_QUESTIONS.length) * 100);

  // Coding score (mock evaluation based on length/structure)
  const codePct = answers.coding && answers.coding.length > 50 ? 90 : 70;

  // Composite calculation
  const composite = Math.round((mcqPct * 0.3) + (codePct * 0.4) + (aptPct * 0.3));

  let verdict = 'STRONG FIT';
  let verdictCode = 'teal';

  if (composite < 65) {
    verdict = 'NOT A FIT';
    verdictCode = 'danger';
  } else if (composite < 82) {
    verdict = 'FIT';
    verdictCode = 'amber';
  }

  const scores = {
    mcqScore: mcqPct,
    codingScore: codePct,
    aptitudeScore: aptPct,
    resumeMatchScore: 92,
    compositeScore: composite,
    verdict: verdict,
    verdictCode: verdictCode
  };

  ParityStore.set('scores', scores);

  // Navigate to Step 08 Evaluation
  window.location.href = '../08-evaluation/index.html';
}
