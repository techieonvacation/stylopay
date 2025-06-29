#!/usr/bin/env node

/**
 * Zoqq Integration Test Script
 * Tests all Zoqq API endpoints to ensure proper implementation
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Test configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';
const TEST_USER_EMAIL = 'test-zoqq-integration@example.com';

console.log('🧪 Zoqq Integration Test Suite');
console.log('==============================');
console.log(`Testing API at: ${API_BASE_URL}`);
console.log('');

let authToken = null;
let zoqqAccountId = null;

/**
 * Test data based on Zoqq API documentation
 */
const testUserData = {
  emailId: TEST_USER_EMAIL,
  amount: "10",
  currency: "USD",
  businessName: "Test Business Pty Ltd",
  businessStructure: "COMPANY",
  contactNumber: "1234567890",
  identificationType: "Passport",
  Idnumber: "X1234567",
  issuingCountryCode: "SG",
  effectiveAt: "2020-01-01",
  expireAt: "2030-01-01",
  firstName: "Test",
  lastName: "User",
  middleName: "Integration",
  dateOfBirth: "1985-05-15",
  nationality: "SG",
  mobile: "912500678",
  roles: "BENEFICIAL_OWNER",
  legalEntityType: "BUSINESS",
  asTrustee: true,
  agreedToTermsAndConditions: true,
  productReference: "ACCEPT_ONLINE_PAYMENTS",
  type: "brn",
  number: "1234567890",
  descriptionOfGoodsOrServices: "Test payment gateway services",
  industryCategoryCode: "ICCV3_0000XX",
  operatingCountry: "AU",
  registrationAddressLine1: "123 Test Street",
  registrationAddressLine2: "Suite 456",
  registrationCountryCode: "SG",
  registrationPostcode: "2000",
  registrationState: "NSW",
  registrationSuburb: "Sydney",
  residentialAddressLine1: "456 Residential Street",
  residentialCountryCode: "SG",
  residentialPostcode: "2010",
  residentialState: "NSW",
  residentialSuburb: "Newtown",
  fileId: "test_business_document_file_id_123456789",
  tag: "BUSINESS_LICENSE",
  frontFileId: "test_id_front_file_id_123456789",
  personDocumentsFileId: "test_person_docs_file_id_123456789",
  personDocumentsTag: "PERSON_PURPORTING_TO_ACT_AUTHORISATION_LETTER",
  liveSelfieFileId: "test_selfie_file_id_123456789",
  countryCode: "SG"
};

/**
 * Test helper functions
 */
function logTest(testName) {
  console.log(`\n🔍 Testing: ${testName}`);
}

function logSuccess(message) {
  console.log(`✅ ${message}`);
}

function logError(message, error) {
  console.log(`❌ ${message}`);
  if (error.response) {
    console.log(`   Status: ${error.response.status}`);
    console.log(`   Message: ${error.response.data?.message || error.message}`);
  } else {
    console.log(`   Error: ${error.message}`);
  }
}

function logWarning(message) {
  console.log(`⚠️  ${message}`);
}

/**
 * Test 1: Check if backend is running
 */
async function testBackendHealth() {
  logTest('Backend Health Check');
  
  try {
    const response = await axios.get(`${API_BASE_URL.replace('/api', '')}/health`, {
      timeout: 5000
    });
    
    if (response.status === 200) {
      logSuccess(`Backend is running (${response.data.service})`);
      return true;
    }
  } catch (error) {
    logError('Backend health check failed', error);
    logWarning('Make sure the backend is running: cd backend && npm run dev');
    return false;
  }
}

/**
 * Test 2: Check Zoqq integration status
 */
async function testZoqqStatus() {
  logTest('Zoqq Integration Status');
  
  try {
    const response = await axios.get(`${API_BASE_URL}/zoqq/status`, {
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      timeout: 10000
    });
    
    if (response.status === 200) {
      const status = response.data.data;
      logSuccess(`Integration enabled: ${status.integration_enabled}`);
      logSuccess(`Service available: ${status.service_available}`);
      
      if (!status.integration_enabled) {
        logWarning('Zoqq integration is not enabled. Check environment variables.');
        return false;
      }
      
      if (!status.service_available) {
        logWarning('Zoqq service is not available. Check credentials.');
        return false;
      }
      
      return true;
    }
  } catch (error) {
    logError('Zoqq status check failed', error);
    return false;
  }
}

