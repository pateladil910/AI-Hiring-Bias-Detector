// Utility & Persistence Manager
const AppStore = {
  get(key, fallback = null) {
    try {
      const data = sessionStorage.getItem(`hbd_${key}`);
      return data ? JSON.parse(data) : fallback;
    } catch (e) {
      console.warn('Storage read error:', e);
      return fallback;
    }
  },

  set(key, val) {
    try {
      sessionStorage.setItem(`hbd_${key}`, JSON.stringify(val));
    } catch (e) {
      console.warn('Storage write error:', e);
    }
  },

  clear() {
    sessionStorage.clear();
  }
};

// UI Helper: Toast Notification
function showToast(message, type = 'info') {
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;flex-direction:column;gap:10px;';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = `badge badge-${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'primary'} animate-slide-up`;
  toast.style.cssText = 'padding:12px 18px;font-size:14px;box-shadow:0 8px 24px rgba(0,0,0,0.12);border-radius:10px;';
  toast.textContent = message;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 4000);
}

// Selector helper
function $(selector) {
  return document.querySelector(selector);
}

function $$(selector) {
  return document.querySelectorAll(selector);
}
