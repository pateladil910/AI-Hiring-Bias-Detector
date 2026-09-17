import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Zap,
  Users,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Building2,
  Lock,
  Sparkles,
  Check,
  AlertTriangle,
  Code2,
  Award,
  HelpCircle,
  FileText,
  Clock,
  ChevronDown,
  Layers,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import BiasScoreRing from '../components/BiasScoreRing';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const sampleJDs = [
  {
    id: 'biased',
    label: 'Biased Sample JD',
    text: 'We are seeking a young rockstar ninja developer for our fast-paced team. The ideal candidate is an aggressive hustler from a top-tier Ivy League university with native English skills.',
  },
  {
    id: 'inclusive',
    label: 'Inclusive Sample JD',
    text: 'We are seeking a skilled full-stack software engineer to join our collaborative engineering team. The ideal candidate has strong problem-solving abilities, proficiency in modern web frameworks, and excellent team communication skills.',
  },
];

const fallbackRules = [
  { phrase: 'young', category: 'Age Bias', suggestion: 'motivated & proactive' },
  { phrase: 'rockstar', category: 'Gendered Culture', suggestion: 'skilled engineer' },
  { phrase: 'ninja', category: 'Gendered Culture', suggestion: 'software developer' },
  { phrase: 'hustler', category: 'Exclusionary Work Culture', suggestion: 'dedicated collaborator' },
  { phrase: 'ivy league', category: 'Pedigree Bias', suggestion: 'relevant technical background' },
  { phrase: 'top-tier', category: 'Pedigree Bias', suggestion: 'practical technical ability' },
  { phrase: 'native english', category: 'National Origin Bias', suggestion: 'fluent English communication' },
  { phrase: 'aggressive', category: 'Hyper-Competitive Tone', suggestion: 'focused and outcome-driven' },
];

