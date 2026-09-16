const express = require('express');
const router  = express.Router();
const {
  startAssessment,
  getAssessment,
  saveAnswers,
  runCode,
  submitAssessment,
  getCandidateResults
} = require('../controllers/assessment.controller');
const { verifyToken, requireRole } = require('../middleware/auth.middleware');

// IMPORTANT: Specific routes BEFORE parameterised routes to avoid conflicts
router.get('/results/me',          verifyToken, requireRole('candidate'), getCandidateResults);
router.post('/start',              verifyToken, requireRole('candidate'), startAssessment);
router.get('/:id',                 verifyToken, getAssessment);
router.put('/:id/answers',         verifyToken, requireRole('candidate'), saveAnswers);
router.post('/:id/code-run',       verifyToken, requireRole('candidate'), runCode);
router.post('/:id/submit',         verifyToken, requireRole('candidate'), submitAssessment);

module.exports = router;
