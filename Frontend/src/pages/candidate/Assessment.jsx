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
  Sparkles,
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
  const [remainingSeconds, setRemainingSeconds] = useState(1200); // 20 minutes (1 min per question for 20 MCQs)
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
        <div style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>Loading assessment questions...</div>
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="container" style={{ maxWidth: 640, margin: '60px auto', textAlign: 'center' }}>
        <AlertCircle size={48} color="#ef4444" style={{ margin: '0 auto 16px' }} />
        <h2 style={{ color: 'var(--color-text-primary)', fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
          Assessment Error
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 24, fontSize: 14 }}>{error}</p>
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
            background: '#ffffff',
            border: '1px solid var(--color-border)',
            borderRadius: 16,
            padding: 36,
            boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: '#ecfdf5',
              color: '#059669',
              border: '1px solid #a7f3d0',
              padding: '4px 12px',
              borderRadius: 9999,
              fontSize: 12,
              fontWeight: 700,
              marginBottom: 16,
            }}
          >
            <ShieldCheck size={14} /> Stage 03: Aptitude Evaluation
          </div>

          <h1 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 12px', color: 'var(--color-text-primary)' }}>
            {assessment.name} Assessment Instructions
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, lineHeight: 1.6, margin: '0 0 24px' }}>
            Please read the instructions carefully before starting. The server countdown timer will commence as soon as you confirm.
          </p>

          <div
            style={{
              background: '#f8fafc',
              border: '1px solid var(--color-border)',
              borderRadius: 12,
              padding: 20,
              marginBottom: 28,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <div style={{ display: 'flex', gap: 12 }}>
              <CheckCircle2 size={18} color="#059669" style={{ flexShrink: 0, marginTop: 2 }} />
              <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                <strong style={{ color: 'var(--color-text-primary)' }}>Part 1 — 20 Aptitude MCQs:</strong> You have 20 minutes in total (1 minute per question) to complete 20 domain knowledge questions.
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <CheckCircle2 size={18} color="#059669" style={{ flexShrink: 0, marginTop: 2 }} />
              <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                <strong style={{ color: 'var(--color-text-primary)' }}>Part 2 — Coding Challenge:</strong> After completing the MCQs, you will enter the coding sandbox with a dedicated 20-minute timer for the algorithmic problem.
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <CheckCircle2 size={18} color="#059669" style={{ flexShrink: 0, marginTop: 2 }} />
              <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                <strong style={{ color: 'var(--color-text-primary)' }}>Autosave:</strong> Your MCQ answers are securely autosaved every 30 seconds and whenever you switch questions.
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <CheckCircle2 size={18} color="#059669" style={{ flexShrink: 0, marginTop: 2 }} />
              <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                <strong style={{ color: 'var(--color-text-primary)' }}>Instant Objective Results:</strong> Final composite score (MCQ 40% + Coding 40% + Verified Skills 20%) is graded automatically upon final submission.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <button
              onClick={() => navigate('/candidate/domain')}
              className="btn btn-ghost"
              style={{ fontSize: 13, fontWeight: 600 }}
            >
              Back
            </button>
            <button
              onClick={() => setInstructionsAccepted(true)}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', fontSize: 14, fontWeight: 700 }}
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
          background: '#ffffff',
          border: '1px solid var(--color-border)',
          borderRadius: 14,
          padding: '16px 24px',
          marginBottom: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
        }}
      >
        <div>
          <div style={{ fontSize: 11, color: '#059669', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.04em' }}>
            {assessment.name} • PART 1 OF 2
          </div>
          <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--color-text-primary)', marginTop: 2 }}>
            Question {currentIndex + 1} of {questions.length}
          </div>
        </div>

        {/* Question Nav Pills (20 Questions) */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, maxWidth: 440 }}>
          {questions.map((q, idx) => {
            const isAnswered = answers[q.id] !== undefined;
            const isCurrent = idx === currentIndex;

            return (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(idx)}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 6,
                  border: isCurrent
                    ? '2px solid #059669'
                    : isAnswered
                    ? '1px solid #10b981'
                    : '1px solid #cbd5e1',
                  background: isCurrent
                    ? '#ecfdf5'
                    : isAnswered
                    ? '#d1fae5'
                    : '#ffffff',
                  color: isCurrent
                    ? '#047857'
                    : isAnswered
                    ? '#065f46'
                    : '#475569',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: isCurrent ? '0 0 0 2px rgba(5, 150, 105, 0.2)' : 'none',
                }}
                title={`Question ${idx + 1}${isAnswered ? ' (Answered)' : ''}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        {/* Server Countdown Timer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
            Autosaved: {saving ? 'Saving...' : lastSaved}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: remainingSeconds < 300 ? '#fef2f2' : '#ecfdf5',
              border: remainingSeconds < 300 ? '1px solid #fecaca' : '1px solid #a7f3d0',
              color: remainingSeconds < 300 ? '#dc2626' : '#047857',
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
          background: '#ffffff',
          border: '1px solid var(--color-border)',
          borderRadius: 16,
          padding: 32,
          marginBottom: 24,
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
        }}
      >
        {currentQ ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  background: '#e0f2fe',
                  color: '#0284c7',
                  padding: '4px 10px',
                  borderRadius: 6,
                  border: '1px solid #bae6fd',
                }}
              >
                Topic: {currentQ.topic || 'General Aptitude'}
              </span>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-muted)' }}>
                1 Point
              </span>
            </div>

            {/* High-Contrast Visible Question Text */}
            <h2
              style={{
                fontSize: 19,
                fontWeight: 700,
                color: '#0f172a',
                lineHeight: 1.55,
                margin: '0 0 24px',
              }}
            >
              {currentQ.question}
            </h2>

            {/* Radio Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {currentQ.options?.map((opt, optIdx) => {
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
                      border: isSelected ? '2px solid #059669' : '1px solid #e2e8f0',
                      background: isSelected ? '#f0fdf4' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 150ms ease',
                      boxShadow: isSelected ? '0 2px 8px rgba(5, 150, 105, 0.1)' : '0 1px 2px rgba(0,0,0,0.02)',
                    }}
                  >
                    {/* Clean Radio Button Circle */}
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        border: isSelected ? '6px solid #059669' : '2px solid #cbd5e1',
                        background: '#ffffff',
                        flexShrink: 0,
                        transition: 'all 150ms ease',
                      }}
                    />
                    {/* High-Contrast Visible Option Text */}
                    <span
                      style={{
                        fontSize: 15,
                        fontWeight: isSelected ? 600 : 500,
                        color: isSelected ? '#047857' : '#1e293b',
                        lineHeight: 1.45,
                      }}
                    >
                      {opt}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--color-text-secondary)' }}>
            No question available at index {currentIndex + 1}.
          </div>
        )}
      </div>

      {/* ── Bottom Controls ───────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
          disabled={currentIndex === 0}
          className="btn btn-ghost"
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: currentIndex === 0 ? '#94a3b8' : '#475569' }}
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
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 700, padding: '10px 20px' }}
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
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 22px', fontSize: 14, fontWeight: 700 }}
            >
              Complete MCQs & Open Coding Sandbox <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
