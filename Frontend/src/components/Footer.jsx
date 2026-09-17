import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Cpu, Database, Activity, Lock, ArrowUpRight, HeartHandshake } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 text-slate-600 mt-auto font-sans">
      {/* Top Banner: Microservice Health & Compliance */}
      <div className="border-b border-slate-100 bg-slate-50/70 py-3 px-4 sm:px-6 lg:px-8 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-100/70 text-emerald-800 font-semibold border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Algorithmic Neutrality Active
            </span>
            <span className="text-slate-500 hidden sm:inline">•</span>
            <span className="text-slate-600 hidden sm:inline">Zero demographic memory retained during scoring</span>
          </div>

          <div className="flex items-center gap-4 text-slate-500">
            <div className="flex items-center gap-1.5" title="FastAPI NLP & Bias Detection Service">
              <Cpu size={13} className="text-emerald-600" />
              <span>AI Engine: <strong className="text-slate-800 font-medium">:8000 Live</strong></span>
            </div>
            <div className="flex items-center gap-1.5" title="Node.js & Express REST Backend">
              <Database size={13} className="text-sky-600" />
              <span>Core API: <strong className="text-slate-800 font-medium">:5000 Live</strong></span>
            </div>
            <div className="flex items-center gap-1.5" title="System Status Dashboard">
              <Activity size={13} className="text-indigo-600" />
              <Link to="/status" className="hover:text-slate-900 underline font-medium">Status 99.98%</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2 text-slate-900 group">
              <span className="font-extrabold text-2xl tracking-tight text-slate-900">
                Fair<span className="text-emerald-600">Hire</span>
              </span>
              <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck size={12} className="text-emerald-600" />
                Enterprise v3.2
              </span>
            </Link>
            <p className="text-sm text-slate-600 max-w-sm leading-relaxed">
              EquiHire AI is the industry-standard algorithmic fairness platform. We eliminate unconscious demographic bias from the recruitment lifecycle through automated PII redaction, objective skill assessments, and explainable scoring models.
            </p>
            <div className="flex items-center gap-3 pt-2 text-xs text-slate-500">
              <span className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 font-medium text-slate-700">
                <Lock size={12} className="text-emerald-600" /> SOC2 Type II
              </span>
              <span className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 font-medium text-slate-700">
                <HeartHandshake size={12} className="text-emerald-600" /> EEOC Compliant
              </span>
              <span className="bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 font-medium text-slate-700">
                NYC LL 144 Audited
              </span>
            </div>
          </div>

          {/* Column 1: Candidate Portal */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">
              Candidate Portal
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/candidate/dashboard" className="text-slate-600 hover:text-emerald-600 transition-colors">
                  Candidate Dashboard
                </Link>
              </li>
              <li>
                <Link to="/candidate/jobs" className="text-slate-600 hover:text-emerald-600 transition-colors">
                  Verified Job Board
                </Link>
              </li>
              <li>
                <Link to="/candidate/resume" className="text-slate-600 hover:text-emerald-600 transition-colors">
                  PII Anonymizer
                </Link>
              </li>
              <li>
                <Link to="/candidate/domain" className="text-slate-600 hover:text-emerald-600 transition-colors">
                  Skill Assessment
                </Link>
              </li>
              <li>
                <Link to="/candidate/applications" className="text-slate-600 hover:text-emerald-600 transition-colors">
                  My Applications
                </Link>
              </li>
              <li>
                <Link to="/candidate/profile" className="text-slate-600 hover:text-emerald-600 transition-colors">
                  GDPR & Privacy Controls
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Recruiter Suite */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">
              Recruiter Suite
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/recruiter/dashboard" className="text-slate-600 hover:text-emerald-600 transition-colors">
                  Hiring Dashboard
                </Link>
              </li>
              <li>
                <Link to="/recruiter/candidates" className="text-slate-600 hover:text-emerald-600 transition-colors">
                  Anonymized Pipeline
                </Link>
              </li>
              <li>
                <Link to="/recruiter/jobs" className="text-slate-600 hover:text-emerald-600 transition-colors">
                  Job Postings & Bias Scan
                </Link>
              </li>
              <li>
                <Link to="/recruiter/review" className="text-slate-600 hover:text-emerald-600 transition-colors">
                  Blind Review Queue
                </Link>
              </li>
              <li>
                <Link to="/recruiter/analytics" className="text-slate-600 hover:text-emerald-600 transition-colors">
                  Demographic Disparity
                </Link>
              </li>
              <li>
                <Link to="/recruiter/audit" className="text-slate-600 hover:text-emerald-600 transition-colors">
                  Compliance Audit Trail
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Enterprise & Governance */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">
              Governance & Legal
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/admin/dashboard" className="text-slate-600 hover:text-emerald-600 transition-colors">
                  Admin Governance
                </Link>
              </li>
              <li>
                <Link to="/status" className="text-slate-600 hover:text-emerald-600 transition-colors">
                  System Health & SLA
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-slate-600 hover:text-emerald-600 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-slate-600 hover:text-emerald-600 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/accessibility" className="text-slate-600 hover:text-emerald-600 transition-colors">
                  Accessibility Statement
                </Link>
              </li>
              <li>
                <Link to="/help" className="text-slate-600 hover:text-emerald-600 transition-colors">
                  Help Center & FAQs
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright and Legal */}
        <div className="border-t border-slate-200 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} FairHire / EquiHire AI Inc. Engineered for demographic neutrality and transparent algorithmic hiring.
          </div>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-slate-900 transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-slate-900 transition-colors">Terms</Link>
            <Link to="/accessibility" className="hover:text-slate-900 transition-colors">Accessibility</Link>
            <Link to="/status" className="hover:text-slate-900 transition-colors flex items-center gap-1">
              Microservices <ArrowUpRight size={11} />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
