const express = require('express');
const router = express.Router();
const { getCandidates, getCandidateDetail, recordReview } = require('../controllers/recruiter.controller');
const { verifyToken, requireRole } = require('../middleware/auth.middleware');

router.get('/candidates', verifyToken, requireRole('recruiter', 'admin'), getCandidates);
router.get('/candidates/:refId', verifyToken, requireRole('recruiter', 'admin'), getCandidateDetail);
router.post('/reviews', verifyToken, requireRole('recruiter', 'admin'), recordReview);

module.exports = router;
