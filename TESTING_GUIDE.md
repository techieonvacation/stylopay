# 🧪 StyloPay Authentication Testing Guide

Complete guide for testing both **User** and **Admin** roles in your StyloPay banking application.

## 🚀 Quick Start

### 1. Setup Environment Files

#### Backend (.env)
```bash
# Create backend/.env
PORT=5000
NODE_ENV=development
JWT_SECRET=dev-jwt-secret-key-for-stylopay-development-only-change-in-production
SESSION_SECRET=dev-session-secret-key-for-stylopay-development-only
ENCRYPTION_KEY=dev-encryption-key-32-chars-long
MONGODB_URI=mongodb://localhost:27017/stylopay
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173
```

#### Frontend (.env)
```bash
# Create frontend/.env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=StyloPay
VITE_ENABLE_DEVTOOLS=true
VITE_LOG_LEVEL=debug
```

### 2. Start Services
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

---

## 👤 User Types & Roles

Your system supports 3 user roles:

| Role | Access Level | Routes |
|------|-------------|---------|
| **user** | Standard User | `/dashboard`, `/profile`, `/transactions` |
| **premium** | Premium User | Same as user + premium features |
| **admin** | Administrator | `/admin/*` + all user routes |

---

## 🔐 Testing User Authentication

### Option 1: Create Test User via Signup

1. **Go to Signup Page**: `http://localhost:5173/signup`

2. **Fill Registration Form**:
   ```
   First Name: John
   Last Name: User
   Email: user@test.com
   Password: Test123!@#
   Confirm Password: Test123!@#
   ✅ Agree to Terms
   ```

3. **User will be created with**:
   - Role: `user` (default)
   - Account Status: `pending_verification`

4. **Login at**: `http://localhost:5173/login`
   ```
   Email: user@test.com
   Password: Test123!@#
   ```

### Option 2: Direct Database Insert

Use MongoDB Compass or CLI to create test user:

