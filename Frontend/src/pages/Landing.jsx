import { Link } from 'react-router-dom';
import { ShieldCheck, Zap, Users, BarChart3, ArrowRight, CheckCircle } from 'lucide-react';

const features = [
  {
    icon: <ShieldCheck size={22} />,
    title: 'Real-Time Bias Detection',
    desc: 'Every job description and resume is scanned for biased language before it enters the pipeline.',
  },
  {
    icon: <Zap size={22} />,
    title: 'AI Aptitude Testing',
    desc: 'Field-specific tests are auto-generated from the JD skill profile — no manual question writing.',
  },
  {
    icon: <Users size={22} />,
    title: 'Human-in-the-Loop',
    desc: 'Borderline candidates always go to a recruiter. No silent auto-rejections, ever.',
  },
  {
    icon: <BarChart3 size={22} />,
    title: 'Full Audit Trail',
    desc: 'Every AI verdict and recruiter override is logged with a timestamp, actor, and reason.',
  },
];

const principles = [
  'No demographic signals in scoring — only skills & merit',
  'Every AI verdict explained in plain English',
  'Recruiter override always possible, always logged',
  'Borderline cases routed to human review, never auto-rejected',
];

export default function Landing() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* ── Nav ───────────────────────────────────────────────────────────── */}
      <nav style={{
        borderBottom: '1px solid var(--color-border)',
        padding: '16px 0',
        backdropFilter: 'blur(8px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(11,15,23,0.85)',
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 700, fontSize: 18, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
            Fair<span style={{ color: 'var(--color-primary)' }}>Hire</span>
          </span>
          <div style={{ display: 'flex', gap: 12 }}>
            <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section style={{ padding: '96px 0 80px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        {/* Background glow */}
        <div style={{
          position: 'absolute', top: '-80px', left: '50%', transform: 'translateX(-50%)',
          width: 600, height: 600,
          background: 'radial-gradient(circle, rgba(91,127,255,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div className="container" style={{ position: 'relative' }}>
          <div className="badge badge-primary" style={{ marginBottom: 24, fontSize: 12 }}>
            AI-Powered · Explainable · Fair
          </div>

          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            maxWidth: 700,
            margin: '0 auto 20px',
          }}>
            Hire on merit.<br />
            <span style={{
              background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Eliminate bias.
            </span>
          </h1>

          <p style={{ maxWidth: 560, margin: '0 auto 40px', fontSize: 16, lineHeight: 1.7, color: 'var(--color-text-secondary)' }}>
            Post a fair JD, let AI screen and test candidates without bias, and let a
            recruiter make the final explainable call — with a chatbot doing the busywork.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register?role=recruiter" className="btn btn-primary btn-lg">
              I'm a Recruiter <ArrowRight size={18} />
            </Link>
            <Link to="/register?role=candidate" className="btn btn-ghost btn-lg">
              I'm a Candidate
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features Grid ─────────────────────────────────────────────────── */}
      <section style={{ padding: '0 0 80px' }}>
        <div className="container">
          <div className="grid-2" style={{ gap: 20 }}>
            {features.map((f) => (
              <div key={f.title} className="card" style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 'var(--radius-md)',
                  background: 'rgba(91,127,255,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--color-primary)', flexShrink: 0,
                }}>
                  {f.icon}
                </div>
                <div>
                  <h3 style={{ marginBottom: 6, fontSize: 15 }}>{f.title}</h3>
                  <p style={{ fontSize: 13, margin: 0 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Fairness Principles ───────────────────────────────────────────── */}
      <section style={{ padding: '60px 0', borderTop: '1px solid var(--color-border)' }}>
        <div className="container" style={{ maxWidth: 680, textAlign: 'center' }}>
          <h2 style={{ marginBottom: 8 }}>Fairness, non-negotiable</h2>
          <p style={{ marginBottom: 40, fontSize: 15 }}>
            These principles are enforced at the code level, not just written in a policy doc.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, textAlign: 'left' }}>
            {principles.map((p) => (
              <div key={p} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <CheckCircle size={18} style={{ color: 'var(--color-success)', flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>{p}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer style={{
        marginTop: 'auto',
        borderTop: '1px solid var(--color-border)',
        padding: '24px 0',
        textAlign: 'center',
      }}>
        <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: 0 }}>
          FairHire · AI Hiring Bias Detector · College Project Build
        </p>
      </footer>
    </div>
  );
}
