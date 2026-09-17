import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Users,
  Briefcase,
  FileText,
  CreditCard,
  LogOut,
  Bell,
  Activity,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ChatbotWidget from '../components/ChatbotWidget';

const navItems = [
  { to: '/admin/dashboard', icon: <ShieldAlert size={17} />, label: 'Admin Governance' },
  { to: '/admin/audit', icon: <FileText size={17} />, label: 'Audit Explorer' },
  { to: '/admin/billing', icon: <CreditCard size={17} />, label: 'Enterprise Billing' },
  { to: '/status', icon: <Activity size={17} />, label: 'System Health' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', display: 'flex', flexDirection: 'column' }}>
      {/* ── Top Navigation Bar ────────────────────────────────────────────── */}
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
          {/* Brand Logo & Role Pill */}
          <NavLink
            to="/admin/dashboard"
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
                fontWeight: 700,
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#f87171',
                padding: '2px 8px',
                borderRadius: 9999,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              🔐 Admin Console
            </span>
          </NavLink>

          {/* Nav Links */}
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

          {/* User & Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
            <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
              {user?.firstName} {user?.lastName} (Admin)
            </span>

            <button
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

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      {/* ── Chatbot Widget ────────────────────────────────────────────────── */}
      <ChatbotWidget />
    </div>
  );
}
