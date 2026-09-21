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
  Briefcase,
  Sparkles,
  Lock,
  Scale,
  Zap,
  EyeOff
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
      {/* ── Left Visual Panel: Modern High-Tech AI Hiring Intelligence ─── */}
      <div
        className="hidden lg:flex"
        style={{
          position: 'relative',
          overflow: 'hidden',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '36px 40px',
          backgroundImage:
            'linear-gradient(to bottom, rgba(15, 23, 42, 0.72) 0%, rgba(15, 23, 42, 0.82) 50%, rgba(15, 23, 42, 0.95) 100%), url("/enterprise-hiring-ai.jpg")',
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
                width: 38,
                height: 38,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
              }}
            >
              <Building2 size={22} />
            </div>
            <span style={{ fontWeight: 800, fontSize: 21, color: '#ffffff', letterSpacing: '-0.02em' }}>
              Fair<span style={{ color: '#34d399' }}>Hire</span>
            </span>
          </Link>

          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              padding: '6px 14px',
              borderRadius: 9999,
              background: 'rgba(16, 185, 129, 0.15)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(52, 211, 153, 0.35)',
              fontSize: 12,
              fontWeight: 600,
              color: '#a7f3d0',
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #34d399' }} />
            Enterprise Verification Gate
          </span>
        </div>

        {/* Center Spotlight: Enterprise Trust Callout */}
        <div style={{ maxWidth: 500, margin: '30px 0', zIndex: 2 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 12px',
              borderRadius: 6,
              background: 'rgba(16, 185, 129, 0.2)',
              border: '1px solid rgba(52, 211, 153, 0.45)',
              color: '#6ee7b7',
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: 14,
            }}
          >
            <Sparkles size={12} />
            Vetted Employer Network
          </div>

          <h2
            style={{
              fontSize: 'clamp(1.75rem, 2.8vw, 2.35rem)',
              fontWeight: 900,
              lineHeight: 1.22,
              color: '#ffffff',
              marginBottom: 14,
              textShadow: '0 2px 12px rgba(0,0,0,0.6)',
            }}
          >
            Hire on verified capability. <br />
            <span style={{ color: '#34d399' }}>Zero demographic bias.</span>
          </h2>

          <p style={{ fontSize: 13.5, color: '#cbd5e1', lineHeight: 1.6, marginBottom: 24 }}>
            FairHire gives enterprise engineering and talent teams autonomous, blind candidate screening. We rigorously verify corporate domains to ensure evaluation integrity and protect candidate privacy.
          </p>

          {/* Holographic Trust & Metric Badges */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div
              style={{
                padding: '12px 16px',
                borderRadius: 12,
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.16)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontSize: 22, fontWeight: 900, color: '#34d399' }}>100%</span>
                <ShieldCheck size={16} color="#34d399" />
              </div>
              <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 2, fontWeight: 500 }}>
                Corporate Domain Vetted
              </div>
            </div>

            <div
              style={{
                padding: '12px 16px',
                borderRadius: 12,
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.16)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontSize: 22, fontWeight: 900, color: '#38bdf8' }}>0% PII</span>
                <EyeOff size={16} color="#38bdf8" />
              </div>
              <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 2, fontWeight: 500 }}>
                Demographic Exposure
              </div>
            </div>

            <div
              style={{
                padding: '12px 16px',
                borderRadius: 12,
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.16)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontSize: 22, fontWeight: 900, color: '#a78bfa' }}>NYC 144</span>
                <Scale size={16} color="#a78bfa" />
              </div>
              <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 2, fontWeight: 500 }}>
                Audit-Ready Compliance
              </div>
            </div>

            <div
              style={{
                padding: '12px 16px',
                borderRadius: 12,
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.16)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontSize: 22, fontWeight: 900, color: '#f59e0b' }}>3.4x</span>
                <Zap size={16} color="#f59e0b" />
              </div>
              <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 2, fontWeight: 500 }}>
                Faster Quality Pipeline
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Feature Highlights */}
        <div
          style={{
            zIndex: 2,
            padding: '12px 18px',
            borderRadius: 12,
            background: 'rgba(255, 255, 255, 0.06)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 11.5,
            color: '#e2e8f0',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <CheckCircle2 size={14} color="#34d399" /> Blind Screening
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <CheckCircle2 size={14} color="#34d399" /> Sandboxed Tests
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <CheckCircle2 size={14} color="#34d399" /> Immutable Audits
          </span>
        </div>
      </div>

      {/* ── Right Form Panel (Employer Request Intake Card) ─────────────── */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '28px 32px',
          maxWidth: 520,
          margin: '0 auto',
          width: '100%',
        }}
      >
        {/* Top Navigation Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
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
              fontSize: 12.5,
              fontWeight: 600,
              color: '#475569',
              background: '#ffffff',
              padding: '6px 12px',
              borderRadius: 8,
              border: '1px solid #e2e8f0',
              textDecoration: 'none',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              transition: 'all 0.15s ease',
            }}
          >
            <ArrowLeft size={13} color="#64748b" />
            Back to Home
          </Link>
        </div>

        {/* Header Block */}
        <div style={{ marginBottom: 18 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '3px 9px',
              borderRadius: 6,
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              color: '#065f46',
              fontSize: 10.5,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: 8,
            }}
          >
            <ShieldCheck size={12} color="#059669" /> Enterprise Access Intake
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
            Request Employer Access
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: 0, lineHeight: 1.45 }}>
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
              padding: 32,
              textAlign: 'center',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)',
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: '#ecfdf5',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                border: '1px solid #a7f3d0',
              }}
            >
              <CheckCircle2 size={32} />
            </div>
            <h3 style={{ fontSize: 19, fontWeight: 800, color: '#0f172a', marginBottom: 10 }}>
              Application Submitted Successfully
            </h3>
            <p style={{ fontSize: 13.5, color: '#475569', lineHeight: 1.55, marginBottom: 20 }}>
              Thank you! Our compliance team is verifying your organization credentials. Once approved, an enterprise invite link will be dispatched to <strong>{form.workEmail}</strong> within 1 business day.
            </p>
            <div
              style={{
                padding: 12,
                borderRadius: 10,
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                fontSize: 12.5,
                color: '#64748b',
                marginBottom: 20,
                textAlign: 'left',
              }}
            >
              <div style={{ fontWeight: 600, color: '#334155', marginBottom: 4 }}>Next Steps:</div>
              <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.45 }}>
                <li>Corporate domain DNS check & company verification.</li>
                <li>Single-use activation token generated (valid for 72 hours).</li>
                <li>Access to the blind candidate assessment hub.</li>
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
                padding: '10px 18px',
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
              padding: '24px 26px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)',
            }}
          >
            {error && (
              <div
                className="alert alert-error"
                style={{
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 8,
                  padding: '10px 12px',
                  borderRadius: 8,
                  fontSize: 12.5,
                }}
              >
                <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Company Name */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="company-name" style={{ fontWeight: 600, color: '#334155', fontSize: 12.5, marginBottom: 5 }}>
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
                      borderRadius: 9,
                      padding: '9px 12px 9px 36px',
                      fontSize: 13.5,
                      border: '1px solid #cbd5e1',
                    }}
                  />
                  <Building2
                    size={16}
                    style={{
                      position: 'absolute',
                      left: 11,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#94a3b8',
                      pointerEvents: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Work Email with Corporate Domain Detection */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="work-email" style={{ fontWeight: 600, color: '#334155', fontSize: 12.5, marginBottom: 5 }}>
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
                      borderRadius: 9,
                      padding: '9px 34px 9px 36px',
                      fontSize: 13.5,
                      border: isBlockedDomain
                        ? '1px solid #ef4444'
                        : isCorporateDomain
                        ? '1px solid #10b981'
                        : '1px solid #cbd5e1',
                    }}
                  />
                  <Briefcase
                    size={16}
                    style={{
                      position: 'absolute',
                      left: 11,
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
                        right: 11,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#10b981',
                        display: 'flex',
                        alignItems: 'center',
                        pointerEvents: 'none',
                      }}
                    >
                      <Check size={16} />
                    </div>
                  )}
                  {isBlockedDomain && (
                    <div
                      style={{
                        position: 'absolute',
                        right: 11,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#ef4444',
                        display: 'flex',
                        alignItems: 'center',
                        pointerEvents: 'none',
                      }}
                    >
                      <AlertTriangle size={16} />
                    </div>
                  )}
                </div>

                {/* Inline Domain State Feedback */}
                {isBlockedDomain ? (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 7,
                      padding: '7px 10px',
                      background: 'rgba(239, 68, 68, 0.08)',
                      border: '1px solid rgba(239, 68, 68, 0.25)',
                      borderRadius: 7,
                      marginTop: 5,
                      color: '#dc2626',
                      fontSize: 11.5,
                      lineHeight: 1.35,
                    }}
                  >
                    <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                    <div>
                      <strong>Consumer email (@{emailDomain}) blocked.</strong>
                      <div style={{ opacity: 0.9, marginTop: 1 }}>
                        Corporate email required (e.g.{' '}
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
                      fontSize: 11.5,
                      color: '#059669',
                      marginTop: 4,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      fontWeight: 500,
                    }}
                  >
                    <Check size={12} /> Corporate domain recognized: <strong>@{emailDomain}</strong>
                  </span>
                ) : (
                  <span style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 4, display: 'block' }}>
                    Personal emails (@gmail, @yahoo) are not eligible for recruiter accounts.
                  </span>
                )}
              </div>

              {/* Company Size & Monthly Hiring Volume */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="company-size" style={{ fontWeight: 600, color: '#334155', fontSize: 12.5, marginBottom: 5 }}>
                    Company Size
                  </label>
                  <select
                    id="company-size"
                    className="form-input"
                    name="companySize"
                    value={form.companySize}
                    onChange={handleChange}
                    style={{ borderRadius: 9, padding: '8px 10px', fontSize: 13.5, border: '1px solid #cbd5e1' }}
                  >
                    <option value="1-50">1–50 employees</option>
                    <option value="51-200">51–200 employees</option>
                    <option value="201-1000">201–1,000 employees</option>
                    <option value="1000+">1,000+ employees</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="hiring-volume" style={{ fontWeight: 600, color: '#334155', fontSize: 12.5, marginBottom: 5 }}>
                    Monthly Hiring
                  </label>
                  <select
                    id="hiring-volume"
                    className="form-input"
                    name="hiringVolume"
                    value={form.hiringVolume}
                    onChange={handleChange}
                    style={{ borderRadius: 9, padding: '8px 10px', fontSize: 13.5, border: '1px solid #cbd5e1' }}
                  >
                    <option value="1-5">1–5 roles / mo</option>
                    <option value="5-20">5–20 roles / mo</option>
                    <option value="20+">20+ roles / mo</option>
                  </select>
                </div>
              </div>

              {/* Hiring Focus & Diversity Goals */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="use-case" style={{ fontWeight: 600, color: '#334155', fontSize: 12.5, marginBottom: 5 }}>
                  Hiring Goals <span style={{ color: '#94a3b8', fontWeight: 400 }}>(Optional)</span>
                </label>
                <textarea
                  id="use-case"
                  className="form-input"
                  name="useCase"
                  rows={2}
                  placeholder="Briefly describe key roles or diversity screening goals..."
                  value={form.useCase}
                  onChange={handleChange}
                  style={{
                    resize: 'none',
                    borderRadius: 9,
                    padding: '8px 12px',
                    fontSize: 13,
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
                  marginTop: 4,
                  padding: '11px 16px',
                  borderRadius: 9,
                  fontSize: 13.5,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                {loading ? (
                  <span className="spinner" style={{ width: 15, height: 15 }} />
                ) : (
                  <ArrowRight size={15} />
                )}
                {loading
                  ? 'Submitting Request…'
                  : isBlockedDomain
                  ? 'Corporate Email Required'
                  : 'Submit Access Request'}
              </button>

              {/* Trust Badges */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 12,
                  fontSize: 11,
                  color: '#94a3b8',
                  marginTop: 2,
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Lock size={12} color="#10b981" /> 256-Bit SSL
                </span>
                <span>•</span>
                <span>⚡ 24h Review</span>
                <span>•</span>
                <span>🛡️ Zero Data Selling</span>
              </div>
            </form>
          </div>
        )}

        {/* Footer Navigation Links */}
        <div style={{ marginTop: 18, textAlign: 'center', fontSize: 13 }}>
          <span style={{ color: '#64748b' }}>
            Already have an active account?{' '}
            <Link to="/login" style={{ color: '#10b981', fontWeight: 600, textDecoration: 'none' }}>
              Sign In
            </Link>
          </span>
          <div style={{ marginTop: 6 }}>
            <span style={{ color: '#94a3b8', fontSize: 12 }}>
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
