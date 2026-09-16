const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const JWT_SECRET = process.env.JWT_SECRET || 'equihire_jwt_secret_dev';


/**
 * Middleware: Verify JWT token from Authorization header.
 * Attaches req.user = { id, email, role, name } on success.
 */
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please sign in.'
      });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: 'Session expired. Please sign in again.' });
      }
      return res.status(401).json({ success: false, message: 'Invalid authentication token.' });
    }

    // Optionally verify user still exists and is active
    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'Account not found or deactivated.' });
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name
    };

    next();
  } catch (err) {
    console.error('[Auth Middleware] Error:', err.message);
    res.status(500).json({ success: false, message: 'Authentication check failed.' });
  }
};

/**
 * Middleware factory: Require specific role(s).
 * Must be used AFTER verifyToken.
 * Usage: requireRole('recruiter', 'admin')
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    if (!roles.includes(req.user.role)) {
      // Log unauthorized access attempt
      console.warn(`[Access Control] DENIED: user=${req.user.email} role=${req.user.role} required=${roles.join('|')} path=${req.path}`);
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this resource.'
      });
    }

    next();
  };
};

module.exports = { verifyToken, requireRole };
