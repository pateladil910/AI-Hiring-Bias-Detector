import { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Check,
  X,
  Building2,
  Mail,
  Users,
  RefreshCw,
  Briefcase,
  Layers,
  Award,
  Activity,
  AlertTriangle,
  UserPlus,
  Send,
  Lock,
  Search,
  CheckCircle2,
  XCircle,
  FileText,
  Sliders,
  Server,
  Zap,
} from 'lucide-react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('requests'); // requests | users | jobs | audit | system
  const [metrics, setMetrics] = useState(null);
  const [systemHealth, setSystemHealth] = useState(null);

  // Tab 1: Requests
  const [requests, setRequests] = useState([]);
  const [requestLoading, setRequestLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  // Tab 2: Users
  const [users, setUsers] = useState([]);
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userSearch, setUserSearch] = useState('');
  const [showProvisionModal, setShowProvisionModal] = useState(false);
  const [provisionForm, setProvisionForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'recruiter',
    password: 'Password@123',
  });

  // Tab 3: Jobs
  const [jobs, setJobs] = useState([]);
  const [jobLoading, setJobLoading] = useState(false);

  // Tab 4: Audit
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);

  // Broadcast Modal
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({ title: '', message: '', type: 'system' });

  const [globalMessage, setGlobalMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchMetrics();
    fetchRequests();
  }, []);

  const getHeaders = () => {
    const token = localStorage.getItem('token') || localStorage.getItem('fairhire_token');
    return { Authorization: `Bearer ${token}` };
  };

  const fetchMetrics = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/admin/metrics`, { headers: getHeaders() });
      setMetrics(res.data.metrics);
      setSystemHealth(res.data.systemHealth);
    } catch (_) {}
  };

  const fetchRequests = async () => {
    setRequestLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/admin/recruiter-requests`, { headers: getHeaders() });
      setRequests(res.data.requests || []);
    } catch (_) {}
    finally {
      setRequestLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/admin/users`, { headers: getHeaders() });
      setUsers(res.data.users || []);
    } catch (_) {}
  };

  const fetchJobs = async () => {
    setJobLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/admin/jobs`, { headers: getHeaders() });
      setJobs(res.data.jobs || []);
    } catch (_) {}
    finally {
      setJobLoading(false);
    }
  };

  const fetchAudit = async () => {
    setAuditLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/admin/audit-logs`, { headers: getHeaders() });
      setAuditLogs(res.data.logs || []);
    } catch (_) {}
    finally {
      setAuditLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'requests') fetchRequests();
    if (tab === 'users') fetchUsers();
    if (tab === 'jobs') fetchJobs();
    if (tab === 'audit') fetchAudit();
  };

  const handleDecision = async (id, decision) => {
    setActionLoading(id);
    try {
      await axios.post(
        `${API_BASE}/api/admin/recruiter-requests/${id}/decision`,
        { decision },
        { headers: getHeaders() }
      );
      setGlobalMessage({
        type: 'success',
        text: `Request successfully ${decision === 'approved' ? 'approved and invite dispatched' : 'rejected'}.`,
      });
      fetchRequests();
      fetchMetrics();
    } catch (err) {
      setGlobalMessage({ type: 'error', text: 'Failed to record decision.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleUserStatus = async (userId) => {
    try {
      const res = await axios.put(`${API_BASE}/api/admin/users/${userId}/status`, {}, { headers: getHeaders() });
      setGlobalMessage({
        type: 'success',
        text: `User account is now ${res.data.isActive ? 'Active' : 'Suspended'}.`,
      });
      fetchUsers();
    } catch (_) {
      setGlobalMessage({ type: 'error', text: 'Could not change user status.' });
    }
  };

  const handleProvisionSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/api/admin/users/provision`, provisionForm, { headers: getHeaders() });
      setGlobalMessage({ type: 'success', text: `Provisioned account for ${provisionForm.email}` });
      setShowProvisionModal(false);
      setProvisionForm({ firstName: '', lastName: '', email: '', role: 'recruiter', password: 'Password@123' });
      fetchUsers();
      fetchMetrics();
    } catch (err) {
      setGlobalMessage({ type: 'error', text: err.response?.data?.error?.message || 'Failed to provision user.' });
    }
  };

  const handleJobStatusChange = async (jobId, newStatus) => {
    try {
      await axios.patch(
        `${API_BASE}/api/admin/jobs/${jobId}/status`,
        { status: newStatus },
        { headers: getHeaders() }
      );
      setGlobalMessage({ type: 'success', text: `Job status updated to ${newStatus}.` });
      fetchJobs();
      fetchMetrics();
    } catch (_) {
      setGlobalMessage({ type: 'error', text: 'Failed to update job status.' });
    }
  };

  const handleBroadcastSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE}/api/admin/broadcast`, broadcastForm, { headers: getHeaders() });
      setGlobalMessage({ type: 'success', text: res.data.message });
      setShowBroadcastModal(false);
      setBroadcastForm({ title: '', message: '', type: 'system' });
    } catch (_) {
      setGlobalMessage({ type: 'error', text: 'Failed to broadcast announcement.' });
    }
  };

  return (
    <div style={{ minHeight: '100vh', padding: '36px 24px', background: 'var(--color-bg)' }}>
      <div className="container" style={{ maxWidth: 1300, margin: '0 auto' }}>
        {/* ── Top Header ──────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  background: 'rgba(239, 68, 68, 0.15)',
                  color: '#f87171',
                  padding: '3px 10px',
                  borderRadius: 9999,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >
                🔐 Super-Admin Console
              </span>
              <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                Algorithmic Neutrality & Governance System
              </span>
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0, color: 'var(--color-text-primary)' }}>
              FairHire Global Administration Portal
            </h1>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => setShowBroadcastModal(true)}
              className="btn btn-outline btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Send size={14} color="#38bdf8" /> Broadcast Notice
            </button>
            <button
              onClick={() => {
                fetchMetrics();
                handleTabChange(activeTab);
              }}
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <RefreshCw size={14} /> Refresh Data
            </button>
          </div>
        </div>

        {/* Global Alert Notification */}
        {globalMessage.text && (
          <div
            style={{
              padding: '12px 18px',
              borderRadius: 12,
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: globalMessage.type === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
              border: globalMessage.type === 'error' ? '1px solid #ef4444' : '1px solid #10b981',
              color: globalMessage.type === 'error' ? '#f87171' : '#34d399',
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {globalMessage.type === 'error' ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
              {globalMessage.text}
            </div>
            <button
              onClick={() => setGlobalMessage({ type: '', text: '' })}
              style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer' }}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* ── Multi-Tier Microservice Health Bar ────────────────────────────── */}
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 14,
            padding: '14px 20px',
            marginBottom: 24,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>
            <Server size={16} color="#10b981" /> Multi-Tier Architecture Health:
          </div>

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--color-text-secondary)' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
              REST API: <strong style={{ color: 'var(--color-text-primary)' }}>Port 5000 (Express)</strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--color-text-secondary)' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: systemHealth?.aiService === 'online' ? '#10b981' : '#facc15' }} />
              AI Service: <strong style={{ color: 'var(--color-text-primary)' }}>Port 8000 (FastAPI)</strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--color-text-secondary)' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
              Database: <strong style={{ color: 'var(--color-text-primary)' }}>SQLite (Sequelize v3)</strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--color-text-secondary)' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
              Real-Time: <strong style={{ color: 'var(--color-text-primary)' }}>ws://localhost:5000</strong>
            </div>
          </div>
        </div>

        {/* ── Metric Cards Grid ─────────────────────────────────────────────── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 16,
            marginBottom: 28,
          }}
        >
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 14, padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#38bdf8', marginBottom: 8 }}>
              <Users size={20} />
              <span style={{ fontSize: 11, fontWeight: 700, background: 'rgba(56, 189, 248, 0.15)', padding: '2px 6px', borderRadius: 4 }}>
                Platform Users
              </span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-text-primary)' }}>
              {metrics?.users?.total ?? 0}
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 4 }}>
              {metrics?.users?.candidates ?? 0} Candidates • {metrics?.users?.recruiters ?? 0} Recruiters
            </div>
          </div>

          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 14, padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981', marginBottom: 8 }}>
              <Briefcase size={20} />
              <span style={{ fontSize: 11, fontWeight: 700, background: 'rgba(16, 185, 129, 0.15)', padding: '2px 6px', borderRadius: 4 }}>
                Audited Roles
              </span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-text-primary)' }}>
              {metrics?.jobs?.published ?? 0}
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 4 }}>
              Avg Bias Score: <strong style={{ color: '#34d399' }}>{metrics?.avgBiasScore ?? '1.8'} / 10</strong>
            </div>
          </div>

          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 14, padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a855f7', marginBottom: 8 }}>
              <Award size={20} />
              <span style={{ fontSize: 11, fontWeight: 700, background: 'rgba(168, 85, 247, 0.15)', padding: '2px 6px', borderRadius: 4 }}>
                Aptitude Tests
              </span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-text-primary)' }}>
              {metrics?.testsCompleted ?? 0}
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 4 }}>
              Automated VM Sandboxed Benchmarks
            </div>
          </div>

          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 14, padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f59e0b', marginBottom: 8 }}>
              <Building2 size={20} />
              <span style={{ fontSize: 11, fontWeight: 700, background: 'rgba(245, 158, 11, 0.15)', padding: '2px 6px', borderRadius: 4 }}>
                Employer Queue
              </span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-text-primary)' }}>
              {requests.filter((r) => r.status === 'pending').length}
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 4 }}>
              Awaiting Enterprise Access Review
            </div>
          </div>
        </div>

        {/* ── Navigation Tabs ──────────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid var(--color-border)', marginBottom: 24, overflowX: 'auto' }}>
          {[
            { id: 'requests', label: 'Employer Access Queue', icon: <Building2 size={16} /> },
            { id: 'users', label: 'User Directory & Provisioning', icon: <Users size={16} /> },
            { id: 'jobs', label: 'Job Postings Oversight', icon: <Briefcase size={16} /> },
            { id: 'audit', label: 'Security & Fairness Audit Logs', icon: <FileText size={16} /> },
            { id: 'system', label: 'System Configuration', icon: <Sliders size={16} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 18px',
                border: 'none',
                background: 'transparent',
                color: activeTab === tab.id ? '#fff' : 'var(--color-text-secondary)',
                borderBottom: activeTab === tab.id ? '2px solid #10b981' : '2px solid transparent',
                fontWeight: activeTab === tab.id ? 700 : 500,
                fontSize: 14,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 150ms ease',
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── TAB 1: Employer Access Queue ──────────────────────────────────── */}
        {activeTab === 'requests' && (
          <div className="card" style={{ padding: 0, overflow: 'hidden', background: 'var(--color-surface)', borderRadius: 16 }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: '0 0 4px', fontSize: 17, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  Enterprise Recruiter Access Requests
                </h3>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-secondary)' }}>
                  Approve vetted corporate entities to post jobs and review blind candidate pools.
                </p>
              </div>
            </div>

            {requestLoading ? (
              <div style={{ padding: 60, textAlign: 'center' }}>
                <div className="spinner" style={{ margin: '0 auto 12px' }} />
                <div style={{ color: 'var(--color-text-secondary)' }}>Loading access requests...</div>
              </div>
            ) : requests.length === 0 ? (
              <div style={{ padding: 48, textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                No employer access requests in queue.
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left', color: 'var(--color-text-muted)', background: 'rgba(255,255,255,0.01)' }}>
                    <th style={{ padding: '16px 20px' }}>Company</th>
                    <th style={{ padding: '16px 20px' }}>Work Email</th>
                    <th style={{ padding: '16px 20px' }}>Organization Size</th>
                    <th style={{ padding: '16px 20px' }}>Status</th>
                    <th style={{ padding: '16px 20px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((r) => (
                    <tr key={r.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Building2 size={16} color="#10b981" />
                          {r.companyName}
                        </div>
                      </td>
                      <td style={{ padding: '16px 20px', color: 'var(--color-text-secondary)' }}>
                        {r.workEmail}
                      </td>
                      <td style={{ padding: '16px 20px', color: 'var(--color-text-secondary)' }}>
                        {r.companySize}
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: 6,
                            background:
                              r.status === 'approved'
                                ? 'rgba(16, 185, 129, 0.15)'
                                : r.status === 'rejected'
                                ? 'rgba(239, 68, 68, 0.15)'
                                : 'rgba(234, 179, 8, 0.15)',
                            color:
                              r.status === 'approved'
                                ? '#34d399'
                                : r.status === 'rejected'
                                ? '#f87171'
                                : '#facc15',
                          }}
                        >
                          {r.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        {r.status === 'pending' ? (
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                            <button
                              onClick={() => handleDecision(r.id, 'approved')}
                              disabled={actionLoading === r.id}
                              className="btn btn-primary btn-sm"
                              style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                            >
                              <Check size={14} /> Approve & Invite
                            </button>
                            <button
                              onClick={() => handleDecision(r.id, 'rejected')}
                              disabled={actionLoading === r.id}
                              className="btn btn-ghost btn-sm"
                              style={{ color: '#f87171', display: 'flex', alignItems: 'center', gap: 4 }}
                            >
                              <X size={14} /> Reject
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                            Reviewed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ── TAB 2: User Directory & Provisioning ─────────────────────────── */}
        {activeTab === 'users' && (
          <div className="card" style={{ padding: 0, overflow: 'hidden', background: 'var(--color-surface)', borderRadius: 16 }}>
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid var(--color-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 16,
              }}
            >
              <div>
                <h3 style={{ margin: '0 0 4px', fontSize: 17, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  Registered Users & Roles
                </h3>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-secondary)' }}>
                  Manage system privileges, view candidate records, or directly provision recruiters.
                </p>
              </div>

              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  style={{
                    background: '#090f0c',
                    border: '1px solid var(--color-border)',
                    borderRadius: 8,
                    padding: '6px 12px',
                    color: 'var(--color-text-primary)',
                    fontSize: 13,
                    outline: 'none',
                  }}
                >
                  <option value="all">All Roles</option>
                  <option value="candidate">Candidates</option>
                  <option value="recruiter">Recruiters</option>
                  <option value="admin">Administrators</option>
                </select>

                <button
                  onClick={() => setShowProvisionModal(true)}
                  className="btn btn-primary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <UserPlus size={14} /> Provision Recruiter
                </button>
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left', color: 'var(--color-text-muted)' }}>
                  <th style={{ padding: '14px 20px' }}>User Name</th>
                  <th style={{ padding: '14px 20px' }}>Email</th>
                  <th style={{ padding: '14px 20px' }}>Role</th>
                  <th style={{ padding: '14px 20px' }}>Status</th>
                  <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users
                  .filter((u) => userRoleFilter === 'all' || u.role === userRoleFilter)
                  .map((u) => (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        {u.firstName} {u.lastName}
                      </td>
                      <td style={{ padding: '14px 20px', color: 'var(--color-text-secondary)' }}>
                        {u.email}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: 6,
                            background:
                              u.role === 'admin'
                                ? 'rgba(239, 68, 68, 0.15)'
                                : u.role === 'recruiter'
                                ? 'rgba(56, 189, 248, 0.15)'
                                : 'rgba(16, 185, 129, 0.15)',
                            color:
                              u.role === 'admin'
                                ? '#f87171'
                                : u.role === 'recruiter'
                                ? '#38bdf8'
                                : '#34d399',
                          }}
                        >
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{ color: u.isActive ? '#34d399' : '#f87171', fontWeight: 600 }}>
                          {u.isActive ? '● Active' : '○ Suspended'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => handleToggleUserStatus(u.id)}
                            className="btn btn-ghost btn-sm"
                            style={{ fontSize: 12 }}
                          >
                            {u.isActive ? 'Suspend' : 'Activate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── TAB 3: Job Postings Oversight ────────────────────────────────── */}
        {activeTab === 'jobs' && (
          <div className="card" style={{ padding: 0, overflow: 'hidden', background: 'var(--color-surface)', borderRadius: 16 }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)' }}>
              <h3 style={{ margin: '0 0 4px', fontSize: 17, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                Platform Job Postings & Bias Compliance
              </h3>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-secondary)' }}>
                Inspect algorithmic bias scores and override job publication states.
              </p>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left', color: 'var(--color-text-muted)' }}>
                  <th style={{ padding: '14px 20px' }}>Job Title</th>
                  <th style={{ padding: '14px 20px' }}>Posted By</th>
                  <th style={{ padding: '14px 20px' }}>Bias Score</th>
                  <th style={{ padding: '14px 20px' }}>Applicants</th>
                  <th style={{ padding: '14px 20px' }}>Status</th>
                  <th style={{ padding: '14px 20px', textAlign: 'right' }}>Override</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((j) => (
                  <tr key={j.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {j.title}
                    </td>
                    <td style={{ padding: '14px 20px', color: 'var(--color-text-secondary)' }}>
                      {j.creator}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ color: '#34d399', fontWeight: 700 }}>
                        {j.biasScore !== null ? `${j.biasScore}/10` : 'Scanned'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', color: 'var(--color-text-secondary)' }}>
                      {j.applicationsCount}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 6,
                          background: j.status === 'published' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.05)',
                          color: j.status === 'published' ? '#34d399' : 'var(--color-text-muted)',
                        }}
                      >
                        {j.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      {j.status === 'published' ? (
                        <button
                          onClick={() => handleJobStatusChange(j.id, 'closed')}
                          className="btn btn-ghost btn-sm"
                          style={{ fontSize: 12, color: '#f87171' }}
                        >
                          Close Role
                        </button>
                      ) : (
                        <button
                          onClick={() => handleJobStatusChange(j.id, 'published')}
                          className="btn btn-ghost btn-sm"
                          style={{ fontSize: 12, color: '#34d399' }}
                        >
                          Publish Role
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── TAB 4: Platform Audit Logs ───────────────────────────────────── */}
        {activeTab === 'audit' && (
          <div className="card" style={{ padding: 0, overflow: 'hidden', background: 'var(--color-surface)', borderRadius: 16 }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)' }}>
              <h3 style={{ margin: '0 0 4px', fontSize: 17, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                Algorithmic Traceability & Security Audit Trail
              </h3>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-secondary)' }}>
                Immutable event stream recording PII anonymizations, test completions, and administrative overrides.
              </p>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left', color: 'var(--color-text-muted)' }}>
                  <th style={{ padding: '14px 20px' }}>Action Event</th>
                  <th style={{ padding: '14px 20px' }}>Entity Type</th>
                  <th style={{ padding: '14px 20px' }}>Audit Reason / Description</th>
                  <th style={{ padding: '14px 20px', textAlign: 'right' }}>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((l) => (
                  <tr key={l.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '14px 20px', fontWeight: 600, color: '#38bdf8', fontFamily: 'monospace' }}>
                      {l.action}
                    </td>
                    <td style={{ padding: '14px 20px', color: 'var(--color-text-secondary)' }}>
                      {l.entityType}
                    </td>
                    <td style={{ padding: '14px 20px', color: '#cbd5e1' }}>
                      {l.reason || 'Recorded system action'}
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'right', color: 'var(--color-text-muted)', fontSize: 12 }}>
                      {new Date(l.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── TAB 5: System Configuration ──────────────────────────────────── */}
        {activeTab === 'system' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>
            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 16, padding: 24 }}>
              <h3 style={{ margin: '0 0 16px', fontSize: 17, fontWeight: 700, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Zap size={18} color="#10b981" /> Sandbox Runner Parameters
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: 13 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Execution Engine:</span>
                  <strong style={{ color: 'var(--color-text-primary)' }}>Node.js Built-in VM Sandbox</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Max Script Execution Timeout:</span>
                  <strong style={{ color: '#34d399' }}>3000 ms</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Network & File System Access:</span>
                  <strong style={{ color: '#f87171' }}>Strictly Restricted (Isolated)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Scoring Model Version:</span>
                  <strong style={{ color: 'var(--color-text-primary)' }}>EquiHire Weighted Rubric v3.0</strong>
                </div>
              </div>
            </div>

            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 16, padding: 24 }}>
              <h3 style={{ margin: '0 0 16px', fontSize: 17, fontWeight: 700, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldCheck size={18} color="#38bdf8" /> AI Fairness Models
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: 13 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>FastAPI AI Service:</span>
                  <strong style={{ color: '#38bdf8' }}>http://localhost:8000</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Demographic Redaction Engine:</span>
                  <strong style={{ color: 'var(--color-text-primary)' }}>Regex + SpaCy NER Lexicon</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>EEOC 80% Adverse Impact Rule:</span>
                  <strong style={{ color: '#10b981' }}>Active in Test Grading</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Candidate Anonymization:</span>
                  <strong style={{ color: '#10b981' }}>Deterministic Hex Cloaking</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Provision Recruiter Modal ────────────────────────────────────── */}
        {showProvisionModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 24 }}>
            <div style={{ background: '#ffffff', border: '1px solid var(--color-border)', borderRadius: 16, maxWidth: 480, width: '100%', padding: 28, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)', margin: '0 0 6px' }}>
                Provision Enterprise Account
              </h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: 13, margin: '0 0 20px' }}>
                Directly create a pre-verified recruiter or compliance auditor account.
              </p>

              <form onSubmit={handleProvisionSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 4 }}>First Name</label>
                    <input
                      type="text"
                      required
                      value={provisionForm.firstName}
                      onChange={(e) => setProvisionForm({ ...provisionForm, firstName: e.target.value })}
                      style={{ width: '100%', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 8, padding: '8px 12px', color: 'var(--color-text-primary)', fontSize: 13 }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 4 }}>Last Name</label>
                    <input
                      type="text"
                      required
                      value={provisionForm.lastName}
                      onChange={(e) => setProvisionForm({ ...provisionForm, lastName: e.target.value })}
                      style={{ width: '100%', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 8, padding: '8px 12px', color: 'var(--color-text-primary)', fontSize: 13 }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 4 }}>Email Address</label>
                  <input
                    type="email"
                    required
                    value={provisionForm.email}
                    onChange={(e) => setProvisionForm({ ...provisionForm, email: e.target.value })}
                    style={{ width: '100%', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 8, padding: '8px 12px', color: 'var(--color-text-primary)', fontSize: 13 }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 4 }}>Account Role</label>
                    <select
                      value={provisionForm.role}
                      onChange={(e) => setProvisionForm({ ...provisionForm, role: e.target.value })}
                      style={{ width: '100%', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 8, padding: '8px 12px', color: 'var(--color-text-primary)', fontSize: 13 }}
                    >
                      <option value="recruiter">Recruiter</option>
                      <option value="hr_lead">HR Lead</option>
                      <option value="compliance">Compliance Auditor</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 4 }}>Initial Password</label>
                    <input
                      type="text"
                      value={provisionForm.password}
                      onChange={(e) => setProvisionForm({ ...provisionForm, password: e.target.value })}
                      style={{ width: '100%', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 8, padding: '8px 12px', color: 'var(--color-text-primary)', fontSize: 13 }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  <button type="button" onClick={() => setShowProvisionModal(false)} className="btn btn-ghost btn-sm">Cancel</button>
                  <button type="submit" className="btn btn-primary btn-sm">Provision User</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── Broadcast Notice Modal ───────────────────────────────────────── */}
        {showBroadcastModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 24 }}>
            <div style={{ background: '#ffffff', border: '1px solid var(--color-border)', borderRadius: 16, maxWidth: 480, width: '100%', padding: 28, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)', margin: '0 0 6px' }}>
                Broadcast System Announcement
              </h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: 13, margin: '0 0 20px' }}>
                Send a high-priority notification to all registered candidates and recruiters.
              </p>

              <form onSubmit={handleBroadcastSubmit}>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 4 }}>Notice Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., FairHire AI 3.0.0 Algorithmic Update"
                    value={broadcastForm.title}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                    style={{ width: '100%', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 8, padding: '8px 12px', color: 'var(--color-text-primary)', fontSize: 13 }}
                  />
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 4 }}>Message Content</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe maintenance window, model updates, or compliance instructions..."
                    value={broadcastForm.message}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                    style={{ width: '100%', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 8, padding: '8px 12px', color: 'var(--color-text-primary)', fontSize: 13, resize: 'none' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  <button type="button" onClick={() => setShowBroadcastModal(false)} className="btn btn-ghost btn-sm">Cancel</button>
                  <button type="submit" className="btn btn-primary btn-sm">Broadcast Notice</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
