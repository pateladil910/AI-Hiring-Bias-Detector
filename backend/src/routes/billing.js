const express = require('express');
const { authenticate, requireRole } = require('../middleware/auth');
const { AuditLog, AUDIT_ACTIONS } = require('../models');

const router = express.Router();

// Mock store for organization billing details
let subscriptionState = {
  tier: 'Growth Plan',
  status: 'active',
  renewalDate: '2026-10-01T00:00:00Z',
  seatLimit: 15,
  seatsUsed: 8,
  monthlyAssessmentLimit: 500,
  assessmentsUsedThisMonth: 182,
  priceMonthly: 299,
  currency: 'USD',
  invoices: [
    { id: 'INV-2026-09', date: '2026-09-01', amount: 299, status: 'paid', downloadUrl: '#' },
    { id: 'INV-2026-08', date: '2026-08-01', amount: 299, status: 'paid', downloadUrl: '#' },
    { id: 'INV-2026-07', date: '2026-07-01', amount: 299, status: 'paid', downloadUrl: '#' }
  ]
};

// ─── GET /api/billing/subscription ────────────────────────────────────────────
router.get('/subscription', authenticate, requireRole('admin'), (req, res) => {
  return res.json({
    success: true,
    subscription: subscriptionState
  });
});

// ─── POST /api/billing/subscription/change ────────────────────────────────────
router.post('/subscription/change', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { tier } = req.body;
    if (!['Starter', 'Growth', 'Enterprise'].includes(tier)) {
      return res.status(400).json({ error: { message: 'Invalid subscription tier' } });
    }

    subscriptionState.tier = `${tier} Plan`;
    if (tier === 'Starter') {
      subscriptionState.seatLimit = 5;
      subscriptionState.monthlyAssessmentLimit = 100;
      subscriptionState.priceMonthly = 99;
    } else if (tier === 'Growth') {
      subscriptionState.seatLimit = 15;
      subscriptionState.monthlyAssessmentLimit = 500;
      subscriptionState.priceMonthly = 299;
    } else {
      subscriptionState.seatLimit = 100;
      subscriptionState.monthlyAssessmentLimit = 5000;
      subscriptionState.priceMonthly = 999;
    }

    await AuditLog.create({
      actorRole: req.user.role,
      actorId: req.user.id,
      action: AUDIT_ACTIONS.STATUS_UPDATE,
      targetRecord: `subscription-${tier}`,
      details: `Organization upgraded/changed plan to ${tier}`
    });

    return res.json({
      success: true,
      message: `Successfully updated organization plan to ${tier}.`,
      subscription: subscriptionState
    });
  } catch (err) {
    console.error('[BILLING CHANGE ERROR]', err.message);
    return res.status(500).json({ error: { message: 'Failed to update plan tier' } });
  }
});

module.exports = router;
