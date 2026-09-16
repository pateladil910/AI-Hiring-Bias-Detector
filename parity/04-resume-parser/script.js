let currentResume = null;

document.addEventListener('DOMContentLoaded', () => {
  ParityNav.renderHeader(4);
  
  // Fetch resume data from sessionStorage
  const resumeData = ParityStore.get('resume');
  if (resumeData) {
    currentResume = resumeData.parsed;
  } else {
    // Fallback defaults
    currentResume = {
      name: 'Alex Vance',
      email: 'alex.vance@example.com',
      phone: '+1 (555) 234-8901',
      skills: ['React', 'TypeScript', 'Node.js', 'System Architecture', 'PostgreSQL', 'GraphQL', 'AWS', 'Docker'],
      experience: [
        { role: 'Senior Full Stack Engineer', company: 'Apex Tech', period: '2021 – Present', description: 'Architected high-throughput React/Node microservices handling 2M daily requests.' },
        { role: 'Software Engineer', company: 'Nexus Systems', period: '2018 – 2021', description: 'Developed TypeScript UI design system and REST APIs.' }
      ],
      education: 'B.S. in Computer Science — State University (2018)'
    };
  }

  startLiteralParsingSimulation();
});

function startLiteralParsingSimulation() {
  const procView = document.getElementById('processing-view');
  const resView = document.getElementById('result-view');
  const percentEl = document.getElementById('proc-percent');
  const logContainer = document.getElementById('proc-log');

  const literalLogs = [
    "[0.10s] Opening binary stream...",
    "[0.35s] Stripping demographic header blocks...",
    "[0.60s] Extracting named skill entities...",
    "[0.85s] Structuring experience timeline...",
    "[1.10s] Finalizing profile readout payload."
  ];

  let step = 0;
  const interval = setInterval(() => {
    step++;
    const pct = Math.min(step * 20, 100);
    percentEl.textContent = `${pct}%`;

    const newLine = document.createElement('div');
    newLine.className = 'log-line active';
    newLine.textContent = literalLogs[step - 1] || literalLogs[literalLogs.length - 1];
    logContainer.appendChild(newLine);

    if (step >= 5) {
      clearInterval(interval);
      setTimeout(() => {
        procView.style.display = 'none';
        resView.style.display = 'block';
        renderParsedData();
      }, 400);
    }
  }, 300);
}

function renderParsedData() {
  document.getElementById('val-name').value = currentResume.name;
  document.getElementById('val-email').value = currentResume.email;
  document.getElementById('val-phone').value = currentResume.phone || '+1 (555) 234-8901';
  document.getElementById('val-education').value = currentResume.education || 'B.S. in Computer Science (2018)';

  renderSkillTags();
  renderExperienceTimeline();
}

function renderSkillTags() {
  const container = document.getElementById('skills-container');
  container.innerHTML = '';

  currentResume.skills.forEach((skill, idx) => {
    const tag = document.createElement('span');
    tag.className = 'skill-tag-item';
    tag.innerHTML = `
      ${skill}
      <button class="skill-remove-btn" onclick="removeSkill(${idx})">×</button>
    `;
    container.appendChild(tag);
  });
}

function removeSkill(idx) {
  currentResume.skills.splice(idx, 1);
  renderSkillTags();
}

function addSkillPrompt() {
  const newSkill = prompt('Enter additional technical skill (e.g. Kubernetes, Python):');
  if (newSkill && newSkill.trim()) {
    currentResume.skills.push(newSkill.trim());
    renderSkillTags();
  }
}

function renderExperienceTimeline() {
  const container = document.getElementById('experience-container');
  container.innerHTML = '';

  currentResume.experience.forEach(exp => {
    const item = document.createElement('div');
    item.className = 'timeline-item';
    item.innerHTML = `
      <div class="t-role">${exp.role}</div>
      <div class="t-meta">${exp.company} · ${exp.period}</div>
      <div class="t-desc">${exp.description}</div>
    `;
    container.appendChild(item);
  });
}

function editSection(sec) {
  alert(`Editing section: ${sec}. You can edit fields directly in the text boxes.`);
}

function saveParsedAndContinue() {
  // Update resume in sessionStorage
  currentResume.name = document.getElementById('val-name').value;
  currentResume.email = document.getElementById('val-email').value;
  currentResume.phone = document.getElementById('val-phone').value;
  currentResume.education = document.getElementById('val-education').value;

  const resumeData = ParityStore.get('resume') || {};
  resumeData.parsed = currentResume;
  ParityStore.set('resume', resumeData);

  // Also update candidate name if changed
  const candidate = ParityStore.get('candidate') || {};
  candidate.name = currentResume.name;
  candidate.email = currentResume.email;
  ParityStore.set('candidate', candidate);

  // Navigate to step 05
  window.location.href = '../05-select-domain/index.html';
}
