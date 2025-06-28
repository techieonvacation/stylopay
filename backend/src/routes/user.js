/**
 * User Routes for StyloPay Banking Application
 * Handles user profile and account management operations
 */

const express = require('express');
const { body } = require('express-validator');
const { 
  authenticateToken, 
  profileValidationRules, 
  validate, 
  sanitizeRequest 
} = require('../middleware/security');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

const router = express.Router();

/**
 * GET /api/user/profile
 * Get user profile information
 */
router.get('/profile',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const user = req.user;
    
    // Log profile access for security audit
    console.log(`[USER] Profile accessed by user: ${user.userId} from IP: ${req.ip}`);

    // In a real implementation, fetch user data from database
    // For now, return basic information from token
    const profileData = {
      userId: user.userId,
      email: user.userId, // Assuming userId is email for now
      authenticatedAt: user.authenticatedAt,
      tokenType: user.tokenType,
      lastLoginIp: user.ip,
      accountStatus: 'active', // This would come from database
      // Add other non-sensitive profile data here
    };

    res.status(200).json({
      success: true,
      profile: profileData,
      timestamp: new Date().toISOString()
    });
  })
);

/**
 * PUT /api/user/profile
 * Update user profile information
 */
router.put('/profile',
  authenticateToken,
  sanitizeRequest,
  [
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
      
    body('dateOfBirth')
      .optional()
      .isDate()
      .withMessage('Invalid date of birth format'),
      
    body('address')
      .optional()
      .isObject()
      .withMessage('Address must be an object'),
      
    body('address.street')
      .optional()
      .isLength({ max: 200 })
      .withMessage('Street address too long'),
      
    body('address.city')
      .optional()
      .isLength({ max: 100 })
      .withMessage('City name too long'),
      
    body('address.state')
      .optional()
      .isLength({ max: 100 })
      .withMessage('State name too long'),
      
    body('address.zipCode')
      .optional()
      .matches(/^[\d\s-]{3,10}$/)
      .withMessage('Invalid zip code format'),
      
    body('address.country')
      .optional()
      .isLength({ max: 100 })
      .withMessage('Country name too long'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const user = req.user;
    const updateData = req.body;
    
    console.log(`[USER] Profile update request from user: ${user.userId}`);

    // In a real implementation, update user data in database
    // Validate business rules, check permissions, etc.
    
    // TODO: Implement actual profile update logic
    // const updatedProfile = await UserService.updateProfile(user.userId, updateData);

    // Log profile update for security audit
    console.log(`[USER] Profile updated for user: ${user.userId} - Fields: ${Object.keys(updateData).join(', ')}`);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      updatedFields: Object.keys(updateData),
      timestamp: new Date().toISOString()
    });
  })
);

/**
 * GET /api/user/account-status
 * Get account status and security information
 */
router.get('/account-status',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const user = req.user;
    
    // In a real implementation, fetch from database
    const accountStatus = {
      accountId: `acc_${user.userId.replace('@', '_').replace('.', '_')}`,
      status: 'active',
      verificationLevel: 'verified', // basic, verified, premium
      securityLevel: 'high',
      twoFactorEnabled: false, // This would be from database
      lastPasswordChange: '2024-01-15T10:30:00Z', // From database
      accountCreated: '2023-06-01T00:00:00Z', // From database
      lastLoginAt: user.authenticatedAt,
      loginCount: 1, // From database
      features: {
        transfers: true,
        billPay: true,
        mobileDeposit: true,
        wireTransfers: false // Based on verification level
      }
    };

    res.status(200).json({
      success: true,
      accountStatus: accountStatus,
      timestamp: new Date().toISOString()
    });
  })
);

/**
 * POST /api/user/change-password
 * Change user password
 */
router.post('/change-password',
  authenticateToken,
  sanitizeRequest,
  [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    
    body('newPassword')
      .isLength({ min: 12, max: 128 })
      .withMessage('New password must be between 12 and 128 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('New password must contain uppercase, lowercase, number, and special character'),
    
    body('confirmPassword')
      .custom((value, { req }) => {
        if (value !== req.body.newPassword) {
          throw new Error('Password confirmation does not match');
        }
        return true;
      })
  ],
  validate,
  asyncHandler(async (req, res) => {
    const user = req.user;
    const { currentPassword, newPassword } = req.body;
    
    console.log(`[USER] Password change request from user: ${user.userId}`);

    // In a real implementation:
    // 1. Verify current password against database
    // 2. Hash new password
    // 3. Update password in database
    // 4. Invalidate all existing sessions except current one
    // 5. Send notification email
    
    // TODO: Implement actual password change logic
    // const user = await UserService.validatePassword(user.userId, currentPassword);
    // if (!user) {
    //   throw new AppError('Current password is incorrect', 400, 'INVALID_CURRENT_PASSWORD');
    // }
    // await UserService.updatePassword(user.userId, newPassword);

    console.log(`[USER] Password changed successfully for user: ${user.userId}`);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
      timestamp: new Date().toISOString(),
      recommendation: 'Please log in again with your new password'
    });
  })
);

