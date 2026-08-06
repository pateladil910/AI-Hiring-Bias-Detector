import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Clock, Circle, Briefcase, FileText, ShieldCheck, Calendar, ChevronRight, AlertTriangle } from 'lucide-react';
import { applicationsAPI } from '../../lib/api';

const STATUS_CONFIG = {
  applied:         { label: 'Applied',         step: 0, color: 'var(--color-primary)',  badge: 'badge-primary' },
  test_sent:       { label: 'Test Sent',        step: 1, color: 'var(--color-warning)',  badge: 'badge-warning' },
  test_completed:  { label: 'Test Completed',   step: 1, color: 'var(--color-warning)',  badge: 'badge-warning' },
  eligible:        { label: 'Eligible',         step: 2, color: 'var(--color-success)',  badge: 'badge-success' },
  not_eligible:    { label: 'Not Eligible',     step: 2, color: 'var(--color-danger)',   badge: 'badge-danger' },
  needs_review:    { label: 'Under Review',     step: 2, color: 'var(--color-warning)',  badge: 'badge-warning' },
  interview:       { label: 'Interview',        step: 3, color: 'var(--color-success)',  badge: 'badge-success' },
  rejected:        { label: 'Not Selected',     step: 3, color: 'var(--color-danger)',   badge: 'badge-danger' },
  hired:           { label: '🎉 Hired!',         step: 3, color: 'var(--color-success)',  badge: 'badge-success' },
};

const PIPELINE_STEPS = [
  { label: 'Applied',       icon: <FileText size={16} /> },
  { label: 'Assessment',    icon: <Clock size={16} /> },
  { label: 'AI Decision',   icon: <ShieldCheck size={16} /> },
  { label: 'Interview',     icon: <Calendar size={16} /> },
];

