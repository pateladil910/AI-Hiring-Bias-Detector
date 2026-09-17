import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, ShieldCheck, Clock, Download, ArrowUpRight } from 'lucide-react';
import { analyticsAPI } from '../../lib/api';

export default function Analytics() {
  const [data, setData] = useState({
    totalApplications: 412,
    assessmentsCompleted: 340,
    shortlisted: 68,
    hired: 14,
    avgNeutralityScore: 94.2,
    avgTimeToHireDays: 16.5,
    funnel: [
      { step: 'Applications Received', count: 412, pct: '100%' },
      { step: 'Assessment Completed', count: 340, pct: '82.5%' },
      { step: 'Blind Review Shortlist', count: 68, pct: '16.5%' },
      { step: 'Technical Panel', count: 32, pct: '7.8%' },
      { step: 'Offer Extended & Hired', count: 14, pct: '3.4%' }
    ],
    biasReductionByDept: [
      { dept: 'Engineering', preBias: 62, postBias: 96 },
      { dept: 'Product & Design', preBias: 58, postBias: 94 },
      { dept: 'Data & Analytics', preBias: 71, postBias: 98 },
      { dept: 'Operations', preBias: 65, postBias: 91 }
    ]
  });

  const handleExportReport = () => {
    const report = {
      title: 'FairHire AI Hiring-Health & Algorithmic Parity Report',
      generatedAt: new Date().toISOString(),
      funnelSummary: data.funnel,
      deptNeutralityMetrics: data.biasReductionByDept,
      kpis: {
        avgNeutralityScore: `${data.avgNeutralityScore}/100`,
        avgTimeToHireDays: `${data.avgTimeToHireDays} days`
      }
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fairhire_analytics_report_${Date.now()}.json`;
    link.click();
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-emerald-600" />
            Recruiter Analytics & Algorithmic Parity
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Funnel health, time-to-hire benchmarks, and systemic bias reduction measurements.
          </p>
        </div>
        <button
          onClick={handleExportReport}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition shrink-0 shadow-xs cursor-pointer"
        >
          <Download className="w-4 h-4" /> Download Hiring-Health Report
        </button>
      </div>

      {/* Top Stat KPI Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="text-xs text-slate-500 uppercase font-semibold">Average JD Neutrality</div>
          <div className="text-2xl font-bold text-emerald-700 mt-1 flex items-center gap-2">
            {data.avgNeutralityScore} <span className="text-xs text-slate-400 font-normal">/ 100</span>
          </div>
          <div className="text-[11px] text-emerald-700 flex items-center gap-1 mt-2">
            <TrendingUp className="w-3 h-3" /> +28% vs un-scanned benchmark
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="text-xs text-slate-500 uppercase font-semibold">Average Time-to-Hire</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {data.avgTimeToHireDays} <span className="text-xs text-slate-400 font-normal">days</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            Deterministic tests eliminate manual screening
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="text-xs text-slate-500 uppercase font-semibold">Completed Assessments</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{data.assessmentsCompleted}</div>
          <div className="text-[11px] text-emerald-700 mt-2">
            82.5% candidate completion rate
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="text-xs text-slate-500 uppercase font-semibold">Demographic Parity Rate</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">99.4%</div>
          <div className="text-[11px] text-slate-500 mt-2">
            Zero demographic signal leakage
          </div>
        </div>
      </div>

      {/* Recruitment Funnel Visual */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Users className="w-4 h-4 text-emerald-600" /> End-to-End Blind Evaluation Funnel
        </h2>
        <div className="space-y-3">
          {data.funnel.map((step, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-xs text-slate-700 font-semibold">
                <span>{step.step}</span>
                <span>{step.count} candidates ({step.pct})</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
                <div
                  className="bg-emerald-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: step.pct }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bias Reduction by Department */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" /> Bias Reduction by Department
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {data.biasReductionByDept.map((d, i) => (
            <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between font-bold text-slate-900 text-sm">
                <span>{d.dept}</span>
                <span className="text-emerald-700">{d.postBias}/100 Neutral</span>
              </div>
              <div className="flex items-center gap-3 text-slate-500">
                <span>Raw Draft: {d.preBias}%</span>
                <span className="text-emerald-700 font-semibold">➔ Post-Scan: {d.postBias}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${d.postBias}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
