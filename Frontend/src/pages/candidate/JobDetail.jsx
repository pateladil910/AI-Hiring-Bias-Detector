import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, MapPin, Briefcase, Building, Clock, CheckCircle2, ArrowLeft, ArrowRight, Award } from 'lucide-react';
import { jobsAPI } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchJob();
  }, [id]);

  const fetchJob = async () => {
    try {
      setLoading(true);
      const res = await jobsAPI.get(id);
      setJob(res.data.job);
    } catch (err) {
      setError('Failed to load job details. The posting may have expired.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!user) {
      navigate('/login?redirect=' + encodeURIComponent(`/jobs/${id}`));
    } else {
      navigate(`/candidate/apply/${id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold mb-2">Job Not Found</h2>
        <p className="text-slate-400 mb-6">{error || 'This opportunity could not be located.'}</p>
        <Link to="/jobs" className="px-4 py-2 bg-emerald-500 text-slate-950 rounded-lg font-semibold text-sm">
          Browse All Openings
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link to="/jobs" className="inline-flex items-center text-sm text-slate-400 hover:text-emerald-400 transition">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to all jobs
          </Link>
        </div>

        {/* Job Header Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-full inline-flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> Bias-Scanned & Verified
                </span>
                <span className="text-xs text-slate-500">•</span>
                <span className="text-xs text-slate-400">{job.department || 'Engineering'}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{job.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 mt-3">
                <span className="flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-slate-500" /> {job.organisation?.name || 'Partner Employer'}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-500" /> {job.location || 'Remote / Flexible'}
                </span>
                <span className="flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-slate-500" /> {job.employmentType || 'Full-time'}
                </span>
              </div>
            </div>

            <button
              onClick={handleApply}
              className="px-6 py-3.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 whitespace-nowrap"
            >
              Apply With Demographic Shield <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Description & Assessment Roadmap */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-6">
              <h2 className="text-lg font-bold text-white mb-4">About the Role</h2>
              <div className="text-slate-300 leading-relaxed text-sm whitespace-pre-line">
                {job.cleanedDescription || job.description}
              </div>
            </div>

            {job.requirements && (
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-6">
                <h2 className="text-lg font-bold text-white mb-4">Objective Technical Requirements</h2>
                <div className="text-slate-300 leading-relaxed text-sm whitespace-pre-line">
                  {job.requirements}
                </div>
              </div>
            )}
          </div>

          {/* Assessment Funnel Sidebar */}
          <div className="space-y-6">
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-6">
              <div className="flex items-center gap-2 text-emerald-400 mb-3">
                <Award className="w-5 h-5" />
                <h3 className="font-bold text-white text-base">Hiring Process</h3>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                This employer uses FairHire's demographic-neutral assessment pipeline:
              </p>

              <ol className="space-y-3.5 text-xs text-slate-300">
                <li className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</div>
                  <span><strong>Blind Resume Parsing:</strong> Names, locations, and personal identifiers are stripped.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</div>
                  <span><strong>Technical MCQ & Code:</strong> Timed domain aptitude and algorithmic tests.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</div>
                  <span><strong>Composite Scoring:</strong> Real transparent mathematical formulas derived from code output.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">4</div>
                  <span><strong>Recruiter Human Review:</strong> Reviewer evaluates code quality and skills strictly blind.</span>
                </li>
              </ol>

              <div className="mt-6 pt-4 border-t border-slate-800">
                <button
                  onClick={handleApply}
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs transition"
                >
                  Start Application
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
