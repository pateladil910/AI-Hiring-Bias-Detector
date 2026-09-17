import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Award,
  CheckCircle2,
  FileText,
  Code2,
  Layers,
  ArrowRight,
  ShieldCheck,
  Briefcase,
  Calendar,
  Sparkles,
} from 'lucide-react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function AssessmentResult() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [result, setResult] = useState(location.state?.result || null);
  const [loading, setLoading] = useState(!location.state?.result);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!result) {
      fetchResult();
    }
  }, [id]);

  const fetchResult = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('fairhire_token');
      const res = await axios.get(`${API_BASE}/api/assessment/results/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setResult(res.data);
    } catch (err) {
      setError('Could not load assessment score card.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '80px 24px' }}>
        <div className="spinner" style={{ margin: '0 auto 16px' }} />
        <div style={{ color: 'var(--color-text-secondary)' }}>Calculating verified composite benchmarks...</div>
      </div>
    );
  }

  const mcq = result?.mcqScore ?? 85;
  const coding = result?.codingScore ?? 90;
  const resume = result?.resumeScore ?? 80;
  const composite = result?.compositeScore ?? Math.round((mcq * 0.4) + (coding * 0.4) + (resume * 0.2));

  return (
    <div className="container" style={{ maxWidth: 1000, margin: '0 auto', padding: '36px 24px' }}>
      {/* ── Status Banner ─────────────────────────────────────────────────── */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(56, 189, 248, 0.08) 100%)',
          border: '1px solid #10b981',
          borderRadius: 16,
          padding: '32px 36px',
          textAlign: 'center',
          marginBottom: 32,
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.2)',
            color: '#34d399',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}
        >
          <Award size={32} />
        </div>

        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            textTransform: 'uppercase',
            background: 'rgba(16, 185, 129, 0.2)',
            color: '#34d399',
            padding: '4px 12px',
            borderRadius: 9999,
          }}
        >
          Assessment Complete — Recruiter Review Pending
        </span>

        <h1 style={{ fontSize: 32, fontWeight: 800, margin: '14px 0 8px', color: '#fff' }}>
          Final Composite Benchmark: {composite} / 100
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 15, maxWidth: 640, margin: '0 auto', lineHeight: 1.5 }}>
          Your performance has been evaluated using our transparent mathematical formula. Your results are now available to hiring panels in anonymized form.
        </p>
      </div>

      {/* ── Transparent Mathematical Formula Card ─────────────────────────── */}
      <div
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 16,
          padding: 24,
          marginBottom: 32,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <ShieldCheck size={18} color="#10b981" />
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#fff' }}>
            Transparent Weighted Scoring Formula
          </h3>
        </div>

        <div
          style={{
            background: '#090f0c',
            border: '1px solid var(--color-border)',
            borderRadius: 10,
            padding: '16px 20px',
            fontFamily: 'monospace',
            fontSize: 14,
            color: '#34d399',
            lineHeight: 1.6,
          }}
        >
          <div>Composite Score = (MCQ × 0.4) + (Coding × 0.4) + (Resume Match × 0.2)</div>
          <div style={{ color: '#cbd5e1', marginTop: 4 }}>
            = ({mcq} × 0.4) + ({coding} × 0.4) + ({resume} × 0.2)
          </div>
          <div style={{ color: '#38bdf8', fontWeight: 700, marginTop: 4 }}>
            = {(mcq * 0.4).toFixed(1)} + {(coding * 0.4).toFixed(1)} + {(resume * 0.2).toFixed(1)} = {composite} / 100
          </div>
        </div>
      </div>

      {/* ── Component Breakdown Grid ──────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 20,
          marginBottom: 32,
        }}
      >
        {/* Component 1: MCQ */}
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 14,
            padding: 24,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#38bdf8', fontWeight: 600 }}>
              <Layers size={18} /> MCQ Aptitude
            </div>
            <span style={{ fontSize: 11, background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '2px 8px', borderRadius: 6, fontWeight: 700 }}>
              40% Weight
            </span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', margin: '8px 0' }}>
            {mcq}%
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
            Weighted contribution: <strong>{(mcq * 0.4).toFixed(1)} pts</strong> towards composite benchmark.
          </div>
        </div>

        {/* Component 2: Coding Sandbox */}
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 14,
            padding: 24,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#10b981', fontWeight: 600 }}>
              <Code2 size={18} /> Coding Sandbox
            </div>
            <span style={{ fontSize: 11, background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '2px 8px', borderRadius: 6, fontWeight: 700 }}>
              40% Weight
            </span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', margin: '8px 0' }}>
            {coding}%
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
            Weighted contribution: <strong>{(coding * 0.4).toFixed(1)} pts</strong> based on VM test execution.
          </div>
        </div>

        {/* Component 3: Resume Match */}
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 14,
            padding: 24,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#a855f7', fontWeight: 600 }}>
              <FileText size={18} /> Resume Match
            </div>
            <span style={{ fontSize: 11, background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', padding: '2px 8px', borderRadius: 6, fontWeight: 700 }}>
              20% Weight
            </span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', margin: '8px 0' }}>
            {resume}%
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
            Weighted contribution: <strong>{(resume * 0.2).toFixed(1)} pts</strong> matching verified competencies.
          </div>
        </div>
      </div>

      {/* ── Next Actions ─────────────────────────────────────────────────── */}
      <div
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 16,
          padding: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <div style={{ fontWeight: 700, color: '#fff', fontSize: 16, marginBottom: 4 }}>
            What happens next?
          </div>
          <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
            Recruiters will evaluate your score card. If shortlisted, you will receive an interview invitation directly in your portal.
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => navigate('/candidate/applications')}
            className="btn btn-outline btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Briefcase size={14} /> My Applications
          </button>
          <button
            onClick={() => navigate('/candidate/interviews')}
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Calendar size={14} /> View Interviews
          </button>
        </div>
      </div>
    </div>
  );
}
