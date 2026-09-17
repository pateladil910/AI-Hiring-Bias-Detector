import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FileText,
  Target,
  HelpCircle,
  Code2,
  Award,
  ArrowRight,
  CheckCircle2,
  Clock,
  Briefcase,
  Calendar,
  AlertCircle,
  Shield,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function CandidateDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    fetchProgress();
    fetchJobs();
  }, []);

  const fetchProgress = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('fairhire_token');
      const res = await axios.get(`${API_BASE}/api/candidate/application`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProgress(res.data);
    } catch (err) {
      console.error('Failed to load candidate progress:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/jobs?status=published&limit=3`);
      setJobs(res.data.jobs || []);
    } catch (_) {}
  };

  const currentStep = progress?.currentStep || 1;
  const stepsData = progress?.steps || {};

  const stepperItems = [
    {
      num: 1,
      id: 'resume',
      title: 'Resume & PII Redaction',
      desc: 'Upload PDF and review demographic anonymization',
      icon: <FileText size={20} />,
      link: '/candidate/resume',
      completed: stepsData.resume?.completed,
      active: currentStep === 1,
      badge: stepsData.resume?.completed ? 'Confirmed' : stepsData.resume?.refId ? 'Pending Review' : 'Required',
    },
    {
      num: 2,
      id: 'domain',
      title: 'Select Domain Track',
      desc: 'Choose your engineering specialization',
      icon: <Target size={20} />,
      link: '/candidate/domain',
      completed: stepsData.domain?.completed,
      active: currentStep === 2,
      badge: stepsData.domain?.completed ? 'Selected' : 'Open',
    },
    {
      num: 3,
      id: 'mcq',
      title: 'MCQ Aptitude Assessment',
      desc: '30-minute timed knowledge evaluation',
      icon: <HelpCircle size={20} />,
      link: '/candidate/domain',
      completed: stepsData.mcq?.completed,
      active: currentStep === 3,
      badge: stepsData.mcq?.completed ? `${stepsData.mcq.score}% Score` : 'Timed (30m)',
    },
    {
      num: 4,
      id: 'coding',
      title: 'Coding Sandbox IDE',
      desc: 'Interactive algorithmic programming challenge',
      icon: <Code2 size={20} />,
      link: stepsData.mcq?.testId ? `/candidate/coding/${stepsData.mcq.testId}` : '/candidate/domain',
      completed: stepsData.coding?.completed,
      active: currentStep === 4,
      badge: stepsData.coding?.completed ? `${stepsData.coding.testsPassed}/${stepsData.coding.testsTotal} Passed` : 'Sandboxed',
    },
    {
      num: 5,
      id: 'results',
      title: 'Transparent Score Card',
      desc: 'Weighted evaluation formula: MCQ×0.4 + Coding×0.4 + Resume×0.2',
      icon: <Award size={20} />,
      link: '/candidate/domain',
      completed: stepsData.results?.ready,
      active: currentStep === 5,
      badge: stepsData.results?.ready ? `${stepsData.results.compositeScore}/100 Final` : 'Pending Review',
    },
  ];

  return (
    <div className="container" style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
      {/* ── Welcome Banner ─────────────────────────────────────────────────── */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(14, 165, 233, 0.08) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          borderRadius: 16,
          padding: '28px 32px',
          marginBottom: 32,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 20,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                textTransform: 'uppercase',
                background: 'rgba(16, 185, 129, 0.2)',
                color: '#34d399',
                padding: '3px 10px',
                borderRadius: 9999,
                letterSpacing: '0.05em',
              }}
            >
              Algorithmic Merit Hiring
            </span>
            <span style={{ fontSize: 13, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Shield size={14} color="#10b981" /> 100% Demographic-Blind Evaluation
            </span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 8px', color: '#fff' }}>
            Welcome back, {user?.firstName || 'Engineer'}!
          </h1>
          <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 15, maxWidth: 640, lineHeight: 1.5 }}>
            Your hiring process is entirely demographic-neutral. Recruiters only see your anonymized alias, verified skills, and validated assessment benchmarks.
          </p>
        </div>

        {/* Quick Stats Pill Cards */}
        <div style={{ display: 'flex', gap: 14 }}>
          <div
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 12,
              padding: '14px 20px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 24, fontWeight: 800, color: '#10b981' }}>
              {progress?.stats?.totalApplications ?? 0}
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>
              Applications
            </div>
          </div>
          <div
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 12,
              padding: '14px 20px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 24, fontWeight: 800, color: '#38bdf8' }}>
              {progress?.stats?.scheduledInterviews ?? 1}
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>
              Interviews
            </div>
          </div>
        </div>
      </div>

      {/* ── 5-Step Progress Stepper Section ─────────────────────────────────── */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 4px', color: '#fff' }}>
              Your 5-Stage Candidate Journey
            </h2>
            <p style={{ margin: 0, fontSize: 14, color: 'var(--color-text-secondary)' }}>
              Complete each stage sequentially to advance your blind technical profile to recruiters.
            </p>
          </div>
          <div
            style={{
              background: 'rgba(255,255,255,0.06)',
              padding: '6px 14px',
              borderRadius: 20,
              fontSize: 13,
              fontWeight: 600,
              color: '#34d399',
            }}
          >
            Stage {currentStep} of 5 Active
          </div>
        </div>

        {/* Stepper Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: 16,
          }}
        >
          {stepperItems.map((step) => {
            const isCompleted = step.completed;
            const isCurrent = step.active;

            let borderStyle = '1px solid var(--color-border)';
            let bgStyle = 'var(--color-surface)';
            if (isCurrent) {
              borderStyle = '2px solid var(--color-primary)';
              bgStyle = 'rgba(16, 185, 129, 0.05)';
            } else if (isCompleted) {
              borderStyle = '1px solid rgba(16, 185, 129, 0.4)';
            }

            return (
              <div
                key={step.num}
                onClick={() => navigate(step.link)}
                style={{
                  background: bgStyle,
                  border: borderStyle,
                  borderRadius: 14,
                  padding: 20,
                  cursor: 'pointer',
                  transition: 'all 200ms ease',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 10,
                        background: isCompleted
                          ? 'rgba(16, 185, 129, 0.2)'
                          : isCurrent
                          ? 'var(--color-primary)'
                          : 'rgba(255,255,255,0.06)',
                        color: isCompleted ? '#34d399' : isCurrent ? '#000' : 'var(--color-text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {isCompleted ? <CheckCircle2 size={22} /> : step.icon}
                    </div>

                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        padding: '3px 8px',
                        borderRadius: 6,
                        background: isCompleted
                          ? 'rgba(16, 185, 129, 0.15)'
                          : isCurrent
                          ? 'rgba(56, 189, 248, 0.15)'
                          : 'rgba(255,255,255,0.05)',
                        color: isCompleted ? '#34d399' : isCurrent ? '#38bdf8' : 'var(--color-text-muted)',
                      }}
                    >
                      {step.badge}
                    </span>
                  </div>

                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: 4 }}>
                    STEP 0{step.num}
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 6px', color: '#fff' }}>
                    {step.title}
                  </h3>
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                    {step.desc}
                  </p>
                </div>

                <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: isCurrent ? '#34d399' : 'var(--color-text-secondary)' }}>
                  {isCompleted ? 'Review Result' : isCurrent ? 'Continue Step' : 'Start Stage'}
                  <ArrowRight size={14} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Two Column Action Area: Open Verified Jobs & Quick Navigation ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>
        {/* Bias-Audited Verified Job Openings */}
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 16,
            padding: 24,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Briefcase size={18} color="#10b981" />
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#fff' }}>
                Open Verified Positions
              </h3>
            </div>
            <Link
              to="/candidate/jobs"
              style={{ fontSize: 13, color: '#34d399', textDecoration: 'none', fontWeight: 600 }}
            >
              View All Roles →
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {jobs.length > 0 ? (
              jobs.map((job) => (
                <div
                  key={job.id}
                  style={{
                    border: '1px solid var(--color-border)',
                    borderRadius: 12,
                    padding: 16,
                    background: 'rgba(255,255,255,0.02)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <div>
                    <h4 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 600, color: '#fff' }}>
                      {job.title}
                    </h4>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                        {job.skillProfileJson?.salary_range || '$110,000 - $140,000'}
                      </span>
                      <span style={{ color: 'var(--color-border)' }}>•</span>
                      <span
                        style={{
                          fontSize: 11,
                          color: '#34d399',
                          background: 'rgba(16, 185, 129, 0.1)',
                          padding: '1px 6px',
                          borderRadius: 4,
                        }}
                      >
                        Bias Scanned (0.0% PII)
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/candidate/apply/${job.id}`)}
                    className="btn btn-primary btn-sm"
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    Apply Now
                  </button>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: 24, color: 'var(--color-text-secondary)' }}>
                Loading verified positions...
              </div>
            )}
          </div>
        </div>

        {/* Candidate Protection & Interview Readiness */}
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 16,
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Sparkles size={18} color="#38bdf8" />
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#fff' }}>
                Blind Hiring Protections Active
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <CheckCircle2 size={18} color="#10b981" style={{ flexShrink: 0, marginTop: 2 }} />
                <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                  <strong style={{ color: '#fff' }}>Demographic Masking:</strong> Name, photo, gender indicators, age markers, and physical addresses are automatically stripped before hiring panels see your file.
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <CheckCircle2 size={18} color="#10b981" style={{ flexShrink: 0, marginTop: 2 }} />
                <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                  <strong style={{ color: '#fff' }}>Transparent Evaluation:</strong> All tests produce an unalterable formula score: <code>MCQ × 0.4 + Coding × 0.4 + Resume × 0.2</code>.
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <CheckCircle2 size={18} color="#10b981" style={{ flexShrink: 0, marginTop: 2 }} />
                <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                  <strong style={{ color: '#fff' }}>Candidate Rights (GDPR/CCPA):</strong> You retain full data portability and can export your verified logs or request full record deletion anytime.
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 24, display: 'flex', gap: 10 }}>
            <Link
              to="/candidate/interviews"
              className="btn btn-outline btn-sm"
              style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6 }}
            >
              <Calendar size={14} /> My Interviews
            </Link>
            <Link
              to="/candidate/profile"
              className="btn btn-outline btn-sm"
              style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6 }}
            >
              Privacy & Data Export
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
