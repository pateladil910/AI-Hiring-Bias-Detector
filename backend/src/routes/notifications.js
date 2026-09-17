const express = require('express');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Mock store for user notifications
let notificationsStore = [
  {
    id: 'notif-1',
    userId: 'all',
    type: 'system',
    title: 'Platform Maintenance Notice',
    message: 'FairHire AI 3.0.0 algorithms have been updated with WCAG 2.1 AA accessibility checks and zero-bias lexicons.',
    read: false,
    createdAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'notif-2',
    userId: 'all',
    type: 'application',
    title: 'Application Advanced',
    message: 'Your blind evaluation for Senior Full Stack Engineer has advanced to the Technical Panel round.',
    read: false,
    createdAt: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 'notif-3',
    userId: 'all',
    type: 'bias_scan',
    title: 'Bias Audit Complete',
    message: 'Job Description "Backend Systems Architect" cleared Layer-1 and Layer-2 bias inspection with 96/100 neutrality.',
    read: true,
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
];

// ─── GET /api/notifications/me ────────────────────────────────────────────────
router.get('/me', authenticate, (req, res) => {
  return res.json({
    success: true,
    notifications: notificationsStore,
    unreadCount: notificationsStore.filter(n => !n.read).length
  });
});

// ─── PUT /api/notifications/:id/read ──────────────────────────────────────────
router.put('/:id/read', authenticate, (req, res) => {
  const { id } = req.params;
  const notif = notificationsStore.find(n => n.id === id);
  if (notif) {
    notif.read = true;
  }
  return res.json({ success: true, message: 'Notification marked as read' });
});

// ─── PUT /api/notifications/read-all ──────────────────────────────────────────
router.put('/read-all', authenticate, (req, res) => {
  notificationsStore.forEach(n => { n.read = true; });
  return res.json({ success: true, message: 'All notifications marked as read' });
});

module.exports = router;