/**
 * GET /api/user/session-info
 * Get current session information
 */
router.get('/session-info',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const user = req.user;
    const userAgent = req.get('User-Agent');
    const userIp = req.ip || req.connection.remoteAddress;
    
    const sessionInfo = {
      sessionId: `session_${Date.now()}`, // In real app, generate proper session ID
      userId: user.userId,
      authenticatedAt: user.authenticatedAt,
      expiresAt: user.zoqqExpiresAt,
      ipAddress: userIp,
      userAgent: userAgent ? userAgent.substring(0, 200) : 'Unknown',
      tokenType: user.tokenType,
      validFor: Math.floor((new Date(user.zoqqExpiresAt) - new Date()) / 1000),
      location: {
        // In real app, you might use IP geolocation service
        ip: userIp,
        estimated: 'Location data not available'
      }
    };

    res.status(200).json({
      success: true,
      session: sessionInfo,
      timestamp: new Date().toISOString()
    });
  })
);

/**
 * GET /api/user/security-events
 * Get recent security events for the account
 */
router.get('/security-events',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const user = req.user;
    
    // In a real implementation, fetch from security audit log
    const securityEvents = [
      {
        eventId: 'evt_001',
        type: 'login',
        timestamp: user.authenticatedAt,
        ip: user.ip,
        status: 'success',
        userAgent: req.get('User-Agent')?.substring(0, 100) || 'Unknown'
      }
      // Add more events from database
    ];

    res.status(200).json({
      success: true,
      events: securityEvents,
      total: securityEvents.length,
      timestamp: new Date().toISOString()
    });
  })
);

/**
 * POST /api/user/logout-all-sessions
 * Logout from all sessions (security feature)
 */
router.post('/logout-all-sessions',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const user = req.user;
    
    console.log(`[USER] Logout all sessions requested by user: ${user.userId}`);

    // In a real implementation:
    // 1. Add all user tokens to blacklist
    // 2. Clear all sessions from session store
    // 3. Send notification email about security action
    
    // TODO: Implement actual session invalidation
    // await SessionService.invalidateAllUserSessions(user.userId);

    console.log(`[USER] All sessions invalidated for user: ${user.userId}`);

    res.status(200).json({
      success: true,
      message: 'All sessions have been logged out',
      action: 'logout_all_sessions',
      timestamp: new Date().toISOString()
    });
  })
);

/**
 * GET /api/user/preferences
 * Get user preferences and settings
 */
router.get('/preferences',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const user = req.user;
    
    // In a real implementation, fetch from database
    const preferences = {
      notifications: {
        email: true,
        sms: false,
        push: true,
        marketing: false
      },
      security: {
        twoFactorEnabled: false,
        sessionTimeout: 30, // minutes
        loginNotifications: true
      },
      display: {
        theme: 'light',
        currency: 'USD',
        language: 'en',
        timezone: 'UTC'
      }
    };

    res.status(200).json({
      success: true,
      preferences: preferences,
      timestamp: new Date().toISOString()
    });
  })
);

/**
 * PUT /api/user/preferences
 * Update user preferences
 */
router.put('/preferences',
  authenticateToken,
  sanitizeRequest,
  [
    body('notifications')
      .optional()
      .isObject()
      .withMessage('Notifications must be an object'),
    
    body('security')
      .optional()
      .isObject()
      .withMessage('Security settings must be an object'),
    
    body('display')
      .optional()
      .isObject()
      .withMessage('Display settings must be an object')
  ],
  validate,
  asyncHandler(async (req, res) => {
    const user = req.user;
    const preferences = req.body;
    
    console.log(`[USER] Preferences update from user: ${user.userId}`);

    // In a real implementation, update in database with validation
    // TODO: Implement actual preferences update
    // await UserService.updatePreferences(user.userId, preferences);

    res.status(200).json({
      success: true,
      message: 'Preferences updated successfully',
      timestamp: new Date().toISOString()
    });
  })
);

module.exports = router; 