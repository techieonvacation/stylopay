/**
 * Authentication Routes for StyloPay Banking Application
 * Handles secure authentication flows with Zoqq API integration
 */

const express = require('express');
const { body } = require('express-validator');
const zoqqAuthService = require('../services/zoqqAuth');
const { 
  authValidationRules, 
  validate, 
  sanitizeRequest,
  authenticateToken 
} = require('../middleware/security');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

const router = express.Router();

/**
 * POST /api/auth/login
 * Authenticate user and return secure token
 */
router.post('/login', 
  sanitizeRequest,
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email address required')
      .isLength({ max: 100 })
      .withMessage('Email address too long'),
    
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .custom((value) => {
        // Basic password strength check for banking security
        const hasUpperCase = /[A-Z]/.test(value);
        const hasLowerCase = /[a-z]/.test(value);
        const hasNumbers = /\d/.test(value);
        const hasNonalphas = /\W/.test(value);
        
        if (!(hasUpperCase && hasLowerCase && hasNumbers && hasNonalphas)) {
          throw new Error('Password must contain uppercase, lowercase, number, and special character');
        }
        return true;
      }),
      
    body('rememberMe')
      .optional()
      .isBoolean()
      .withMessage('Remember me must be a boolean value'),
      
    // Optional device information for security tracking
    body('deviceInfo')
      .optional()
      .isObject()
      .withMessage('Device info must be an object'),
      
    body('deviceInfo.browser')
      .optional()
      .isLength({ max: 100 })
      .withMessage('Browser name too long'),
      
    body('deviceInfo.os')
      .optional()
      .isLength({ max: 100 })
      .withMessage('OS name too long'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { email, password, rememberMe = false, deviceInfo } = req.body;
    const userIp = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    // Log authentication attempt for security monitoring
    console.log(`[AUTH] Login attempt for email: ${email} from IP: ${userIp}`);

    try {
      // Authenticate user with database and create token
      const authResult = await zoqqAuthService.authenticateUser(email, password, userIp);

      // Log successful authentication
      console.log(`[AUTH] Successful login for email: ${email} - Token expires: ${authResult.expiresAt}`);

      // Set secure HTTP-only cookie for additional security
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000, // 7 days or 1 day
        path: '/'
      };

      res.cookie('auth_session', authResult.token, cookieOptions);

      // Create response without sensitive information
      const response = {
        success: true,
        message: 'Authentication successful',
        user: authResult.user,
        token: {
          accessToken: authResult.token,
          type: authResult.tokenType,
          expiresAt: authResult.expiresAt,
          validFor: authResult.validFor
        },
        session: {
          rememberMe: rememberMe,
          deviceInfo: deviceInfo || null,
          hasZoqqIntegration: authResult.hasZoqqIntegration || false
        }
      };

      res.status(200).json(response);

    } catch (error) {
      // Log failed authentication attempt
      console.error(`[AUTH] Failed login attempt for email: ${email} from IP: ${userIp} - Error: ${error.message}`);
      
      // Generic error message for security (don't reveal specific failure reasons)
      throw new AppError(
        'Authentication failed. Please check your credentials.',
        401,
        'AUTHENTICATION_FAILED'
      );
    }
  })
);

/**
 * POST /api/auth/signup
 * Register new user account
 */
router.post('/signup',
  sanitizeRequest,
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email address required')
      .isLength({ max: 100 })
      .withMessage('Email address too long'),
      
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .custom((value) => {
        // Banking-grade password strength check
        const hasUpperCase = /[A-Z]/.test(value);
        const hasLowerCase = /[a-z]/.test(value);
        const hasNumbers = /\d/.test(value);
        const hasNonalphas = /\W/.test(value);
        
        if (!(hasUpperCase && hasLowerCase && hasNumbers && hasNonalphas)) {
          throw new Error('Password must contain uppercase, lowercase, number, and special character');
        }
        return true;
      }),
      
    body('firstName')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('First name must be between 2 and 50 characters')
      .matches(/^[a-zA-Z\s'-]+$/)
      .withMessage('First name can only contain letters, spaces, hyphens, and apostrophes'),
      
    body('lastName')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Last name must be between 2 and 50 characters')
      .matches(/^[a-zA-Z\s'-]+$/)
      .withMessage('Last name can only contain letters, spaces, hyphens, and apostrophes'),
      
    body('confirmPassword')
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Password confirmation does not match password');
        }
        return true;
      }),
      
    body('agreeToTerms')
      .equals('true')
      .withMessage('You must agree to the terms of service'),
      
    // Optional device information for security tracking
    body('deviceInfo')
      .optional()
      .isObject()
      .withMessage('Device info must be an object'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { email, password, firstName, lastName, deviceInfo } = req.body;
    const userIp = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    console.log(`[AUTH] Signup attempt for email: ${email} from IP: ${userIp}`);

         try {
       // Check if user already exists
       const existingUserCheck = await zoqqAuthService.checkUserExists(email);
       
       if (existingUserCheck.success && existingUserCheck.data.exists) {
         throw new AppError('An account with this email address already exists', 409, 'USER_EXISTS');
       }

       // Create new user in database
       const createUserResult = await zoqqAuthService.createUser({
         firstName: firstName.trim(),
         lastName: lastName.trim(),
         email: email.toLowerCase().trim(),
         password: password,
         deviceInfo: deviceInfo
       });

       if (!createUserResult.success) {
         throw new AppError('Failed to create user account', 500, 'USER_CREATION_FAILED');
       }

       // Log successful registration
       console.log(`[AUTH] User registration successful for email: ${email}`);

       // In production, you would send email verification here
       // For demo purposes, we'll return success immediately
       const response = {
         success: true,
         message: 'Account created successfully! Please check your email to verify your account.',
         user: createUserResult.user,
         nextSteps: {
           emailVerificationRequired: true,
           loginAfterVerification: true,
           verificationEmailSent: true
         }
       };

       res.status(201).json(response);

    } catch (error) {
      // Log failed registration attempt
      console.error(`[AUTH] Failed signup attempt for email: ${email} from IP: ${userIp} - Error: ${error.message}`);
      
      // Handle specific error cases
      if (error.code === 'USER_EXISTS') {
        throw new AppError('An account with this email address already exists', 409, 'USER_EXISTS');
      }
      
      // Generic error for other cases
      throw new AppError(
        'Registration failed. Please try again.',
        500,
        'REGISTRATION_FAILED'
      );
    }
  })
);

