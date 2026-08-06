import { useAuth } from '../../context/AuthContext';
import { CheckCircle, Circle, Clock, Briefcase, FileText, ShieldCheck, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const STEPS = [
  {
    id: 'applied',
    label: 'Applied',
    icon: <FileText size={18} />,
    desc: 'Your application has been received and is being processed.',
  },
  {
    id: 'test',
    label: 'Aptitude Test',
    icon: <Clock size={18} />,
    desc: 'A field-specific test will be sent to your email. Complete it before the deadline.',
  },
  {
    id: 'decision',
    label: 'AI Decision',
    icon: <ShieldCheck size={18} />,
    desc: 'Your test and resume are reviewed by our AI. You will receive a transparent explanation.',
  },
  {
    id: 'interview',
    label: 'Interview',
    icon: <Calendar size={18} />,
    desc: 'If eligible, the recruiter will invite you for an interview.',
  },
];

export default function CandidateStatus() {
  const { user } = useAuth();

  // Phase 0: No real data yet — show empty state
  const hasApplications = false;

  return (
    <div className="page" style={{ maxWidth: 820, margin: '0 auto' }}>

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="page-header">
        <h1 className="page-title">My Applications</h1>
        <p className="page-subtitle">
          Track your application status in real time. Every decision comes with a plain-English explanation.
        </p>
      </div>

      {/* ── Empty state ──────────────────────────────────────────────────── */}
      {!hasApplications && (
        <div className="card" style={{ textAlign: 'center', padding: '60px 32px', marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 'var(--radius-full)',
            background: 'rgba(91,127,255,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
            color: 'var(--color-primary)',
          }}>
            <Briefcase size={24} />
          </div>
          <h3 style={{ marginBottom: 8 }}>No applications yet</h3>
          <p style={{ maxWidth: 360, margin: '0 auto 24px', fontSize: 14 }}>
            Browse open positions and apply. Your progress will appear here.
          </p>
          <Link to="/candidate/jobs" className="btn btn-primary" style={{ display: 'inline-flex' }}>
            Browse Open Jobs
          </Link>
        </div>
      )}

      {/* ── How it works — Pipeline Steps ────────────────────────────────── */}
      <div className="card">
        <h3 style={{ marginBottom: 24, fontSize: 15 }}>How the hiring pipeline works</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {STEPS.map((step, idx) => {
            const isLast = idx === STEPS.length - 1;
            return (
              <div key={step.id} style={{ display: 'flex', gap: 20 }}>
                {/* Step indicator column */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: 'var(--color-surface-alt)',
                    border: '2px solid var(--color-border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--color-text-muted)',
                    flexShrink: 0,
                  }}>
                    {step.icon}
                  </div>
                  {!isLast && (
                    <div style={{
                      width: 2, flex: 1, minHeight: 32,
                      background: 'var(--color-border)',
                      margin: '4px 0',
                    }} />
                  )}
                </div>

                {/* Step content */}
                <div style={{ paddingBottom: isLast ? 0 : 28, paddingTop: 8 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4, color: 'var(--color-text-primary)' }}>
                    {step.label}
                  </div>
                  <p style={{ fontSize: 13, margin: 0 }}>{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        <hr className="divider" style={{ margin: '24px 0 16px' }} />

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: 'rgba(52,199,123,0.06)', borderRadius: 'var(--radius-md)', padding: '12px 16px' }}>
          <CheckCircle size={16} style={{ color: 'var(--color-success)', flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 13, margin: 0, color: 'var(--color-text-secondary)' }}>
            <strong style={{ color: 'var(--color-text-primary)' }}>Our promise:</strong>{' '}
            You will never receive a silent rejection. Every AI decision is explained in plain English,
            and borderline cases are always reviewed by a human recruiter.
          </p>
        </div>
      </div>
    </div>
  );
}
