import { useState, useEffect, useCallback } from 'react';
import {
  ClipboardList,
  Download,
  Search,
  Filter,
  RefreshCw,
  Eye,
  ShieldCheck,
  AlertTriangle,
  FileText,
  User,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { auditAPI } from '../../lib/api';

const ACTION_CONFIG = {
  ELIGIBILITY_OVERRIDDEN: { label: 'Verdict Overridden', badge: 'badge-warning', icon: '⚠️' },
  ELIGIBILITY_COMPUTED:   { label: 'Verdict Computed',   badge: 'badge-success', icon: '🤖' },
  TEST_SUBMITTED:         { label: 'Test Submitted',     badge: 'badge-primary', icon: '📝' },
  TEST_GENERATED:         { label: 'Test Generated',     badge: 'badge-primary', icon: '⚙️' },
  JOB_PUBLISHED:          { label: 'Job Published',      badge: 'badge-success', icon: '📢' },
  JOB_UNPUBLISHED:        { label: 'Job Unpublished',    badge: 'badge-neutral', icon: '🔒' },
  JD_ANALYZED:            { label: 'Bias Scanned',       badge: 'badge-primary', icon: '🛡️' },
  JD_CREATED:             { label: 'Job Created',        badge: 'badge-neutral', icon: '📄' },
};

function AuditDetailModal({ log, onClose }) {
  if (!log) return null;
  const cfg = ACTION_CONFIG[log.action] || { label: log.action, badge: 'badge-neutral', icon: '📋' };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    }}>
      <div className="card" style={{ width: 560, maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: 0 }}>
        {/* Header */}
        <div style={{
          padding: '16px 24px', borderBottom: '1px solid var(--color-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'var(--color-surface-alt)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 18 }}>{cfg.icon}</span>
            <div>
              <h3 style={{ margin: 0, fontSize: 15 }}>Audit Event Details</h3>
              <span className={`badge ${cfg.badge}`} style={{ fontSize: 10, marginTop: 2 }}>{cfg.label}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: 4 }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: 24, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Metadata Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 13 }}>
            <div>
              <div style={{ color: 'var(--color-text-muted)', fontSize: 11, textTransform: 'uppercase', marginBottom: 2 }}>Timestamp</div>
              <div style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>
                {new Date(log.createdAt).toLocaleString()}
              </div>
            </div>
            <div>
              <div style={{ color: 'var(--color-text-muted)', fontSize: 11, textTransform: 'uppercase', marginBottom: 2 }}>Performer</div>
              <div style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>
                {log.User ? `${log.User.firstName} ${log.User.lastName} (${log.User.role})` : 'System'}
              </div>
            </div>
            <div>
              <div style={{ color: 'var(--color-text-muted)', fontSize: 11, textTransform: 'uppercase', marginBottom: 2 }}>Entity Type</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{log.entityType}</div>
            </div>
            <div>
              <div style={{ color: 'var(--color-text-muted)', fontSize: 11, textTransform: 'uppercase', marginBottom: 2 }}>Entity ID</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {log.entityId}
              </div>
            </div>
          </div>

          {/* Reason */}
          {log.reason && (
            <div>
              <div style={{ color: 'var(--color-text-muted)', fontSize: 11, textTransform: 'uppercase', marginBottom: 6 }}>
                Recorded Reason / Justification
              </div>
              <div style={{
                background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)', padding: '12px 14px', fontSize: 13, color: 'var(--color-text-primary)', lineHeight: 1.5,
              }}>
                {log.reason}
              </div>
            </div>
          )}

          {/* Payload JSON */}
          <div>
            <div style={{ color: 'var(--color-text-muted)', fontSize: 11, textTransform: 'uppercase', marginBottom: 6 }}>
              Event Payload (Meta JSON)
            </div>
            <pre style={{
              background: 'var(--color-bg)', border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)', padding: 14, fontSize: 12,
              fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)',
              overflowX: 'auto', margin: 0,
            }}>
              {JSON.stringify(log.meta, null, 2)}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 24px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default function AuditTrail() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter states
  const [actionFilter, setActionFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page,
        limit: 15,
        ...(actionFilter && { action: actionFilter }),
        ...(searchQuery.trim() && { search: searchQuery.trim() }),
        ...(fromDate && { from: fromDate }),
        ...(toDate && { to: toDate }),
      };

      const [logsRes, statsRes] = await Promise.all([
        auditAPI.list(params),
        auditAPI.stats().catch(() => ({ data: null })),
      ]);

      setLogs(logsRes.data.logs || []);
      setTotal(logsRes.data.total || 0);
      setTotalPages(logsRes.data.totalPages || 1);
      if (statsRes.data) setStats(statsRes.data);
    } catch (e) {
      setError(e.response?.data?.error?.message || 'Failed to fetch audit records.');
    } finally {
      setLoading(false);
    }
  }, [page, actionFilter, searchQuery, fromDate, toDate]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleDownloadCSV = () => {
    const params = {
      ...(actionFilter && { action: actionFilter }),
      ...(fromDate && { from: fromDate }),
      ...(toDate && { to: toDate }),
    };
    const url = auditAPI.downloadCSV(params);
    window.open(url, '_blank');
  };

  const handleResetFilters = () => {
    setActionFilter('');
    setSearchQuery('');
    setFromDate('');
    setToDate('');
    setPage(1);
  };

  return (
    <div className="page">
      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="page-title">Compliance Audit Trail</h1>
          <p className="page-subtitle">
            Complete, immutable log of all hiring decisions, AI verdicts, test generations, and human overrides.
          </p>
        </div>
        <button
          id="export-audit-csv-btn"
          className="btn btn-primary btn-sm"
          onClick={handleDownloadCSV}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* ── Stats Row ────────────────────────────────────────────────────── */}
      {stats && (
        <div className="grid-4" style={{ marginBottom: 24 }}>
          <div className="stat-card">
            <div className="stat-value" style={{ color: 'var(--color-primary)' }}>{stats.totalLogs}</div>
            <div className="stat-label">Total Logged Events</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: 'var(--color-warning)' }}>{stats.overridesCount}</div>
            <div className="stat-label">Human Overrides</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: 'var(--color-success)' }}>{stats.verdictsCount}</div>
            <div className="stat-label">AI Decisions Computed</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: 'var(--color-accent)' }}>{stats.testsCount}</div>
            <div className="stat-label">Assessments Handled</div>
          </div>
        </div>
      )}

      {/* ── Filter Bar ───────────────────────────────────────────────────── */}
      <div className="card" style={{ padding: 16, marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search */}
          <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
            <input
              id="audit-search-input"
              type="text"
              className="form-input"
              placeholder="Search by action, reason, user…"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              style={{ width: '100%', paddingLeft: 34, height: 38 }}
            />
            <Search size={15} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--color-text-muted)' }} />
          </div>

          {/* Action Filter */}
          <div style={{ width: 190 }}>
            <select
              id="audit-action-select"
              className="form-select"
              value={actionFilter}
              onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
              style={{ width: '100%', height: 38 }}
            >
              <option value="">All Action Types</option>
              <option value="ELIGIBILITY_OVERRIDDEN">⚠️ Overrides</option>
              <option value="ELIGIBILITY_COMPUTED">🤖 Verdicts Computed</option>
              <option value="TEST_SUBMITTED">📝 Test Submissions</option>
              <option value="TEST_GENERATED">⚙️ Tests Generated</option>
              <option value="JOB_PUBLISHED">📢 Jobs Published</option>
              <option value="JOB_UNPUBLISHED">🔒 Jobs Unpublished</option>
              <option value="JD_ANALYZED">🛡️ Bias Scans</option>
            </select>
          </div>

          {/* Date from */}
          <div style={{ width: 140 }}>
            <input
              type="date"
              className="form-input"
              value={fromDate}
              onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
              style={{ width: '100%', height: 38, fontSize: 12 }}
              title="From date"
            />
          </div>

          {/* Date to */}
          <div style={{ width: 140 }}>
            <input
              type="date"
              className="form-input"
              value={toDate}
              onChange={(e) => { setToDate(e.target.value); setPage(1); }}
              style={{ width: '100%', height: 38, fontSize: 12 }}
              title="To date"
            />
          </div>

          {/* Refresh / Reset */}
          <button
            className="btn btn-ghost btn-sm"
            onClick={handleResetFilters}
            title="Reset filters"
            style={{ height: 38, padding: '0 12px' }}
          >
            Reset
          </button>
          <button
            className="btn btn-ghost btn-sm"
            onClick={fetchLogs}
            title="Refresh logs"
            style={{ height: 38, padding: '0 12px' }}
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

      {/* ── Table ────────────────────────────────────────────────────────── */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 20 }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--color-surface-alt)', borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ padding: '12px 18px', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Timestamp</th>
                <th style={{ padding: '12px 18px', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Action</th>
                <th style={{ padding: '12px 18px', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Performer</th>
                <th style={{ padding: '12px 18px', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Reason / Summary</th>
                <th style={{ padding: '12px 18px', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'right' }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ padding: 40, textAlign: 'center' }}>
                    <span className="spinner" style={{ width: 24, height: 24, margin: '0 auto 8px' }} />
                    <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>Loading audit records…</p>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: 48, textAlign: 'center' }}>
                    <ClipboardList size={32} style={{ color: 'var(--color-border)', margin: '0 auto 12px' }} />
                    <h4 style={{ margin: '0 0 4px' }}>No audit events found</h4>
                    <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-muted)' }}>Try adjusting your filters or search query.</p>
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const cfg = ACTION_CONFIG[log.action] || { label: log.action, badge: 'badge-neutral', icon: '📋' };
                  return (
                    <tr key={log.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      {/* Timestamp */}
                      <td style={{ padding: '12px 18px', whiteSpace: 'nowrap', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                        {new Date(log.createdAt).toLocaleString()}
                      </td>

                      {/* Action */}
                      <td style={{ padding: '12px 18px', whiteSpace: 'nowrap' }}>
                        <span className={`badge ${cfg.badge}`} style={{ fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <span>{cfg.icon}</span> {cfg.label}
                        </span>
                      </td>

                      {/* Performer */}
                      <td style={{ padding: '12px 18px', whiteSpace: 'nowrap' }}>
                        {log.User ? (
                          <div>
                            <div style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>
                              {log.User.firstName} {log.User.lastName}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{log.User.role}</div>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>System</span>
                        )}
                      </td>

                      {/* Reason */}
                      <td style={{ padding: '12px 18px', maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--color-text-primary)' }}>
                        {log.reason || '—'}
                      </td>

                      {/* Inspect Button */}
                      <td style={{ padding: '12px 18px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => setSelectedLog(log)}
                          style={{ padding: '4px 8px', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                        >
                          <Eye size={13} /> View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ─────────────────────────────────────────────────── */}
        {!loading && totalPages > 1 && (
          <div style={{
            padding: '12px 20px', borderTop: '1px solid var(--color-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12,
          }}>
            <span style={{ color: 'var(--color-text-muted)' }}>
              Showing {logs.length} of {total} events
            </span>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <button
                className="btn btn-ghost btn-sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                style={{ padding: '4px 8px' }}
              >
                <ChevronLeft size={14} /> Previous
              </button>
              <span style={{ padding: '0 8px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                Page {page} of {totalPages}
              </span>
              <button
                className="btn btn-ghost btn-sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                style={{ padding: '4px 8px' }}
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedLog && (
        <AuditDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />
      )}
    </div>
  );
}
