const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { User, Organisation, USER_ROLES } = require('../models');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// ─── Helpers ──────────────────────────────────────────────────────────────────
const generateToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const handleValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: errors.array() },
    });
  }
  return null;
};

// ─── POST /api/auth/register ──────────────────────────────────────────────────
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('firstName').trim().notEmpty().withMessage('First name required'),
    body('lastName').trim().notEmpty().withMessage('Last name required'),
    body('role')
      .isIn(USER_ROLES)
      .withMessage(`Role must be one of: ${USER_ROLES.join(', ')}`),
  ],
  async (req, res) => {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return;

    try {
      const { email, password, firstName, lastName, role, orgName } = req.body;

      // Check for existing user
      const existing = await User.findOne({ where: { email } });
      if (existing) {
        return res.status(409).json({
          error: { code: 'EMAIL_TAKEN', message: 'An account with this email already exists' },
        });
      }

      // Create or find organisation (for non-candidate roles)
      let orgId = null;
      if (role !== 'candidate') {
        const orgNameClean = orgName?.trim() || 'Default Organisation';
        const [org] = await Organisation.findOrCreate({
          where: { name: orgNameClean },
          defaults: { name: orgNameClean },
        });
        orgId = org.id;
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 12);

      // Create user
      const user = await User.create({
        email,
        passwordHash,
        firstName,
        lastName,
        role,
        orgId,
      });

      const token = generateToken(user.id);

      return res.status(201).json({
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          orgId: user.orgId,
        },
      });
    } catch (err) {
      console.error('[REGISTER ERROR]', err.message);
      return res.status(500).json({
        error: { code: 'REGISTER_FAILED', message: 'Registration failed. Please try again.' },
      });
    }
  }
);

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required'),
  ],
  async (req, res) => {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return;

    try {
      const { email, password } = req.body;

      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({
          error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
        });
      }

      if (!user.isActive) {
        return res.status(403).json({
          error: { code: 'ACCOUNT_DISABLED', message: 'This account has been disabled' },
        });
      }

      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        return res.status(401).json({
          error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
        });
      }

      const token = generateToken(user.id);

      return res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          orgId: user.orgId,
        },
      });
    } catch (err) {
      console.error('[LOGIN ERROR]', err.message);
      return res.status(500).json({
        error: { code: 'LOGIN_FAILED', message: 'Login failed. Please try again.' },
      });
    }
  }
);

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
router.get('/me', authenticate, async (req, res) => {
  return res.json({
    user: {
      id: req.user.id,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      role: req.user.role,
      orgId: req.user.orgId,
      createdAt: req.user.createdAt,
    },
  });
});

module.exports = router;
