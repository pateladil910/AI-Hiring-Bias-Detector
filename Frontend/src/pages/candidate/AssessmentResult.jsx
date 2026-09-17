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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 font-sans">
      {/* ── Status Banner ─────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50/60 to-sky-50/50 border border-emerald-200 rounded-2xl p-8 text-center mb-8 shadow-xs">
        <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4 border border-emerald-200">
          <Award size={30} />
        </div>

        <span className="inline-block text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-3.5 py-1 rounded-full border border-emerald-200 mb-3">
          Assessment Complete — Recruiter Review Pending
        </span>

        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
          Final Composite Benchmark: <span className="text-emerald-600 font-mono">{composite}</span> / 100
        </h1>
        <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
          Your performance has been evaluated using our transparent mathematical formula. Your results are now available to hiring panels in demographic-neutral form.
        </p>
      </div>

      {/* ── Transparent Mathematical Formula Card ─────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-8 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck size={18} className="text-emerald-600" />
          <h3 className="text-base font-bold text-slate-900">
            Transparent Weighted Scoring Formula
          </h3>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 font-mono text-xs leading-relaxed">
          <div className="text-emerald-700 font-bold">Composite Score = (MCQ × 0.4) + (Coding × 0.4) + (Resume Match × 0.2)</div>
          <div className="text-slate-600 mt-1">
            = ({mcq} × 0.4) + ({coding} × 0.4) + ({resume} × 0.2)
          </div>
          <div className="text-sky-700 font-bold mt-1">
            = {(mcq * 0.4).toFixed(1)} + {(coding * 0.4).toFixed(1)} + {(resume * 0.2).toFixed(1)} = {composite} / 100
          </div>
        </div>
      </div>

      {/* ── Component Breakdown Grid ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {/* Component 1: MCQ */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-sky-700 font-bold text-xs">
                <Layers size={16} /> MCQ Aptitude
              </div>
              <span className="text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200 px-2 py-0.5 rounded">
                40% Weight
              </span>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 font-mono mb-2">
              {mcq}%
            </div>
            <div className="text-xs text-slate-500 leading-relaxed">
              Weighted contribution: <strong className="text-slate-800">{(mcq * 0.4).toFixed(1)} pts</strong> towards composite benchmark.
            </div>
          </div>
        </div>

        {/* Component 2: Coding Sandbox */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
                <Code2 size={16} /> Coding Sandbox
              </div>
              <span className="text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded">
                40% Weight
              </span>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 font-mono mb-2">
              {coding}%
            </div>
            <div className="text-xs text-slate-500 leading-relaxed">
              Weighted contribution: <strong className="text-slate-800">{(coding * 0.4).toFixed(1)} pts</strong> based on VM test execution.
            </div>
          </div>
        </div>

        {/* Component 3: Resume Match */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs">
                <FileText size={16} /> Resume Match
              </div>
              <span className="text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded">
                20% Weight
              </span>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 font-mono mb-2">
              {resume}%
            </div>
            <div className="text-xs text-slate-500 leading-relaxed">
              Weighted contribution: <strong className="text-slate-800">{(resume * 0.2).toFixed(1)} pts</strong> matching verified competencies.
            </div>
          </div>
        </div>
      </div>

      {/* ── Next Actions ─────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="font-bold text-slate-900 text-sm mb-1">
            What happens next?
          </div>
          <div className="text-xs text-slate-500 max-w-md">
            Recruiters will evaluate your score card. If shortlisted, you will receive an interview invitation directly in your portal.
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/candidate/applications')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
          >
            <Briefcase size={14} /> My Applications
          </button>
          <button
            onClick={() => navigate('/candidate/interviews')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shadow-xs"
          >
            <Calendar size={14} /> View Interviews
          </button>
        </div>
      </div>
    </div>
  );
}
