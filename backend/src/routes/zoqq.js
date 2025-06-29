/**
 * Zoqq API Integration Routes
 * Comprehensive implementation of all Zoqq endpoints as per API documentation
 * Includes authentication, user management, onboarding, and RFI handling
 */

const express = require("express");
const { body, param, validationResult } = require("express-validator");
const User = require("../models/User");
const zoqqAuthService = require("../services/zoqqAuth");
const { AppError } = require("../middleware/errorHandler");
const { authenticateToken } = require("../middleware/security");

const router = express.Router();
// zoqqAuthService is already instantiated as a singleton

// ========== VALIDATION MIDDLEWARE ==========

/**
 * Handle validation errors consistently
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "error",
      message: "Validation failed",
      errors: errors.array(),
      code: "VALIDATION_ERROR"
    });
  }
  next();
};

/**
 * Extract and validate Zoqq token from user's JWT
 */
const extractZoqqToken = (req, res, next) => {
  try {
    const userToken = req.user;
    if (!userToken || !userToken.zoqqToken) {
      return res.status(401).json({
        status: "error",
        message: "Zoqq authentication required. Please login again.",
        code: "ZOQQ_TOKEN_MISSING"
      });
    }
    
    // Check token expiration
    if (userToken.zoqqExpiresAt && new Date(userToken.zoqqExpiresAt) < new Date()) {
      return res.status(401).json({
        status: "error",
        message: "Zoqq token expired. Please login again.",
        code: "ZOQQ_TOKEN_EXPIRED"
      });
    }
    
    req.zoqqToken = userToken.zoqqToken;
    req.userId = userToken.userId;
    next();
  } catch (error) {
    console.error('[ZOQQ ROUTES] Error extracting Zoqq token:', error);
    return res.status(401).json({
      status: "error",
      message: "Invalid authentication token",
      code: "INVALID_TOKEN"
    });
  }
};

// ========== AUTHENTICATION ENDPOINTS ==========

/**
 * GET ZOQQ TOKEN
 * POST /api/zoqq/auth/token
 * Obtains a fresh Zoqq authentication token
 */
router.post("/auth/token", authenticateToken, async (req, res) => {
  try {
    console.log('[ZOQQ AUTH] Requesting new Zoqq token...');
    
    const result = await zoqqAuthService.getZoqqToken();
    
    if (result.success) {
      console.log('[ZOQQ AUTH] Token obtained successfully');
      
      res.status(200).json({
        status: "success",
        message: "Zoqq authentication token obtained successfully",
        code: "TOKEN_OBTAINED",
        data: {
          token: result.token,
          expires_at: result.expires_at,
          valid_for_minutes: Math.floor((new Date(result.expires_at) - new Date()) / 60000)
        }
      });
    } else {
      throw new AppError("Failed to obtain Zoqq token", 401, "TOKEN_FAILED");
    }
  } catch (error) {
    console.error('[ZOQQ AUTH] Token request failed:', error);
    
    res.status(error.statusCode || 500).json({
      status: "error",
      message: error.message || "Failed to obtain authentication token",
      code: error.code || "AUTH_ERROR"
    });
  }
});

// ========== USER MANAGEMENT ENDPOINTS ==========

/**
 * CREATE USER IN ZOQQ SYSTEM
 * POST /api/zoqq/user/create
 * Creates a comprehensive user account with business and personal details
 */
