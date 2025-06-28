/**
 * Zoqq Authentication Service
 * Handles authentication with the Zoqq API for banking/finance operations
 * Implements secure token management and API communication
 */

const axios = require("axios");
const jwt = require("jsonwebtoken");
const {
  AppError,
  externalApiErrorHandler,
} = require("../middleware/errorHandler");

class ZoqqAuthService {
  constructor() {
    this.baseUrl = process.env.ZOQQ_BASE_URL || "https://api.zoqq.com";
    this.clientId = process.env.ZOQQ_CLIENT_ID;
    this.apiKey = process.env.ZOQQ_API_KEY;
    this.jwtSecret = process.env.JWT_SECRET || 'stylopay-default-secret-key-change-in-production';

    // Check if Zoqq integration is enabled
    this.zoqqEnabled = !!(this.clientId && this.apiKey);
    
    if (!this.zoqqEnabled) {
      console.warn('[ZOQQ AUTH] Zoqq integration disabled - missing ZOQQ_CLIENT_ID or ZOQQ_API_KEY');
      console.warn('[ZOQQ AUTH] Authentication will work with local database only');
    }

    // Validate required JWT secret
    if (!this.jwtSecret) {
      throw new Error("Missing JWT_SECRET environment variable");
    }

    // Configure axios instance with security settings
    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000, // 30 seconds timeout for banking security
      headers: {
        "Content-Type": "application/json",
        "x-client-id": this.clientId,
        "x-api-key": this.apiKey,
      },
      validateStatus: (status) => status < 500, // Don't throw for 4xx errors
    });

    // Set up request/response interceptors for logging and security
    this.setupInterceptors();
  }

  /**
   * Set up axios interceptors for logging and security monitoring
   */
  setupInterceptors() {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const requestId = `req_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;
        config.headers["x-request-id"] = requestId;

        console.log(
          `[ZOQQ API] ${config.method.toUpperCase()} ${
            config.url
          } - Request ID: ${requestId}`
        );
        return config;
      },
      (error) => {
        console.error("[ZOQQ API] Request Error:", error.message);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => {
        const requestId = response.config.headers["x-request-id"];
        console.log(`[ZOQQ API] ${response.status} - Request ID: ${requestId}`);
        return response;
      },
      (error) => {
        const requestId = error.config?.headers?.["x-request-id"];
        console.error(`[ZOQQ API] Error - Request ID: ${requestId}`, {
          status: error.response?.status,
          message: error.response?.data?.message || error.message,
          code: error.response?.data?.code,
        });
        return Promise.reject(error);
      }
    );
  }

  /**
   * Create authentication token for user (with optional Zoqq integration)
   * @param {string} userEmail - User's email
   * @param {string} userIp - User's IP for security logging
   * @param {Object} userData - Additional user data from database
   * @returns {Promise<Object>} Authentication result with token and expiration
   */
  async authenticate(userEmail = null, userIp = null, userData = null) {
    try {
      console.log(
        `[AUTH] Creating authentication token${
          userEmail ? ` for user: ${userEmail}` : ""
        }`
      );

      const startTime = Date.now();
      let zoqqToken = null;
      let zoqqExpiresAt = null;

      // Try to get Zoqq token if integration is enabled
      if (this.zoqqEnabled) {
        try {
          const zoqqResult = await this.getZoqqToken();
          zoqqToken = zoqqResult.token;
          zoqqExpiresAt = zoqqResult.expires_at;
          console.log('[AUTH] Successfully obtained Zoqq token');
        } catch (error) {
          console.warn('[AUTH] Failed to obtain Zoqq token, proceeding with local auth only:', error.message);
        }
      }

      // Create expiration time (30 minutes from now)
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 30);
      
      // Create internal JWT token for the application
      const userRole = userData?.role || 'user';
      const internalTokenPayload = {
        userId: userData?.id || userData?._id || userEmail,
        email: userEmail,
        role: userRole,
        isAdmin: userRole === 'admin', // Add isAdmin field for compatibility
        zoqqToken: zoqqToken,
        zoqqExpiresAt: zoqqExpiresAt || expiresAt.toISOString(),
        ip: userIp,
        authenticatedAt: new Date().toISOString(),
        tokenType: "banking_session",
        isVerified: userData?.isVerified || false,
        accountStatus: userData?.accountStatus || 'pending_verification'
      };

      console.log('[AUTH] Creating token with payload:', {
        userId: internalTokenPayload.userId,
        email: internalTokenPayload.email,
        role: internalTokenPayload.role,
        tokenType: internalTokenPayload.tokenType,
        hasZoqqToken: !!internalTokenPayload.zoqqToken,
        zoqqEnabled: this.zoqqEnabled
      });

      const internalToken = jwt.sign(internalTokenPayload, this.jwtSecret, {
        expiresIn: "30m",
        issuer: "stylopay-backend",
        audience: "stylopay-frontend",
      });

      console.log('[AUTH] Token created successfully:', internalToken.substring(0, 20) + '...');

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      console.log(`[AUTH] Authentication token created in ${responseTime}ms`);

      return {
        success: true,
        token: internalToken,
        zoqqToken: zoqqToken,
        expiresAt: expiresAt.toISOString(),
        tokenType: "Bearer",
        validFor: Math.floor((expiresAt - new Date()) / 1000),
        refreshRequired: false,
        hasZoqqIntegration: !!zoqqToken
      };
    } catch (error) {
      console.error("[AUTH] Authentication error:", error);
      
      // Re-throw AppError instances
      if (error instanceof AppError) {
        throw error;
      }

      // Handle unexpected errors
      throw new AppError(
        "Authentication service encountered an unexpected error",
        500,
        "AUTH_UNEXPECTED_ERROR"
      );
    }
  }

  /**
   * Get Zoqq token (if integration is enabled)
   * @returns {Promise<Object>} Zoqq token and expiration
   */
  async getZoqqToken() {
    if (!this.zoqqEnabled) {
      throw new Error('Zoqq integration is not enabled');
    }

    try {
      // Make authentication request to Zoqq API
      const response = await this.axiosInstance.post(
        "/api/v1/authentication/login"
      );

      // Validate response structure
      if (!response.data || !response.data.token || !response.data.expires_at) {
        throw new AppError(
          "Invalid response structure from Zoqq API",
          502,
          "INVALID_AUTH_RESPONSE"
        );
      }

      const { token: zoqqToken, expires_at } = response.data;

      // Validate token format (should be JWT)
      if (!this.isValidJWT(zoqqToken)) {
        throw new AppError(
          "Invalid token format received from Zoqq API",
          502,
          "INVALID_TOKEN_FORMAT"
        );
      }

      // Parse expiration date
      const expiresAt = new Date(expires_at);
      const now = new Date();

      if (expiresAt <= now) {
        throw new AppError(
          "Received expired token from Zoqq API",
          502,
          "EXPIRED_TOKEN_RECEIVED"
        );
      }

      return {
        token: zoqqToken,
        expires_at: expires_at
      };

    } catch (error) {
      // Handle different types of errors
      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data;

        console.error(`[ZOQQ API] Error ${status}:`, errorData);

        if (status === 401) {
          throw new AppError(
            "Zoqq authentication credentials are invalid",
            401,
            "ZOQQ_INVALID_CREDENTIALS"
          );
        }

        if (status === 403) {
          throw new AppError(
            "Access denied by Zoqq authentication service",
            403,
            "ZOQQ_ACCESS_DENIED"
          );
        }

        if (status === 429) {
          throw new AppError(
            "Too many Zoqq authentication requests",
            429,
            "ZOQQ_RATE_LIMITED"
          );
        }

        throw externalApiErrorHandler(error, "Zoqq");
      }

      if (error.code === "ECONNREFUSED" || error.code === "ENOTFOUND") {
        throw new AppError(
          "Zoqq authentication service is unavailable",
          503,
          "ZOQQ_SERVICE_UNAVAILABLE"
        );
      }

      if (error.code === "ECONNABORTED") {
        throw new AppError(
          "Zoqq authentication request timed out",
          408,
          "ZOQQ_TIMEOUT"
        );
      }

      // Re-throw AppError instances
      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError(
        "Zoqq authentication service encountered an error",
        500,
        "ZOQQ_UNEXPECTED_ERROR"
      );
    }
  }

  /**
   * Validate JWT token format
   * @param {string} token - Token to validate
   * @returns {boolean} Whether token has valid JWT format
   */
  isValidJWT(token) {
    if (!token || typeof token !== "string") {
      return false;
    }

    const parts = token.split(".");
    return parts.length === 3 && parts.every((part) => part.length > 0);
  }

  /**
   * Refresh authentication token if needed
   * @param {string} currentToken - Current internal token
   * @returns {Promise<Object>} New authentication result or current token status
   */
  async refreshTokenIfNeeded(currentToken) {
    try {
      // Decode current token to check expiration
      const decoded = jwt.verify(currentToken, this.jwtSecret);
      const expiresAt = new Date(decoded.zoqqExpiresAt);
      const now = new Date();
      const timeUntilExpiry = expiresAt - now;

      // Refresh if token expires in less than 5 minutes
      if (timeUntilExpiry < 5 * 60 * 1000) {
        console.log("[ZOQQ AUTH] Token refresh required");
        return await this.authenticate(decoded.userId, decoded.ip);
      }

      return {
        success: true,
        token: currentToken,
        refreshRequired: false,
        validFor: Math.floor(timeUntilExpiry / 1000),
      };
    } catch (error) {
      console.log("[ZOQQ AUTH] Token refresh needed due to invalid token");
      // Token is invalid, need fresh authentication
      throw new AppError(
        "Token is invalid and requires re-authentication",
        401,
        "TOKEN_REFRESH_REQUIRED"
      );
    }
  }

  /**
   * Validate internal application token
   * @param {string} token - Internal token to validate
   * @returns {Object} Decoded token payload
   */
  validateInternalToken(token) {
    try {
      console.log('[ZOQQ AUTH] Validating token:', token ? `${token.substring(0, 20)}...` : 'null');
      
      if (!token) {
        throw new AppError("No token provided", 401, "NO_TOKEN");
      }

      const decoded = jwt.verify(token, this.jwtSecret);
      console.log('[ZOQQ AUTH] Token decoded successfully:', {
        userId: decoded.userId,
        tokenType: decoded.tokenType,
        zoqqExpiresAt: decoded.zoqqExpiresAt,
        hasZoqqToken: !!decoded.zoqqToken
      });

      // Additional validation
      if (decoded.tokenType !== "banking_session") {
        console.log('[ZOQQ AUTH] Token structure validation failed:', {
          hasZoqqToken: !!decoded.zoqqToken,
          tokenType: decoded.tokenType,
          expected: "banking_session"
        });
        throw new AppError(
          "Invalid token structure",
          401,
          "INVALID_TOKEN_STRUCTURE"
        );
      }

      // Zoqq token can be null if integration is disabled
      if (this.zoqqEnabled && !decoded.zoqqToken) {
        console.log('[ZOQQ AUTH] Zoqq token missing but integration is enabled');
        throw new AppError(
          "Missing Zoqq token",
          401,
          "MISSING_ZOQQ_TOKEN"
        );
      }

      console.log('[ZOQQ AUTH] Token validation successful');
      return decoded;
    } catch (error) {
      console.log('[ZOQQ AUTH] Token validation failed:', error.message);
      
      if (error.name === "TokenExpiredError") {
        throw new AppError("Token has expired", 401, "TOKEN_EXPIRED");
      }

      if (error.name === "JsonWebTokenError") {
        throw new AppError("Invalid token", 401, "INVALID_TOKEN");
      }

      throw error;
    }
  }

  /**
   * Get Zoqq token from internal token
   * @param {string} internalToken - Internal application token
   * @returns {string} Zoqq API token
   */
  getZoqqTokenFromInternal(internalToken) {
    const decoded = this.validateInternalToken(internalToken);
    return decoded.zoqqToken;
  }

  /**
   * Check if a user exists in the system
   * @param {string} email - Email address to check
   * @returns {Object} Result indicating if user exists
   * @throws {Error} If the check fails
   */
  async checkUserExists(email) {
    try {
      console.log(`[AUTH] Checking if user exists: ${email}`);

      // Import User model dynamically to avoid circular dependencies
      const User = require('../models/User');

      // Check if user exists in database
      const user = await User.findByEmail(email);

      return {
        success: true,
        data: {
          exists: !!user,
          email: email.toLowerCase(),
          user: user ? {
            id: user._id,
            email: user.email,
            isVerified: user.isVerified,
            accountStatus: user.accountStatus
          } : null
        },
      };
    } catch (error) {
      console.error(
        `[AUTH] User existence check failed for ${email}: ${error.message}`
      );

      // Return error response
      return {
        success: false,
        error: "Failed to check user existence",
        code: "USER_CHECK_FAILED",
      };
    }
  }

  /**
   * Authenticate user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {string} userIp - User's IP address
   * @returns {Object} Authentication result
   */
  async authenticateUser(email, password, userIp = null) {
    try {
      console.log(`[AUTH] Authenticating user: ${email}`);

      // Import User model dynamically
      const User = require('../models/User');

      // Find user and include password field
      const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

      if (!user) {
        throw new AppError(
          "Invalid email or password",
          401,
          "INVALID_CREDENTIALS"
        );
      }

      // Check if account is locked
      if (user.isLocked) {
        throw new AppError(
          "Account is temporarily locked due to too many failed login attempts",
          423,
          "ACCOUNT_LOCKED"
        );
      }

      // Check if account is active
      if (user.accountStatus === 'suspended') {
        throw new AppError(
          "Account is suspended. Please contact support.",
          403,
          "ACCOUNT_SUSPENDED"
        );
      }

      if (user.accountStatus === 'closed') {
        throw new AppError(
          "Account is closed. Please contact support.",
          403,
          "ACCOUNT_CLOSED"
        );
      }

      // Compare password
      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        // Increment login attempts
        await user.incLoginAttempts();
        
        throw new AppError(
          "Invalid email or password",
          401,
          "INVALID_CREDENTIALS"
        );
      }

      // Reset login attempts on successful login
      if (user.loginAttempts > 0) {
        await user.resetLoginAttempts();
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Create authentication token
      const authResult = await this.authenticate(user.email, userIp, user);

      console.log(`[AUTH] User authentication successful: ${email}`);

      return {
        success: true,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          role: user.role,
          isVerified: user.isVerified,
          accountStatus: user.accountStatus,
          lastLogin: user.lastLogin,
          profileCompleteness: user.profileCompleteness
        },
        ...authResult
      };

    } catch (error) {
      console.error(`[AUTH] User authentication failed for ${email}:`, error.message);
      
      // Re-throw AppError instances
      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError(
        "Authentication failed",
        500,
        "AUTH_ERROR"
      );
    }
  }

  /**
   * Create new user account
   * @param {Object} userData - User registration data
   * @returns {Object} Created user data
   */
  async createUser(userData) {
    try {
      console.log(`[AUTH] Creating new user: ${userData.email}`);

      // Import User model dynamically
      const User = require('../models/User');

      // Create new user
      const user = new User({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email.toLowerCase(),
        password: userData.password,
        // Generate account number for banking
        accountNumber: null // Will be generated when account is verified
      });

      // Save user to database
      await user.save();

      console.log(`[AUTH] User created successfully: ${userData.email}`);

      return {
        success: true,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          accountStatus: user.accountStatus,
          isVerified: user.isVerified,
          profileCompleteness: user.profileCompleteness,
          createdAt: user.createdAt
        }
      };

    } catch (error) {
      console.error(`[AUTH] User creation failed for ${userData.email}:`, error.message);

      // Handle duplicate email error
      if (error.code === 11000 && error.keyPattern?.email) {
        throw new AppError(
          "An account with this email address already exists",
          409,
          "USER_EXISTS"
        );
      }

      // Handle validation errors
      if (error.name === 'ValidationError') {
        const firstError = Object.values(error.errors)[0];
        throw new AppError(
          firstError.message,
          400,
          "VALIDATION_ERROR"
        );
      }

      throw new AppError(
        "User creation failed",
        500,
        "USER_CREATION_ERROR"
      );
    }
  }
}

// Export singleton instance
module.exports = new ZoqqAuthService();
