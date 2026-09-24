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
  Scale,
  EyeOff,
  Wand2,
  Shield,
  Cpu,
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

            {/* Rich Real-Time Analytics & Inclusivity Breakdown Panel */}
            <div
              style={{
                position: 'sticky',
                top: 88,
                display: 'flex',
                flexDirection: 'column',
                gap: 20,
              }}
            >
              {/* Primary Inclusivity Score Card */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 16,
                  padding: 24,
                  textAlign: 'center',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.03)',
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
                  Live Inclusivity Index
                </div>

                {/* Score Number with Circular Glow Ring */}
                <div
                  style={{
                    width: 110,
                    height: 110,
                    borderRadius: '50%',
                    margin: '0 auto 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: score >= 80 ? 'rgba(16, 185, 129, 0.08)' : score >= 60 ? 'rgba(245, 158, 11, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                    border: `4px solid ${score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444'}`,
                    boxShadow: `0 0 24px ${score >= 80 ? 'rgba(16, 185, 129, 0.2)' : score >= 60 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                  }}
                >
                  <span style={{ fontSize: 42, fontWeight: 900, color: score >= 80 ? '#059669' : score >= 60 ? '#d97706' : '#dc2626', lineHeight: 1 }}>
                    {score}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginTop: 2 }}>
                    / 100
                  </span>
                </div>

                <div
                  style={{
                    display: 'inline-block',
                    padding: '5px 14px',
                    borderRadius: 9999,
                    fontSize: 12,
                    fontWeight: 700,
                    background: score >= 80 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    color: score >= 80 ? '#047857' : '#dc2626',
                    marginBottom: 14,
                  }}
                >
                  {score >= 80 ? 'Inclusive & Ready to Post' : 'High Demographic Bias Risk'}
                </div>

                <p style={{ margin: 0, fontSize: 12, color: '#475569', lineHeight: 1.5, borderTop: '1px solid #e2e8f0', paddingTop: 12 }}>
                  Jobs scoring above 85 attract up to <strong>42% more diverse qualified talent</strong> across technical disciplines.
                </p>
              </div>

              {/* Real-time Category Breakdown Card */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 16,
                  padding: 22,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.02)',
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Bias Category Health</span>
                  <span style={{ color: '#10b981', fontSize: 11 }}>Active Scan</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { label: 'Gender-Coded Terms', count: flags.filter(f => f.category.toLowerCase().includes('gender')).length, max: 3 },
                    { label: 'Age & Seniority Bias', count: flags.filter(f => f.category.toLowerCase().includes('age')).length, max: 2 },
                    { label: 'Pedigree & School Elitism', count: flags.filter(f => f.category.toLowerCase().includes('pedigree')).length, max: 2 },
                    { label: 'Exclusionary Culture', count: flags.filter(f => f.category.toLowerCase().includes('culture')).length, max: 3 },
                  ].map((cat, i) => {
                    const hasIssues = cat.count > 0;
                    const pct = hasIssues ? Math.max(25, (cat.count / cat.max) * 100) : 0;
                    return (
                      <div key={i}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
                          <span style={{ fontWeight: 600, color: '#1e293b' }}>{cat.label}</span>
                          <span style={{ fontWeight: 700, color: hasIssues ? '#ef4444' : '#10b981' }}>
                            {hasIssues ? `${cat.count} flagged` : 'Clean ✓'}
                          </span>
                        </div>
                        <div style={{ height: 6, background: '#f1f5f9', borderRadius: 9999, overflow: 'hidden' }}>
                          <div
                            style={{
                              height: '100%',
                              width: hasIssues ? `${pct}%` : '100%',
                              background: hasIssues ? '#ef4444' : '#10b981',
                              borderRadius: 9999,
                              transition: 'width 0.3s ease',
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Real-time Compliance Verification Badge */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 14,
                  padding: '16px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  fontSize: 12,
                  color: '#475569',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, color: '#0f172a' }}>
                  <ShieldCheck size={16} color="#059669" />
                  <span>EEOC & NYC Local Law 144 Check</span>
                </div>
                <div>
                  Deterministic rules applied to ensure zero adverse demographic impact during candidate sourcing.
                </div>
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
        <div style={{ maxWidth: 1240, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 54 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12,
                fontWeight: 700,
                color: '#059669',
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                padding: '4px 14px',
                borderRadius: 9999,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: 10,
              }}
            >
              <Sparkles size={13} color="#059669" />
              End-to-End Anti-Bias Pipeline
            </span>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: 900, margin: '8px 0 12px', color: '#0f172a', letterSpacing: '-0.02em' }}>
              How the 5-Stage FairHire Journey Works
            </h2>
            <p style={{ fontSize: 16, color: '#64748b', maxWidth: 720, margin: '0 auto', lineHeight: 1.6 }}>
              Where AI bias detection actively shields candidates from unconscious discrimination at every checkpoint—from pre-publication job scan to blind technical testing and NYC LL144 adverse impact audits.
            </p>
          </div>

          {/* 5-Stage Anti-Bias Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 20,
            }}
          >
            {[
              {
                num: '01',
                title: 'Resume PII & Demographic Masking',
                biasBadge: 'Demographic Bias Shield',
                desc: 'Automated NLP parser detects and redacts candidate names, photos, gender markers, age cues, and zip codes.',
                impact: 'Prevents unconscious demographic & affinity bias before human review.',
                icon: <EyeOff size={20} color="#10b981" />,
                accentColor: '#10b981',
                badgeBg: '#ecfdf5',
                badgeBorder: '#a7f3d0',
                badgeText: '#065f46',
              },
              {
                num: '02',
                title: 'JD Inclusive Language Pre-Scan',
                biasBadge: 'Linguistic Bias Detection',
                desc: '18-rule bias engine scans job descriptions in real-time, flagging masculine-coded or ageist phrasing with 1-click neutral fixes.',
                impact: 'Eliminates exclusionary wording before diverse candidates self-select out.',
                icon: <Wand2 size={20} color="#0284c7" />,
                accentColor: '#0284c7',
                badgeBg: '#f0f9ff',
                badgeBorder: '#bae6fd',
                badgeText: '#0369a1',
              },
              {
                num: '03',
                title: 'Timed MCQ Aptitude Challenge',
                biasBadge: 'Halo/Horns Bias Elimination',
                desc: 'Standardized 30-minute test autosaved server-side with sealed question banks and identical time rules.',
                impact: 'Replaces subjective phone screening with verified technical problem-solving.',
                icon: <Clock size={20} color="#8b5cf6" />,
                accentColor: '#8b5cf6',
                badgeBg: '#f5f3ff',
                badgeBorder: '#ddd6fe',
                badgeText: '#6d28d9',
              },
              {
                num: '04',
                title: 'Sandboxed Coding Challenge IDE',
                biasBadge: 'Subjectivity-Free VM Runner',
                desc: 'Interactive programming challenges executed in an isolated Node.js VM against hidden unit tests.',
                impact: 'Judged 100% on automated test assertions, zero interviewer mood or bias.',
                icon: <Code2 size={20} color="#d97706" />,
                accentColor: '#d97706',
                badgeBg: '#fffbeb',
                badgeBorder: '#fde68a',
                badgeText: '#b45309',
              },
              {
                num: '05',
                title: 'Transparent Scoring & Bias Audit',
                biasBadge: 'NYC LL144 & EEOC Impact Audit',
                desc: 'Deterministic formula (MCQ×0.4 + Coding×0.4 + Resume×0.2). Continuous statistical audits monitor selection rates.',
                impact: 'Audit trails log every candidate status and require written justification for overrides.',
                icon: <Scale size={20} color="#059669" />,
                accentColor: '#059669',
                badgeBg: '#ecfdf5',
                badgeBorder: '#a7f3d0',
                badgeText: '#065f46',
              },
            ].map((step, idx) => (
              <div
                key={idx}
                className={`scroll-child stagger-${idx + 1}`}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 18,
                  padding: '24px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Accent Top Border */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: step.accentColor }} />

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <span style={{ fontSize: 24, fontWeight: 900, color: '#cbd5e1', letterSpacing: '-0.02em' }}>
                      {step.num}
                    </span>
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 10,
                        background: step.badgeBg,
                        border: `1px solid ${step.badgeBorder}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {step.icon}
                    </div>
                  </div>

                  {/* Anti-Bias Checkpoint Badge */}
                  <div style={{ marginBottom: 12 }}>
                    <span
                      style={{
                        display: 'inline-block',
                        fontSize: 10.5,
                        fontWeight: 700,
                        color: step.badgeText,
                        background: step.badgeBg,
                        border: `1px solid ${step.badgeBorder}`,
                        padding: '3px 8px',
                        borderRadius: 6,
                        letterSpacing: '0.02em',
                      }}
                    >
                      {step.biasBadge}
                    </span>
                  </div>

                  <h3 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 10px', color: '#0f172a', lineHeight: 1.3 }}>
                    {step.title}
                  </h3>

                  <p style={{ fontSize: 13, color: '#475569', margin: '0 0 14px', lineHeight: 1.55 }}>
                    {step.desc}
                  </p>
                </div>

                {/* Where Bias is Eradicated callout */}
                <div
                  style={{
                    padding: '10px 12px',
                    borderRadius: 10,
                    background: '#f8fafc',
                    border: '1px solid #f1f5f9',
                    fontSize: 11.5,
                    color: '#64748b',
                    lineHeight: 1.45,
                  }}
                >
                  <strong style={{ color: '#334155', display: 'block', marginBottom: 2 }}>
                    Anti-Bias Impact:
                  </strong>
                  {step.impact}
                </div>
              </div>
            ))}
          </div>

          {/* ── Visual Architecture Map: Where Bias Detection Happens in the Lifecycle ── */}
          <div
            style={{
              marginTop: 40,
              padding: '32px 36px',
              borderRadius: 20,
              background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #f0fdfa 100%)',
              border: '1px solid #a7f3d0',
              boxShadow: '0 8px 24px rgba(16, 185, 129, 0.08)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11.5, fontWeight: 700, color: '#065f46', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>
                  <ShieldCheck size={16} color="#059669" />
                  Continuous AI Bias Detection Architecture
                </div>
                <h3 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Where AI Bias Detection Actively Guards Your Pipeline
                </h3>
              </div>

              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <a
                  href="#live-demo"
                  className="btn btn-primary btn-sm"
                  style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '9px 16px', borderRadius: 8 }}
                >
                  <Zap size={14} /> Try Live Bias Scanner
                </a>
                <a
                  href="#pillars"
                  className="btn btn-secondary btn-sm"
                  style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '9px 16px', borderRadius: 8, background: '#ffffff' }}
                >
                  <Shield size={14} /> 4 Ethical Pillars
                </a>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 20,
              }}
            >
              <div style={{ background: '#ffffff', padding: '18px 20px', borderRadius: 14, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: '#0284c7', fontWeight: 700, fontSize: 14 }}>
                  <Wand2 size={16} /> 1. Pre-Application Linguistic Bias
                </div>
                <p style={{ fontSize: 12.5, color: '#475569', margin: '0 0 10px', lineHeight: 1.5 }}>
                  Sub-second WebSocket checks scan JD text against 18 gender-coded and age-biased keywords. Automatic PII redactor strips names, phones, and graduation years.
                </p>
                <div style={{ fontSize: 11, color: '#0284c7', fontWeight: 600 }}>
                  ✓ Live JD Wording Scan &middot; 100% PII Masked Roster
                </div>
              </div>

              <div style={{ background: '#ffffff', padding: '18px 20px', borderRadius: 14, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: '#8b5cf6', fontWeight: 700, fontSize: 14 }}>
                  <Code2 size={16} /> 2. Assessment & Procedural Neutrality
                </div>
                <p style={{ fontSize: 12.5, color: '#475569', margin: '0 0 10px', lineHeight: 1.5 }}>
                  Eliminates subjective screening interviews. Standardized 30-minute aptitude challenges and sandboxed code execution in isolated Node.js VMs are graded on test cases alone.
                </p>
                <div style={{ fontSize: 11, color: '#8b5cf6', fontWeight: 600 }}>
                  ✓ Sealed Answer Rubrics &middot; Zero Human Mood Bias
                </div>
              </div>

              <div style={{ background: '#ffffff', padding: '18px 20px', borderRadius: 14, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: '#059669', fontWeight: 700, fontSize: 14 }}>
                  <Scale size={16} /> 3. Statistical Adverse Impact & Audits
                </div>
                <p style={{ fontSize: 12.5, color: '#475569', margin: '0 0 10px', lineHeight: 1.5 }}>
                  EEOC 4/5ths Rule (80% impact ratio) and NYC Local Law 144 compliance audits compute cohort selection disparities. Recruiter overrides require written justifications.
                </p>
                <div style={{ fontSize: 11, color: '#059669', fontWeight: 600 }}>
                  ✓ NYC LL144 Ready &middot; Immutable Audit Trail Logs
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── AI Autonomous Candidate Selection Engine ────────────────── */}
      <section
        id="ai-selection"
        className="scroll-reveal"
        style={{
          padding: '90px 24px',
          background: 'linear-gradient(180deg, #09131f 0%, #0d1b2a 100%)',
          color: '#f8fafc',
          position: 'relative',
          overflow: 'hidden',
          borderTop: '1px solid #1e293b',
          borderBottom: '1px solid #1e293b',
        }}
      >
        {/* Glow ambient background lights */}
        <div
          style={{
            position: 'absolute',
            top: -120,
            right: -80,
            width: 480,
            height: 480,
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, rgba(16, 185, 129, 0) 70%)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -100,
            left: -80,
            width: 420,
            height: 420,
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.10) 0%, rgba(59, 130, 246, 0) 70%)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {/* Section Header */}
          <div style={{ textAlign: 'center', maxWidth: 840, margin: '0 auto 56px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#34d399',
                padding: '7px 16px',
                borderRadius: 999,
                fontSize: 12.5,
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                marginBottom: 18,
              }}
            >
              <Cpu size={15} /> Autonomous Meritocracy Engine
            </div>

            <h2
              style={{
                fontSize: 'clamp(28px, 4vw, 42px)',
                fontWeight: 900,
                color: '#ffffff',
                lineHeight: 1.2,
                letterSpacing: '-0.025em',
                margin: '0 0 16px',
              }}
            >
              AI Automatic Candidate Selection
              <span
                style={{
                  display: 'block',
                  background: 'linear-gradient(90deg, #34d399, #60a5fa)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Driven by Pure Competence & Continuous Anti-Bias Auditing
              </span>
            </h2>

            <p style={{ fontSize: 16, color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
              Eliminate recruiter fatigue, pedigree bias, and subjective resume skimming. Our autonomous shortlisting engine
              ranks and auto-advances candidates using deterministic performance telemetry and verified skill evidence—with
              demographic inputs mathematically locked to zero.
            </p>
          </div>

          {/* Main 2-Column Content: Left = The 3 Pillars / Right = Live Evaluation Simulation Card */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: 32,
              alignItems: 'start',
              marginBottom: 48,
            }}
          >
            {/* Left Column: 3 Pillars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Pillar 1 */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 18,
                  padding: 24,
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: 'rgba(59, 130, 246, 0.15)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#60a5fa',
                      }}
                    >
                      <FileText size={18} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#f1f5f9' }}>
                        1. Resume Skill Evidence
                      </h3>
                      <span style={{ fontSize: 12, color: '#60a5fa', fontWeight: 600 }}>20% Weighted Contribution</span>
                    </div>
                  </div>
                  <span
                    style={{
                      background: 'rgba(59, 130, 246, 0.1)',
                      color: '#93c5fd',
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: 6,
                    }}
                  >
                    100% PII-STRIPPED
                  </span>
                </div>
                <p style={{ fontSize: 13.5, color: '#94a3b8', lineHeight: 1.55, margin: '0 0 12px' }}>
                  Natural language processing extracts demonstrated technical competencies, open-source portfolio repositories,
                  and hands-on frameworks from resumes stripped of names, gender markers, universities, and addresses.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, fontSize: 11.5, color: '#cbd5e1' }}>
                  <span style={{ background: 'rgba(255,255,255,0.06)', padding: '3px 8px', borderRadius: 4 }}>
                    ✓ Semantic Skill Graph
                  </span>
                  <span style={{ background: 'rgba(255,255,255,0.06)', padding: '3px 8px', borderRadius: 4 }}>
                    ✓ Anti-Credentialism
                  </span>
                  <span style={{ background: 'rgba(255,255,255,0.06)', padding: '3px 8px', borderRadius: 4 }}>
                    ✓ Zero University Bias
                  </span>
                </div>
              </div>

              {/* Pillar 2 */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 18,
                  padding: 24,
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: 'rgba(16, 185, 129, 0.15)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#34d399',
                      }}
                    >
                      <Code2 size={18} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#f1f5f9' }}>
                        2. Objective Performance Telemetry
                      </h3>
                      <span style={{ fontSize: 12, color: '#34d399', fontWeight: 600 }}>80% Weighted Contribution</span>
                    </div>
                  </div>
                  <span
                    style={{
                      background: 'rgba(16, 185, 129, 0.1)',
                      color: '#6ee7b7',
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: 6,
                    }}
                  >
                    EMPIRICAL EXECUTION
                  </span>
                </div>
                <p style={{ fontSize: 13.5, color: '#94a3b8', lineHeight: 1.55, margin: '0 0 12px' }}>
                  The overwhelming majority of selection decisions rely on empirical skill execution: timed MCQ cognitive aptitude
                  (40%) and real-time sandboxed VM coding benchmarks (40%) tested against hidden unit suites.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, fontSize: 11.5, color: '#cbd5e1' }}>
                  <span style={{ background: 'rgba(255,255,255,0.06)', padding: '3px 8px', borderRadius: 4 }}>
                    ✓ 40% Sandboxed Node.js VM
                  </span>
                  <span style={{ background: 'rgba(255,255,255,0.06)', padding: '3px 8px', borderRadius: 4 }}>
                    ✓ 40% Adaptive MCQ Aptitude
                  </span>
                  <span style={{ background: 'rgba(255,255,255,0.06)', padding: '3px 8px', borderRadius: 4 }}>
                    ✓ 0% Demeanor / Charisma Bias
                  </span>
                </div>
              </div>

              {/* Pillar 3 */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 18,
                  padding: 24,
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: 'rgba(245, 158, 11, 0.15)',
                        border: '1px solid rgba(245, 158, 11, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fbbf24',
                      }}
                    >
                      <Scale size={18} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#f1f5f9' }}>
                        3. Continuous Bias Auditing & Safety Gate
                      </h3>
                      <span style={{ fontSize: 12, color: '#fbbf24', fontWeight: 600 }}>0.0% Demographic Factor</span>
                    </div>
                  </div>
                  <span
                    style={{
                      background: 'rgba(245, 158, 11, 0.1)',
                      color: '#fde68a',
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: 6,
                    }}
                  >
                    MANDATORY GATE
                  </span>
                </div>
                <p style={{ fontSize: 13.5, color: '#94a3b8', lineHeight: 1.55, margin: '0 0 12px' }}>
                  No candidate is promoted until our statistical audit engine validates cohort distribution under the EEOC 4/5ths Rule
                  and NYC LL144 guidelines. If adverse impact or demographic anomaly is detected, autonomous selection auto-halts for review.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, fontSize: 11.5, color: '#cbd5e1' }}>
                  <span style={{ background: 'rgba(255,255,255,0.06)', padding: '3px 8px', borderRadius: 4 }}>
                    ✓ EEOC 4/5ths Rule Guardrail
                  </span>
                  <span style={{ background: 'rgba(255,255,255,0.06)', padding: '3px 8px', borderRadius: 4 }}>
                    ✓ NYC LL144 Disparity Audit
                  </span>
                  <span style={{ background: 'rgba(255,255,255,0.06)', padding: '3px 8px', borderRadius: 4 }}>
                    ✓ Immutable Audit Logs
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Simulation Card */}
            <div
              style={{
                background: 'linear-gradient(145deg, #111e2e 0%, #0d1622 100%)',
                border: '1px solid rgba(52, 211, 153, 0.25)',
                borderRadius: 22,
                padding: 28,
                boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.6), 0 0 30px rgba(16, 185, 129, 0.08)',
                position: 'relative',
              }}
            >
              {/* Top Bar of Simulation */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingBottom: 16,
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  marginBottom: 20,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: '#10b981',
                      boxShadow: '0 0 10px #10b981',
                    }}
                  />
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', letterSpacing: '0.04em' }}>
                    AUTONOMOUS SELECTION SIMULATION
                  </span>
                </div>
                <span
                  style={{
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: '#34d399',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: 999,
                  }}
                >
                  LIVE EVALUATION
                </span>
              </div>

              {/* Candidate Info Strip */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: 12,
                  padding: '14px 16px',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  marginBottom: 22,
                }}
              >
                <div>
                  <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                    Target Profile
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 6 }}>
                    Candidate #CAND-4092
                    <span
                      style={{
                        background: 'rgba(59, 130, 246, 0.2)',
                        color: '#93c5fd',
                        fontSize: 10,
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: 4,
                      }}
                    >
                      BLIND
                    </span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                    Applied Track
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#cbd5e1' }}>
                    Full Stack Engineering
                  </div>
                </div>
              </div>

              {/* Score Breakdown Progress Bars */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
                {/* Score 1 */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 6 }}>
                    <span style={{ color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <FileText size={14} color="#60a5fa" /> Resume Skill Evidence Match (20%)
                    </span>
                    <span style={{ fontWeight: 700, color: '#93c5fd' }}>94% <span style={{ color: '#64748b', fontWeight: 400 }}>(+18.8 pts)</span></span>
                  </div>
                  <div style={{ height: 7, background: 'rgba(255, 255, 255, 0.08)', borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{ width: '94%', height: '100%', background: 'linear-gradient(90deg, #3b82f6, #60a5fa)', borderRadius: 999 }} />
                  </div>
                </div>

                {/* Score 2 */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 6 }}>
                    <span style={{ color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Zap size={14} color="#34d399" /> Timed MCQ & Aptitude Telemetry (40%)
                    </span>
                    <span style={{ fontWeight: 700, color: '#6ee7b7' }}>90% <span style={{ color: '#64748b', fontWeight: 400 }}>(+36.0 pts)</span></span>
                  </div>
                  <div style={{ height: 7, background: 'rgba(255, 255, 255, 0.08)', borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{ width: '90%', height: '100%', background: 'linear-gradient(90deg, #059669, #34d399)', borderRadius: 999 }} />
                  </div>
                </div>

                {/* Score 3 */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 6 }}>
                    <span style={{ color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Code2 size={14} color="#a78bfa" /> Sandboxed VM Coding Benchmarks (40%)
                    </span>
                    <span style={{ fontWeight: 700, color: '#c4b5fd' }}>98% <span style={{ color: '#64748b', fontWeight: 400 }}>(+39.2 pts)</span></span>
                  </div>
                  <div style={{ height: 7, background: 'rgba(255, 255, 255, 0.08)', borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{ width: '98%', height: '100%', background: 'linear-gradient(90deg, #7c3aed, #a78bfa)', borderRadius: 999 }} />
                  </div>
                </div>
              </div>

              {/* Transparent Deterministic Formula Box */}
              <div
                style={{
                  background: 'rgba(0, 0, 0, 0.35)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 12,
                  padding: 14,
                  marginBottom: 20,
                  fontSize: 12,
                  fontFamily: 'monospace',
                  color: '#94a3b8',
                }}
              >
                <div style={{ color: '#cbd5e1', fontWeight: 700, marginBottom: 4 }}>
                  DETERMINISTIC COMPOSITE FORMULA:
                </div>
                <div>(90 × 0.40) + (98 × 0.40) + (94 × 0.20) = <strong style={{ color: '#34d399', fontSize: 13 }}>94.0 / 100</strong></div>
                <div style={{ color: '#64748b', fontSize: 11, marginTop: 4 }}>
                  Threshold for Automatic Promotion: ≥ 85.0%
                </div>
              </div>

              {/* Anti-Bias Gate Check Badges */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 8,
                  marginBottom: 20,
                }}
              >
                <div
                  style={{
                    background: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    borderRadius: 8,
                    padding: '8px 10px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: 10, color: '#6ee7b7', fontWeight: 600 }}>DEMOGRAPHIC IMPACT</div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#34d399' }}>0.0% WEIGHT</div>
                </div>
                <div
                  style={{
                    background: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    borderRadius: 8,
                    padding: '8px 10px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: 10, color: '#6ee7b7', fontWeight: 600 }}>EEOC 4/5THS RULE</div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#34d399' }}>PASS (1.02)</div>
                </div>
                <div
                  style={{
                    background: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    borderRadius: 8,
                    padding: '8px 10px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: 10, color: '#6ee7b7', fontWeight: 600 }}>NYC LL144 AUDIT</div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#34d399' }}>COMPLIANT</div>
                </div>
              </div>

              {/* Final AI Verdict Banner */}
              <div
                style={{
                  background: 'linear-gradient(90deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.1) 100%)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  borderRadius: 12,
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    background: '#10b981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    flexShrink: 0,
                  }}
                >
                  <CheckCircle2 size={22} />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#34d399', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    AI Decision Output
                  </div>
                  <div style={{ fontSize: 14.5, fontWeight: 800, color: '#ffffff' }}>
                    Auto-Advanced to Final Blind Interview
                  </div>
                  <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 2 }}>
                    Candidate ranked in top 2% of cohort based on empirical code execution.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom 3 Feature Banners */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 20,
            }}
          >
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: 14,
                padding: '20px 22px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#34d399', fontWeight: 700, fontSize: 14, marginBottom: 8 }}>
                <ShieldCheck size={18} /> Zero Human Subjectivity
              </div>
              <p style={{ fontSize: 12.5, color: '#94a3b8', margin: 0, lineHeight: 1.55 }}>
                Removes gut feeling, prestige university bias, and gender affinity. Decisions are generated purely from live performance benchmarks and skill evidence.
              </p>
            </div>

            <div
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: 14,
                padding: '20px 22px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#60a5fa', fontWeight: 700, fontSize: 14, marginBottom: 8 }}>
                <Zap size={18} /> Instant 10-Second Candidate Shortlisting
              </div>
              <p style={{ fontSize: 12.5, color: '#94a3b8', margin: 0, lineHeight: 1.55 }}>
                Evaluates hundreds of candidate submissions simultaneously. Shortlists the highest-scoring talent immediately without bottlenecking hiring managers.
              </p>
            </div>

            <div
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: 14,
                padding: '20px 22px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#fbbf24', fontWeight: 700, fontSize: 14, marginBottom: 8 }}>
                <Scale size={18} /> 100% Traceable Legal Defense
              </div>
              <p style={{ fontSize: 12.5, color: '#94a3b8', margin: 0, lineHeight: 1.55 }}>
                Every code test result, MCQ answer, and bias gate metric is immutably recorded. Provide full compliance records for EEOC and NYC Local Law 144 audits.
              </p>
            </div>
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
