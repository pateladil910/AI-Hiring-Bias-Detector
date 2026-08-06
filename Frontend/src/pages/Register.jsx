import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ROLES = [
  { value: 'candidate',  label: 'Candidate — I\'m applying for jobs' },
  { value: 'recruiter',  label: 'Recruiter — I\'m hiring' },
  { value: 'hr_lead',    label: 'HR Lead — I manage the hiring team' },
  { value: 'compliance', label: 'Compliance Officer — I audit hiring decisions' },
];

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register } = useAuth();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: searchParams.get('role') || 'candidate',
    orgName: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Sync role from query param
  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam && ROLES.find((r) => r.value === roleParam)) {
      setForm((prev) => ({ ...prev, role: roleParam }));
    }
  }, [searchParams]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const isRecruiterSide = ['recruiter', 'hr_lead', 'compliance', 'admin'].includes(form.role);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
        ...(isRecruiterSide && form.orgName ? { orgName: form.orgName.trim() } : {}),
      };
      const user = await register(payload);
      if (['admin', 'hr_lead', 'recruiter', 'compliance'].includes(user.role)) {
        navigate('/recruiter/dashboard', { replace: true });
      } else {
        navigate('/candidate/status', { replace: true });
      }
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
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      background: 'var(--color-bg)',
    }}>
      <div style={{ width: '100%', maxWidth: 460 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontWeight: 700, fontSize: 22, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
              Fair<span style={{ color: 'var(--color-primary)' }}>Hire</span>
            </span>
          </Link>
          <h1 style={{ marginTop: 24, marginBottom: 6, fontSize: '1.5rem' }}>Create your account</h1>
          <p style={{ fontSize: 14, margin: 0 }}>Join the fair hiring platform</p>
        </div>

        <div className="card" style={{ padding: 32 }}>
          {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div>}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Role selector */}
            <div className="form-group">
              <label className="form-label" htmlFor="register-role">I am a…</label>
              <select
                id="register-role"
                className="form-select"
                name="role"
                value={form.role}
                onChange={handleChange}
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            {/* Name row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label" htmlFor="register-first">First name</label>
                <input id="register-first" className="form-input" type="text" name="firstName"
                  placeholder="Jane" value={form.firstName} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="register-last">Last name</label>
                <input id="register-last" className="form-input" type="text" name="lastName"
                  placeholder="Doe" value={form.lastName} onChange={handleChange} required />
              </div>
            </div>

            {/* Organisation (recruiter side only) */}
            {isRecruiterSide && (
              <div className="form-group">
                <label className="form-label" htmlFor="register-org">Organisation name</label>
                <input id="register-org" className="form-input" type="text" name="orgName"
                  placeholder="Acme Corp" value={form.orgName} onChange={handleChange} />
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="register-email">Email address</label>
              <input id="register-email" className="form-input" type="email" name="email"
                placeholder="you@company.com" value={form.email} onChange={handleChange}
                required autoComplete="email" />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="register-password">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="register-password"
                  className="form-input"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
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
              id="register-submit"
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
            >
              {loading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : <UserPlus size={16} />}
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--color-text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--color-primary)' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
