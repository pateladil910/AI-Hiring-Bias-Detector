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
      const token =
        localStorage.getItem('token') ||
        localStorage.getItem('fairhire_token') ||
        localStorage.getItem('fh_token') ||
        sessionStorage.getItem('token');
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
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full mb-3">
          <ShieldCheck size={14} className="text-emerald-600" /> Stage 01: Resume Anonymization
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
          Upload Your Resume for Algorithmic Redaction
        </h1>
        <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
          Our AI scans your resume to strip personally identifiable information (PII) including name, phone, address, and demographic markers before recruiter review.
        </p>
      </div>

      {/* ── Existing Confirmed Resume Notice (if any) ────────────────────── */}
      {existingResume && (
        <div className="bg-white border border-emerald-200 rounded-xl p-5 mb-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
              <FileCheck size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">
                  {existingResume.fileName || 'Active Anonymized Resume'}
                </span>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                  existingResume.confirmed
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {existingResume.confirmed ? 'Verified & Confirmed' : 'Needs Review'}
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Reference ID: <code className="font-mono text-emerald-700 font-bold">{existingResume.refId}</code> • Uploaded {new Date(existingResume.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate(`/candidate/resume/review?refId=${existingResume.refId}`)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
          >
            Review Redacted Preview <ArrowRight size={13} />
          </button>
        </div>
      )}

      {/* ── Upload Card ─────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <form onSubmit={handleUpload}>
          {/* Drag & Drop Area */}
          <label
            htmlFor="resume-file"
            className={`flex flex-col items-center justify-center py-10 px-6 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-150 mb-6 ${
              file
                ? 'border-emerald-500 bg-emerald-50/30'
                : 'border-slate-200 hover:border-emerald-400 bg-slate-50/50 hover:bg-slate-50'
            }`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${
              file ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
            }`}>
              {file ? <FileCheck size={24} /> : <UploadCloud size={24} />}
            </div>

            <div className="text-sm font-bold text-slate-900 mb-1">
              {file ? file.name : 'Click to select or drag and drop your resume'}
            </div>
            <div className="text-xs text-slate-500 text-center">
              Supported formats: PDF, DOCX (Max 5MB)
            </div>

            {file && (
              <div className="mt-3 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                ✓ Selected {(file.size / 1024).toFixed(1)} KB — Ready for Anonymization
              </div>
            )}

            <input
              id="resume-file"
              type="file"
              accept=".pdf,.docx,.doc,.txt"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-2.5 rounded-lg text-xs font-medium mb-5">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          {/* Upload Progress Bar */}
          {uploading && (
            <div className="mb-5">
              <div className="flex justify-between text-xs text-slate-600 mb-1.5 font-medium">
                <span>Uploading and extracting PII markers...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 transition-all duration-150 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Consent Checkbox */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
              />
              <div className="text-xs text-slate-600 leading-relaxed">
                <strong className="text-slate-900 font-semibold">Candidate Demographic Protection Consent:</strong> I consent to FairHire storing and algorithmically parsing my resume. I understand that all PII (name, photo, contact, and demographic markers) will be redacted before recruiter evaluation.
              </div>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/candidate/dashboard')}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || !file || !consent}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold transition-colors shadow-xs"
            >
              <span>{uploading ? 'Processing Anonymization...' : 'Upload & Scan PII'}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </form>
      </div>

      {/* ── Privacy Guarantee Notice ─────────────────────────────────────── */}
      <div className="mt-6 flex items-center gap-3 p-4 bg-emerald-50/50 border border-emerald-200/80 rounded-xl text-xs text-slate-600 leading-relaxed">
        <Lock size={16} className="text-emerald-600 flex-shrink-0" />
        <div>
          Raw original resumes are encrypted and kept strictly separate from recruiter pools. Recruiters only see your verified skills and unalterable assessment benchmarks.
        </div>
      </div>
    </div>
  );
}
