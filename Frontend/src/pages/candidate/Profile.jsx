import { useState, useEffect } from 'react';
import { User, ShieldCheck, Mail, Download, Trash2, CheckCircle2, AlertCircle, FileText, Lock, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Profile() {
  const { user, logout } = useAuth();

  const [email, setEmail] = useState(user?.email || '');
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [cloakedAlias, setCloakedAlias] = useState('');
  const [skills, setSkills] = useState([]);
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('fairhire_token');
      const res = await axios.get(`${API_BASE}/api/candidate/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmail(res.data.email || '');
      setFirstName(res.data.firstName || '');
      setLastName(res.data.lastName || '');
      setCloakedAlias(res.data.cloakedAlias || `CAND-${(res.data.id || 'ANON').slice(0, 6).toUpperCase()}`);
      setSkills(res.data.extractedSkills || []);
    } catch (_) {}
    finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('fairhire_token');
      await axios.put(
        `${API_BASE}/api/candidate/profile`,
        { firstName, lastName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSaved(true);
      setMessage('Profile contact information updated.');
      setTimeout(() => setSaved(false), 3000);
    } catch (_) {
      setMessage('Failed to update profile.');
    }
  };

  const handleExportData = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('fairhire_token');
      const res = await axios.post(
        `${API_BASE}/api/candidate/export`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob',
        }
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `fairhire_candidate_data_${Date.now()}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (_) {
      alert('Failed to export data package.');
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you wish to permanently erase your profile and assessment history under GDPR Article 17 (Right to Erasure)? This action is irreversible.')) {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('fairhire_token');
        await axios.delete(`${API_BASE}/api/candidate/account`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert('Your account and personal data have been completely scrubbed from our systems.');
        logout();
        window.location = '/';
      } catch (_) {
        alert('Failed to delete account.');
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 font-sans">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full mb-3">
          <User size={14} className="text-emerald-600" /> Profile & Privacy Console
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
          Candidate Identity & Data Privacy Controls
        </h1>
        <p className="text-sm text-slate-600 max-w-xl">
          Manage your personal credentials, view your blind evaluation alias, and exercise full GDPR data rights.
        </p>
      </div>

      {saved && (
        <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs font-semibold mb-6 shadow-xs">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {/* ── Cloaked Identity Card ─────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50/60 to-sky-50/50 border border-emerald-200 rounded-2xl p-6 mb-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Public Recruiter Alias
          </div>
          <div className="text-2xl font-extrabold text-emerald-700 font-mono mt-1">
            {cloakedAlias || 'CAND-ANON'}
          </div>
          <div className="text-xs text-slate-600 mt-1">
            This deterministic identifier is the only identity shared with recruiters until the final interview stage.
          </div>
        </div>

        <span className="text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-lg">
          Active Cloaking Protocol
        </span>
      </div>

      {/* ── Basic Info Form ───────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 mb-6 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 mb-5">
          Contact Information (Private & Encrypted)
        </h2>

        <form onSubmit={handleSave}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                First Name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-500 cursor-not-allowed"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shadow-xs"
          >
            Save Contact Info
          </button>
        </form>
      </div>

      {/* ── Extracted Skills Overview ─────────────────────────────────────── */}
      {skills.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-3">
            Verified Skill Competencies
          </h3>
          <div className="flex flex-wrap gap-2">
            {skills.map((s, idx) => (
              <span
                key={idx}
                className="bg-sky-50 text-sky-700 border border-sky-200 px-2.5 py-1 rounded-lg text-xs font-semibold"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── GDPR Compliance & Data Portability Controls ───────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 mb-1">
          Data Rights & Portability (GDPR / CCPA)
        </h2>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
          Under international algorithmic fairness and privacy regulations, you retain full control over your submitted resumes, audit logs, and assessment scores.
        </p>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <div>
              <div className="font-semibold text-slate-900 text-xs">
                Download Complete Data Package (JSON)
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Export your full profile, encrypted resume records, assessment scores, and audit activities.
              </div>
            </div>
            <button
              onClick={handleExportData}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-semibold hover:bg-white transition-colors"
            >
              <Download size={13} /> Export My Data
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-rose-50/50 border border-rose-200 rounded-xl">
            <div>
              <div className="font-semibold text-rose-700 text-xs">
                Right to Erasure (Delete Account)
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Permanently scrub your personal identifiable information, applications, and test history from our database.
              </div>
            </div>
            <button
              onClick={handleDeleteAccount}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors shadow-xs"
            >
              <Trash2 size={13} /> Delete My Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
