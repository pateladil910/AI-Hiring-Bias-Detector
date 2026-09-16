// Role-Aware Dynamic Sticky Navbar System
document.addEventListener('DOMContentLoaded', () => {
  renderDynamicNavbar();
  initNavbarScrollEffect();
});

function renderDynamicNavbar() {
  const navMenu = document.querySelector('.nav-menu');
  const navActions = document.querySelector('.nav-actions');
  if (!navMenu || !navActions) return;

  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  
  // Use auth.js function
  const user = typeof getUser === 'function' ? getUser() : null;
  const role = user ? user.role : null;

  // Clear existing menus
  navMenu.innerHTML = '';
  navActions.innerHTML = '';

  // 1. PUBLIC / GUEST MODE (Not Logged In)
  if (!role) {
    navMenu.innerHTML = `
      <li><a href="index.html" class="nav-link ${currentPath === 'index.html' ? 'active' : ''}">Home</a></li>
      <li><a href="about.html" class="nav-link ${currentPath === 'about.html' ? 'active' : ''}">About</a></li>
      <li><a href="features.html" class="nav-link ${currentPath === 'features.html' ? 'active' : ''}">Features</a></li>
      <li><a href="contact.html" class="nav-link ${currentPath === 'contact.html' ? 'active' : ''}">Contact</a></li>
    `;

    navActions.innerHTML = `
      <span class="badge badge-success">
        <span style="width:6px;height:6px;border-radius:50%;background:var(--primary);display:inline-block;"></span>
        EEOC Guard
      </span>
      <a href="login.html" class="btn btn-secondary" style="height:2.4rem;padding:0 1rem;font-size:0.85rem;">Sign In</a>
      <a href="signup.html" class="btn btn-primary" style="height:2.4rem;padding:0 1rem;font-size:0.85rem;">Sign Up</a>
      <button class="mobile-toggle" aria-label="Toggle Navigation">☰</button>
    `;
  }
  // 2. RECRUITER / ADMIN MODE (Logged In)
  else if (role === 'recruiter' || role === 'admin') {
    navMenu.innerHTML = `
      <li><a href="index.html" class="nav-link ${currentPath === 'index.html' ? 'active' : ''}">Home</a></li>
      <li><a href="recruiter-dashboard.html" class="nav-link ${currentPath === 'recruiter-dashboard.html' ? 'active' : ''}">📊 Recruiter Dashboard</a></li>
      <li><a href="bias-report.html" class="nav-link ${currentPath === 'bias-report.html' ? 'active' : ''}">🛡️ EEOC Audit</a></li>
    `;

    navActions.innerHTML = `
      <span class="badge badge-primary">💼 ${role === 'admin' ? 'Admin' : 'Recruiter'} Console</span>
      <button class="btn btn-secondary" onclick="handleUserSignOut()" style="height:2.4rem;padding:0 0.85rem;font-size:0.8rem;">
        Sign Out
      </button>
      <button class="mobile-toggle" aria-label="Toggle Navigation">☰</button>
    `;
  }
  // 3. CANDIDATE MODE (Logged In)
  else if (role === 'candidate') {
    navMenu.innerHTML = `
      <li><a href="index.html" class="nav-link ${currentPath === 'index.html' ? 'active' : ''}">Home</a></li>
      <li><a href="candidate-dashboard.html" class="nav-link ${currentPath === 'candidate-dashboard.html' ? 'active' : ''}">🎓 My Dashboard</a></li>
    `;

    navActions.innerHTML = `
      <span class="badge badge-success">🎓 Candidate Mode</span>
      <button class="btn btn-secondary" onclick="handleUserSignOut()" style="height:2.4rem;padding:0 0.85rem;font-size:0.8rem;">
        Sign Out
      </button>
      <button class="mobile-toggle" aria-label="Toggle Navigation">☰</button>
    `;
  }

  // Re-bind mobile navbar toggle
  const toggleBtn = document.querySelector('.mobile-toggle');
  if (toggleBtn) {
    toggleBtn.onclick = () => navMenu.classList.toggle('active');
  }
}

function handleUserSignOut() {
  if (typeof logout === 'function') {
    logout();
  } else {
    localStorage.removeItem('equihire_token');
    window.location.href = 'index.html';
  }
}

function initNavbarScrollEffect() {
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 15) {
        navbar.style.boxShadow = '0 6px 24px rgba(17, 100, 70, 0.12)';
        navbar.style.borderBottomColor = 'var(--border-dark)';
      } else {
        navbar.style.boxShadow = '0 4px 20px rgba(17, 100, 70, 0.05)';
        navbar.style.borderBottomColor = 'var(--border)';
      }
    });
  }
}