router.post("/user/create",
  authenticateToken,
  extractZoqqToken,
  [
    // Business Information
    body("emailId").isEmail().normalizeEmail().withMessage("Valid email address is required"),
    body("amount").isNumeric({ min: 0 }).withMessage("Amount must be a positive number"),
    body("currency").isLength({ min: 3, max: 3 }).isAlpha().withMessage("Currency must be 3-letter code"),
    body("businessName").isLength({ min: 2, max: 100 }).withMessage("Business name must be 2-100 characters"),
    body("businessStructure").isIn(['COMPANY', 'PARTNERSHIP', 'SOLE_PROPRIETORSHIP', 'TRUST', 'OTHER']).withMessage("Valid business structure required"),
    body("contactNumber").isMobilePhone().withMessage("Valid contact number required"),
    
    // Personal Information
    body("firstName").isLength({ min: 1, max: 50 }).withMessage("First name is required (1-50 characters)"),
    body("lastName").isLength({ min: 1, max: 50 }).withMessage("Last name is required (1-50 characters)"),
    body("middleName").optional().isLength({ max: 50 }).withMessage("Middle name max 50 characters"),
    body("dateOfBirth").isISO8601().withMessage("Valid date of birth required (YYYY-MM-DD)"),
    body("nationality").isLength({ min: 2, max: 2 }).isAlpha().withMessage("Nationality must be 2-letter country code"),
    body("mobile").isMobilePhone().withMessage("Valid mobile number required"),
    
    // Identity Documents
    body("identificationType").isIn(['Passport', 'National_ID', 'Driving_License']).withMessage("Valid identification type required"),
    body("Idnumber").isLength({ min: 5, max: 20 }).withMessage("ID number required (5-20 characters)"),
    body("issuingCountryCode").isLength({ min: 2, max: 2 }).isAlpha().withMessage("Valid issuing country code required"),
    body("effectiveAt").isISO8601().withMessage("Valid effective date required (YYYY-MM-DD)"),
    body("expireAt").isISO8601().withMessage("Valid expiry date required (YYYY-MM-DD)"),
    
    // Legal and Compliance
    body("roles").isIn(['BENEFICIAL_OWNER', 'DIRECTOR', 'SIGNATORY', 'OTHER']).withMessage("Valid role required"),
    body("legalEntityType").isIn(['BUSINESS', 'INDIVIDUAL']).withMessage("Valid legal entity type required"),
    body("asTrustee").isBoolean().withMessage("asTrustee must be boolean"),
    body("agreedToTermsAndConditions").isBoolean().withMessage("Terms and conditions agreement required"),
    body("productReference").isIn([
      'ACCEPT_ONLINE_PAYMENTS', 'COLLECT_MARKETPLACE_PROCEEDS', 'RECEIVE_TRANSFERS',
      'GET_PAID', 'CONVERT_FUNDS', 'MAKE_TRANSFERS', 'CREATE_CARDS', 'MANAGE_EXPENSES',
      'USE_AWX_API', 'TRANSFER_CNY_INBOUND'
    ]).withMessage("Valid product reference required"),
    
    // Business Registration
    body("type").isLength({ min: 1, max: 20 }).withMessage("Business registration type required"),
    body("number").isLength({ min: 5, max: 20 }).withMessage("Business registration number required (5-20 characters)"),
    body("descriptionOfGoodsOrServices").isLength({ min: 10, max: 500 }).withMessage("Service description required (10-500 characters)"),
    body("industryCategoryCode").matches(/^ICCV3_[A-Z0-9]+$/).withMessage("Valid industry category code required (ICCV3_XXXXXX format)"),
    body("operatingCountry").isLength({ min: 2, max: 2 }).isAlpha().withMessage("Valid operating country code required"),
    
    // Addresses
    body("registrationAddressLine1").isLength({ min: 5, max: 100 }).withMessage("Registration address line 1 required (5-100 characters)"),
    body("registrationAddressLine2").optional().isLength({ max: 100 }).withMessage("Registration address line 2 max 100 characters"),
    body("registrationCountryCode").isLength({ min: 2, max: 2 }).isAlpha().withMessage("Valid registration country code required"),
    body("registrationPostcode").isLength({ min: 3, max: 10 }).withMessage("Valid registration postcode required (3-10 characters)"),
    body("registrationState").isLength({ min: 2, max: 50 }).withMessage("Registration state required (2-50 characters)"),
    body("registrationSuburb").isLength({ min: 2, max: 50 }).withMessage("Registration suburb required (2-50 characters)"),
    
    body("residentialAddressLine1").isLength({ min: 5, max: 100 }).withMessage("Residential address line 1 required (5-100 characters)"),
    body("residentialCountryCode").isLength({ min: 2, max: 2 }).isAlpha().withMessage("Valid residential country code required"),
    body("residentialPostcode").isLength({ min: 3, max: 10 }).withMessage("Valid residential postcode required (3-10 characters)"),
    body("residentialState").isLength({ min: 2, max: 50 }).withMessage("Residential state required (2-50 characters)"),
    body("residentialSuburb").isLength({ min: 2, max: 50 }).withMessage("Residential suburb required (2-50 characters)"),
    
    // Document Files
    body("fileId").isLength({ min: 10 }).withMessage("Business document file ID required (minimum 10 characters)"),
    body("tag").isIn([
      'ACRA_COMPANY_PROFILE_DOCUMENT', 'ANNUAL_REPORT', 'ANNUAL_RETURN', 'ARTICLES_OF_ASSOCIATION',
      'ASIC_CURRENT_COMPANY_EXTRACT', 'ASSUMED_NAME_CERTIFICATE', 'BUSINESS_LICENSE',
      'CERTIFICATE_OF_INCORPORATION', 'CERTIFICATION_REGISTRATION', 'COMPANY_CERTIFICATE',
      'COMPANY_CONSTITUTION', 'COMPANY_PROFILE', 'CONFIRMATION_STATEMENT', 'DIRECTOR_LIST',
      'LEGAL_NAME_AND_ADDRESS', 'OPERATING_AGREEMENT', 'PARTNERSHIP_AGREEMENT',
      'REGISTRATION_CERTIFICATE', 'SHAREHOLDING_STRUCTURE_CHART', 'SUPPORTIVE_OTHER',
      'TRUST_DEED', 'UNIT_HOLDER_REGISTER', 'UBO_SUPPORTIVE', 'THIRD_PARTY_SHAREHOLDING_DOCUMENT'
    ]).withMessage("Valid business document tag required"),
    
    body("frontFileId").isLength({ min: 10 }).withMessage("ID document front file ID required (minimum 10 characters)"),
    body("personDocumentsFileId").isLength({ min: 10 }).withMessage("Person documents file ID required (minimum 10 characters)"),
    body("personDocumentsTag").isLength({ min: 1 }).withMessage("Person documents tag required"),
    body("liveSelfieFileId").isLength({ min: 10 }).withMessage("Live selfie file ID required (minimum 10 characters)"),
    body("countryCode").isLength({ min: 2, max: 2 }).isAlpha().withMessage("Valid country code required (2-letter code)"),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      console.log(`[ZOQQ USER] Creating user account for: ${req.body.emailId}`);
      
      // Check if user already exists locally
      const existingUser = await User.findOne({ email: req.body.emailId.toLowerCase() });
      if (existingUser && existingUser.zoqqAccountId) {
        return res.status(409).json({
          status: "error",
          message: "User already has a Zoqq account",
          code: "USER_EXISTS",
          data: { accountId: existingUser.zoqqAccountId }
        });
      }

      // Validate date logic
      const effectiveDate = new Date(req.body.effectiveAt);
      const expiryDate = new Date(req.body.expireAt);
      const birthDate = new Date(req.body.dateOfBirth);
      const today = new Date();

      if (effectiveDate >= expiryDate) {
        return res.status(400).json({
          status: "error",
          message: "ID document expiry date must be after effective date",
          code: "INVALID_DATE_RANGE"
        });
      }

      if (birthDate >= today) {
        return res.status(400).json({
          status: "error",
          message: "Date of birth must be in the past",
          code: "INVALID_BIRTH_DATE"
        });
      }

      // Create user in Zoqq system
      const result = await zoqqAuthService.createUser(req.body, req.zoqqToken);
      
      if (result.success) {
        // Update local user record
        if (existingUser) {
          existingUser.zoqqAccountId = result.accountId;
          existingUser.accountStatus = 'zoqq_created';
          existingUser.updatedAt = new Date();
          await existingUser.save();
        } else {
          // Create new local user record
          const newUser = new User({
            email: req.body.emailId.toLowerCase(),
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            zoqqAccountId: result.accountId,
            accountStatus: 'zoqq_created'
          });
          await newUser.save();
        }

        console.log(`[ZOQQ USER] User created successfully with account ID: ${result.accountId}`);
        
        res.status(201).json({
          status: "success",
          message: "User account created successfully in Zoqq system",
          code: "USER_CREATED",
          data: {
            accountId: result.accountId,
            status: result.status,
            message: result.message,
            next_steps: [
              "Accept Terms and Conditions",
              "Submit for Account Activation",
              "Complete any required RFI (Request for Information)"
            ]
          }
        });
      } else {
        throw new AppError("Failed to create user in Zoqq system", 400, "ZOQQ_CREATE_FAILED");
      }
    } catch (error) {
      console.error(`[ZOQQ USER] User creation failed:`, error);
      
      res.status(error.statusCode || 500).json({
        status: "error",
        message: error.message || "Failed to create user account",
        code: error.code || "USER_CREATE_ERROR"
      });
    }
  }
);

