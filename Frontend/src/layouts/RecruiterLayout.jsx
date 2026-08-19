import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  ClipboardList,
  ShieldAlert,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ChatbotWidget from '../components/ChatbotWidget';

const navItems = [
  { to: '/recruiter/dashboard',   icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
  { to: '/recruiter/jobs',        icon: <Briefcase size={18} />,       label: 'Jobs' },
  { to: '/recruiter/candidates',  icon: <Users size={18} />,           label: 'Candidates' },
  { to: '/recruiter/review',      icon: <ShieldAlert size={18} />,     label: 'Review Queue' },
  { to: '/recruiter/audit',       icon: <ClipboardList size={18} />,   label: 'Audit Trail' },
];

const ROLE_LABELS = {
  admin: 'Admin',
  hr_lead: 'HR Lead',
  recruiter: 'Recruiter',
  compliance: 'Compliance',
};

export default function RecruiterLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const sidebarW = collapsed ? 64 : 240;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg)' }}>

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside style={{
        width: sidebarW,
        minHeight: '100vh',
        background: 'var(--color-surface)',
        borderRight: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 200ms ease-out',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflow: 'hidden',
      }}>

        {/* Logo + collapse toggle */}
        <div style={{
          padding: '20px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          borderBottom: '1px solid var(--color-border)',
        }}>
          {!collapsed && (
            <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
              Fair<span style={{ color: 'var(--color-primary)' }}>Hire</span>
            </span>
          )}
          <button
            onClick={() => setCollapsed((c) => !c)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center',
              padding: 4, borderRadius: 'var(--radius-sm)',
            }}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navItems.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              title={collapsed ? label : undefined}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '9px 12px',
                borderRadius: 'var(--radius-md)',
                fontSize: 14,
                fontWeight: 500,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                background: isActive ? 'rgba(91,127,255,0.1)' : 'transparent',
                transition: 'all 150ms ease-out',
              })}
            >
              <span style={{ flexShrink: 0 }}>{icon}</span>
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid var(--color-border)' }}>
          {!collapsed && (
            <div style={{ padding: '8px 12px', marginBottom: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.firstName} {user?.lastName}
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                {ROLE_LABELS[user?.role] || user?.role}
              </div>
            </div>
          )}
          <button
            id="recruiter-logout"
            onClick={handleLogout}
            title="Sign out"
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              width: '100%', padding: '9px 12px',
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--color-text-muted)', borderRadius: 'var(--radius-md)',
              fontSize: 14, fontWeight: 500,
              transition: 'all 150ms ease-out',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-danger)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-muted)'}
          >
            <LogOut size={18} style={{ flexShrink: 0 }} />
            {!collapsed && 'Sign out'}
          </button>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <main style={{ flex: 1, overflow: 'auto' }}>
        <Outlet />
      </main>

      {/* ── Floating AI Chatbot Widget ─────────────────────────────────────── */}
      <ChatbotWidget />
    </div>
  );
}
