import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  AlertTriangle,
  Check,
  ArrowLeft,
  Lock,
  Sparkles,
  Users,
  Briefcase
} from 'lucide-react';
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
  const isCorporateDomain = useMemo(
    () => Boolean(emailDomain && emailDomain.includes('.') && !isBlockedDomain),
    [emailDomain, isBlockedDomain]
  );

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isBlockedDomain) {
      setError(`Free email providers (@${emailDomain}) are not permitted. Please provide an official corporate email address.`);
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
        hiringVolume: form.hiringVolume,
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
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        background: '#f8fafc',
      }}
    >
      {/* ── Left Visual Panel: Enterprise Vetting & Anti-Bias Ecosystem ─── */}
      <div
        className="hidden lg:flex"
        style={{
          position: 'relative',
          overflow: 'hidden',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '48px 40px',
          backgroundImage:
            'linear-gradient(to bottom, rgba(15, 23, 42, 0.78) 0%, rgba(15, 23, 42, 0.88) 60%, rgba(15, 23, 42, 0.96) 100%), url("/interview-hero-bg.jpg")',
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
              <Building2 size={20} />
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
            Enterprise Verification Gate
          </span>
        </div>

        {/* Center Spotlight: Enterprise Trust Callout */}
        <div style={{ maxWidth: 490, margin: '60px 0', zIndex: 2 }}>
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
            Vetted Employer Network
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
            Hire on verified capability. <span style={{ color: '#34d399' }}>Zero demographic bias.</span>
          </h2>

          <p style={{ fontSize: 14, color: '#cbd5e1', lineHeight: 1.6, marginBottom: 28 }}>
            FairHire empowers forward-thinking engineering and talent teams to assess talent objectively. We strictly vet every employer to protect candidate anonymity, prevent poaching, and guarantee audit-grade fairness.
          </p>

          {/* Holographic Trust & Metric Badges */}
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
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Corporate Domain Vetted</div>
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
              <div style={{ fontSize: 22, fontWeight: 900, color: '#38bdf8' }}>0% PII</div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Demographic Exposure</div>
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
              <div style={{ fontSize: 22, fontWeight: 900, color: '#a78bfa' }}>NYC 144</div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Audit-Ready Compliance</div>
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
              <div style={{ fontSize: 22, fontWeight: 900, color: '#f59e0b' }}>3.4x</div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Faster Quality Hiring</div>
            </div>
          </div>
        </div>

        {/* Bottom Feature Highlights */}
        <div
          style={{
            zIndex: 2,
            padding: '16px 20px',
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
            <CheckCircle2 size={15} color="#34d399" /> Blind Screening
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <CheckCircle2 size={15} color="#34d399" /> Sandboxed Code Benchmarks
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <CheckCircle2 size={15} color="#34d399" /> Immutable Audits
          </span>
        </div>
      </div>

      {/* ── Right Form Panel (Employer Request Intake Card) ─────────────── */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '48px 36px',
          maxWidth: 540,
          margin: '0 auto',
          width: '100%',
        }}
      >
        {/* Top Navigation Bar */}
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
            Back to Home
          </Link>
        </div>

        {/* Header Block */}
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 10px',
              borderRadius: 6,
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              color: '#065f46',
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: 10,
            }}
          >
            <ShieldCheck size={13} color="#059669" /> Enterprise Access Intake
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
            Request Employer Access
          </h1>
          <p style={{ fontSize: 14, color: '#64748b', margin: 0, lineHeight: 1.5 }}>
            Every organization is verified by our compliance team to protect candidate anonymity.
          </p>
        </div>

        {/* Confirmation State */}
        {submitted ? (
          <div
            style={{
              background: '#ffffff',
              borderRadius: 16,
              border: '1px solid #e2e8f0',
              padding: 36,
              textAlign: 'center',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)',
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: '#ecfdf5',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                border: '1px solid #a7f3d0',
              }}
            >
              <CheckCircle2 size={34} />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>
              Application Submitted Successfully
            </h3>
            <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6, marginBottom: 24 }}>
              Thank you! Our compliance team is verifying your organization credentials. Once approved, an enterprise invite link will be dispatched to <strong>{form.workEmail}</strong> within 1 business day.
            </p>
            <div
              style={{
                padding: 14,
                borderRadius: 10,
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                fontSize: 13,
                color: '#64748b',
                marginBottom: 24,
                textAlign: 'left',
              }}
            >
              <div style={{ fontWeight: 600, color: '#334155', marginBottom: 4 }}>Next Steps:</div>
              <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.5 }}>
                <li>Corporate domain DNS check & company registration verification.</li>
                <li>Single-use activation token generated (valid for 72 hours).</li>
                <li>Access to the blind applicant tracking and sandbox assessment hub.</li>
              </ul>
            </div>
            <Link
              to="/"
              className="btn btn-primary"
              style={{
                width: '100%',
                display: 'inline-flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '12px 20px',
                borderRadius: 10,
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Return to Homepage
            </Link>
          </div>
        ) : (
          /* Form Card */
          <div
            style={{
              background: '#ffffff',
              borderRadius: 16,
              border: '1px solid #e2e8f0',
              padding: 30,
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)',
            }}
          >
            {error && (
              <div
                className="alert alert-error"
                style={{
                  marginBottom: 20,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  padding: '12px 14px',
                  borderRadius: 10,
                  fontSize: 13,
                }}
              >
                <AlertTriangle size={17} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Company Name */}
              <div className="form-group">
                <label className="form-label" htmlFor="company-name" style={{ fontWeight: 600, color: '#334155', fontSize: 13 }}>
                  Company / Organization Name
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="company-name"
                    className="form-input"
                    type="text"
                    name="companyName"
                    placeholder="e.g. Acme Technologies Inc."
                    value={form.companyName}
                    onChange={handleChange}
                    required
                    style={{
                      borderRadius: 10,
                      padding: '10px 14px 10px 38px',
                      fontSize: 14,
                      border: '1px solid #cbd5e1',
                    }}
                  />
                  <Building2
                    size={17}
                    style={{
                      position: 'absolute',
                      left: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#94a3b8',
                      pointerEvents: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Work Email with Corporate Domain Detection */}
              <div className="form-group">
                <label className="form-label" htmlFor="work-email" style={{ fontWeight: 600, color: '#334155', fontSize: 13 }}>
                  Work Email (Corporate Domain)
                </label>
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
                      borderRadius: 10,
                      padding: '10px 36px 10px 38px',
                      fontSize: 14,
                      border: isBlockedDomain
                        ? '1px solid #ef4444'
                        : isCorporateDomain
                        ? '1px solid #10b981'
                        : '1px solid #cbd5e1',
                    }}
                  />
                  <Briefcase
                    size={17}
                    style={{
                      position: 'absolute',
                      left: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#94a3b8',
                      pointerEvents: 'none',
                    }}
                  />
                  {isCorporateDomain && (
                    <div
                      style={{
                        position: 'absolute',
                        right: 12,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#10b981',
                        display: 'flex',
                        alignItems: 'center',
                        pointerEvents: 'none',
                      }}
                    >
                      <Check size={17} />
                    </div>
                  )}
                  {isBlockedDomain && (
                    <div
                      style={{
                        position: 'absolute',
                        right: 12,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#ef4444',
                        display: 'flex',
                        alignItems: 'center',
                        pointerEvents: 'none',
                      }}
                    >
                      <AlertTriangle size={17} />
                    </div>
                  )}
                </div>

                {/* Inline Domain State Feedback */}
                {isBlockedDomain ? (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 8,
                      padding: '8px 12px',
                      background: 'rgba(239, 68, 68, 0.08)',
                      border: '1px solid rgba(239, 68, 68, 0.25)',
                      borderRadius: 8,
                      marginTop: 6,
                      color: '#dc2626',
                      fontSize: 12,
                      lineHeight: 1.4,
                    }}
                  >
                    <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <strong>Consumer email domain detected (@{emailDomain}).</strong>
                      <div style={{ opacity: 0.9, marginTop: 2 }}>
                        Employer workspaces require an official corporate email (e.g.{' '}
                        <code>
                          name@
                          {form.companyName
                            ? form.companyName.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com'
                            : 'company.com'}
                        </code>
                        ).
                      </div>
                    </div>
                  </div>
                ) : isCorporateDomain ? (
                  <span
                    style={{
                      fontSize: 12,
                      color: '#059669',
                      marginTop: 6,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      fontWeight: 500,
                    }}
                  >
                    <Check size={13} /> Corporate domain recognized: <strong>@{emailDomain}</strong>
                  </span>
                ) : (
                  <span style={{ fontSize: 12, color: '#94a3b8', marginTop: 6, display: 'block' }}>
                    Personal email providers (@gmail, @yahoo, @hotmail) are not eligible for recruiter accounts.
                  </span>
                )}
              </div>

              {/* Company Size & Monthly Hiring Volume */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="company-size" style={{ fontWeight: 600, color: '#334155', fontSize: 13 }}>
                    Company Size
                  </label>
                  <select
                    id="company-size"
                    className="form-input"
                    name="companySize"
                    value={form.companySize}
                    onChange={handleChange}
                    style={{ borderRadius: 10, padding: '9px 12px', fontSize: 14, border: '1px solid #cbd5e1' }}
                  >
                    <option value="1-50">1–50 employees</option>
                    <option value="51-200">51–200 employees</option>
                    <option value="201-1000">201–1,000 employees</option>
                    <option value="1000+">1,000+ employees</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="hiring-volume" style={{ fontWeight: 600, color: '#334155', fontSize: 13 }}>
                    Monthly Hiring
                  </label>
                  <select
                    id="hiring-volume"
                    className="form-input"
                    name="hiringVolume"
                    value={form.hiringVolume}
                    onChange={handleChange}
                    style={{ borderRadius: 10, padding: '9px 12px', fontSize: 14, border: '1px solid #cbd5e1' }}
                  >
                    <option value="1-5">1–5 roles / mo</option>
                    <option value="5-20">5–20 roles / mo</option>
                    <option value="20+">20+ roles / mo</option>
                  </select>
                </div>
              </div>

              {/* Hiring Focus & Diversity Goals */}
              <div className="form-group">
                <label className="form-label" htmlFor="use-case" style={{ fontWeight: 600, color: '#334155', fontSize: 13 }}>
                  Hiring Focus & Diversity Goals <span style={{ color: '#94a3b8', fontWeight: 400 }}>(Optional)</span>
                </label>
                <textarea
                  id="use-case"
                  className="form-input"
                  name="useCase"
                  rows={3}
                  placeholder="Briefly describe your hiring requirements, target engineering roles, or diversity initiatives..."
                  value={form.useCase}
                  onChange={handleChange}
                  style={{
                    resize: 'none',
                    borderRadius: 10,
                    padding: '10px 14px',
                    fontSize: 14,
                    border: '1px solid #cbd5e1',
                  }}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || isBlockedDomain}
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  marginTop: 6,
                  padding: '12px 18px',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                {loading ? (
                  <span className="spinner" style={{ width: 16, height: 16 }} />
                ) : (
                  <ArrowRight size={16} />
                )}
                {loading
                  ? 'Submitting Request…'
                  : isBlockedDomain
                  ? 'Corporate Email Required'
                  : 'Submit Access Request'}
              </button>
            </form>
          </div>
        )}

        {/* Footer Navigation Links */}
        <div style={{ marginTop: 24, textAlign: 'center', fontSize: 14 }}>
          <span style={{ color: '#64748b' }}>
            Already have an active account?{' '}
            <Link to="/login" style={{ color: '#10b981', fontWeight: 600, textDecoration: 'none' }}>
              Sign In
            </Link>
          </span>
          <div style={{ marginTop: 8 }}>
            <span style={{ color: '#94a3b8', fontSize: 13 }}>
              Looking to apply for jobs?{' '}
              <Link to="/register" style={{ color: '#475569', fontWeight: 600, textDecoration: 'none' }}>
                Create Candidate Profile
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
