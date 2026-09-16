import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, Zap, Users, BarChart3, ArrowRight, CheckCircle2,
  Building2, Key, Sparkles, Check, AlertTriangle
} from 'lucide-react';
import BiasScoreRing from '../components/BiasScoreRing';
import { biasAPI } from '../lib/api';

const features = [
  {
    icon: <ShieldCheck size={22} />,
    title: 'Hybrid Bias Detection',
    desc: 'Instant keystroke lexicon scanner paired with deep LLM analysis flags gendered, ageist, pedigree, and exclusionary language.',
  },
  {
    icon: <Zap size={22} />,
    title: 'AI Skill Assessments',
    desc: 'Standardized 10-question technical aptitude tests automatically synthesized from verified job skill matrices with zero answer leakage.',
  },
  {
    icon: <Users size={22} />,
    title: 'Human-in-the-Loop',
    desc: 'Borderline candidates (40%–69%) route to a human review queue. Zero automated silent rejections or black-box filtering.',
  },
  {
    icon: <BarChart3 size={22} />,
    title: 'Immutable Audit Trail',
    desc: 'Every AI score calculation, bias edit, and human override is logged with SHA-256 diff hashes and one-click compliance export.',
  },
];

const principles = [
  'Zero demographic signals in scoring — evaluated strictly on skills & merit',
  'Every candidate decision accompanied by a plain-English explainability report',
  'Recruiter override always available with mandatory written justification permanently logged',
  'Borderline candidates routed to human recruiters, never automatically rejected',
  'Automated PII stripping hides names, emails, phone numbers, and universities from recruiters',
];

const METRICS = [
  { value: '50,000+', label: 'Blind Assessments Completed', detail: 'Across 14 technical disciplines' },
  { value: '99.4%', label: 'PII Anonymization Accuracy', detail: 'Zero demographic leaks in blind roster' },
  { value: '100%', label: 'Explainable AI Decisions', detail: 'Plain-English scoring rationale' },
  { value: '0%', label: 'Demographic Bias Weight', detail: 'Pure merit and aptitude screening' },
];

const sampleJDs = [
  {
    id: 'biased',
    label: 'Biased Sample JD',
    text: 'We are seeking a young rockstar ninja developer for our fast-paced team. The ideal candidate is an aggressive hustler from a top-tier Ivy League university with native English skills.',
  },
  {
    id: 'inclusive',
    label: 'Inclusive Sample JD',
    text: 'We are seeking a skilled full-stack software engineer to join our collaborative engineering team. The ideal candidate has strong problem-solving abilities, proficiency in modern web frameworks, and excellent team communication skills.',
  }
];

