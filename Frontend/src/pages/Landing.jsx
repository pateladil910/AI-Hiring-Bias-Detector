import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Zap, Users, BarChart3, ArrowRight, CheckCircle, Building2, Key, CheckCircle2 } from 'lucide-react';
import BiasScoreRing from '../components/BiasScoreRing';

const features = [
  {
    icon: <ShieldCheck size={22} />,
    title: 'Hybrid Bias Detection',
    desc: 'Instant keystroke lexicon scanner paired with deep LLM analysis flags gendered, ageist, and exclusionary language.',
  },
  {
    icon: <Zap size={22} />,
    title: 'AI Skill Assessments',
    desc: '10-question standardized technical tests automatically synthesized from the verified job skill matrix.',
  },
  {
    icon: <Users size={22} />,
    title: 'Human-in-the-Loop',
    desc: 'Borderline candidates (40%–69%) route to a human review queue. Zero automated silent rejections.',
  },
  {
    icon: <BarChart3 size={22} />,
    title: 'Immutable Audit Trail',
    desc: 'Every AI score calculation and human override is logged with timestamps, reasons, and one-click CSV export.',
  },
];

const principles = [
  'Zero demographic signals in scoring — evaluated strictly on skills & merit',
  'Every decision accompanied by a plain-English explanation',
  'Recruiter override always available, mandatory written justification permanently logged',
  'Borderline candidates routed to human recruiters, never automatically rejected',
];

const sampleJDs = [
  {
    label: 'Biased Sample JD',
    text: 'We are seeking a rockstar ninja developer for our young and energetic team. The ideal candidate is an aggressive hustler from a top-tier Ivy League university with native English skills.',
  },
  {
    label: 'Inclusive Sample JD',
    text: 'We are seeking a skilled full-stack software engineer to join our collaborative engineering team. The ideal candidate has strong problem-solving abilities, proficiency in modern web frameworks, and excellent team communication skills.',
  }
];

export default function Landing() {
  const [demoText, setDemoText] = useState(sampleJDs[0].text);

  // Simple live teaser score calculation
  const getTeaserScore = (text) => {
    let score = 100;
    const lower = text.toLowerCase();
    const badWords = ['rockstar', 'ninja', 'young', 'energetic', 'hustler', 'ivy league', 'native english', 'aggressive'];
    badWords.forEach(w => {
      if (lower.includes(w)) score -= 12;
    });
    return Math.max(20, Math.min(100, score));
  };

  const currentScore = getTeaserScore(demoText);

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

      {/* ── Hero Section (Split Layout) ───────────────────────────────────────── */}
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

          {/* Right Column: Visual Showcase Container */}
          <div className="card" style={{
            padding: 24, background: 'var(--color-surface)', border: '1px solid var(--color-border)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)', borderRadius: 16, position: 'relative'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                Interactive Live Bias Scanner
              </span>
              <div style={{ display: 'flex', gap: 8 }}>
                {sampleJDs.map((s, idx) => (
                  <button
                    key={s.label}
                    onClick={() => setDemoText(s.text)}
                    className="btn btn-ghost btn-sm"
                    style={{
                      fontSize: 11, padding: '2px 8px',
                      background: demoText === s.text ? 'rgba(91,127,255,0.15)' : 'transparent',
                      color: demoText === s.text ? 'var(--color-primary)' : 'var(--color-text-muted)'
                    }}
                  >
                    {idx === 0 ? 'Biased Sample' : 'Inclusive Sample'}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <textarea
                  value={demoText}
                  onChange={(e) => setDemoText(e.target.value)}
                  rows={4}
                  className="input"
                  style={{ width: '100%', fontSize: 13, resize: 'none', lineHeight: 1.5, background: 'var(--color-surface-alt)' }}
                  placeholder="Paste or type a job description to test..."
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 90 }}>
                <BiasScoreRing score={currentScore} size={80} />
                <span style={{ fontSize: 11, marginTop: 6, fontWeight: 600, color: currentScore >= 70 ? 'var(--color-success)' : currentScore >= 40 ? 'var(--color-warning)' : 'var(--color-danger)' }}>
                  {currentScore >= 70 ? 'Inclusive' : currentScore >= 40 ? 'Moderate Bias' : 'High Bias'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How Employers Get Access (3-Step Trust Strip) ───────────────────── */}
      <section style={{ padding: '40px 0', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)', background: 'rgba(19, 24, 38, 0.4)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-primary)' }}>
              Enterprise Access Process
            </span>
            <h3 style={{ marginTop: 6, fontSize: 20 }}>How Employers Join FairHire</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
            <div className="card" style={{ padding: 20, textAlign: 'center' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(91,127,255,0.15)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontWeight: 700 }}>
                1
              </div>
              <h4 style={{ fontSize: 15, marginBottom: 6 }}>Request Access</h4>
              <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: 0 }}>
                Submit your company name, verified work domain, and diversity goals.
              </p>
            </div>

            <div className="card" style={{ padding: 20, textAlign: 'center' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(124,92,255,0.15)', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontWeight: 700 }}>
                2
              </div>
              <h4 style={{ fontSize: 15, marginBottom: 6 }}>We Verify Your Org</h4>
              <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: 0 }}>
                Our compliance team checks your organization to protect candidate data.
              </p>
            </div>

            <div className="card" style={{ padding: 20, textAlign: 'center' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(52,199,123,0.15)', color: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontWeight: 700 }}>
                3
              </div>
              <h4 style={{ fontSize: 15, marginBottom: 6 }}>Team Gets Invited</h4>
              <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: 0 }}>
                Recruiters receive secure single-use links scoped to your work domain.
              </p>
            </div>
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
