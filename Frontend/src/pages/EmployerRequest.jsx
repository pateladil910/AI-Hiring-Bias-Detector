import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  ArrowLeft,
  Building2,
  Briefcase,
  FileText,
  Sparkles,
  CheckCircle2,
  Send,
  Lock,
  Clock,
  Eye,
  Code2,
  Users,
  Scale,
  AlertTriangle,
  Check,
  MapPin,
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

/* ------------------------------------------------------------------ */
/*  Small building blocks                                              */
/* ------------------------------------------------------------------ */
function Field({ label, optional, error, hint, children, htmlFor }) {
  return (
    <div className="pj-field">
      <label htmlFor={htmlFor} className="pj-label">
        {label} {optional && <span className="pj-optional">(Optional)</span>}
      </label>
      {children}
      {error ? (
        <p className="pj-error" role="alert">{error}</p>
      ) : hint ? (
        <p className="pj-hint">{hint}</p>
      ) : null}
    </div>
  );
}

function Toggle({ icon: Icon, title, desc, checked, onChange }) {
  return (
    <div className={`pj-toggle ${checked ? "on" : ""}`}>
      <span className="pj-toggle-icon"><Icon size={18} /></span>
      <div className="pj-toggle-text">
        <strong>{title}</strong>
        <span>{desc}</span>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={title}
        className={`pj-switch ${checked ? "on" : ""}`}
        onClick={() => onChange(!checked)}
      >
        <span />
      </button>
    </div>
  );
}

