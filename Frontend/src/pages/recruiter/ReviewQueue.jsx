import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ClipboardList, CheckCircle, XCircle, AlertTriangle, Users } from 'lucide-react';
import { eligibilityAPI } from '../../lib/api';

// ─── Verdict Config ───────────────────────────────────────────────────────────
const VERDICT_CONFIG = {
  eligible:      { label: 'Eligible',      cls: 'badge-success', icon: '✅', color: 'var(--color-success)' },
  not_eligible:  { label: 'Not Eligible',  cls: 'badge-danger',  icon: '❌', color: 'var(--color-danger)' },
  needs_review:  { label: 'Needs Review',  cls: 'badge-warning', icon: '⚠️', color: 'var(--color-warning)' },
};

// ─── Mini Score Bar ───────────────────────────────────────────────────────────
function MiniBar({ value, max = 100, colorVar = 'var(--color-primary)' }) {
  const pct = max === 1 ? value * 100 : value;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 4, background: 'var(--color-border)', borderRadius: 2 }}>
        <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: colorVar, borderRadius: 2, transition: 'width 400ms ease' }} />
      </div>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: colorVar, fontWeight: 600, minWidth: 36 }}>
        {max === 1 ? `${Math.round(pct)}%` : `${Math.round(pct)}%`}
      </span>
    </div>
  );
}

