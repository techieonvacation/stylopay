/**
 * Zoqq Authentication and User Management Service
 * Handles authentication with the Zoqq API for banking/finance operations
 * Implements secure token management and comprehensive user lifecycle management
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
    this.programId = process.env.ZOQQ_PROGRAM_ID;
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

        // Log request (excluding sensitive data)
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
   * Generate a unique idempotency key for API requests
   * @returns {string} Unique request ID
   */
  generateIdempotencyKey() {
    return `stylopay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // ========== AUTHENTICATION APIs ==========

  /**
   * Authenticate with Zoqq API and get access token
   * Endpoint: POST {{baseUrl}}/api/v1/authentication/login
   * @returns {Promise<Object>} Authentication result with token and expiration
   */
  async getZoqqToken() {
    if (!this.zoqqEnabled) {
      throw new AppError('Zoqq integration is not enabled', 400, 'ZOQQ_DISABLED');
    }

    try {
      console.log('[ZOQQ AUTH] Requesting authentication token...');
      
      const startTime = Date.now();
      const response = await this.axiosInstance.post('/api/v1/authentication/login', {}, {
        headers: {
          'x-client-id': this.clientId,
          'x-api-key': this.apiKey,
          'Content-Type': 'application/json'
        }
      });

      const endTime = Date.now();
      console.log(`[ZOQQ AUTH] Token request completed in ${endTime - startTime}ms`);

      if (response.status === 200 && response.data.token) {
        console.log('[ZOQQ AUTH] Authentication successful');
        return {
          token: response.data.token,
          expires_at: response.data.expires_at,
          success: true
        };
      } else {
        throw new AppError('Invalid authentication response from Zoqq', 401, 'ZOQQ_AUTH_INVALID');
      }
    } catch (error) {
      console.error('[ZOQQ AUTH] Authentication failed:', error.message);
      
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || 'Authentication failed';
        
        if (status === 401) {
          throw new AppError('Invalid Zoqq credentials', 401, 'ZOQQ_AUTH_INVALID');
        } else if (status === 403) {
          throw new AppError('Zoqq access forbidden', 403, 'ZOQQ_AUTH_FORBIDDEN');
        } else {
          throw new AppError(`Zoqq authentication error: ${message}`, status, 'ZOQQ_AUTH_ERROR');
        }
      }
      
      throw error instanceof AppError ? error : new AppError(
        'Zoqq authentication service unavailable',
        503,
        'ZOQQ_SERVICE_UNAVAILABLE'
      );
    }
  }

  // ========== USER MANAGEMENT APIs ==========

  /**
   * Create a new user account with business and personal details
   * Endpoint: POST {{baseUrl}}/zoqq/api/v1/user
   * @param {Object} userDetails - Complete user data as per Zoqq requirements
   * @param {string} bearerToken - Valid bearer token from authentication
   * @returns {Promise<Object>} User creation result with account ID
   */
  async createUser(userDetails, bearerToken) {
    if (!this.zoqqEnabled) {
      throw new AppError('Zoqq integration is not enabled', 400, 'ZOQQ_DISABLED');
    }

    try {
      console.log('[ZOQQ USER] Creating new user account...');
      
      const idempotencyKey = this.generateIdempotencyKey();
      const startTime = Date.now();

      // Validate required fields according to Zoqq documentation
      const requiredFields = [
        'emailId', 'amount', 'currency', 'businessName', 'businessStructure',
        'contactNumber', 'identificationType', 'Idnumber', 'issuingCountryCode',
        'effectiveAt', 'expireAt', 'firstName', 'lastName', 'dateOfBirth',
        'nationality', 'mobile', 'roles', 'legalEntityType', 'asTrustee',
        'agreedToTermsAndConditions', 'productReference', 'type', 'number',
        'descriptionOfGoodsOrServices', 'industryCategoryCode', 'operatingCountry',
        'registrationAddressLine1', 'registrationCountryCode', 'registrationPostcode',
        'registrationState', 'registrationSuburb', 'residentialAddressLine1',
        'residentialCountryCode', 'residentialPostcode', 'residentialState',
        'residentialSuburb', 'fileId', 'tag', 'frontFileId', 'personDocumentsFileId',
        'personDocumentsTag', 'liveSelfieFileId', 'countryCode'
      ];

      // Check for missing required fields
      const missingFields = requiredFields.filter(field => !userDetails[field]);
      if (missingFields.length > 0) {
        throw new AppError(
          `Missing required fields: ${missingFields.join(', ')}`,
          400,
          'MISSING_REQUIRED_FIELDS'
        );
      }

      const response = await this.axiosInstance.post('/zoqq/api/v1/user', userDetails, {
        headers: {
          'x-api-key': this.apiKey,
          'x-program-id': this.programId || 'default',
          'x-request-id': idempotencyKey,
          'Authorization': `Bearer ${bearerToken}`,
          'Content-Type': 'application/json'
        }
      });

      const endTime = Date.now();
      console.log(`[ZOQQ USER] User creation completed in ${endTime - startTime}ms`);

      if (response.status === 200 && response.data.status === 'Success') {
        console.log('[ZOQQ USER] User created successfully:', response.data.data[0].accountid);
        return {
          success: true,
          accountId: response.data.data[0].accountid,
          message: response.data.message,
          status: response.data.status
        };
      } else {
        throw new AppError(
          response.data?.message || 'User creation failed',
          response.status || 400,
          'ZOQQ_USER_CREATION_FAILED'
        );
      }
    } catch (error) {
      console.error('[ZOQQ USER] User creation failed:', error.message);
      
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || 'User creation failed';
        throw new AppError(`Zoqq user creation error: ${message}`, status, 'ZOQQ_USER_ERROR');
      }
      
      throw error instanceof AppError ? error : new AppError(
        'Zoqq user service unavailable',
        503,
        'ZOQQ_SERVICE_UNAVAILABLE'
      );
    }
  }

  /**
   * Retrieve user details from the system
   * Endpoint: GET {{baseUrl}}/zoqq/api/v1/user
   * @param {string} userId - User identification key
   * @param {string} bearerToken - Valid bearer token
   * @returns {Promise<Object>} User details
   */
  async getUser(userId, bearerToken) {
    if (!this.zoqqEnabled) {
      throw new AppError('Zoqq integration is not enabled', 400, 'ZOQQ_DISABLED');
    }

    try {
      console.log('[ZOQQ USER] Retrieving user details for:', userId);
      
      const idempotencyKey = this.generateIdempotencyKey();
      const startTime = Date.now();

      const response = await this.axiosInstance.get('/zoqq/api/v1/user', {
        headers: {
          'x-api-key': this.apiKey,
          'x-program-id': this.programId || 'default',
          'x-request-id': idempotencyKey,
          'x-user-id': userId,
          'Authorization': `Bearer ${bearerToken}`,
          'Content-Type': 'application/json'
        }
      });

      const endTime = Date.now();
      console.log(`[ZOQQ USER] User retrieval completed in ${endTime - startTime}ms`);

      if (response.status === 200 && response.data.status === 'success') {
        console.log('[ZOQQ USER] User details retrieved successfully');
        return {
          success: true,
          userData: response.data.data,
          message: response.data.message
        };
      } else {
        throw new AppError(
          response.data?.message || 'Failed to retrieve user details',
          response.status || 400,
          'ZOQQ_USER_RETRIEVAL_FAILED'
        );
      }
    } catch (error) {
      console.error('[ZOQQ USER] User retrieval failed:', error.message);
      
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || 'User retrieval failed';
        throw new AppError(`Zoqq user retrieval error: ${message}`, status, 'ZOQQ_USER_ERROR');
      }
      
      throw error instanceof AppError ? error : new AppError(
        'Zoqq user service unavailable',
        503,
        'ZOQQ_SERVICE_UNAVAILABLE'
      );
    }
  }

  /**
   * Accept Terms and Conditions
   * Endpoint: GET {{baseUrl}}/zoqq/api/v1/user/termsConditions
   * @param {string} userId - User identification key
   * @param {string} bearerToken - Valid bearer token
   * @returns {Promise<Object>} Terms acceptance result
   */
  async acceptTermsAndConditions(userId, bearerToken) {
    if (!this.zoqqEnabled) {
      throw new AppError('Zoqq integration is not enabled', 400, 'ZOQQ_DISABLED');
    }

    try {
      console.log('[ZOQQ TERMS] Accepting terms and conditions for user:', userId);
      
      const idempotencyKey = this.generateIdempotencyKey();
      const startTime = Date.now();

      const response = await this.axiosInstance.get('/zoqq/api/v1/user/termsConditions', {
        headers: {
          'x-api-key': this.apiKey,
          'x-program-id': this.programId || 'default',
          'x-request-id': idempotencyKey,
          'x-user-id': userId,
          'Authorization': `Bearer ${bearerToken}`,
          'Content-Type': 'application/json'
        }
      });

      const endTime = Date.now();
      console.log(`[ZOQQ TERMS] Terms acceptance completed in ${endTime - startTime}ms`);

      if (response.status === 200 && response.data.status === 'success') {
        console.log('[ZOQQ TERMS] Terms and conditions accepted successfully');
        return {
          success: true,
          message: response.data.message
        };
      } else {
        throw new AppError(
          response.data?.message || 'Failed to accept terms and conditions',
          response.status || 400,
          'ZOQQ_TERMS_ACCEPTANCE_FAILED'
        );
      }
    } catch (error) {
      console.error('[ZOQQ TERMS] Terms acceptance failed:', error.message);
      
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || 'Terms acceptance failed';
        throw new AppError(`Zoqq terms acceptance error: ${message}`, status, 'ZOQQ_TERMS_ERROR');
      }
      
      throw error instanceof AppError ? error : new AppError(
        'Zoqq terms service unavailable',
        503,
        'ZOQQ_SERVICE_UNAVAILABLE'
      );
    }
  }

  /**
   * Activate user account
   * Endpoint: GET {{baseUrl}}/zoqq/api/v1/user/activate
   * @param {string} userId - User identification key
   * @param {string} bearerToken - Valid bearer token
   * @returns {Promise<Object>} Account activation result
   */
  async activateAccount(userId, bearerToken) {
    if (!this.zoqqEnabled) {
      throw new AppError('Zoqq integration is not enabled', 400, 'ZOQQ_DISABLED');
    }

    try {
      console.log('[ZOQQ ACTIVATE] Activating account for user:', userId);
      
      const idempotencyKey = this.generateIdempotencyKey();
      const startTime = Date.now();

      const response = await this.axiosInstance.get('/zoqq/api/v1/user/activate', {
        headers: {
          'x-api-key': this.apiKey,
          'x-program-id': this.programId || 'default',
          'x-request-id': idempotencyKey,
          'x-user-id': userId,
          'Authorization': `Bearer ${bearerToken}`,
          'Content-Type': 'application/json'
        }
      });

      const endTime = Date.now();
      console.log(`[ZOQQ ACTIVATE] Account activation completed in ${endTime - startTime}ms`);

      if (response.status === 200 && response.data.status === 'success') {
        console.log('[ZOQQ ACTIVATE] Account activated successfully');
        return {
          success: true,
          message: response.data.message
        };
      } else {
        throw new AppError(
          response.data?.message || 'Account activation failed',
          response.status || 400,
          'ZOQQ_ACTIVATION_FAILED'
        );
      }
    } catch (error) {
      console.error('[ZOQQ ACTIVATE] Account activation failed:', error.message);
      
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || 'Account activation failed';
        throw new AppError(`Zoqq activation error: ${message}`, status, 'ZOQQ_ACTIVATION_ERROR');
      }
      
      throw error instanceof AppError ? error : new AppError(
        'Zoqq activation service unavailable',
        503,
        'ZOQQ_SERVICE_UNAVAILABLE'
      );
    }
  }

  // ========== RFI (Request for Information) APIs ==========

  /**
   * Retrieve RFI details
   * Endpoint: GET {{baseUrl}}/zoqq/api/v1/user/rfi
   * @param {string} userId - User identification key
   * @param {string} bearerToken - Valid bearer token
   * @returns {Promise<Object>} RFI details
   */
  async getRFI(userId, bearerToken) {
    if (!this.zoqqEnabled) {
      throw new AppError('Zoqq integration is not enabled', 400, 'ZOQQ_DISABLED');
    }

    try {
      console.log('[ZOQQ RFI] Retrieving RFI details for user:', userId);
      
      const idempotencyKey = this.generateIdempotencyKey();
      const startTime = Date.now();

      const response = await this.axiosInstance.get('/zoqq/api/v1/user/rfi', {
        headers: {
          'x-api-key': this.apiKey,
          'x-program-id': this.programId || 'default',
          'x-request-id': idempotencyKey,
          'x-user-id': userId,
          'Authorization': `Bearer ${bearerToken}`,
          'Content-Type': 'application/json'
        }
      });

      const endTime = Date.now();
      console.log(`[ZOQQ RFI] RFI retrieval completed in ${endTime - startTime}ms`);

      if (response.status === 200) {
        console.log('[ZOQQ RFI] RFI details retrieved successfully');
        return {
          success: true,
          rfiData: response.data
        };
      } else {
        throw new AppError(
          'Failed to retrieve RFI details',
          response.status || 400,
          'ZOQQ_RFI_RETRIEVAL_FAILED'
        );
      }
    } catch (error) {
      console.error('[ZOQQ RFI] RFI retrieval failed:', error.message);
      
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || 'RFI retrieval failed';
        throw new AppError(`Zoqq RFI retrieval error: ${message}`, status, 'ZOQQ_RFI_ERROR');
      }
      
      throw error instanceof AppError ? error : new AppError(
        'Zoqq RFI service unavailable',
        503,
        'ZOQQ_SERVICE_UNAVAILABLE'
      );
    }
  }

  /**
   * Respond to RFI request
   * Endpoint: POST {{baseUrl}}/zoqq/api/v1/user/rfi
   * @param {string} userId - User identification key
   * @param {Object} rfiResponse - RFI response data
   * @param {string} bearerToken - Valid bearer token
   * @returns {Promise<Object>} RFI response result
   */
  async respondToRFI(userId, rfiResponse, bearerToken) {
    if (!this.zoqqEnabled) {
      throw new AppError('Zoqq integration is not enabled', 400, 'ZOQQ_DISABLED');
    }

    try {
      console.log('[ZOQQ RFI] Responding to RFI for user:', userId);
      
      const idempotencyKey = this.generateIdempotencyKey();
      const startTime = Date.now();

      // Validate required RFI response fields
      if (!rfiResponse.id || !rfiResponse.type) {
        throw new AppError(
          'Missing required RFI response fields: id and type are required',
          400,
          'MISSING_RFI_FIELDS'
        );
      }

      const response = await this.axiosInstance.post('/zoqq/api/v1/user/rfi', rfiResponse, {
        headers: {
          'x-api-key': this.apiKey,
          'x-program-id': this.programId || 'default',
          'x-request-id': idempotencyKey,
          'x-user-id': userId,
          'Authorization': `Bearer ${bearerToken}`,
          'Content-Type': 'application/json'
        }
      });

      const endTime = Date.now();
      console.log(`[ZOQQ RFI] RFI response completed in ${endTime - startTime}ms`);

      if (response.status === 200) {
        console.log('[ZOQQ RFI] RFI response submitted successfully');
        return {
          success: true,
          message: 'RFI response submitted successfully',
          data: response.data
        };
      } else {
        throw new AppError(
          'Failed to submit RFI response',
          response.status || 400,
          'ZOQQ_RFI_RESPONSE_FAILED'
        );
      }
    } catch (error) {
      console.error('[ZOQQ RFI] RFI response failed:', error.message);
      
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || 'RFI response failed';
        throw new AppError(`Zoqq RFI response error: ${message}`, status, 'ZOQQ_RFI_ERROR');
      }
      
      throw error instanceof AppError ? error : new AppError(
        'Zoqq RFI service unavailable',
        503,
        'ZOQQ_SERVICE_UNAVAILABLE'
      );
    }
  }

  // ========== INTERNAL AUTH METHODS (EXISTING) ==========

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
        isAdmin: userRole === 'admin',
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
   * Create a new user in the database
   * @param {Object} userData - User data including email, password, names, role, etc.
   * @returns {Object} Result with user creation status
   */
  async createUser(userData) {
    try {
      console.log(`[AUTH] Creating new user: ${userData.email}`);

      // Import User model dynamically to avoid circular dependencies
      const User = require('../models/User');

      // Create new user in database
      const newUser = new User({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email.toLowerCase(),
        password: userData.password,
        role: userData.role || 'user',
        accountStatus: 'pending_verification'
      });

      // Generate unique account number
      newUser.accountNumber = newUser.generateAccountNumber();

      // Save user to database
      const savedUser = await newUser.save();

      console.log(`[AUTH] User created successfully: ${savedUser.email} with role: ${savedUser.role}`);

      return {
        success: true,
        user: {
          id: savedUser._id,
          email: savedUser.email,
          firstName: savedUser.firstName,
          lastName: savedUser.lastName,
          role: savedUser.role,
          accountNumber: savedUser.accountNumber,
          accountStatus: savedUser.accountStatus,
          isVerified: savedUser.isVerified,
          profileCompleteness: savedUser.profileCompleteness
        }
      };
    } catch (error) {
      console.error(`[AUTH] User creation failed for ${userData.email}:`, error.message);
      
      if (error.code === 11000) {
        // Duplicate key error (email already exists)
        if (error.message.includes('email')) {
          throw new AppError('Email address already exists', 409, 'EMAIL_EXISTS');
        }
        if (error.message.includes('accountNumber')) {
          throw new AppError('Account number generation failed', 500, 'ACCOUNT_NUMBER_ERROR');
        }
      }

      if (error.name === 'ValidationError') {
        const validationErrors = Object.values(error.errors).map(err => err.message);
        throw new AppError(`Validation failed: ${validationErrors.join(', ')}`, 400, 'VALIDATION_ERROR');
      }

      throw new AppError('User creation failed', 500, 'USER_CREATION_ERROR');
    }
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
            accountStatus: user.accountStatus,
            role: user.role
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
}

// Export singleton instance
module.exports = new ZoqqAuthService();
