const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { RecruiterRequest, Organisation, User, AuditLog, AUDIT_ACTIONS } = require('../models');
const { authenticate, requireRole } = require('../middleware/auth');
const { sendRecruiterInviteEmail } = require('../services/emailService');

// Admin protection: Require authentication and admin role
router.use(authenticate);
router.use(requireRole('admin'));

// ─── GET /api/admin/recruiter-requests ───────────────────────────────────────
router.get('/recruiter-requests', async (req, res) => {
  try {
    const { status } = req.query;
    const where = {};
    if (status) where.status = status;

    const requests = await RecruiterRequest.findAll({
      where,
      order: [['createdAt', 'DESC']],
    });

    res.json({ requests });
  } catch (err) {
    console.error('❌ Error fetching recruiter requests:', err);
    res.status(500).json({ error: { message: 'Failed to fetch requests.' } });
  }
});

// ─── POST /api/admin/recruiter-requests/:id/decision ────────────────────────
router.post('/recruiter-requests/:id/decision', async (req, res) => {
  try {
    const { id } = req.params;
    const { decision, notes } = req.body; // 'approved' | 'rejected'

    if (!['approved', 'rejected'].includes(decision)) {
      return res.status(400).json({ error: { message: 'Decision must be approved or rejected.' } });
    }

    const request = await RecruiterRequest.findByPk(id);
    if (!request) {
      return res.status(404).json({ error: { message: 'Request not found.' } });
    }

    if (decision === 'approved') {
      const emailDomain = request.workEmail.split('@')[1]?.toLowerCase();

      // Find or create organisation
      let org = await Organisation.findOne({ where: { workDomain: emailDomain } });
      if (!org) {
        org = await Organisation.create({
          name: request.companyName,
          workDomain: emailDomain,
          status: 'active',
        });
      }

      // Generate single-use invite token (72-hour expiration)
      const inviteToken = crypto.randomBytes(32).toString('hex');
      const tokenExpiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000);

      request.status = 'approved';
      request.inviteToken = inviteToken;
      request.tokenExpiresAt = tokenExpiresAt;
      request.reviewedBy = req.user.id;
      request.decisionNotes = notes || '';
      request.orgId = org.id;
      await request.save();

      // Send invite email
      await sendRecruiterInviteEmail(request.workEmail, request.companyName, inviteToken);

      // Audit log
      await AuditLog.create({
        action: AUDIT_ACTIONS.RECRUITER_REQUEST_APPROVED,
        entityType: 'recruiter_request',
        entityId: request.id,
        userId: req.user.id,
        meta: {
          companyName: request.companyName,
          workEmail: request.workEmail,
          orgId: org.id,
        },
      });

      return res.json({
        message: 'Request approved and invite email dispatched.',
        request,
      });
    } else {
      request.status = 'rejected';
      request.reviewedBy = req.user.id;
      request.decisionNotes = notes || '';
      await request.save();

      // Audit log
      await AuditLog.create({
        action: AUDIT_ACTIONS.RECRUITER_REQUEST_REJECTED,
        entityType: 'recruiter_request',
        entityId: request.id,
        userId: req.user.id,
        meta: {
          companyName: request.companyName,
          workEmail: request.workEmail,
          notes,
        },
      });

      return res.json({
        message: 'Request rejected.',
        request,
      });
    }
  } catch (err) {
    console.error('❌ Error updating request decision:', err);
    res.status(500).json({ error: { message: 'Failed to update decision.' } });
  }
});

module.exports = router;
