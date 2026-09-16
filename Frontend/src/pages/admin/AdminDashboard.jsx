import { useState, useEffect } from 'react';
import { ShieldCheck, Check, X, Building2, Mail, Users, RefreshCw } from 'lucide-react';
import axios from 'axios';

export default function AdminDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('fh_token');
      const res = await axios.get(`${apiUrl}/api/admin/recruiter-requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(res.data.requests || []);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleDecision = async (id, decision) => {
    setActionLoading(id);
    setError('');
    setSuccessMsg('');
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('fh_token');
      await axios.post(
        `${apiUrl}/api/admin/recruiter-requests/${id}/decision`,
        { decision },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccessMsg(`Request successfully ${decision === 'approved' ? 'approved and invite sent' : 'rejected'}.`);
      await fetchRequests();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to update decision.');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div style={{ minHeight: '100vh', padding: '40px 24px', background: 'var(--color-bg)' }}>
      <div className="container" style={{ maxWidth: 1000 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <div className="badge badge-primary" style={{ marginBottom: 8, fontSize: 11 }}>
              🔐 Internal Administration
            </div>
            <h1 style={{ fontSize: '1.75rem', margin: 0 }}>Employer Access Review Queue</h1>
            <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginTop: 4 }}>
              Vet and approve enterprise organizations requesting recruiter access.
            </p>
          </div>
          <button onClick={fetchRequests} className="btn btn-ghost btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div>}
        {successMsg && <div className="alert alert-success" style={{ marginBottom: 20 }}>{successMsg}</div>}

        {/* Requests Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', background: 'var(--color-surface)' }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center' }}>
              <div className="spinner" style={{ margin: '0 auto' }} />
            </div>
          ) : requests.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-secondary)' }}>
              No employer access requests currently in the queue.
            </div>
          ) : (
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left', color: 'var(--color-text-muted)' }}>
                  <th style={{ padding: '16px 20px' }}>Company</th>
                  <th style={{ padding: '16px 20px' }}>Work Email</th>
                  <th style={{ padding: '16px 20px' }}>Size</th>
                  <th style={{ padding: '16px 20px' }}>Status</th>
                  <th style={{ padding: '16px 20px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Building2 size={16} style={{ color: 'var(--color-primary)' }} />
                        {r.companyName}
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px', color: 'var(--color-text-secondary)' }}>
                      {r.workEmail}
                    </td>
                    <td style={{ padding: '16px 20px', color: 'var(--color-text-secondary)' }}>
                      {r.companySize} employees
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span className={`badge ${
                        r.status === 'approved' ? 'badge-success' : r.status === 'rejected' ? 'badge-danger' : 'badge-warning'
                      }`}>
                        {r.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      {r.status === 'pending' ? (
                        <div style={{ display: 'inline-flex', gap: 8 }}>
                          <button
                            onClick={() => handleDecision(r.id, 'approved')}
                            disabled={actionLoading === r.id}
                            className="btn btn-primary btn-sm"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', fontSize: 12 }}
                          >
                            <Check size={14} /> Approve & Invite
                          </button>
                          <button
                            onClick={() => handleDecision(r.id, 'rejected')}
                            disabled={actionLoading === r.id}
                            className="btn btn-ghost btn-sm"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', fontSize: 12, color: 'var(--color-danger)' }}
                          >
                            <X size={14} /> Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Decision Recorded</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