/**
 * Test 3: Authentication - Get Zoqq Token
 */
async function testAuthentication() {
  logTest('Zoqq Authentication');
  
  try {
    const response = await axios.post(`${API_BASE_URL}/zoqq/auth/token`, {}, {
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      timeout: 15000
    });
    
    if (response.status === 200 && response.data.status === 'success') {
      logSuccess('Zoqq token obtained successfully');
      logSuccess(`Token expires at: ${response.data.data.expires_at}`);
      logSuccess(`Valid for: ${response.data.data.valid_for_minutes} minutes`);
      return true;
    }
  } catch (error) {
    logError('Zoqq authentication failed', error);
    
    if (error.response?.status === 401) {
      logWarning('Authentication required. Make sure you are logged in to the application.');
    }
    
    return false;
  }
}

/**
 * Test 4: Create User
 */
async function testCreateUser() {
  logTest('Create User Account');
  
  try {
    const response = await axios.post(`${API_BASE_URL}/zoqq/user/create`, testUserData, {
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
      },
      timeout: 30000
    });
    
    if (response.status === 201 && response.data.status === 'success') {
      zoqqAccountId = response.data.data.accountId;
      logSuccess(`User created successfully with Account ID: ${zoqqAccountId}`);
      
      // Save account ID for other tests
      fs.writeFileSync(
        path.join(__dirname, 'test-account-id.txt'),
        zoqqAccountId
      );
      
      return true;
    }
  } catch (error) {
    logError('User creation failed', error);
    
    if (error.response?.status === 409) {
      logWarning('User already exists. This is expected for repeated tests.');
      return true;
    }
    
    if (error.response?.status === 400) {
      console.log('   Validation errors:', error.response.data.errors);
    }
    
    return false;
  }
}

/**
 * Test 5: Get User Details
 */
async function testGetUser() {
  if (!zoqqAccountId) {
    // Try to read from file
    try {
      zoqqAccountId = fs.readFileSync(path.join(__dirname, 'test-account-id.txt'), 'utf8').trim();
    } catch (error) {
      logWarning('No account ID available for user retrieval test');
      return false;
    }
  }
  
  logTest('Get User Details');
  
  try {
    const response = await axios.get(`${API_BASE_URL}/zoqq/user/${zoqqAccountId}`, {
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      timeout: 15000
    });
    
    if (response.status === 200 && response.data.status === 'success') {
      logSuccess('User details retrieved successfully');
      logSuccess(`Account status: ${response.data.data.status || 'Unknown'}`);
      return true;
    }
  } catch (error) {
    logError('Get user details failed', error);
    return false;
  }
}

/**
 * Test 6: Accept Terms and Conditions
 */
async function testAcceptTerms() {
  if (!zoqqAccountId) {
    logWarning('No account ID available for terms acceptance test');
    return false;
  }
  
  logTest('Accept Terms and Conditions');
  
  try {
    const response = await axios.post(`${API_BASE_URL}/zoqq/user/${zoqqAccountId}/terms`, {}, {
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      timeout: 15000
    });
    
    if (response.status === 200 && response.data.status === 'success') {
      logSuccess('Terms and conditions accepted successfully');
      return true;
    }
  } catch (error) {
    logError('Accept terms failed', error);
    return false;
  }
}

/**
 * Test 7: Activate Account
 */
async function testActivateAccount() {
  if (!zoqqAccountId) {
    logWarning('No account ID available for activation test');
    return false;
  }
  
  logTest('Activate Account');
  
  try {
    const response = await axios.post(`${API_BASE_URL}/zoqq/user/${zoqqAccountId}/activate`, {}, {
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      timeout: 20000
    });
    
    if (response.status === 200 && response.data.status === 'success') {
      logSuccess('Account activated successfully');
      return true;
    }
  } catch (error) {
    logError('Account activation failed', error);
    
    if (error.response?.data?.message?.includes('RFI')) {
      logWarning('RFI (Request for Information) required for activation');
    }
    
    return false;
  }
}

