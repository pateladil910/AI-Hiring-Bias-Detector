let currentTab = 'login';

document.addEventListener('DOMContentLoaded', () => {
  ParityNav.renderHeader(2);
});

function switchAuthTab(tab) {
  currentTab = tab;

  const tabLogin = document.getElementById('tab-login');
  const tabSignup = document.getElementById('tab-signup');
  const title = document.getElementById('auth-title');
  const sub = document.getElementById('auth-sub');
  const groupName = document.getElementById('group-name');
  const groupConfirm = document.getElementById('group-confirm');
  const btnSubmit = document.getElementById('btn-submit');
  const errorBanner = document.getElementById('auth-error');

  errorBanner.style.display = 'none';

  if (tab === 'signup') {
    tabLogin.classList.remove('active');
    tabSignup.classList.add('active');
    title.textContent = 'Create Candidate Account';
    sub.textContent = 'Register to initialize your demographic-blind assessment record.';
    groupName.style.display = 'flex';
    groupConfirm.style.display = 'flex';
    btnSubmit.textContent = 'Create Candidate Account & Begin';
  } else {
    tabSignup.classList.remove('active');
    tabLogin.classList.add('active');
    title.textContent = 'Candidate Calibration Access';
    sub.textContent = 'Sign in to initialize demographic-blind assessment environment.';
    groupName.style.display = 'none';
    groupConfirm.style.display = 'none';
    btnSubmit.textContent = 'Initialize Assessment Session';
  }
}

function handleAuthSubmit(e) {
  e.preventDefault();
  
  const emailInput = document.getElementById('input-email');
  const passInput = document.getElementById('input-password');
  const nameInput = document.getElementById('input-name');
  const confirmInput = document.getElementById('input-confirm');
  const errorBanner = document.getElementById('auth-error');
  const errorText = document.getElementById('auth-error-text');

  errorBanner.style.display = 'none';

  const email = emailInput.value.trim();
  const pass = passInput.value.trim();
  const name = nameInput.value.trim();
  const confirm = confirmInput.value.trim();

  // Literal error states in interface's voice
  if (!email || !email.includes('@')) {
    showError('Valid candidate email address required (e.g. candidate@example.com).');
    emailInput.focus();
    return;
  }

  if (pass.length < 6) {
    showError('Password must contain at least 6 characters for session security.');
    passInput.focus();
    return;
  }

  if (currentTab === 'signup') {
    if (!name) {
      showError('Please enter candidate full name to create assessment record.');
      nameInput.focus();
      return;
    }
    if (pass !== confirm) {
      showError('Passwords do not match. Please re-enter matching passwords.');
      confirmInput.focus();
      return;
    }
  }

  // Store candidate in sessionStorage
  const candidate = {
    name: currentTab === 'signup' ? name : (email.split('@')[0].replace('.', ' ') || 'Alex Vance'),
    email: email
  };

  ParityStore.set('candidate', candidate);

  // Navigate to 03-upload-resume
  window.location.href = '../03-upload-resume/index.html';
}

function quickDemoAuth() {
  const candidate = { name: 'Alex Vance', email: 'alex.vance@example.com' };
  ParityStore.set('candidate', candidate);
  window.location.href = '../03-upload-resume/index.html';
}

function showError(msg) {
  const errorBanner = document.getElementById('auth-error');
  const errorText = document.getElementById('auth-error-text');
  errorText.textContent = msg;
  errorBanner.style.display = 'flex';
}
