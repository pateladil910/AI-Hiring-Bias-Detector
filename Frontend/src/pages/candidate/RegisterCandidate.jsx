import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, UserPlus, ShieldCheck, CheckCircle2, Check, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const evaluatePassword = (pwd) => {
  if (!pwd) {
    return {
      checks: { length: false, hasLower: false, hasUpper: false, hasNumber: false, hasSpecial: false },
      score: 0,
      label: 'Enter password',
      color: 'var(--color-text-muted)',
    };
  }

  const checks = {
    length: pwd.length >= 8,
    hasLower: /[a-z]/.test(pwd),
    hasUpper: /[A-Z]/.test(pwd),
    hasNumber: /[0-9]/.test(pwd),
    hasSpecial: /[^A-Za-z0-9]/.test(pwd),
  };

  let score = 0;
  if (checks.length) score++;
  if (checks.hasLower && checks.hasUpper) score++;
  if (checks.hasNumber) score++;
  if (checks.hasSpecial) score++;

  let label = 'Weak';
  let color = '#ef4444';
  if (score === 2) {
    label = 'Fair';
    color = '#f59e0b';
  } else if (score === 3) {
    label = 'Good';
    color = '#3b82f6';
  } else if (score >= 4) {
    label = 'Strong';
    color = '#10b981';
  }

  return { checks, score, label, color };
};

export default function RegisterCandidate() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const pwdEval = useMemo(() => evaluatePassword(form.password), [form.password]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (pwdEval.score < 2) {
      setError('Password is too weak. Please combine uppercase, lowercase, numbers, or symbols.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        role: 'candidate',
      });
      // Redirect to candidate job board
      navigate('/candidate/jobs', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
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
            Candidate Shield Active
          </span>
        </div>

        {/* Center Spotlight: AI Candidate Assistant Callout */}
        <div style={{ maxWidth: 480, margin: '50px 0', zIndex: 2 }}>
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
            Protected Candidate Onboarding
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
            Showcase your skills. <span style={{ color: '#34d399' }}>Let your talent</span> speak for itself.
          </h2>

          <p style={{ fontSize: 14, color: '#cbd5e1', lineHeight: 1.6, marginBottom: 28 }}>
            FairHire shields your identity from screening bias. Upload your resume, take objective timed skill challenges, and get hired on validated engineering excellence.
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
              <div style={{ fontSize: 22, fontWeight: 900, color: '#34d399' }}>Anonymous</div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Zero Pre-Interview Leakage</div>
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
              <div style={{ fontSize: 22, fontWeight: 900, color: '#38bdf8' }}>Transparent</div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Auditable Scoring Formulas</div>
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
            <CheckCircle2 size={15} color="#34d399" /> Name Redacted
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <CheckCircle2 size={15} color="#34d399" /> Skills Verified
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <CheckCircle2 size={15} color="#34d399" /> 100% Free
          </span>
        </div>
      </div>

      {/* ── Right Form Panel (Sign Up Card) ─────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '40px 36px',
          maxWidth: 540,
          margin: '0 auto',
          width: '100%',
        }}
      >
        {/* Top Navigation Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
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
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#0f172a', margin: '0 0 8px', letterSpacing: '-0.03em' }}>
            Create Candidate Account
          </h1>
          <p style={{ fontSize: 14, color: '#64748b', margin: 0, lineHeight: 1.5 }}>
            Apply anonymously. Get evaluated purely on verified technical skill.
          </p>
        </div>

        {/* Form Card */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: 18,
            border: '1px solid #e2e8f0',
            padding: '28px 32px',
            boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.05)',
          }}
        >
          {error && (
            <div
              style={{
                marginBottom: 18,
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

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-first">First Name</label>
                <input
                  id="reg-first"
                  className="form-input"
                  type="text"
                  name="firstName"
                  placeholder="Jane"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-last">Last Name</label>
                <input
                  id="reg-last"
                  className="form-input"
                  type="text"
                  name="lastName"
                  placeholder="Doe"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">Email Address</label>
              <input
                id="reg-email"
                className="form-input"
                type="email"
                name="email"
                placeholder="jane@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
              <span style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>
                Your name and email will never be exposed to recruiters during screening.
              </span>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="reg-password"
                  className="form-input"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Min 8 characters"
                  value={form.password}
                  onChange={handleChange}
                  required
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
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {form.password && (
                <div style={{ marginTop: 8 }}>
                  {/* Visual 4-segment meter */}
                  <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                    {[1, 2, 3, 4].map((segment) => (
                      <div
                        key={segment}
                        style={{
                          flex: 1,
                          height: 4,
                          borderRadius: 2,
                          background: segment <= pwdEval.score ? pwdEval.color : 'rgba(255,255,255,0.08)',
                          transition: 'all 0.25s ease',
                        }}
                      />
                    ))}
                  </div>

                  {/* Strength Label */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, marginBottom: 8 }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>Password Strength:</span>
                    <span style={{ fontWeight: 600, color: pwdEval.color }}>{pwdEval.label}</span>
                  </div>

                  {/* Checklist */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '4px 10px',
                    padding: '8px 10px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 8,
                    fontSize: 11,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: pwdEval.checks.length ? '#10b981' : 'var(--color-text-muted)' }}>
                      <Check size={12} style={{ opacity: pwdEval.checks.length ? 1 : 0.3 }} />
                      8+ characters
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: (pwdEval.checks.hasLower && pwdEval.checks.hasUpper) ? '#10b981' : 'var(--color-text-muted)' }}>
                      <Check size={12} style={{ opacity: (pwdEval.checks.hasLower && pwdEval.checks.hasUpper) ? 1 : 0.3 }} />
                      Upper & lowercase
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: pwdEval.checks.hasNumber ? '#10b981' : 'var(--color-text-muted)' }}>
                      <Check size={12} style={{ opacity: pwdEval.checks.hasNumber ? 1 : 0.3 }} />
                      At least 1 number
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: pwdEval.checks.hasSpecial ? '#10b981' : 'var(--color-text-muted)' }}>
                      <Check size={12} style={{ opacity: pwdEval.checks.hasSpecial ? 1 : 0.3 }} />
                      Special character
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-confirm">Confirm Password</label>
              <input
                id="reg-confirm"
                className="form-input"
                type="password"
                name="confirmPassword"
                placeholder="Repeat password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            <button
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
                marginTop: 6,
              }}
            >
              {loading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : <UserPlus size={18} />}
              {loading ? 'Creating Account…' : 'Start Applying Blindly'}
            </button>
          </form>
        </div>

        <div style={{ marginTop: 24, textAlign: 'center', fontSize: 14 }}>
          <span style={{ color: '#475569' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#059669', fontWeight: 700 }}>
              Sign In
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}
