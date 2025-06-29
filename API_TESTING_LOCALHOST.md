# StyloPay Localhost Testing Guide

## Quick Start Testing

### 1. Start the Backend Server
```bash
cd backend
npm start
```
Server should be running on `http://localhost:5000`

### 2. Start the Frontend (Optional)
```bash
cd frontend
npm run dev
```
Frontend should be running on `http://localhost:5173`

## Thunder Client Collection

Import the collection file: `thunder-client-collections/StyloPay-API-Tests.json`

## Test Sequence

### 1. Health Check
**GET** `http://localhost:5000/health`
- Should return: `{"status": "OK"}`

### 2. Create Test User
**POST** `http://localhost:5000/api/auth/signup`
```json
{
  "firstName": "Test",
  "lastName": "User",
  "email": "test@example.com",
  "password": "TestPass123!",
  "confirmPassword": "TestPass123!",
  "agreeToTerms": "true"
}
```

### 3. Create Admin User
**POST** `http://localhost:5000/api/auth/signup`
```json
{
  "firstName": "Admin",
  "lastName": "User",
  "email": "admin@stylopay.com",
  "password": "AdminPass123!",
  "confirmPassword": "AdminPass123!",
  "agreeToTerms": "true",
  "role": "admin"
}
```

### 4. Login as Regular User
**POST** `http://localhost:5000/api/auth/login`
```json
{
  "email": "test@example.com",
  "password": "TestPass123!"
}
```
**Save the returned token as USER_TOKEN**

### 5. Login as Admin
**POST** `http://localhost:5000/api/auth/login`
```json
{
  "email": "admin@stylopay.com",
  "password": "AdminPass123!"
}
```
**Save the returned token as ADMIN_TOKEN**

### 6. Test Zoqq Integration

#### Get Zoqq Token
**POST** `http://localhost:5000/api/zoqq/auth/token`
Headers: `Authorization: Bearer {USER_TOKEN}`

#### Create Zoqq User
**POST** `http://localhost:5000/api/zoqq/user/create`
Headers: `Authorization: Bearer {USER_TOKEN}`
```json
{
  "emailId": "test.zoqq@example.com",
  "amount": "10",
  "currency": "USD",
  "businessName": "Test Business Pty Ltd",
  "businessStructure": "COMPANY",
  "contactNumber": "1234567890",
  "identificationType": "Passport",
  "Idnumber": "X1234567",
  "issuingCountryCode": "SG",
  "effectiveAt": "2020-01-01",
  "expireAt": "2030-01-01",
  "firstName": "Test",
  "lastName": "User",
  "middleName": "Zoqq",
  "dateOfBirth": "1985-05-15",
  "nationality": "SG",
  "mobile": "912500678",
  "roles": "BENEFICIAL_OWNER",
  "legalEntityType": "BUSINESS",
  "asTrustee": true,
  "agreedToTermsAndConditions": true,
  "productReference": "ACCEPT_ONLINE_PAYMENTS",
  "type": "brn",
  "number": "1234567890",
  "descriptionOfGoodsOrServices": "Test payment gateway services",
  "industryCategoryCode": "ICCV3_0000XX",
  "operatingCountry": "AU",
  "registrationAddressLine1": "123 Test Street",
  "registrationAddressLine2": "Suite 456",
  "registrationCountryCode": "SG",
  "registrationPostcode": "2000",
  "registrationState": "NSW",
  "registrationSuburb": "Sydney",
  "residentialAddressLine1": "456 Residential Street",
  "residentialCountryCode": "SG",
  "residentialPostcode": "2010",
  "residentialState": "NSW",
  "residentialSuburb": "Newtown",
  "fileId": "test_business_document_file_id_123456789",
  "tag": "BUSINESS_LICENSE",
  "frontFileId": "test_id_front_file_id_123456789",
  "personDocumentsFileId": "test_person_docs_file_id_123456789",
  "personDocumentsTag": "PERSON_PURPORTING_TO_ACT_AUTHORISATION_LETTER",
  "liveSelfieFileId": "test_selfie_file_id_123456789",
  "countryCode": "SG"
}
```

### 7. Test Admin Operations
**GET** `http://localhost:5000/api/user/admin/users`
Headers: `Authorization: Bearer {ADMIN_TOKEN}`

## Frontend Testing

### Access the Application
1. Go to `http://localhost:5173`
2. Sign up with the same credentials used in API tests
3. Login and test role-based redirects:
   - Regular users → `/user/dashboard`
   - Admin users → `/admin/dashboard`

### Test Zoqq Onboarding
1. Login as regular user
2. Navigate to Zoqq onboarding
3. Complete the 4-step process:
   - User Creation
   - Terms Acceptance
   - Account Activation
   - RFI Handling

## Expected Results

### ✅ Success Indicators
- All API calls return appropriate status codes
- JWT tokens are properly generated and validated
- Role-based access control works (admin vs user)
- Zoqq integration creates users successfully
- Frontend redirects work based on user roles

### ❌ Common Issues
- **500 errors**: Check .env configuration
- **CORS errors**: Verify frontend URL in ALLOWED_ORIGINS
- **Auth errors**: Check JWT_SECRET configuration
- **Zoqq errors**: Verify Zoqq credentials in .env

## Quick Fixes

### Database Issues
```bash
# Check if MongoDB is running
mongosh

# If using Docker:
docker run -d -p 27017:27017 mongo:latest
```

### Environment Issues
```bash
# Copy and configure environment files
cd backend && cp env-template.txt .env
cd frontend && cp env-template.txt .env
```

### Port Conflicts
```bash
# Check what's running on port 5000
lsof -i :5000

# Kill process if needed
kill -9 <PID>
```

This should get you up and running quickly for localhost testing! 