/**
 * GET USER DETAILS
 * GET /api/zoqq/user/:userId
 * Retrieves comprehensive user details from Zoqq system
 */
router.get("/user/:userId",
  authenticateToken,
  extractZoqqToken,
  [
    param("userId").isLength({ min: 1 }).withMessage("Valid user ID required")
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { userId } = req.params;
      console.log(`[ZOQQ USER] Retrieving user details for: ${userId}`);

      const result = await zoqqAuthService.getUser(userId, req.zoqqToken);
      
      if (result.success) {
        console.log(`[ZOQQ USER] User details retrieved successfully`);
        
        res.status(200).json({
          status: "success",
          message: "User details retrieved successfully",
          code: "USER_RETRIEVED",
          data: result.userData
        });
      } else {
        throw new AppError("Failed to retrieve user details", 400, "USER_GET_FAILED");
      }
    } catch (error) {
      console.error(`[ZOQQ USER] User retrieval failed:`, error);
      
      res.status(error.statusCode || 500).json({
        status: "error",
        message: error.message || "Failed to retrieve user details",
        code: error.code || "USER_GET_ERROR"
      });
    }
  }
);

/**
 * ACCEPT TERMS AND CONDITIONS
 * POST /api/zoqq/user/:userId/terms
 * Accepts terms and conditions for the user account
 */
