/**
 * Security Middleware for Banking Application
 * Implements comprehensive security measures for financial data protection
 */

const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

/**
 * General security middleware for all requests
 * Adds security headers and validates basic request structure
 */
const securityMiddleware = (req, res, next) => {
  // Add security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // Remove sensitive headers
  res.removeHeader('X-Powered-By');
  res.removeHeader('Server');
  
  // Log security events for monitoring
  const timestamp = new Date().toISOString();
  const userAgent = req.get('User-Agent') || 'Unknown';
  const ip = req.ip || req.connection.remoteAddress;
  
  // Basic request logging for security audit
  console.log(`[${timestamp}] ${req.method} ${req.path} - IP: ${ip} - UA: ${userAgent.substring(0, 100)}`);
  
  next();
};

/**
 * JWT Authentication Middleware
 * Verifies JWT tokens for protected routes
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      error: 'Access token required',
      code: 'TOKEN_MISSING'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      // Token validation failed
      console.log(`[SECURITY] Invalid token attempt from IP: ${req.ip} - Error: ${err.message}`);
      return res.status(403).json({
        error: 'Invalid or expired token',
        code: 'TOKEN_INVALID'
      });
    }

    // Check token structure (userId is required, zoqqToken only when Zoqq is enabled)
    if (!user.userId) {
      return res.status(403).json({
        error: 'Invalid token structure - missing userId',
        code: 'TOKEN_STRUCTURE_INVALID'
      });
    }

    // Only require zoqqToken when Zoqq integration is enabled
    const zoqqEnabled = process.env.ZOQQ_ENABLED === 'true';
    if (zoqqEnabled && !user.zoqqToken) {
      return res.status(403).json({
        error: 'Invalid token structure - missing zoqqToken',
        code: 'TOKEN_STRUCTURE_INVALID'
      });
    }

    req.user = user;
    next();
  });
};

/**
 * Admin Authentication Middleware
 * Additional check for admin-only routes
 */
const authenticateAdmin = (req, res, next) => {
  const isAdmin = req.user?.isAdmin === true || req.user?.role === 'admin';
  
  if (!req.user || !isAdmin) {
    console.log(`[SECURITY] Admin access denied for user: ${req.user?.email || 'unknown'} - Role: ${req.user?.role || 'none'} - isAdmin: ${req.user?.isAdmin}`);
    return res.status(403).json({
      error: 'Admin access required',
      code: 'ADMIN_ACCESS_REQUIRED'
    });
  }
  
  console.log(`[SECURITY] Admin access granted for user: ${req.user.email} (role: ${req.user.role}, isAdmin: ${req.user.isAdmin})`);
  next();
};

/**
 * Input Validation Rules for Authentication
 */
const authValidationRules = () => {
  return [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email address required')
      .isLength({ max: 100 })
      .withMessage('Email address too long'),
    
    body('password')
      .isLength({ min: 8, max: 128 })
      .withMessage('Password must be between 8 and 128 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  ];
};

/**
 * Input Validation Rules for Profile Updates
 */
const profileValidationRules = () => {
  return [
    body('firstName')
      .optional()
      .isLength({ min: 1, max: 50 })
      .matches(/^[a-zA-Z\s'-]+$/)
      .withMessage('First name contains invalid characters'),
    
    body('lastName')
      .optional()
      .isLength({ min: 1, max: 50 })
      .matches(/^[a-zA-Z\s'-]+$/)
      .withMessage('Last name contains invalid characters'),
    
    body('phone')
      .optional()
      .matches(/^\+?[\d\s-()]{10,15}$/)
      .withMessage('Invalid phone number format'),
  ];
};

/**
 * Validation Result Handler
 * Processes validation results and returns formatted errors
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: errors.array().map(error => ({
        field: error.param,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

/**
 * Request Sanitization Middleware
 * Removes potentially harmful characters from request data
 */
const sanitizeRequest = (req, res, next) => {
  // Sanitize common XSS patterns
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  };

  const sanitizeObject = (obj) => {
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    
    if (obj !== null && typeof obj === 'object') {
      const sanitized = {};
      for (const key in obj) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
      return sanitized;
    }
    
    return sanitizeString(obj);
  };

  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  next();
};

/**
 * Request Size Limiter
 * Prevents large payload attacks
 */
const requestSizeLimiter = (req, res, next) => {
  const contentLength = parseInt(req.get('Content-Length')) || 0;
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (contentLength > maxSize) {
    return res.status(413).json({
      error: 'Request payload too large',
      code: 'PAYLOAD_TOO_LARGE',
      maxSize: `${maxSize / 1024 / 1024}MB`
    });
  }

  next();
};

module.exports = {
  securityMiddleware,
  authenticateToken,
  authenticateAdmin,
  authValidationRules,
  profileValidationRules,
  validate,
  sanitizeRequest,
  requestSizeLimiter
}; 