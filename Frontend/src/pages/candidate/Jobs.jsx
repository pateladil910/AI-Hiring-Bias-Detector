import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Search, ChevronRight, AlertTriangle } from 'lucide-react';
import { jobsAPI } from '../../lib/api';

export default function CandidateJobs() {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const { data } = await jobsAPI.list();
        setJobs(data.jobs);
      } catch (err) {
        setError('Failed to load open positions. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const filtered = jobs.filter((j) =>
    j.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page" style={{ maxWidth: 860, margin: '0 auto' }}>

      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Open Positions</h1>
        <p className="page-subtitle">
          All job descriptions have been bias-scanned before posting. Apply with confidence.
        </p>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 28 }}>
        <Search size={16} style={{
          position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
          color: 'var(--color-text-muted)', pointerEvents: 'none',
        }} />
        <input
          id="jobs-search"
          className="form-input"
          type="text"
          placeholder="Search by job title…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ paddingLeft: 38 }}
        />
      </div>

      {/* Loading skeletons */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{
              height: 90, borderRadius: 'var(--radius-lg)',
              background: 'var(--color-surface)', opacity: 0.7,
              animation: 'pulse 1.5s ease-in-out infinite',
            }} />
          ))}
        </div>
      )}

      {error && <div className="alert alert-error"><AlertTriangle size={14} /> {error}</div>}

      {/* Empty state */}
      {!loading && !error && filtered.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '60px 32px' }}>
          <Briefcase size={40} style={{ color: 'var(--color-border)', display: 'block', margin: '0 auto 16px' }} />
          <h3 style={{ marginBottom: 8 }}>
            {search ? 'No matching jobs' : 'No open positions right now'}
          </h3>
          <p style={{ fontSize: 14, maxWidth: 360, margin: '0 auto' }}>
            {search ? 'Try a different search term.' : 'Check back soon — new roles are posted regularly.'}
          </p>
        </div>
      )}

      {/* Job cards */}
      {!loading && filtered.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map((job) => (
            <div key={job.id} className="card" style={{
              padding: '20px 24px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              gap: 16, flexWrap: 'wrap',
              transition: 'border-color 150ms',
            }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
            >
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 8,
                    background: 'rgba(91,127,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--color-primary)', flexShrink: 0,
                  }}>
                    <Briefcase size={16} />
                  </div>
                  <h3 style={{ margin: 0, fontSize: 15 }}>{job.title}</h3>
                </div>
                <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--color-text-muted)' }}>
                  <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                  {job.skillProfileJson?.primary_field && (
                    <span style={{ textTransform: 'capitalize' }}>
                      {job.skillProfileJson.primary_field.replace('_', ' ')}
                    </span>
                  )}
                  {job.skillProfileJson?.experience_level && (
                    <span style={{ textTransform: 'capitalize' }}>
                      {job.skillProfileJson.experience_level}-level
                    </span>
                  )}
                  {job.biasScore !== null && (
                    <span style={{
                      color: job.biasScore >= 70 ? 'var(--color-success)' : job.biasScore >= 40 ? 'var(--color-warning)' : 'var(--color-danger)',
                      fontWeight: 500,
                    }}>
                      Bias score: {Math.round(job.biasScore)}
                    </span>
                  )}
                </div>
              </div>

              <Link
                to={`/candidate/apply/${job.id}`}
                className="btn btn-primary btn-sm"
                style={{ flexShrink: 0 }}
              >
                Apply <ChevronRight size={14} />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
