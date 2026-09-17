import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, UserPlus, ShieldCheck, CheckCircle2, ArrowLeft } from 'lucide-react';
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
        maxWidth: 500,
        margin: '0 auto',
        width: '100%',
      }}>
        {/* Brand Header & Back to Landing Button */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <Link to="/" style={{ textDecoration: 'none' }}>
              <span style={{ fontWeight: 700, fontSize: 22, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
                Fair<span style={{ color: 'var(--color-primary)' }}>Hire</span>
              </span>
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-700 bg-white hover:bg-emerald-50 px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs transition group cursor-pointer"
            >
              <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-0.5 text-slate-400 group-hover:text-emerald-600" />
              <span>Back to Home</span>
            </Link>
          </div>
          <div className="badge badge-primary" style={{ display: 'inline-flex', marginBottom: 8, fontSize: 11 }}>
            Candidate & Recruiter Onboarding
          </div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: 6 }}>Create your account</h1>
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', margin: 0 }}>
            Join the algorithmic fairness hiring ecosystem
          </p>
        </div>

        <div className="card" style={{ padding: 28 }}>
          {error && <div className="alert alert-error" style={{ marginBottom: 18 }}>{error}</div>}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--color-text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>

      {/* ── Right Trust Visual Panel ────────────────────────────────────────── */}
      <div className="hidden lg:flex flex-col items-center justify-center p-12 bg-gradient-to-br from-emerald-50/80 via-teal-50/60 to-sky-50 border-l border-slate-200 relative overflow-hidden">
        {/* Glow / Ambient Mesh */}
        <div className="absolute w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl pointer-events-none" />

        {/* Floating Glassmorphic Trust Card */}
        <div className="max-w-md p-8 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl shadow-xl relative z-10">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-200 mb-5">
            <ShieldCheck size={26} />
          </div>

          <h3 className="text-xl font-bold text-slate-900 mb-3 leading-snug">
            Protected Candidate Anonymity
          </h3>

          <p className="text-xs text-slate-600 leading-relaxed mb-6">
            When you apply on FairHire, your personally identifiable markers are automatically cloaked before recruiters review your skills, ensuring evaluation is 100% merit-based.
          </p>

          <div className="space-y-3 text-xs font-medium text-slate-700">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Demographic Shielding:</strong> Names, photos, emails, and addresses masked.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Standardized Testing:</strong> Objective MCQs and sandboxed algorithmic scoring.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Formula Transparency:</strong> Candidates see exact calculation breakdowns.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
