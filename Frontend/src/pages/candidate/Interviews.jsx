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
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8 font-sans">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200 px-3 py-1 rounded-full mb-3">
          <Calendar size={14} className="text-sky-600" /> Candidate Interview Hub
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
          Scheduled Technical Interviews
        </h1>
        <p className="text-sm text-slate-600 max-w-xl">
          Hiring panels conduct blind technical discussions focusing solely on architecture, problem solving, and past engineering challenges.
        </p>
      </div>

      {actionSuccess && (
        <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs font-semibold mb-6 shadow-xs">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* ── Interviews List ───────────────────────────────────────────────── */}
      {loading ? (
        <div className="text-center py-16 text-slate-500 text-sm">
          Loading scheduled interviews...
        </div>
      ) : interviews.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-xs">
          <Calendar size={42} className="text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 mb-1">No Upcoming Interviews</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            When a hiring team advances your demographic-neutral profile to the interview stage, you will see your meeting slots and video links here.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {interviews.map((item) => {
            const isConfirmed = item.status === 'confirmed';
            const isReschedule = item.status === 'reschedule_requested';

            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl p-6 border shadow-xs transition-all ${
                  isConfirmed ? 'border-emerald-300 ring-1 ring-emerald-200' : 'border-slate-200'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <h3 className="text-base font-bold text-slate-900">
                        {item.jobTitle}
                      </h3>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                          isConfirmed
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : isReschedule
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-sky-50 text-sky-700 border border-sky-200'
                        }`}
                      >
                        {isConfirmed ? 'Attendance Confirmed' : isReschedule ? 'Reschedule Requested' : 'Action Required'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500">
                      Organization: <strong className="text-slate-800">{item.companyName}</strong>
                    </div>
                  </div>

                  <a
                    href={item.meetingLink || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
                  >
                    <Video size={14} className="text-emerald-600" />
                    <span>Open Video Room</span>
                    <ExternalLink size={12} />
                  </a>
                </div>

                {/* Date & Time Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 border border-slate-200/80 rounded-xl p-4 mb-4 text-xs">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Scheduled Date & Time
                    </div>
                    <div className="font-semibold text-slate-800 mt-1 flex items-center gap-1.5">
                      <Calendar size={13} className="text-emerald-600" />
                      <span>{new Date(item.scheduledAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Expected Duration
                    </div>
                    <div className="font-semibold text-slate-800 mt-1 flex items-center gap-1.5">
                      <Clock size={13} className="text-sky-600" />
                      <span>{item.durationMinutes || 45} Minutes</span>
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Panel Protocol
                    </div>
                    <div className="font-semibold text-emerald-700 mt-1 flex items-center gap-1.5">
                      <ShieldCheck size={13} />
                      <span>Demographic-Blind Panel</span>
                    </div>
                  </div>
                </div>

                {/* Preparation Notes */}
                {item.notes && (
                  <div className="text-xs text-slate-600 mb-4 leading-relaxed bg-slate-50/50 p-3 rounded-lg border border-slate-200/60">
                    <strong className="text-slate-800">Preparation Notes:</strong> {item.notes}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                  {!isReschedule && (
                    <button
                      onClick={() => setRescheduleModal(item.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold transition-colors"
                    >
                      <RotateCcw size={13} /> Request Reschedule
                    </button>
                  )}

                  {!isConfirmed && (
                    <button
                      onClick={() => handleConfirm(item.id)}
                      disabled={submittingAction}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shadow-xs"
                    >
                      <CheckCircle2 size={13} /> Confirm Attendance
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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Request Interview Reschedule
            </h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Please provide a brief reason or your preferred availability. The hiring panel will review and suggest alternate slots.
            </p>

            <form onSubmit={handleRescheduleSubmit}>
              <textarea
                value={rescheduleReason}
                onChange={(e) => setRescheduleReason(e.target.value)}
                placeholder="e.g., Conflict with current exam/work schedule. Available afternoons Thursday or Friday..."
                rows={4}
                required
                className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent mb-4 resize-none"
              />

              <div className="flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setRescheduleModal(null)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAction}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shadow-xs"
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
