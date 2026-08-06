import axios from 'axios';

// ─── Axios Instance ───────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// ─── Request Interceptor: Attach JWT ──────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response Interceptor: Handle 401 ────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  me: () => api.get('/api/auth/me'),
};

// ─── Jobs ─────────────────────────────────────────────────────────────────────
export const jobsAPI = {
  list: () => api.get('/api/jobs'),
  get: (id) => api.get(`/api/jobs/${id}`),
  create: (data) => api.post('/api/jobs', data),
  analyze: (id) => api.post(`/api/jobs/${id}/analyze`),  // Phase 1
  publish: (id) => api.patch(`/api/jobs/${id}/publish`), // Phase 1
};

// ─── Applications ─────────────────────────────────────────────────────────────
export const applicationsAPI = {
  apply: (jobId, formData) =>
    api.post(`/api/applications`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  get: (id) => api.get(`/api/applications/${id}`),
  listForJob: (jobId) => api.get(`/api/jobs/${jobId}/applications`),
};

// ─── Tests ───────────────────────────────────────────────────────────────────
export const testsAPI = {
  get: (id) => api.get(`/api/tests/${id}`),
  submit: (id, answers) => api.post(`/api/tests/${id}/submit`, { answers }),
};

// ─── Eligibility ──────────────────────────────────────────────────────────────
export const eligibilityAPI = {
  getVerdict: (applicationId) => api.get(`/api/eligibility/${applicationId}`),
  override: (id, reason) => api.patch(`/api/eligibility/${id}/override`, { reason }),
};

// ─── Audit ────────────────────────────────────────────────────────────────────
export const auditAPI = {
  list: (params) => api.get('/api/audit', { params }),
};

export default api;
