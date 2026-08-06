import { useAuth } from '../../context/AuthContext';
import {
  Briefcase, Users, AlertTriangle, TrendingUp, Plus, ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const kpiCards = [
  { id: 'kpi-jobs',     label: 'Jobs Posted',         value: '—', icon: <Briefcase size={20} />,     color: 'var(--color-primary)' },
  { id: 'kpi-apps',     label: 'Total Applications',  value: '—', icon: <Users size={20} />,          color: 'var(--color-accent)' },
  { id: 'kpi-review',   label: 'Pending Your Review', value: '—', icon: <AlertTriangle size={20} />,  color: 'var(--color-warning)' },
  { id: 'kpi-bias',     label: 'Avg JD Bias Score',   value: '—', icon: <TrendingUp size={20} />,     color: 'var(--color-success)' },
];

const quickActions = [
  { to: '/recruiter/jobs/new', label: 'Post a New Job', icon: <Plus size={16} />, primary: true },
  { to: '/recruiter/candidates', label: 'Review Candidates', icon: <Users size={16} />, primary: false },
  { to: '/recruiter/audit', label: 'View Audit Trail', icon: <ArrowRight size={16} />, primary: false },
];

export default function RecruiterDashboard() {
  const { user } = useAuth();

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="page">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="page-title">
            {greeting()}, {user?.firstName} 👋
          </h1>
          <p className="page-subtitle">
            Here&apos;s a summary of your hiring pipeline.
          </p>
        </div>
        <Link to="/recruiter/jobs/new" className="btn btn-primary">
          <Plus size={16} /> Post a Job
        </Link>
      </div>

      {/* ── KPI Cards ────────────────────────────────────────────────────── */}
      <div className="grid-4" style={{ marginBottom: 32 }}>
        {kpiCards.map((k) => (
          <div key={k.id} id={k.id} className="stat-card">
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16,
            }}>
              <span className="stat-label">{k.label}</span>
              <span style={{
                color: k.color,
                background: `${k.color}18`,
                padding: 8, borderRadius: 'var(--radius-md)',
                display: 'flex',
              }}>
                {k.icon}
              </span>
            </div>
            <div className="stat-value" style={{ color: k.color }}>
              {k.value}
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 8 }}>
              Data loads in Phase 1
            </div>
          </div>
        ))}
      </div>

      {/* ── Quick Actions + Pipeline Overview ──────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 24, marginBottom: 32 }}>

        {/* Quick Actions */}
        <div className="card">
          <h3 style={{ marginBottom: 20, fontSize: 15 }}>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {quickActions.map((a) => (
              <Link
                key={a.to}
                to={a.to}
                className={`btn ${a.primary ? 'btn-primary' : 'btn-ghost'}`}
                style={{ justifyContent: 'center' }}
              >
                {a.icon} {a.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Pipeline Status */}
        <div className="card">
          <h3 style={{ marginBottom: 20, fontSize: 15 }}>Pipeline Overview</h3>
          {[
            { label: 'Applied', badge: 'badge-neutral',  value: '—', desc: 'Awaiting bias scan' },
            { label: 'Test Sent', badge: 'badge-primary', value: '—', desc: 'Pending aptitude test' },
            { label: 'Eligible', badge: 'badge-success', value: '—', desc: 'Ready for review' },
            { label: 'Needs Review', badge: 'badge-warning', value: '—', desc: 'Awaiting your decision' },
          ].map((row) => (
            <div key={row.label} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 0', borderBottom: '1px solid var(--color-border)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className={`badge ${row.badge}`}>{row.label}</span>
                <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{row.desc}</span>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                {row.value}
              </span>
            </div>
          ))}
          <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: '16px 0 0' }}>
            Live counts wire up in Phase 4 — Eligibility Engine.
          </p>
        </div>
      </div>

      {/* ── Phase Progress Note ──────────────────────────────────────────── */}
      <div className="alert alert-warning" style={{ marginTop: 8 }}>
        <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
        <div>
          <strong>Phase 0 — Foundation</strong><br />
          <span style={{ fontSize: 12 }}>
            Dashboard data will populate as features are built. Phase 1 (JD Bias Scanner) is next.
          </span>
        </div>
      </div>
    </div>
  );
}
