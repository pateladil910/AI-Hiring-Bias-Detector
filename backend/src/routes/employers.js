const express = require('express');
const router = express.Router();
const { RecruiterRequest, AuditLog, AUDIT_ACTIONS } = require('../models');

// ─── POST /api/employers/request-access ──────────────────────────────────────
router.post('/request-access', async (req, res) => {
  try {
    const { companyName, workEmail, companySize, useCase } = req.body;

    if (!companyName || !workEmail) {
      return res.status(400).json({ error: { message: 'Company name and work email are required.' } });
    }

    // Basic domain check to block common free webmail domains
    const freeDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com'];
    const emailDomain = workEmail.split('@')[1]?.toLowerCase();
    if (freeDomains.includes(emailDomain)) {
      return res.status(400).json({
        error: { message: 'Please provide a valid company work email address (e.g. name@company.com).' }
      });
    }

    const existing = await RecruiterRequest.findOne({ where: { workEmail: workEmail.toLowerCase() } });
    if (existing && existing.status === 'pending') {
      return res.status(200).json({
        message: 'A request for this company email is already pending review.',
        requestId: existing.id,
      });
    }

    const request = await RecruiterRequest.create({
      companyName,
      workEmail: workEmail.toLowerCase(),
      companySize: companySize || '1-50',
      useCase: useCase || '',
      status: 'pending',
    });

    // Log compliance audit event
    await AuditLog.create({
      action: AUDIT_ACTIONS.RECRUITER_REQUEST_SUBMITTED,
      entityType: 'recruiter_request',
      entityId: request.id,
      meta: {
        companyName,
        workEmail: request.workEmail,
        companySize: request.companySize,
      },
    });

    res.status(201).json({
      message: 'Employer access request submitted successfully. We will review and email you within 1 business day.',
      requestId: request.id,
    });
  } catch (err) {
    console.error('❌ Employer request error:', err);
    res.status(500).json({ error: { message: 'Failed to process request.' } });
  }
});

module.exports = router;
