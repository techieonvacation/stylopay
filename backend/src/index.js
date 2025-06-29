/**
 * StyloPay Backend Server
 * Production-ready secure server for banking/finance application
 * Features: Authentication, Security Middleware, Rate Limiting, CORS, Helmet
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

// Database connection
const database = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const zoqqRoutes = require('./routes/zoqq');

// Import middleware
const { errorHandler } = require('./middleware/errorHandler');
const { securityMiddleware } = require('./middleware/security');

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware - Must be first
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Rate limiting for banking security
const isDevelopment = process.env.NODE_ENV !== 'production';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 50 : 5, // More lenient in development
  message: {
    error: 'Too many authentication attempts, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for OPTIONS requests (CORS preflight)
    return req.method === 'OPTIONS';
  }
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 1000 : 100, // More lenient in development
  message: {
    error: 'Too many requests from this IP, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for OPTIONS requests (CORS preflight)
    return req.method === 'OPTIONS';
  }
});

// Apply rate limiting (skip in development for easier debugging)
if (!isDevelopment) {
  app.use('/api/auth', authLimiter);
  app.use('/api', generalLimiter);
} else {
  console.log('🔧 Development mode: Rate limiting disabled');
}

// CORS configuration for banking security
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.ALLOWED_ORIGINS 
      ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
      : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'];
    
    // In development, be more permissive
    if (isDevelopment) {
      // Allow localhost and 127.0.0.1 on any port for development
      if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true);
      }
    }
    
    // Allow requests with no origin (mobile apps, curl, postman, server-to-server)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`🚫 CORS blocked origin: ${origin}`);
      callback(new Error(`Not allowed by CORS. Origin: ${origin} not in allowed list: ${allowedOrigins.join(', ')}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'X-CSRF-Token',
    'x-client-id', 
    'x-api-key',
    'Accept',
    'Origin',
    'Cache-Control',
    'Pragma',
    'Expires'
  ],
  exposedHeaders: ['X-Total-Count', 'X-Rate-Limit-Remaining', 'X-RateLimit-Limit', 'X-RateLimit-Remaining'],
  maxAge: isDevelopment ? 0 : 86400, // Disable preflight caching in development
  preflightContinue: false,
  optionsSuccessStatus: 200 // For legacy browser support
};

app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Compression for performance
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// Custom security middleware
app.use(securityMiddleware);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'StyloPay Backend',
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/zoqq', zoqqRoutes);

// Handle 404 errors
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Resource not found',
    code: 'NOT_FOUND',
    path: req.originalUrl
  });
});

// Global error handler - Must be last
app.use(errorHandler);

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Initialize database and start server
async function startServer() {
  try {
    // Connect to MongoDB
    await database.connect();
    console.log('📊 Database connected successfully');

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 StyloPay Backend Server running on port ${PORT}`);
      console.log(`🔒 Security: ${isDevelopment ? 'Development' : 'Production'} mode`);
      console.log(`🌐 CORS allowed origins: ${process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173'}`);
      console.log(`⚡ Rate limiting: ${isDevelopment ? 'Disabled (Development)' : 'Enabled (Production)'}`);
      console.log(`💾 Database: ${database.getStatus().database}`);
      
      if (isDevelopment) {
        console.log(`\n🔧 Development mode active:`);
        console.log(`   - CORS is permissive for localhost/127.0.0.1`);
        console.log(`   - Rate limiting is disabled`);
        console.log(`   - Frontend should run on: http://localhost:5173`);
      }
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

// Start the application
startServer();

module.exports = app; 