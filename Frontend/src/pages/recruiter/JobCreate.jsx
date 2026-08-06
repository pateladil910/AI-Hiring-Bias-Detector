import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, Zap, Eye, ChevronRight, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { jobsAPI } from '../../lib/api';
import BiasScoreRing from '../../components/BiasScoreRing';
import BiasFlagPanel from '../../components/BiasFlagPanel';

const WS_URL = `ws://localhost:5000/ws/bias-score`;

export default function JobCreate() {
  const navigate = useNavigate();
  const { id: jobId } = useParams(); // for edit mode

  // ── Form state ─────────────────────────────────────────────────────────────
  const [title, setTitle] = useState('');
  const [rawText, setRawText] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [savedJobId, setSavedJobId] = useState(jobId || null);

  // ── Live score (WebSocket) ─────────────────────────────────────────────────
  const [liveScore, setLiveScore] = useState(null);
  const [liveFlagCount, setLiveFlagCount] = useState(0);
  const [wsConnected, setWsConnected] = useState(false);
  const wsRef = useRef(null);

  // ── Full analysis (on button click) ───────────────────────────────────────
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analyzed, setAnalyzed] = useState(false);

  // ── Publish state ──────────────────────────────────────────────────────────
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [publishError, setPublishError] = useState('');

  // ── Load existing job (edit mode) ──────────────────────────────────────────
  useEffect(() => {
    if (jobId) {
      jobsAPI.get(jobId).then(({ data }) => {
        setTitle(data.job.title || '');
        setRawText(data.job.rawText || '');
        setLiveScore(data.job.biasScore);
        setPublished(data.job.status === 'published');
      }).catch(() => {});
    }
  }, [jobId]);

  // ── WebSocket: connect on mount ────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('token');
    const ws = new WebSocket(`${WS_URL}?token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => setWsConnected(true);
    ws.onclose = () => setWsConnected(false);
    ws.onerror = () => setWsConnected(false);

    ws.onmessage = (evt) => {
      try {
        const msg = JSON.parse(evt.data);
        if (msg.type === 'score_update') {
          if (msg.score !== null && msg.score !== undefined) {
            setLiveScore(msg.score);
          }
          setLiveFlagCount(msg.flag_count || 0);
        }
      } catch {}
    };

    return () => ws.close();
  }, []);

  // ── Send text to WebSocket when rawText changes ────────────────────────────
  useEffect(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN && rawText) {
      wsRef.current.send(JSON.stringify({ type: 'score', text: rawText }));
    }
    // Reset analysis when text changes
    if (analyzed) {
      setAnalyzed(false);
      setAnalysisResult(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawText]);

  // ── Save draft ─────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!title.trim() || rawText.trim().length < 50) {
      setSaveError('Title and a description of at least 50 characters are required.');
      return;
    }
    setSaving(true);
    setSaveError('');
    try {
      if (savedJobId) {
        const { data } = await jobsAPI.update(savedJobId, { title, rawText });
        setSavedJobId(data.job.id);
      } else {
        const { data } = await jobsAPI.create({ title, rawText });
        setSavedJobId(data.job.id);
        navigate(`/recruiter/jobs/${data.job.id}/edit`, { replace: true });
      }
    } catch (err) {
      setSaveError(err.response?.data?.error?.message || 'Save failed. Try again.');
    } finally {
      setSaving(false);
    }
  };

  // ── Run full analysis ──────────────────────────────────────────────────────
  const handleAnalyze = async () => {
    if (!savedJobId) {
      await handleSave();
      return;
    }
    setAnalyzing(true);
    try {
      const { data } = await jobsAPI.analyze(savedJobId);
      setAnalysisResult(data.analysis);
      setLiveScore(data.analysis.score);
      setLiveFlagCount(data.analysis.flag_count);
      setAnalyzed(true);
    } catch (err) {
      setSaveError(err.response?.data?.error?.message || 'Analysis failed. Check that the AI service is running.');
    } finally {
      setAnalyzing(false);
    }
  };

  // ── Publish ────────────────────────────────────────────────────────────────
  const handlePublish = async () => {
    if (!savedJobId) return;
    setPublishing(true);
    setPublishError('');
    try {
      await jobsAPI.publish(savedJobId);
      setPublished(true);
    } catch (err) {
      setPublishError(err.response?.data?.error?.message || 'Publish failed.');
    } finally {
      setPublishing(false);
    }
  };

  const wordCount = rawText.trim() ? rawText.trim().split(/\s+/).length : 0;
  const canPublish = analyzed && (analysisResult?.score ?? liveScore) !== null && savedJobId;

  return (
    <div className="page" style={{ maxWidth: 1200, margin: '0 auto' }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '1.5rem' }}>
            {jobId ? 'Edit Job Description' : 'Create Job Description'}
          </h1>
          <p className="page-subtitle">
            Write your JD — the bias score updates live as you type.
            {!wsConnected && <span style={{ color: 'var(--color-warning)', fontSize: 12 }}> (Live scoring offline)</span>}
          </p>
        </div>

        {published && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-success)', fontSize: 14, fontWeight: 500 }}>
            <CheckCircle size={16} /> Published
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'flex-start' }}>

        {/* ── Left: Editor ───────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Title input */}
          <div className="card" style={{ padding: 20 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="jd-title">Job Title</label>
              <input
                id="jd-title"
                className="form-input"
                type="text"
                placeholder="e.g. Senior Frontend Engineer"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ fontSize: 16, fontWeight: 500 }}
              />
            </div>
          </div>

          {/* JD textarea */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <label className="form-label" htmlFor="jd-text" style={{ marginBottom: 0 }}>Job Description</label>
              <span style={{ fontSize: 12, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                {wordCount} words
              </span>
            </div>
            <textarea
              id="jd-text"
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder={`Describe the role, responsibilities, and requirements.\n\nTip: Watch the bias score on the right update as you type.`}
              style={{
                width: '100%',
                minHeight: 380,
                resize: 'vertical',
                background: 'var(--color-surface-alt)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: '14px 16px',
                color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-sans)',
                fontSize: 14,
                lineHeight: 1.7,
                outline: 'none',
                transition: 'border-color 150ms',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
            />
          </div>

          {/* Error / messages */}
          {saveError && (
            <div className="alert alert-error">
              <AlertTriangle size={14} style={{ flexShrink: 0 }} />
              {saveError}
            </div>
          )}
          {publishError && (
            <div className="alert alert-error">
              <AlertTriangle size={14} style={{ flexShrink: 0 }} />
              {publishError}
            </div>
          )}
          {published && (
            <div className="alert alert-success">
              <CheckCircle size={14} style={{ flexShrink: 0 }} />
              Job published! Candidates can now apply. <a href="/recruiter/jobs" style={{ color: 'inherit', textDecoration: 'underline' }}>View all jobs →</a>
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button
              id="jd-save"
              className="btn btn-ghost"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <Save size={15} />}
              {saving ? 'Saving…' : 'Save Draft'}
            </button>

            <button
              id="jd-analyze"
              className="btn btn-primary"
              onClick={handleAnalyze}
              disabled={analyzing || rawText.trim().length < 50}
            >
              {analyzing ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <Zap size={15} />}
              {analyzing ? 'Analyzing…' : 'Analyze Bias'}
            </button>

            {analyzed && !published && (
              <button
                id="jd-publish"
                className="btn btn-accent"
                onClick={handlePublish}
                disabled={publishing || !canPublish}
                title={!canPublish ? 'Run bias analysis first' : ''}
              >
                {publishing ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <Eye size={15} />}
                {publishing ? 'Publishing…' : 'Publish JD'}
              </button>
            )}
          </div>
        </div>

        {/* ── Right: Bias score panel ─────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 24 }}>

          {/* Score ring card */}
          <div className="card" style={{ textAlign: 'center', padding: '28px 20px' }}>
            <div style={{ marginBottom: 16 }}>
              <BiasScoreRing score={liveScore} size={120} loading={analyzing} />
            </div>

            {liveFlagCount > 0 && (
              <div className="badge badge-warning" style={{ margin: '0 auto' }}>
                {liveFlagCount} flag{liveFlagCount !== 1 ? 's' : ''} detected
              </div>
            )}

            {/* Publish requirement note */}
            {!analyzed && savedJobId && (
              <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 14, lineHeight: 1.5 }}>
                Run <strong>Analyze Bias</strong> before publishing. JDs cannot go live without a bias scan.
              </p>
            )}
          </div>

          {/* Skill profile (shown after analysis) */}
          {analysisResult?.skill_profile && (
            <div className="card" style={{ padding: 16 }}>
              <h4 style={{ fontSize: 13, marginBottom: 12 }}>JD Skill Profile</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Field</span>
                  <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>
                    {analysisResult.skill_profile.primary_field?.replace('_', ' ')}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Level</span>
                  <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>
                    {analysisResult.skill_profile.experience_level}
                  </span>
                </div>
                {analysisResult.skill_profile.years_required && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>Years</span>
                    <span style={{ fontWeight: 600 }}>{analysisResult.skill_profile.years_required}+</span>
                  </div>
                )}
                {analysisResult.skill_profile.tech_stack?.length > 0 && (
                  <div style={{ marginTop: 4 }}>
                    <div style={{ color: 'var(--color-text-muted)', marginBottom: 6 }}>Tech Stack</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {analysisResult.skill_profile.tech_stack.slice(0, 8).map((t) => (
                        <span key={t} className="badge badge-primary" style={{ fontSize: 11 }}>{t}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <p style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 12, marginBottom: 0 }}>
                Skill profile drives aptitude test generation (Phase 3)
              </p>
            </div>
          )}

          {/* Bias flags panel */}
          <div className="card" style={{ padding: 16 }}>
            <h4 style={{ fontSize: 13, marginBottom: 14 }}>
              Bias Flags
              {analyzed && analysisResult?.flag_count > 0 && (
                <span style={{ marginLeft: 8, color: 'var(--color-warning)', fontWeight: 400, fontSize: 12 }}>
                  ({analysisResult.flag_count} found)
                </span>
              )}
            </h4>
            <BiasFlagPanel
              flags={analysisResult?.flags || []}
              explanation={analysisResult?.explanation || ''}
              loading={analyzing}
              analyzed={analyzed}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
