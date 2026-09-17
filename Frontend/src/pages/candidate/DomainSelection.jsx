import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Code,
  Target,
  Clock,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function DomainSelection() {
  const navigate = useNavigate();
  const [domains, setDomains] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState('fullstack');
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDomains();
  }, []);

  const fetchDomains = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/assessment/domains`);
      setDomains(res.data.domains || []);
    } catch (err) {
      console.error('Failed to load domains:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async () => {
    setStarting(true);
    setError('');

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('fairhire_token');
      const res = await axios.post(
        `${API_BASE}/api/assessment/start`,
        { domainId: selectedDomain },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      navigate(`/candidate/assessment/${res.data.assessmentId}`);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to initialize assessment. Please try again.');
    } finally {
      setStarting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full mb-3">
          <Target size={14} className="text-emerald-600" /> Stage 02: Domain Assessment Track
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
          Select Your Engineering Assessment Specialization
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
          All tracks feature standardized, objective benchmarks: 5 knowledge MCQs followed by 1 sandboxed algorithmic coding task.
        </p>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-xs font-medium mb-6 text-center">
          {error}
        </div>
      )}

      {/* ── Domain Cards Grid ───────────────────────────────────────────── */}
      {loading ? (
        <div className="text-center py-16 text-slate-500 text-sm">
          Loading assessment tracks...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {domains.map((domain) => {
            const isSelected = selectedDomain === domain.id;

            return (
              <div
                key={domain.id}
                onClick={() => setSelectedDomain(domain.id)}
                className={`bg-white rounded-2xl p-6 cursor-pointer transition-all duration-150 border flex flex-col justify-between ${
                  isSelected
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md bg-emerald-50/10'
                    : 'border-slate-200 shadow-xs hover:border-slate-300 hover:shadow-sm'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isSelected ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600'
                    }`}>
                      <Code size={20} />
                    </div>

                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                      isSelected ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300 bg-white'
                    }`}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-2">
                    {domain.name}
                  </h3>
                  <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                    {domain.description}
                  </p>

                  {/* Skills tags */}
                  <div className="mb-4">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Required Competencies
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {domain.requiredSkills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="bg-slate-100 text-slate-700 border border-slate-200/80 px-2 py-0.5 rounded text-[11px] font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Duration & Format Pill */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Clock size={13} className="text-emerald-600" /> {domain.durationMinutes} Minutes
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Layers size={13} className="text-sky-600" /> {domain.format}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Start Assessment Bar ────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center flex-shrink-0">
            <ShieldCheck size={20} />
          </div>
          <div>
            <div className="font-bold text-slate-900 text-sm">
              Ready to begin?
            </div>
            <div className="text-xs text-slate-500">
              The 30-minute server timer starts once you confirm on the next screen. Progress is autosaved every 30 seconds.
            </div>
          </div>
        </div>

        <button
          onClick={handleStart}
          disabled={starting || loading}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-xs"
        >
          <span>{starting ? 'Launching Assessment...' : 'Start Timed Assessment'}</span>
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}
