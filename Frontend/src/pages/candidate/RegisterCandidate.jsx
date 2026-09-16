import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, UserPlus, ShieldCheck, CheckCircle2, Check } from 'lucide-react';
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
        <div style={{ marginBottom: 28 }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontWeight: 700, fontSize: 22, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
              Fair<span style={{ color: 'var(--color-primary)' }}>Hire</span>
            </span>
          </Link>
          <div className="badge badge-primary" style={{ display: 'inline-flex', marginTop: 16, marginBottom: 8, fontSize: 11 }}>
            Candidate Portal
          </div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: 8 }}>Create Candidate Account</h1>
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', margin: 0 }}>
            Apply anonymously. Get evaluated purely on verified technical skill.
          </p>
        </div>

        {/* Form Card */}
        <div className="card" style={{ padding: 28, background: 'var(--color-surface)' }}>
          {error && (
            <div className="alert alert-error" style={{ marginBottom: 20 }}>
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
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', marginTop: 6 }}
            >
              {loading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : <UserPlus size={16} />}
              {loading ? 'Creating Account…' : 'Start Applying Blindly'}
            </button>
          </form>
        </div>

        <div style={{ marginTop: 24, textAlign: 'center', fontSize: 14 }}>
          <span style={{ color: 'var(--color-text-secondary)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Sign In</Link>
          </span>
        </div>
      </div>

      {/* ── Right Candidate Trust Visual Panel ──────────────────────────────── */}
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
        <div style={{
          maxWidth: 440,
          padding: 36,
          background: 'rgba(27, 34, 51, 0.7)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 20,
          boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12, background: 'rgba(52,199,123,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-success)',
            marginBottom: 20,
          }}>
            <ShieldCheck size={26} />
          </div>

          <h3 style={{ fontSize: 20, marginBottom: 12 }}>
            Your Identity is Protected
          </h3>

          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: 24 }}>
            When you apply on FairHire, our automated parser redacts all identifying details before any human recruiter reviews your profile.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13, color: 'var(--color-text-primary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <CheckCircle2 size={16} style={{ color: 'var(--color-success)' }} />
              Name, gender, and age markers are stripped
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <CheckCircle2 size={16} style={{ color: 'var(--color-success)' }} />
              Assessed on standardized 30-min coding tests
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <CheckCircle2 size={16} style={{ color: 'var(--color-success)' }} />
              Full transparency on every verdict calculation
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
