const rateLimit = require('express-rate-limit');

/**
 * Auth rate limiter — 10 requests per 15 minutes.
 * Applied to /api/auth/register and /api/auth/login
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.'
  },
  skip: (req) => process.env.NODE_ENV === 'test' // skip in test environment
});

/**
 * Upload rate limiter — 5 uploads per hour.
 * Applied to /api/resume/upload
 */
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Upload limit reached. You can upload up to 5 resumes per hour.'
  },
  skip: (req) => process.env.NODE_ENV === 'test'
});

module.exports = { authLimiter, uploadLimiter };
