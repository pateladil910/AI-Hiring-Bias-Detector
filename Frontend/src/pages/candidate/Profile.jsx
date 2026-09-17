import { useState } from 'react';
import { User, ShieldCheck, Mail, Download, Trash2, Bell, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Profile() {
  const { user } = useAuth();

  const [email, setEmail] = useState(user?.email || 'candidate@equihire.demo');
  const [firstName, setFirstName] = useState(user?.firstName || 'Alex');
  const [lastName, setLastName] = useState(user?.lastName || 'Morgan');
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [inAppNotifs, setInAppNotifs] = useState(true);

  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setMessage('Profile settings saved successfully.');
    setTimeout(() => setSaved(false), 3000);
  };

  const handleExportData = () => {
    const candidateData = {
      profile: { firstName, lastName, email },
      anonymizedRefId: 'CAND-7F21',
      assessments: [
        { domain: 'Full Stack Engineering', score: 88, evaluatedAt: '2026-09-14' }
      ],
      auditTrailReference: 'AUDIT-LOG-2026-EQUIHIRE',
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(candidateData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fairhire_candidate_data_${Date.now()}.json`;
    a.click();
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you wish to permanently erase your profile and assessment history under GDPR Article 17 (Right to Erasure)? This action is irreversible.')) {
      alert('Your deletion request has been registered and personal records will be scrubbed within 24 hours.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
            <User className="w-7 h-7 text-emerald-400" />
            Candidate Profile & Privacy Settings
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage your personal credentials, notification alerts, and GDPR data rights.
          </p>
        </div>

        {saved && (
          <div className="p-4 bg-emerald-900/30 border border-emerald-500/40 rounded-xl flex items-center gap-2 text-sm text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
            <span>{message}</span>
          </div>
        )}

        {/* Basic Info Form */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-xl">
          <h2 className="text-lg font-bold text-white mb-4">Contact Information</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full rounded-lg bg-slate-950/60 border border-slate-700 px-3.5 py-2.5 text-sm text-white focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full rounded-lg bg-slate-950/60 border border-slate-700 px-3.5 py-2.5 text-sm text-white focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg bg-slate-950/60 border border-slate-700 px-3.5 py-2.5 text-sm text-white focus:border-emerald-500"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs transition"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>

        {/* Notification Preferences */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">Notification Preferences</h2>
          </div>
          <div className="space-y-4 text-sm text-slate-300">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={emailNotifs}
                onChange={(e) => setEmailNotifs(e.target.checked)}
                className="rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-500 w-4 h-4"
              />
              <span>Receive email alerts when my application status changes or interview invites arrive</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={inAppNotifs}
                onChange={(e) => setInAppNotifs(e.target.checked)}
                className="rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-500 w-4 h-4"
              />
              <span>Enable real-time in-app notification toasts and inbox badges</span>
            </label>
          </div>
        </div>

        {/* GDPR Privacy Controls */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">GDPR & Data Subject Rights</h2>
          </div>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            In compliance with GDPR and global privacy standards, you maintain full authority over your data.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleExportData}
              className="px-4 py-2.5 rounded-lg border border-slate-700 hover:border-emerald-500 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition"
            >
              <Download className="w-4 h-4 text-emerald-400" /> Export Personal Data (JSON)
            </button>
            <button
              onClick={handleDeleteAccount}
              className="px-4 py-2.5 rounded-lg border border-red-900/60 hover:bg-red-950/40 text-red-400 text-xs font-semibold flex items-center justify-center gap-2 transition"
            >
              <Trash2 className="w-4 h-4" /> Request Data Erasure (GDPR Art. 17)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
