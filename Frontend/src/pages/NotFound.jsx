import { AlertCircle, ArrowLeft, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function NotFound() {
  const { user, isRecruiterSide } = useAuth();

  const getHomeRoute = () => {
    if (!user) return '/';
    if (user.role === 'admin') return '/admin/dashboard';
    if (isRecruiterSide) return '/recruiter/dashboard';
    return '/candidate/status';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 bg-emerald-950/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-md space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-emerald-400">
          <AlertCircle className="w-9 h-9" />
        </div>

        <div>
          <span className="text-emerald-400 font-mono font-bold text-sm tracking-wider uppercase">Error 404</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">Page Not Found</h1>
          <p className="text-sm text-slate-400 mt-2 leading-relaxed">
            The page you are searching for does not exist or may have been relocated under our demographic shield.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to={getHomeRoute()}
            className="w-full sm:w-auto px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs transition inline-flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" /> Return to Dashboard
          </Link>
          <Link
            to="/jobs"
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 font-semibold rounded-lg text-xs transition inline-flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Browse Active Jobs
          </Link>
        </div>
      </div>
    </div>
  );
}
