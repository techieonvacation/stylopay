/**
 * User Routes with Zoqq Integration
 * Handles user management, onboarding, and account lifecycle operations
 * Includes comprehensive Zoqq API integration for banking compliance
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
 * Handle validation errors
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
 * Extract Zoqq token from user's JWT
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
    
    req.zoqqToken = userToken.zoqqToken;
    req.userId = userToken.userId;
    next();
  } catch (error) {
    console.error('[USER ROUTES] Error extracting Zoqq token:', error);
    return res.status(401).json({
      status: "error",
      message: "Invalid authentication token",
      code: "INVALID_TOKEN"
    });
  }
};

// ========== ZOQQ USER MANAGEMENT ROUTES ==========

/**
 * CREATE USER - Zoqq Onboarding
 * POST /api/user/zoqq/create
 * Creates a new user account in Zoqq system with comprehensive business and personal details
 */
router.post("/zoqq/create", 
  authenticateToken, 
  extractZoqqToken,
  [
    // Business Information Validation
    body("emailId").isEmail().normalizeEmail().withMessage("Valid email is required"),
    body("amount").isNumeric().withMessage("Amount must be numeric"),
    body("currency").isLength({ min: 3, max: 3 }).withMessage("Currency must be 3 letter code"),
    body("businessName").isLength({ min: 2, max: 100 }).withMessage("Business name required (2-100 characters)"),
    body("businessStructure").isIn(['COMPANY', 'PARTNERSHIP', 'SOLE_PROPRIETORSHIP', 'TRUST', 'OTHER']).withMessage("Valid business structure required"),
    body("contactNumber").isMobilePhone().withMessage("Valid contact number required"),
    
    // Personal Information Validation
    body("firstName").isLength({ min: 1, max: 50 }).withMessage("First name required (1-50 characters)"),
    body("lastName").isLength({ min: 1, max: 50 }).withMessage("Last name required (1-50 characters)"),
    body("middleName").optional().isLength({ max: 50 }).withMessage("Middle name max 50 characters"),
    body("dateOfBirth").isISO8601().withMessage("Valid date of birth required (YYYY-MM-DD)"),
    body("nationality").isLength({ min: 2, max: 2 }).withMessage("Nationality must be 2 letter country code"),
    body("mobile").isMobilePhone().withMessage("Valid mobile number required"),
    
    // Identity Document Validation
    body("identificationType").isIn(['Passport', 'National_ID', 'Driving_License']).withMessage("Valid identification type required"),
    body("Idnumber").isLength({ min: 5, max: 20 }).withMessage("ID number required (5-20 characters)"),
    body("issuingCountryCode").isLength({ min: 2, max: 2 }).withMessage("Valid issuing country code required"),
    body("effectiveAt").isISO8601().withMessage("Valid effective date required (YYYY-MM-DD)"),
    body("expireAt").isISO8601().withMessage("Valid expiry date required (YYYY-MM-DD)"),
    
    // Legal and Compliance Validation
    body("roles").isIn(['BENEFICIAL_OWNER', 'DIRECTOR', 'SIGNATORY', 'OTHER']).withMessage("Valid role required"),
    body("legalEntityType").isIn(['BUSINESS', 'INDIVIDUAL']).withMessage("Valid legal entity type required"),
    body("asTrustee").isBoolean().withMessage("asTrustee must be boolean"),
    body("agreedToTermsAndConditions").isBoolean().withMessage("Terms and conditions agreement required"),
    body("productReference").isIn([
      'ACCEPT_ONLINE_PAYMENTS', 'COLLECT_MARKETPLACE_PROCEEDS', 'RECEIVE_TRANSFERS',
      'GET_PAID', 'CONVERT_FUNDS', 'MAKE_TRANSFERS', 'CREATE_CARDS', 'MANAGE_EXPENSES',
      'USE_AWX_API', 'TRANSFER_CNY_INBOUND'
    ]).withMessage("Valid product reference required"),
    
    // Business Registration Validation
    body("type").isLength({ min: 1, max: 20 }).withMessage("Registration type required"),
    body("number").isLength({ min: 5, max: 20 }).withMessage("Registration number required"),
    body("descriptionOfGoodsOrServices").isLength({ min: 10, max: 500 }).withMessage("Description required (10-500 characters)"),
    body("industryCategoryCode").matches(/^ICCV3_[A-Z0-9]+$/).withMessage("Valid industry category code required"),
    body("operatingCountry").isLength({ min: 2, max: 2 }).withMessage("Valid operating country code required"),
    
    // Address Validation
    body("registrationAddressLine1").isLength({ min: 5, max: 100 }).withMessage("Registration address line 1 required"),
    body("registrationAddressLine2").optional().isLength({ max: 100 }).withMessage("Registration address line 2 max 100 characters"),
    body("registrationCountryCode").isLength({ min: 2, max: 2 }).withMessage("Valid registration country code required"),
    body("registrationPostcode").isLength({ min: 3, max: 10 }).withMessage("Valid registration postcode required"),
    body("registrationState").isLength({ min: 2, max: 50 }).withMessage("Registration state required"),
    body("registrationSuburb").isLength({ min: 2, max: 50 }).withMessage("Registration suburb required"),
    
    body("residentialAddressLine1").isLength({ min: 5, max: 100 }).withMessage("Residential address line 1 required"),
    body("residentialCountryCode").isLength({ min: 2, max: 2 }).withMessage("Valid residential country code required"),
    body("residentialPostcode").isLength({ min: 3, max: 10 }).withMessage("Valid residential postcode required"),
    body("residentialState").isLength({ min: 2, max: 50 }).withMessage("Residential state required"),
    body("residentialSuburb").isLength({ min: 2, max: 50 }).withMessage("Residential suburb required"),
    
    // Document File Validation
    body("fileId").isLength({ min: 10 }).withMessage("Business document file ID required"),
    body("tag").isIn([
      'ACRA_COMPANY_PROFILE_DOCUMENT', 'ANNUAL_REPORT', 'ANNUAL_RETURN', 'ARTICLES_OF_ASSOCIATION',
      'ASIC_CURRENT_COMPANY_EXTRACT', 'ASSUMED_NAME_CERTIFICATE', 'BUSINESS_LICENSE',
      'CERTIFICATE_OF_INCORPORATION', 'CERTIFICATION_REGISTRATION', 'COMPANY_CERTIFICATE',
      'COMPANY_CONSTITUTION', 'COMPANY_PROFILE', 'CONFIRMATION_STATEMENT', 'DIRECTOR_LIST',
      'LEGAL_NAME_AND_ADDRESS', 'OPERATING_AGREEMENT', 'PARTNERSHIP_AGREEMENT',
      'REGISTRATION_CERTIFICATE', 'SHAREHOLDING_STRUCTURE_CHART', 'SUPPORTIVE_OTHER',
      'TRUST_DEED', 'UNIT_HOLDER_REGISTER', 'UBO_SUPPORTIVE', 'THIRD_PARTY_SHAREHOLDING_DOCUMENT'
    ]).withMessage("Valid business document tag required"),
    
    body("frontFileId").isLength({ min: 10 }).withMessage("ID document front file ID required"),
    body("personDocumentsFileId").isLength({ min: 10 }).withMessage("Person documents file ID required"),
    body("personDocumentsTag").isLength({ min: 1 }).withMessage("Person documents tag required"),
    body("liveSelfieFileId").isLength({ min: 10 }).withMessage("Live selfie file ID required"),
    body("countryCode").isLength({ min: 2, max: 2 }).withMessage("Valid country code required"),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      console.log(`[USER CREATE] Creating Zoqq user for: ${req.body.emailId}`);
      
      // Check if user already exists in local database
      const existingUser = await User.findOne({ email: req.body.emailId.toLowerCase() });
      if (existingUser && existingUser.zoqqAccountId) {
        return res.status(409).json({
          status: "error",
          message: "User already has a Zoqq account",
          code: "USER_EXISTS",
          data: { accountId: existingUser.zoqqAccountId }
        });
      }

      // Create user in Zoqq system
      const result = await zoqqAuthService.createUser(req.body, req.zoqqToken);
      
      if (result.success) {
        // Update local user record with Zoqq account ID
        if (existingUser) {
          existingUser.zoqqAccountId = result.accountId;
          existingUser.accountStatus = 'zoqq_created';
          await existingUser.save();
        }

        console.log(`[USER CREATE] Zoqq user created successfully: ${result.accountId}`);
        
        res.status(201).json({
          status: "success",
          message: "User account created successfully in Zoqq system",
          code: "USER_CREATED",
          data: {
            accountId: result.accountId,
            status: result.status,
            message: result.message
          }
        });
      } else {
        throw new AppError("Failed to create user in Zoqq system", 400, "ZOQQ_CREATE_FAILED");
      }
    } catch (error) {
      console.error(`[USER CREATE] Error creating Zoqq user:`, error);
      
      res.status(error.statusCode || 500).json({
        status: "error",
        message: error.message || "Failed to create user account",
        code: error.code || "USER_CREATE_ERROR"
      });
    }
  }
);

