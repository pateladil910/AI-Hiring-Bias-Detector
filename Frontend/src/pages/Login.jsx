import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn, ShieldCheck, CheckCircle2, ArrowLeft } from 'lucide-react';
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
      if (user && user.emailVerified === false) {
        navigate('/verify-email', {
          replace: true,
          state: { email: user.email, unverified: true },
        });
        return;
      }

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
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        background: '#f8fafc',
      }}
    >
      {/* ── Left Visual Panel: AI Assistant & Candidate Evaluation ─────────── */}
      <div
        className="hidden lg:flex"
        style={{
          position: 'relative',
          overflow: 'hidden',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '48px 40px',
          backgroundImage: 'linear-gradient(to bottom, rgba(15, 23, 42, 0.72) 0%, rgba(15, 23, 42, 0.85) 60%, rgba(15, 23, 42, 0.95) 100%), url("/ai-candidate-assistant.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          color: '#ffffff',
        }}
      >
        {/* Top Floating Badge & Brand */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 2 }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)',
              }}
            >
              <ShieldCheck size={20} />
            </div>
            <span style={{ fontWeight: 800, fontSize: 20, color: '#ffffff', letterSpacing: '-0.02em' }}>
              Fair<span style={{ color: '#34d399' }}>Hire</span>
            </span>
          </Link>

          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 14px',
              borderRadius: 9999,
              background: 'rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              fontSize: 12,
              fontWeight: 600,
              color: '#a7f3d0',
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
            AI Neutrality Engine
          </span>
        </div>

        {/* Center Spotlight: AI Candidate Assistant Callout */}
        <div style={{ maxWidth: 480, margin: '60px 0', zIndex: 2 }}>
          <div
            style={{
              display: 'inline-block',
              padding: '4px 12px',
              borderRadius: 6,
              background: 'rgba(16, 185, 129, 0.2)',
              border: '1px solid rgba(52, 211, 153, 0.4)',
              color: '#6ee7b7',
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: 16,
            }}
          >
            Algorithmic Fairness Shield
          </div>

          <h2
            style={{
              fontSize: 'clamp(1.75rem, 3vw, 2.3rem)',
              fontWeight: 900,
              lineHeight: 1.25,
              color: '#ffffff',
              marginBottom: 16,
              textShadow: '0 2px 10px rgba(0,0,0,0.5)',
            }}
          >
            Every candidate evaluated on <span style={{ color: '#34d399' }}>pure merit</span>. Zero demographic bias.
          </h2>

          <p style={{ fontSize: 14, color: '#cbd5e1', lineHeight: 1.6, marginBottom: 28 }}>
            Our autonomous AI scanner strips personal markers, benchmarks coding submissions in isolated sandboxes, and verifies hiring neutrality before interview offers are finalized.
          </p>

          {/* Holographic Metric Badges */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div
              style={{
                padding: '14px 16px',
                borderRadius: 12,
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
              }}
            >
              <div style={{ fontSize: 22, fontWeight: 900, color: '#34d399' }}>100%</div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>PII Demographic Blind</div>
            </div>
            <div
              style={{
                padding: '14px 16px',
                borderRadius: 12,
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
              }}
            >
              <div style={{ fontSize: 22, fontWeight: 900, color: '#38bdf8' }}>EEOC 80%</div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Adverse Impact Safe</div>
            </div>
          </div>
        </div>

        {/* Bottom Feature List */}
        <div
          style={{
            zIndex: 2,
            padding: '18px 20px',
            borderRadius: 14,
            background: 'rgba(255, 255, 255, 0.06)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 12,
            color: '#e2e8f0',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <CheckCircle2 size={15} color="#34d399" /> Redacted Resumes
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <CheckCircle2 size={15} color="#34d399" /> Sandbox Tests
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <CheckCircle2 size={15} color="#34d399" /> Audit Immutable
          </span>
        </div>
      </div>

      {/* ── Right Form Panel (Sign In Card) ─────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '48px 36px',
          maxWidth: 520,
          margin: '0 auto',
          width: '100%',
        }}
      >
        {/* Top Navigation Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <Link to="/" className="lg:hidden" style={{ textDecoration: 'none' }}>
            <span style={{ fontWeight: 800, fontSize: 20, color: '#0f172a' }}>
              Fair<span style={{ color: '#10b981' }}>Hire</span>
            </span>
          </Link>
          <div className="hidden lg:block" />

          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              fontWeight: 600,
              color: '#475569',
              background: '#ffffff',
              padding: '7px 14px',
              borderRadius: 8,
              border: '1px solid #e2e8f0',
              textDecoration: 'none',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              transition: 'all 0.15s ease',
            }}
          >
            <ArrowLeft size={14} color="#64748b" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Title & Subtitle */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#0f172a', margin: '0 0 8px', letterSpacing: '-0.03em' }}>
            Sign in to your account
          </h1>
          <p style={{ fontSize: 14, color: '#64748b', margin: 0, lineHeight: 1.5 }}>
            Enter your email and password to access your role dashboard.
          </p>
        </div>

        {/* Form Card */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: 18,
            border: '1px solid #e2e8f0',
            padding: '32px',
            boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.05)',
          }}
        >
          {error && (
            <div
              style={{
                marginBottom: 20,
                padding: '12px 16px',
                borderRadius: 10,
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email" style={{ fontWeight: 600, fontSize: 13, color: '#334155', marginBottom: 6 }}>
                Work or Personal Email
              </label>
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
                style={{
                  height: 44,
                  borderRadius: 10,
                  border: '1px solid #cbd5e1',
                  padding: '0 14px',
                  fontSize: 14,
                  color: '#0f172a',
                  background: '#f8fafc',
                }}
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label className="form-label" htmlFor="login-password" style={{ fontWeight: 600, fontSize: 13, color: '#334155', margin: 0 }}>
                  Password
                </label>
                <Link to="/forgot-password" style={{ fontSize: 12, color: '#059669', fontWeight: 600 }}>
                  Forgot password?
                </Link>
              </div>

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
                  style={{
                    height: 44,
                    borderRadius: 10,
                    border: '1px solid #cbd5e1',
                    padding: '0 44px 0 14px',
                    fontSize: 14,
                    color: '#0f172a',
                    background: '#f8fafc',
                    width: '100%',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                height: 44,
                borderRadius: 10,
                background: '#10b981',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: 15,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
                transition: 'background 0.2s',
              }}
            >
              {loading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : <LogIn size={18} />}
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          {/* Dev Demo Helpers */}
          {import.meta.env.DEV && (
            <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px dashed #e2e8f0' }}>
              <span style={{ fontSize: 11, color: '#94a3b8', display: 'block', marginBottom: 8, textAlign: 'center', fontWeight: 600 }}>
                ⚡ DEV QUICK-FILL:
              </span>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={() => fillDevCreds('recruiter')}
                  style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6, border: '1px solid #cbd5e1', background: '#f8fafc', cursor: 'pointer', color: '#475569' }}
                >
                  Recruiter
                </button>
                <button
                  type="button"
                  onClick={() => fillDevCreds('candidate')}
                  style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6, border: '1px solid #cbd5e1', background: '#f8fafc', cursor: 'pointer', color: '#475569' }}
                >
                  Candidate
                </button>
                <button
                  type="button"
                  onClick={() => fillDevCreds('admin')}
                  style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6, border: '1px solid #cbd5e1', background: '#f8fafc', cursor: 'pointer', color: '#475569' }}
                >
                  Admin
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Onboarding Links */}
        <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'center', fontSize: 14 }}>
          <span style={{ color: '#475569' }}>
            Looking for jobs?{' '}
            <Link to="/register-candidate" style={{ color: '#059669', fontWeight: 700 }}>
              Create Candidate Account
            </Link>
          </span>
          <span style={{ color: '#475569' }}>
            Hiring for your organization?{' '}
            <Link to="/employer-request" style={{ color: '#0284c7', fontWeight: 700 }}>
              Request Employer Access
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}
