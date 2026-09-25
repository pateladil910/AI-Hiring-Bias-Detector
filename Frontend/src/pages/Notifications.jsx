import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  Clock,
  ShieldCheck,
  Briefcase,
  Info,
  ArrowRight,
  ArrowLeft,
  Home,
} from 'lucide-react';
import { notificationsAPI } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function Notifications() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationsAPI.list();
      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.warn('Failed to load live notifications, using mock defaults');
      setNotifications([
        {
          id: 'n-1',
          type: 'application',
          title: 'Blind Assessment Advanced',
          message: 'Your blind evaluation for Senior Full Stack Engineer has advanced to the Technical Panel review.',
          read: false,
          link: '/candidate/applications',
          createdAt: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: 'n-2',
          type: 'bias_scan',
          title: 'Job Description Audit Cleared',
          message: 'JD "Backend Systems Architect" passed Layer-1 and Layer-2 bias inspection with a 96/100 neutrality index.',
          read: false,
          link: '/candidate/jobs',
          createdAt: new Date(Date.now() - 7200000).toISOString()
        },
        {
          id: 'n-3',
          type: 'system',
          title: 'System Release v3.0.0 Active',
          message: 'FairHire AI 3.0.0 algorithms and WCAG 2.1 AA accessibility standards are now in effect.',
          read: true,
          link: '/candidate/dashboard',
          createdAt: new Date(Date.now() - 86400000).toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationsAPI.markRead(id);
    } catch (e) { /* ignore */ }
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsAPI.markAllRead();
    } catch (e) { /* ignore */ }
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const filtered = filter === 'all'
    ? notifications
    : filter === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications.filter(n => n.type === filter);

  const fallbackDashboard = user?.role === 'recruiter' ? '/recruiter/dashboard' : '/candidate/dashboard';

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(fallbackDashboard);
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-900 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="w-full space-y-6">
        {/* Top Back Navigation Bar */}
        <div className="flex items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/60 text-xs font-semibold text-slate-700 hover:text-emerald-700 shadow-2xs transition-all cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:text-emerald-600 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Dashboard</span>
          </button>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Link
              to={fallbackDashboard}
              className="hover:text-emerald-600 transition-colors flex items-center gap-1 font-medium"
            >
              <Home size={13} />
              <span>Dashboard</span>
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Notifications Center</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-xs">
                <Bell className="w-5 h-5" />
              </div>
              Notifications Center
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Real-time alerts regarding application progress, interview schedules, and bias audit results.
            </p>
          </div>
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-200 hover:border-emerald-600 text-xs font-semibold text-slate-700 shadow-xs transition cursor-pointer"
          >
            <CheckCheck className="w-4 h-4 text-emerald-600" /> Mark All as Read
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {['all', 'unread', 'application', 'bias_scan', 'system'].map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3.5 py-1.5 rounded-full capitalize font-semibold transition whitespace-nowrap cursor-pointer ${
                filter === tab
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs divide-y divide-slate-100">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              No notifications matching the selected filter.
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => handleMarkRead(item.id)}
                className={`p-5 sm:p-6 transition flex items-start justify-between gap-4 cursor-pointer ${
                  item.read ? 'bg-transparent hover:bg-slate-50' : 'bg-emerald-50/50 hover:bg-emerald-50'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="mt-0.5 shrink-0">
                    {item.type === 'application' && <Briefcase className="w-5 h-5 text-blue-600" />}
                    {item.type === 'bias_scan' && <ShieldCheck className="w-5 h-5 text-emerald-600" />}
                    {item.type === 'system' && <Info className="w-5 h-5 text-purple-600" />}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                      {!item.read && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{item.message}</p>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" />
                      {new Date(item.createdAt).toLocaleDateString()} at {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>

                {item.link && (
                  <Link
                    to={item.link}
                    className="shrink-0 p-2 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-500 hover:text-emerald-600 text-xs transition inline-flex items-center"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
