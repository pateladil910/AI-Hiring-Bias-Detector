const express = require('express');
const router = express.Router();
const { register, login, getMe, provisionRecruiter } = require('../controllers/auth.controller');
const { verifyToken, requireRole } = require('../middleware/auth.middleware');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.get('/me', verifyToken, getMe);
router.post('/provision', verifyToken, requireRole('admin'), provisionRecruiter);

module.exports = router;