/**
 * GET USER - Retrieve Zoqq User Details
 * GET /api/user/zoqq/details/:userId
 * Retrieves comprehensive user details from Zoqq system
 */
router.get("/zoqq/details/:userId",
  authenticateToken,
  extractZoqqToken,
  [
    param("userId").isLength({ min: 1 }).withMessage("Valid user ID required")
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { userId } = req.params;
      console.log(`[USER GET] Retrieving Zoqq user details for: ${userId}`);

      const result = await zoqqAuthService.getUser(userId, req.zoqqToken);
      
      if (result.success) {
        console.log(`[USER GET] User details retrieved successfully for: ${userId}`);
        
        res.status(200).json({
          status: "success",
          message: "User details retrieved successfully",
          code: "USER_RETRIEVED",
          data: result.userData
        });
      } else {
        throw new AppError("Failed to retrieve user details", 400, "ZOQQ_GET_FAILED");
      }
    } catch (error) {
      console.error(`[USER GET] Error retrieving user details:`, error);
      
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
 * POST /api/user/zoqq/terms/:userId
 * Accepts terms and conditions for a user
 */
router.post("/zoqq/terms/:userId",
  authenticateToken,
  extractZoqqToken,
  [
    param("userId").isLength({ min: 1 }).withMessage("Valid user ID required")
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { userId } = req.params;
      console.log(`[USER TERMS] Accepting terms for user: ${userId}`);

      const result = await zoqqAuthService.acceptTermsAndConditions(userId, req.zoqqToken);
      
      if (result.success) {
        // Update local user record
        const user = await User.findOne({ zoqqAccountId: userId });
        if (user) {
          user.termsAcceptedAt = new Date();
          user.accountStatus = 'terms_accepted';
          await user.save();
        }

        console.log(`[USER TERMS] Terms accepted successfully for: ${userId}`);
        
        res.status(200).json({
          status: "success",
          message: result.message || "Terms and conditions accepted successfully",
          code: "TERMS_ACCEPTED"
        });
      } else {
        throw new AppError("Failed to accept terms and conditions", 400, "TERMS_ACCEPT_FAILED");
      }
    } catch (error) {
      console.error(`[USER TERMS] Error accepting terms:`, error);
      
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
 * POST /api/user/zoqq/activate/:userId
 * Activates a user account in Zoqq system
 */
router.post("/zoqq/activate/:userId",
  authenticateToken,
  extractZoqqToken,
  [
    param("userId").isLength({ min: 1 }).withMessage("Valid user ID required")
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { userId } = req.params;
      console.log(`[USER ACTIVATE] Activating account for user: ${userId}`);

      const result = await zoqqAuthService.activateAccount(userId, req.zoqqToken);
      
      if (result.success) {
        // Update local user record
        const user = await User.findOne({ zoqqAccountId: userId });
        if (user) {
          user.accountStatus = 'active';
          user.isVerified = true;
          user.activatedAt = new Date();
          await user.save();
        }

        console.log(`[USER ACTIVATE] Account activated successfully for: ${userId}`);
        
        res.status(200).json({
          status: "success",
          message: result.message || "Account activated successfully",
          code: "ACCOUNT_ACTIVATED"
        });
      } else {
        throw new AppError("Failed to activate account", 400, "ACCOUNT_ACTIVATE_FAILED");
      }
    } catch (error) {
      console.error(`[USER ACTIVATE] Error activating account:`, error);
      
      res.status(error.statusCode || 500).json({
        status: "error",
        message: error.message || "Failed to activate account",
        code: error.code || "ACCOUNT_ACTIVATE_ERROR"
      });
    }
  }
);

// ========== RFI (Request for Information) ROUTES ==========

/**
 * GET RFI DETAILS
 * GET /api/user/zoqq/rfi/:userId
 * Retrieves RFI (Request for Information) details for a user
 */
router.get("/zoqq/rfi/:userId",
  authenticateToken,
  extractZoqqToken,
  [
    param("userId").isLength({ min: 1 }).withMessage("Valid user ID required")
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { userId } = req.params;
      console.log(`[USER RFI] Retrieving RFI details for user: ${userId}`);

      const result = await zoqqAuthService.getRFI(userId, req.zoqqToken);
      
      if (result.success) {
        console.log(`[USER RFI] RFI details retrieved successfully for: ${userId}`);
        
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
      console.error(`[USER RFI] Error retrieving RFI details:`, error);
      
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
 * POST /api/user/zoqq/rfi/:userId
 * Submits a response to an RFI request
 */
router.post("/zoqq/rfi/:userId",
  authenticateToken,
  extractZoqqToken,
  [
    param("userId").isLength({ min: 1 }).withMessage("Valid user ID required"),
    body("id").isLength({ min: 1 }).withMessage("RFI question ID required"),
    body("type").isIn(['ADDRESS', 'DOCUMENT', 'TEXT']).withMessage("Valid response type required"),
    
    // Conditional validation based on type
    body("address_line1").if(body("type").equals("ADDRESS")).isLength({ min: 5, max: 100 }).withMessage("Address line 1 required for ADDRESS type"),
    body("country_code").if(body("type").equals("ADDRESS")).isLength({ min: 2, max: 2 }).withMessage("Country code required for ADDRESS type"),
    body("postcode").if(body("type").equals("ADDRESS")).isLength({ min: 3, max: 10 }).withMessage("Postcode required for ADDRESS type"),
    body("state").if(body("type").equals("ADDRESS")).isLength({ min: 2, max: 50 }).withMessage("State required for ADDRESS type"),
    body("suburb").if(body("type").equals("ADDRESS")).isLength({ min: 2, max: 50 }).withMessage("Suburb required for ADDRESS type"),
    
    body("attachments").optional().isArray().withMessage("Attachments must be an array")
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { userId } = req.params;
      console.log(`[USER RFI] Responding to RFI for user: ${userId}`);

      const result = await zoqqAuthService.respondToRFI(userId, req.body, req.zoqqToken);
      
      if (result.success) {
        console.log(`[USER RFI] RFI response submitted successfully for: ${userId}`);
        
        res.status(200).json({
          status: "success",
          message: result.message || "RFI response submitted successfully",
          code: "RFI_RESPONSE_SUBMITTED",
          data: result.data
        });
      } else {
        throw new AppError("Failed to submit RFI response", 400, "RFI_RESPONSE_FAILED");
      }
    } catch (error) {
      console.error(`[USER RFI] Error submitting RFI response:`, error);
      
      res.status(error.statusCode || 500).json({
        status: "error",
        message: error.message || "Failed to submit RFI response",
        code: error.code || "RFI_RESPONSE_ERROR"
      });
    }
  }
);

// ========== EXISTING USER ROUTES (ENHANCED) ==========

/**
 * GET USER PROFILE - Enhanced with Zoqq Integration
 * GET /api/user/profile
 * Retrieves user profile with Zoqq account status
 */
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
        code: "USER_NOT_FOUND"
      });
    }

    // Include Zoqq status in response
    const userProfile = {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      accountStatus: user.accountStatus,
      isVerified: user.isVerified,
      profileCompleteness: user.profileCompleteness,
      zoqqAccountId: user.zoqqAccountId,
      hasZoqqAccount: !!user.zoqqAccountId,
      termsAcceptedAt: user.termsAcceptedAt,
      activatedAt: user.activatedAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.status(200).json({
      status: "success",
      message: "User profile retrieved successfully",
      code: "PROFILE_RETRIEVED",
      data: { user: userProfile }
    });
  } catch (error) {
    console.error("[USER PROFILE] Error retrieving profile:", error);
    
    res.status(500).json({
      status: "error",
      message: "Failed to retrieve user profile",
      code: "PROFILE_GET_ERROR"
    });
  }
});

/**
 * Error handling middleware for this router
 */
router.use((error, req, res, next) => {
  console.error('[USER ROUTES] Unhandled error:', error);
  
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      status: "error",
      message: error.message,
      code: error.code
    });
  }
  
  res.status(500).json({
    status: "error",
    message: "Internal server error",
    code: "INTERNAL_ERROR"
  });
});

module.exports = router; 