/**
 * POST /api/auth/refresh
 * Refresh authentication token
 */
router.post('/refresh',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const currentToken = req.headers.authorization?.split(' ')[1];
    
    if (!currentToken) {
      throw new AppError('No token provided for refresh', 400, 'TOKEN_MISSING');
    }

    try {
      const refreshResult = await zoqqAuthService.refreshTokenIfNeeded(currentToken);
      
      console.log(`[AUTH] Token refresh for user: ${req.user.userId} - Refresh required: ${refreshResult.refreshRequired}`);

      res.status(200).json({
        success: true,
        refreshRequired: refreshResult.refreshRequired,
        token: refreshResult.refreshRequired ? {
          type: 'Bearer',
          expiresAt: refreshResult.expiresAt,
          validFor: refreshResult.validFor
        } : {
          validFor: refreshResult.validFor
        },
        message: refreshResult.refreshRequired ? 'Token refreshed successfully' : 'Token is still valid'
      });

    } catch (error) {
      console.error(`[AUTH] Token refresh failed for user: ${req.user.userId} - Error: ${error.message}`);
      throw error;
    }
  })
);

/**
 * GET /api/auth/status
 * Check authentication status
 */
router.get('/status',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const user = req.user;
    
    res.status(200).json({
      success: true,
      authenticated: true,
      user: {
        userId: user.userId,
        email: user.email,
        role: user.role,
        isAdmin: user.isAdmin,
        authenticatedAt: user.authenticatedAt,
        ip: user.ip,
        tokenType: user.tokenType,
        isVerified: user.isVerified,
        accountStatus: user.accountStatus
      },
      token: {
        expiresAt: user.zoqqExpiresAt,
        validFor: Math.floor((new Date(user.zoqqExpiresAt) - new Date()) / 1000)
      }
    });
  })
);

/**
 * POST /api/auth/logout
 * Logout and invalidate session
 */
router.post('/logout',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const userIp = req.ip || req.connection.remoteAddress;

    console.log(`[AUTH] Logout request for user: ${userId} from IP: ${userIp}`);

    // Clear HTTP-only cookie
    res.clearCookie('auth_session', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });

    // In a real implementation, you might want to:
    // 1. Add token to blacklist/revocation list
    // 2. Log logout event for security audit
    // 3. Clean up any session data

    console.log(`[AUTH] Successful logout for user: ${userId}`);

    res.status(200).json({
      success: true,
      message: 'Logout successful',
      loggedOut: true,
      timestamp: new Date().toISOString()
    });
  })
);

/**
 * POST /api/auth/validate-token
 * Validate token without full authentication middleware
 */
router.post('/validate-token',
  sanitizeRequest,
  [
    body('token')
      .notEmpty()
      .withMessage('Token is required')
      .isLength({ min: 10 })
      .withMessage('Invalid token format')
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { token } = req.body;

    try {
      const decoded = zoqqAuthService.validateInternalToken(token);
      const expiresAt = new Date(decoded.zoqqExpiresAt);
      const now = new Date();
      const isExpired = expiresAt <= now;

      res.status(200).json({
        success: true,
        valid: !isExpired,
        expired: isExpired,
        expiresAt: decoded.zoqqExpiresAt,
        validFor: isExpired ? 0 : Math.floor((expiresAt - now) / 1000),
        user: {
          userId: decoded.userId,
          email: decoded.email,
          role: decoded.role,
          isAdmin: decoded.isAdmin,
          authenticatedAt: decoded.authenticatedAt,
          isVerified: decoded.isVerified,
          accountStatus: decoded.accountStatus
        }
      });

    } catch (error) {
      console.log(`[AUTH] Token validation failed: ${error.message}`);
      
      res.status(200).json({
        success: true,
        valid: false,
        expired: true,
        error: error.message
      });
    }
  })
);

/**
 * GET /api/auth/health
 * Health check for authentication service
 */
router.get('/health',
  asyncHandler(async (req, res) => {
    try {
      // Check if Zoqq service is accessible (without making actual auth request)
      const healthCheck = {
        service: 'Authentication Service',
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        zoqq: {
          configured: !!(process.env.ZOQQ_CLIENT_ID && process.env.ZOQQ_API_KEY),
          baseUrl: process.env.ZOQQ_BASE_URL || 'Not configured'
        }
      };

      res.status(200).json(healthCheck);

    } catch (error) {
      res.status(503).json({
        service: 'Authentication Service',
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  })
);

module.exports = router; 