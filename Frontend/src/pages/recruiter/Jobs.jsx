import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Briefcase, Zap, Eye, FileEdit, AlertTriangle } from 'lucide-react';
import { jobsAPI } from '../../lib/api';

const STATUS_BADGE = {
  draft:      { label: 'Draft',     cls: 'badge-neutral' },
  published:  { label: 'Published', cls: 'badge-success' },
  closed:     { label: 'Closed',    cls: 'badge-neutral' },
};

function ScoreBar({ score }) {
  if (score === null || score === undefined) {
    return <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Not scanned</span>;
  }
  const color = score >= 70 ? 'var(--color-success)' : score >= 40 ? 'var(--color-warning)' : 'var(--color-danger)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 4, background: 'var(--color-border)', borderRadius: 2 }}>
        <div style={{ width: `${score}%`, height: '100%', background: color, borderRadius: 2, transition: 'width 400ms ease-out' }} />
      </div>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color, fontWeight: 600, minWidth: 28 }}>{Math.round(score)}</span>
    </div>
  );
}

export default function RecruiterJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const { data } = await jobsAPI.myJobs();
        setJobs(data.jobs);
      } catch (err) {
        setError(err.response?.data?.error?.message || 'Failed to load jobs');
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="page-title">Job Descriptions</h1>
          <p className="page-subtitle">Create and manage your job postings. Every JD must pass a bias scan before publishing.</p>
        </div>
        <Link to="/recruiter/jobs/new" className="btn btn-primary">
          <Plus size={16} /> New Job
        </Link>
      </div>

      {/* Content */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ height: 80, borderRadius: 'var(--radius-lg)', background: 'var(--color-surface)', opacity: 0.7, animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          <AlertTriangle size={14} /> {error}
        </div>
      )}

      {!loading && !error && jobs.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '60px 32px' }}>
          <Briefcase size={40} style={{ color: 'var(--color-border)', margin: '0 auto 16px', display: 'block' }} />
          <h3 style={{ marginBottom: 8 }}>No jobs yet</h3>
          <p style={{ maxWidth: 360, margin: '0 auto 24px', fontSize: 14 }}>
            Create your first job description. It will be bias-scanned before going live.
          </p>
          <Link to="/recruiter/jobs/new" className="btn btn-primary" style={{ display: 'inline-flex' }}>
            <Plus size={16} /> Create Job
          </Link>
        </div>
      )}

      {!loading && jobs.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {jobs.map((job) => {
            const statusMeta = STATUS_BADGE[job.status] || STATUS_BADGE.draft;
            return (
              <div key={job.id} className="card" style={{
                padding: '16px 20px',
                display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap',
              }}>
                {/* Title + status */}
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <h4 style={{ margin: 0, fontSize: 15 }}>{job.title}</h4>
                    <span className={`badge ${statusMeta.cls}`}>{statusMeta.label}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                    Created {new Date(job.createdAt).toLocaleDateString()}
                    {job.skillProfileJson?.primary_field && (
                      <> · <span style={{ textTransform: 'capitalize' }}>{job.skillProfileJson.primary_field.replace('_', ' ')}</span></>
                    )}
                  </div>
                </div>

                {/* Bias score bar */}
                <div style={{ width: 180 }}>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 4 }}>Bias Score</div>
                  <ScoreBar score={job.biasScore} />
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <Link to={`/recruiter/jobs/${job.id}/edit`} className="btn btn-ghost btn-sm">
                    <FileEdit size={14} /> Edit
                  </Link>
                  {job.status === 'draft' && job.biasScore === null && (
                    <Link to={`/recruiter/jobs/${job.id}/edit`} className="btn btn-primary btn-sm">
                      <Zap size={14} /> Scan
                    </Link>
                  )}
                  {job.status === 'published' && (
                    <Link to={`/candidate/jobs`} className="btn btn-ghost btn-sm">
                      <Eye size={14} /> View
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
