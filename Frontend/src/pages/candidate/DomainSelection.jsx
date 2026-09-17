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
    <div className="container" style={{ maxWidth: 1100, margin: '0 auto', padding: '36px 24px' }}>
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
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
          <Target size={14} /> Stage 02: Domain Assessment Track
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 8px', color: '#fff' }}>
          Select Your Engineering Assessment Specialization
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 15, maxWidth: 650, margin: '0 auto' }}>
          All tracks feature standardized, objective benchmarks: 5 knowledge MCQs followed by 1 sandboxed algorithmic coding task.
        </p>
      </div>

      {error && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            padding: '12px 16px',
            borderRadius: 10,
            marginBottom: 24,
            textAlign: 'center',
          }}
        >
          {error}
        </div>
      )}

      {/* ── Domain Cards Grid ───────────────────────────────────────────── */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div className="spinner" style={{ margin: '0 auto 16px' }} />
          <div style={{ color: 'var(--color-text-secondary)' }}>Loading assessment tracks...</div>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 20,
            marginBottom: 36,
          }}
        >
          {domains.map((domain) => {
            const isSelected = selectedDomain === domain.id;

            return (
              <div
                key={domain.id}
                onClick={() => setSelectedDomain(domain.id)}
                style={{
                  background: isSelected ? 'rgba(16, 185, 129, 0.08)' : 'var(--color-surface)',
                  border: isSelected ? '2px solid #10b981' : '1px solid var(--color-border)',
                  borderRadius: 16,
                  padding: 24,
                  cursor: 'pointer',
                  transition: 'all 200ms ease',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <div
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 10,
                        background: isSelected ? '#10b981' : 'rgba(255,255,255,0.06)',
                        color: isSelected ? '#000' : 'var(--color-text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Code size={22} />
                    </div>

                    <div
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        border: isSelected ? '6px solid #10b981' : '2px solid var(--color-border)',
                        background: '#090f0c',
                      }}
                    />
                  </div>

                  <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 8px', color: '#fff' }}>
                    {domain.name}
                  </h3>
                  <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: '0 0 16px', lineHeight: 1.5 }}>
                    {domain.description}
                  </p>

                  {/* Skills tags */}
                  <div style={{ marginBottom: 18 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: 6, textTransform: 'uppercase' }}>
                      Required Competencies
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {domain.requiredSkills.map((skill, idx) => (
                        <span
                          key={idx}
                          style={{
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid var(--color-border)',
                            color: '#cbd5e1',
                            padding: '2px 8px',
                            borderRadius: 6,
                            fontSize: 11,
                          }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Duration & Format Pill */}
                <div
                  style={{
                    borderTop: '1px solid var(--color-border)',
                    paddingTop: 14,
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 12,
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={13} color="#10b981" /> {domain.durationMinutes} Minutes
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Layers size={13} color="#38bdf8" /> {domain.format}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Start Assessment Bar ────────────────────────────────────────── */}
      <div
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 16,
          padding: '20px 28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <ShieldCheck size={24} color="#10b981" />
          <div>
            <div style={{ fontWeight: 700, color: '#fff', fontSize: 15 }}>
              Ready to begin?
            </div>
            <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
              The 30-minute server timer starts once you confirm on the next screen. Progress is autosaved every 30 seconds.
            </div>
          </div>
        </div>

        <button
          onClick={handleStart}
          disabled={starting || loading}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', fontSize: 15 }}
        >
          {starting ? 'Launching Assessment...' : 'Start Timed Assessment'}
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
