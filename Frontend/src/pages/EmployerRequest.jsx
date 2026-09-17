import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Building2, ShieldCheck, CheckCircle2, ArrowRight, AlertTriangle, Check } from 'lucide-react';
import axios from 'axios';

const BLOCKED_DOMAINS = new Set([
  'gmail.com', 'googlemail.com', 'yahoo.com', 'ymail.com', 'rocketmail.com',
  'hotmail.com', 'outlook.com', 'live.com', 'msn.com',
  'icloud.com', 'me.com', 'mac.com',
  'aol.com', 'mail.com', 'proton.me', 'protonmail.com',
  'zoho.com', 'yandex.com', 'gmx.com', 'fastmail.com',
]);

const getEmailDomain = (email) => {
  if (!email || !email.includes('@')) return '';
  const parts = email.trim().toLowerCase().split('@');
  return parts[parts.length - 1];
};

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

  const emailDomain = useMemo(() => getEmailDomain(form.workEmail), [form.workEmail]);
  const isBlockedDomain = useMemo(() => BLOCKED_DOMAINS.has(emailDomain), [emailDomain]);
  const isCorporateDomain = useMemo(() => Boolean(emailDomain && emailDomain.includes('.') && !isBlockedDomain), [emailDomain, isBlockedDomain]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isBlockedDomain) {
      setError(`Free email providers (@${emailDomain}) are not permitted. Please provide an official company email address.`);
      return;
    }

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
                <div style={{ position: 'relative' }}>
                  <input
                    id="work-email"
                    className="form-input"
                    type="email"
                    name="workEmail"
                    placeholder="name@company.com"
                    value={form.workEmail}
                    onChange={handleChange}
                    required
                    style={{
                      borderColor: isBlockedDomain
                        ? 'var(--color-error, #ef4444)'
                        : isCorporateDomain
                        ? 'var(--color-success, #10b981)'
                        : undefined,
                      paddingRight: isCorporateDomain || isBlockedDomain ? 36 : undefined,
                    }}
                  />
                  {isCorporateDomain && (
                    <div style={{
                      position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                      color: 'var(--color-success, #10b981)', display: 'flex', alignItems: 'center', pointerEvents: 'none'
                    }}>
                      <Check size={16} />
                    </div>
                  )}
                  {isBlockedDomain && (
                    <div style={{
                      position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                      color: '#ef4444', display: 'flex', alignItems: 'center', pointerEvents: 'none'
                    }}>
                      <AlertTriangle size={16} />
                    </div>
                  )}
                </div>

                {/* Inline warning if consumer email provider */}
                {isBlockedDomain ? (
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 8,
                    padding: '8px 12px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: 8,
                    marginTop: 6,
                    color: '#ef4444',
                    fontSize: 12,
                    lineHeight: 1.4,
                  }}>
                    <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <strong>Consumer email domain detected (@{emailDomain}).</strong>
                      <div style={{ opacity: 0.9, marginTop: 2 }}>
                        Employer workspaces require an official corporate email (e.g. <code>name@{form.companyName ? form.companyName.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com' : 'company.com'}</code>).
                      </div>
                    </div>
                  </div>
                ) : isCorporateDomain ? (
                  <span style={{ fontSize: 11, color: 'var(--color-success, #10b981)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Check size={12} /> Company domain recognized: <strong>@{emailDomain}</strong>
                  </span>
                ) : (
                  <span style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>
                    Personal emails (@gmail, @yahoo, @hotmail) are not eligible for recruiter accounts.
                  </span>
                )}
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
                disabled={loading || isBlockedDomain}
                style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
              >
                {loading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : <ArrowRight size={16} />}
                {loading ? 'Submitting Request…' : isBlockedDomain ? 'Corporate Email Required' : 'Submit Access Request'}
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
      <div className="hidden lg:flex flex-col items-center justify-center p-12 bg-gradient-to-br from-emerald-50/80 via-teal-50/60 to-sky-50 border-l border-slate-200 relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-md p-8 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl shadow-xl relative z-10">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-200 mb-5">
            <Building2 size={26} />
          </div>

          <h3 className="text-xl font-bold text-slate-900 mb-3 leading-snug">
            Why We Vet Every Employer
          </h3>

          <p className="text-xs text-slate-600 leading-relaxed mb-6">
            Candidate trust is our core foundation. We verify that every employer on FairHire is a legitimate enterprise committed to blind resume evaluation and objective skill assessments.
          </p>

          <div className="space-y-3 text-xs font-medium text-slate-700">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Domain Validation:</strong> Only verified corporate email addresses can post roles.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Blind Candidate Privacy:</strong> Candidate demographics remain masked through evaluation.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Single-Use Invites:</strong> Secure, 72-hour expiring links ensure tight team governance.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
