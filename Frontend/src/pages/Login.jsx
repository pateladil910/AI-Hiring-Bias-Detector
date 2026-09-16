import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await login(form.email, form.password);
      if (['admin'].includes(user.role)) {
        navigate('/admin/dashboard', { replace: true });
      } else if (['hr_lead', 'recruiter', 'compliance'].includes(user.role)) {
        navigate('/recruiter/dashboard', { replace: true });
      } else {
        navigate('/candidate/status', { replace: true });
      }
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Login failed. Please check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Quick fill helper for development only
  const fillDevCreds = (role) => {
    if (role === 'recruiter') {
      setForm({ email: 'recruiter@fairhire.io', password: 'password123' });
    } else if (role === 'candidate') {
      setForm({ email: 'candidate@fairhire.io', password: 'password123' });
    } else if (role === 'admin') {
      setForm({ email: 'admin@fairhire.io', password: 'password123' });
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
      background: 'var(--color-bg)',
    }}>
      {/* ── Left Form Panel ─────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '48px 32px',
        maxWidth: 520,
        margin: '0 auto',
        width: '100%',
      }}>
        {/* Brand */}
        <div style={{ marginBottom: 32 }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontWeight: 700, fontSize: 22, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
              Fair<span style={{ color: 'var(--color-primary)' }}>Hire</span>
            </span>
          </Link>
          <h1 style={{ marginTop: 24, marginBottom: 8, fontSize: '1.75rem' }}>Sign in to your account</h1>
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', margin: 0 }}>
            Enter your credentials to access your portal
          </p>
        </div>

        {/* Form Card */}
        <div className="card" style={{ padding: 28, background: 'var(--color-surface)' }}>
          {error && (
            <div className="alert alert-error" style={{ marginBottom: 20 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Work or Personal Email</label>
              <input
                id="login-email"
                className="form-input"
                type="email"
                name="email"
                placeholder="you@company.com"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-password">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  className="form-input"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center',
                  }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
            >
              {loading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : <LogIn size={16} />}
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          {/* Dev Demo Helpers */}
          {import.meta.env.DEV && (
            <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px dashed var(--color-border)' }}>
              <span style={{ fontSize: 11, color: 'var(--color-text-muted)', display: 'block', marginBottom: 8, textAlign: 'center' }}>
                ⚡ DEV QUICK-FILL:
              </span>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                <button type="button" onClick={() => fillDevCreds('recruiter')} className="btn btn-ghost btn-sm" style={{ fontSize: 11, padding: '2px 8px' }}>
                  Recruiter
                </button>
                <button type="button" onClick={() => fillDevCreds('candidate')} className="btn btn-ghost btn-sm" style={{ fontSize: 11, padding: '2px 8px' }}>
                  Candidate
                </button>
                <button type="button" onClick={() => fillDevCreds('admin')} className="btn btn-ghost btn-sm" style={{ fontSize: 11, padding: '2px 8px' }}>
                  Admin
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Onboarding Links */}
        <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'center', fontSize: 14 }}>
          <span style={{ color: 'var(--color-text-secondary)' }}>
            Looking for jobs?{' '}
            <Link to="/register/candidate" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Create Candidate Account</Link>
          </span>
          <span style={{ color: 'var(--color-text-secondary)' }}>
            Hiring for your team?{' '}
            <Link to="/employers/request-access" style={{ color: 'var(--color-accent)', fontWeight: 600 }}>Request Employer Access</Link>
          </span>
        </div>
      </div>

      {/* ── Right Trust Visual Panel ────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(19,24,38,0.9) 0%, rgba(11,15,23,0.98) 100%)',
        borderLeft: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 48,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Glow */}
        <div style={{
          position: 'absolute', width: 400, height: 400,
          background: 'radial-gradient(circle, rgba(124,92,255,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Floating Glassmorphic Trust Card */}
        <div style={{
          maxWidth: 440,
          padding: 36,
          background: 'rgba(27, 34, 51, 0.7)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 20,
          boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
          position: 'relative',
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12, background: 'rgba(91,127,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)',
            marginBottom: 20,
          }}>
            <ShieldCheck size={26} />
          </div>

          <h3 style={{ fontSize: 20, marginBottom: 12, lineHeight: 1.3 }}>
            &ldquo;Every decision explained. Every override logged.&rdquo;
          </h3>

          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: 24 }}>
            FairHire delivers end-to-end recruitment equity: from real-time job description de-biasing to blind resume anonymization and standardized skill testing.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, color: 'var(--color-text-primary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle2 size={16} style={{ color: 'var(--color-success)' }} />
              Zero demographic variables in scoring
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle2 size={16} style={{ color: 'var(--color-success)' }} />
              Human review queue for borderline candidates
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle2 size={16} style={{ color: 'var(--color-success)' }} />
              Cryptographic-ready compliance audit logging
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
