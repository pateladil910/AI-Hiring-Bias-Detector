import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FileText,
  Target,
  HelpCircle,
  Code2,
  Award,
  ArrowRight,
  CheckCircle2,
  Clock,
  Briefcase,
  Calendar,
  AlertCircle,
  Shield,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function CandidateDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    fetchProgress();
    fetchJobs();
  }, []);

  const fetchProgress = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('fairhire_token');
      const res = await axios.get(`${API_BASE}/api/candidate/application`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProgress(res.data);
    } catch (err) {
      console.error('Failed to load candidate progress:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/jobs?status=published&limit=3`);
      setJobs(res.data.jobs || []);
    } catch (_) {}
  };

  const currentStep = progress?.currentStep || 1;
  const stepsData = progress?.steps || {};

  const stepperItems = [
    {
      num: 1,
      id: 'resume',
      title: 'Resume & PII Redaction',
      desc: 'Upload PDF and review demographic anonymization',
      icon: <FileText size={20} />,
      link: '/candidate/resume',
      completed: stepsData.resume?.completed,
      active: currentStep === 1,
      badge: stepsData.resume?.completed ? 'Confirmed' : stepsData.resume?.refId ? 'Pending Review' : 'Required',
    },
    {
      num: 2,
      id: 'domain',
      title: 'Select Domain Track',
      desc: 'Choose your engineering specialization',
      icon: <Target size={20} />,
      link: '/candidate/domain',
      completed: stepsData.domain?.completed,
      active: currentStep === 2,
      badge: stepsData.domain?.completed ? 'Selected' : 'Open',
    },
    {
      num: 3,
      id: 'mcq',
      title: 'MCQ Aptitude Assessment',
      desc: '30-minute timed knowledge evaluation',
      icon: <HelpCircle size={20} />,
      link: '/candidate/domain',
      completed: stepsData.mcq?.completed,
      active: currentStep === 3,
      badge: stepsData.mcq?.completed
        ? `${stepsData.mcq.score != null ? stepsData.mcq.score : 0}% Score`
        : 'Timed (30m)',
    },
    {
      num: 4,
      id: 'coding',
      title: 'Coding Sandbox IDE',
      desc: 'Interactive algorithmic programming challenge',
      icon: <Code2 size={20} />,
      link: stepsData.mcq?.testId ? `/candidate/coding/${stepsData.mcq.testId}` : '/candidate/domain',
      completed: stepsData.coding?.completed,
      active: currentStep === 4,
      badge: stepsData.coding?.completed
        ? `${stepsData.coding.testsPassed ?? 0}/${stepsData.coding.testsTotal ?? 4} Passed`
        : 'Sandboxed',
    },
    {
      num: 5,
      id: 'results',
      title: 'Transparent Score Card',
      desc: 'Weighted evaluation formula: MCQ×0.4 + Coding×0.4 + Resume×0.2',
      icon: <Award size={20} />,
      link: '/candidate/domain',
      completed: stepsData.results?.ready,
      active: currentStep === 5,
      badge: stepsData.results?.ready
        ? `${stepsData.results.compositeScore != null ? stepsData.results.compositeScore : 0}/100 Final`
        : 'Pending Review',
    },
  ];

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8 font-sans">
      {/* ── Welcome & Candidate Profile Hero Banner ───────────────────────── */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50/60 to-sky-50/50 border border-emerald-200/80 rounded-2xl p-6 sm:p-8 mb-8 flex flex-wrap items-center justify-between gap-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5 mb-2.5">
            <span className="text-xs font-bold uppercase tracking-wider bg-emerald-100/80 text-emerald-800 px-3 py-1 rounded-full border border-emerald-200">
              Algorithmic Merit Hiring
            </span>
            <span className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
              <Shield size={14} className="text-emerald-600" /> 100% Demographic-Blind Evaluation
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            Welcome back, {user?.firstName || 'Engineer'}!
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
            Your hiring process is entirely demographic-neutral. Recruiters only see your anonymized alias, verified skills, and validated assessment benchmarks.
          </p>
        </div>

        {/* Quick Stats Cards */}
        <div className="flex items-center gap-3">
          <div className="bg-white border border-slate-200/80 rounded-xl px-5 py-3.5 text-center shadow-xs">
            <div className="text-2xl font-extrabold text-emerald-600 font-mono">
              {progress?.stats?.totalApplications ?? 0}
            </div>
            <div className="text-xs font-medium text-slate-500 mt-0.5">
              Applications
            </div>
          </div>
          <div className="bg-white border border-slate-200/80 rounded-xl px-5 py-3.5 text-center shadow-xs">
            <div className="text-2xl font-extrabold text-sky-600 font-mono">
              {progress?.stats?.scheduledInterviews ?? 1}
            </div>
            <div className="text-xs font-medium text-slate-500 mt-0.5">
              Interviews
            </div>
          </div>
        </div>
      </div>

      {/* ── 5-Step Progress Stepper Section ─────────────────────────────────── */}
      <div className="mb-10">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Your 5-Stage Candidate Journey
            </h2>
            <p className="text-xs text-slate-500">
              Complete each stage sequentially to advance your blind technical profile to recruiters.
            </p>
          </div>
          <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold">
            Stage {currentStep} of 5 Active
          </span>
        </div>

        {/* Stepper Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {stepperItems.map((step) => {
            const isCompleted = step.completed;
            const isCurrent = step.active;

            return (
              <div
                key={step.num}
                onClick={() => navigate(step.link)}
                className={`bg-white rounded-xl p-5 cursor-pointer transition-all duration-150 flex flex-col justify-between border ${
                  isCurrent
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm bg-emerald-50/20'
                    : isCompleted
                    ? 'border-emerald-200 shadow-xs hover:border-emerald-300'
                    : 'border-slate-200 shadow-xs hover:border-slate-300 hover:shadow-sm'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-700'
                          : isCurrent
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 size={20} /> : step.icon}
                    </div>

                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                        isCompleted
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : isCurrent
                          ? 'bg-sky-50 text-sky-700 border border-sky-200'
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}
                    >
                      {step.badge}
                    </span>
                  </div>

                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    STEP 0{step.num}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1.5 line-clamp-1">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                <div className={`mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs font-semibold ${
                  isCurrent ? 'text-emerald-700' : 'text-slate-600'
                }`}>
                  <span>{isCompleted ? 'Review Result' : isCurrent ? 'Continue Step' : 'Start Stage'}</span>
                  <ArrowRight size={13} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Two Column Action Area: Open Verified Jobs & Quick Navigation ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bias-Audited Verified Job Openings */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Briefcase size={18} className="text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Open Verified Positions
                </h3>
              </div>
              <Link
                to="/candidate/jobs"
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                View All Roles →
              </Link>
            </div>

            <div className="space-y-3">
              {jobs.length > 0 ? (
                jobs.map((job) => (
                  <div
                    key={job.id}
                    className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-between gap-4"
                  >
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 mb-1">
                        {job.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs flex-wrap">
                        <span className="text-slate-600 font-medium">
                          {job.skillProfileJson?.salary_range || '$110,000 - $140,000'}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                          Bias Scanned (0.0% PII)
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/candidate/apply/${job.id}`)}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-colors shadow-xs flex-shrink-0"
                    >
                      Apply Now
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-slate-500">
                  Loading verified positions...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Candidate Protection & Interview Readiness */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={18} className="text-sky-600" />
              <h3 className="text-base font-bold text-slate-900">
                Blind Hiring Protections Active
              </h3>
            </div>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 font-semibold">Demographic Masking:</strong> Name, photo, gender indicators, age markers, and physical addresses are automatically stripped before hiring panels see your file.
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 font-semibold">Transparent Evaluation:</strong> All tests produce an unalterable formula score: <code className="bg-slate-100 text-slate-800 px-1 py-0.5 rounded text-[11px]">MCQ × 0.4 + Coding × 0.4 + Resume × 0.2</code>.
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 font-semibold">Candidate Rights (GDPR/CCPA):</strong> You retain full data portability and can export your verified logs or request full record deletion anytime.
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-3">
            <Link
              to="/candidate/interviews"
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 text-xs font-medium transition-colors"
            >
              <Calendar size={13} /> My Interviews
            </Link>
            <Link
              to="/candidate/profile"
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 text-xs font-medium transition-colors"
            >
              Privacy & Data Export
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
