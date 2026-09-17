import { Outlet, NavLink, useNavigate } from 'react-router-dom';
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
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ChatbotWidget from '../components/ChatbotWidget';
import Footer from '../components/Footer';

const navItems = [
  { to: '/candidate/dashboard', icon: <LayoutDashboard size={16} />, label: 'Dashboard' },
  { to: '/candidate/resume', icon: <FileText size={16} />, label: 'Resume Redaction' },
  { to: '/candidate/domain', icon: <Code size={16} />, label: 'Assessments' },
  { to: '/candidate/jobs', icon: <Briefcase size={16} />, label: 'Browse Jobs' },
  { to: '/candidate/applications', icon: <ClipboardCheck size={16} />, label: 'My Applications' },
  { to: '/candidate/interviews', icon: <Calendar size={16} />, label: 'Interviews' },
  { to: '/candidate/profile', icon: <UserCheck size={16} />, label: 'Profile & Privacy' },
];

export default function CandidateLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const alias = `CAND-${(user?.id || 'ANON').slice(0, 6).toUpperCase()}`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* ── Light-Theme Top Navigation Bar ──────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo & Candidate Badge */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <NavLink
              to="/candidate/dashboard"
              className="flex items-center gap-2.5 text-slate-900 group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <ShieldCheck size={20} />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900">
                Fair<span className="text-emerald-600">Hire</span>
              </span>
            </NavLink>
            <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Candidate Portal
            </span>
          </div>

          {/* Navigation Links (Scrollable on small screens) */}
          <nav className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none max-w-2xl">
            {navItems.map(({ to, icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`
                }
              >
                {icon}
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Candidate Profile, Cloaked Alias & Actions */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Cloaked Identity Pill */}
            <div
              className="hidden md:flex items-center gap-1.5 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg text-xs"
              title="Your identity is demographic-neutral cloaked to prevent unconscious hiring bias"
            >
              <span className="text-slate-400 font-medium">Alias:</span>
              <span className="font-mono font-bold text-emerald-700">{alias}</span>
            </div>

            {/* Notification Bell */}
            <NavLink
              to="/notifications"
              className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200/80 transition-colors"
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