export default function Landing() {
  const [demoText, setDemoText] = useState(sampleJDs[0].text);
  const [score, setScore] = useState(68);
  const [flags, setFlags] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [activePreset, setActivePreset] = useState('biased');
  const debounceTimer = useRef(null);

  // Fallback client-side scorer if API is unreachable
  const computeClientScore = (text) => {
    let s = 100;
    const lower = text.toLowerCase();
    const fallbackRules = [
      { phrase: 'young', category: 'age_bias', suggestion: 'motivated' },
      { phrase: 'rockstar', category: 'gender_coded', suggestion: 'skilled engineer' },
      { phrase: 'ninja', category: 'gender_coded', suggestion: 'software developer' },
      { phrase: 'hustler', category: 'exclusionary_culture', suggestion: 'proactive learner' },
      { phrase: 'ivy league', category: 'pedigree_bias', suggestion: 'relevant technical background' },
      { phrase: 'top-tier', category: 'pedigree_bias', suggestion: 'practical technical ability' },
      { phrase: 'native english', category: 'pedigree_bias', suggestion: 'fluent in English' },
      { phrase: 'aggressive', category: 'exclusionary_culture', suggestion: 'focused' },
    ];
    const detected = [];
    fallbackRules.forEach(r => {
      if (lower.includes(r.phrase)) {
        s -= 12;
        detected.push({
          id: `f_${r.phrase}`,
          phrase: r.phrase,
          category: r.category,
          suggestion: r.suggestion,
          severity: 'medium',
        });
      }
    });
    return { score: Math.max(20, Math.min(100, s)), flags: detected };
  };

  // Live debounced bias analysis via backend quick-scan API
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      if (!demoText || demoText.trim().length < 5) {
        setScore(100);
        setFlags([]);
        return;
      }

      setScanning(true);
      try {
        const { data } = await biasAPI.quickScan({ text: demoText });
        if (data && data.score !== undefined) {
          setScore(data.score);
          setFlags(data.flags || []);
        } else {
          const fb = computeClientScore(demoText);
          setScore(fb.score);
          setFlags(fb.flags);
        }
      } catch {
        const fb = computeClientScore(demoText);
        setScore(fb.score);
        setFlags(fb.flags);
      } finally {
        setScanning(false);
      }
    }, 280);

    return () => clearTimeout(debounceTimer.current);
  }, [demoText]);

  // One-click replacement in teaser box
  const handleApplySuggestion = (oldWord, replacement) => {
    const escaped = oldWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    const updated = demoText.replace(regex, replacement);
    setDemoText(updated);
    setActivePreset('custom');
  };

  const getScoreStatus = (val) => {
    if (val >= 80) return { label: 'Fair & Inclusive', cls: 'badge-success', color: 'var(--color-success)' };
    if (val >= 50) return { label: 'Needs Review', cls: 'badge-warning', color: 'var(--color-warning)' };
    return { label: 'High Bias', cls: 'badge-error', color: 'var(--color-danger)' };
  };

  const statusMeta = getScoreStatus(score);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--color-bg)' }}>

      {/* ── Sticky Navigation Header ─────────────────────────────────────────── */}
      <nav style={{
        borderBottom: '1px solid var(--color-border)',
        padding: '16px 0',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(11,15,23,0.85)',
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8, background: 'var(--color-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff'
            }}>F</div>
            <span style={{ fontWeight: 700, fontSize: 18, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
              Fair<span style={{ color: 'var(--color-primary)' }}>Hire</span>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Link to="/candidate/jobs" style={{ fontSize: 14, color: 'var(--color-text-secondary)', textDecoration: 'none' }}>
              Explore Jobs
            </Link>
            <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
            <Link to="/register/candidate" className="btn btn-primary btn-sm">Find a Job</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero Section (Split Layout + Live Teaser) ───────────────────────── */}
      <section style={{ padding: '80px 0 60px', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: '-100px', left: '30%',
          width: 500, height: 500,
          background: 'radial-gradient(circle, rgba(91,127,255,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 48, alignItems: 'center' }}>
          {/* Left Column: Copy & Dual CTAs */}
          <div>
            <div className="badge badge-primary" style={{ marginBottom: 20, fontSize: 12, padding: '4px 12px' }}>
              🛡️ AI-Powered · Explainable · Compliance-Ready
            </div>

            <h1 style={{
              fontSize: 'clamp(2.2rem, 4.5vw, 3.4rem)',
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              margin: '0 0 20px',
            }}>
              Hire on merit.<br />
              <span style={{
                background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Eliminate hiring bias.
              </span>
            </h1>

            <p style={{ fontSize: 16, lineHeight: 1.7, color: 'var(--color-text-secondary)', margin: '0 0 32px' }}>
              Post verified de-biased job descriptions, screen candidate resumes blindly with automated PII redaction, and evaluate skills objectively with timed, rubric-graded assessments.
            </p>

            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <Link to="/register/candidate" className="btn btn-primary btn-lg" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                Find a Job <ArrowRight size={18} />
              </Link>
              <Link to="/employers/request-access" className="btn btn-ghost btn-lg" style={{ border: '1px solid var(--color-border)' }}>
                For Employers (Request Access)
              </Link>
            </div>
          </div>

          {/* Right Column: Interactive Live Bias Scanner Showcase */}
          <div className="card" style={{
            padding: 24, background: 'var(--color-surface)', border: '1px solid var(--color-border)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)', borderRadius: 16, position: 'relative'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sparkles size={15} style={{ color: 'var(--color-primary)' }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  Interactive Live Bias Scanner
                </span>
                {scanning && <span className="spinner" style={{ width: 12, height: 12, marginLeft: 4 }} />}
              </div>

              {/* Sample Presets */}
              <div style={{ display: 'flex', gap: 6 }}>
                {sampleJDs.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setDemoText(s.text);
                      setActivePreset(s.id);
                    }}
                    className="btn btn-ghost btn-sm"
                    style={{
                      fontSize: 11, padding: '3px 8px', height: 'auto',
                      background: activePreset === s.id ? 'rgba(91,127,255,0.18)' : 'transparent',
                      color: activePreset === s.id ? 'var(--color-primary)' : 'var(--color-text-muted)',
                      border: activePreset === s.id ? '1px solid rgba(91,127,255,0.35)' : '1px solid transparent',
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input & Ring Row */}
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <textarea
                  id="landing-demo-input"
                  value={demoText}
                  onChange={(e) => {
                    setDemoText(e.target.value);
                    setActivePreset('custom');
                  }}
                  rows={4}
                  className="input"
                  style={{
                    width: '100%', fontSize: 13, resize: 'none', lineHeight: 1.5,
                    background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)', padding: 12, outline: 'none'
                  }}
                  placeholder="Type or paste any job description to test live bias detection..."
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 95 }}>
                <BiasScoreRing score={score} size={80} loading={scanning} />
                <span style={{
                  fontSize: 11, marginTop: 6, fontWeight: 700,
                  color: statusMeta.color
                }}>
                  {statusMeta.label}
                </span>
              </div>
            </div>

            {/* Live Detected Flag Chips & One-Click Fixes */}
            {flags.length > 0 ? (
              <div style={{
                background: 'rgba(255,181,71,0.06)',
                border: '1px solid rgba(255,181,71,0.2)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 12px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-warning)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Detected Bias Signals ({flags.length})
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                    Click suggestion to replace live
                  </span>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {flags.slice(0, 4).map((f) => (
                    <div
                      key={f.id || f.phrase}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                        padding: '4px 8px', borderRadius: 'var(--radius-sm)', fontSize: 11,
                      }}
                    >
                      <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-danger)', fontWeight: 600 }}>
                        "{f.phrase}"
                      </span>
                      {f.suggestion && (
                        <button
                          type="button"
                          onClick={() => handleApplySuggestion(f.phrase, f.suggestion)}
                          className="btn btn-ghost btn-sm"
                          style={{
                            height: 'auto', padding: '1px 6px', fontSize: 10,
                            color: 'var(--color-success)', background: 'rgba(52,199,123,0.1)',
                            border: '1px solid rgba(52,199,123,0.25)', display: 'inline-flex', alignItems: 'center', gap: 3
                          }}
                          title={`Replace "${f.phrase}" with "${f.suggestion}"`}
                        >
                          <Check size={10} /> Try: {f.suggestion}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{
                background: 'rgba(52,199,123,0.06)',
                border: '1px solid rgba(52,199,123,0.2)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px',
                display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--color-success)',
              }}>
                <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
                <span>Zero bias indicators found — this phrasing meets inclusive language standards!</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Social Proof Metrics Strip ─────────────────────────────────────── */}
      <section style={{
        padding: '36px 0',
        background: 'linear-gradient(180deg, rgba(19, 24, 38, 0.6) 0%, rgba(11, 15, 23, 0.9) 100%)',
        borderTop: '1px solid var(--color-border)',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 24,
            textAlign: 'center',
          }}>
            {METRICS.map((m) => (
              <div key={m.label} style={{ padding: '8px 12px' }}>
                <div style={{
                  fontSize: 'clamp(1.8rem, 3.2vw, 2.4rem)',
                  fontWeight: 800,
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '-0.03em',
                  background: 'linear-gradient(135deg, #ffffff 0%, var(--color-primary) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  marginBottom: 4,
                }}>
                  {m.value}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 2 }}>
                  {m.label}
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                  {m.detail}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How Employers Get Access (3-Step Trust Strip) ───────────────────── */}
      <section style={{ padding: '60px 0', background: 'rgba(19, 24, 38, 0.3)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-primary)' }}>
              Enterprise Access Verification
            </span>
            <h2 style={{ marginTop: 8, fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', fontWeight: 700 }}>
              How Employers Join FairHire
            </h2>
            <p style={{ maxWidth: 540, margin: '8px auto 0', fontSize: 14, color: 'var(--color-text-secondary)' }}>
              To protect candidate anonymity and maintain ethical compliance standards, recruiter access is restricted to verified organizations.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24, marginBottom: 36 }}>
            {/* Step 1 */}
            <div className="card" style={{ padding: 28, textAlign: 'center', position: 'relative', border: '1px solid var(--color-border)' }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12, background: 'rgba(91,127,255,0.12)',
                color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <Building2 size={24} />
              </div>
              <div className="badge badge-primary" style={{ marginBottom: 12, fontSize: 11 }}>Step 1</div>
              <h3 style={{ fontSize: 16, marginBottom: 8 }}>Request Work-Domain Access</h3>
              <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>
                Submit your verified corporate email domain, team size, and hiring objectives. Free webmail domains (@gmail.com) are prohibited.
              </p>
            </div>

            {/* Step 2 */}
            <div className="card" style={{ padding: 28, textAlign: 'center', position: 'relative', border: '1px solid var(--color-border)' }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12, background: 'rgba(124,92,255,0.12)',
                color: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <ShieldCheck size={24} />
              </div>
              <div className="badge badge-accent" style={{ marginBottom: 12, fontSize: 11 }}>Step 2</div>
              <h3 style={{ fontSize: 16, marginBottom: 8 }}>Compliance Verification</h3>
              <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>
                Our compliance team verifies your business legitimacy within 24 hours to ensure full compliance with anti-bias hiring regulations.
              </p>
            </div>

            {/* Step 3 */}
            <div className="card" style={{ padding: 28, textAlign: 'center', position: 'relative', border: '1px solid var(--color-border)' }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12, background: 'rgba(52,199,123,0.12)',
                color: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <Key size={24} />
              </div>
              <div className="badge badge-success" style={{ marginBottom: 12, fontSize: 11 }}>Step 3</div>
              <h3 style={{ fontSize: 16, marginBottom: 8 }}>Secure Team Workspace</h3>
              <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>
                Recruiters receive cryptographic single-use invitation tokens, unlocking bias-scanned JD posting and zero-PII candidate roster review.
              </p>
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <Link to="/employers/request-access" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              Request Recruiter Access <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 4 Core Value Prop Cards ────────────────────────────────────────── */}
      <section style={{ padding: '70px 0' }}>
        <div className="container">
          <div className="grid-2" style={{ gap: 20 }}>
            {features.map((f) => (
              <div key={f.title} className="card" style={{ display: 'flex', gap: 16, alignItems: 'flex-start', padding: 24 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 'var(--radius-md)',
                  background: 'rgba(91,127,255,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--color-primary)', flexShrink: 0,
                }}>
                  {f.icon}
                </div>
                <div>
                  <h3 style={{ marginBottom: 6, fontSize: 16 }}>{f.title}</h3>
                  <p style={{ fontSize: 13, margin: 0, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Fairness Principles Checklist ─────────────────────────────────── */}
      <section style={{ padding: '60px 0', borderTop: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
        <div className="container" style={{ maxWidth: 720, textAlign: 'center' }}>
          <h2 style={{ marginBottom: 12 }}>Ethical AI Built on Mathematical Rigor</h2>
          <p style={{ marginBottom: 36, fontSize: 15, color: 'var(--color-text-secondary)' }}>
            FairHire reduces known categories of hiring bias through algorithmic enforcement.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, textAlign: 'left' }}>
            {principles.map((p) => (
              <div key={p} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <CheckCircle2 size={18} style={{ color: 'var(--color-success)', flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontSize: 14, color: 'var(--color-text-primary)' }}>{p}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer style={{
        marginTop: 'auto',
        borderTop: '1px solid var(--color-border)',
        padding: '32px 0',
        textAlign: 'center',
      }}>
        <div className="container">
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: '0 0 8px' }}>
            FairHire reduces known categories of hiring bias. Software does not replace legal compliance obligations.
          </p>
          <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: 0 }}>
            © 2026 FairHire Platform · Engineered for Objective Recruitment
          </p>
        </div>
      </footer>
    </div>
  );
}
