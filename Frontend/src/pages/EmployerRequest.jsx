import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Building2,
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
  EyeOff,
  Clock,
  ChevronRight,
  Shield,
  FileCheck
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
        background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
        color: '#0f172a',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* ── Enterprise Header (Consistent Brand Logo Across All Pages) ─── */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '0 24px',
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Exact Brand Logo matching Landing & Auth */}
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              textDecoration: 'none',
              color: '#0f172a',
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.28)',
              }}
            >
              <ShieldCheck size={22} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.03em' }}>
                Fair<span style={{ color: '#059669' }}>Hire</span>
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  background: '#ecfdf5',
                  color: '#065f46',
                  border: '1px solid #a7f3d0',
                  padding: '2px 8px',
                  borderRadius: 6,
                }}
              >
                Enterprise
              </span>
            </div>
          </Link>

          {/* Right Action Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span className="hidden sm:inline" style={{ fontSize: 13, color: '#64748b' }}>
              Already registered?{' '}
              <Link to="/login" style={{ color: '#059669', fontWeight: 600, textDecoration: 'none' }}>
                Sign In
              </Link>
            </span>
            <Link
              to="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 13,
                fontWeight: 600,
                color: '#334155',
                background: '#ffffff',
                padding: '7px 14px',
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                textDecoration: 'none',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                transition: 'all 0.15s ease',
              }}
            >
              <ArrowLeft size={14} color="#64748b" />
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* ── Page Body ─── */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '36px 24px 60px' }}>
        {/* Top Hero Headline (Distinct from Login) */}
        <div style={{ textAlign: 'center', maxWidth: 760, margin: '0 auto 36px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 14px',
              borderRadius: 9999,
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              color: '#065f46',
              fontSize: 12,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: 14,
            }}
          >
            <Sparkles size={13} color="#059669" />
            Vetted Corporate Employer Intake
          </div>

          <h1
            style={{
              fontSize: 'clamp(1.85rem, 3.2vw, 2.6rem)',
              fontWeight: 900,
              color: '#0f172a',
              letterSpacing: '-0.03em',
              lineHeight: 1.2,
              margin: '0 0 12px 0',
            }}
          >
            Request Your Employer Workspace
          </h1>

          <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.6, margin: 0 }}>
            Deploy automated demographic redaction, live code sandboxing, and NYC Local Law 144 compliance audits across your talent pipeline. Every corporate account is verified within 24 hours.
          </p>
        </div>

        {/* ── Submitted Confirmation State ─── */}
        {submitted ? (
          <div
            style={{
              maxWidth: 640,
              margin: '0 auto',
              background: '#ffffff',
              borderRadius: 20,
              border: '1px solid #e2e8f0',
              padding: 44,
              textAlign: 'center',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.02)',
            }}
          >
            <div
              style={{
                width: 68,
                height: 68,
                borderRadius: '50%',
                background: '#ecfdf5',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                border: '1px solid #a7f3d0',
                boxShadow: '0 8px 20px rgba(16, 185, 129, 0.2)',
              }}
            >
              <CheckCircle2 size={38} />
            </div>

            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>
              Enterprise Request Received
            </h2>

            <p style={{ fontSize: 14.5, color: '#475569', lineHeight: 1.6, marginBottom: 26 }}>
              Our compliance team has received the intake request for <strong>{form.companyName || 'your organization'}</strong>. A dedicated single-use workspace activation link will be dispatched to <strong>{form.workEmail}</strong> within 1 business day.
            </p>

            <div
              style={{
                padding: 18,
                borderRadius: 14,
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                fontSize: 13,
                color: '#475569',
                marginBottom: 28,
                textAlign: 'left',
              }}
            >
              <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <ShieldCheck size={16} color="#059669" /> Verification Protocol Underway:
              </div>
              <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.6 }}>
                <li>Domain authenticity & corporate registry check.</li>
                <li>Isolated organizational tenant setup on FairHire Cloud.</li>
                <li>Encrypted 72-hour recruiter invitation tokens issued.</li>
              </ul>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <Link
                to="/"
                className="btn btn-primary"
                style={{
                  padding: '12px 24px',
                  borderRadius: 10,
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                Return to Homepage
              </Link>
            </div>
          </div>
        ) : (
          /* ── Main 2-Column Content Grid: Form (Left) + Interactive Showcase & Trust (Right) ─── */
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
              gap: 32,
              alignItems: 'start',
            }}
          >
            {/* ── Left Column: Enterprise Intake Form Card ─── */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: 20,
                border: '1px solid #e2e8f0',
                padding: '32px 30px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.02)',
                position: 'relative',
              }}
            >
              {/* Card Header */}
              <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: 16, marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#059669', fontSize: 13, fontWeight: 700 }}>
                  <Building2 size={18} />
                  <span>Company Credentials & Domain</span>
                </div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: '6px 0 2px' }}>
                  Enterprise Verification Details
                </h2>
                <p style={{ fontSize: 12.5, color: '#64748b', margin: 0 }}>
                  Enter your official corporate details to start the vetting process.
                </p>
              </div>

              {error && (
                <div
                  className="alert alert-error"
                  style={{
                    marginBottom: 18,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 8,
                    padding: '10px 14px',
                    borderRadius: 8,
                    fontSize: 13,
                  }}
                >
                  <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Company Name */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="company-name" style={{ fontWeight: 600, color: '#334155', fontSize: 13, marginBottom: 5 }}>
                    Company / Organization Legal Name
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
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="work-email" style={{ fontWeight: 600, color: '#334155', fontSize: 13, marginBottom: 5 }}>
                    Official Corporate Email
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="work-email"
                      className="form-input"
                      type="email"
                      name="workEmail"
                      placeholder="you@company.com"
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

                  {/* Inline Feedback */}
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
                      <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                      <div>
                        <strong>Free email provider (@{emailDomain}) rejected.</strong>
                        <div style={{ opacity: 0.9, marginTop: 2 }}>
                          Employer accounts require an enterprise email (e.g.{' '}
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
                        marginTop: 5,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        fontWeight: 500,
                      }}
                    >
                      <Check size={13} /> Corporate domain recognized: <strong>@{emailDomain}</strong>
                    </span>
                  ) : (
                    <span style={{ fontSize: 12, color: '#94a3b8', marginTop: 5, display: 'block' }}>
                      Consumer addresses (@gmail, @yahoo, @hotmail) are not eligible for recruiter accounts.
                    </span>
                  )}
                </div>

                {/* Company Size & Monthly Hiring Volume */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor="company-size" style={{ fontWeight: 600, color: '#334155', fontSize: 13, marginBottom: 5 }}>
                      Company Size
                    </label>
                    <select
                      id="company-size"
                      className="form-input"
                      name="companySize"
                      value={form.companySize}
                      onChange={handleChange}
                      style={{ borderRadius: 10, padding: '9px 12px', fontSize: 13.5, border: '1px solid #cbd5e1' }}
                    >
                      <option value="1-50">1–50 employees</option>
                      <option value="51-200">51–200 employees</option>
                      <option value="201-1000">201–1,000 employees</option>
                      <option value="1000+">1,000+ employees</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor="hiring-volume" style={{ fontWeight: 600, color: '#334155', fontSize: 13, marginBottom: 5 }}>
                      Monthly Hiring
                    </label>
                    <select
                      id="hiring-volume"
                      className="form-input"
                      name="hiringVolume"
                      value={form.hiringVolume}
                      onChange={handleChange}
                      style={{ borderRadius: 10, padding: '9px 12px', fontSize: 13.5, border: '1px solid #cbd5e1' }}
                    >
                      <option value="1-5">1–5 roles / mo</option>
                      <option value="5-20">5–20 roles / mo</option>
                      <option value="20+">20+ roles / mo</option>
                    </select>
                  </div>
                </div>

                {/* Hiring Focus & Diversity Goals */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="use-case" style={{ fontWeight: 600, color: '#334155', fontSize: 13, marginBottom: 5 }}>
                    Hiring Focus & Diversity Goals <span style={{ color: '#94a3b8', fontWeight: 400 }}>(Optional)</span>
                  </label>
                  <textarea
                    id="use-case"
                    className="form-input"
                    name="useCase"
                    rows={2}
                    placeholder="Describe your current tech hiring priorities, engineering roles, or screening pain points..."
                    value={form.useCase}
                    onChange={handleChange}
                    style={{
                      resize: 'none',
                      borderRadius: 10,
                      padding: '9px 13px',
                      fontSize: 13.5,
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
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
                  }}
                >
                  {loading ? (
                    <span className="spinner" style={{ width: 16, height: 16 }} />
                  ) : (
                    <ArrowRight size={16} />
                  )}
                  {loading
                    ? 'Submitting Application…'
                    : isBlockedDomain
                    ? 'Corporate Email Required'
                    : 'Submit Access Request'}
                </button>

                {/* Security Trust Badges */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 12,
                    fontSize: 11.5,
                    color: '#64748b',
                    paddingTop: 4,
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Lock size={13} color="#10b981" /> 256-Bit SSL
                  </span>
                  <span>•</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={13} color="#10b981" /> 24h Review
                  </span>
                  <span>•</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Shield size={13} color="#10b981" /> SOC-2 Aligned
                  </span>
                </div>
              </form>
            </div>

            {/* ── Right Column: Interactive Showcase & Enterprise Benefits ─── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Enterprise Dashboard Preview Card */}
              <div
                style={{
                  background: '#0f172a',
                  borderRadius: 20,
                  overflow: 'hidden',
                  border: '1px solid #1e293b',
                  boxShadow: '0 20px 30px -10px rgba(15, 23, 42, 0.25)',
                  position: 'relative',
                  color: '#ffffff',
                }}
              >
                {/* Browser Bezel Header */}
                <div
                  style={{
                    padding: '12px 18px',
                    background: '#1e293b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid #334155',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }} />
                    <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 10, fontWeight: 500 }}>
                      fairhire.enterprise/recruiter-console
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: 10.5,
                      padding: '2px 8px',
                      borderRadius: 4,
                      background: 'rgba(16, 185, 129, 0.2)',
                      color: '#34d399',
                      fontWeight: 700,
                    }}
                  >
                    AI NEUTRALITY ENGINE
                  </span>
                </div>

                {/* Showcase Image & Interactive Hologram Overlay */}
                <div style={{ position: 'relative', height: 210, overflow: 'hidden' }}>
                  <img
                    src="/enterprise-hiring-ai.jpg"
                    alt="FairHire Enterprise Talent Analytics"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      filter: 'brightness(0.92)',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.3) 60%, transparent 100%)',
                    }}
                  />

                  {/* Floating Metric Badges over the image */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 14,
                      left: 16,
                      right: 16,
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 10,
                    }}
                  >
                    <div
                      style={{
                        padding: '8px 12px',
                        borderRadius: 10,
                        background: 'rgba(15, 23, 42, 0.85)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                      }}
                    >
                      <div style={{ fontSize: 18, fontWeight: 900, color: '#34d399' }}>100%</div>
                      <div style={{ fontSize: 10.5, color: '#cbd5e1' }}>PII Blind Masking</div>
                    </div>
                    <div
                      style={{
                        padding: '8px 12px',
                        borderRadius: 10,
                        background: 'rgba(15, 23, 42, 0.85)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                      }}
                    >
                      <div style={{ fontSize: 18, fontWeight: 900, color: '#38bdf8' }}>NYC 144</div>
                      <div style={{ fontSize: 10.5, color: '#cbd5e1' }}>Audit-Grade Engine</div>
                    </div>
                  </div>
                </div>

                {/* Showcase Card Details */}
                <div style={{ padding: '18px 20px' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#ffffff', marginBottom: 6 }}>
                    What You Unlock With Employer Access:
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 12, color: '#94a3b8' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <CheckCircle2 size={14} color="#34d399" /> Redacted Candidate Pool
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <CheckCircle2 size={14} color="#34d399" /> Sandbox Coding Tests
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <CheckCircle2 size={14} color="#34d399" /> Demographic Parity Audits
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <CheckCircle2 size={14} color="#34d399" /> Single-Use Invite Tokens
                    </div>
                  </div>
                </div>
              </div>

              {/* 3-Step Enterprise Onboarding Timeline */}
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: 18,
                  border: '1px solid #e2e8f0',
                  padding: '22px 24px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 14 }}>
                  Employer Onboarding Roadmap
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: '50%',
                        background: '#ecfdf5',
                        color: '#059669',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: 12,
                        flexShrink: 0,
                      }}
                    >
                      1
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>Domain & Entity Verification</div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>Our compliance team validates your corporate domain records.</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: '50%',
                        background: '#ecfdf5',
                        color: '#059669',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: 12,
                        flexShrink: 0,
                      }}
                    >
                      2
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>Dedicated Tenant Provisioning</div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>An isolated workspace with recruiter roles and customized rubrics is deployed.</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: '50%',
                        background: '#ecfdf5',
                        color: '#059669',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: 12,
                        flexShrink: 0,
                      }}
                    >
                      3
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>Encrypted Invite & Go Live</div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>A secure 72-hour single-use token arrives in your inbox to start screening.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
