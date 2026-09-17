import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Clock, CheckCircle2, XCircle, ArrowRight, ShieldCheck, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Applications() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([
    {
      id: 'app-01',
      jobTitle: 'Senior Full Stack Engineer',
      company: 'Stripe Equity',
      stage: 'in_assessment',
      appliedAt: '2026-09-14',
      score: '88/100',
      statusPill: 'In Assessment',
      pillColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      actionUrl: '/candidate/test/test-101',
      actionText: 'Resume Test'
    },
    {
      id: 'app-02',
      jobTitle: 'Backend Distributed Systems Lead',
      company: 'FairHire Tech',
      stage: 'under_review',
      appliedAt: '2026-09-10',
      score: '94/100',
      statusPill: 'Under Review',
      pillColor: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      actionUrl: '/candidate/status',
      actionText: 'View Evaluation'
    },
    {
      id: 'app-03',
      jobTitle: 'Data Platform Architect',
      company: 'Vanguard Systems',
      stage: 'advanced',
      appliedAt: '2026-09-02',
      score: '91/100',
      statusPill: 'Advanced to Panel',
      pillColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      actionUrl: '/notifications',
      actionText: 'View Interview Details'
    }
  ]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Briefcase className="w-7 h-7 text-emerald-600" />
              My Applications
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Track your demographic-shielded job applications and assessment progress.
            </p>
          </div>
          <Link
            to="/jobs"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-sm transition shadow-xs cursor-pointer"
          >
            Explore Open Jobs <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Applications List */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="divide-y divide-slate-100">
            {applications.map((app) => (
              <div key={app.id} className="p-5 sm:p-6 hover:bg-slate-50/80 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-bold text-base text-slate-900">{app.jobTitle}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${app.pillColor}`}>
                      {app.statusPill}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-4">
                    <span>Company: <strong className="text-slate-700">{app.company}</strong></span>
                    <span>Applied: {app.appliedAt}</span>
                    {app.score && (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                        <ShieldCheck className="w-3.5 h-3.5" /> Score: {app.score}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Link
                    to={app.actionUrl}
                    className="px-4 py-2 rounded-lg bg-slate-50 hover:bg-emerald-50 text-emerald-700 text-xs font-semibold transition inline-flex items-center gap-1.5 border border-slate-200 shadow-xs"
                  >
                    {app.actionText} <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3 text-xs text-slate-700 shadow-xs">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Demographic Shield Active:</strong> Employers evaluate your performance based strictly on objective test assertions and technical skills. Your identity is only unmasked when you confirm an interview invitation.
          </p>
        </div>
      </div>
    </div>
  );
}
