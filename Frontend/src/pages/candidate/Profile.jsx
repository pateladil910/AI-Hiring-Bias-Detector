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
    <div className="container" style={{ maxWidth: 900, margin: '0 auto', padding: '36px 24px' }}>
      <div style={{ marginBottom: 32 }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(16, 185, 129, 0.15)',
            color: '#34d399',
            padding: '4px 12px',
            borderRadius: 9999,
            fontSize: 12,
            fontWeight: 700,
            marginBottom: 12,
          }}
        >
          <User size={14} /> Profile & Privacy Console
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 8px', color: '#fff' }}>
          Candidate Identity & Data Privacy Controls
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 15, margin: 0 }}>
          Manage your personal credentials, view your blind evaluation alias, and exercise full GDPR data rights.
        </p>
      </div>

      {saved && (
        <div
          style={{
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid #10b981',
            borderRadius: 12,
            padding: '14px 18px',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            color: '#34d399',
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          <CheckCircle2 size={18} />
          {message}
        </div>
      )}

      {/* ── Cloaked Identity Card ─────────────────────────────────────────── */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(56, 189, 248, 0.05) 100%)',
          border: '1px solid var(--color-border)',
          borderRadius: 16,
          padding: 24,
          marginBottom: 28,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            Public Recruiter Alias
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#34d399', fontFamily: 'monospace', marginTop: 2 }}>
            {cloakedAlias || 'CAND-ANON'}
          </div>
          <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 4 }}>
            This deterministic identifier is the only identity shared with recruiters until the final interview stage.
          </div>
        </div>

        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            background: 'rgba(16, 185, 129, 0.2)',
            color: '#34d399',
            padding: '4px 12px',
            borderRadius: 8,
          }}
        >
          Active Cloaking Protocol
        </span>
      </div>

      {/* ── Basic Info Form ───────────────────────────────────────────────── */}
      <div
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 16,
          padding: 32,
          marginBottom: 28,
        }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 20px', color: '#fff' }}>
          Contact Information (Private & Encrypted)
        </h2>

        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                First Name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                style={{
                  width: '100%',
                  background: '#090f0c',
                  border: '1px solid var(--color-border)',
                  borderRadius: 10,
                  padding: '10px 14px',
                  color: '#fff',
                  fontSize: 14,
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                style={{
                  width: '100%',
                  background: '#090f0c',
                  border: '1px solid var(--color-border)',
                  borderRadius: 10,
                  padding: '10px 14px',
                  color: '#fff',
                  fontSize: 14,
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              disabled
              style={{
                width: '100%',
                background: '#090f0c',
                border: '1px solid var(--color-border)',
                borderRadius: 10,
                padding: '10px 14px',
                color: 'var(--color-text-muted)',
                fontSize: 14,
                outline: 'none',
              }}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-sm">
            Save Contact Info
          </button>
        </form>
      </div>

      {/* ── Extracted Skills Overview ─────────────────────────────────────── */}
      {skills.length > 0 && (
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 16,
            padding: 24,
            marginBottom: 28,
          }}
        >
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 12px', color: '#fff' }}>
            Verified Skill Competencies
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {skills.map((s, idx) => (
              <span
                key={idx}
                style={{
                  background: 'rgba(56, 189, 248, 0.1)',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  color: '#38bdf8',
                  padding: '4px 10px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── GDPR Compliance & Data Portability Controls ───────────────────── */}
      <div
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 16,
          padding: 32,
        }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 8px', color: '#fff' }}>
          Data Rights & Portability (GDPR / CCPA)
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 13, margin: '0 0 24px' }}>
          Under international algorithmic fairness and privacy regulations, you retain full control over your submitted resumes, audit logs, and assessment scores.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12,
              padding: 16,
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--color-border)',
              borderRadius: 12,
            }}
          >
            <div>
              <div style={{ fontWeight: 600, color: '#fff', fontSize: 14 }}>
                Download Complete Data Package (JSON)
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>
                Export your full profile, encrypted resume records, assessment scores, and audit activities.
              </div>
            </div>
            <button
              onClick={handleExportData}
              className="btn btn-outline btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Download size={14} /> Export My Data
            </button>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12,
              padding: 16,
              background: 'rgba(239, 68, 68, 0.04)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: 12,
            }}
          >
            <div>
              <div style={{ fontWeight: 600, color: '#f87171', fontSize: 14 }}>
                Right to Erasure (Delete Account)
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>
                Permanently scrub your personal identifiable information, applications, and test history from our database.
              </div>
            </div>
            <button
              onClick={handleDeleteAccount}
              className="btn btn-sm"
              style={{
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#f87171',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Trash2 size={14} /> Delete My Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
