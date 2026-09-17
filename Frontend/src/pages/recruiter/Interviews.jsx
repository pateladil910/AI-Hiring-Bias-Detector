import { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Plus, Download, CheckCircle2, AlertCircle, Video } from 'lucide-react';
import { interviewsAPI } from '../../lib/api';

export default function Interviews() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // New interview form state
  const [candRef, setCandRef] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [slotDate, setSlotDate] = useState('');
  const [panellists, setPanellists] = useState('Senior Technical Evaluator, Engineering Lead');

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const res = await interviewsAPI.list();
      setInterviews(res.data.interviews || []);
    } catch (e) {
      console.warn('Using default interviews mock');
      setInterviews([
        {
          id: 'int-1',
          candidateRef: 'CAND-7A39',
          jobTitle: 'Senior Full Stack Engineer',
          status: 'confirmed',
          selectedSlot: '2026-09-20T14:00:00Z',
          format: 'Blind Technical Panel',
          panellists: ['Evaluator A', 'Evaluator B']
        },
        {
          id: 'int-2',
          candidateRef: 'CAND-9B12',
          jobTitle: 'AI Research Lead',
          status: 'pending_confirmation',
          selectedSlot: '2026-09-22T10:00:00Z',
          format: 'Algorithmic Pairing',
          panellists: ['ML Lead']
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSchedule = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        candidateRef: candRef,
        jobTitle,
        slots: [{ id: 's1', time: slotDate, label: new Date(slotDate).toLocaleString() }],
        format: 'Blind Technical Video Assessment',
        panellists: panellists.split(',').map(s => s.trim())
      };
      await interviewsAPI.create(payload);
      setShowModal(false);
      fetchInterviews();
    } catch (err) {
      alert('Failed to schedule interview.');
    }
  };

  const handleExportICS = (intvw) => {
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//FairHire AI//Demographic Neutral Interview//EN
BEGIN:VEVENT
SUMMARY:Technical Evaluation - ${intvw.candidateRef} (${intvw.jobTitle})
DESCRIPTION:Demographic-blind technical evaluation session on FairHire platform.
DTSTART:${intvw.selectedSlot ? new Date(intvw.selectedSlot).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z' : '20260920T140000Z'}
DURATION:PT1H
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `interview_${intvw.candidateRef}.ics`);
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <Calendar className="w-6 h-6 text-emerald-600" />
            Interview Scheduler & Panel Calendar
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Coordinate blind technical evaluations with assigned panellists and generate external calendar invites.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Propose Interview Slots
        </button>
      </div>

      {/* Grid of Interviews */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {interviews.map((item) => (
          <div key={item.id} className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-sm text-emerald-700">{item.candidateRef}</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border capitalize ${
                item.status === 'confirmed'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {item.status.replace('_', ' ')}
              </span>
            </div>

            <div>
              <div className="text-base font-bold text-slate-900">{item.jobTitle}</div>
              <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                <Video className="w-3.5 h-3.5 text-slate-400" /> {item.format}
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5 text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>{item.selectedSlot ? new Date(item.selectedSlot).toLocaleString() : 'Awaiting candidate slot confirmation'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span>Panellists: {Array.isArray(item.panellists) ? item.panellists.join(', ') : item.panellists}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => handleExportICS(item)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-emerald-600 text-xs text-slate-700 flex items-center gap-1.5 transition shadow-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" /> Export .ics Calendar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal to propose slots */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Schedule Candidate Evaluation</h2>
            <form onSubmit={handleSchedule} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 mb-1 font-semibold">Candidate Reference ID</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CAND-8B31"
                  value={candRef}
                  onChange={(e) => setCandRef(e.target.value)}
                  className="w-full rounded-lg bg-white border border-slate-300 px-3 py-2 text-slate-900 focus:border-emerald-600"
                />
              </div>
              <div>
                <label className="block text-slate-700 mb-1 font-semibold">Job Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Frontend Engineer"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full rounded-lg bg-white border border-slate-300 px-3 py-2 text-slate-900 focus:border-emerald-600"
                />
              </div>
              <div>
                <label className="block text-slate-700 mb-1 font-semibold">Proposed Slot Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={slotDate}
                  onChange={(e) => setSlotDate(e.target.value)}
                  className="w-full rounded-lg bg-white border border-slate-300 px-3 py-2 text-slate-900 focus:border-emerald-600"
                />
              </div>
              <div>
                <label className="block text-slate-700 mb-1 font-semibold">Assigned Panellists</label>
                <input
                  type="text"
                  value={panellists}
                  onChange={(e) => setPanellists(e.target.value)}
                  className="w-full rounded-lg bg-white border border-slate-300 px-3 py-2 text-slate-900 focus:border-emerald-600"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg cursor-pointer shadow-xs"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