router.post("/user/:userId/terms",
  authenticateToken,
  extractZoqqToken,
  [
    param("userId").isLength({ min: 1 }).withMessage("Valid user ID required")
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { userId } = req.params;
      console.log(`[ZOQQ TERMS] Accepting terms for user: ${userId}`);

      const result = await zoqqAuthService.acceptTermsAndConditions(userId, req.zoqqToken);
      
      if (result.success) {
        // Update local user record
        const user = await User.findOne({ zoqqAccountId: userId });
        if (user) {
          user.termsAcceptedAt = new Date();
          user.accountStatus = 'terms_accepted';
          user.updatedAt = new Date();
          await user.save();
        }

        console.log(`[ZOQQ TERMS] Terms accepted successfully for user: ${userId}`);
        
        res.status(200).json({
          status: "success",
          message: result.message || "Terms and conditions accepted successfully",
          code: "TERMS_ACCEPTED",
          data: {
            acceptedAt: new Date().toISOString(),
            nextStep: "Account ready for activation"
          }
        });
      } else {
        throw new AppError("Failed to accept terms and conditions", 400, "TERMS_ACCEPT_FAILED");
      }
    } catch (error) {
      console.error(`[ZOQQ TERMS] Terms acceptance failed:`, error);
      
      res.status(error.statusCode || 500).json({
        status: "error",
        message: error.message || "Failed to accept terms and conditions",
        code: error.code || "TERMS_ACCEPT_ERROR"
      });
    }
  }
);

