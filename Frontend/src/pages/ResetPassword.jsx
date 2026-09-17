import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { authAPI } from '../lib/api';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setError('Reset token is missing from the URL. Please use the link sent to your email.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters in length.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authAPI.resetPassword({ token, password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3500);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Invalid or expired password reset link. Please request a new one.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-900/20 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-7 h-7" />
          </div>
        </div>
        <h2 className="text-center text-3xl font-bold tracking-tight text-white">
          Create new password
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Ensure your account uses a strong, unique credential.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-slate-900/80 backdrop-blur-xl py-8 px-6 shadow-2xl border border-slate-800 rounded-2xl sm:px-10">
          {success ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white">Password Updated!</h3>
              <p className="text-sm text-slate-300">
                Your password has been changed successfully. Redirecting you to the sign-in page...
              </p>
              <div className="pt-2">
                <Link
                  to="/login"
                  className="inline-block py-2 px-4 rounded-lg bg-emerald-400 text-slate-950 font-semibold text-sm hover:bg-emerald-300 transition"
                >
                  Sign In Now
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg flex items-center gap-2 text-sm text-red-400">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label htmlFor="pass" className="block text-sm font-medium text-slate-300">
                  New Password (min 8 characters)
                </label>
                <div className="mt-2 relative">
                  <input
                    id="pass"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full rounded-lg bg-slate-950/60 border border-slate-700 px-4 py-3 pl-11 text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm transition"
                  />
                  <Lock className="w-5 h-5 text-slate-500 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div>
                <label htmlFor="cpass" className="block text-sm font-medium text-slate-300">
                  Confirm New Password
                </label>
                <div className="mt-2 relative">
                  <input
                    id="cpass"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full rounded-lg bg-slate-950/60 border border-slate-700 px-4 py-3 pl-11 text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm transition"
                  />
                  <Lock className="w-5 h-5 text-slate-500 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition"
              >
                {loading ? 'Resetting Password...' : 'Save New Password'}
              </button>

              <div className="text-center pt-2">
                <Link to="/login" className="text-sm text-slate-400 hover:text-slate-300 transition">
                  Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
