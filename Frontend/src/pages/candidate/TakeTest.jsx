import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { testsAPI } from '../../lib/api';

// ─── Score Ring SVG ───────────────────────────────────────────────────────────
function ScoreRing({ score }) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(Math.max(score, 0), 100);
  const offset = circumference - (pct / 100) * circumference;
  const color = pct >= 70 ? '#34C77B' : pct >= 45 ? '#F5B93D' : '#F0554C';

  return (
    <div className="score-ring-wrapper">
      <svg width="180" height="180" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="90" cy="90" r={radius} fill="none" stroke="#262E42" strokeWidth="12" />
        <circle
          cx="90" cy="90" r={radius} fill="none"
          stroke={color} strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)' }}
        />
      </svg>
      <div style={{
        position: 'absolute',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        transform: 'translateY(-10px)',
      }}>
        <span style={{ fontSize: '2.5rem', fontWeight: 700, color, fontFamily: 'var(--font-mono)' }}>
          {Math.round(pct)}%
        </span>
        <span className="score-ring-label">Score</span>
      </div>
    </div>
  );
}

// ─── Timer Hook ───────────────────────────────────────────────────────────────
function useCountdown(totalSeconds, onExpire) {
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const expiredRef = useRef(false);

  useEffect(() => {
    if (secondsLeft <= 0) {
      if (!expiredRef.current) { expiredRef.current = true; onExpire(); }
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft, onExpire]);

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');
  const timerClass = secondsLeft <= 60 ? 'danger' : secondsLeft <= 120 ? 'warning' : '';

  return { display: `${mm}:${ss}`, timerClass, secondsLeft };
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function TakeTest() {
  const { testId } = useParams();
  const navigate = useNavigate();

  // Data
  const [test, setTest]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  // Test state
  const [currentQ, setCurrentQ]     = useState(0);
  const [answers, setAnswers]        = useState({});   // { question_id: { answer_index? | answer_text? } }
  const [flagged, setFlagged]        = useState({});   // { question_id: true }
  const [submitted, setSubmitted]    = useState(false);
  const [submitting, setSubmitting]  = useState(false);
  const [result, setResult]          = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  // ── Fetch test on mount ───────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res = await testsAPI.get(testId);
        const t = res.data.test;
        if (t.alreadySubmitted) {
          setSubmitted(true);
          setError('You have already submitted this test.');
        }
        setTest(t);
      } catch (e) {
        setError(e.response?.data?.error?.message || 'Failed to load test.');
      } finally {
        setLoading(false);
      }
    })();
  }, [testId]);

  // ── Auto-submit on timer expiry ───────────────────────────────────────────
  const handleTimerExpire = useCallback(() => {
    if (!submitted) handleSubmit(true);
  }, [submitted]); // eslint-disable-line react-hooks/exhaustive-deps

  const { display: timerDisplay, timerClass } = useCountdown(
    test ? test.timeLimitMinutes * 60 : 0,
    handleTimerExpire
  );

  // ── Answer handlers ───────────────────────────────────────────────────────
  function selectMCQ(qid, idx) {
    setAnswers((prev) => ({ ...prev, [qid]: { answer_index: idx } }));
  }

  function typeShortAnswer(qid, text) {
    setAnswers((prev) => ({ ...prev, [qid]: { answer_text: text } }));
  }

  function toggleFlag(qid) {
    setFlagged((prev) => ({ ...prev, [qid]: !prev[qid] }));
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  async function handleSubmit(auto = false) {
    if (submitted || submitting) return;
    setSubmitting(true);
    setShowConfirm(false);

    const formatted = Object.entries(answers).map(([qid, ans]) => ({
      question_id: qid,
      ...ans,
    }));

    try {
      const res = await testsAPI.submit(testId, formatted);
      setResult(res.data);
      setSubmitted(true);
    } catch (e) {
      if (!auto) {
        setError(e.response?.data?.error?.message || 'Submission failed. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  const answeredCount = test ? test.questions.filter((q) => answers[q.id] !== undefined).length : 0;
  const totalQ = test?.questions.length || 0;

  function getDotClass(q, i) {
    if (i === currentQ) return 'q-nav-dot active';
    if (flagged[q.id]) return 'q-nav-dot flagged';
    if (answers[q.id] !== undefined) return 'q-nav-dot answered';
    return 'q-nav-dot';
  }

  // ─────────────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="spinner" style={{ width: 36, height: 36, margin: '0 auto 16px' }} />
        <p>Loading your test…</p>
      </div>
    </div>
  );

  if (error && !test) return (
    <div className="page">
      <div className="alert alert-error">{error}</div>
      <button className="btn btn-ghost" style={{ marginTop: 16 }} onClick={() => navigate('/candidate/status')}>
        ← Back to My Applications
      </button>
    </div>
  );

  // ── Result Screen ─────────────────────────────────────────────────────────
  if (submitted && result) {
    const { submission, breakdown } = result;
    const score = submission?.autoScore ?? 0;
    const passed = score >= 50;
    const mcqBreakdown = (breakdown || []).filter((b) => b.type === 'mcq');
    const saBreakdown  = (breakdown || []).filter((b) => b.type === 'short_answer');

    return (
      <div className="page" style={{ maxWidth: 860, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <span style={{
            display: 'inline-block', padding: '4px 16px', borderRadius: 'var(--radius-full)',
            background: passed ? 'rgba(52,199,123,0.15)' : 'rgba(240,85,76,0.12)',
            color: passed ? 'var(--color-success)' : 'var(--color-danger)',
            fontSize: 13, fontWeight: 600, marginBottom: 16,
          }}>
            {passed ? '✓ Test Passed' : '✗ Below Pass Threshold'}
          </span>
          <h1 style={{ fontSize: '2rem', marginBottom: 8 }}>Test Completed</h1>
          <p>{test.jobTitle}</p>
        </div>

        {/* Score Ring */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 48 }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ScoreRing score={score} />
          </div>
        </div>

        {/* Stats row */}
        <div className="grid-3" style={{ marginBottom: 40 }}>
          <div className="stat-card" style={{ textAlign: 'center' }}>
            <div className="stat-value">{answeredCount}/{totalQ}</div>
            <div className="stat-label">Questions Answered</div>
          </div>
          <div className="stat-card" style={{ textAlign: 'center' }}>
            <div className="stat-value" style={{ color: 'var(--color-success)' }}>
              {mcqBreakdown.filter((b) => b.is_correct).length}
            </div>
            <div className="stat-label">MCQ Correct</div>
          </div>
          <div className="stat-card" style={{ textAlign: 'center' }}>
            <div className="stat-value" style={{ fontFamily: 'var(--font-mono)', fontSize: '1.8rem' }}>
              {Math.round((submission?.llmConfidence || 0) * 100)}%
            </div>
            <div className="stat-label">Grading Confidence</div>
          </div>
        </div>

        {/* MCQ Breakdown */}
        {mcqBreakdown.length > 0 && (
          <div className="card" style={{ marginBottom: 24 }}>
            <h3 style={{ marginBottom: 16 }}>Multiple Choice Breakdown</h3>
            {/* Header row */}
            <div className="breakdown-row" style={{
              fontWeight: 600, fontSize: 12, color: 'var(--color-text-muted)',
              textTransform: 'uppercase', letterSpacing: '0.05em',
            }}>
              <span>Question</span>
              <span>Your Answer</span>
              <span>Correct Answer</span>
              <span style={{ textAlign: 'center' }}>Result</span>
            </div>
            {mcqBreakdown.map((b) => (
              <div key={b.question_id} className={`breakdown-row ${b.is_correct ? 'correct' : 'incorrect'}`}>
                <span style={{ color: 'var(--color-text-primary)' }}>{b.question}</span>
                <span style={{ color: b.is_correct ? 'var(--color-success)' : 'var(--color-danger)' }}>
                  {b.not_answered ? '—' : b.submitted_answer || '—'}
                </span>
                <span style={{ color: 'var(--color-success)' }}>{b.correct_answer}</span>
                <span style={{ textAlign: 'center', fontSize: 16 }}>
                  {b.not_answered ? '➖' : b.is_correct ? '✅' : '❌'}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Short-answer Breakdown */}
        {saBreakdown.length > 0 && (
          <div className="card" style={{ marginBottom: 32 }}>
            <h3 style={{ marginBottom: 16 }}>Short Answer Feedback</h3>
            {saBreakdown.map((b) => (
              <div key={b.question_id} style={{
                padding: 'var(--space-4)', borderBottom: '1px solid var(--color-border)',
              }}>
                <p style={{ color: 'var(--color-text-primary)', marginBottom: 8, fontWeight: 500 }}>{b.question}</p>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
                  <span className={`badge ${b.score >= 0.6 ? 'badge-success' : b.score >= 0.3 ? 'badge-warning' : 'badge-neutral'}`}>
                    {Math.round(b.score * 100)}% score
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                    {b.keywords_matched}/{b.total_keywords} key concepts addressed
                  </span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--color-text-muted)', fontStyle: 'italic' }}>{b.feedback}</p>
              </div>
            ))}
          </div>
        )}

        <div style={{ textAlign: 'center' }}>
          <button className="btn btn-ghost" onClick={() => navigate('/candidate/status')}>
            ← Back to My Applications
          </button>
        </div>
      </div>
    );
  }

  // Already submitted but no result data (reloaded page after submission)
  if (submitted && !result) return (
    <div className="page" style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
      <h2 style={{ marginBottom: 8 }}>Test Already Submitted</h2>
      <p style={{ marginBottom: 24 }}>You have already completed this test. Results are being processed.</p>
      <button className="btn btn-ghost" onClick={() => navigate('/candidate/status')}>
        ← Back to My Applications
      </button>
    </div>
  );

  if (!test) return null;

  const q = test.questions[currentQ];
  const currentAnswer = answers[q.id];
  const progressPct = (answeredCount / totalQ) * 100;

  // ── Confirm Modal ─────────────────────────────────────────────────────────
  const unanswered = totalQ - answeredCount;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', display: 'flex', flexDirection: 'column' }}>

      {/* ── Top Bar ──────────────────────────────────────────────────────── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        padding: '12px 24px',
        display: 'flex', alignItems: 'center', gap: 24,
      }}>
        {/* Job title */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 2 }}>Aptitude Test</div>
          <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: 15 }}>{test.jobTitle}</div>
        </div>

        {/* Progress bar */}
        <div style={{ flex: 2 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12, color: 'var(--color-text-muted)' }}>
            <span>{answeredCount} of {totalQ} answered</span>
            <span>Q {currentQ + 1}/{totalQ}</span>
          </div>
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
          </div>
        </div>

        {/* Timer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>⏱</span>
          <span className={`test-timer ${timerClass}`}>{timerDisplay}</span>
        </div>

        {/* Submit button */}
        <button
          id="submit-test-btn"
          className="btn btn-primary btn-sm"
          onClick={() => setShowConfirm(true)}
          disabled={submitting}
        >
          {submitting ? 'Submitting…' : 'Submit Test'}
        </button>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flex: 1, gap: 0 }}>

        {/* Left sidebar — question navigator */}
        <div style={{
          width: 220, flexShrink: 0,
          background: 'var(--color-surface)',
          borderRight: '1px solid var(--color-border)',
          padding: 20,
          position: 'sticky', top: 69, height: 'calc(100vh - 69px)', overflowY: 'auto',
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 14 }}>
            Questions
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
            {test.questions.map((tq, i) => (
              <button
                key={tq.id}
                id={`q-nav-${i + 1}`}
                className={getDotClass(tq, i)}
                onClick={() => setCurrentQ(i)}
                title={`Question ${i + 1}${flagged[tq.id] ? ' (flagged)' : answers[tq.id] !== undefined ? ' (answered)' : ''}`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          {/* Legend */}
          <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { cls: 'q-nav-dot active',    label: 'Current' },
              { cls: 'q-nav-dot answered',  label: 'Answered' },
              { cls: 'q-nav-dot flagged',   label: 'Flagged' },
              { cls: 'q-nav-dot',           label: 'Unanswered' },
            ].map(({ cls, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--color-text-muted)' }}>
                <span className={cls} style={{ width: 14, height: 14, pointerEvents: 'none' }} />
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Main question area */}
        <div style={{ flex: 1, padding: '32px 40px', maxWidth: 760 }}>
          {/* Question header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
            <div>
              <span className="badge badge-primary" style={{ marginBottom: 10 }}>{q.topic}</span>
              <p style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Question {currentQ + 1} of {totalQ} · {q.type === 'mcq' ? 'Multiple Choice' : 'Short Answer'}
              </p>
            </div>
            <button
              id={`flag-q-${currentQ + 1}`}
              className={`btn btn-sm ${flagged[q.id] ? 'btn-accent' : 'btn-ghost'}`}
              onClick={() => toggleFlag(q.id)}
              title={flagged[q.id] ? 'Remove flag' : 'Flag for review'}
              style={{ flexShrink: 0 }}
            >
              {flagged[q.id] ? '🚩 Flagged' : '⚑ Flag'}
            </button>
          </div>

          {/* Question text */}
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 28, lineHeight: 1.5 }}>
            {q.question}
          </h2>

          {/* MCQ Options */}
          {q.type === 'mcq' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(q.options || []).map((opt, idx) => {
                const isSelected = currentAnswer?.answer_index === idx;
                return (
                  <button
                    key={idx}
                    id={`option-${idx}`}
                    className={`question-option${isSelected ? ' selected' : ''}`}
                    onClick={() => selectMCQ(q.id, idx)}
                  >
                    <span className="option-label">{String.fromCharCode(65 + idx)}</span>
                    {opt}
                  </button>
                );
              })}
            </div>
          )}

          {/* Short Answer */}
          {q.type === 'short_answer' && (
            <div className="form-group">
              <label className="form-label">Your Answer</label>
              <textarea
                id={`short-answer-${currentQ + 1}`}
                className="form-input"
                rows={7}
                placeholder="Write your answer here… (3–5 sentences recommended)"
                value={currentAnswer?.answer_text || ''}
                onChange={(e) => typeShortAnswer(q.id, e.target.value)}
                style={{ resize: 'vertical', lineHeight: 1.7 }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                  {(currentAnswer?.answer_text || '').length} characters
                </span>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 36 }}>
            <button
              id="prev-question-btn"
              className="btn btn-ghost"
              disabled={currentQ === 0}
              onClick={() => setCurrentQ((q) => q - 1)}
            >
              ← Previous
            </button>
            {currentQ < totalQ - 1 ? (
              <button
                id="next-question-btn"
                className="btn btn-primary"
                onClick={() => setCurrentQ((q) => q + 1)}
              >
                Next →
              </button>
            ) : (
              <button
                id="review-submit-btn"
                className="btn btn-accent"
                onClick={() => setShowConfirm(true)}
              >
                Review & Submit →
              </button>
            )}
          </div>

          {error && <div className="alert alert-error" style={{ marginTop: 16 }}>{error}</div>}
        </div>
      </div>

      {/* ── Confirmation Modal ──────────────────────────────────────────── */}
      {showConfirm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div className="card" style={{ width: 440, padding: 32 }}>
            <h3 style={{ marginBottom: 16 }}>Submit Test?</h3>

            {unanswered > 0 ? (
              <div className="alert alert-warning" style={{ marginBottom: 20 }}>
                ⚠️ You have <strong>{unanswered} unanswered question{unanswered !== 1 ? 's' : ''}</strong>.
                Unanswered questions score 0.
              </div>
            ) : (
              <div className="alert alert-success" style={{ marginBottom: 20 }}>
                ✓ All {totalQ} questions answered.
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20, fontSize: 13 }}>
              <div style={{ color: 'var(--color-text-muted)' }}>Questions answered</div>
              <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', textAlign: 'right' }}>{answeredCount}/{totalQ}</div>
              <div style={{ color: 'var(--color-text-muted)' }}>Flagged for review</div>
              <div style={{ fontWeight: 600, color: 'var(--color-warning)', textAlign: 'right' }}>
                {Object.values(flagged).filter(Boolean).length}
              </div>
              <div style={{ color: 'var(--color-text-muted)' }}>Time remaining</div>
              <div className={`test-timer ${timerClass}`} style={{ fontSize: '0.95rem', textAlign: 'right' }}>{timerDisplay}</div>
            </div>

            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 24 }}>
              Once submitted, you cannot change your answers. Are you sure?
            </p>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowConfirm(false)}>
                Go Back
              </button>
              <button
                id="confirm-submit-btn"
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={() => handleSubmit(false)}
                disabled={submitting}
              >
                {submitting ? (
                  <><span className="spinner" style={{ width: 14, height: 14 }} /> Submitting…</>
                ) : 'Submit Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
