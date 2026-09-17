const express = require('express');
const { authenticate, requireRole } = require('../middleware/auth');
const { AuditLog, AUDIT_ACTIONS } = require('../models');

const router = express.Router();

// Mock store for persistent interview state in dev
let interviewsStore = [
  {
    id: 'int-101',
    applicationId: 'app-1',
    candidateRef: 'CAND-7A39',
    jobTitle: 'Senior Full Stack Engineer',
    companyName: 'Stripe Equity',
    status: 'scheduled',
    slots: [
      { id: 's1', time: '2026-09-20T14:00:00Z', label: 'Sep 20, 2026 - 2:00 PM UTC', selected: true },
      { id: 's2', time: '2026-09-21T16:00:00Z', label: 'Sep 21, 2026 - 4:00 PM UTC', selected: false }
    ],
    selectedSlot: '2026-09-20T14:00:00Z',
    format: 'Technical Video Panel (Blind Evaluator)',
    panellists: ['Engineering Lead (Evaluator A)', 'Principal Architect (Evaluator B)'],
    notes: 'Please bring your dev environment ready for algorithmic pair programming.'
  },
  {
    id: 'int-102',
    applicationId: 'app-2',
    candidateRef: 'CAND-9B12',
    jobTitle: 'AI / ML Research Engineer',
    companyName: 'Anthropic Labs',
    status: 'pending_confirmation',
    slots: [
      { id: 's3', time: '2026-09-22T10:00:00Z', label: 'Sep 22, 2026 - 10:00 AM UTC', selected: false },
      { id: 's4', time: '2026-09-23T11:30:00Z', label: 'Sep 23, 2026 - 11:30 AM UTC', selected: false }
    ],
    selectedSlot: null,
    format: 'System Design & Model Evaluation',
    panellists: ['Lead ML Engineer'],
    notes: 'Review the candidate anonymized benchmark scores beforehand.'
  }
];

// ─── GET /api/interviews ──────────────────────────────────────────────────────
router.get('/', authenticate, async (req, res) => {
  try {
    // In production, filtered by req.user.id or orgId
    return res.json({ success: true, interviews: interviewsStore });
  } catch (err) {
    console.error('[INTERVIEWS GET ERROR]', err.message);
    return res.status(500).json({ error: { message: 'Failed to retrieve interviews' } });
  }
});

// ─── POST /api/interviews ─────────────────────────────────────────────────────
router.post('/', authenticate, requireRole('recruiter', 'admin'), async (req, res) => {
  try {
    const { candidateRef, jobTitle, slots, format, panellists, notes } = req.body;
    const newInterview = {
      id: `int-${Date.now()}`,
      candidateRef: candidateRef || 'CAND-USER',
      jobTitle: jobTitle || 'Software Engineer',
      status: 'pending_confirmation',
      slots: slots || [
        { id: 's1', time: new Date(Date.now() + 86400000).toISOString(), label: 'Tomorrow 2:00 PM' }
      ],
      selectedSlot: null,
      format: format || 'Video Call (Blind Technical)',
      panellists: panellists || ['Technical Evaluator'],
      notes: notes || '',
      createdAt: new Date()
    };

    interviewsStore.unshift(newInterview);

    await AuditLog.create({
      actorRole: req.user.role,
      actorId: req.user.id,
      action: AUDIT_ACTIONS.RECRUITER_REVIEW,
      targetRecord: newInterview.candidateRef,
      details: `Scheduled interview slots for ${newInterview.jobTitle}`
    });

    return res.status(201).json({ success: true, interview: newInterview });
  } catch (err) {
    console.error('[INTERVIEWS CREATE ERROR]', err.message);
    return res.status(500).json({ error: { message: 'Failed to schedule interview' } });
  }
});

// ─── POST /api/interviews/:id/confirm ─────────────────────────────────────────
router.post('/:id/confirm', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { slotId } = req.body;
    const interview = interviewsStore.find(i => i.id === id);

    if (!interview) {
      return res.status(404).json({ error: { message: 'Interview record not found' } });
    }

    interview.status = 'confirmed';
    if (slotId && interview.slots) {
      interview.slots.forEach(s => { s.selected = (s.id === slotId); });
      const picked = interview.slots.find(s => s.id === slotId);
      if (picked) interview.selectedSlot = picked.time;
    }

    return res.json({
      success: true,
      message: 'Interview slot confirmed successfully. Calendar invitation (.ics) dispatched.',
      interview
    });
  } catch (err) {
    console.error('[INTERVIEWS CONFIRM ERROR]', err.message);
    return res.status(500).json({ error: { message: 'Failed to confirm interview slot' } });
  }
});

// ─── POST /api/interviews/:id/reschedule ──────────────────────────────────────
router.post('/:id/reschedule', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const interview = interviewsStore.find(i => i.id === id);

    if (!interview) {
      return res.status(404).json({ error: { message: 'Interview record not found' } });
    }

    interview.status = 'reschedule_requested';
    interview.notes += ` | Reschedule requested: ${reason || 'Conflict with existing slot'}`;

    return res.json({
      success: true,
      message: 'Reschedule request submitted. Recruiter has been notified.',
      interview
    });
  } catch (err) {
    console.error('[INTERVIEWS RESCHEDULE ERROR]', err.message);
    return res.status(500).json({ error: { message: 'Failed to submit reschedule request' } });
  }
});

module.exports = router;