/**
 * Test 8: Get RFI Details (if applicable)
 */
async function testGetRFI() {
  if (!zoqqAccountId) {
    logWarning('No account ID available for RFI test');
    return false;
  }
  
  logTest('Get RFI Details');
  
  try {
    const response = await axios.get(`${API_BASE_URL}/zoqq/user/${zoqqAccountId}/rfi`, {
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      timeout: 15000
    });
    
    if (response.status === 200 && response.data.status === 'success') {
      logSuccess('RFI details retrieved successfully');
      
      if (response.data.data.active_request) {
        logSuccess(`Active RFI found with ${response.data.data.active_request.questions?.length || 0} questions`);
      } else {
        logSuccess('No active RFI requests');
      }
      
      return true;
    }
  } catch (error) {
    logError('Get RFI details failed', error);
    return false;
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('Starting comprehensive Zoqq integration tests...\n');
  
  const results = {
    total: 0,
    passed: 0,
    failed: 0
  };
  
  const tests = [
    { name: 'Backend Health', fn: testBackendHealth },
    { name: 'Zoqq Status', fn: testZoqqStatus },
    { name: 'Authentication', fn: testAuthentication },
    { name: 'Create User', fn: testCreateUser },
    { name: 'Get User', fn: testGetUser },
    { name: 'Accept Terms', fn: testAcceptTerms },
    { name: 'Activate Account', fn: testActivateAccount },
    { name: 'Get RFI', fn: testGetRFI }
  ];
  
  for (const test of tests) {
    results.total++;
    
    try {
      const success = await test.fn();
      if (success) {
        results.passed++;
      } else {
        results.failed++;
      }
    } catch (error) {
      console.log(`❌ Test "${test.name}" threw an error:`, error.message);
      results.failed++;
    }
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Test Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Test Results Summary');
  console.log('='.repeat(50));
  console.log(`Total Tests: ${results.total}`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📈 Success Rate: ${Math.round((results.passed / results.total) * 100)}%`);
  
  if (results.failed > 0) {
    console.log('\n⚠️  Some tests failed. Check the errors above and:');
    console.log('1. Ensure the backend is running');
    console.log('2. Check environment variables are set correctly');
    console.log('3. Verify Zoqq credentials are valid');
    console.log('4. Check network connectivity');
  } else {
    console.log('\n🎉 All tests passed! Zoqq integration is working correctly.');
  }
  
  // Cleanup
  try {
    fs.unlinkSync(path.join(__dirname, 'test-account-id.txt'));
  } catch (error) {
    // Ignore cleanup errors
  }
}

/**
 * Command line interface
 */
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
Zoqq Integration Test Script

Usage:
  node test-zoqq-integration.js [options]

Options:
  --help, -h          Show this help message
  --auth-token TOKEN  Use specific auth token for testing
  --api-url URL       Use specific API URL (default: http://localhost:5000/api)

Examples:
  node test-zoqq-integration.js
  node test-zoqq-integration.js --api-url https://api.yourdomain.com/api
  node test-zoqq-integration.js --auth-token your-jwt-token

Prerequisites:
  1. Backend server must be running
  2. MongoDB must be accessible
  3. Zoqq credentials must be configured
  4. Network connectivity to Zoqq API
`);
  process.exit(0);
}

// Parse command line arguments
const authTokenIndex = process.argv.indexOf('--auth-token');
if (authTokenIndex !== -1 && process.argv[authTokenIndex + 1]) {
  authToken = process.argv[authTokenIndex + 1];
  console.log('ℹ️  Using provided auth token for testing');
}

const apiUrlIndex = process.argv.indexOf('--api-url');
if (apiUrlIndex !== -1 && process.argv[apiUrlIndex + 1]) {
  API_BASE_URL = process.argv[apiUrlIndex + 1];
  console.log(`ℹ️  Using API URL: ${API_BASE_URL}`);
}

// Run tests
runAllTests().catch(error => {
  console.error('\n💥 Test runner failed:', error.message);
  process.exit(1);
}); 