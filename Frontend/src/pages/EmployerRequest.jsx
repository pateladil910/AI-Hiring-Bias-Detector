import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import axios from 'axios';

export default function EmployerRequest() {
  const [form, setForm] = useState({
    companyName: '',
    workEmail: '',
    companySize: '1-50',
    hiringVolume: '1-5',
    useCase: '',
  });

  const [submitted, setSubmitted] = useState(false);
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
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      await axios.post(`${apiUrl}/api/employers/request-access`, {
        companyName: form.companyName,
        workEmail: form.workEmail,
        companySize: form.companySize,
        useCase: form.useCase,
      });
      setSubmitted(true);
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to submit employer request. Please verify your company email.';
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
        maxWidth: 540,
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
          <div className="badge badge-primary" style={{ display: 'inline-flex', marginTop: 16, marginBottom: 8, fontSize: 11 }}>
            Enterprise Access Intake
          </div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: 8 }}>Request Employer Access</h1>
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', margin: 0 }}>
            Every organization is verified by our team to protect candidate anonymity.
          </p>
        </div>

        {/* Confirmation State */}
        {submitted ? (
          <div className="card" style={{ padding: 36, textAlign: 'center', background: 'var(--color-surface)' }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%', background: 'rgba(52,199,123,0.15)',
              color: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <CheckCircle2 size={32} />
            </div>
            <h3 style={{ fontSize: 20, marginBottom: 12 }}>Request Received</h3>
            <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: 24 }}>
              Thank you! Our compliance team is reviewing your organization details. Once verified, an invitation link will be dispatched to <strong>{form.workEmail}</strong> within 1 business day.
            </p>
            <Link to="/" className="btn btn-primary">
              Return to Homepage
            </Link>
          </div>
        ) : (
          /* Form Card */
          <div className="card" style={{ padding: 28, background: 'var(--color-surface)' }}>
            {error && (
              <div className="alert alert-error" style={{ marginBottom: 20 }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div className="form-group">
                <label className="form-label" htmlFor="company-name">Company / Organization Name</label>
                <input
                  id="company-name"
                  className="form-input"
                  type="text"
                  name="companyName"
                  placeholder="e.g. Acme Technologies Inc."
                  value={form.companyName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="work-email">Work Email (Corporate Domain)</label>
                <input
                  id="work-email"
                  className="form-input"
                  type="email"
                  name="workEmail"
                  placeholder="name@company.com"
                  value={form.workEmail}
                  onChange={handleChange}
                  required
                />
                <span style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>
                  Personal emails (@gmail, @yahoo) are not eligible for recruiter accounts.
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="company-size">Company Size</label>
                  <select
                    id="company-size"
                    className="form-input"
                    name="companySize"
                    value={form.companySize}
                    onChange={handleChange}
                  >
                    <option value="1-50">1–50 employees</option>
                    <option value="51-200">51–200 employees</option>
                    <option value="201-1000">201–1,000 employees</option>
                    <option value="1000+">1,000+ employees</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="hiring-volume">Monthly Hiring</label>
                  <select
                    id="hiring-volume"
                    className="form-input"
                    name="hiringVolume"
                    value={form.hiringVolume}
                    onChange={handleChange}
                  >
                    <option value="1-5">1–5 roles / mo</option>
                    <option value="5-20">5–20 roles / mo</option>
                    <option value="20+">20+ roles / mo</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="use-case">Hiring Focus & Diversity Goals (Optional)</label>
                <textarea
                  id="use-case"
                  className="form-input"
                  name="useCase"
                  rows={3}
                  placeholder="Briefly describe your recruiting goals or current pain points..."
                  value={form.useCase}
                  onChange={handleChange}
                  style={{ resize: 'none' }}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
              >
                {loading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : <ArrowRight size={16} />}
                {loading ? 'Submitting Request…' : 'Submit Access Request'}
              </button>
            </form>
          </div>
        )}

        <div style={{ marginTop: 24, textAlign: 'center', fontSize: 14 }}>
          <span style={{ color: 'var(--color-text-secondary)' }}>
            Already have an active account?{' '}
            <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Sign In</Link>
          </span>
        </div>
      </div>

      {/* ── Right Vetting Trust Panel ───────────────────────────────────────── */}
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
            width: 48, height: 48, borderRadius: 12, background: 'rgba(124,92,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent)',
            marginBottom: 20,
          }}>
            <Building2 size={26} />
          </div>

          <h3 style={{ fontSize: 20, marginBottom: 12 }}>
            Why We Vet Every Employer
          </h3>

          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: 24 }}>
            Candidate trust is our core foundation. We verify that every employer on FairHire is a legitimate enterprise committed to blind resume evaluation and objective skill assessments.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13, color: 'var(--color-text-primary)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <CheckCircle2 size={16} style={{ color: 'var(--color-success)', marginTop: 2, flexShrink: 0 }} />
              <span><strong>Domain Validation:</strong> Only verified company emails can post jobs.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <CheckCircle2 size={16} style={{ color: 'var(--color-success)', marginTop: 2, flexShrink: 0 }} />
              <span><strong>Blind Candidate Privacy:</strong> Candidates remain anonymous until the interview stage.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <CheckCircle2 size={16} style={{ color: 'var(--color-success)', marginTop: 2, flexShrink: 0 }} />
              <span><strong>Single-Use Invites:</strong> Secure, 72-hour expiring links for your team.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
