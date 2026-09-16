const DOMAINS = [
  { id: 'frontend', title: 'Frontend Engineering', desc: 'UI architecture, React/Vue/TS, Web Vitals, CSS layouts, and client-state management.' },
  { id: 'backend', title: 'Backend Engineering', desc: 'REST/GraphQL API design, database indexing, caching strategies, and server performance.' },
  { id: 'fullstack', title: 'Full Stack Engineering', desc: 'End-to-end web apps covering frontend interfaces, backend APIs, and SQL/NoSQL schemas.' },
  { id: 'java', title: 'Java Development', desc: 'Core Java 17+, Spring Boot microservices, JVM tuning, and enterprise concurrency.' },
  { id: 'python', title: 'Python Development', desc: 'Pythonic patterns, FastAPI/Django, async IO, data structures, and package ecosystems.' },
  { id: 'javascript', title: 'JavaScript / Node.js', desc: 'JS event loop, ESNext features, Node stream APIs, npm security, and asynchronous patterns.' },
  { id: 'data-analyst', title: 'Data Analyst', desc: 'SQL aggregations, data visualization, business metrics, Excel modeling, and ETL basics.' },
  { id: 'data-scientist', title: 'Data Scientist', desc: 'Statistical hypothesis testing, Pandas/Numpy data wrangling, regression, and predictive modeling.' },
  { id: 'ml', title: 'Machine Learning', desc: 'Deep learning frameworks (PyTorch/TF), feature engineering, model evaluation, and MLOps.' },
  { id: 'devops', title: 'DevOps & SRE', desc: 'CI/CD pipelines, Docker containerization, Kubernetes orchestration, and terraform IaC.' },
  { id: 'uiux', title: 'UI/UX Design', desc: 'User research, wireframing, design system tokens, usability testing, and accessibility compliance.' },
  { id: 'cybersecurity', title: 'Cyber Security', desc: 'OWASP Top 10 vulnerabilities, penetration testing, cryptography basics, and network security.' },
  { id: 'cloud', title: 'Cloud Architecture', desc: 'AWS/GCP infrastructure, IAM roles, serverless functions, VPC networking, and cost optimization.' }
];

let selectedDomain = null;

document.addEventListener('DOMContentLoaded', () => {
  ParityNav.renderHeader(5);
  renderDomainGrid();

  // Restore existing selection if any
  const savedDomain = ParityStore.get('domain');
  if (savedDomain && savedDomain.id) {
    selectDomain(savedDomain.id);
  } else {
    // Default select fullstack
    selectDomain('fullstack');
  }
});

function renderDomainGrid() {
  const container = document.getElementById('domain-grid');
  container.innerHTML = '';

  DOMAINS.forEach(dom => {
    const card = document.createElement('div');
    card.className = 'domain-card';
    card.id = `domain-card-${dom.id}`;
    card.onclick = () => selectDomain(dom.id);

    card.innerHTML = `
      <div>
        <h3 class="domain-title">${dom.title}</h3>
        <p class="domain-desc">${dom.desc}</p>
      </div>
      <div class="domain-tag">CALIBRATED SUITE</div>
    `;

    container.appendChild(card);
  });
}

function selectDomain(domainId) {
  const dom = DOMAINS.find(d => d.id === domainId);
  if (!dom) return;

  selectedDomain = dom;

  // Highlight card
  document.querySelectorAll('.domain-card').forEach(c => c.classList.remove('selected'));
  const targetCard = document.getElementById(`domain-card-${domainId}`);
  if (targetCard) targetCard.classList.add('selected');

  // Update footer bar
  const titleEl = document.getElementById('selected-title');
  const btnEl = document.getElementById('btn-continue');

  titleEl.textContent = dom.title;
  btnEl.disabled = false;
  btnEl.classList.remove('btn-disabled');
}

function confirmDomainAndContinue() {
  if (!selectedDomain) return;

  // Save to sessionStorage
  ParityStore.set('domain', selectedDomain);

  // Set default test config based on domain
  const testConfig = {
    domainId: selectedDomain.id,
    domainTitle: selectedDomain.title,
    mcqCount: 5,
    codingCount: 1,
    aptitudeCount: 3,
    totalTimeMinutes: 20
  };
  ParityStore.set('testConfig', testConfig);

  // Navigate to Step 06
  window.location.href = '../06-generate-test/index.html';
}
