#!/usr/bin/env node

/**
 * Zoqq Integration Setup Script
 * Helps configure the Zoqq API integration for StyloPay
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 StyloPay Zoqq Integration Setup');
console.log('=====================================');
console.log('This script will help you configure the Zoqq API integration.\n');

const prompt = (question) => {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
};

async function setupEnvironment() {
  try {
    console.log('📝 Setting up environment variables...\n');

    // Get Zoqq credentials
    const zoqqClientId = await prompt('Enter your Zoqq Client ID (x-client-id): ');
    const zoqqApiKey = await prompt('Enter your Zoqq API Key (x-api-key): ');
    const zoqqProgramId = await prompt('Enter your Zoqq Program ID (x-program-id): ');
    
    // Get other settings
    const jwtSecret = await prompt('Enter JWT Secret (press Enter for auto-generated): ') || generateJWTSecret();
    const mongoUri = await prompt('Enter MongoDB URI (press Enter for localhost): ') || 'mongodb://localhost:27017/stylopay';
    const frontendUrl = await prompt('Enter Frontend URL (press Enter for localhost:5173): ') || 'http://localhost:5173';

    // Backend environment
    const backendEnv = `# StyloPay Backend Environment Variables
# Generated by setup script

# Server Configuration
PORT=5000
NODE_ENV=development

# Security Keys
JWT_SECRET=${jwtSecret}
SESSION_SECRET=${generateRandomString(32)}
ENCRYPTION_KEY=${generateRandomString(32)}

# MongoDB Database Configuration
MONGODB_URI=${mongoUri}

# Zoqq API Configuration
ZOQQ_BASE_URL=https://api.zoqq.com
ZOQQ_CLIENT_ID=${zoqqClientId}
ZOQQ_API_KEY=${zoqqApiKey}
ZOQQ_PROGRAM_ID=${zoqqProgramId}

# Redis Configuration (for session storage)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# CORS Configuration
FRONTEND_URL=${frontendUrl}
ALLOWED_ORIGINS=${frontendUrl},https://yourdomain.com

# Rate Limiting
MAX_REQUESTS_PER_WINDOW=100
RATE_LIMIT_WINDOW_MS=900000

# Banking Security Features
ACCOUNT_LOCKOUT_ATTEMPTS=5
ACCOUNT_LOCKOUT_DURATION=1800000
PASSWORD_MIN_LENGTH=12
REQUIRE_2FA=true

# Logging
LOG_LEVEL=info
LOG_FILE_PATH=./logs/app.log

# Email Configuration (for notifications)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
FROM_EMAIL=noreply@stylopay.com

# Production Security Settings
HELMET_CSP_ENABLED=true
HELMET_HSTS_ENABLED=true
TRUST_PROXY=false

# Monitoring and Analytics
SENTRY_DSN=
ANALYTICS_API_KEY=
`;

    // Frontend environment
    const frontendEnv = `# StyloPay Frontend Environment Variables
# Generated by setup script

# API Configuration
VITE_API_BASE_URL=http://localhost:5000/api

# Application Configuration
VITE_APP_NAME=StyloPay
VITE_APP_VERSION=1.0.0
VITE_APP_DESCRIPTION=Secure Banking Platform

# Security Configuration
VITE_ENABLE_DEVTOOLS=true
VITE_SESSION_TIMEOUT=30

# Feature Flags
VITE_ENABLE_2FA=true
VITE_ENABLE_BIOMETRIC_AUTH=false
VITE_ENABLE_CHAT_SUPPORT=true

# External Services
VITE_SENTRY_DSN=
VITE_ANALYTICS_ID=

# Development Settings
VITE_LOG_LEVEL=info
VITE_MOCK_API=false

# Banking Features
VITE_MIN_TRANSFER_AMOUNT=1
VITE_MAX_TRANSFER_AMOUNT=10000
VITE_DAILY_TRANSFER_LIMIT=50000
`;

    // Write environment files
    fs.writeFileSync(path.join(__dirname, 'backend', '.env'), backendEnv);
    fs.writeFileSync(path.join(__dirname, 'frontend', '.env'), frontendEnv);

    console.log('\n✅ Environment files created successfully!');
    console.log('📁 Backend: backend/.env');
    console.log('📁 Frontend: frontend/.env');

  } catch (error) {
    console.error('❌ Error setting up environment:', error.message);
  }
}

async function testZoqqConnection() {
  console.log('\n🔌 Testing Zoqq API connection...');
  
  try {
    const axios = require('axios');
    const dotenv = require('dotenv');
    
    // Load environment variables
    dotenv.config({ path: path.join(__dirname, 'backend', '.env') });
    
    const response = await axios.post('https://api.zoqq.com/api/v1/authentication/login', {}, {
      headers: {
        'x-client-id': process.env.ZOQQ_CLIENT_ID,
        'x-api-key': process.env.ZOQQ_API_KEY,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    if (response.status === 200 && response.data.token) {
      console.log('✅ Zoqq API connection successful!');
      console.log('🔑 Token expires at:', response.data.expires_at);
      return true;
    } else {
      console.log('❌ Zoqq API connection failed: Invalid response');
      return false;
    }
  } catch (error) {
    console.error('❌ Zoqq API connection failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function installDependencies() {
  console.log('\n📦 Installing dependencies...');
  
  const { spawn } = require('child_process');
  
  // Install backend dependencies
  console.log('🔧 Installing backend dependencies...');
  await runCommand('npm', ['install'], path.join(__dirname, 'backend'));
  
  // Install frontend dependencies
  console.log('🔧 Installing frontend dependencies...');
  await runCommand('npm', ['install'], path.join(__dirname, 'frontend'));
  
  console.log('✅ Dependencies installed successfully!');
}

function runCommand(command, args, cwd) {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, { 
      cwd, 
      stdio: 'inherit',
      shell: true 
    });
    
    process.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });
  });
}

function generateJWTSecret() {
  return require('crypto').randomBytes(64).toString('hex');
}

function generateRandomString(length) {
  return require('crypto').randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
}

async function createSampleData() {
  console.log('\n📋 Creating sample data file...');
  
  const sampleUserData = {
    emailId: "testuser@example.com",
    amount: "10",
    currency: "USD",
    businessName: "Sample Business Pty Ltd",
    businessStructure: "COMPANY",
    contactNumber: "1234567890",
    identificationType: "Passport",
    Idnumber: "X1234567",
    issuingCountryCode: "SG",
    effectiveAt: "2020-01-01",
    expireAt: "2030-01-01",
    firstName: "John",
    lastName: "Doe",
    middleName: "A",
    dateOfBirth: "1985-05-15",
    nationality: "SG",
    mobile: "912500678",
    roles: "BENEFICIAL_OWNER",
    legalEntityType: "BUSINESS",
    asTrustee: true,
    agreedToTermsAndConditions: false,
    productReference: "ACCEPT_ONLINE_PAYMENTS",
    type: "brn",
    number: "1234567890",
    descriptionOfGoodsOrServices: "Payment gateway services",
    industryCategoryCode: "ICCV3_0000XX",
    operatingCountry: "AU",
    registrationAddressLine1: "123 Market Street",
    registrationAddressLine2: "Suite 456",
    registrationCountryCode: "SG",
    registrationPostcode: "2000",
    registrationState: "NSW",
    registrationSuburb: "Sydney",
    residentialAddressLine1: "456 King Street",
    residentialCountryCode: "SG",
    residentialPostcode: "2010",
    residentialState: "NSW",
    residentialSuburb: "Newtown",
    fileId: "sample_business_document_id",
    tag: "BUSINESS_LICENSE",
    frontFileId: "sample_id_front_id",
    personDocumentsFileId: "sample_person_docs_id",
    personDocumentsTag: "PERSON_PURPORTING_TO_ACT_AUTHORISATION_LETTER",
    liveSelfieFileId: "sample_selfie_id",
    countryCode: "SG"
  };
  
  fs.writeFileSync(
    path.join(__dirname, 'sample-user-data.json'), 
    JSON.stringify(sampleUserData, null, 2)
  );
  
  console.log('✅ Sample data file created: sample-user-data.json');
}

async function showNextSteps() {
  console.log('\n🎉 Setup completed successfully!');
  console.log('\n📋 Next Steps:');
  console.log('1. Review the environment files and update any missing values');
  console.log('2. Start MongoDB if using local database');
  console.log('3. Start the backend server: cd backend && npm start');
  console.log('4. Start the frontend server: cd frontend && npm run dev');
  console.log('5. Test the Zoqq integration using the sample data');
  console.log('\n🔗 Useful Commands:');
  console.log('Backend: cd backend && npm run dev (development with nodemon)');
  console.log('Frontend: cd frontend && npm run dev (development server)');
  console.log('Test API: curl -X POST http://localhost:5000/api/zoqq/auth/token');
  console.log('\n📚 Documentation:');
  console.log('- API Documentation: ZOQQ_API_IMPLEMENTATION.md');
  console.log('- Testing Guide: TESTING_GUIDE.md');
  console.log('- Sample Data: sample-user-data.json');
}

async function main() {
  try {
    await setupEnvironment();
    
    const shouldInstall = await prompt('\n📦 Install dependencies? (y/n): ');
    if (shouldInstall.toLowerCase() === 'y') {
      await installDependencies();
    }
    
    const shouldTest = await prompt('\n🔌 Test Zoqq API connection? (y/n): ');
    if (shouldTest.toLowerCase() === 'y') {
      await testZoqqConnection();
    }
    
    await createSampleData();
    await showNextSteps();
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  } finally {
    rl.close();
  }
}

// Run the setup if executed directly
if (require.main === module) {
  main();
}

module.exports = {
  setupEnvironment,
  testZoqqConnection,
  installDependencies
}; 