/**
 * ACTIVATE ACCOUNT
 * POST /api/zoqq/user/:userId/activate
 * Activates the user account for full access
 */
router.post("/user/:userId/activate",
  authenticateToken,
  extractZoqqToken,
  [
    param("userId").isLength({ min: 1 }).withMessage("Valid user ID required")
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { userId } = req.params;
      console.log(`[ZOQQ ACTIVATE] Activating account for user: ${userId}`);

      const result = await zoqqAuthService.activateAccount(userId, req.zoqqToken);
      
      if (result.success) {
        // Update local user record
        const user = await User.findOne({ zoqqAccountId: userId });
        if (user) {
          user.accountStatus = 'active';
          user.isVerified = true;
          user.activatedAt = new Date();
          user.updatedAt = new Date();
          await user.save();
        }

        console.log(`[ZOQQ ACTIVATE] Account activated successfully for user: ${userId}`);
        
        res.status(200).json({
          status: "success",
          message: result.message || "Account activated successfully",
          code: "ACCOUNT_ACTIVATED",
          data: {
            activatedAt: new Date().toISOString(),
            status: "active",
            message: "Account is now fully operational"
          }
        });
      } else {
        throw new AppError("Failed to activate account", 400, "ACTIVATION_FAILED");
      }
    } catch (error) {
      console.error(`[ZOQQ ACTIVATE] Account activation failed:`, error);
      
      res.status(error.statusCode || 500).json({
        status: "error",
        message: error.message || "Failed to activate account",
        code: error.code || "ACTIVATION_ERROR"
      });
    }
  }
);

// ========== RFI (REQUEST FOR INFORMATION) ENDPOINTS ==========

/**
 * GET RFI DETAILS
 * GET /api/zoqq/user/:userId/rfi
 * Retrieves RFI (Request for Information) details for compliance
 */
router.get("/user/:userId/rfi",
  authenticateToken,
  extractZoqqToken,
  [
    param("userId").isLength({ min: 1 }).withMessage("Valid user ID required")
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { userId } = req.params;
      console.log(`[ZOQQ RFI] Retrieving RFI details for user: ${userId}`);

      const result = await zoqqAuthService.getRFI(userId, req.zoqqToken);
      
      if (result.success) {
        console.log(`[ZOQQ RFI] RFI details retrieved successfully`);
        
        res.status(200).json({
          status: "success",
          message: "RFI details retrieved successfully",
          code: "RFI_RETRIEVED",
          data: result.rfiData
        });
      } else {
        throw new AppError("Failed to retrieve RFI details", 400, "RFI_GET_FAILED");
      }
    } catch (error) {
      console.error(`[ZOQQ RFI] RFI retrieval failed:`, error);
      
      res.status(error.statusCode || 500).json({
        status: "error",
        message: error.message || "Failed to retrieve RFI details",
        code: error.code || "RFI_GET_ERROR"
      });
    }
  }
);

/**
 * RESPOND TO RFI
 * POST /api/zoqq/user/:userId/rfi
 * Submits response to RFI request with supporting documentation
 */
