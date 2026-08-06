import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Upload, FileText, CheckCircle, AlertTriangle, ChevronLeft, X, Shield } from 'lucide-react';
import { jobsAPI, applicationsAPI } from '../../lib/api';

const ALLOWED_TYPES = ['.pdf', '.docx', '.txt'];
const MAX_SIZE_MB = 5;

function FileDrop({ file, onFile, onClear, uploading }) {
  const [dragging, setDragging] = useState(false);

  const handleDrag = (e) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = () => setDragging(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) onFile(f);
  };

  return (
    <div
      onDragOver={handleDrag}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        border: `2px dashed ${dragging ? 'var(--color-primary)' : 'var(--color-border)'}`,
        borderRadius: 'var(--radius-lg)',
        padding: '36px 24px',
        textAlign: 'center',
        background: dragging ? 'rgba(91,127,255,0.05)' : 'var(--color-surface-alt)',
        transition: 'all 200ms ease',
        cursor: 'pointer',
      }}
      onClick={() => !file && document.getElementById('resume-file-input').click()}
    >
      <input
        id="resume-file-input"
        type="file"
        accept=".pdf,.docx,.txt"
        style={{ display: 'none' }}
        onChange={(e) => e.target.files[0] && onFile(e.target.files[0])}
      />

      {file ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center' }}>
          <FileText size={28} style={{ color: 'var(--color-primary)' }} />
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-text-primary)' }}>{file.name}</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </div>
          </div>
          {!uploading && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onClear(); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex' }}
            >
              <X size={16} />
            </button>
          )}
        </div>
      ) : (
        <>
          <Upload size={32} style={{ color: 'var(--color-text-muted)', margin: '0 auto 12px', display: 'block' }} />
          <p style={{ margin: 0, fontWeight: 500, color: 'var(--color-text-primary)', fontSize: 14 }}>
            Drop your resume here, or <span style={{ color: 'var(--color-primary)' }}>browse</span>
          </p>
          <p style={{ margin: '6px 0 0', fontSize: 12, color: 'var(--color-text-muted)' }}>
            PDF, DOCX, or TXT — max {MAX_SIZE_MB}MB
          </p>
        </>
      )}
    </div>
  );
}

