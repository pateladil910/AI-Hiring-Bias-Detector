import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Play,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  ShieldAlert,
  RotateCcw,
  Sparkles,
  Terminal,
  Code2,
} from 'lucide-react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function CodingSandbox() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [assessment, setAssessment] = useState(null);
  const [code, setCode] = useState('');
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const mcqAnswers = location.state?.mcqAnswers || {};

  useEffect(() => {
    fetchAssessment();
  }, [id]);

  const fetchAssessment = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('fairhire_token');
      const res = await axios.get(`${API_BASE}/api/assessment/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAssessment(res.data);
      if (res.data.codingProblem?.starterCode) {
        setCode(res.data.codingProblem.starterCode);
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Could not load coding challenge.');
    } finally {
      setLoading(false);
    }
  };

  const handleRunTests = async () => {
    setRunning(true);
    setError('');

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('fairhire_token');
      const res = await axios.post(
        `${API_BASE}/api/assessment/${id}/code-run`,
        { code },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTestResults(res.data);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to execute code in sandbox.');
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('fairhire_token');
      const res = await axios.post(
        `${API_BASE}/api/assessment/${id}/submit`,
        {
          mcqAnswers,
          code,
          language: 'javascript',
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      navigate(`/candidate/results/${id}`, { state: { result: res.data } });
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to grade and submit assessment.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '80px 24px' }}>
        <div className="spinner" style={{ margin: '0 auto 16px' }} />
        <div style={{ color: 'var(--color-text-secondary)' }}>Loading coding sandbox...</div>
      </div>
    );
  }

  const problem = assessment?.codingProblem;

  return (
    <div className="container" style={{ maxWidth: 1400, margin: '0 auto', padding: '24px' }}>
      {/* ── Top Bar ──────────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 16,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#34d399',
                padding: '3px 8px',
                borderRadius: 6,
              }}
            >
              Stage 04: Coding Sandbox
            </span>
            <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
              Language: <strong style={{ color: '#fff' }}>JavaScript (ES2022)</strong>
            </span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: '4px 0 0', color: '#fff' }}>
            {problem?.title || 'Algorithmic Challenge'}
          </h1>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            onClick={() => setCode(problem?.starterCode || '')}
            className="btn btn-ghost btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <RotateCcw size={14} /> Reset Code
          </button>
          <button
            onClick={handleRunTests}
            disabled={running || submitting}
            className="btn btn-outline"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Play size={15} color="#10b981" />
            {running ? 'Executing in VM...' : 'Run Test Cases'}
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px' }}
          >
            {submitting ? 'Grading & Submitting...' : 'Submit Final Assessment'}
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Demo Sandbox Alert */}
      <div
        style={{
          background: 'rgba(56, 189, 248, 0.08)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          borderRadius: 10,
          padding: '10px 16px',
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: 12,
          color: '#cbd5e1',
        }}
      >
        <ShieldAlert size={16} color="#38bdf8" style={{ flexShrink: 0 }} />
        <span>
          <strong>Sandboxed Prototype Environment:</strong> Code executes server-side within an isolated Node.js <code>vm</code> context with strict 3000ms execution timeout and zero file system/network access.
        </span>
      </div>

      {error && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            padding: '10px 14px',
            borderRadius: 8,
            fontSize: 13,
            marginBottom: 16,
          }}
        >
          {error}
        </div>
      )}

      {/* ── Dual-Pane Layout ─────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(360px, 45%) 1fr', gap: 20, minHeight: 520 }}>
        {/* Left Pane: Instructions & Sample Cases */}
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 14,
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            maxHeight: '75vh',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Code2 size={18} color="#10b981" />
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#fff' }}>
              Problem Description
            </h3>
          </div>

          <div
            style={{
              fontSize: 14,
              color: 'var(--color-text-secondary)',
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
              marginBottom: 24,
            }}
          >
            {problem?.instructions}
          </div>

          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 16 }}>
            <h4 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: '#fff' }}>
              Sample Test Inputs
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {problem?.sampleTestCases?.map((tc, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 8,
                    padding: '8px 12px',
                    fontSize: 12,
                    fontFamily: 'monospace',
                  }}
                >
                  <div style={{ color: 'var(--color-text-muted)' }}>// {tc.description}</div>
                  <div style={{ color: '#6ee7b7' }}>Input: {JSON.stringify(tc.input)}</div>
                  <div style={{ color: '#38bdf8' }}>Expected: {JSON.stringify(tc.expected)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Pane: Code Editor & Test Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* In-Browser Code Editor */}
          <div
            style={{
              background: '#0a100d',
              border: '1px solid var(--color-border)',
              borderRadius: 14,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              minHeight: 340,
            }}
          >
            <div
              style={{
                background: '#121d18',
                borderBottom: '1px solid var(--color-border)',
                padding: '8px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: 12,
                color: 'var(--color-text-secondary)',
              }}
            >
              <span>solution.js</span>
              <span style={{ fontSize: 11, color: '#10b981' }}>● Autosave Active</span>
            </div>

            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="// Write your solution here..."
              spellCheck={false}
              style={{
                flex: 1,
                width: '100%',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#e2e8f0',
                fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                fontSize: 13,
                lineHeight: 1.6,
                padding: 18,
                resize: 'none',
                minHeight: 280,
              }}
            />
          </div>

          {/* Test Runner Results Panel */}
          <div
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 14,
              padding: 18,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 700, color: '#fff' }}>
                <Terminal size={16} color="#10b981" /> Test Runner Output
              </div>

              {testResults && (
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: testResults.allPassed ? '#34d399' : '#f87171',
                    background: testResults.allPassed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    padding: '2px 8px',
                    borderRadius: 6,
                  }}
                >
                  {testResults.testsPassed} / {testResults.testsTotal} Passed
                </span>
              )}
            </div>

            {testResults ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 180, overflowY: 'auto' }}>
                {testResults.results?.map((res, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 8,
                      padding: '8px 12px',
                      fontSize: 12,
                      fontFamily: 'monospace',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {res.passed ? (
                        <CheckCircle2 size={16} color="#10b981" />
                      ) : (
                        <XCircle size={16} color="#ef4444" />
                      )}
                      <span style={{ color: '#fff' }}>Test {res.testCaseIndex}: {res.description}</span>
                    </div>

                    <div style={{ fontSize: 11, color: res.passed ? '#34d399' : '#f87171' }}>
                      {res.passed ? 'PASSED' : res.error ? `Error: ${res.error}` : `Got: ${JSON.stringify(res.actual)}`}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: 13, color: 'var(--color-text-muted)', textAlign: 'center', padding: 16 }}>
                Click "Run Test Cases" above to evaluate your implementation against the test suite.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
