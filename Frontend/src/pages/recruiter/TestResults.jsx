import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { testsAPI } from '../../lib/api';

// ─── Mini Score Ring ──────────────────────────────────────────────────────────
function MiniScoreRing({ score, size = 90 }) {
  const r = size / 2 - 8;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(Math.max(score, 0), 100);
  const offset = circ - (pct / 100) * circ;
  const color = pct >= 70 ? '#34C77B' : pct >= 45 ? '#F5B93D' : '#F0554C';
  const cx = size / 2;

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', position: 'absolute', top: 0, left: 0 }}>
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="#262E42" strokeWidth={8} />
        <circle
          cx={cx} cy={cx} r={r} fill="none"
          stroke={color} strokeWidth={8}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(.4,0,.2,1)' }}
        />
      </svg>
      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: size < 100 ? '0.85rem' : '1.1rem', color }}>
        {Math.round(pct)}%
      </span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function TestResults() {
  const { testId } = useParams();
  const navigate = useNavigate();

  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [expandedQ, setExpandedQ] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        // testId here is actually the applicationId (recruiter comes from candidates page)
        const res = await testsAPI.getByApplication(testId);
        setData(res.data);
      } catch (e) {
        setError(e.response?.data?.error?.message || 'Failed to load test results.');
      } finally {
        setLoading(false);
      }
    })();
  }, [testId]);

  if (loading) return (
    <div className="page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="spinner" style={{ width: 36, height: 36, margin: '0 auto 16px' }} />
        <p>Loading test results…</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="page">
      <div className="alert alert-error">{error}</div>
      <button className="btn btn-ghost" style={{ marginTop: 16 }} onClick={() => navigate('/recruiter/candidates')}>
        ← Back to Candidates
      </button>
    </div>
  );

  const { test, submission, jobTitle } = data;

  if (!test) return (
    <div className="page" style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
      <h2 style={{ marginBottom: 8 }}>No Test Generated Yet</h2>
      <p style={{ marginBottom: 24 }}>A test hasn't been sent for this applicant yet.</p>
      <button className="btn btn-ghost" onClick={() => navigate('/recruiter/candidates')}>
        ← Back to Candidates
      </button>
    </div>
  );

  if (!submission) return (
    <div className="page" style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
      <h2 style={{ marginBottom: 8 }}>Awaiting Candidate Submission</h2>
      <p style={{ marginBottom: 8 }}>
        The test was sent on <strong>{new Date(test.generatedAt).toLocaleDateString()}</strong>.
        The candidate hasn't submitted their answers yet.
      </p>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginTop: 20, marginBottom: 28 }}>
        {(test.topicsCovered || []).map((t) => (
          <span key={t} className="badge badge-primary">{t}</span>
        ))}
      </div>
      <button className="btn btn-ghost" onClick={() => navigate('/recruiter/candidates')}>
        ← Back to Candidates
      </button>
    </div>
  );

  const score = submission.autoScore ?? 0;
  const passed = score >= 50;
  const breakdown = submission.breakdown || [];
  const mcqItems = breakdown.filter((b) => b.type === 'mcq');
  const saItems  = breakdown.filter((b) => b.type === 'short_answer');
  const mcqCorrect = mcqItems.filter((b) => b.is_correct).length;

  return (
    <div className="page" style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <button
            className="btn btn-ghost btn-sm"
            style={{ marginBottom: 12 }}
            onClick={() => navigate('/recruiter/candidates')}
          >
            ← Back to Candidates
          </button>
          <h1 style={{ fontSize: '1.6rem', marginBottom: 4 }}>Test Results</h1>
          <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>{jobTitle}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <MiniScoreRing score={score} size={96} />
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 700, lineHeight: 1 }}>
              {Math.round(score)}%
            </div>
            <span className={`badge ${passed ? 'badge-success' : 'badge-neutral'}`} style={{ marginTop: 6 }}>
              {passed ? '✓ Passed' : '✗ Below Threshold'}
            </span>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>
              Submitted {new Date(submission.submittedAt).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid-4" style={{ marginBottom: 32 }}>
        <div className="stat-card">
          <div className="stat-value">{test.questionCount}</div>
          <div className="stat-label">Total Questions</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--color-success)' }}>{mcqCorrect}</div>
          <div className="stat-label">MCQ Correct</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--color-danger)' }}>
            {mcqItems.length - mcqCorrect}
          </div>
          <div className="stat-label">MCQ Incorrect</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ fontFamily: 'var(--font-mono)', fontSize: '1.8rem' }}>
            {Math.round((submission.llmConfidence || 0) * 100)}%
          </div>
          <div className="stat-label">AI Confidence</div>
        </div>
      </div>

      {/* Topics covered */}
      {test.topicsCovered?.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            Topics Assessed
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {test.topicsCovered.map((t) => (
              <span key={t} className="badge badge-primary">{t}</span>
            ))}
          </div>
        </div>
      )}

      {/* MCQ Breakdown Table */}
      {mcqItems.length > 0 && (
        <div className="card" style={{ marginBottom: 24, padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)' }}>
            <h3 style={{ margin: 0 }}>Multiple Choice — Detailed Breakdown</h3>
          </div>
          {/* Table header */}
          <div className="breakdown-row" style={{
            fontWeight: 600, fontSize: 11, color: 'var(--color-text-muted)',
            textTransform: 'uppercase', letterSpacing: '0.05em',
            background: 'var(--color-surface)',
          }}>
            <span>Question</span>
            <span>Candidate's Answer</span>
            <span>Correct Answer</span>
            <span style={{ textAlign: 'center' }}>Result</span>
          </div>
          {mcqItems.map((b) => (
            <div key={b.question_id} className={`breakdown-row ${b.is_correct ? 'correct' : b.not_answered ? '' : 'incorrect'}`}>
              <div>
                <div style={{ color: 'var(--color-text-primary)', fontWeight: 500, marginBottom: 2 }}>{b.question}</div>
                <span className="badge badge-neutral" style={{ fontSize: 10 }}>{b.topic}</span>
              </div>
              <span style={{ color: b.is_correct ? 'var(--color-success)' : b.not_answered ? 'var(--color-text-muted)' : 'var(--color-danger)' }}>
                {b.not_answered ? '— Not answered' : b.submitted_answer}
              </span>
              <span style={{ color: 'var(--color-success)' }}>{b.correct_answer}</span>
              <span style={{ textAlign: 'center', fontSize: 18 }}>
                {b.not_answered ? '➖' : b.is_correct ? '✅' : '❌'}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Short Answer Breakdown */}
      {saItems.length > 0 && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)' }}>
            <h3 style={{ margin: 0 }}>Short Answer — Rubric Evaluation</h3>
          </div>
          {saItems.map((b, i) => {
            const isOpen = expandedQ === i;
            const scorePct = Math.round(b.score * 100);
            return (
              <div key={b.question_id} style={{ borderBottom: i < saItems.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                {/* Accordion header */}
                <button
                  onClick={() => setExpandedQ(isOpen ? null : i)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '16px 24px', background: 'none', border: 'none', cursor: 'pointer',
                    textAlign: 'left', gap: 16,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ color: 'var(--color-text-primary)', fontWeight: 500, marginBottom: 4, fontSize: 14 }}>{b.question}</div>
                    <span className="badge badge-neutral" style={{ fontSize: 10 }}>{b.topic}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                    {/* Keywords bar */}
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 4 }}>
                        {b.keywords_matched}/{b.total_keywords} concepts
                      </div>
                      <div className="progress-bar-track" style={{ width: 80 }}>
                        <div
                          className={`progress-bar-fill ${scorePct >= 60 ? 'success' : scorePct >= 30 ? 'warning' : 'danger'}`}
                          style={{ width: `${scorePct}%` }}
                        />
                      </div>
                    </div>
                    <span className={`badge ${scorePct >= 60 ? 'badge-success' : scorePct >= 30 ? 'badge-warning' : 'badge-neutral'}`}>
                      {scorePct}%
                    </span>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: 18 }}>{isOpen ? '▲' : '▼'}</span>
                  </div>
                </button>

                {/* Accordion body */}
                {isOpen && (
                  <div style={{ padding: '0 24px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* Candidate answer */}
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                        Candidate's Answer
                      </div>
                      <div style={{
                        background: 'var(--color-surface-alt)', borderRadius: 'var(--radius-md)',
                        padding: 'var(--space-4)', fontSize: 14, color: 'var(--color-text-primary)', lineHeight: 1.7,
                        fontStyle: b.not_answered ? 'italic' : 'normal',
                      }}>
                        {b.not_answered ? 'No answer provided.' : b.submitted_answer}
                      </div>
                    </div>

                    {/* Rubric keywords */}
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                        Rubric Keywords Expected
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {(b.rubric_keywords || []).map((kw) => {
                          const hit = !b.not_answered && b.submitted_answer?.toLowerCase().includes(kw.toLowerCase());
                          return (
                            <span
                              key={kw}
                              className={`badge ${hit ? 'badge-success' : 'badge-neutral'}`}
                            >
                              {hit ? '✓ ' : ''}{kw}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* AI feedback */}
                    <div className={`alert ${scorePct >= 60 ? 'alert-success' : scorePct >= 30 ? 'alert-warning' : 'alert-error'}`}>
                      {b.feedback}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
