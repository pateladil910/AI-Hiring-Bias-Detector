import { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Video,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  ExternalLink,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function CandidateInterviews() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState('');
  const [rescheduleModal, setRescheduleModal] = useState(null); // interview id or null
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('fairhire_token');
      const res = await axios.get(`${API_BASE}/api/interviews/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInterviews(res.data.interviews || []);
    } catch (err) {
      console.error('Failed to fetch interviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (id) => {
    setSubmittingAction(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('fairhire_token');
      await axios.post(
        `${API_BASE}/api/interviews/${id}/confirm`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setActionSuccess('Interview attendance confirmed! Meeting details sent to panel.');
      fetchInterviews();
    } catch (err) {
      console.error('Confirm error:', err);
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!rescheduleModal) return;

    setSubmittingAction(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('fairhire_token');
      await axios.post(
        `${API_BASE}/api/interviews/${rescheduleModal}/reschedule`,
        { reason: rescheduleReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setActionSuccess('Reschedule request sent to recruiting panel.');
      setRescheduleModal(null);
      setRescheduleReason('');
      fetchInterviews();
    } catch (err) {
      console.error('Reschedule error:', err);
    } finally {
      setSubmittingAction(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 1000, margin: '0 auto', padding: '36px 24px' }}>
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 32 }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(56, 189, 248, 0.15)',
            color: '#38bdf8',
            padding: '4px 12px',
            borderRadius: 9999,
            fontSize: 12,
            fontWeight: 700,
            marginBottom: 12,
          }}
        >
          <Calendar size={14} /> Candidate Interview Hub
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 8px', color: '#fff' }}>
          Scheduled Technical Interviews
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 15, margin: 0 }}>
          Hiring panels conduct blind technical discussions focusing solely on architecture, problem solving, and past projects.
        </p>
      </div>

      {actionSuccess && (
        <div
          style={{
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid #10b981',
            borderRadius: 12,
            padding: '14px 18px',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            color: '#34d399',
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          <CheckCircle2 size={18} />
          {actionSuccess}
        </div>
      )}

      {/* ── Interviews List ───────────────────────────────────────────────── */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div className="spinner" style={{ margin: '0 auto 16px' }} />
          <div style={{ color: 'var(--color-text-secondary)' }}>Loading scheduled interviews...</div>
        </div>
      ) : interviews.length === 0 ? (
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 16,
            padding: 48,
            textAlign: 'center',
          }}
        >
          <Calendar size={48} color="var(--color-text-muted)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ color: '#fff', fontSize: 18, marginBottom: 8 }}>No Upcoming Interviews</h3>
          <p style={{ color: 'var(--color-text-secondary)', maxWidth: 460, margin: '0 auto' }}>
            When a hiring team advances your anonymized profile to the interview stage, you will see your meeting slots and video links here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {interviews.map((item) => {
            const isConfirmed = item.status === 'confirmed';
            const isReschedule = item.status === 'reschedule_requested';

            return (
              <div
                key={item.id}
                style={{
                  background: 'var(--color-surface)',
                  border: isConfirmed ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--color-border)',
                  borderRadius: 16,
                  padding: 28,
                  position: 'relative',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 16 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <h3 style={{ margin: 0, fontSize: 19, fontWeight: 700, color: '#fff' }}>
                        {item.jobTitle}
                      </h3>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: 6,
                          background: isConfirmed
                            ? 'rgba(16, 185, 129, 0.15)'
                            : isReschedule
                            ? 'rgba(234, 179, 8, 0.15)'
                            : 'rgba(56, 189, 248, 0.15)',
                          color: isConfirmed ? '#34d399' : isReschedule ? '#facc15' : '#38bdf8',
                        }}
                      >
                        {isConfirmed ? 'Attendance Confirmed' : isReschedule ? 'Reschedule Requested' : 'Action Required'}
                      </span>
                    </div>

                    <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                      Organization: <strong style={{ color: '#fff' }}>{item.companyName}</strong>
                    </div>
                  </div>

                  <a
                    href={item.meetingLink || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-outline btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <Video size={14} color="#10b981" /> Open Video Room <ExternalLink size={12} />
                  </a>
                </div>

                {/* Date & Time Grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: 14,
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 20,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                      Scheduled Date & Time
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Calendar size={14} color="#10b981" />
                      {new Date(item.scheduledAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                      Expected Duration
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Clock size={14} color="#38bdf8" /> {item.durationMinutes || 45} Minutes
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                      Panel Protocol
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#34d399', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <ShieldCheck size={14} /> Blind Technical Panel
                    </div>
                  </div>
                </div>

                {/* Panellists & Preparation Notes */}
                {item.notes && (
                  <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 20, lineHeight: 1.5 }}>
                    <strong>Preparation Notes:</strong> {item.notes}
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  {!isReschedule && (
                    <button
                      onClick={() => setRescheduleModal(item.id)}
                      className="btn btn-ghost btn-sm"
                      style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      <RotateCcw size={14} /> Request Reschedule
                    </button>
                  )}

                  {!isConfirmed && (
                    <button
                      onClick={() => handleConfirm(item.id)}
                      disabled={submittingAction}
                      className="btn btn-primary btn-sm"
                      style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      <CheckCircle2 size={14} /> Confirm Attendance
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Reschedule Request Modal ──────────────────────────────────────── */}
      {rescheduleModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: 24,
          }}
        >
          <div
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 16,
              maxWidth: 480,
              width: '100%',
              padding: 28,
            }}
          >
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>
              Request Interview Reschedule
            </h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 13, margin: '0 0 18px' }}>
              Please provide a brief reason or your preferred availability. The hiring panel will review and suggest alternate slots.
            </p>

            <form onSubmit={handleRescheduleSubmit}>
              <textarea
                value={rescheduleReason}
                onChange={(e) => setRescheduleReason(e.target.value)}
                placeholder="e.g., Conflict with current exam/work schedule. Available afternoons Thursday or Friday..."
                rows={4}
                required
                style={{
                  width: '100%',
                  background: '#090f0c',
                  border: '1px solid var(--color-border)',
                  borderRadius: 10,
                  padding: 12,
                  color: '#fff',
                  fontSize: 13,
                  outline: 'none',
                  resize: 'none',
                  marginBottom: 18,
                }}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setRescheduleModal(null)}
                  className="btn btn-ghost btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAction}
                  className="btn btn-primary btn-sm"
                >
                  {submittingAction ? 'Sending...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