export default function Apply() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [jobLoading, setJobLoading] = useState(true);
  const [jobError, setJobError] = useState('');

  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [coverNote, setCoverNote] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [result, setResult] = useState(null); // success result

  // Load job details
  useEffect(() => {
    jobsAPI.get(jobId)
      .then(({ data }) => {
        if (data.job.status !== 'published') {
          setJobError('This job is no longer accepting applications.');
        } else {
          setJob(data.job);
        }
      })
      .catch(() => setJobError('Job not found.'))
      .finally(() => setJobLoading(false));
  }, [jobId]);

  const validateFile = (f) => {
    setFileError('');
    const ext = '.' + f.name.split('.').pop().toLowerCase();
    if (!ALLOWED_TYPES.includes(ext)) {
      setFileError(`Unsupported file type. Allowed: PDF, DOCX, TXT`);
      return false;
    }
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      setFileError(`File too large. Max ${MAX_SIZE_MB}MB.`);
      return false;
    }
    return true;
  };

  const handleFile = (f) => {
    if (validateFile(f)) setFile(f);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { setFileError('Please upload your resume.'); return; }
    if (!validateFile(file)) return;

    setSubmitting(true);
    setSubmitError('');
    try {
      const formData = new FormData();
      formData.append('jobId', jobId);
      formData.append('resume', file);
      if (coverNote.trim()) formData.append('coverNote', coverNote.trim());

      const { data } = await applicationsAPI.apply(formData);
      setResult(data);
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Application failed. Please try again.';
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success state ──────────────────────────────────────────────────────────
  if (result) {
    const score = result.scan?.biasScore;
    return (
      <div className="page" style={{ maxWidth: 620, margin: '0 auto', textAlign: 'center' }}>
        <div className="card" style={{ padding: '48px 40px' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'rgba(52,199,123,0.12)', margin: '0 auto 20px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <CheckCircle size={32} style={{ color: 'var(--color-success)' }} />
          </div>
          <h2 style={{ marginBottom: 8 }}>Application Submitted!</h2>
          <p style={{ maxWidth: 400, margin: '0 auto 24px', fontSize: 14 }}>
            Your application for <strong>{job?.title}</strong> has been received.
            You'll be notified when the recruiter reviews your profile.
          </p>

          {/* Resume scan summary */}
          <div style={{
            background: 'var(--color-surface-alt)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 20px',
            marginBottom: 28,
            textAlign: 'left',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Shield size={16} style={{ color: 'var(--color-primary)' }} />
              <span style={{ fontWeight: 600, fontSize: 13 }}>Resume Anonymisation Summary</span>
            </div>
            {result.scan?.redactedFields?.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {result.scan.redactedFields.map((f) => (
                  <span key={f.type} className="badge badge-primary" style={{ fontSize: 11 }}>
                    {f.type.replace(/_/g, ' ')} ×{f.count}
                  </span>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: 0 }}>
                {result.scan?.status === 'deferred'
                  ? 'Resume scan will complete shortly.'
                  : 'No PII detected to redact.'}
              </p>
            )}
            <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 10, marginBottom: 0 }}>
              Your personal details were removed before the recruiter sees your resume — ensuring fair evaluation.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/candidate/status" className="btn btn-primary">View My Applications</Link>
            <Link to="/candidate/jobs" className="btn btn-ghost">Browse More Jobs</Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Loading / error ────────────────────────────────────────────────────────
  if (jobLoading) {
    return (
      <div className="page" style={{ maxWidth: 620, margin: '0 auto' }}>
        <div className="card" style={{ height: 200, animation: 'pulse 1.5s ease-in-out infinite', opacity: 0.7 }} />
      </div>
    );
  }

  if (jobError) {
    return (
      <div className="page" style={{ maxWidth: 620, margin: '0 auto' }}>
        <div className="alert alert-error"><AlertTriangle size={14} /> {jobError}</div>
        <Link to="/candidate/jobs" className="btn btn-ghost" style={{ marginTop: 12, display: 'inline-flex' }}>
          <ChevronLeft size={15} /> Back to Jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="page" style={{ maxWidth: 700, margin: '0 auto' }}>
      {/* Back link */}
      <Link to="/candidate/jobs" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--color-text-muted)', textDecoration: 'none', marginBottom: 20 }}>
        <ChevronLeft size={14} /> All Jobs
      </Link>

      {/* Job header */}
      <div className="card" style={{ padding: '20px 24px', marginBottom: 20 }}>
        <h2 style={{ margin: '0 0 4px', fontSize: '1.25rem' }}>{job?.title}</h2>
        {job?.skillProfileJson && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: 12 }}>
            {job.skillProfileJson.primary_field && (
              <span className="badge badge-neutral" style={{ textTransform: 'capitalize' }}>
                {job.skillProfileJson.primary_field.replace('_', ' ')}
              </span>
            )}
            {job.skillProfileJson.experience_level && (
              <span className="badge badge-neutral" style={{ textTransform: 'capitalize' }}>
                {job.skillProfileJson.experience_level}-level
              </span>
            )}
            {job.skillProfileJson.tech_stack?.slice(0, 5).map((t) => (
              <span key={t} className="badge badge-primary" style={{ fontSize: 11 }}>{t}</span>
            ))}
          </div>
        )}
      </div>

      {/* Application form */}
      <div className="card" style={{ padding: '28px 28px' }}>
        <h3 style={{ marginBottom: 6, fontSize: '1rem' }}>Submit Application</h3>
        <p style={{ fontSize: 13, marginBottom: 24 }}>
          Your resume will be automatically anonymised (name, contact info stripped) before the recruiter sees it — ensuring a bias-free evaluation.
        </p>

        {/* Privacy notice */}
        <div style={{
          display: 'flex', gap: 10, background: 'rgba(91,127,255,0.06)',
          border: '1px solid rgba(91,127,255,0.2)', borderRadius: 'var(--radius-md)',
          padding: '10px 14px', marginBottom: 24,
        }}>
          <Shield size={15} style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 12, margin: 0, color: 'var(--color-text-secondary)' }}>
            <strong>Anonymised Mode:</strong> We strip your name, email, phone, and address before sharing your resume. The recruiter evaluates skills only.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Resume upload */}
          <div className="form-group">
            <label className="form-label">Resume <span style={{ color: 'var(--color-danger)' }}>*</span></label>
            <FileDrop file={file} onFile={handleFile} onClear={() => setFile(null)} uploading={submitting} />
            {fileError && (
              <span style={{ fontSize: 12, color: 'var(--color-danger)', marginTop: 4, display: 'block' }}>{fileError}</span>
            )}
          </div>

          {/* Cover note (optional) */}
          <div className="form-group">
            <label className="form-label" htmlFor="cover-note">
              Cover Note <span style={{ color: 'var(--color-text-muted)', fontSize: 11 }}>(optional)</span>
            </label>
            <textarea
              id="cover-note"
              value={coverNote}
              onChange={(e) => setCoverNote(e.target.value)}
              placeholder="Brief note to the hiring team…"
              rows={3}
              style={{
                width: '100%', background: 'var(--color-surface-alt)',
                border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
                padding: '10px 14px', color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-sans)', fontSize: 13, lineHeight: 1.6,
                resize: 'vertical',
              }}
            />
          </div>

          {submitError && (
            <div className="alert alert-error">
              <AlertTriangle size={14} style={{ flexShrink: 0 }} /> {submitError}
            </div>
          )}

          <button
            id="apply-submit"
            type="submit"
            className="btn btn-primary"
            disabled={submitting || !file}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {submitting ? (
              <>
                <span className="spinner" style={{ width: 15, height: 15 }} />
                Submitting & scanning resume…
              </>
            ) : (
              <>
                <Upload size={15} />
                Submit Application
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
