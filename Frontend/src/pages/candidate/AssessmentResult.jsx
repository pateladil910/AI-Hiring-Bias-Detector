import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Award,
  CheckCircle2,
  XCircle,
  FileText,
  Code2,
  Layers,
  ArrowRight,
  ShieldCheck,
  Briefcase,
  Calendar,
  Sparkles,
  AlertTriangle,
  Info,
  HelpCircle,
  Target,
  BarChart2,
  UserCheck,
  TrendingUp,
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
        <div style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>Calculating verified composite benchmarks...</div>
      </div>
    );
  }

  // Exact mathematical scores without fabricated defaults
  const mcq = Number(result?.mcqScore ?? 0);
  const coding = Number(result?.codingScore ?? 0);
  const resume = Number(result?.resumeScore ?? 0);
  const composite = Number(result?.compositeScore ?? Math.round((mcq * 0.4) + (coding * 0.4) + (resume * 0.2)));
  const aiAnalysis = result?.aiAnalysis || null;
  const hasResume = Boolean(aiAnalysis?.componentBreakdown?.resume?.hasResume || result?.hasResume || resume > 0);

  const isPassing = composite >= 70;
  const isHighPerformer = composite >= 85;
  const isDeveloping = composite >= 50 && composite < 70;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 font-sans">
      {/* ── Status Banner (Accurate & Honest) ───────────────────────────────── */}
      <div
        className={`border rounded-2xl p-8 text-center mb-8 shadow-xs ${
          isHighPerformer
            ? 'bg-gradient-to-r from-emerald-50 via-teal-50/70 to-emerald-100/50 border-emerald-300'
            : isPassing
            ? 'bg-gradient-to-r from-emerald-50 via-teal-50/50 to-sky-50/50 border-emerald-200'
            : isDeveloping
            ? 'bg-gradient-to-r from-amber-50/80 via-yellow-50/50 to-orange-50/40 border-amber-300'
            : 'bg-gradient-to-r from-slate-50 via-rose-50/40 to-slate-100/50 border-slate-300'
        }`}
      >
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 border ${
            isPassing
              ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
              : isDeveloping
              ? 'bg-amber-100 text-amber-700 border-amber-200'
              : 'bg-slate-200 text-slate-700 border-slate-300'
          }`}
        >
          <Award size={30} />
        </div>

        <span
          className={`inline-block text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full border mb-3 ${
            isHighPerformer
              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
              : isPassing
              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
              : isDeveloping
              ? 'bg-amber-100 text-amber-800 border-amber-300'
              : 'bg-rose-100 text-rose-800 border-rose-200'
          }`}
        >
          {isHighPerformer
            ? '🌟 Exceptional Performance — Fast-Track Shortlist Recommended'
            : isPassing
            ? '✅ Meets Technical Benchmark — Interview Ready'
            : isDeveloping
            ? '⚠️ Developing / Borderline — Needs Technical Review'
            : '❌ Below Technical Benchmark (< 70 Threshold Required)'}
        </span>

        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
          Final Composite Benchmark:{' '}
          <span
            className={`font-mono ${
              isPassing ? 'text-emerald-600' : isDeveloping ? 'text-amber-600' : 'text-rose-600'
            }`}
          >
            {composite}
          </span>{' '}
          / 100
        </h1>
        <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
          {isHighPerformer
            ? 'Candidate demonstrated mastery across domain theory, algorithmic implementation, and background skills.'
            : isPassing
            ? 'Candidate met core technical requirements and demonstrated functional algorithmic capability.'
            : isDeveloping
            ? 'Candidate showed partial aptitude, but gaps were identified in algorithmic test cases or domain theory.'
            : 'The assessment lacked working code solutions, verified aptitude answers, or resume evidence.'}
        </p>
      </div>

      {/* ── Transparent Mathematical Formula Card ─────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-8 shadow-xs">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">
              Verified Mathematical Scoring Formula
            </h3>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Standard: EquiHire Weighted Rubric v3.0
          </span>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 font-mono text-xs leading-relaxed space-y-2">
          <div className="text-emerald-700 font-bold">
            Composite Score = (MCQ × 0.4) + (Coding × 0.4) + (Resume Match × 0.2)
          </div>
          <div className="text-slate-600">
            = ({mcq} × 0.4) + ({coding} × 0.4) + ({resume} × 0.2)
          </div>
          <div className="text-sky-700 font-bold">
            = {(mcq * 0.4).toFixed(1)} + {(coding * 0.4).toFixed(1)} + {(resume * 0.2).toFixed(1)} = {composite} / 100
          </div>
        </div>

        {/* Informative flags for 0-score components */}
        {(mcq === 0 || coding === 0 || resume === 0) && (
          <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs">
            {mcq === 0 && (
              <div className="flex items-center gap-2 text-slate-600">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                <span><strong>MCQ Aptitude (0 pts):</strong> No questions were answered correctly during the timed section.</span>
              </div>
            )}
            {coding === 0 && (
              <div className="flex items-center gap-2 text-slate-600">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                <span><strong>Coding Sandbox (0 pts):</strong> No unit test cases passed in the isolated VM sandbox.</span>
              </div>
            )}
            {resume === 0 && (
              <div className="flex items-center gap-2 text-slate-600">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                <span>
                  <strong>Resume Match (0 pts):</strong> {hasResume ? 'No domain skills detected in uploaded resume.' : <>No resume was uploaded. <Link to="/candidate/resume" className="text-emerald-600 underline font-semibold">Upload your resume</Link> to earn up to 20 match points.</>}
                </span>
              </div>
            )}
            {resume > 0 && (
              <div className="flex items-center gap-2 text-emerald-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                <span>
                  <strong>Resume Match ({(resume * 0.2).toFixed(1)} pts):</strong> {resume}% domain competency match verified from anonymized resume profile.
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Component Breakdown Grid ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {/* Component 1: MCQ */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
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
              Weighted contribution: <strong className="text-slate-800">{(mcq * 0.4).toFixed(1)} pts</strong> out of 40.0 maximum.
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
            {mcq > 0 ? `${Math.round((mcq / 100) * 20)} of 20 questions correct` : '0 of 20 questions answered correctly'}
          </div>
        </div>

        {/* Component 2: Coding Sandbox */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
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
              Weighted contribution: <strong className="text-slate-800">{(coding * 0.4).toFixed(1)} pts</strong> out of 40.0 maximum.
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
            {coding > 0 ? 'Verified test cases passed in isolated VM' : '0 test cases verified in isolated VM'}
          </div>
        </div>

        {/* Component 3: Resume Match */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
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
              Weighted contribution: <strong className="text-slate-800">{(resume * 0.2).toFixed(1)} pts</strong> out of 20.0 maximum.
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
            {resume > 0 ? `${resume}% skills verified from resume` : hasResume ? 'Resume uploaded — 0 domain skills matched' : 'No resume uploaded (0 / 100)'}
          </div>
        </div>
      </div>

      {/* ── AI Objective Evaluation & Hiring Recommendation Matrix ─────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 mb-8 shadow-xs space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center shrink-0">
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              AI Talent Benchmark & Hiring Decision Analysis
            </h2>
            <p className="text-xs text-slate-500">
              Demographic-blind evaluation analyzing readiness, percentile tiers, and objective hiring standards.
            </p>
          </div>
        </div>

        {/* ── Subsection 1: Which Score Is Better? (Standardized Talent Scale) ── */}
        <div>
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
            <BarChart2 size={16} className="text-emerald-600" />
            Standardized Readiness Tiers: Which Scores Are Better?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Tier 1 */}
            <div
              className={`p-3.5 rounded-xl border transition-all ${
                isHighPerformer
                  ? 'bg-emerald-50/80 border-emerald-400 ring-2 ring-emerald-500/20 shadow-xs'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-extrabold text-emerald-700">Tier 1 • 85–100 pts</span>
                {isHighPerformer && <span className="text-[10px] font-bold bg-emerald-600 text-white px-1.5 py-0.5 rounded">Your Tier</span>}
              </div>
              <div className="text-xs font-bold text-slate-900 mb-1">Exceptional Mastery</div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Flawless algorithmic implementation and domain knowledge. Top candidate priority for technical onsite.
              </p>
            </div>

            {/* Tier 2 */}
            <div
              className={`p-3.5 rounded-xl border transition-all ${
                isPassing && !isHighPerformer
                  ? 'bg-emerald-50/80 border-emerald-400 ring-2 ring-emerald-500/20 shadow-xs'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-extrabold text-sky-700">Tier 2 • 70–84 pts</span>
                {isPassing && !isHighPerformer && <span className="text-[10px] font-bold bg-sky-600 text-white px-1.5 py-0.5 rounded">Your Tier</span>}
              </div>
              <div className="text-xs font-bold text-slate-900 mb-1">Interview Ready (Benchmark)</div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Core passing threshold. Proves working code capability and sound architectural fundamentals.
              </p>
            </div>

            {/* Tier 3 */}
            <div
              className={`p-3.5 rounded-xl border transition-all ${
                isDeveloping
                  ? 'bg-amber-50/80 border-amber-400 ring-2 ring-amber-500/20 shadow-xs'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-extrabold text-amber-700">Tier 3 • 50–69 pts</span>
                {isDeveloping && <span className="text-[10px] font-bold bg-amber-600 text-white px-1.5 py-0.5 rounded">Your Tier</span>}
              </div>
              <div className="text-xs font-bold text-slate-900 mb-1">Developing / Borderline</div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Partial test case completion or theory gaps. May require recruiter review or targeted re-screening.
              </p>
            </div>

            {/* Tier 4 */}
            <div
              className={`p-3.5 rounded-xl border transition-all ${
                !isPassing && !isDeveloping
                  ? 'bg-rose-50/80 border-rose-300 ring-2 ring-rose-500/20 shadow-xs'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-extrabold text-rose-700">Tier 4 • &lt; 50 pts</span>
                {!isPassing && !isDeveloping && <span className="text-[10px] font-bold bg-rose-600 text-white px-1.5 py-0.5 rounded">Your Tier</span>}
              </div>
              <div className="text-xs font-bold text-slate-900 mb-1">Below Benchmark</div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Unsolved code, absent resume, or unattempted MCQs. Below interview threshold.
              </p>
            </div>
          </div>
        </div>

        {/* ── Subsection 2: Who Do Companies Hire? (Objective Hiring Policy) ── */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <UserCheck size={16} className="text-indigo-600" />
              Who Do Companies Hire? (Objective Hiring Standards)
            </h3>
            <span className="text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 rounded-full">
              EEOC &amp; Bias-Free Compliant
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            On FairHire, <strong>no candidate is hired or rejected based on personal identity</strong> (names, photos, universities, age, and genders remain completely masked). Instead, hiring teams make shortlisting decisions based on <strong>three auditable criteria</strong>:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
              <div className="font-bold text-slate-900">1. Working Code Evidence</div>
              <div className="text-slate-500 leading-relaxed">
                Passing unit tests in the isolated VM sandbox verifies real algorithmic implementation, not memorized answers.
              </div>
            </div>
            <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
              <div className="font-bold text-slate-900">2. 70+ Composite Threshold</div>
              <div className="text-slate-500 leading-relaxed">
                Hiring leads prioritize candidates whose weighted total reaches at least 70/100 across both theory and code.
              </div>
            </div>
            <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
              <div className="font-bold text-slate-900">3. Verified Competencies</div>
              <div className="text-slate-500 leading-relaxed">
                Aptitude accuracy and cloaked resume skills must align with the target technical domain requirements.
              </div>
            </div>
          </div>

          {/* Individual Candidate Recommendation Verdict */}
          <div className="pt-3 border-t border-slate-200/80 flex items-start gap-3">
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-white font-bold text-xs ${
                isPassing ? 'bg-emerald-600' : isDeveloping ? 'bg-amber-500' : 'bg-rose-500'
              }`}
            >
              {isPassing ? '✓' : '!'}
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">
                AI Shortlist Verdict for this Candidate:{' '}
                <span className={isPassing ? 'text-emerald-700' : isDeveloping ? 'text-amber-700' : 'text-rose-700'}>
                  {isHighPerformer
                    ? 'Recommended for Fast-Track Technical Interview'
                    : isPassing
                    ? 'Qualified for Technical Screening Interview'
                    : isDeveloping
                    ? 'Hold for Recruiter Review / Potential Re-test'
                    : 'Not Recommended for Interview (Threshold Not Met)'}
                </span>
              </div>
              <div className="text-xs text-slate-600 mt-1 leading-relaxed">
                {isPassing
                  ? 'This candidate successfully crossed the 70-point qualification bar with verified evidence. Recruiters can view anonymized code submissions and schedule interviews directly.'
                  : 'To achieve interview eligibility, a candidate must submit working code that passes test cases, complete the MCQ assessment, and attach a resume in the candidate portal.'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Next Actions ─────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="font-bold text-slate-900 text-sm mb-1">
            Recommended Next Step
          </div>
          <div className="text-xs text-slate-500 max-w-md">
            {isPassing
              ? 'Your score has been registered in the blind applicant pool. Recruiters can review your code and schedule interviews.'
              : 'You can upload your resume or choose another domain track from your dashboard to establish a higher benchmark.'}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/candidate/domain')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
          >
            <Target size={14} /> Domain Tracks
          </button>
          <button
            onClick={() => navigate('/candidate/dashboard')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shadow-xs"
          >
            <Briefcase size={14} /> Candidate Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
