/**
 * Error Handler Middleware for Banking Application
 * Provides secure error handling with appropriate logging and sanitized responses
 */

/**
 * Custom Error Class for Application Errors
 */
class AppError extends Error {
  constructor(message, statusCode, code = null, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global Error Handler Middleware
 * Handles all errors in the application with appropriate security measures
 */
const errorHandler = (err, req, res, next) => {
  // Log error details for monitoring (internal use only)
  const errorLog = {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    userId: req.user ? req.user.userId : null,
    error: {
      name: err.name,
      message: err.message,
      code: err.code,
      statusCode: err.statusCode,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    }
  };

  // Log to console (in production, this should go to a proper logging service)
  console.error('[ERROR]', JSON.stringify(errorLog, null, 2));

  // Determine response status code
  let statusCode = err.statusCode || 500;
  let errorCode = err.code || 'INTERNAL_SERVER_ERROR';
  let message = err.message || 'Internal server error';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    message = 'Input validation failed';
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    errorCode = 'TOKEN_INVALID';
    message = 'Invalid authentication token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    errorCode = 'TOKEN_EXPIRED';
    message = 'Authentication token has expired';
  } else if (err.name === 'CastError') {
    statusCode = 400;
    errorCode = 'INVALID_ID';
    message = 'Invalid resource identifier';
  } else if (err.code === 11000) {
    // MongoDB duplicate key error
    statusCode = 409;
    errorCode = 'DUPLICATE_RESOURCE';
    message = 'Resource already exists';
  }

  // Sanitize error message for production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'Internal server error';
    errorCode = 'INTERNAL_SERVER_ERROR';
  }

  // Create standardized error response
  const errorResponse = {
    error: message,
    code: errorCode,
    timestamp: new Date().toISOString(),
    requestId: req.headers['x-request-id'] || null
  };

  // Add validation details if it's a validation error
  if (err.name === 'ValidationError' && err.details) {
    errorResponse.details = err.details;
  }

  // Add stack trace in development mode only
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
  }

  res.status(statusCode).json(errorResponse);
};

/**
 * Async Error Handler Wrapper
 * Wraps async functions to catch errors and pass them to error handler
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Not Found Handler
 * Handles 404 errors with security considerations
 */
const notFoundHandler = (req, res, next) => {
  const error = new AppError(
    `Resource not found: ${req.originalUrl}`,
    404,
    'NOT_FOUND'
  );
  next(error);
};

/**
 * Security Error Handler
 * Handles security-related errors with additional logging
 */
const securityErrorHandler = (type, details, req) => {
  const securityLog = {
    type: type,
    timestamp: new Date().toISOString(),
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    path: req.path,
    method: req.method,
    details: details,
    severity: 'HIGH'
  };

  // Log security event (in production, send to security monitoring system)
  console.warn('[SECURITY ALERT]', JSON.stringify(securityLog, null, 2));

  return new AppError(
    'Security violation detected',
    403,
    'SECURITY_VIOLATION'
  );
};

/**
 * Rate Limit Error Handler
 * Handles rate limiting errors with appropriate responses
 */
const rateLimitErrorHandler = (req, res, next) => {
  const error = new AppError(
    'Too many requests from this IP, please try again later',
    429,
    'RATE_LIMIT_EXCEEDED'
  );
  next(error);
};

/**
 * CORS Error Handler
 * Handles CORS-related errors
 */
const corsErrorHandler = (req, res, next) => {
  const error = new AppError(
    'Cross-origin request blocked',
    403,
    'CORS_ERROR'
  );
  next(error);
};

/**
 * Database Connection Error Handler
 * Handles database connection issues
 */
const dbErrorHandler = (err) => {
  if (err.code === 'ECONNREFUSED') {
    return new AppError(
      'Database connection failed',
      503,
      'DATABASE_CONNECTION_ERROR'
    );
  }
  
  if (err.code === 'ENOTFOUND') {
    return new AppError(
      'Database host not found',
      503,
      'DATABASE_HOST_ERROR'
    );
  }

  return new AppError(
    'Database error occurred',
    500,
    'DATABASE_ERROR'
  );
};

/**
 * External API Error Handler
 * Handles errors from external APIs (like Zoqq)
 */
const externalApiErrorHandler = (err, apiName) => {
  if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
    return new AppError(
      `${apiName} service is currently unavailable`,
      503,
      'EXTERNAL_SERVICE_UNAVAILABLE'
    );
  }

  if (err.response) {
    const status = err.response.status;
    const message = err.response.data?.message || err.message;
    
    if (status === 401) {
      return new AppError(
        'Authentication failed with external service',
        401,
        'EXTERNAL_AUTH_FAILED'
      );
    }
    
    if (status === 403) {
      return new AppError(
        'Access denied by external service',
        403,
        'EXTERNAL_ACCESS_DENIED'
      );
    }
    
    if (status >= 500) {
      return new AppError(
        `${apiName} service error`,
        502,
        'EXTERNAL_SERVICE_ERROR'
      );
    }
    
    return new AppError(
      message,
      status,
      'EXTERNAL_API_ERROR'
    );
  }

  return new AppError(
    `${apiName} request failed`,
    500,
    'EXTERNAL_REQUEST_FAILED'
  );
};

module.exports = {
  AppError,
  errorHandler,
  asyncHandler,
  notFoundHandler,
  securityErrorHandler,
  rateLimitErrorHandler,
  corsErrorHandler,
  dbErrorHandler,
  externalApiErrorHandler
}; 