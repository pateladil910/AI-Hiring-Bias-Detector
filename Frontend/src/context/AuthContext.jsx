import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../lib/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while checking existing session

  // ── Bootstrap: restore session from localStorage ───────────────────────────
  useEffect(() => {
    const bootstrap = async () => {
      const token = localStorage.getItem('token');
      const cachedUser = localStorage.getItem('user');
      if (token && cachedUser) {
        try {
          setUser(JSON.parse(cachedUser));
          // Verify token is still valid
          const { data } = await authAPI.me();
          setUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
        } catch {
          // Token expired or invalid — clear session
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
      setLoading(false);
    };
    bootstrap();
  }, []);

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  // ── Register ───────────────────────────────────────────────────────────────
  const register = useCallback(async (formData) => {
    const { data } = await authAPI.register(formData);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  // ── Role helpers ───────────────────────────────────────────────────────────
  const isRecruiterSide = user && ['admin', 'hr_lead', 'recruiter', 'compliance'].includes(user.role);
  const isCandidate = user?.role === 'candidate';

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isRecruiterSide, isCandidate }}>
      {children}
    </AuthContext.Provider>
  );
};

// Export useAuth separately to avoid Vite Fast Refresh incompatibility
// (Fast Refresh requires files to export only components OR only hooks — not both)
export { AuthContext };
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
