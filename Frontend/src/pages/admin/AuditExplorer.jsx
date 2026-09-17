import { useState, useEffect } from 'react';
import { ShieldCheck, Download, Search, Filter, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import { auditAPI } from '../../lib/api';

export default function AuditExplorer() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await auditAPI.list();
      setLogs(res.data.logs || res.data || []);
    } catch (e) {
      // Mock fallback for preview
      setLogs([
        {
          id: 'aud-1',
          action: 'BIAS_SCAN',
          actorRole: 'recruiter',
          targetRecord: 'job-101',
          details: 'JD "Senior Full Stack" analyzed via WebSocket. Score: 94/100',
          timestamp: new Date(Date.now() - 1800000).toISOString()
        },
        {
          id: 'aud-2',
          action: 'REDACTION_APPLIED',
          actorRole: 'system',
          targetRecord: 'CAND-7A39',
          details: 'Redacted 3 emails, 2 phone numbers, and converted pronouns to [THEY/THEM]',
          timestamp: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: 'aud-3',
          action: 'IDENTITY_REVEAL',
          actorRole: 'recruiter',
          targetRecord: 'CAND-9B12',
          details: 'Authorized interview scheduling reveal logged for confirmed slot',
          timestamp: new Date(Date.now() - 7200000).toISOString()
        },
        {
          id: 'aud-4',
          action: 'USER_LOGIN',
          actorRole: 'admin',
          targetRecord: 'user-admin',
          details: 'Super Admin authenticated from 127.0.0.1',
          timestamp: new Date(Date.now() - 14400000).toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," +
      "ID,Action,ActorRole,TargetRecord,Details,Timestamp\n" +
      logs.map(e => `"${e.id}","${e.action}","${e.actorRole}","${e.targetRecord}","${e.details.replace(/"/g, '""')}","${e.timestamp}"`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `fairhire_global_audit_trail_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.action?.toLowerCase().includes(search.toLowerCase()) ||
                          log.details?.toLowerCase().includes(search.toLowerCase()) ||
                          log.targetRecord?.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === 'all' || log.action?.toLowerCase().includes(categoryFilter.toLowerCase());
    return matchesSearch && matchesCat;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
              <ShieldCheck className="w-7 h-7 text-emerald-400" />
              Global Audit Explorer & Legal Hold
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Cross-tenant immutable activity ledger for regulatory compliance, EEOC audits, and access inspections.
            </p>
          </div>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs transition shrink-0"
          >
            <Download className="w-4 h-4" /> Export CSV for Audit Hold
          </button>
        </div>

        {/* Filter / Search Bar */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by action, record ID, or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg bg-slate-950/60 border border-slate-700 pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
          </div>
          <div className="flex gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-lg bg-slate-950/60 border border-slate-700 px-3 py-2 text-xs text-slate-300 focus:border-emerald-500"
            >
              <option value="all">All Audit Categories</option>
              <option value="bias">Bias Scans</option>
              <option value="redaction">PII Redactions</option>
              <option value="reveal">Identity Reveals</option>
              <option value="login">Authentication</option>
            </select>
          </div>
        </div>

        {/* Log Entries */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-xl shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Event & Action</th>
                  <th className="py-3.5 px-4">Actor</th>
                  <th className="py-3.5 px-4">Target Record</th>
                  <th className="py-3.5 px-4">Audit Details</th>
                  <th className="py-3.5 px-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                      {log.action}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[11px] font-semibold border border-slate-700">
                        {log.actorRole}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">
                      {log.targetRecord || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 max-w-md text-slate-300">
                      {log.details}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
