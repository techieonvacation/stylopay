# StyloPay API Testing Guide with Thunder Client

## Overview
This guide provides step-by-step instructions for testing all StyloPay API endpoints using Thunder Client in VS Code. The API includes authentication, user management, admin operations, and Zoqq integration.

## Prerequisites

### 1. Backend Setup
```bash
cd backend
npm install
cp env-template.txt .env
# Configure your .env file with database and Zoqq credentials
npm start
```

### 2. Frontend Setup (for full testing)
```bash
cd frontend
npm install
cp env-template.txt .env
# Configure your .env file
npm run dev
```

### 3. Thunder Client Setup
1. Install Thunder Client extension in VS Code
2. Import the collection: `thunder-client-collections/StyloPay-API-Tests.json`
3. Set environment to "Development"

## Environment Variables

### Development Environment
```
BASE_URL: http://localhost:5000/api
USER_TOKEN: (auto-populated during login)
ADMIN_TOKEN: (auto-populated during admin login)
ZOQQ_TOKEN: (auto-populated during Zoqq auth)
ZOQQ_ACCOUNT_ID: (auto-populated during user creation)
TEST_USER_EMAIL: (auto-populated during signup)
ADMIN_EMAIL: (auto-populated during admin signup)
```

## Testing Workflow

### Phase 1: Health Check
1. **Health Check**
   - Method: GET `/health`
   - Purpose: Verify server is running
   - Expected: Status 200, message "OK"

### Phase 2: Authentication Testing

#### 2.1 User Signup
1. **Sign Up User**
   - Method: POST `/auth/signup`
   - Purpose: Create regular user account
   - Expected: Status 201, user created with role "user"
   - Auto-sets: TEST_USER_EMAIL variable

2. **Sign Up Admin User**
   - Method: POST `/auth/signup`
   - Purpose: Create admin user account
   - Body includes: `"role": "admin"`
   - Expected: Status 201, user created with role "admin"
   - Auto-sets: ADMIN_EMAIL variable

#### 2.2 User Login
1. **Login User**
   - Method: POST `/auth/login`
   - Purpose: Authenticate regular user
   - Expected: Status 200, returns access token
   - Auto-sets: USER_TOKEN variable

2. **Login Admin**
   - Method: POST `/auth/login`
   - Purpose: Authenticate admin user
   - Expected: Status 200, returns access token with admin role
   - Auto-sets: ADMIN_TOKEN variable

#### 2.3 Authentication Validation
1. **Check Auth Status**
   - Method: GET `/auth/status`
   - Purpose: Verify token validity
   - Expected: Status 200, authenticated: true

2. **Refresh Token**
   - Method: POST `/auth/refresh`
   - Purpose: Refresh authentication token
   - Expected: Status 200, new token if needed

3. **Logout**
   - Method: POST `/auth/logout`
   - Purpose: Invalidate session
   - Expected: Status 200, success message

### Phase 3: Zoqq Integration Testing

#### 3.1 Zoqq Status Check
1. **Zoqq Integration Status**
   - Method: GET `/zoqq/status`
   - Purpose: Check Zoqq service availability
   - Expected: Status 200, integration_enabled: true

#### 3.2 Zoqq Authentication
1. **Get Zoqq Auth Token**
   - Method: POST `/zoqq/auth/token`
   - Purpose: Obtain Zoqq API token
   - Expected: Status 200, returns Zoqq token
   - Auto-sets: ZOQQ_TOKEN variable

#### 3.3 Zoqq User Management
1. **Create Zoqq User**
   - Method: POST `/zoqq/user/create`
   - Purpose: Create user in Zoqq system
   - Body: Complete user data (32+ fields)
   - Expected: Status 201, returns accountId
   - Auto-sets: ZOQQ_ACCOUNT_ID variable

2. **Get Zoqq User Details**
   - Method: GET `/zoqq/user/{{ZOQQ_ACCOUNT_ID}}`
   - Purpose: Retrieve user information from Zoqq
   - Expected: Status 200, user data

3. **Accept Terms and Conditions**
   - Method: POST `/zoqq/user/{{ZOQQ_ACCOUNT_ID}}/terms`
   - Purpose: Accept Zoqq terms
   - Expected: Status 200, terms accepted

4. **Activate Zoqq Account**
   - Method: POST `/zoqq/user/{{ZOQQ_ACCOUNT_ID}}/activate`
   - Purpose: Activate account in Zoqq
   - Expected: Status 200, account activated

5. **Get RFI Details**
   - Method: GET `/zoqq/user/{{ZOQQ_ACCOUNT_ID}}/rfi`
   - Purpose: Check for Request for Information
   - Expected: Status 200, RFI data (if any)

6. **Respond to RFI**
   - Method: POST `/zoqq/user/{{ZOQQ_ACCOUNT_ID}}/rfi`
   - Purpose: Respond to RFI requests
   - Expected: Status 200, response recorded