```javascript
// Connect to MongoDB and insert test user
db.users.insertOne({
  firstName: "John",
  lastName: "User", 
  email: "user@test.com",
  password: "$2a$12$LQv3c1yqBwEHxv68WLewLOLOF3aXLQqHqvQN0IjWjJqvQbM4qfYha", // Test123!@#
  role: "user",
  accountStatus: "active",
  isVerified: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

---

## 👑 Testing Admin Authentication

### Option 1: Create Admin User via Database

**Using MongoDB Compass/CLI**:
```javascript
db.users.insertOne({
  firstName: "Admin",
  lastName: "User",
  email: "admin@test.com", 
  password: "$2a$12$LQv3c1yqBwEHxv68WLewLOLOF3aXLQqHqvQN0IjWjJqvQbM4qfYha", // Test123!@#
  role: "admin",
  accountStatus: "active", 
  isVerified: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

**Login as Admin**:
```
URL: http://localhost:5173/login
Email: admin@test.com
Password: Test123!@#
```

### Option 2: Upgrade Existing User to Admin

```javascript
// Update existing user to admin role
db.users.updateOne(
  { email: "user@test.com" },
  { 
    $set: { 
      role: "admin",
      accountStatus: "active",
      isVerified: true 
    } 
  }
)
```

---

## 🛣️ Route Testing

### User Routes (after login as user)
- ✅ `/dashboard` - User Dashboard
- ✅ `/profile` - User Profile  
- ✅ `/transactions` - Transaction History
- ✅ `/settings` - User Settings
- ❌ `/admin` - Should be BLOCKED (403 error)

### Admin Routes (after login as admin)  
- ✅ `/admin` - Admin Dashboard
- ✅ `/admin/users` - User Management
- ✅ `/admin/analytics` - Analytics
- ✅ `/dashboard` - Also has access to user routes
- ✅ `/profile` - Can access user features too

---

## 🧪 Test Scenarios

### 1. **User Login Flow**
```bash
1. Navigate to http://localhost:5173/login
2. Enter user credentials
3. Should redirect to http://localhost:5173/dashboard  
4. Try accessing http://localhost:5173/admin
5. Should show "Admin access required" error
```

### 2. **Admin Login Flow**
```bash
1. Navigate to http://localhost:5173/login
2. Enter admin credentials  
3. Can access http://localhost:5173/admin
4. Should see Admin Dashboard with sidebar
5. Can also access user routes like /dashboard
```

### 3. **Token Validation**
```bash
1. Login as user/admin
2. Open DevTools > Application > Local Storage
3. Should see 'stylopay_token' 
4. Token contains role information
5. Try accessing protected routes
```

---

## 🔍 Debugging & Logs

### Backend Logs to Monitor
```bash
[AUTH] Login attempt for email: user@test.com
[AUTH] Successful login for email: user@test.com
[PROTECTED ROUTE] Access granted to: /dashboard
[PROTECTED ROUTE] Admin route access granted (for admin users)
```

### Frontend Console Logs
```bash
[AUTH API] Login response received
[AUTH API] Storing token for user session  
[PROTECTED ROUTE] Session validation successful
[PROTECTED ROUTE] Access granted to: /admin
```

### Check Browser DevTools
- **Network Tab**: Check API calls to `/api/auth/login`
- **Console**: Look for authentication logs
- **Application**: Verify token storage in localStorage/sessionStorage

---

## 🚨 Common Issues & Solutions

### Issue: CORS Errors
```bash
✅ Fixed: Updated backend CORS configuration
✅ Rate limiting disabled in development
✅ Preflight requests handled properly
```

### Issue: Admin Access Denied
```bash
❌ Problem: User role is 'user' not 'admin'
✅ Solution: Update user role in database:
db.users.updateOne({email: "user@test.com"}, {$set: {role: "admin"}})
```

### Issue: Token Not Found
```bash
❌ Problem: No stylopay_token in localStorage
✅ Solution: Re-login to generate new token
```

### Issue: Database Connection
```bash
❌ Problem: MongoDB not running
✅ Solution: Start MongoDB service
brew services start mongodb/brew/mongodb-community
# OR
sudo systemctl start mongod
```

---

## 📋 Quick Test Commands

### Create Test Users (MongoDB CLI)
```javascript
// Test User
db.users.insertOne({
  firstName: "Test", lastName: "User", email: "test@user.com",
  password: "$2a$12$LQv3c1yqBwEHxv68WLewLOLOF3aXLQqHqvQN0IjWjJqvQbM4qfYha",
  role: "user", accountStatus: "active", isVerified: true,
  createdAt: new Date(), updatedAt: new Date()
})

// Test Admin  
db.users.insertOne({
  firstName: "Test", lastName: "Admin", email: "test@admin.com",
  password: "$2a$12$LQv3c1yqBwEHxv68WLewLOLOF3aXLQqHqvQN0IjWjJqvQbM4qfYha",
  role: "admin", accountStatus: "active", isVerified: true, 
  createdAt: new Date(), updatedAt: new Date()
})
```

### Test Credentials
| Type | Email | Password | Role |
|------|-------|----------|------|
| User | test@user.com | Test123!@# | user |
| Admin | test@admin.com | Test123!@# | admin |

---

## 🎯 Success Criteria

### ✅ User Login Success
- [x] Can login with user credentials
- [x] Redirected to user dashboard
- [x] Cannot access `/admin` routes
- [x] Token stored in localStorage
- [x] User info available in Redux state

### ✅ Admin Login Success  
- [x] Can login with admin credentials
- [x] Can access `/admin` routes
- [x] Can access user routes too
- [x] Admin dashboard loads properly
- [x] Role verification works

---

## 🛠️ Development Tips

1. **Check User Role**: `console.log(user?.role)` in components
2. **Debug Token**: Decode JWT token to see user data
3. **Monitor Network**: Watch API calls in DevTools
4. **Database Check**: Verify user exists with correct role
5. **Clear Storage**: Clear localStorage/sessionStorage between tests

Happy Testing! 🚀 