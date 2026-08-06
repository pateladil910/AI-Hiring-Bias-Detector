import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { ClipboardCheck, Briefcase, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/candidate/status', icon: <ClipboardCheck size={18} />, label: 'My Applications' },
  { to: '/candidate/jobs',   icon: <Briefcase size={18} />,      label: 'Browse Jobs' },
];

export default function CandidateLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', display: 'flex', flexDirection: 'column' }}>

      {/* ── Top Navigation ────────────────────────────────────────────────── */}
      <header style={{
        background: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div className="container" style={{
          display: 'flex', alignItems: 'center', height: 56, gap: 32,
        }}>
          {/* Logo */}
          <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em', flexShrink: 0 }}>
            Fair<span style={{ color: 'var(--color-primary)' }}>Hire</span>
          </span>

          {/* Nav links */}
          <nav style={{ display: 'flex', gap: 4, flex: 1 }}>
            {navItems.map(({ to, icon, label }) => (
              <NavLink
                key={to}
                to={to}
                style={({ isActive }) => ({
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 14, fontWeight: 500,
                  textDecoration: 'none',
                  color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  background: isActive ? 'rgba(91,127,255,0.1)' : 'transparent',
                  transition: 'all 150ms ease-out',
                })}
              >
                {icon}
                {label}
              </NavLink>
            ))}
          </nav>

          {/* User + logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
            <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
              {user?.firstName} {user?.lastName}
            </span>
            <button
              id="candidate-logout"
              onClick={handleLogout}
              className="btn btn-ghost btn-sm"
              title="Sign out"
            >
              <LogOut size={15} />
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* ── Page Content ─────────────────────────────────────────────────── */}
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
    </div>
  );
}
