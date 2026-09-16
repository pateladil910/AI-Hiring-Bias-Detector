import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Users, Briefcase, ShieldCheck, AlertTriangle, Clock,
  ClipboardList, Zap, FileText, X, MessageSquare, Check,
  UserCheck, UserX
} from 'lucide-react';
import { jobsAPI, applicationsAPI, testsAPI, eligibilityAPI } from '../../lib/api';

// ─── Candidate Review & Status Transition Modal ──────────────────────────────
function CandidateReviewModal({ app, candidateIndex, onClose, onUpdated }) {
  const [status, setStatus] = useState(app.status);
  const [notes, setNotes] = useState(app.recruiterNotes || '');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async (newStatus) => {
    setSaving(true);
    setError('');
    setSaveSuccess(false);
    const targetStatus = newStatus || status;
    try {
      await applicationsAPI.updateStatus(app.id, {
        status: targetStatus,
        notes: notes.trim(),
      });
      setStatus(targetStatus);
      setSaveSuccess(true);
      if (onUpdated) {
        onUpdated(app.id, { status: targetStatus, recruiterNotes: notes.trim() });
      }
      setTimeout(() => {
        setSaveSuccess(false);
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to update candidate review.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 250, padding: 20,
    }}>
      <div className="card" style={{ maxWidth: 520, width: '100%', padding: 28, background: 'var(--color-surface)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <div className="badge badge-primary" style={{ fontSize: 11, marginBottom: 6 }}>
              Blind Candidate Review
            </div>
            <h3 style={{ margin: 0, fontSize: 18 }}>Candidate #{String(candidateIndex).padStart(3, '0')}</h3>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm"
            style={{ padding: 6 }}
          >
            <X size={16} />
          </button>
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}
        {saveSuccess && <div className="alert alert-success" style={{ marginBottom: 16 }}>Review notes &amp; status saved!</div>}

        {/* Status selection */}
        <div className="form-group" style={{ marginBottom: 16 }}>
          <label className="form-label" style={{ fontSize: 12 }}>Pipeline Stage</label>
          <select
            className="form-input"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="applied">Applied (Initial)</option>
            <option value="test_sent">Test Sent</option>
            <option value="test_completed">Test Completed</option>
            <option value="needs_review">Needs Review</option>
            <option value="eligible">Eligible (Passed)</option>
            <option value="interview">Interview Stage</option>
            <option value="hired">Hired</option>
            <option value="rejected">Not Selected</option>
          </select>
        </div>

        {/* Evaluation notes */}
        <div className="form-group" style={{ marginBottom: 20 }}>
          <label className="form-label" style={{ fontSize: 12 }}>
            Recruiter Evaluation &amp; Interview Notes
          </label>
          <textarea
            className="form-input"
            rows={4}
            placeholder="Record technical observations, interview feedback, or compliance justification..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            style={{ resize: 'vertical' }}
          />
          <span style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4, display: 'block' }}>
            Notes are audited and visible to authorized compliance reviewers.
          </span>
        </div>

        {/* Fast Action Buttons */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-sm btn-ghost"
            onClick={() => handleSave('interview')}
            disabled={saving}
            style={{ display: 'flex', alignItems: 'center', gap: 4, borderColor: 'var(--color-primary)' }}
          >
            <UserCheck size={14} /> Advance to Interview
          </button>
          <button
            type="button"
            className="btn btn-sm btn-ghost"
            onClick={() => handleSave('hired')}
            disabled={saving}
            style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-success)', borderColor: 'var(--color-success)' }}
          >
            <Check size={14} /> Mark Hired
          </button>
          <button
            type="button"
            className="btn btn-sm btn-ghost"
            onClick={() => handleSave('rejected')}
            disabled={saving}
            style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-danger)' }}
          >
            <UserX size={14} /> Reject
          </button>
        </div>

        {/* Modal actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onClose}
          >
            Close
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => handleSave()}
            disabled={saving}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            {saving ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <Check size={14} />}
            Save Review
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Redacted CV Slide-Over Drawer ────────────────────────────────────────────
function CvDrawer({ app, onClose }) {
  if (!app) return null;
  const resume = app.anonymisedText || app.anonymisedResume || app.anonymizedResume || '';
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
          zIndex: 200, animation: 'fadeIn 150ms ease-out',
        }}
      />
      {/* Drawer panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 520, maxWidth: '95vw',
        background: 'var(--color-surface)', borderLeft: '1px solid var(--color-border)',
        zIndex: 201, display: 'flex', flexDirection: 'column',
        animation: 'slideInRight 200ms ease-out',
        boxShadow: '-8px 0 32px rgba(0,0,0,0.4)',
      }}>
        {/* Drawer header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px', borderBottom: '1px solid var(--color-border)',
          flexShrink: 0,
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <FileText size={18} style={{ color: 'var(--color-primary)' }} />
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Redacted Resume</h3>
            </div>
            <p style={{ margin: '4px 0 0 28px', fontSize: 12, color: 'var(--color-text-muted)' }}>
              PII has been automatically stripped — names, emails, phones &amp; addresses removed
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent', border: '1px solid var(--color-border)',
              borderRadius: 8, padding: 6, cursor: 'pointer',
              color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* PII strip confirmation badge */}
        <div style={{
          margin: '16px 24px 0',
          padding: '8px 14px',
          background: 'rgba(52,199,123,0.08)',
          border: '1px solid rgba(52,199,123,0.2)',
          borderRadius: 8, fontSize: 12,
          color: 'var(--color-success)',
          display: 'flex', alignItems: 'center', gap: 8,
          flexShrink: 0,
        }}>
          <ShieldCheck size={14} />
          Candidate identity protected — zero PII in this view
        </div>

        {/* Resume body */}
        <div style={{ flex: 1, overflow: 'auto', padding: '16px 24px 24px' }}>
          {resume ? (
            <pre style={{
              whiteSpace: 'pre-wrap', wordBreak: 'break-word',
              fontFamily: 'var(--font-mono)', fontSize: 13, lineHeight: 1.8,
              color: 'var(--color-text-primary)',
              background: 'var(--color-surface-alt)',
              border: '1px solid var(--color-border)',
              borderRadius: 10, padding: '18px 20px', margin: 0,
            }}>
              {resume}
            </pre>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-text-muted)' }}>
              <FileText size={40} style={{ opacity: 0.3, display: 'block', margin: '0 auto 16px' }} />
              <p style={{ fontSize: 14 }}>Resume text not yet available.</p>
              <p style={{ fontSize: 12 }}>The candidate may still be completing their application.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

const STATUS_BADGE = {
  applied:        { label: 'Applied',         cls: 'badge-primary' },
  test_sent:      { label: 'Test Sent',        cls: 'badge-warning' },
  test_completed: { label: 'Test Completed',   cls: 'badge-warning' },
  eligible:       { label: 'Eligible',         cls: 'badge-success' },
  not_eligible:   { label: 'Not Eligible',     cls: 'badge-danger' },
  needs_review:   { label: 'Needs Review',     cls: 'badge-warning' },
  interview:      { label: 'Interview',        cls: 'badge-success' },
  rejected:       { label: 'Not Selected',     cls: 'badge-neutral' },
  hired:          { label: 'Hired',            cls: 'badge-success' },
};

function ScoreBar({ score }) {
  if (score === null || score === undefined) {
    return <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Scanning…</span>;
  }
  const color = score >= 70 ? 'var(--color-success)' : score >= 40 ? 'var(--color-warning)' : 'var(--color-danger)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 4, background: 'var(--color-border)', borderRadius: 2 }}>
        <div style={{ width: `${score}%`, height: '100%', background: color, borderRadius: 2, transition: 'width 400ms ease-out' }} />
      </div>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color, fontWeight: 600, minWidth: 28 }}>
        {Math.round(score)}
      </span>
    </div>
  );
}

