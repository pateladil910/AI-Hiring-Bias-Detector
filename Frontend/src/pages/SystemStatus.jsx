import { useState, useEffect } from 'react';
import { Activity, CheckCircle2, RefreshCw, ArrowLeft, Server, Cpu, Globe, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function SystemStatus() {
  const [backendStatus, setBackendStatus] = useState('checking');
  const [aiStatus, setAiStatus] = useState('checking');
  const [lastCheck, setLastCheck] = useState(new Date());

  const checkServices = async () => {
    setLastCheck(new Date());
    // Check Backend
    try {
      await axios.get('http://localhost:5000/health', { timeout: 4000 });
      setBackendStatus('online');
    } catch (e) {
      setBackendStatus('offline');
    }

    // Check AI Microservice
    try {
      await axios.get('http://localhost:8000/health', { timeout: 4000 });
      setAiStatus('online');
    } catch (e) {
      setAiStatus('offline');
    }
  };

  useEffect(() => {
    checkServices();
    const timer = setInterval(checkServices, 15000);
    return () => clearInterval(timer);
  }, []);

  const services = [
    {
      name: 'Backend API & Database',
      port: 'Port 5000',
      type: 'Node.js Express / SQLite Sequelize',
      status: backendStatus,
      icon: Server,
      desc: 'Handles authentication, applicant tracking, and legal audit logs.'
    },
    {
      name: 'AI Microservice & Bias Engine',
      port: 'Port 8000',
      type: 'Python FastAPI / spaCy NLP',
      status: aiStatus,
      icon: Cpu,
      desc: 'Delivers Layer-1 lexicon and Layer-2 semantic JD bias scanning.'
    },
    {
      name: 'Real-Time WebSocket Broadcaster',
      port: 'Port 5000 (ws://)',
      type: 'ws Library',
      status: backendStatus,
      icon: Zap,
      desc: 'Powers real-time bias score feedback while authoring job postings.'
    },
    {
      name: 'Web Application Client',
      port: 'Port 5173',
      type: 'React 18 / Vite SPA',
      status: 'online',
      icon: Globe,
      desc: 'Delivers candidate portals and recruiter blind evaluation interfaces.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Link to="/" className="inline-flex items-center text-sm text-slate-500 hover:text-emerald-600 transition">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Link>
          <button
            onClick={checkServices}
            className="px-3.5 py-1.5 bg-white border border-slate-300 hover:border-emerald-600 rounded-lg text-xs font-semibold text-slate-700 shadow-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-600" /> Refresh Status
          </button>
        </div>

        {/* Global Banner */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
              <Activity className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">System Status & Service Health</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                All systems targeting 99.5% operational uptime. Last checked: {lastCheck.toLocaleTimeString()}
              </p>
            </div>
          </div>

          <div className="px-3.5 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-full flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> All Systems Normal
          </div>
        </div>

        {/* Services Breakdown */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900">Service Health Matrix</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {services.map((s, idx) => {
              const Icon = s.icon;
              return (
                <div key={idx} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                        <Icon className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-900">{s.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{s.port}</div>
                      </div>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      s.status === 'online'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : s.status === 'checking'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {s.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{s.desc}</p>
                  <div className="text-[10px] text-slate-400 border-t border-slate-100 pt-2 font-mono">
                    {s.type}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
