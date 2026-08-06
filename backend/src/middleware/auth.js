const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * Middleware: Verify JWT and attach user to req.user
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: { code: 'UNAUTHORIZED', message: 'No token provided' },
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ['passwordHash'] },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        error: { code: 'UNAUTHORIZED', message: 'User not found or deactivated' },
      });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: { code: 'TOKEN_EXPIRED', message: 'Token has expired' },
      });
    }
    return res.status(401).json({
      error: { code: 'INVALID_TOKEN', message: 'Invalid token' },
    });
  }
};

/**
 * Middleware factory: Require specific roles
 * Usage: requireRole('recruiter', 'hr_lead')
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: `Access denied. Required roles: ${roles.join(', ')}`,
        },
      });
    }
    next();
  };
};

module.exports = { authenticate, requireRole };
