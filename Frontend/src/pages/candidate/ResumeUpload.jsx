import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  FileCheck,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  FileText,
  Lock,
  CheckCircle2,
} from 'lucide-react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ResumeUpload() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [consent, setConsent] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [existingResume, setExistingResume] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExisting();
  }, []);

  const fetchExisting = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('fairhire_token');
      const res = await axios.get(`${API_BASE}/api/resume/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.resume) {
        setExistingResume(res.data.resume);
      }
    } catch (_) {}
    finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!allowed.includes(selected.type) && !selected.name.endsWith('.pdf') && !selected.name.endsWith('.docx')) {
      setError('Invalid file format. Please upload a PDF or DOCX file.');
      return;
    }

    if (selected.size > 5 * 1024 * 1024) {
      setError('File is too large. Maximum size allowed is 5MB.');
      return;
    }

    setError('');
    setFile(selected);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a resume file to upload.');
      return;
    }
    if (!consent) {
      setError('You must confirm consent for PII anonymization before uploading.');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('fairhire_token');
      const formData = new FormData();
      formData.append('resume', file);

      const res = await axios.post(`${API_BASE}/api/resume/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        },
      });

      // Redirect to review redaction screen
      navigate(`/candidate/resume/review?refId=${res.data.refId}`);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to process and anonymize resume. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 880, margin: '0 auto', padding: '36px 24px' }}>
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
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
          <ShieldCheck size={14} /> Stage 01: Resume Anonymization
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 8px', color: '#fff' }}>
          Upload Your Resume for Algorithmic Redaction
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 15, maxWidth: 600, margin: '0 auto' }}>
          Our AI scans your resume to strip personally identifiable information (PII) including name, phone, address, and demographic markers before recruiter review.
        </p>
      </div>

      {/* ── Existing Confirmed Resume Notice (if any) ────────────────────── */}
      {existingResume && (
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: 14,
            padding: 20,
            marginBottom: 28,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 10,
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#34d399',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FileCheck size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 700, color: '#fff', fontSize: 15 }}>
                  {existingResume.fileName || 'Active Anonymized Resume'}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    background: existingResume.confirmed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(234, 179, 8, 0.2)',
                    color: existingResume.confirmed ? '#34d399' : '#facc15',
                    padding: '2px 8px',
                    borderRadius: 6,
                  }}
                >
                  {existingResume.confirmed ? 'Verified & Confirmed' : 'Needs Review'}
                </span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>
                Reference ID: <code style={{ color: '#6ee7b7' }}>{existingResume.refId}</code> • Uploaded {new Date(existingResume.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate(`/candidate/resume/review?refId=${existingResume.refId}`)}
            className="btn btn-outline btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            Review Redacted Preview <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* ── Upload Card ─────────────────────────────────────────────────── */}
      <div
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 16,
          padding: 32,
        }}
      >
        <form onSubmit={handleUpload}>
          {/* Drag & Drop Area */}
          <label
            htmlFor="resume-file"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '48px 24px',
              border: file ? '2px dashed #10b981' : '2px dashed var(--color-border)',
              borderRadius: 14,
              background: file ? 'rgba(16, 185, 129, 0.04)' : 'rgba(255,255,255,0.01)',
              cursor: 'pointer',
              transition: 'all 200ms ease',
              marginBottom: 24,
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: file ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.06)',
                color: file ? '#34d399' : 'var(--color-text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
              }}
            >
              {file ? <FileCheck size={28} /> : <UploadCloud size={28} />}
            </div>

            <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 6 }}>
              {file ? file.name : 'Click to select or drag and drop your resume'}
            </div>
            <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', textAlign: 'center' }}>
              Supported formats: PDF, DOCX (Max 5MB)
            </div>

            {file && (
              <div style={{ marginTop: 12, fontSize: 12, color: '#34d399', fontWeight: 600 }}>
                ✓ Selected {(file.size / 1024).toFixed(1)} KB — Ready for Anonymization
              </div>
            )}

            <input
              id="resume-file"
              type="file"
              accept=".pdf,.docx,.doc,.txt"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </label>

          {/* Error Message */}
          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                padding: '10px 14px',
                borderRadius: 8,
                fontSize: 13,
                marginBottom: 20,
              }}
            >
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* Upload Progress Bar */}
          {uploading && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                <span>Uploading and extracting PII markers...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 9999, overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${uploadProgress}%`,
                    background: 'var(--color-primary)',
                    transition: 'width 200ms ease',
                  }}
                />
              </div>
            </div>
          )}

          {/* Consent Checkbox */}
          <div
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--color-border)',
              borderRadius: 10,
              padding: 16,
              marginBottom: 24,
            }}
          >
            <label style={{ display: 'flex', gap: 12, cursor: 'pointer', alignItems: 'flex-start' }}>
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                style={{ marginTop: 3, accentColor: '#10b981', cursor: 'pointer' }}
              />
              <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                <strong style={{ color: '#fff' }}>Candidate Demographic Protection Consent:</strong> I consent to FairHire storing and algorithmically parsing my resume. I understand that all PII (name, photo, contact, and demographic markers) will be redacted before recruiter evaluation.
              </div>
            </label>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <button
              type="button"
              onClick={() => navigate('/candidate/dashboard')}
              className="btn btn-ghost"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || !file || !consent}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            >
              {uploading ? 'Processing Anonymization...' : 'Upload & Scan PII'}
              <ArrowRight size={16} />
            </button>
          </div>
        </form>
      </div>

      {/* ── Privacy Guarantee Notice ─────────────────────────────────────── */}
      <div
        style={{
          marginTop: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '14px 20px',
          background: 'rgba(16, 185, 129, 0.05)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          borderRadius: 12,
          fontSize: 13,
          color: 'var(--color-text-secondary)',
        }}
      >
        <Lock size={18} color="#10b981" style={{ flexShrink: 0 }} />
        <div>
          Raw original resumes are encrypted and kept strictly separate from recruiter pools. Recruiters only see your verified skills and unalterable assessment benchmarks.
        </div>
      </div>
    </div>
  );
}
