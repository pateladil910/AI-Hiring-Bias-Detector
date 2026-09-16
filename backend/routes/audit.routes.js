const express = require('express');
const router  = express.Router();
const { getAuditEvents, getCandidateAudit } = require('../controllers/audit.controller');
const { verifyToken, requireRole } = require('../middleware/auth.middleware');

// IMPORTANT: /my must come BEFORE /:candidateRef to avoid route conflict
router.get('/my',              verifyToken, requireRole('candidate'), getCandidateAudit);
router.get('/:candidateRef',   verifyToken, requireRole('admin'),     getAuditEvents);

module.exports = router;