// ─── Override Modal ───────────────────────────────────────────────────────────
function OverrideModal({ item, onClose, onSubmit }) {
  const [newVerdict, setNewVerdict] = useState('eligible');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    if (!reason.trim() || reason.trim().length < 10) {
      setError('Please provide a reason of at least 10 characters.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await onSubmit(item.verdict.id, newVerdict, reason.trim());
      onClose();
    } catch (e) {
      setError(e.response?.data?.error?.message || 'Override failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    }}>
      <div className="card" style={{ width: 480, padding: 32 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <ShieldCheck size={20} style={{ color: 'var(--color-primary)' }} />
          <h3 style={{ margin: 0 }}>Override AI Verdict</h3>
        </div>

        <div className="alert alert-warning" style={{ marginBottom: 20 }}>
          ⚠️ You are overriding the AI verdict for <strong>{item.anonymousLabel}</strong>.
          A reason is <strong>required</strong> and will be permanently recorded in the audit log.
        </div>

        {/* AI explanation */}
        <div style={{
          background: 'var(--color-surface-alt)', borderRadius: 'var(--radius-md)',
          padding: '12px 16px', marginBottom: 20, fontSize: 13,
          color: 'var(--color-text-secondary)', lineHeight: 1.6,
        }}>
          <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 4, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>AI Explanation</div>
          {item.verdict?.explanation || 'No explanation available.'}
        </div>

        {/* New verdict selector */}
        <div className="form-group" style={{ marginBottom: 16 }}>
          <label className="form-label">New Verdict</label>
          <select
            id="override-verdict-select"
            className="form-select"
            value={newVerdict}
            onChange={(e) => setNewVerdict(e.target.value)}
          >
            <option value="eligible">✅ Eligible</option>
            <option value="not_eligible">❌ Not Eligible</option>
            <option value="needs_review">⚠️ Keep in Review</option>
          </select>
        </div>

        {/* Reason textarea */}
        <div className="form-group" style={{ marginBottom: 20 }}>
          <label className="form-label">
            Override Reason <span style={{ color: 'var(--color-danger)' }}>*</span>
          </label>
          <textarea
            id="override-reason-input"
            className="form-input"
            rows={4}
            placeholder="Describe why you are overriding the AI verdict (min 10 characters)…"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            style={{ resize: 'vertical' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            {error
              ? <span style={{ fontSize: 12, color: 'var(--color-danger)' }}>{error}</span>
              : <span />
            }
            <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{reason.length} chars</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button
            id="confirm-override-btn"
            className="btn btn-primary"
            style={{ flex: 1 }}
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting
              ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Saving…</>
              : 'Confirm Override'
            }
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Review Card ──────────────────────────────────────────────────────────────
function ReviewCard({ item, index, onQuickApprove, onQuickReject, onOpenOverride }) {
  const verdictCfg = VERDICT_CONFIG[item.verdict?.verdict] || VERDICT_CONFIG.needs_review;
  const testScore = item.testScore ?? null;
  const skillPct  = item.resumeSkillMatch !== null ? item.resumeSkillMatch * 100 : null;
  const isOverridden = !!item.verdict?.overriddenBy;
  const scoreColor = testScore !== null
    ? (testScore >= 70 ? 'var(--color-success)' : testScore >= 45 ? 'var(--color-warning)' : 'var(--color-danger)')
    : 'var(--color-text-muted)';

  return (
    <div className="card" style={{ padding: '20px 24px' }}>
      {/* Row 1: identity + verdict + job */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--color-text-primary)', marginBottom: 2 }}>
            {item.anonymousLabel}
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
            {item.jobTitle} · Applied {new Date(item.appliedAt).toLocaleDateString()}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isOverridden && (
            <span className="badge badge-primary" style={{ fontSize: 10 }}>🖊 Overridden</span>
          )}
          <span className={`badge ${verdictCfg.cls}`}>{verdictCfg.icon} {verdictCfg.label}</span>
        </div>
      </div>

      {/* Row 2: Scores */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
            Test Score
          </div>
          {testScore !== null
            ? <MiniBar value={testScore} colorVar={scoreColor} />
            : <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>N/A</span>
          }
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
            Skill Match
          </div>
          {skillPct !== null
            ? <MiniBar value={skillPct} colorVar="var(--color-accent)" />
            : <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>N/A</span>
          }
        </div>
      </div>

      {/* Row 3: AI Explanation */}
      {item.verdict?.explanation && (
        <div style={{
          background: 'var(--color-surface-alt)', borderRadius: 'var(--radius-md)',
          padding: '10px 14px', marginBottom: 16, fontSize: 13,
          color: 'var(--color-text-secondary)', lineHeight: 1.6, borderLeft: `3px solid ${verdictCfg.color}`,
        }}>
          <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>AI: </span>
          {item.verdict.explanation}
        </div>
      )}

      {/* Override note */}
      {isOverridden && item.verdict?.overrideReason && (
        <div style={{
          background: 'rgba(91,127,255,0.07)', borderRadius: 'var(--radius-md)',
          padding: '10px 14px', marginBottom: 16, fontSize: 12,
          color: 'var(--color-text-secondary)', lineHeight: 1.5,
        }}>
          <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>Override Reason: </span>
          {item.verdict.overrideReason}
          {item.verdict.overriddenAt && (
            <span style={{ color: 'var(--color-text-muted)', marginLeft: 8 }}>
              · {new Date(item.verdict.overriddenAt).toLocaleDateString()}
            </span>
          )}
        </div>
      )}

      {/* Row 4: Actions */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          id={`approve-${item.applicationId}`}
          className="btn btn-sm btn-accent"
          onClick={() => onQuickApprove(item)}
          style={{ display: 'flex', alignItems: 'center', gap: 4 }}
        >
          <CheckCircle size={13} /> Approve as Eligible
        </button>
        <button
          id={`reject-${item.applicationId}`}
          className="btn btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(240,85,76,0.12)', color: 'var(--color-danger)', border: '1px solid rgba(240,85,76,0.25)' }}
          onClick={() => onQuickReject(item)}
        >
          <XCircle size={13} /> Mark Not Eligible
        </button>
        <button
          id={`override-${item.applicationId}`}
          className="btn btn-sm btn-ghost"
          onClick={() => onOpenOverride(item)}
          style={{ display: 'flex', alignItems: 'center', gap: 4 }}
        >
          <ShieldCheck size={13} /> Custom Override
        </button>
        <Link
          to={`/recruiter/test-results/${item.applicationId}`}
          className="btn btn-sm btn-ghost"
          style={{ display: 'flex', alignItems: 'center', gap: 4 }}
        >
          <ClipboardList size={13} /> Test Detail
        </Link>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ReviewQueue() {
  const [items, setItems]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [overrideItem, setOverrideItem] = useState(null);
  const [quickReason, setQuickReason]   = useState('');
  const [quickModal, setQuickModal]     = useState(null); // { item, type: 'approve'|'reject' }

  const loadQueue = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await eligibilityAPI.reviewQueue();
      setItems(res.data.items || []);
    } catch (e) {
      setError(e.response?.data?.error?.message || 'Failed to load review queue.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadQueue(); }, [loadQueue]);

  async function handleOverrideSubmit(verdictId, newVerdict, reason) {
    await eligibilityAPI.override(verdictId, newVerdict, reason);
    await loadQueue();
  }

  // Quick approve / reject — need a reason even for quick actions
  async function handleQuickSubmit() {
    if (!quickReason.trim() || quickReason.trim().length < 10) return;
    const { item, type } = quickModal;
    const newVerdict = type === 'approve' ? 'eligible' : 'not_eligible';
    await handleOverrideSubmit(item.verdict.id, newVerdict, quickReason.trim());
    setQuickModal(null);
    setQuickReason('');
  }

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="page-title">Human Review Queue</h1>
          <p className="page-subtitle">
            Candidates the AI flagged as borderline. Review AI reasoning and make the final call.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'rgba(245,185,61,0.1)', border: '1px solid rgba(245,185,61,0.25)',
            borderRadius: 'var(--radius-md)', padding: '6px 12px', fontSize: 12,
          }}>
            <AlertTriangle size={13} style={{ color: 'var(--color-warning)' }} />
            <span style={{ color: 'var(--color-warning)', fontWeight: 500 }}>
              {items.length} pending review
            </span>
          </div>
          <button id="refresh-queue-btn" className="btn btn-ghost btn-sm" onClick={loadQueue}>
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* Fair hiring notice */}
      <div className="alert alert-success" style={{ marginBottom: 24, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <ShieldCheck size={16} style={{ color: 'var(--color-success)', flexShrink: 0, marginTop: 1 }} />
        <div>
          <strong>Fair Hiring Policy:</strong> The AI never uses demographic signals (name, age, gender, address).
          All verdicts are based solely on technical test performance and skill tag matching.
          Every override is recorded permanently in the audit log with your reason.
        </div>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div>}

      {/* Loading skeleton */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ height: 160, borderRadius: 'var(--radius-lg)', background: 'var(--color-surface)', opacity: 0.7, animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && items.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '60px 32px' }}>
          <Users size={40} style={{ color: 'var(--color-border)', display: 'block', margin: '0 auto 16px' }} />
          <h3 style={{ marginBottom: 8 }}>No candidates pending review</h3>
          <p style={{ maxWidth: 360, margin: '0 auto', fontSize: 14 }}>
            All borderline candidates have been resolved. Check back after more eligibility verdicts are computed.
          </p>
        </div>
      )}

      {/* Review cards */}
      {!loading && items.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {items.map((item, i) => (
            <ReviewCard
              key={item.applicationId}
              item={item}
              index={i}
              onQuickApprove={(it) => { setQuickModal({ item: it, type: 'approve' }); setQuickReason(''); }}
              onQuickReject={(it) => { setQuickModal({ item: it, type: 'reject' }); setQuickReason(''); }}
              onOpenOverride={(it) => setOverrideItem(it)}
            />
          ))}
        </div>
      )}

      {/* Override modal */}
      {overrideItem && (
        <OverrideModal
          item={overrideItem}
          onClose={() => setOverrideItem(null)}
          onSubmit={handleOverrideSubmit}
        />
      )}

      {/* Quick approve/reject confirmation modal */}
      {quickModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }}>
          <div className="card" style={{ width: 440, padding: 28 }}>
            <h3 style={{ marginBottom: 8 }}>
              {quickModal.type === 'approve' ? '✅ Mark as Eligible' : '❌ Mark as Not Eligible'}
            </h3>
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 16 }}>
              A reason is required for audit purposes, even for quick decisions.
            </p>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Reason <span style={{ color: 'var(--color-danger)' }}>*</span></label>
              <textarea
                id="quick-reason-input"
                className="form-input"
                rows={3}
                placeholder="e.g. Strong portfolio reviewed, technical skills verified in previous conversation…"
                value={quickReason}
                onChange={(e) => setQuickReason(e.target.value)}
              />
              <span style={{ fontSize: 11, color: quickReason.length < 10 ? 'var(--color-danger)' : 'var(--color-text-muted)' }}>
                {quickReason.length}/10 min characters
              </span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setQuickModal(null)}>
                Cancel
              </button>
              <button
                id="quick-confirm-btn"
                className={`btn ${quickModal.type === 'approve' ? 'btn-accent' : 'btn-primary'}`}
                style={{ flex: 1 }}
                onClick={handleQuickSubmit}
                disabled={quickReason.trim().length < 10}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
