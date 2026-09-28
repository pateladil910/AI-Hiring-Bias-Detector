import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ShieldCheck,
  Eye,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Tag,
  Lock,
} from 'lucide-react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function RedactionReview() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const refId = searchParams.get('refId');

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, [refId]);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('fairhire_token');
      const url = refId
        ? `${API_BASE}/api/resume/profile/${refId}`
        : `${API_BASE}/api/resume/my`;

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const profile = res.data.resume || res.data;
      setData(profile);
      if (profile?.confirmed) {
        setConfirmed(true);
      }
    } catch (err) {
      setError('Could not load redaction review. Please upload your resume first.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!data?.refId) return;
    setConfirming(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('fairhire_token');
      await axios.post(
        `${API_BASE}/api/resume/confirm/${data.refId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setConfirmed(true);
      setTimeout(() => {
        navigate('/candidate/domain');
      }, 800);
    } catch (err) {
      setError('Failed to record confirmation. Please try again.');
    } finally {
      setConfirming(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '80px 24px' }}>
        <div className="spinner" style={{ margin: '0 auto 16px' }} />
        <div style={{ color: 'var(--color-text-secondary)' }}>Loading anonymized resume preview...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container" style={{ maxWidth: 640, margin: '60px auto', textAlign: 'center' }}>
        <AlertTriangle size={48} color="#facc15" style={{ marginBottom: 16 }} />
        <h2 style={{ color: '#fff', fontSize: 22, marginBottom: 8 }}>No Resume Found</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 24 }}>{error}</p>
        <button onClick={() => navigate('/candidate/resume')} className="btn btn-primary">
          Go to Resume Upload
        </button>
      </div>
    );
  }

  const markers = data.detectedMarkers || [];
  const skills = data.extractedSkills || [];

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8 font-sans">
      {/* ── Top Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full border border-emerald-200">
              Stage 01 Review
            </span>
            <span className="text-xs text-slate-500">
              Candidate Alias: <strong className="font-mono text-emerald-700 font-bold">{data.refId}</strong>
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Verify Demographic Redaction Preview
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/candidate/resume')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold transition-colors"
          >
            <RotateCcw size={13} /> Re-upload
          </button>
          {!confirmed ? (
            <button
              onClick={handleConfirm}
              disabled={confirming}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold transition-colors shadow-xs"
            >
              <CheckCircle2 size={15} />
              {confirming ? 'Confirming...' : 'Confirm Anonymized Profile'}
            </button>
          ) : (
            <button
              onClick={() => navigate('/candidate/domain')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shadow-xs"
            >
              <span>Proceed to Domain Selection</span>
              <ArrowRight size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Confirmation Success Banner */}
      {confirmed && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6 flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5 text-xs font-semibold text-emerald-800">
            <CheckCircle2 size={18} className="text-emerald-600" />
            Profile confirmed! Your resume has been locked and certified demographic-neutral.
          </div>
          <button
            onClick={() => navigate('/candidate/domain')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shadow-xs"
          >
            <span>Select Domain Track</span>
            <ArrowRight size={13} />
          </button>
        </div>
      )}

      {/* ── AI Multi-Domain Compatibility & Scoring Card ────────────────────── */}
      {data.aiAnalysis && data.aiAnalysis.domainMatches && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 mb-8 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center shrink-0">
                <Sparkles size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  AI Resume Intelligence & Multi-Domain Alignment
                  <span className="text-[11px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full border border-purple-200">
                    Live Evaluation
                  </span>
                </h2>
                <p className="text-xs text-slate-500">
                  Automated algorithmic scoring analyzing skills, project implementation depth, and domain fit.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500">Top Alignment:</span>
              <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                {data.aiAnalysis.bestDomainName} ({data.aiAnalysis.overallScore}%)
              </span>
            </div>
          </div>

          {/* Profile Summary & Strengths */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 mb-6">
            <p className="text-xs text-slate-700 leading-relaxed font-medium mb-3">
              {data.aiAnalysis.profileSummary}
            </p>

            {data.aiAnalysis.strengths && data.aiAnalysis.strengths.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200/60">
                {data.aiAnalysis.strengths.map((str, sIdx) => (
                  <span
                    key={sIdx}
                    className="inline-flex items-center gap-1.5 text-[11px] font-semibold bg-white border border-slate-200 text-slate-700 px-2.5 py-1 rounded-md shadow-2xs"
                  >
                    <CheckCircle2 size={12} className="text-emerald-600" />
                    {str}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Domain Match Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(data.aiAnalysis.domainMatches).map(([domainId, match]) => {
              const isBest = match.recommended || domainId === data.aiAnalysis.bestDomainId;

              return (
                <div
                  key={domainId}
                  className={`rounded-xl p-5 border flex flex-col justify-between transition-all ${
                    isBest
                      ? 'bg-gradient-to-b from-emerald-50/50 to-white border-emerald-300 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        isBest
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : match.score >= 80
                          ? 'bg-sky-100 text-sky-800 border-sky-200'
                          : 'bg-amber-100 text-amber-800 border-amber-200'
                      }`}>
                        {match.fitBadge}
                      </span>
                      <span className="font-mono font-extrabold text-base text-slate-900">
                        {match.score}%
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 mb-1">
                      {match.domainName}
                    </h3>
                    <p className="text-[11px] text-slate-600 mb-3 leading-relaxed">
                      {match.aiAnalysis}
                    </p>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 rounded-full h-2 mb-3 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          match.score >= 90
                            ? 'bg-emerald-500'
                            : match.score >= 75
                            ? 'bg-teal-500'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${match.score}%` }}
                      />
                    </div>

                    {/* Matched Skills Chips */}
                    <div className="mb-3">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Verified Competencies ({match.matchedSkills?.length || 0})
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {match.matchedSkills?.slice(0, 4).map((sk, sIdx) => (
                          <span
                            key={sIdx}
                            className="bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-1.5 py-0.5 rounded text-[10px] font-medium"
                          >
                            ✓ {sk}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Relevant Project Evidence */}
                    {match.relevantProjects && match.relevantProjects.length > 0 && (
                      <div className="text-[11px] text-slate-500 bg-slate-50 border border-slate-200/60 rounded-lg p-2.5 mb-3">
                        <span className="font-semibold text-slate-700 block mb-0.5">
                          Project Evidence:
                        </span>
                        <span className="line-clamp-2 text-slate-600">
                          {match.relevantProjects[0].title}
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => navigate(`/candidate/domain?selected=${domainId}`)}
                    className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      isBest
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <span>Choose {match.domainName.split(' ')[0]} Track</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Side-by-Side Split View ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Redacted Markers & Skills Evidence */}
        <div className="space-y-6">
          {/* Detected & Redacted Markers */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck size={18} className="text-emerald-600" />
              <h3 className="text-base font-bold text-slate-900">
                Detected & Masked Demographic Markers
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              The following categories have been completely stripped and replaced with deterministic tokens to eliminate unconscious recruiter bias.
            </p>

            <div className="space-y-2.5">
              {markers.length > 0 ? (
                markers.map((marker, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        {marker.type}
                      </div>
                      <div className="text-[11px] text-emerald-700 font-mono font-medium">
                        Replaced with: {marker.example || '[REDACTED]'}
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                      Masked
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-500 py-2">
                  ✓ Standard demographic identifiers stripped.
                </div>
              )}
            </div>
          </div>

          {/* Extracted Technical Skills */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              <Tag size={18} className="text-sky-600" />
              <h3 className="text-base font-bold text-slate-900">
                Extracted Skills Evidence
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              These competencies were extracted from your experience and will be matched against domain job criteria.
            </p>

            <div className="flex flex-wrap gap-2">
              {skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="bg-sky-50 text-sky-700 border border-sky-200 px-2.5 py-1 rounded-lg text-xs font-semibold"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Redacted Document Preview */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Eye size={18} className="text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Recruiter View: Anonymized Preview
                </h3>
              </div>
              <span className="text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                Zero PII
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 font-mono text-xs leading-relaxed text-slate-800 whitespace-pre-wrap max-h-[500px] overflow-y-auto">
              {data.redactedText || 'No text content available.'}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
            <Lock size={13} className="text-slate-400" />
            <span>This exact redacted representation is what hiring managers review during initial talent evaluation.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