function PipelineBar({ activeStep }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 4 }}>
      {PIPELINE_STEPS.map((step, idx) => {
        const done = idx < activeStep;
        const active = idx === activeStep;
        const color = active ? 'var(--color-primary)' : done ? 'var(--color-success)' : 'var(--color-border)';
        return (
          <div key={step.label} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: active ? 'rgba(91,127,255,0.15)' : done ? 'rgba(52,199,123,0.12)' : 'var(--color-surface-alt)',
                border: `2px solid ${color}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color, flexShrink: 0,
                transition: 'all 300ms',
              }}>
                {done ? <CheckCircle size={14} style={{ color: 'var(--color-success)' }} /> : step.icon}
              </div>
              <span style={{ fontSize: 10, color, fontWeight: active ? 600 : 400, whiteSpace: 'nowrap' }}>
                {step.label}
              </span>
            </div>
            {idx < PIPELINE_STEPS.length - 1 && (
              <div style={{
                flex: 1, height: 2, margin: '-18px 4px 0',
                background: done ? 'var(--color-success)' : 'var(--color-border)',
                transition: 'background 300ms',
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function ApplicationCard({ app }) {
  const statusCfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.applied;
  const scoreColor = app.resumeBiasScore !== null
    ? (app.resumeBiasScore >= 70 ? 'var(--color-success)' : app.resumeBiasScore >= 40 ? 'var(--color-warning)' : 'var(--color-danger)')
    : 'var(--color-text-muted)';

  return (
    <div className="card" style={{ padding: '20px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <div>
          <h3 style={{ margin: '0 0 4px', fontSize: 15 }}>{app.Job?.title || 'Unknown Job'}</h3>
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
            Applied {new Date(app.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
        </div>
        <span className={`badge ${statusCfg.badge}`}>{statusCfg.label}</span>
      </div>

      {/* Pipeline progress bar */}
      <PipelineBar activeStep={statusCfg.step} />

      {/* Resume bias score (if scanned) */}
      {app.resumeBiasScore !== null && (
        <div style={{
          marginTop: 16, padding: '8px 12px',
          background: 'var(--color-surface-alt)', borderRadius: 'var(--radius-md)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Resume bias score</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, color: scoreColor }}>
            {Math.round(app.resumeBiasScore)}/100
          </span>
        </div>
      )}
    </div>
  );
}

export default function CandidateStatus() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    applicationsAPI.myApplications()
      .then(({ data }) => setApplications(data.applications))
      .catch(() => setError('Failed to load your applications.'))
      .finally(() => setLoading(false));
  }, []);

  const STEPS_EXPLAINER = [
    { label: 'Applied',        icon: <FileText size={18} />, desc: 'Your resume has been received and anonymised before review.' },
    { label: 'Aptitude Test',  icon: <Clock size={18} />,    desc: 'A field-specific aptitude test will be sent to your email.' },
    { label: 'AI Decision',    icon: <ShieldCheck size={18} />, desc: 'Skills-only evaluation. You receive a plain-English explanation.' },
    { label: 'Interview',      icon: <Calendar size={18} />, desc: 'If eligible, the recruiter will reach out to schedule an interview.' },
  ];

  return (
    <div className="page" style={{ maxWidth: 820, margin: '0 auto' }}>

      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="page-title">My Applications</h1>
          <p className="page-subtitle">Track your progress across all jobs you've applied to.</p>
        </div>
        <Link to="/candidate/jobs" className="btn btn-primary">
          Browse Jobs <ChevronRight size={15} />
        </Link>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[1, 2].map((i) => (
            <div key={i} style={{ height: 140, borderRadius: 'var(--radius-lg)', background: 'var(--color-surface)', opacity: 0.7, animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
        </div>
      )}

      {error && <div className="alert alert-error"><AlertTriangle size={14} /> {error}</div>}

      {/* Application cards */}
      {!loading && !error && applications.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
          {applications.map((app) => <ApplicationCard key={app.id} app={app} />)}
        </div>
      )}

      {/* Empty state / How it works */}
      {!loading && !error && applications.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '60px 32px', marginBottom: 28 }}>
          <Briefcase size={40} style={{ color: 'var(--color-border)', display: 'block', margin: '0 auto 16px' }} />
          <h3 style={{ marginBottom: 8 }}>No applications yet</h3>
          <p style={{ maxWidth: 380, margin: '0 auto 24px', fontSize: 14 }}>
            Browse open positions and apply. Your progress will appear here.
          </p>
          <Link to="/candidate/jobs" className="btn btn-primary" style={{ display: 'inline-flex' }}>
            Browse Open Jobs
          </Link>
        </div>
      )}

      {/* How it works pipeline explainer */}
      <div className="card">
        <h3 style={{ marginBottom: 24, fontSize: 15 }}>How the hiring pipeline works</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {STEPS_EXPLAINER.map((step, idx) => {
            const isLast = idx === STEPS_EXPLAINER.length - 1;
            return (
              <div key={step.label} style={{ display: 'flex', gap: 20 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: 'var(--color-surface-alt)',
                    border: '2px solid var(--color-border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--color-text-muted)',
                  }}>
                    {step.icon}
                  </div>
                  {!isLast && <div style={{ width: 2, flex: 1, minHeight: 24, background: 'var(--color-border)', margin: '4px 0' }} />}
                </div>
                <div style={{ paddingBottom: isLast ? 0 : 24, paddingTop: 8 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{step.label}</div>
                  <p style={{ fontSize: 13, margin: 0 }}>{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        <hr className="divider" style={{ margin: '24px 0 16px' }} />
        <div style={{ display: 'flex', gap: 10, background: 'rgba(52,199,123,0.06)', borderRadius: 'var(--radius-md)', padding: '12px 16px' }}>
          <CheckCircle size={15} style={{ color: 'var(--color-success)', flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 13, margin: 0, color: 'var(--color-text-secondary)' }}>
            <strong style={{ color: 'var(--color-text-primary)' }}>Our promise:</strong>{' '}
            No silent rejections. Every AI decision includes a plain-English explanation. Borderline cases go to a human recruiter.
          </p>
        </div>
      </div>
    </div>
  );
}
