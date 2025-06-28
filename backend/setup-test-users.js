/**
 * Test Users Setup Script for StyloPay
 * Run this script to create test users for development
 * 
 * Usage: node setup-test-users.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// User schema (simplified for script)
const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  role: String,
  accountStatus: String,
  isVerified: Boolean,
  accountNumber: String,
  profileCompleteness: Number
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// Test users to create
const testUsers = [
  {
    firstName: "John",
    lastName: "User",
    email: "user@test.com",
    password: "Test123!@#",
    role: "user",
    accountStatus: "active",
    isVerified: true,
    profileCompleteness: 85
  },
  {
    firstName: "Jane", 
    lastName: "Premium",
    email: "premium@test.com",
    password: "Test123!@#",
    role: "premium",
    accountStatus: "active",
    isVerified: true,
    profileCompleteness: 95
  },
  {
    firstName: "Admin",
    lastName: "User", 
    email: "admin@test.com",
    password: "Test123!@#",
    role: "admin",
    accountStatus: "active",
    isVerified: true,
    profileCompleteness: 100
  },
  {
    firstName: "Test",
    lastName: "User",
    email: "testuser@stylopay.com",
    password: "SecurePass123!",
    role: "user", 
    accountStatus: "active",
    isVerified: true,
    profileCompleteness: 70
  }
];

async function setupTestUsers() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/stylopay';
    console.log('🔌 Connecting to MongoDB...');
    console.log(`   URI: ${mongoUri}`);
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Clear existing test users (optional)
    console.log('\n🧹 Cleaning up existing test users...');
    const testEmails = testUsers.map(user => user.email);
    const deleteResult = await User.deleteMany({ email: { $in: testEmails } });
    console.log(`✅ Cleaned up ${deleteResult.deletedCount} existing test users`);

    // Create test users
    console.log('\n👥 Creating test users...');
    
    for (const userData of testUsers) {
      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
      
      // Generate account number
      const timestamp = Date.now().toString().slice(-6);
      const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
      const accountNumber = `${timestamp}${random}`;

      // Create user
      const user = new User({
        ...userData,
        password: hashedPassword,
        accountNumber: accountNumber
      });

      await user.save();
      
      console.log(`✅ Created ${userData.role} user: ${userData.email}`);
      console.log(`   Password: ${userData.password}`);
      console.log(`   Account Number: ${accountNumber}`);
      console.log(`   Role: ${userData.role}`);
      console.log('');
    }

    console.log('🎉 All test users created successfully!\n');
    
    // Display summary
    console.log('📋 TEST USERS SUMMARY:');
    console.log('┌─────────────────────────┬──────────────┬───────────┐');
    console.log('│ Email                   │ Password     │ Role      │');
    console.log('├─────────────────────────┼──────────────┼───────────┤');
    testUsers.forEach(user => {
      console.log(`│ ${user.email.padEnd(23)} │ ${user.password.padEnd(12)} │ ${user.role.padEnd(9)} │`);
    });
    console.log('└─────────────────────────┴──────────────┴───────────┘');
    
    console.log('\n🚀 You can now test authentication at:');
    console.log('   Frontend: http://localhost:5173/login');
    console.log('   Backend:  http://localhost:5000/api/auth/login');
    
    console.log('\n🧪 Test Scenarios:');
    console.log('   1. Login as user@test.com → Should access user routes only');
    console.log('   2. Login as admin@test.com → Should access admin panel');
    console.log('   3. Try accessing /admin with user account → Should be blocked');

  } catch (error) {
    console.error('❌ Error setting up test users:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure MongoDB is running:');
      console.log('   - macOS: brew services start mongodb/brew/mongodb-community');
      console.log('   - Linux: sudo systemctl start mongod');
      console.log('   - Windows: net start MongoDB');
      console.log('   - Docker: docker run -d -p 27017:27017 mongo');
    }
    
    if (error.code === 11000) {
      console.log('\n💡 Duplicate email detected. Users might already exist.');
      console.log('   Delete existing users first or use different emails.');
    }

    console.log('\n🔍 Debug Info:');
    console.log(`   MongoDB URI: ${process.env.MONGODB_URI || 'mongodb://localhost:27017/stylopay'}`);
    console.log(`   Node Environment: ${process.env.NODE_ENV || 'not set'}`);
    
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit();
  }
}

// Handle script execution
if (require.main === module) {
  console.log('🧪 StyloPay Test Users Setup');
  console.log('============================\n');
  setupTestUsers();
}

module.exports = { setupTestUsers }; 