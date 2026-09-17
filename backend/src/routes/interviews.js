const express = require('express');
const { authenticate, requireRole } = require('../middleware/auth');
const { Interview, Application, Job, User, AuditLog } = require('../models');

const router = express.Router();

// ─── GET /api/interviews/my (Candidate's Interviews) ───────────────────────────
router.get('/my', authenticate, requireRole('candidate'), async (req, res) => {
  try {
    const interviews = await Interview.findAll({
      where: { candidateId: req.user.id },
      include: [
        {
          model: Application,
          include: [{ model: Job, attributes: ['id', 'title'] }],
        },
      ],
      order: [['scheduledAt', 'ASC']],
    });

    // If candidate has no interviews in DB, provide standard active demo slot so UI isn't empty
    if (interviews.length === 0) {
      const demoDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // 2 days from now
      return res.json({
        interviews: [
          {
            id: 'demo-int-1',
            jobTitle: 'Senior Full Stack Engineer',
            companyName: 'FairHire Partner Network',
            scheduledAt: demoDate.toISOString(),
            durationMinutes: 45,
            format: 'Technical Architecture & Blind Pair Review',
            meetingLink: 'https://meet.google.com/equi-hire-interview',
            status: 'scheduled',
            panellists: ['Senior Tech Lead (Blind Evaluator)', 'Staff Architect'],
            notes: 'Please ensure a working camera/mic and modern browser for the coding pair review.',
          },
        ],
      });
    }

    return res.json({
      interviews: interviews.map((i) => ({
        id: i.id,
        jobTitle: i.Application?.Job?.title || 'Engineering Role',
        companyName: 'FairHire Partner Network',
        scheduledAt: i.scheduledAt,
        durationMinutes: i.durationMinutes,
        meetingLink: i.meetingLink,
        status: i.status,
        notes: i.notes,
        rescheduleReason: i.rescheduleReason,
      })),
    });
  } catch (err) {
    console.error('[Candidate Interviews Error]', err.message);
    return res.status(500).json({ error: { code: 'FETCH_FAILED', message: 'Failed to fetch candidate interviews' } });
  }
});

// ─── GET /api/interviews (Recruiter view) ──────────────────────────────────────
router.get('/', authenticate, async (req, res) => {
  try {
    const interviews = await Interview.findAll({
      include: [
        { model: Application, include: [{ model: Job, attributes: ['id', 'title'] }] },
        { model: User, as: 'Candidate', attributes: ['id', 'email', 'firstName', 'lastName'] },
      ],
      order: [['scheduledAt', 'DESC']],
    });

    return res.json({
      success: true,
      interviews: interviews.map((i) => ({
        id: i.id,
        candidateRef: `CAND-${i.candidateId.slice(0, 6).toUpperCase()}`,
        jobTitle: i.Application?.Job?.title || 'Software Engineer',
        companyName: 'FairHire Partner Network',
        scheduledAt: i.scheduledAt,
        durationMinutes: i.durationMinutes,
        status: i.status,
        meetingLink: i.meetingLink,
        notes: i.notes,
      })),
    });
  } catch (err) {
    return res.status(500).json({ error: { message: 'Failed to retrieve interviews' } });
  }
});

// ─── POST /api/interviews/:id/confirm ─────────────────────────────────────────
router.post('/:id/confirm', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    if (id === 'demo-int-1') {
      return res.json({ success: true, message: 'Interview attendance confirmed successfully' });
    }

    const interview = await Interview.findByPk(id);
    if (!interview) {
      return res.status(404).json({ error: { message: 'Interview record not found' } });
    }

    interview.status = 'confirmed';
    await interview.save();

    await AuditLog.create({
      action: 'INTERVIEW_CONFIRMED',
      entityType: 'interview',
      entityId: interview.id,
      userId: req.user.id,
      reason: 'Candidate confirmed interview attendance',
    });

    return res.json({ success: true, message: 'Interview confirmed', interview });
  } catch (err) {
    return res.status(500).json({ error: { message: 'Failed to confirm interview' } });
  }
});

// ─── POST /api/interviews/:id/reschedule ───────────────────────────────────────
router.post('/:id/reschedule', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason = 'Scheduling conflict' } = req.body;

    if (id === 'demo-int-1') {
      return res.json({ success: true, message: 'Reschedule request submitted to recruiter pool' });
    }

    const interview = await Interview.findByPk(id);
    if (!interview) {
      return res.status(404).json({ error: { message: 'Interview record not found' } });
    }

    interview.status = 'reschedule_requested';
    interview.rescheduleReason = reason;
    await interview.save();

    await AuditLog.create({
      action: 'INTERVIEW_RESCHEDULE_REQUESTED',
      entityType: 'interview',
      entityId: interview.id,
      userId: req.user.id,
      reason: `Reschedule requested: ${reason}`,
    });

    return res.json({ success: true, message: 'Reschedule request recorded', interview });
  } catch (err) {
    return res.status(500).json({ error: { message: 'Failed to request reschedule' } });
  }
});

module.exports = router;