export default function RecruiterCandidates() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const selectedJobId = searchParams.get('jobId') || '';

  const [myJobs, setMyJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [jobTitle, setJobTitle] = useState('');
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingApps, setLoadingApps] = useState(false);
  const [error, setError] = useState('');
  const [cvDrawerApp, setCvDrawerApp] = useState(null); // { id, anonymisedResume }
  // Phase 3 & 4 states
  const [testLoading, setTestLoading] = useState({});   // { [appId]: true/false }
  const [testSent, setTestSent] = useState({});          // { [appId]: true }
  const [eligibilityLoading, setEligibilityLoading] = useState({}); // { [appId]: true/false }
  const [reviewModalApp, setReviewModalApp] = useState(null);       // { app, index }

  // Load recruiter's jobs for the dropdown
  useEffect(() => {
    jobsAPI.myJobs()
      .then(({ data }) => {
        const published = data.jobs.filter((j) => j.status === 'published');
        setMyJobs(published);
        // Auto-select first published job if none in URL
        if (!selectedJobId && published.length > 0) {
          setSearchParams({ jobId: published[0].id });
        }
      })
      .catch(() => setError('Failed to load jobs.'))
      .finally(() => setLoadingJobs(false));
  }, []);

  // Load applications when job selection changes
  useEffect(() => {
    if (!selectedJobId) { setApplications([]); return; }
    setLoadingApps(true);
    setError('');
    setTestSent({});
    applicationsAPI.byJob(selectedJobId)
      .then(({ data }) => {
        setApplications(data.applications);
        setJobTitle(data.job?.title || '');
        // Pre-mark already-sent tests
        const alreadySent = {};
        data.applications.forEach((a) => {
          if (['test_sent', 'test_completed', 'eligible', 'not_eligible', 'needs_review', 'interview', 'rejected', 'hired'].includes(a.status)) {
            alreadySent[a.id] = true;
          }
        });
        setTestSent(alreadySent);
      })
      .catch((err) => {
        setError(err.response?.data?.error?.message || 'Failed to load applicants.');
        setApplications([]);
      })
      .finally(() => setLoadingApps(false));
  }, [selectedJobId]);

  // Phase 3: Send test to a candidate
  async function handleSendTest(appId) {
    setTestLoading((prev) => ({ ...prev, [appId]: true }));
    try {
      await testsAPI.generateForApplication(appId);
      setTestSent((prev) => ({ ...prev, [appId]: true }));
      // Update local status
      setApplications((prev) =>
        prev.map((a) => a.id === appId ? { ...a, status: 'test_sent' } : a)
      );
    } catch (e) {
      setError(e.response?.data?.error?.message || 'Failed to send test. Please try again.');
    } finally {
      setTestLoading((prev) => ({ ...prev, [appId]: false }));
    }
  }

  // Phase 4: Compute eligibility for a test_completed candidate
  async function handleComputeEligibility(appId) {
    setEligibilityLoading((prev) => ({ ...prev, [appId]: true }));
    try {
      const res = await eligibilityAPI.compute(appId);
      setApplications((prev) =>
        prev.map((a) => a.id === appId ? { ...a, status: res.data.applicationStatus } : a)
      );
    } catch (e) {
      setError(e.response?.data?.error?.message || 'Failed to compute eligibility.');
    } finally {
      setEligibilityLoading((prev) => ({ ...prev, [appId]: false }));
    }
  }

  // Load on-demand full anonymised CV for Redacted CV Drawer
  async function handleOpenCvDrawer(app) {
    setCvDrawerApp(app);
    if (!app.anonymisedText && !app.anonymisedResume) {
      try {
        const { data } = await applicationsAPI.get(app.id);
        setCvDrawerApp(data.application);
      } catch (err) {
        console.error('Failed to load application detail:', err);
      }
    }
  }

  const pendingReview = applications.filter((a) => a.status === 'needs_review').length;
  const eligible = applications.filter((a) => a.status === 'eligible').length;

  return (
    <>
      <CvDrawer app={cvDrawerApp} onClose={() => setCvDrawerApp(null)} />
      <div className="page">
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="page-title">Candidates</h1>
          <p className="page-subtitle">
            Applicants are shown in anonymised mode — personal details are hidden until you progress them.
          </p>
        </div>
        {/* Important: Anonymised Mode badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'rgba(91,127,255,0.08)', border: '1px solid rgba(91,127,255,0.2)',
          borderRadius: 'var(--radius-md)', padding: '6px 12px', fontSize: 12,
        }}>
          <ShieldCheck size={14} style={{ color: 'var(--color-primary)' }} />
          <span style={{ color: 'var(--color-primary)', fontWeight: 500 }}>Anonymised Mode Active</span>
        </div>
      </div>

      {/* Job selector */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 220 }}>
          <Briefcase size={16} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
          <div style={{ position: 'relative', flex: 1 }}>
            <select
              id="job-selector"
              className="form-select"
              value={selectedJobId}
              onChange={(e) => setSearchParams({ jobId: e.target.value })}
              disabled={loadingJobs}
              style={{ width: '100%' }}
            >
              <option value="">Select a job…</option>
              {myJobs.map((j) => (
                <option key={j.id} value={j.id}>{j.title}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Summary stats */}
        {applications.length > 0 && (
          <div style={{ display: 'flex', gap: 20 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 20, color: 'var(--color-primary)' }}>
                {applications.length}
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Total</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 20, color: 'var(--color-success)' }}>
                {eligible}
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Eligible</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 20, color: 'var(--color-warning)' }}>
                {pendingReview}
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Review</div>
            </div>
          </div>
        )}
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: 16 }}><AlertTriangle size={14} /> {error}</div>}

      {/* Loading */}
      {loadingApps && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ height: 70, borderRadius: 'var(--radius-lg)', background: 'var(--color-surface)', opacity: 0.7, animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
        </div>
      )}

      {/* No job selected */}
      {!selectedJobId && !loadingJobs && myJobs.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '60px 32px' }}>
          <Users size={40} style={{ color: 'var(--color-border)', display: 'block', margin: '0 auto 16px' }} />
          <h3 style={{ marginBottom: 8 }}>No published jobs yet</h3>
          <p style={{ maxWidth: 360, margin: '0 auto 24px', fontSize: 14 }}>
            Publish a job description first. Candidates will appear here after applying.
          </p>
          <Link to="/recruiter/jobs" className="btn btn-primary" style={{ display: 'inline-flex' }}>
            Go to Jobs
          </Link>
        </div>
      )}

      {/* Empty applications */}
      {!loadingApps && selectedJobId && applications.length === 0 && !error && (
        <div className="card" style={{ textAlign: 'center', padding: '48px 32px' }}>
          <Clock size={32} style={{ color: 'var(--color-border)', display: 'block', margin: '0 auto 14px' }} />
          <h4 style={{ marginBottom: 6 }}>No applications yet for "{jobTitle}"</h4>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
            Share the job listing — candidates will appear here once they apply.
          </p>
        </div>
      )}

      {/* Application rows — ANONYMISED */}
      {!loadingApps && applications.length > 0 && (
        <div>
          {/* Column headers */}
          <div style={{
            display: 'grid', gridTemplateColumns: '60px 1fr 180px 120px',
            padding: '8px 20px', fontSize: 11, fontWeight: 600,
            color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>
            <span>#</span>
            <span>Candidate</span>
            <span>Resume Bias Score</span>
            <span>Status</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {applications.map((app, idx) => {
              const statusCfg = STATUS_BADGE[app.status] || STATUS_BADGE.applied;
              const isSent = testSent[app.id];
              const isGenerating = testLoading[app.id];
              const hasScore = app.status === 'test_completed' || app.status === 'eligible' || app.status === 'not_eligible';
              return (
                <div key={app.id} className="card" style={{
                  padding: '14px 20px',
                  display: 'grid', gridTemplateColumns: '60px 1fr 160px 140px 160px',
                  alignItems: 'center', gap: 12,
                }}>
                  {/* Index */}
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text-muted)' }}>
                    #{String(idx + 1).padStart(3, '0')}
                  </span>

                  {/* Anonymised identity */}
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 14, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>Candidate #{String(idx + 1).padStart(3, '0')}</span>
                      {app.recruiterNotes && (
                        <span title="Review notes attached" style={{ cursor: 'pointer', fontSize: 12, color: 'var(--color-primary)' }}>
                          📝
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                      Applied {new Date(app.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Resume bias score */}
                  <ScoreBar score={app.resumeBiasScore} />

                  {/* Status */}
                  <span className={`badge ${statusCfg.cls}`}>{statusCfg.label}</span>

                  {/* Actions column */}
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                    {/* View Redacted CV */}
                    <button
                      id={`view-cv-${app.id}`}
                      className="btn btn-sm btn-ghost"
                      onClick={() => handleOpenCvDrawer(app)}
                      style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                      title="View anonymised resume"
                    >
                      <FileText size={12} /> Redacted CV
                    </button>

                    {/* Candidate Review & Status Transition */}
                    <button
                      id={`review-notes-${app.id}`}
                      className="btn btn-sm btn-ghost"
                      onClick={() => setReviewModalApp({ app, index: idx + 1 })}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        borderColor: app.recruiterNotes ? 'var(--color-primary)' : undefined,
                      }}
                      title="Review candidate notes and update status"
                    >
                      <MessageSquare size={12} />
                      {app.recruiterNotes ? 'Notes' : 'Review'}
                    </button>

                    {/* Send Test button — only for 'applied' status */}
                    {app.status === 'applied' && !isSent && (
                      <button
                        id={`send-test-${app.id}`}
                        className="btn btn-sm btn-accent"
                        onClick={() => handleSendTest(app.id)}
                        disabled={isGenerating}
                      >
                        {isGenerating ? (
                          <><span className="spinner" style={{ width: 12, height: 12 }} /> Generating…</>
                        ) : '📋 Send Test'}
                      </button>
                    )}

                    {/* Already sent badge */}
                    {isSent && app.status === 'test_sent' && (
                      <span className="badge badge-warning" style={{ fontSize: 11 }}>⏳ Awaiting</span>
                    )}

                    {/* Phase 4: Run Eligibility button when test_completed */}
                    {app.status === 'test_completed' && (
                      <button
                        id={`compute-eligibility-${app.id}`}
                        className="btn btn-sm btn-accent"
                        onClick={() => handleComputeEligibility(app.id)}
                        disabled={eligibilityLoading[app.id]}
                        style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                      >
                        {eligibilityLoading[app.id] ? (
                          <><span className="spinner" style={{ width: 12, height: 12 }} /> Computing…</>
                        ) : (
                          <><Zap size={12} /> Run Eligibility</>
                        )}
                      </button>
                    )}

                    {/* View Results — when test completed or later */}
                    {(app.status === 'test_completed' || app.status === 'eligible' || app.status === 'not_eligible' || app.status === 'needs_review') && (
                      <button
                        id={`view-results-${app.id}`}
                        className="btn btn-sm btn-ghost"
                        onClick={() => navigate(`/recruiter/test-results/${app.id}`)}
                        style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                      >
                        <ClipboardList size={12} /> Results
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 16, textAlign: 'center' }}>
            Candidate identities are revealed only after they advance to the interview stage (Phase 4).
          </p>
        </div>
      )}
    </div>

    {/* Candidate Review Modal */}
    {reviewModalApp && (
      <CandidateReviewModal
        app={reviewModalApp.app}
        candidateIndex={reviewModalApp.index}
        onClose={() => setReviewModalApp(null)}
        onUpdated={(appId, updates) => {
          setApplications((prev) =>
            prev.map((a) => (a.id === appId ? { ...a, ...updates } : a))
          );
          setReviewModalApp((prev) =>
            prev && prev.app.id === appId ? { ...prev, app: { ...prev.app, ...updates } } : prev
          );
        }}
      />
    )}
    </>
  );
}