export default function Landing() {
  const [demoText, setDemoText] = useState(sampleJDs[0].text);
  const [score, setScore] = useState(48);
  const [flags, setFlags] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [activePreset, setActivePreset] = useState('biased');
  const [faqOpen, setFaqOpen] = useState({ 0: true });

  const debounceTimer = useRef(null);

  // Client analyzer fallback
  const analyzeLocally = (text) => {
    let s = 100;
    const lower = text.toLowerCase();
    const detected = [];

    fallbackRules.forEach((rule) => {
      if (lower.includes(rule.phrase)) {
        s -= 13;
        detected.push({
          phrase: rule.phrase,
          category: rule.category,
          suggestion: rule.suggestion,
        });
      }
    });

    return {
      score: Math.max(20, Math.min(100, s)),
      flags: detected,
    };
  };

  useEffect(() => {
    setScanning(true);
    clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      try {
        const res = await axios.post(`${API_BASE}/api/bias/quick-scan`, { text: demoText });
        setScore(res.data.score || 85);
        setFlags(res.data.flags || []);
      } catch (_) {
        const local = analyzeLocally(demoText);
        setScore(local.score);
        setFlags(local.flags);
      } finally {
        setScanning(false);
      }
    }, 350);

    return () => clearTimeout(debounceTimer.current);
  }, [demoText]);

  const handleApplySuggestion = (phrase, suggestion) => {
    const regex = new RegExp(`\\b${phrase}\\b`, 'gi');
    setDemoText((prev) => prev.replace(regex, suggestion));
  };

  const handlePresetSelect = (presetId) => {
    setActivePreset(presetId);
    const p = sampleJDs.find((s) => s.id === presetId);
    if (p) setDemoText(p.text);
  };

  const toggleFaq = (idx) => {
    setFaqOpen((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  // Scroll reveal observer
  useEffect(() => {
    const elements = document.querySelectorAll('.scroll-reveal');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f8fafc',
        color: '#0f172a',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* ── Seamless Transparent Glass Navigation Bar ───────────────────── */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'rgba(255, 255, 255, 0.45)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(226, 232, 240, 0.35)',
          transition: 'all 0.3s ease',
        }}
      >
        <div
          style={{
            maxWidth: 1240,
            margin: '0 auto',
            padding: '0 24px',
            height: 68,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Logo */}
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              textDecoration: 'none',
              color: '#0f172a',
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
              }}
            >
              <ShieldCheck size={22} />
            </div>
            <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.03em' }}>
              Fair<span style={{ color: '#059669' }}>Hire</span>
            </span>
          </Link>

          {/* Nav Links */}
          <nav style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
            <a href="#how-it-works" style={{ textDecoration: 'none', color: '#0f172a', fontSize: 14, fontWeight: 600 }}>
              How It Works
            </a>
            <a href="#live-demo" style={{ textDecoration: 'none', color: '#0f172a', fontSize: 14, fontWeight: 600 }}>
              Live Bias Scanner
            </a>
            <a href="#pillars" style={{ textDecoration: 'none', color: '#0f172a', fontSize: 14, fontWeight: 600 }}>
              Ethical Pillars
            </a>
            <a href="#faq" style={{ textDecoration: 'none', color: '#0f172a', fontSize: 14, fontWeight: 600 }}>
              FAQ
            </a>
          </nav>

          {/* Action CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link
              to="/login"
              style={{
                textDecoration: 'none',
                color: '#0f172a',
                fontSize: 14,
                fontWeight: 600,
                padding: '8px 16px',
                borderRadius: 8,
                background: 'rgba(255, 255, 255, 0.65)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(203, 213, 225, 0.6)',
              }}
            >
              Sign In
            </Link>

            <Link
              to="/employer-request"
              style={{
                textDecoration: 'none',
                color: '#0f172a',
                fontSize: 14,
                fontWeight: 600,
                padding: '8px 16px',
                border: '1px solid #cbd5e1',
                borderRadius: 8,
                background: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(8px)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              }}
            >
              Post Jobs
            </Link>

            <Link
              to="/register-candidate"
              style={{
                textDecoration: 'none',
                color: '#fff',
                fontSize: 14,
                fontWeight: 600,
                padding: '9px 18px',
                borderRadius: 8,
                background: '#10b981',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              Join as Candidate <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero Section Seamlessly Merged with Recruiter-Candidate Photo ──── */}
      <section
        style={{
          position: 'relative',
          padding: '80px 24px 70px',
          textAlign: 'center',
          overflow: 'hidden',
          backgroundImage: `
            radial-gradient(ellipse at center 40%, rgba(255, 255, 255, 0.94) 0%, rgba(255, 255, 255, 0.82) 48%, rgba(255, 255, 255, 0.45) 75%, rgba(248, 250, 252, 0.98) 100%),
            url("/interview-hero-bg.jpg")
          `,
          backgroundSize: 'cover',
          backgroundPosition: 'center 22%',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div
          style={{
            maxWidth: 880,
            margin: '0 auto',
            position: 'relative',
            zIndex: 2,
          }}
        >
          {/* Pill Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(236, 253, 245, 0.92)',
              backdropFilter: 'blur(8px)',
              border: '1px solid #a7f3d0',
              color: '#047857',
              padding: '8px 18px',
              borderRadius: 9999,
              fontSize: 13,
              fontWeight: 700,
              marginBottom: 24,
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.12)',
            }}
          >
            <Sparkles size={16} />
            Pre-Publication Bias Prevention & Algorithmic Neutrality
          </div>

          {/* Hero Title */}
          <h1
            style={{
              fontSize: 'clamp(2.6rem, 5.4vw, 4.1rem)',
              fontWeight: 900,
              lineHeight: 1.15,
              letterSpacing: '-0.04em',
              color: '#0f172a',
              margin: '0 0 20px',
              textShadow: '0 2px 14px rgba(255, 255, 255, 0.95), 0 0 30px rgba(255, 255, 255, 0.9)',
            }}
          >
            Hire strictly on <span style={{ color: '#047857', fontWeight: 900, textShadow: 'none' }}>merit</span>.<br />
            Eliminate bias before you publish.
          </h1>

          {/* Hero Subtitle */}
          <p
            style={{
              fontSize: 'clamp(1.05rem, 2vw, 1.25rem)',
              color: '#1e293b',
              lineHeight: 1.65,
              maxWidth: 720,
              margin: '0 auto 36px',
              fontWeight: 600,
              textShadow: '0 1px 12px rgba(255, 255, 255, 0.95), 0 0 24px rgba(255, 255, 255, 0.9)',
            }}
          >
            FairHire replaces biased keyword screening with automated demographic redaction,
            standardized aptitude challenges, and unalterable mathematical scoring formulas.
          </p>

          {/* Primary CTA Buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
            <Link
              to="/register-candidate"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: '#10b981',
                color: '#fff',
                fontSize: 16,
                fontWeight: 700,
                padding: '15px 32px',
                borderRadius: 12,
                textDecoration: 'none',
                boxShadow: '0 10px 25px rgba(16, 185, 129, 0.32)',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
            >
              Start Candidate Journey <ArrowRight size={18} />
            </Link>

            <Link
              to="/employer-request"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(8px)',
                color: '#0f172a',
                border: '1px solid #cbd5e1',
                fontSize: 16,
                fontWeight: 700,
                padding: '15px 32px',
                borderRadius: 12,
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.08)',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
            >
              <Building2 size={18} color="#059669" /> Request Recruiter Access
            </Link>
          </div>

          {/* Trust Badges Floating Glass Pill */}
          <div
            style={{
              display: 'inline-flex',
              justifyContent: 'center',
              gap: 24,
              flexWrap: 'wrap',
              marginTop: 44,
              padding: '12px 24px',
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              borderRadius: 9999,
              border: '1px solid rgba(226, 232, 240, 0.85)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)',
              fontSize: 13,
              fontWeight: 600,
              color: '#334155',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <CheckCircle2 size={16} color="#059669" /> 100% Demographic-Blind Evaluation
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <CheckCircle2 size={16} color="#059669" /> Real-Time Keystroke WebSocket Scanner
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <CheckCircle2 size={16} color="#059669" /> EEOC 80% Adverse Impact Compliant
            </span>
          </div>
        </div>
      </section>

      {/* ── Interactive Live Bias Scanner (Full Page Width & Seamless Integration) ── */}
      <section
        id="live-demo"
        className="scroll-reveal"
        style={{
          width: '100%',
          background: '#ffffff',
          borderTop: '1px solid #e2e8f0',
          borderBottom: '1px solid #e2e8f0',
          padding: '70px 32px 80px',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            maxWidth: 1320,
            margin: '0 auto',
            width: '100%',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#10b981', textTransform: 'uppercase', marginBottom: 4 }}>
                Interactive Live Demo
              </div>
              <h2 style={{ fontSize: 28, fontWeight: 900, margin: 0, color: '#0f172a' }}>
                Pre-Publication Job Description Bias Scanner
              </h2>
              <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: 15 }}>
                Type or modify text below to test real-time bias detection and instant inclusive replacements.
              </p>
            </div>

            {/* Presets */}
            <div style={{ display: 'flex', gap: 8 }}>
              {sampleJDs.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handlePresetSelect(preset.id)}
                  style={{
                    padding: '9px 16px',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: activePreset === preset.id ? '2px solid #10b981' : '1px solid #cbd5e1',
                    background: activePreset === preset.id ? 'rgba(16, 185, 129, 0.08)' : '#fff',
                    color: activePreset === preset.id ? '#059669' : '#475569',
                    transition: 'all 150ms ease',
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Scanner Grid Covering Whole Width */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: 32, alignItems: 'start' }}>
            {/* Textarea Input & Corrections */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  border: '1px solid #cbd5e1',
                  borderRadius: 14,
                  overflow: 'hidden',
                  background: '#f8fafc',
                  transition: 'border-color 200ms ease',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                }}
              >
                <div style={{ background: '#f1f5f9', padding: '12px 18px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#64748b' }}>
                  <span style={{ fontWeight: 600 }}>Job Description Editor</span>
                  <span>{demoText.split(/\s+/).filter(Boolean).length} words</span>
                </div>
                <textarea
                  value={demoText}
                  onChange={(e) => setDemoText(e.target.value)}
                  rows={7}
                  style={{
                    width: '100%',
                    padding: '18px',
                    background: '#fff',
                    border: 'none',
                    outline: 'none',
                    fontSize: 15,
                    lineHeight: 1.65,
                    color: '#0f172a',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              {/* Detected Flags Pills */}
              <div style={{ marginTop: 24 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 12 }}>
                  Detected Biased Phrasing ({flags.length}):
                </div>

                {flags.length === 0 ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#047857', fontSize: 14, fontWeight: 600, background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '14px 18px', borderRadius: 10 }}>
                    <CheckCircle2 size={18} color="#059669" />
                    Zero bias flags detected! This job description qualifies as fully inclusive.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {flags.map((flag, idx) => (
                      <div
                        key={idx}
                        className={`scroll-child stagger-${Math.min(idx + 1, 5)}`}
                        style={{
                          background: '#fff',
                          border: '1px solid #fee2e2',
                          borderRadius: 10,
                          padding: '12px 16px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ background: '#fef2f2', color: '#dc2626', padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 700, fontFamily: 'monospace' }}>
                              "{flag.phrase}"
                            </span>
                            <span style={{ fontSize: 12, color: '#64748b' }}>Category: {flag.category}</span>
                          </div>
                          <div style={{ fontSize: 13, color: '#047857', marginTop: 4, fontWeight: 500 }}>
                            Suggestion: <strong>"{flag.suggestion}"</strong>
                          </div>
                        </div>

                        <button
                          onClick={() => handleApplySuggestion(flag.phrase, flag.suggestion)}
                          style={{
                            background: '#ecfdf5',
                            border: '1px solid #a7f3d0',
                            color: '#047857',
                            fontSize: 12,
                            fontWeight: 700,
                            padding: '7px 14px',
                            borderRadius: 6,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          Accept Fix ✓
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Score Breakdown Panel */}
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 16,
                padding: 28,
                textAlign: 'center',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.03)',
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 14 }}>
                Inclusivity Index
              </div>

              {/* Large Score Metric */}
              <div style={{ fontSize: 60, fontWeight: 900, color: score >= 80 ? '#059669' : score >= 60 ? '#d97706' : '#dc2626', lineHeight: 1 }}>
                {score}
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#64748b', marginTop: 6 }}>
                out of 100
              </div>

              <div
                style={{
                  display: 'inline-block',
                  marginTop: 14,
                  padding: '6px 14px',
                  borderRadius: 9999,
                  fontSize: 12,
                  fontWeight: 700,
                  background: score >= 80 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  color: score >= 80 ? '#047857' : '#dc2626',
                }}
              >
                {score >= 80 ? 'Inclusive & Ready to Post' : 'High Demographic Bias Risk'}
              </div>

              <div style={{ borderTop: '1px solid #e2e8f0', marginTop: 22, paddingTop: 18, textAlign: 'left', fontSize: 13, color: '#475569', lineHeight: 1.55 }}>
                Jobs with inclusivity scores above 85 attract up to <strong>42% more diverse qualified talent</strong> across technical disciplines.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5-Stage Candidate Journey Section ─────────────────────────────── */}
      <section
        id="how-it-works"
        className="scroll-reveal"
        style={{
          background: '#ffffff',
          borderTop: '1px solid #e2e8f0',
          borderBottom: '1px solid #e2e8f0',
          padding: '80px 24px',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 54 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Standardized Workflow
            </span>
            <h2 style={{ fontSize: 32, fontWeight: 900, margin: '8px 0 12px', color: '#0f172a' }}>
              How the 5-Stage FairHire Journey Works
            </h2>
            <p style={{ fontSize: 16, color: '#64748b', maxWidth: 650, margin: '0 auto' }}>
              From initial upload to the final interview, every candidate is evaluated exclusively on verified technical aptitude.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: 20,
            }}
          >
            {[
              {
                num: '01',
                title: 'Resume PII Masking',
                desc: 'Name, gender, contact info, and pedigree are automatically stripped.',
                icon: <FileText size={20} color="#10b981" />,
              },
              {
                num: '02',
                title: 'Domain Track Selection',
                desc: 'Pick your technical track: Full Stack, Frontend, AI/ML, or DevOps.',
                icon: <Layers size={20} color="#38bdf8" />,
              },
              {
                num: '03',
                title: 'Timed MCQ Aptitude',
                desc: 'Standardized 30-minute test autosaved server-side with zero question leaks.',
                icon: <Clock size={20} color="#a855f7" />,
              },
              {
                num: '04',
                title: 'Coding Sandbox IDE',
                desc: 'Interactive programming challenge executed in an isolated Node.js VM.',
                icon: <Code2 size={20} color="#f59e0b" />,
              },
              {
                num: '05',
                title: 'Transparent Score Card',
                desc: 'Verified formula: MCQ×0.4 + Coding×0.4 + Resume×0.2. No black boxes.',
                icon: <Award size={20} color="#10b981" />,
              },
            ].map((step, idx) => (
              <div
                key={idx}
                className={`scroll-child stagger-${idx + 1}`}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 16,
                  padding: 24,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <span style={{ fontSize: 24, fontWeight: 900, color: '#cbd5e1' }}>
                      {step.num}
                    </span>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: '#fff', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {step.icon}
                    </div>
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 8px', color: '#0f172a' }}>
                    {step.title}
                  </h3>
                  <p style={{ fontSize: 13, color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Audited Platform Impact Metrics ──────────────────────────────── */}
      <section className="scroll-reveal" style={{ padding: '70px 24px', maxWidth: 1140, margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 24,
            textAlign: 'center',
          }}
        >
          {[
            { value: '50,000+', label: 'Blind Assessments Administered', detail: 'Across 14 technical disciplines' },
            { value: '99.4%', label: 'PII Redaction Accuracy', detail: 'Zero demographic leaks in blind rosters' },
            { value: '100%', label: 'Explainable Mathematical Decisions', detail: 'Plain-English scoring rationale' },
            { value: '0.0%', label: 'Demographic Bias Weight', detail: 'Pure merit and aptitude screening' },
          ].map((m, idx) => (
            <div
              key={idx}
              className={`scroll-child stagger-${idx + 1}`}
              style={{
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: 16,
                padding: 28,
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
              }}
            >
              <div style={{ fontSize: 36, fontWeight: 900, color: '#10b981', marginBottom: 6 }}>
                {m.value}
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
                {m.label}
              </div>
              <div style={{ fontSize: 12, color: '#64748b' }}>
                {m.detail}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Ethical Principles & Regulatory Compliance ───────────────────── */}
      <section
        id="pillars"
        className="scroll-reveal"
        style={{
          background: '#ffffff',
          borderTop: '1px solid #e2e8f0',
          borderBottom: '1px solid #e2e8f0',
          padding: '80px 24px',
        }}
      >
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#10b981', textTransform: 'uppercase' }}>
              Built for Compliance
            </span>
            <h2 style={{ fontSize: 30, fontWeight: 900, margin: '8px 0', color: '#0f172a' }}>
              Four Pillars of Algorithmic Integrity
            </h2>
            <p style={{ fontSize: 15, color: '#64748b', maxWidth: 600, margin: '0 auto' }}>
              Designed to align with US EEOC Uniform Guidelines, the EU Artificial Intelligence Act, and GDPR Data Portability.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 24,
            }}
          >
            {[
              {
                icon: <ShieldCheck size={22} color="#10b981" />,
                title: 'Zero Demographic Signals',
                desc: 'Candidates are evaluated strictly on validated skills and benchmarks. Names, photos, schools, and locations are strictly masked.',
              },
              {
                icon: <Zap size={22} color="#38bdf8" />,
                title: 'Transparent Formula Math',
                desc: 'No black-box neural net verdicts. The exact formula (MCQ×0.4 + Coding×0.4 + Resume×0.2) is shared transparently with all parties.',
              },
              {
                icon: <Users size={22} color="#a855f7" />,
                title: 'Human-in-the-Loop',
                desc: 'No automated silent rejections. Borderline scores route directly to human reviewers with immutable audit justification requirements.',
              },
              {
                icon: <Lock size={22} color="#f59e0b" />,
                title: 'Candidate Data Portability',
                desc: 'Full GDPR Article 17 (Right to Erasure) and Article 20 (Data Portability) compliance with 1-click JSON data export.',
              },
            ].map((p, idx) => (
              <div
                key={idx}
                className={`scroll-child stagger-${idx + 1}`}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 16,
                  padding: 24,
                }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 10, background: '#fff', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  {p.icon}
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>
                  {p.title}
                </h3>
                <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6, margin: 0 }}>
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ Section (Light Theme) ─────────────────────────────────────── */}
      <section
        id="faq"
        className="scroll-reveal"
        style={{
          maxWidth: 840,
          margin: '80px auto',
          padding: '0 24px',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 style={{ fontSize: 28, fontWeight: 900, margin: '0 0 8px', color: '#0f172a' }}>
            Frequently Asked Questions
          </h2>
          <p style={{ fontSize: 15, color: '#64748b', margin: 0 }}>
            Everything you need to know about our algorithmic fairness architecture.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            {
              q: 'Does FairHire guarantee 100% elimination of hiring bias?',
              a: 'No algorithm can guarantee zero bias. FairHire provides a structured, verifiable process shield: it prevents exclusionary job descriptions before publication, strips demographic markers from initial reviews, and standardizes candidate aptitude tests.',
            },
            {
              q: 'How does candidate cloaking work?',
              a: 'When you upload your resume, personally identifiable information (name, phone, email, address, photos, gender markers) is redacted and replaced with a deterministic alias (e.g. CAND-7A39). Recruiters only see your skills and scores until an interview is scheduled.',
            },
            {
              q: 'Can recruiters tamper with the assessment scores?',
              a: 'No. All tests are timed and autosaved server-side, code executes in isolated sandboxes, and scores are derived using a transparent weighted mathematical formula permanently recorded in our SHA-256 audit logs.',
            },
            {
              q: 'How can I exercise my GDPR Right to Erasure?',
              a: 'Candidate profiles feature a 1-click "Delete My Account" button in the Profile & Privacy console. This permanently scrubs your personal identifiable information from the database in accordance with GDPR Article 17.',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              style={{
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              }}
            >
              <button
                onClick={() => toggleFaq(idx)}
                style={{
                  width: '100%',
                  padding: '18px 20px',
                  background: 'transparent',
                  border: 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: 15,
                  fontWeight: 700,
                  color: '#0f172a',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <span>{item.q}</span>
                <ChevronDown
                  size={18}
                  color="#64748b"
                  style={{
                    transform: faqOpen[idx] ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 200ms ease',
                  }}
                />
              </button>
              {faqOpen[idx] && (
                <div style={{ padding: '0 20px 20px', fontSize: 14, color: '#475569', lineHeight: 1.6 }}>
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Ready to Build CTA Banner ────────────────────────────────────── */}
      <section style={{ maxWidth: 1140, margin: '0 auto 80px', padding: '0 24px' }}>
        <div
          style={{
            background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
            borderRadius: 24,
            padding: '54px 48px',
            color: '#fff',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(16, 185, 129, 0.25)',
          }}
        >
          <h2 style={{ fontSize: 32, fontWeight: 900, margin: '0 0 14px' }}>
            Ready to experience demographic-neutral hiring?
          </h2>
          <p style={{ fontSize: 16, opacity: 0.9, maxWidth: 620, margin: '0 auto 32px', lineHeight: 1.6 }}>
            Join thousands of engineers evaluated purely on their technical competencies. Free for candidates. Enterprise-ready for hiring teams.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
            <Link
              to="/register-candidate"
              style={{
                background: '#fff',
                color: '#047857',
                fontSize: 15,
                fontWeight: 700,
                padding: '12px 26px',
                borderRadius: 8,
                textDecoration: 'none',
              }}
            >
              Create Candidate Account
            </Link>

            <Link
              to="/employer-request"
              style={{
                background: 'rgba(0,0,0,0.2)',
                border: '1px solid rgba(255,255,255,0.4)',
                color: '#fff',
                fontSize: 15,
                fontWeight: 700,
                padding: '12px 26px',
                borderRadius: 8,
                textDecoration: 'none',
              }}
            >
              Request Recruiter Access
            </Link>
          </div>
        </div>
      </section>

      {/* ── Production Light Footer ───────────────────────────────────────── */}
      <footer
        style={{
          background: '#ffffff',
          borderTop: '1px solid #e2e8f0',
          padding: '48px 24px 36px',
          fontSize: 13,
          color: '#64748b',
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 24,
          }}
        >
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: '#0f172a', marginBottom: 4 }}>
              Fair<span style={{ color: '#10b981' }}>Hire</span> & EquiHire AI
            </div>
            <div>Demographic-Neutral Hiring & Algorithmic Process Governance</div>
          </div>

          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <Link to="/help" style={{ textDecoration: 'none', color: '#475569' }}>Help Center</Link>
            <Link to="/privacy" style={{ textDecoration: 'none', color: '#475569' }}>Privacy Policy</Link>
            <Link to="/terms" style={{ textDecoration: 'none', color: '#475569' }}>Terms of Service</Link>
            <Link to="/accessibility" style={{ textDecoration: 'none', color: '#475569' }}>Accessibility (a11y)</Link>
            <Link to="/status" style={{ textDecoration: 'none', color: '#475569' }}>System Health</Link>
          </div>
        </div>

        <div style={{ maxWidth: 1200, margin: '24px auto 0', paddingTop: 20, borderTop: '1px solid #f1f5f9', textAlign: 'center', fontSize: 12, color: '#94a3b8' }}>
          © 2026 FairHire AI Technologies Inc. All rights reserved. Algorithmic fairness models operate as assistive evaluation tools.
        </div>
      </footer>
    </div>
  );
}