function Section({ icon: Icon, kicker, title, sub, children }) {
  return (
    <section className="pj-card pj-section">
      <div className="pj-sec-head">
        <div className="pj-kicker"><Icon size={16} /> {kicker}</div>
        <h2>{title}</h2>
        {sub && <p>{sub}</p>}
      </div>
      {children}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Page: EmployerRequest                                              */
/* ------------------------------------------------------------------ */
export default function EmployerRequest() {
  const [form, setForm] = useState({
    companyName: '',
    workEmail: '',
    companySize: '1-50',
    hiringVolume: '1-5',
    useCase: '',
    blindMask: true,
    complianceAudit: true,
    sandboxTest: true,
    singleUseInvites: true,
  });

  const [submitted, setSubmitted] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  const emailDomain = useMemo(() => getEmailDomain(form.workEmail), [form.workEmail]);
  const isBlockedDomain = useMemo(() => BLOCKED_DOMAINS.has(emailDomain), [emailDomain]);
  const isCorporateDomain = useMemo(
    () => Boolean(emailDomain && emailDomain.includes('.') && !isBlockedDomain),
    [emailDomain, isBlockedDomain]
  );

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setServerError('');
    if (errors[k]) {
      setErrors((prev) => ({ ...prev, [k]: null }));
    }
  };

  /* completion progress */
  const progress = useMemo(() => {
    const checks = [
      form.companyName.trim().length >= 2,
      form.workEmail.trim().length > 3 && !isBlockedDomain,
      Boolean(form.companySize),
      Boolean(form.hiringVolume),
      form.useCase.trim().length > 10,
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [form, isBlockedDomain]);

  /* validation */
  const validate = () => {
    const e = {};
    if (form.companyName.trim().length < 2) {
      e.companyName = 'Enter your registered organization or company name.';
    }
    if (!form.workEmail.trim() || !form.workEmail.includes('@')) {
      e.workEmail = 'Enter a valid official work email address.';
    } else if (isBlockedDomain) {
      e.workEmail = `Free email providers (@${emailDomain}) are not permitted. Please use your corporate email.`;
    }
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length) {
      const first = document.querySelector('.pj-input.invalid');
      first?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setLoading(true);
    setServerError('');

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await axios.post(`${apiUrl}/api/employers/request-access`, {
        companyName: form.companyName,
        workEmail: form.workEmail,
        companySize: form.companySize,
        hiringVolume: form.hiringVolume,
        useCase: form.useCase,
      });

      const reqId = res.data?.requestId
        ? `FH-EMP-${res.data.requestId.slice(0, 6).toUpperCase()}`
        : `FH-EMP-${Math.floor(100000 + Math.random() * 900000)}`;

      setSubmitted({
        id: reqId,
        companyName: form.companyName,
        workEmail: form.workEmail,
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      const msg =
        err.response?.data?.error?.message ||
        'Failed to submit employer request. Please verify your company email address.';
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setSubmitted(null);
    setErrors({});
    setServerError('');
    setForm({
      companyName: '',
      workEmail: '',
      companySize: '1-50',
      hiringVolume: '1-5',
      useCase: '',
      blindMask: true,
      complianceAudit: true,
      sandboxTest: true,
      singleUseInvites: true,
    });
  };

  const cls = (k) => `pj-input ${errors[k] ? 'invalid' : ''}`;

  return (
    <div className="pj-root">
      <style>{CSS}</style>

      {/* ---------------- Header ---------------- */}
      <header className="pj-header">
        <div className="pj-container pj-header-in">
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }} className="pj-brand">
            <span className="pj-logo"><ShieldCheck size={26} /></span>
            <span className="pj-wordmark">Fair<b>Hire</b></span>
            <span className="pj-badge">ENTERPRISE</span>
          </Link>
          <div className="pj-header-right">
            <span className="pj-muted pj-hide-sm">
              Already registered?{' '}
              <Link to="/login" style={{ color: 'var(--green)', fontWeight: 600, textDecoration: 'none' }}>
                Sign In
              </Link>
            </span>
            <Link to="/" className="pj-btn-outline" style={{ textDecoration: 'none' }}>
              <ArrowLeft size={16} /> Back to Home
            </Link>
          </div>
        </div>
        {!submitted && (
          <div
            className="pj-progress"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Form completion"
          >
            <span style={{ width: `${progress}%` }} />
          </div>
        )}
      </header>

      <main className="pj-container pj-narrow">
        {/* ---------------- Hero ---------------- */}
        <section className="pj-hero">
          <span className="pj-pill"><Sparkles size={14} /> ENTERPRISE ACCESS INTAKE</span>
          <h1>Request Employer Access</h1>
          <p>
            Deploy demographic-blind candidate screening, sandboxed technical tests, and NYC Local Law 144
            compliance audits across your hiring organization. Every corporate account is verified within 24 hours.
          </p>
        </section>

        {serverError && (
          <div
            style={{
              padding: '14px 18px',
              borderRadius: '14px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              fontSize: '14.5px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <AlertTriangle size={18} />
            <span>{serverError}</span>
          </div>
        )}

        {submitted ? (
          <div className="pj-card pj-success">
            <span className="pj-success-icon"><CheckCircle2 size={38} /></span>
            <h2>Application submitted successfully</h2>
            <p>
              Thank you! Our compliance team is verifying organization credentials for <strong>{submitted.companyName}</strong>. Once approved, an enterprise invite link will be dispatched to <strong>{submitted.workEmail}</strong> within 1 business day.
            </p>
            <div className="pj-jobid">Intake Reference ID <code>{submitted.id}</code></div>

            <div
              style={{
                maxWidth: 520,
                margin: '0 auto 26px',
                textAlign: 'left',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '14px',
                padding: '16px 20px',
                fontSize: '14px',
                color: '#475569',
              }}
            >
              <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <ShieldCheck size={16} color="#059669" /> Verification Protocol Underway:
              </div>
              <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.6 }}>
                <li>Domain authenticity & corporate registry verification.</li>
                <li>Isolated organizational tenant configuration on FairHire Cloud.</li>
                <li>Encrypted 72-hour recruiter invitation tokens generated.</li>
              </ul>
            </div>

            <div className="pj-row">
              <button className="pj-btn-primary pj-auto" onClick={reset}>
                Submit another request
              </button>
              <Link to="/" className="pj-btn-outline" style={{ textDecoration: 'none' }}>
                Return to homepage
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="pj-stack">
            {/* Organization details */}
            <Section
              icon={Building2}
              kicker="Organization Details"
              title="Who is requesting access?"
              sub="Provide your legal organization name and size."
            >
              <Field label="Company / Organization Legal Name" error={errors.companyName} htmlFor="companyName">
                <input
                  id="companyName"
                  className={cls('companyName')}
                  value={form.companyName}
                  onChange={set('companyName')}
                  placeholder="e.g. Acme Technologies Inc."
                />
              </Field>

              <div className="pj-two">
                <Field label="Company Size" htmlFor="companySize">
                  <select id="companySize" className="pj-input" value={form.companySize} onChange={set('companySize')}>
                    <option value="1-50">1–50 employees</option>
                    <option value="51-200">51–200 employees</option>
                    <option value="201-1000">201–1,000 employees</option>
                    <option value="1000+">1,000+ employees</option>
                  </select>
                </Field>

                <Field label="Monthly Hiring Volume" htmlFor="hiringVolume">
                  <select id="hiringVolume" className="pj-input" value={form.hiringVolume} onChange={set('hiringVolume')}>
                    <option value="1-5">1–5 roles / mo</option>
                    <option value="5-20">5–20 roles / mo</option>
                    <option value="20+">20+ roles / mo</option>
                  </select>
                </Field>
              </div>
            </Section>

            {/* Corporate Verification */}
            <Section
              icon={Briefcase}
              kicker="Corporate Verification"
              title="Official Work Email"
              sub="Employer workspaces require an official corporate email. Free consumer email providers are strictly filtered."
            >
              <Field label="Work Email (Corporate Domain)" error={errors.workEmail} htmlFor="workEmail">
                <div className="pj-icon-input">
                  <Briefcase size={18} />
                  <input
                    id="workEmail"
                    type="email"
                    className={cls('workEmail')}
                    value={form.workEmail}
                    onChange={set('workEmail')}
                    placeholder="you@company.com"
                  />
                </div>

                {/* Inline Domain State Feedback */}
                {isBlockedDomain ? (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 8,
                      padding: '10px 14px',
                      background: 'rgba(239, 68, 68, 0.08)',
                      border: '1px solid rgba(239, 68, 68, 0.25)',
                      borderRadius: 10,
                      marginTop: 8,
                      color: '#dc2626',
                      fontSize: 13,
                      lineHeight: 1.45,
                    }}
                  >
                    <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <strong>Consumer email (@{emailDomain}) blocked.</strong>
                      <div style={{ opacity: 0.9, marginTop: 2 }}>
                        Employer workspaces require an enterprise corporate address (e.g.{' '}
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
                  <div
                    style={{
                      fontSize: 13,
                      color: '#059669',
                      marginTop: 8,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontWeight: 600,
                    }}
                  >
                    <Check size={15} /> Corporate domain recognized: <strong>@{emailDomain}</strong>
                  </div>
                ) : (
                  <p className="pj-hint">
                    Personal webmail addresses (@gmail, @yahoo, @hotmail) are not eligible for recruiter accounts.
                  </p>
                )}
              </Field>
            </Section>

            {/* Hiring Priorities */}
            <Section
              icon={FileText}
              kicker="Hiring Priorities"
              title="Hiring Focus & Diversity Goals"
              sub="Describe your current tech hiring goals, engineering roles, or screening pain points."
            >
              <Field label="Hiring Goals & Overview" optional htmlFor="useCase">
                <textarea
                  id="useCase"
                  rows={4}
                  className="pj-input"
                  value={form.useCase}
                  onChange={set('useCase')}
                  placeholder="Describe key roles (backend, full-stack, DevOps), volume, and any diversity or anti-bias goals…"
                />
                <div className="pj-count">{form.useCase.length} characters</div>
              </Field>
            </Section>

            {/* Platform Safeguards */}
            <Section
              icon={ShieldCheck}
              kicker="Platform Safeguards"
              title="Enterprise hiring & anti-bias controls"
              sub="These security and fairness controls are configured for your organization's workspace."
            >
              <div className="pj-toggles">
                <Toggle
                  icon={Eye}
                  title="Blind Candidate Masking"
                  desc="Hide names, photos, gender, and contact markers until final interviews."
                  checked={form.blindMask}
                  onChange={(v) => setForm({ ...form, blindMask: v })}
                />
                <Toggle
                  icon={Scale}
                  title="NYC LL144 & EEOC Auditing"
                  desc="Continuous demographic parity tracking & adverse impact checks."
                  checked={form.complianceAudit}
                  onChange={(v) => setForm({ ...form, complianceAudit: v })}
                />
                <Toggle
                  icon={Code2}
                  title="Sandboxed Technical Tests"
                  desc="Run coding assessments in isolated secure environments."
                  checked={form.sandboxTest}
                  onChange={(v) => setForm({ ...form, sandboxTest: v })}
                />
                <Toggle
                  icon={Lock}
                  title="Single-Use Activation Tokens"
                  desc="Encrypted, 72-hour expiring invite links for recruiter team seats."
                  checked={form.singleUseInvites}
                  onChange={(v) => setForm({ ...form, singleUseInvites: v })}
                />
              </div>
            </Section>

            {/* Actions */}
            <div className="pj-actions">
              <button
                type="submit"
                className="pj-btn-primary"
                disabled={loading || isBlockedDomain}
              >
                {loading ? (
                  <span
                    className="spinner"
                    style={{
                      width: 18,
                      height: 18,
                      border: '2px solid #fff',
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                      display: 'inline-block',
                      animation: 'spin 0.6s linear infinite',
                    }}
                  />
                ) : (
                  <Send size={18} />
                )}
                {loading
                  ? 'Submitting Application…'
                  : isBlockedDomain
                  ? 'Corporate Email Required'
                  : 'Submit Access Request'}
              </button>

              <div className="pj-trust">
                <span><Lock size={14} /> 256-Bit SSL</span>
                <i />
                <span><Clock size={14} /> 24h Review Turnaround</span>
                <i />
                <span><ShieldCheck size={14} /> SOC-2 Aligned</span>
              </div>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Styles (self-contained: Inter font, responsive, polished)          */
/* ------------------------------------------------------------------ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

@keyframes spin {
  to { transform: rotate(360deg); }
}

.pj-root{
  --green:#059669; --green-d:#047857; --green-t:#ecfdf5; --green-b:#a7f3d0;
  --ink:#0f172a; --muted:#64748b; --line:#e2e8f0; --bg:#f8fafc; --danger:#dc2626;
  font-family:'Inter',system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;
  color:var(--ink); background:var(--bg); min-height:100vh; box-sizing:border-box;
  padding-bottom:env(safe-area-inset-bottom,0px);
}
.pj-root *{box-sizing:border-box}
.pj-root button{font-family:inherit;cursor:pointer}
.pj-root :focus-visible{outline:3px solid rgba(5,150,105,.35);outline-offset:2px}
.pj-container{max-width:1440px;margin:0 auto;padding:0 32px}
.pj-narrow{max-width:860px;padding-bottom:80px}

/* header */
.pj-header{background:#fff;border-bottom:1px solid var(--line);position:sticky;top:0;z-index:20;padding-top:env(safe-area-inset-top,0px)}
.pj-header-in{display:flex;align-items:center;justify-content:space-between;height:72px}
.pj-brand{display:flex;align-items:center;gap:12px;text-decoration:none}
.pj-logo{width:42px;height:42px;border-radius:12px;background:linear-gradient(135deg, #10b981 0%, #059669 100%);color:#fff;display:grid;place-items:center;box-shadow:0 6px 16px rgba(5,150,105,.28)}
.pj-wordmark{font-size:24px;font-weight:600;letter-spacing:-.02em;color:var(--ink)}
.pj-wordmark b{font-weight:800;color:var(--green)}
.pj-badge{font-size:11px;font-weight:700;letter-spacing:.06em;color:var(--green);background:var(--green-t);border:1px solid var(--green-b);padding:4px 9px;border-radius:6px}
.pj-header-right{display:flex;align-items:center;gap:16px}
.pj-muted{color:var(--muted);font-size:14px}
.pj-muted strong{color:var(--green);font-weight:600}
.pj-btn-outline{display:inline-flex;align-items:center;gap:8px;background:#fff;border:1px solid var(--line);color:var(--ink);font-weight:600;font-size:14px;padding:9px 16px;border-radius:10px;transition:background .15s,border-color .15s}
.pj-btn-outline:hover{background:var(--bg);border-color:#cbd5e1}
.pj-progress{height:3px;background:var(--line)}
.pj-progress span{display:block;height:100%;background:var(--green);transition:width .35s ease}

/* hero */
.pj-hero{text-align:center;padding:42px 0 32px}
.pj-pill{display:inline-flex;align-items:center;gap:7px;font-size:12px;font-weight:700;letter-spacing:.06em;color:var(--green-d);background:var(--green-t);border:1px solid var(--green-b);padding:6px 16px;border-radius:999px}
.pj-hero h1{font-size:clamp(30px,4.5vw,46px);line-height:1.12;font-weight:800;letter-spacing:-.035em;margin:18px 0 12px;color:var(--ink)}
.pj-hero p{max-width:640px;margin:0 auto;color:#475569;font-size:16px;line-height:1.65}

/* cards */
.pj-stack{display:flex;flex-direction:column;gap:24px}
.pj-card{background:#fff;border:1px solid var(--line);border-radius:20px;box-shadow:0 1px 3px rgba(15,23,42,.04),0 12px 28px rgba(15,23,42,.04)}
.pj-section{padding:32px 36px}
.pj-sec-head{margin-bottom:24px;padding-bottom:20px;border-bottom:1px solid var(--line)}
.pj-kicker{display:flex;align-items:center;gap:7px;color:var(--green);font-weight:600;font-size:14px;margin-bottom:6px}
.pj-sec-head h2{font-size:22px;font-weight:700;letter-spacing:-.02em;margin:0 0 6px;color:var(--ink)}
.pj-sec-head p{margin:0;color:var(--muted);font-size:14.5px;line-height:1.5}

/* fields */
.pj-field{margin-bottom:20px}
.pj-field:last-child{margin-bottom:0}
.pj-label{display:block;font-weight:600;font-size:14.5px;margin-bottom:8px;color:var(--ink)}
.pj-optional{color:var(--muted);font-weight:400}
.pj-input{width:100%;height:50px;padding:0 15px;font:inherit;font-size:15px;color:var(--ink);background:#fff;border:1px solid var(--line);border-radius:11px;transition:border-color .15s,box-shadow .15s}
textarea.pj-input{height:auto;padding:13px 15px;line-height:1.6;resize:vertical;min-height:110px}
.pj-input::placeholder{color:#94a3b8}
.pj-input:hover{border-color:#cbd5e1}
.pj-input:focus{outline:none;border-color:var(--green);box-shadow:0 0 0 4px rgba(5,150,105,.12)}
.pj-input.invalid{border-color:var(--danger);box-shadow:0 0 0 4px rgba(220,38,38,.08)}
select.pj-input{appearance:auto;padding:0 12px}
.pj-icon-input{position:relative}
.pj-icon-input svg{position:absolute;left:15px;top:50%;transform:translateY(-50%);color:#94a3b8;pointer-events:none}
.pj-icon-input .pj-input{padding-left:44px}
.pj-two{display:grid;grid-template-columns:1fr 1fr;gap:18px}
.pj-hint{color:var(--muted);font-size:13.5px;margin:7px 0 0;line-height:1.5}
.pj-error{color:var(--danger);font-size:13.5px;font-weight:500;margin:7px 0 0}
.pj-count{text-align:right;color:#94a3b8;font-size:12.5px;margin-top:6px}

/* toggles */
.pj-toggles{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.pj-toggle{display:flex;align-items:flex-start;gap:12px;padding:16px;border:1px solid var(--line);border-radius:14px;background:#fff;transition:border-color .2s,background .2s}
.pj-toggle.on{border-color:var(--green-b);background:var(--green-t)}
.pj-toggle-icon{flex:none;width:38px;height:38px;border-radius:10px;background:var(--green-t);color:var(--green);display:grid;place-items:center}
.pj-toggle.on .pj-toggle-icon{background:#fff}
.pj-toggle-text{flex:1;display:flex;flex-direction:column;gap:3px;min-width:0}
.pj-toggle-text strong{font-size:14.5px;font-weight:600;color:var(--ink)}
.pj-toggle-text span{font-size:13px;color:var(--muted);line-height:1.45}
.pj-switch{flex:none;width:44px;height:24px;border-radius:999px;border:0;background:#cbd5e1;padding:2px;transition:background .2s;display:flex;margin-top:2px}
.pj-switch span{width:20px;height:20px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.25);transition:transform .2s}
.pj-switch.on{background:var(--green)}
.pj-switch.on span{transform:translateX(20px)}

/* actions */
.pj-actions{padding:6px 0 0}
.pj-btn-primary{width:100%;height:56px;display:flex;align-items:center;justify-content:center;gap:9px;background:var(--green);color:#fff;border:0;border-radius:13px;font-size:16.5px;font-weight:700;box-shadow:0 10px 24px rgba(5,150,105,.28);transition:background .15s,transform .1s}
.pj-btn-primary:hover{background:var(--green-d)}
.pj-btn-primary:active{transform:translateY(1px)}
.pj-btn-primary.pj-auto{width:auto;padding:0 24px;height:50px;font-size:15.5px}
.pj-btn-primary:disabled{opacity:0.6;cursor:not-allowed}
.pj-trust{display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:8px 12px;margin-top:16px;color:var(--green);font-size:13.5px;font-weight:500}
.pj-trust span{display:inline-flex;align-items:center;gap:5px}
.pj-trust i{width:4px;height:4px;border-radius:50%;background:var(--green)}

/* success */
.pj-success{text-align:center;padding:48px 30px}
.pj-success-icon{width:68px;height:68px;border-radius:50%;background:var(--green-t);color:var(--green);display:inline-grid;place-items:center;margin-bottom:16px}
.pj-success h2{font-size:28px;font-weight:800;letter-spacing:-.02em;margin:0 0 10px;color:var(--ink)}
.pj-success p{color:#475569;line-height:1.65;max-width:480px;margin:0 auto 18px;font-size:15px}
.pj-jobid{display:inline-block;background:var(--bg);border:1px solid var(--line);padding:9px 16px;border-radius:11px;font-size:14px;color:var(--muted);margin-bottom:24px}
.pj-jobid code{color:var(--ink);font-weight:700;margin-left:6px}
.pj-row{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}

/* responsive */
@media (max-width:720px){
  .pj-container{padding:0 16px}
  .pj-header-in{height:64px}
  .pj-hide-sm,.pj-badge{display:none}
  .pj-btn-outline{padding:8px 12px;font-size:13.5px}
  .pj-wordmark{font-size:21px}
  .pj-logo{width:38px;height:38px}
  .pj-hero{padding:28px 0 24px}
  .pj-hero p{font-size:15px}
  .pj-section{padding:22px 18px;border-radius:18px}
  .pj-two,.pj-toggles{grid-template-columns:1fr;gap:0}
  .pj-toggles{gap:12px}
  .pj-two .pj-field{margin-bottom:20px}
}
@media (prefers-reduced-motion:reduce){
  .pj-root *{transition:none!important}
}
`;
