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
    <div className="container" style={{ maxWidth: 1200, margin: '0 auto', padding: '36px 24px' }}>
      {/* ── Top Header ──────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                background: 'rgba(16, 185, 129, 0.2)',
                color: '#34d399',
                padding: '3px 10px',
                borderRadius: 9999,
              }}
            >
              Stage 01 Review
            </span>
            <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
              Candidate Alias: <strong style={{ color: '#6ee7b7', fontFamily: 'monospace' }}>{data.refId}</strong>
            </span>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0, color: '#fff' }}>
            Verify Demographic Redaction Preview
          </h1>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => navigate('/candidate/resume')}
            className="btn btn-ghost btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <RotateCcw size={14} /> Re-upload
          </button>
          {!confirmed ? (
            <button
              onClick={handleConfirm}
              disabled={confirming}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <CheckCircle2 size={16} />
              {confirming ? 'Confirming...' : 'Confirm Anonymized Profile'}
            </button>
          ) : (
            <button
              onClick={() => navigate('/candidate/domain')}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            >
              Proceed to Domain Selection <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Confirmation Success Banner */}
      {confirmed && (
        <div
          style={{
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid #10b981',
            borderRadius: 12,
            padding: '16px 20px',
            marginBottom: 24,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#34d399', fontWeight: 600 }}>
            <CheckCircle2 size={20} />
            Profile confirmed! Your resume has been locked and certified demographic-neutral.
          </div>
          <button
            onClick={() => navigate('/candidate/domain')}
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            Select Domain Track <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* ── Side-by-Side Split View ────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24 }}>
        {/* Left Column: Redacted Markers & Skills Evidence */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Detected & Redacted Markers */}
          <div
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 16,
              padding: 24,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <ShieldCheck size={18} color="#10b981" />
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#fff' }}>
                Detected & Masked Demographic Markers
              </h3>
            </div>
            <p style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--color-text-secondary)' }}>
              The following categories have been completely stripped and replaced with deterministic tokens to eliminate unconscious recruiter bias.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {markers.length > 0 ? (
                markers.map((marker, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 10,
                      padding: '10px 14px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>
                        {marker.type}
                      </div>
                      <div style={{ fontSize: 11, color: '#6ee7b7', fontFamily: 'monospace' }}>
                        Replaced with: {marker.example || '[REDACTED]'}
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: 11,
                        background: 'rgba(16, 185, 129, 0.2)',
                        color: '#34d399',
                        padding: '2px 8px',
                        borderRadius: 9999,
                        fontWeight: 700,
                      }}
                    >
                      Masked
                    </span>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                  ✓ Standard demographic identifiers stripped.
                </div>
              )}
            </div>
          </div>

          {/* Extracted Technical Skills */}
          <div
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 16,
              padding: 24,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Tag size={18} color="#38bdf8" />
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#fff' }}>
                Extracted Skills Evidence
              </h3>
            </div>
            <p style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--color-text-secondary)' }}>
              These competencies were extracted from your experience and will be matched against domain job criteria.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {skills.map((skill, idx) => (
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
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Redacted Document Preview */}
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 16,
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Eye size={18} color="#10b981" />
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#fff' }}>
                Recruiter View: Anonymized Preview
              </h3>
            </div>
            <span
              style={{
                fontSize: 11,
                color: '#34d399',
                background: 'rgba(16, 185, 129, 0.15)',
                padding: '2px 8px',
                borderRadius: 6,
                fontWeight: 600,
              }}
            >
              Zero PII
            </span>
          </div>

          <div
            style={{
              flex: 1,
              background: '#090f0c',
              border: '1px solid var(--color-border)',
              borderRadius: 12,
              padding: 20,
              fontFamily: 'monospace',
              fontSize: 13,
              lineHeight: 1.6,
              color: '#cbd5e1',
              whiteSpace: 'pre-wrap',
              maxHeight: 520,
              overflowY: 'auto',
            }}
          >
            {data.redactedText || 'No text content available.'}
          </div>

          <div style={{ marginTop: 16, fontSize: 12, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Lock size={12} />
            This exact redacted representation is what hiring managers review during initial talent evaluation.
          </div>
        </div>
      </div>
    </div>
  );
}