### Phase 4: User Management Testing

#### 4.1 User Profile Operations
1. **Get User Profile**
   - Method: GET `/user/profile`
   - Purpose: Retrieve user profile data
   - Expected: Status 200, profile information

2. **Update User Profile**
   - Method: PUT `/user/profile`
   - Purpose: Update user information
   - Expected: Status 200, updated profile

### Phase 5: Admin Operations Testing

#### 5.1 User Administration (Admin Required)
1. **List All Users (Admin)**
   - Method: GET `/user/admin/users`
   - Purpose: Get paginated user list
   - Requires: ADMIN_TOKEN
   - Expected: Status 200, user list with pagination

2. **Get User Details (Admin)**
   - Method: GET `/user/admin/users/{{TEST_USER_EMAIL}}`
   - Purpose: Get specific user details
   - Requires: ADMIN_TOKEN
   - Expected: Status 200, detailed user info

3. **Update User (Admin)**
   - Method: PUT `/user/admin/users/{{TEST_USER_EMAIL}}`
   - Purpose: Admin update user account
   - Requires: ADMIN_TOKEN
   - Expected: Status 200, user updated

4. **Delete User (Admin)**
   - Method: DELETE `/user/admin/users/{{TEST_USER_EMAIL}}`
   - Purpose: Delete user account
   - Requires: ADMIN_TOKEN
   - Expected: Status 200, user deleted

## Expected Test Results

### Success Scenarios

#### Authentication
- ✅ User signup creates account with default "user" role
- ✅ Admin signup creates account with "admin" role
- ✅ Login returns valid JWT token
- ✅ Role-based access control works properly
- ✅ Token refresh maintains session

#### Zoqq Integration
- ✅ All 32+ required fields validated during user creation
- ✅ Zoqq API responses conform to documentation
- ✅ Complete onboarding flow (create → terms → activate)
- ✅ RFI handling works correctly

#### User Management
- ✅ Profile operations work for authenticated users
- ✅ Admin operations require admin role
- ✅ Proper authorization checks

### Error Scenarios to Test

#### Authentication Errors
- ❌ Signup with invalid email format
- ❌ Signup with weak password
- ❌ Login with wrong credentials
- ❌ Access protected routes without token
- ❌ Access admin routes with user token

#### Zoqq Errors
- ❌ Create user with missing required fields
- ❌ Invalid Zoqq credentials
- ❌ Network connectivity issues

#### Validation Errors
- ❌ Invalid request body formats
- ❌ Missing required fields
- ❌ Invalid data types

## Troubleshooting

### Common Issues

1. **Server Connection Failed**
   - Check if backend server is running on port 5000
   - Verify `BASE_URL` is correct
   - Check firewall/proxy settings

2. **Authentication Failed**
   - Verify environment variables are set correctly
   - Check if database connection is working
   - Ensure JWT_SECRET is configured

3. **Zoqq Integration Errors**
   - Verify Zoqq credentials in .env file
   - Check ZOQQ_BASE_URL configuration
   - Ensure all required fields are provided

4. **Database Errors**
   - Check MongoDB connection
   - Verify database permissions
   - Check for duplicate key errors

### Debug Tips

1. **Check Server Logs**
   ```bash
   cd backend
   npm start
   # Monitor console output for errors
   ```

2. **Verify Environment Variables**
   ```bash
   # Check .env file exists and has required values
   cat backend/.env
   ```

3. **Test Database Connection**
   ```bash
   # Use MongoDB shell or GUI tool to verify connection
   mongosh "your-connection-string"
   ```

## Security Testing

### Password Requirements
- Minimum 8 characters
- Must contain uppercase letter
- Must contain lowercase letter
- Must contain number
- Must contain special character

### Rate Limiting
- Auth endpoints: 5 requests per 15 minutes (production)
- General endpoints: 100 requests per 15 minutes (production)
- Development mode: More lenient limits

### CORS Testing
- Only allowed origins can access API
- Credentials properly handled
- Preflight requests work correctly

## Advanced Testing

### Load Testing
Use Thunder Client's "Run All" feature to test multiple endpoints sequentially.

### Integration Testing
Test complete user workflows:
1. Signup → Login → Create Zoqq User → Accept Terms → Activate
2. Admin Login → Manage Users → Update Roles

### Error Recovery Testing
Test API behavior under various failure conditions:
- Network timeouts
- Invalid tokens
- Database unavailability

## Conclusion

This testing guide ensures comprehensive coverage of all StyloPay API endpoints. Follow the sequential workflow for best results, and use the auto-populated environment variables to maintain state between requests.

For issues or questions, refer to:
- `README_ZOQQ_INTEGRATION.md` for Zoqq-specific details
- `ZOQQ_API_IMPLEMENTATION.md` for technical implementation
- Server logs for debugging information 