router.post("/user/:userId/rfi",
  authenticateToken,
  extractZoqqToken,
  [
    param("userId").isLength({ min: 1 }).withMessage("Valid user ID required"),
    body("id").isLength({ min: 1 }).withMessage("RFI question ID required"),
    body("type").isIn(['ADDRESS', 'DOCUMENT', 'TEXT']).withMessage("Valid response type required"),
    
    // Conditional validation based on response type
    body("address_line1").if(body("type").equals("ADDRESS")).isLength({ min: 5, max: 100 }).withMessage("Address line 1 required for ADDRESS type (5-100 characters)"),
    body("address_line2").if(body("type").equals("ADDRESS")).optional().isLength({ max: 100 }).withMessage("Address line 2 max 100 characters"),
    body("country_code").if(body("type").equals("ADDRESS")).isLength({ min: 2, max: 2 }).isAlpha().withMessage("Valid country code required for ADDRESS type"),
    body("postcode").if(body("type").equals("ADDRESS")).isLength({ min: 3, max: 10 }).withMessage("Valid postcode required for ADDRESS type (3-10 characters)"),
    body("state").if(body("type").equals("ADDRESS")).isLength({ min: 2, max: 50 }).withMessage("State required for ADDRESS type (2-50 characters)"),
    body("suburb").if(body("type").equals("ADDRESS")).isLength({ min: 2, max: 50 }).withMessage("Suburb required for ADDRESS type (2-50 characters)"),
    
    body("attachments").optional().isArray().withMessage("Attachments must be an array if provided"),
    body("attachments.*.file_id").if(body("attachments").exists()).isLength({ min: 10 }).withMessage("Each attachment must have a valid file ID (minimum 10 characters)")
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { userId } = req.params;
      console.log(`[ZOQQ RFI] Submitting RFI response for user: ${userId}`);

      const result = await zoqqAuthService.respondToRFI(userId, req.body, req.zoqqToken);
      
      if (result.success) {
        console.log(`[ZOQQ RFI] RFI response submitted successfully`);
        
        res.status(200).json({
          status: "success",
          message: result.message || "RFI response submitted successfully",
          code: "RFI_RESPONSE_SUBMITTED",
          data: {
            submittedAt: new Date().toISOString(),
            rfiId: req.body.id,
            responseType: req.body.type,
            ...result.data
          }
        });
      } else {
        throw new AppError("Failed to submit RFI response", 400, "RFI_RESPONSE_FAILED");
      }
    } catch (error) {
      console.error(`[ZOQQ RFI] RFI response failed:`, error);
      
      res.status(error.statusCode || 500).json({
        status: "error",
        message: error.message || "Failed to submit RFI response",
        code: error.code || "RFI_RESPONSE_ERROR"
      });
    }
  }
);

// ========== HEALTH CHECK AND STATUS ENDPOINTS ==========

/**
 * ZOQQ INTEGRATION STATUS
 * GET /api/zoqq/status
 * Checks the status of Zoqq integration and connectivity
 */
router.get("/status", authenticateToken, async (req, res) => {
  try {
    console.log('[ZOQQ STATUS] Checking integration status...');
    
    const status = {
      integration_enabled: zoqqAuthService.zoqqEnabled,
      service_available: false,
      last_check: new Date().toISOString()
    };

          if (zoqqAuthService.zoqqEnabled) {
      try {
        // Test connectivity by getting a token
        const tokenResult = await zoqqAuthService.getZoqqToken();
        status.service_available = tokenResult.success;
        status.token_expires_at = tokenResult.expires_at;
      } catch (error) {
        status.service_available = false;
        status.error = error.message;
      }
    }

    res.status(200).json({
      status: "success",
      message: "Zoqq integration status retrieved",
      code: "STATUS_RETRIEVED",
      data: status
    });
  } catch (error) {
    console.error('[ZOQQ STATUS] Status check failed:', error);
    
    res.status(500).json({
      status: "error",
      message: "Failed to check Zoqq integration status",
      code: "STATUS_CHECK_ERROR"
    });
  }
});

// ========== ERROR HANDLING MIDDLEWARE ==========

/**
 * Error handling middleware specific to Zoqq routes
 */
router.use((error, req, res, next) => {
  console.error('[ZOQQ ROUTES] Unhandled error:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    body: req.body
  });
  
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      status: "error",
      message: error.message,
      code: error.code
    });
  }
  
  // Handle Joi validation errors
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      status: "error",
      message: "Validation failed",
      code: "VALIDATION_ERROR",
      errors: error.details || [error.message]
    });
  }
  
  res.status(500).json({
    status: "error",
    message: "Internal server error in Zoqq integration",
    code: "ZOQQ_INTERNAL_ERROR"
  });
});

module.exports = router; 