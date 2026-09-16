const express = require('express');
const router = express.Router();
const { getApplication } = require('../controllers/candidate.controller');
const { verifyToken, requireRole } = require('../middleware/auth.middleware');

router.get('/application', verifyToken, requireRole('candidate'), getApplication);

module.exports = router;
