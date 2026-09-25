import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Code,
  Briefcase,
  ClipboardCheck,
  Calendar,
  UserCheck,
  Bell,
  LogOut,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ChatbotWidget from '../components/ChatbotWidget';
import Footer from '../components/Footer';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const navItems = [
  { to: '/candidate/dashboard', icon: <LayoutDashboard size={16} />, label: 'Dashboard', requiresResume: true },
  { to: '/candidate/resume', icon: <FileText size={16} />, label: 'Resume Redaction', requiresResume: false },
  { to: '/candidate/domain', icon: <Code size={16} />, label: 'Assessments', requiresResume: true },
  { to: '/candidate/jobs', icon: <Briefcase size={16} />, label: 'Browse Jobs', requiresResume: true },
  { to: '/candidate/applications', icon: <ClipboardCheck size={16} />, label: 'My Applications', requiresResume: true },
  { to: '/candidate/interviews', icon: <Calendar size={16} />, label: 'Interviews', requiresResume: true },
  { to: '/candidate/profile', icon: <UserCheck size={16} />, label: 'Profile & Privacy', requiresResume: false },
];

export default function CandidateLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [hasConfirmedResume, setHasConfirmedResume] = useState(true);
  const [checkingResume, setCheckingResume] = useState(true);

  useEffect(() => {
    checkResumeStatus();
  }, [location.pathname]);

  const checkResumeStatus = async () => {
    try {
      const token =
        localStorage.getItem('token') ||
        localStorage.getItem('fairhire_token') ||
        localStorage.getItem('fh_token');
      if (!token) {
        setCheckingResume(false);
        return;
      }

      const res = await axios.get(`${API_BASE}/api/resume/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const confirmed = !!res.data.resume && !!res.data.resume.confirmed;
      setHasConfirmedResume(confirmed);

      // Gate all other candidate routes until resume is uploaded & confirmed
      const allowedPaths = ['/candidate/resume', '/candidate/resume/review', '/candidate/profile'];
      if (!confirmed && !allowedPaths.includes(location.pathname)) {
        navigate('/candidate/resume', { replace: true });
      }
    } catch (_) {
      // If error fetching, avoid locking unnecessarily
    } finally {
      setCheckingResume(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* ── Light-Theme Top Navigation Bar ──────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
        <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo & Candidate Badge */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <NavLink
              to={hasConfirmedResume ? '/candidate/dashboard' : '/candidate/resume'}
              className="flex items-center gap-2.5 text-slate-900 group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <ShieldCheck size={20} />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900">
                Fair<span className="text-emerald-600">Hire</span>
              </span>
            </NavLink>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Candidate Portal
            </span>
          </div>

          {/* Navigation Links - Full Width & Comfortably Spaced with Locked Badges */}
          <nav className="flex items-center gap-1.5 md:gap-2 overflow-x-auto py-1 scrollbar-none flex-1 justify-center">
            {navItems.map(({ to, icon, label, requiresResume }) => {
              const isLocked = !hasConfirmedResume && !checkingResume && requiresResume;

              if (isLocked) {
                return (
                  <button
                    key={to}
                    onClick={() => navigate('/candidate/resume')}
                    title="Upload & confirm your resume first to unlock this section"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all whitespace-nowrap cursor-pointer opacity-70"
                  >
                    {icon}
                    <span>{label}</span>
                    <Lock size={12} className="text-slate-400 ml-0.5" />
                  </button>
                );
              }

              return (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`
                  }
                >
                  {icon}
                  <span>{label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Candidate Actions (Sign out & Notifications) */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Notification Bell */}
            <NavLink
              to="/candidate/notifications"
              className={({ isActive }) =>
                `relative p-2 rounded-lg transition-colors border ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100 border-slate-200/80'
                }`
              }
              title="Notifications"
            >
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white"></span>
            </NavLink>

            {/* Sign out */}
            <button
              id="candidate-logout"
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-colors"
              title="Sign out of Candidate Portal"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Mandatory Resume Upload Alert Banner ─────────────────────────── */}
      {!hasConfirmedResume && !checkingResume && (
        <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-2.5 sm:px-8 text-amber-900 text-xs font-semibold flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <Lock size={15} className="text-amber-600 flex-shrink-0" />
            <span>
              <strong>Step 1 Mandatory:</strong> Please upload and confirm your resume first. All assessments, job applications, and portal features unlock once your demographic-blind profile is verified.
            </span>
          </div>
          <button
            onClick={() => navigate('/candidate/resume')}
            className="px-3.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-xs flex-shrink-0 cursor-pointer transition"
          >
            Upload Resume Now →
          </button>
        </div>
      )}

      {/* ── Page Body ────────────────────────────────────────────────────── */}
      <main className="flex-1 bg-slate-50">
        <Outlet />
      </main>

      {/* ── Production Enterprise Footer ─────────────────────────────────── */}
      <Footer />

      {/* ── Floating AI Chatbot Widget ───────────────────────────────────── */}
      <ChatbotWidget />
    </div>
  );
}
