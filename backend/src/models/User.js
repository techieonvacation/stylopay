/**
 * User Model for StyloPay Banking Application
 * Secure user data management with banking-grade security
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic user information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    minlength: [2, 'First name must be at least 2 characters'],
    maxlength: [50, 'First name must be less than 50 characters'],
    match: [/^[a-zA-Z\s'-]+$/, 'First name can only contain letters, spaces, hyphens, and apostrophes']
  },
  
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    minlength: [2, 'Last name must be at least 2 characters'],
    maxlength: [50, 'Last name must be less than 50 characters'],
    match: [/^[a-zA-Z\s'-]+$/, 'Last name can only contain letters, spaces, hyphens, and apostrophes']
  },
  
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    maxlength: [100, 'Email must be less than 100 characters'],
    match: [/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, 'Please provide a valid email address'],
    index: true
  },
  
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false // Don't include password in queries by default
  },
  
  // Account status and verification
  isVerified: {
    type: Boolean,
    default: false
  },
  
  accountStatus: {
    type: String,
    enum: ['pending_verification', 'active', 'suspended', 'closed'],
    default: 'pending_verification'
  },
  
  role: {
    type: String,
    enum: ['user', 'premium', 'admin'],
    default: 'user'
  },
  
  // Verification and reset tokens
  emailVerificationToken: {
    type: String,
    select: false
  },
  
  emailVerificationExpires: {
    type: Date,
    select: false
  },
  
  passwordResetToken: {
    type: String,
    select: false
  },
  
  passwordResetExpires: {
    type: Date,
    select: false
  },
  
  // Security information
  lastLogin: {
    type: Date
  },
  
  loginAttempts: {
    type: Number,
    default: 0
  },
  
  lockUntil: {
    type: Date
  },
  
  passwordChangedAt: {
    type: Date,
    default: Date.now
  },
  
  // Device and session tracking
  registeredDevices: [{
    deviceId: String,
    deviceType: String,
    browser: String,
    os: String,
    lastAccess: Date,
    trusted: {
      type: Boolean,
      default: false
    }
  }],
  
  // Banking-specific fields
  accountNumber: {
    type: String,
    unique: true,
    sparse: true // Allow null values but ensure uniqueness when present
  },
  
  kycStatus: {
    type: String,
    enum: ['not_started', 'pending', 'approved', 'rejected'],
    default: 'not_started'
  },
  
  kycDocuments: [{
    documentType: {
      type: String,
      enum: ['passport', 'drivers_license', 'national_id', 'utility_bill', 'bank_statement']
    },
    documentUrl: String,
    uploadedAt: Date,
    verificationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    }
  }],
  
  // Security settings
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  
  twoFactorSecret: {
    type: String,
    select: false
  },
  
  securityQuestions: [{
    question: String,
    answer: {
      type: String,
      select: false
    }
  }],
  
  // Notification preferences
  notifications: {
    email: {
      type: Boolean,
      default: true
    },
    sms: {
      type: Boolean,
      default: true
    },
    push: {
      type: Boolean,
      default: true
    },
    marketing: {
      type: Boolean,
      default: false
    }
  },
  
  // Profile completion
  profileCompleteness: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }
  
}, {
  timestamps: true, // Adds createdAt and updatedAt automatically
  versionKey: false // Disable __v field
});

// Compound indexes for better query performance
userSchema.index({ email: 1, accountStatus: 1 });
userSchema.index({ accountNumber: 1, accountStatus: 1 });
userSchema.index({ createdAt: -1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for account lock status
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12 for banking security
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to update password changed timestamp
userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();
  
  this.passwordChangedAt = Date.now() - 1000; // Subtract 1 second to ensure token is created after password change
  next();
});

// Pre-save middleware to calculate profile completeness
userSchema.pre('save', function(next) {
  let completeness = 0;
  const totalFields = 8;
  
  if (this.firstName) completeness++;
  if (this.lastName) completeness++;
  if (this.email) completeness++;
  if (this.isVerified) completeness++;
  if (this.accountNumber) completeness++;
  if (this.kycStatus === 'approved') completeness++;
  if (this.securityQuestions.length > 0) completeness++;
  if (this.twoFactorEnabled) completeness++;
  
  this.profileCompleteness = Math.round((completeness / totalFields) * 100);
  next();
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to check if password was changed after JWT was issued
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Instance method to increment login attempts
userSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // If we're at max attempts and not locked, lock the account
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // Lock for 2 hours
  }
  
  return this.updateOne(updates);
};

// Instance method to reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

// Instance method to generate account number
userSchema.methods.generateAccountNumber = function() {
  // Generate a unique 10-digit account number
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  return `${timestamp}${random}`;
};

// Static method to find user by email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to find active users
userSchema.statics.findActiveUsers = function() {
  return this.find({ accountStatus: 'active' });
};

// Export the model
module.exports = mongoose.model('User', userSchema); 