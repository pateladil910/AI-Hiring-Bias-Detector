import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Briefcase,
  Users,
  AlertTriangle,
  TrendingUp,
  Plus,
  ArrowRight,
  ShieldCheck,
  ClipboardList,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { analyticsAPI } from '../../lib/api';

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await analyticsAPI.dashboard();
        setData(res.data);
      } catch (e) {
        setError(e.response?.data?.error?.message || 'Failed to load dashboard metrics.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const kpis = data?.kpis || {};
  const funnel = data?.pipelineFunnel || {};
  const recentActivities = data?.recentActivities || [];

  const kpiCards = [
    {
      id: 'kpi-jobs',
      label: 'Jobs Posted',
      value: loading ? '…' : kpis.totalJobs ?? 0,
      sub: `${kpis.publishedJobs ?? 0} active`,
      icon: <Briefcase size={20} />,
      color: 'var(--color-primary)',
      link: '/recruiter/jobs',
    },
    {
      id: 'kpi-apps',
      label: 'Total Applications',
      value: loading ? '…' : kpis.totalApplications ?? 0,
      sub: 'Across all jobs',
      icon: <Users size={20} />,
      color: 'var(--color-accent)',
      link: '/recruiter/candidates',
    },
    {
      id: 'kpi-review',
      label: 'Pending Your Review',
      value: loading ? '…' : kpis.pendingReviewCount ?? 0,
      sub: 'Needs human decision',
      icon: <AlertTriangle size={20} />,
      color: 'var(--color-warning)',
      link: '/recruiter/review',
    },
    {
      id: 'kpi-bias',
      label: 'Avg JD Bias Score',
      value: loading ? '…' : kpis.avgBiasScore !== null ? `${kpis.avgBiasScore}/100` : 'N/A',
      sub: 'Target ≥ 80',
      icon: <TrendingUp size={20} />,
      color: 'var(--color-success)',
      link: '/recruiter/jobs',
    },
  ];

  const quickActions = [
    { to: '/recruiter/jobs/new', label: 'Post a New Job', icon: <Plus size={16} />, primary: true },
    { to: '/recruiter/candidates', label: 'Review Candidates', icon: <Users size={16} />, primary: false },
    { to: '/recruiter/review', label: 'Review Queue', icon: <AlertTriangle size={16} />, primary: false },
    { to: '/recruiter/audit', label: 'View Audit Trail', icon: <ArrowRight size={16} />, primary: false },
  ];

  return (
    <div className="page">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="page-title">
            {greeting()}, {user?.firstName} 👋
          </h1>
          <p className="page-subtitle">
            Here&apos;s a live summary of your unbiased hiring pipeline.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/recruiter/review" className="btn btn-ghost btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <AlertTriangle size={14} style={{ color: 'var(--color-warning)' }} />
            <span>Review Queue ({kpis.pendingReviewCount ?? 0})</span>
          </Link>
          <Link to="/recruiter/jobs/new" className="btn btn-primary btn-sm">
            <Plus size={15} /> Post a Job
          </Link>
        </div>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div>}

      {/* ── KPI Cards ────────────────────────────────────────────────────── */}
      <div className="grid-4" style={{ marginBottom: 32 }}>
        {kpiCards.map((k) => (
          <Link
            key={k.id}
            id={k.id}
            to={k.link}
            className="stat-card"
            style={{ textDecoration: 'none', transition: 'transform 0.15s ease' }}
          >
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14,
            }}>
              <span className="stat-label">{k.label}</span>
              <span style={{
                color: k.color,
                background: `${k.color}18`,
                padding: 7, borderRadius: 'var(--radius-md)',
                display: 'flex',
              }}>
                {k.icon}
              </span>
            </div>
            <div className="stat-value" style={{ color: k.color, fontSize: '1.85rem' }}>
              {k.value}
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 6 }}>
              {k.sub}
            </div>
          </Link>
        ))}
      </div>

      {/* ── Pipeline Overview & Quick Actions ────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 24, marginBottom: 32 }}>

        {/* Pipeline Stage Distribution */}
        <div className="card" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h3 style={{ margin: 0, fontSize: 15 }}>Pipeline Stage Funnel</h3>
            <Link to="/recruiter/candidates" style={{ fontSize: 12, color: 'var(--color-primary)', textDecoration: 'none' }}>
              View Candidates →
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'Applied', count: funnel.applied ?? 0, badge: 'badge-neutral', desc: 'Screened for technical skills' },
              { label: 'Test Sent', count: funnel.test_sent ?? 0, badge: 'badge-primary', desc: 'Awaiting candidate assessment' },
              { label: 'Test Completed', count: funnel.test_completed ?? 0, badge: 'badge-primary', desc: 'Graded & ready for eligibility' },
              { label: 'Eligible', count: funnel.eligible ?? 0, badge: 'badge-success', desc: 'Met technical thresholds' },
              { label: 'Needs Review', count: funnel.needs_review ?? 0, badge: 'badge-warning', desc: 'Pending human decision' },
              { label: 'Not Eligible', count: funnel.not_eligible ?? 0, badge: 'badge-danger', desc: 'Below objective criteria' },
            ].map((row) => {
              const maxCount = Math.max(kpis.totalApplications || 1, 1);
              const barPct = Math.round((row.count / maxCount) * 100);
              return (
                <div key={row.label} style={{
                  padding: '8px 0', borderBottom: '1px solid var(--color-border)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className={`badge ${row.badge}`} style={{ fontSize: 11 }}>{row.label}</span>
                      <span style={{ fontSize: 11.5, color: 'var(--color-text-muted)' }}>{row.desc}</span>
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 13, color: 'var(--color-text-primary)' }}>
                      {row.count}
                    </span>
                  </div>
                  <div className="progress-bar-track" style={{ height: 4 }}>
                    <div className="progress-bar-fill" style={{ width: `${barPct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: 18, fontSize: 15 }}>Quick Shortcuts</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
            {quickActions.map((a) => (
              <Link
                key={a.to}
                to={a.to}
                className={`btn ${a.primary ? 'btn-primary' : 'btn-ghost'}`}
                style={{ justifyContent: 'flex-start', padding: '10px 14px' }}
              >
                {a.icon} {a.label}
              </Link>
            ))}
          </div>

          <hr className="divider" style={{ margin: '18px 0 14px' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--color-text-muted)' }}>
            <ShieldCheck size={14} style={{ color: 'var(--color-success)' }} />
            <span>Blind screening & zero-demographics policy active</span>
          </div>
        </div>
      </div>

      {/* ── Recent Activity / Audit Feed ─────────────────────────────────── */}
      <div className="card" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 15 }}>Recent Compliance Activity</h3>
          <Link to="/recruiter/audit" style={{ fontSize: 12, color: 'var(--color-primary)', textDecoration: 'none' }}>
            Full Audit Trail →
          </Link>
        </div>

        {recentActivities.length === 0 ? (
          <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-muted)' }}>
            No recent activity recorded yet.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recentActivities.map((act) => (
              <div
                key={act.id}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px', background: 'var(--color-surface-alt)',
                  borderRadius: 'var(--radius-md)', fontSize: 12.5, gap: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Clock size={13} style={{ color: 'var(--color-text-muted)' }} />
                  <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{act.action}</span>
                  <span style={{ color: 'var(--color-text-secondary)', maxWidth: 450, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {act.reason || act.entityType}
                  </span>
                </div>
                <div style={{ color: 'var(--color-text-muted)', fontSize: 11, whiteSpace: 'nowrap' }}>
                  {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
