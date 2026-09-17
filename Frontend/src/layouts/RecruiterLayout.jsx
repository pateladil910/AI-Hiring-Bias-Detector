import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  ShieldAlert,
  ClipboardList,
  Calendar,
  BarChart3,
  LogOut,
  Building2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ChatbotWidget from '../components/ChatbotWidget';
import Footer from '../components/Footer';

const navItems = [
  { to: '/recruiter/dashboard', icon: <LayoutDashboard size={16} />, label: 'Dashboard' },
  { to: '/recruiter/jobs', icon: <Briefcase size={16} />, label: 'Jobs' },
  { to: '/recruiter/candidates', icon: <Users size={16} />, label: 'Blind Pipeline' },
  { to: '/recruiter/review', icon: <ShieldAlert size={16} />, label: 'Review Queue' },
  { to: '/recruiter/interviews', icon: <Calendar size={16} />, label: 'Interviews' },
  { to: '/recruiter/analytics', icon: <BarChart3 size={16} />, label: 'Analytics' },
  { to: '/recruiter/audit', icon: <ClipboardList size={16} />, label: 'Audit Trail' },
];

export default function RecruiterLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* ── Top Navigation Bar ────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo & Role Pill */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <NavLink
              to="/recruiter/dashboard"
              className="flex items-center gap-2.5 text-slate-900 group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-sky-500/20 group-hover:scale-105 transition-transform">
                <Building2 size={20} />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900">
                Fair<span className="text-sky-600">Hire</span>
              </span>
            </NavLink>
            <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
              Recruiter Suite
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none max-w-2xl">
            {navItems.map(({ to, icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`
                }
              >
                {icon}
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>

          {/* User & Actions */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-semibold text-slate-800">
                {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Recruiter Account'}
              </span>
              <span className="text-[11px] text-slate-400">Verified Hiring Partner</span>
            </div>

            <button
              id="recruiter-logout"
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-colors"
              title="Sign out of Recruiter Suite"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <main className="flex-1 bg-slate-50">
        <Outlet />
      </main>

      {/* ── Production Enterprise Footer ─────────────────────────────────── */}
      <Footer />

      {/* ── Chatbot Widget ────────────────────────────────────────────────── */}
      <ChatbotWidget />
    </div>
  );
}
