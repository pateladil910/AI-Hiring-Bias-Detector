import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Save,
  HelpCircle,
} from 'lucide-react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Assessment() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [assessment, setAssessment] = useState(null);
  const [instructionsAccepted, setInstructionsAccepted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [remainingSeconds, setRemainingSeconds] = useState(1800);
  const [lastSaved, setLastSaved] = useState('Just now');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAssessment();
  }, [id]);

  // Timer countdown
  useEffect(() => {
    if (!instructionsAccepted || remainingSeconds <= 0) return;

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoAdvance();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [instructionsAccepted, remainingSeconds]);

  // Autosave answers every 30 seconds
  useEffect(() => {
    if (!instructionsAccepted || Object.keys(answers).length === 0) return;

    const autoSaveTimer = setInterval(() => {
      triggerAutosave();
    }, 30000);

    return () => clearInterval(autoSaveTimer);
  }, [answers, instructionsAccepted]);

  const fetchAssessment = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('fairhire_token');
      const res = await axios.get(`${API_BASE}/api/assessment/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAssessment(res.data);
      if (res.data.remainingSeconds) {
        setRemainingSeconds(res.data.remainingSeconds);
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Could not load assessment.');
    } finally {
      setLoading(false);
    }
  };

  const triggerAutosave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('fairhire_token');
      await axios.put(
        `${API_BASE}/api/assessment/${id}/answers`,
        { answers },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLastSaved(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (_) {}
    finally {
      setSaving(false);
    }
  };

  const handleSelectOption = (questionId, optionIndex) => {
    const updated = { ...answers, [questionId]: optionIndex };
    setAnswers(updated);
  };

  const handleAutoAdvance = () => {
    // Navigate to coding test
    navigate(`/candidate/coding/${id}`, { state: { mcqAnswers: answers } });
  };

  const formatTime = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '80px 24px' }}>
        <div className="spinner" style={{ margin: '0 auto 16px' }} />
        <div style={{ color: 'var(--color-text-secondary)' }}>Loading assessment environment...</div>
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="container" style={{ maxWidth: 640, margin: '60px auto', textAlign: 'center' }}>
        <AlertCircle size={48} color="#f87171" style={{ marginBottom: 16 }} />
        <h2 style={{ color: '#fff', fontSize: 22, marginBottom: 8 }}>Assessment Error</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 24 }}>{error}</p>
        <button onClick={() => navigate('/candidate/domain')} className="btn btn-primary">
          Back to Domain Tracks
        </button>
      </div>
    );
  }

  const questions = assessment.questions || [];
  const currentQ = questions[currentIndex];

  // ─── Pre-Assessment Instructions Screen ──────────────────────────────────
  if (!instructionsAccepted) {
    return (
      <div className="container" style={{ maxWidth: 760, margin: '0 auto', padding: '40px 24px' }}>
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 16,
            padding: 36,
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#34d399',
              padding: '4px 12px',
              borderRadius: 9999,
              fontSize: 12,
              fontWeight: 700,
              marginBottom: 16,
            }}
          >
            <ShieldCheck size={14} /> Stage 03: Aptitude Evaluation
          </div>

          <h1 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 12px', color: '#fff' }}>
            {assessment.name} Assessment Instructions
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 15, lineHeight: 1.5, margin: '0 0 24px' }}>
            Please read the instructions carefully before starting. The server countdown timer will commence as soon as you confirm.
          </p>

          <div
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--color-border)',
              borderRadius: 12,
              padding: 20,
              marginBottom: 28,
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}
          >
            <div style={{ display: 'flex', gap: 12 }}>
              <CheckCircle2 size={18} color="#10b981" style={{ flexShrink: 0, marginTop: 2 }} />
              <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                <strong style={{ color: '#fff' }}>Time Limit:</strong> You have {assessment.timeLimitMinutes || 30} minutes in total to complete both the MCQs and the coding challenge.
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <CheckCircle2 size={18} color="#10b981" style={{ flexShrink: 0, marginTop: 2 }} />
              <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                <strong style={{ color: '#fff' }}>Autosave:</strong> Your answers are securely autosaved to the server every 30 seconds and whenever you navigate between questions.
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <CheckCircle2 size={18} color="#10b981" style={{ flexShrink: 0, marginTop: 2 }} />
              <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                <strong style={{ color: '#fff' }}>Two-Part Structure:</strong> Part 1 consists of 5 domain aptitude MCQs. Part 2 is an interactive coding challenge in our sandboxed VM editor.
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <CheckCircle2 size={18} color="#10b981" style={{ flexShrink: 0, marginTop: 2 }} />
              <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                <strong style={{ color: '#fff' }}>Integrity Protection:</strong> Answer keys are protected server-side and never exposed to the client browser.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <button
              onClick={() => navigate('/candidate/domain')}
              className="btn btn-ghost"
            >
              Back
            </button>
            <button
              onClick={() => setInstructionsAccepted(true)}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px' }}
            >
              I Understand — Start Timer <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Active MCQ Assessment Screen ─────────────────────────────────────────
  return (
    <div className="container" style={{ maxWidth: 960, margin: '0 auto', padding: '28px 24px' }}>
      {/* ── Top Bar: Progress & Timer ──────────────────────────────────────── */}
      <div
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 14,
          padding: '16px 24px',
          marginBottom: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            {assessment.name} • Part 1 of 2
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginTop: 2 }}>
            Question {currentIndex + 1} of {questions.length}
          </div>
        </div>

        {/* Question Nav Pills */}
        <div style={{ display: 'flex', gap: 8 }}>
          {questions.map((q, idx) => {
            const isAnswered = answers[q.id] !== undefined;
            const isCurrent = idx === currentIndex;

            return (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(idx)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  border: isCurrent ? '2px solid #10b981' : '1px solid var(--color-border)',
                  background: isAnswered ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.04)',
                  color: isAnswered ? '#34d399' : '#fff',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        {/* Server Countdown Timer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
            Autosaved: {saving ? 'Saving...' : lastSaved}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: remainingSeconds < 300 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.15)',
              border: remainingSeconds < 300 ? '1px solid #ef4444' : '1px solid #10b981',
              color: remainingSeconds < 300 ? '#f87171' : '#34d399',
              padding: '6px 14px',
              borderRadius: 10,
              fontWeight: 800,
              fontSize: 16,
              fontFamily: 'monospace',
            }}
          >
            <Clock size={16} />
            {formatTime(remainingSeconds)}
          </div>
        </div>
      </div>

      {/* ── Question Card ─────────────────────────────────────────────────── */}
      <div
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 16,
          padding: 32,
          marginBottom: 24,
        }}
      >
        {currentQ && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  background: 'rgba(56, 189, 248, 0.15)',
                  color: '#38bdf8',
                  padding: '3px 8px',
                  borderRadius: 6,
                }}
              >
                Topic: {currentQ.topic || 'General'}
              </span>
              <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                1 Point
              </span>
            </div>

            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#fff', lineHeight: 1.5, margin: '0 0 24px' }}>
              {currentQ.question}
            </h2>

            {/* Radio Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {currentQ.options.map((opt, optIdx) => {
                const isSelected = answers[currentQ.id] === optIdx;

                return (
                  <label
                    key={optIdx}
                    onClick={() => handleSelectOption(currentQ.id, optIdx)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      padding: '14px 18px',
                      borderRadius: 12,
                      border: isSelected ? '2px solid #10b981' : '1px solid var(--color-border)',
                      background: isSelected ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255,255,255,0.02)',
                      cursor: 'pointer',
                      transition: 'all 150ms ease',
                    }}
                  >
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        border: isSelected ? '6px solid #10b981' : '2px solid var(--color-border)',
                        background: '#090f0c',
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontSize: 14, color: isSelected ? '#fff' : '#cbd5e1', lineHeight: 1.4 }}>
                      {opt}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom Controls ───────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
          disabled={currentIndex === 0}
          className="btn btn-ghost"
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <ArrowLeft size={16} /> Previous
        </button>

        <div style={{ display: 'flex', gap: 12 }}>
          {currentIndex < questions.length - 1 ? (
            <button
              onClick={() => {
                triggerAutosave();
                setCurrentIndex((prev) => prev + 1);
              }}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              Save & Next Question <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={() => {
                triggerAutosave();
                navigate(`/candidate/coding/${id}`, { state: { mcqAnswers: answers } });
              }}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px' }}
            >
              Complete MCQs & Open Coding Sandbox <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
