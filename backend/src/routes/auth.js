const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const { User, Organisation, RecruiterRequest, AuditLog, USER_ROLES, AUDIT_ACTIONS } = require('../models');
const { authenticate } = require('../middleware/auth');
const { sendVerificationEmail } = require('../services/emailService');

const router = express.Router();

// ─── Helpers ──────────────────────────────────────────────────────────────────
const generateToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET || 'fairhire_super_secret_jwt_key_2026', {
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

// ─── POST /api/auth/register (Candidate Self-Serve) ──────────────────────────
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('firstName').trim().notEmpty().withMessage('First name required'),
    body('lastName').trim().notEmpty().withMessage('Last name required'),
  ],
  async (req, res) => {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return;

    try {
      const { email, password, firstName, lastName, role } = req.body;

      // Candidate self-serve only; recruiters must go through /employers/request-access
      const assignedRole = role === 'candidate' || !role ? 'candidate' : role;

      const existing = await User.findOne({ where: { email } });
      if (existing) {
        return res.status(409).json({
          error: { code: 'EMAIL_TAKEN', message: 'An account with this email already exists' },
        });
      }

      const passwordHash = await bcrypt.hash(password, 12);
      const verificationToken = crypto.randomBytes(32).toString('hex');

      const user = await User.create({
        email,
        passwordHash,
        firstName,
        lastName,
        role: assignedRole,
        emailVerified: process.env.NODE_ENV === 'development', // Auto-verify in dev for smooth local testing
        verificationToken,
      });

      // Send verification email
      await sendVerificationEmail(email, verificationToken);

      // Audit log
      await AuditLog.create({
        action: AUDIT_ACTIONS.USER_REGISTERED,
        entityType: 'user',
        entityId: user.id,
        meta: { email: user.email, role: user.role },
      });

      const token = generateToken(user.id);

      return res.status(201).json({
        token,
        emailVerified: user.emailVerified,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          emailVerified: user.emailVerified,
        },
      });
    } catch (err) {
      console.error('[REGISTER ERROR]', err);
      return res.status(500).json({
        error: { code: 'REGISTER_FAILED', message: 'Registration failed. Please try again.' },
      });
    }
  }
);

// ─── GET /api/auth/verify-email ──────────────────────────────────────────────
router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ error: { message: 'Verification token required' } });
    }

    const user = await User.findOne({ where: { verificationToken: token } });
    if (!user) {
      return res.status(400).json({ error: { message: 'Invalid or expired verification token' } });
    }

    user.emailVerified = true;
    user.verificationToken = null;
    await user.save();

    await AuditLog.create({
      action: AUDIT_ACTIONS.USER_EMAIL_VERIFIED,
      entityType: 'user',
      entityId: user.id,
    });

    const authToken = generateToken(user.id);
    return res.json({
      message: 'Email successfully verified.',
      token: authToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        emailVerified: true,
      },
    });
  } catch (err) {
    console.error('[VERIFY EMAIL ERROR]', err);
    return res.status(500).json({ error: { message: 'Email verification failed.' } });
  }
});

// ─── POST /api/auth/accept-invite (Recruiter Account Activation) ─────────────
router.post('/accept-invite', async (req, res) => {
  try {
    const { token, password, firstName, lastName } = req.body;
    if (!token || !password) {
      return res.status(400).json({ error: { message: 'Token and password are required.' } });
    }

    const request = await RecruiterRequest.findOne({ where: { inviteToken: token } });
    if (!request) {
      return res.status(400).json({ error: { message: 'Invalid or expired invite token.' } });
    }

    if (request.tokenExpiresAt && new Date() > new Date(request.tokenExpiresAt)) {
      return res.status(400).json({ error: { message: 'Invite token has expired.' } });
    }

    // Check if user already exists
    let user = await User.findOne({ where: { email: request.workEmail } });
    const passwordHash = await bcrypt.hash(password, 12);

    if (!user) {
      user = await User.create({
        email: request.workEmail,
        passwordHash,
        firstName: firstName || request.companyName,
        lastName: lastName || 'Recruiter',
        role: 'recruiter',
        emailVerified: true,
        orgId: request.orgId,
      });
    } else {
      user.passwordHash = passwordHash;
      user.role = 'recruiter';
      user.emailVerified = true;
      user.orgId = request.orgId;
      await user.save();
    }

    // Invalidate single-use token
    request.inviteToken = null;
    await request.save();

    const authToken = generateToken(user.id);
    return res.json({
      message: 'Account activated successfully.',
      token: authToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        orgId: user.orgId,
        emailVerified: true,
      },
    });
  } catch (err) {
    console.error('[ACCEPT INVITE ERROR]', err);
    return res.status(500).json({ error: { message: 'Failed to accept invite.' } });
  }
});

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
          emailVerified: user.emailVerified,
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
      emailVerified: req.user.emailVerified,
      createdAt: req.user.createdAt,
    },
  });
});

// ─── POST /api/auth/resend-verification ──────────────────────────────────────
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: { message: 'Email is required.' } });
    }

    const user = await User.findOne({ where: { email: email.toLowerCase().trim() } });

    // Always return 200 to prevent email enumeration
    if (!user || user.emailVerified) {
      return res.json({ message: 'If that email exists and is unverified, a new link has been sent.' });
    }

    // Generate a fresh verification token
    const newToken = crypto.randomBytes(32).toString('hex');
    user.verificationToken = newToken;
    await user.save();

    await sendVerificationEmail(user.email, newToken);

    return res.json({ message: 'Verification email re-sent. Please check your inbox.' });
  } catch (err) {
    console.error('[RESEND VERIFICATION ERROR]', err.message);
    return res.status(500).json({ error: { message: 'Failed to resend verification email.' } });
  }
});

module.exports = router;
