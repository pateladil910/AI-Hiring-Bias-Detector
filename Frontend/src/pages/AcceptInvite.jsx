import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Key, Eye, EyeOff, ShieldCheck, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

export default function AcceptInvite() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setError('Missing invite token in URL.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await axios.post(`${apiUrl}/api/auth/accept-invite`, {
        token,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
      });

      // Save token if returned
      if (res.data.token) {
        localStorage.setItem('fh_token', res.data.token);
      }

      navigate('/recruiter/dashboard', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to activate recruiter account. The link may have expired.';
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
      <div className="card" style={{ maxWidth: 480, width: '100%', padding: 36, background: 'var(--color-surface)' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontWeight: 700, fontSize: 22, color: 'var(--color-text-primary)' }}>
              Fair<span style={{ color: 'var(--color-primary)' }}>Hire</span>
            </span>
          </Link>
          <div className="badge badge-primary" style={{ display: 'inline-flex', marginTop: 14, marginBottom: 8, fontSize: 11 }}>
            Recruiter Onboarding
          </div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: 6 }}>Set your Password</h1>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: 0 }}>
            Activate your organization recruiter account to begin publishing de-biased job listings.
          </p>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: 20 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="first-name">First Name</label>
              <input
                id="first-name"
                className="form-input"
                type="text"
                name="firstName"
                placeholder="Alex"
                value={form.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="last-name">Last Name</label>
              <input
                id="last-name"
                className="form-input"
                type="text"
                name="lastName"
                placeholder="Smith"
                value={form.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Create Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
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
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirm-password">Confirm Password</label>
            <input
              id="confirm-password"
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
            style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
          >
            {loading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : <Key size={16} />}
            {loading ? 'Activating Account…' : 'Activate Recruiter Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
