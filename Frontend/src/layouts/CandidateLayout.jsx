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

const navItems = [
  { to: '/candidate/dashboard', icon: <LayoutDashboard size={17} />, label: 'Dashboard' },
  { to: '/candidate/resume', icon: <FileText size={17} />, label: 'Resume & Redaction' },
  { to: '/candidate/domain', icon: <Code size={17} />, label: 'Assessments' },
  { to: '/candidate/jobs', icon: <Briefcase size={17} />, label: 'Browse Jobs' },
  { to: '/candidate/applications', icon: <ClipboardCheck size={17} />, label: 'My Applications' },
  { to: '/candidate/interviews', icon: <Calendar size={17} />, label: 'Interviews' },
  { to: '/candidate/profile', icon: <UserCheck size={17} />, label: 'Profile & Privacy' },
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
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', display: 'flex', flexDirection: 'column' }}>
      {/* ── Top Navigation ────────────────────────────────────────────────── */}
      <header
        style={{
          background: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          className="container"
          style={{
            display: 'flex',
            alignItems: 'center',
            height: 60,
            gap: 20,
            maxWidth: 1400,
            margin: '0 auto',
            padding: '0 24px',
          }}
        >
          {/* Logo & Platform Badge */}
          <NavLink
            to="/candidate/dashboard"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              textDecoration: 'none',
              color: 'inherit',
              flexShrink: 0,
            }}
          >
            <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: '-0.02em' }}>
              Fair<span style={{ color: 'var(--color-primary)' }}>Hire</span>
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                padding: '2px 8px',
                borderRadius: 9999,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <ShieldCheck size={12} /> Candidate Portal
            </span>
          </NavLink>

          {/* Navigation Links */}
          <nav style={{ display: 'flex', gap: 4, flex: 1, overflowX: 'auto', padding: '4px 0' }}>
            {navItems.map(({ to, icon, label }) => (
              <NavLink
                key={to}
                to={to}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 13,
                  fontWeight: 500,
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  color: isActive ? '#fff' : 'var(--color-text-secondary)',
                  background: isActive ? 'var(--color-primary)' : 'transparent',
                  transition: 'all 150ms ease-out',
                })}
              >
                {icon}
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Candidate Alias & Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
            {/* Cloaked Alias Pill */}
            <div
              title="Your algorithmic identity is cloaked from recruiters until final interview"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid var(--color-border)',
                padding: '4px 10px',
                borderRadius: 8,
                fontSize: 12,
              }}
            >
              <span style={{ color: 'var(--color-text-muted)', fontSize: 11 }}>Alias:</span>
              <span style={{ color: '#6ee7b7', fontWeight: 600, fontFamily: 'monospace' }}>{alias}</span>
            </div>

            {/* Notifications link */}
            <NavLink
              to="/notifications"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 34,
                height: 34,
                borderRadius: 8,
                background: 'rgba(255,255,255,0.05)',
                color: 'var(--color-text-secondary)',
                textDecoration: 'none',
                position: 'relative',
              }}
              title="Notifications"
            >
              <Bell size={16} />
              <span
                style={{
                  position: 'absolute',
                  top: 7,
                  right: 7,
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: '#10b981',
                }}
              />
            </NavLink>

            {/* Logout button */}
            <button
              id="candidate-logout"
              onClick={handleLogout}
              className="btn btn-ghost btn-sm"
              title="Sign out"
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}
            >
              <LogOut size={15} />
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* ── Page Content ─────────────────────────────────────────────────── */}
      <main style={{ flex: 1, paddingBottom: 60 }}>
        <Outlet />
      </main>

      {/* ── Floating AI Chatbot Widget ─────────────────────────────────────── */}
      <ChatbotWidget />
    </div>
  );
}
