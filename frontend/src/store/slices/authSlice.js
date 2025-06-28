/**
 * Authentication Slice for StyloPay
 * Manages authentication state with secure token handling and user session management
 */

import { createSlice } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';

// Initial authentication state
const initialState = {
  // User authentication status
  isAuthenticated: false,
  
  // User information (non-sensitive data only)
  user: null,
  
  // Token information
  token: null,
  tokenExpiresAt: null,
  
  // Authentication process status
  isLoading: false,
  error: null,
  
  // Session information
  sessionInfo: {
    loginTime: null,
    lastActivity: null,
    rememberMe: false,
  },
  
  // Security features
  securityStatus: {
    twoFactorEnabled: false,
    sessionValid: false,
    passwordChangeRequired: false,
  },
};

/**
 * Authentication slice with reducers for secure state management
 */
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * Set loading state during authentication processes
     */
    setLoading: (state, action) => {
      state.isLoading = action.payload;
      state.error = null;
    },

    /**
     * Handle successful login
     */
    loginSuccess: (state, action) => {
      const { user, token, expiresAt, rememberMe = false } = action.payload;
      
      state.isAuthenticated = true;
      state.user = {
        email: user.email,
        authenticatedAt: user.authenticatedAt,
        role: user.role,
        isAdmin: user.isAdmin || user.role === 'admin',
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        isVerified: user.isVerified,
        accountStatus: user.accountStatus,
        profileCompleteness: user.profileCompleteness,
        // Store all relevant user data in Redux state
      };
      
      // Store token info (token itself should be in secure storage)
      state.tokenExpiresAt = expiresAt;
      
      // Session information
      state.sessionInfo = {
        loginTime: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        rememberMe,
      };
      
      // Reset error and loading states
      state.isLoading = false;
      state.error = null;
      
      // Security status
      state.securityStatus.sessionValid = true;
      
      console.log('[AUTH SLICE] Login successful for user:', user.email, 'Role:', user.role, 'IsAdmin:', user.isAdmin || user.role === 'admin');
    },

    /**
     * Handle login failure
     */
    loginFailure: (state, action) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.tokenExpiresAt = null;
      state.isLoading = false;
      state.error = action.payload;
      state.securityStatus.sessionValid = false;
      
      console.log('[AUTH SLICE] Login failed:', action.payload);
    },

    /**
     * Handle successful logout
     */
    logout: (state) => {
      // Clear all authentication state
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.tokenExpiresAt = null;
      state.error = null;
      state.sessionInfo = {
        loginTime: null,
        lastActivity: null,
        rememberMe: false,
      };
      state.securityStatus = {
        twoFactorEnabled: false,
        sessionValid: false,
        passwordChangeRequired: false,
      };
      
      // Clear secure cookies
      Cookies.remove('auth_session');
      
      console.log('[AUTH SLICE] User logged out');
    },

    /**
     * Update user profile information
     */
    updateUserProfile: (state, action) => {
      if (state.user) {
        state.user = {
          ...state.user,
          ...action.payload,
        };
      }
    },

    /**
     * Update security status
     */
    updateSecurityStatus: (state, action) => {
      state.securityStatus = {
        ...state.securityStatus,
        ...action.payload,
      };
    },

    /**
     * Update last activity timestamp for session management
     */
    updateLastActivity: (state) => {
      if (state.isAuthenticated) {
        state.sessionInfo.lastActivity = new Date().toISOString();
      }
    },

    /**
     * Handle token refresh
     */
    tokenRefreshed: (state, action) => {
      const { expiresAt } = action.payload;
      state.tokenExpiresAt = expiresAt;
      state.sessionInfo.lastActivity = new Date().toISOString();
      state.securityStatus.sessionValid = true;
      
      console.log('[AUTH SLICE] Token refreshed, expires at:', expiresAt);
    },

    /**
     * Handle session expiration
     */
    sessionExpired: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.tokenExpiresAt = null;
      state.error = 'Session has expired. Please log in again.';
      state.securityStatus.sessionValid = false;
      
      // Clear secure cookies
      Cookies.remove('auth_session');
      
      console.log('[AUTH SLICE] Session expired');
    },

    /**
     * Clear authentication errors
     */
    clearError: (state) => {
      state.error = null;
    },

    /**
     * Restore authentication state from storage (on app initialization)
     */
    restoreAuthState: (state, action) => {
      const { user, expiresAt, sessionInfo, securityStatus } = action.payload;
      
      // Check if token is still valid
      const now = new Date();
      const tokenExpiry = new Date(expiresAt);
      
      if (tokenExpiry > now) {
        state.isAuthenticated = true;
        state.user = user;
        state.tokenExpiresAt = expiresAt;
        state.sessionInfo = sessionInfo || state.sessionInfo;
        state.securityStatus = securityStatus || state.securityStatus;
        state.securityStatus.sessionValid = true;
        
        console.log('[AUTH SLICE] Authentication state restored');
      } else {
        // Token expired, clear state
        state.isAuthenticated = false;
        state.user = null;
        state.tokenExpiresAt = null;
        state.error = 'Session expired during restore';
        state.securityStatus.sessionValid = false;
        
        // Clear expired cookies
        Cookies.remove('auth_session');
        
        console.log('[AUTH SLICE] Token expired during restore');
      }
    },

    /**
     * Set password change requirement
     */
    setPasswordChangeRequired: (state, action) => {
      state.securityStatus.passwordChangeRequired = action.payload;
    },

    /**
     * Handle security alert
     */
    securityAlert: (state, action) => {
      const { type, message } = action.payload;
      state.error = message;
      
      // Log security events for monitoring
      console.warn('[AUTH SLICE] Security Alert:', { type, message });
      
      // If it's a critical security event, force logout
      if (type === 'CRITICAL') {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.tokenExpiresAt = null;
        state.securityStatus.sessionValid = false;
        Cookies.remove('auth_session');
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle login API states
      .addMatcher(
        (action) => {
          console.log('[AUTH SLICE] Checking action type:', action.type);
          return action.type.includes('authApi') && action.type.endsWith('/login/pending');
        },
        (state) => {
          console.log('[AUTH SLICE] Login pending - setting loading state');
          state.isLoading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => {
          console.log('[AUTH SLICE] Checking action type:', action.type);
          return action.type.includes('authApi') && action.type.endsWith('/login/fulfilled');
        },
        (state, action) => {
          console.log('[AUTH SLICE] Login fulfilled - updating auth state', action.payload);
          state.isLoading = false;
          state.isAuthenticated = true;
          state.user = {
            ...action.payload.user,
            role: action.payload.user.role,
            isAdmin: action.payload.user.isAdmin || action.payload.user.role === 'admin',
          };
          state.tokenExpiresAt = action.payload.token.expiresAt;
          state.sessionInfo = {
            loginTime: new Date().toISOString(),
            lastActivity: new Date().toISOString(),
            rememberMe: action.payload.session?.rememberMe || false,
          };
          state.securityStatus.sessionValid = true;
          state.error = null;
          
          console.log('[AUTH SLICE] Auth state updated - isAuthenticated:', state.isAuthenticated, 'Role:', state.user.role, 'IsAdmin:', state.user.isAdmin);
        }
      )
      .addMatcher(
        (action) => {
          console.log('[AUTH SLICE] Checking action type:', action.type);
          return action.type.includes('authApi') && action.type.endsWith('/login/rejected');
        },
        (state, action) => {
          console.log('[AUTH SLICE] Login rejected', action);
          state.isLoading = false;
          state.isAuthenticated = false;
          state.user = null;
          state.token = null;
          state.tokenExpiresAt = null;
          state.error = action.payload?.message || action.error?.message || 'Login failed';
          state.securityStatus.sessionValid = false;
        }
      )
      // Handle token validation API states
      .addMatcher(
        (action) => {
          console.log('[AUTH SLICE] Checking action type:', action.type);
          return action.type.includes('authApi') && action.type.includes('validateToken') && action.type.endsWith('/fulfilled');
        },
        (state, action) => {
          console.log('[AUTH SLICE] Token validation fulfilled', action.payload);
          
          // If validation successful and returns user data, update the state
          if (action.payload?.valid && action.payload?.user) {
            console.log('[AUTH SLICE] Updating user state from token validation');
            state.user = {
              ...state.user, // Keep existing user data
              ...action.payload.user, // Update with data from validation
              isAdmin: action.payload.user.isAdmin || action.payload.user.role === 'admin',
            };
            state.securityStatus.sessionValid = true;
            state.tokenExpiresAt = action.payload.expiresAt;
            
            console.log('[AUTH SLICE] User state updated from validation:', {
              email: state.user.email,
              role: state.user.role,
              isAdmin: state.user.isAdmin
            });
          } else if (action.payload?.valid === false) {
            console.log('[AUTH SLICE] Token validation failed - invalidating session');
            state.securityStatus.sessionValid = false;
            state.error = 'Session validation failed';
          }
        }
      )
      // Handle auth status API states  
      .addMatcher(
        (action) => {
          console.log('[AUTH SLICE] Checking action type:', action.type);
          return action.type.includes('authApi') && action.type.includes('getAuthStatus') && action.type.endsWith('/fulfilled');
        },
        (state, action) => {
          console.log('[AUTH SLICE] Auth status fulfilled', action.payload);
          
          // Update user data from status response
          if (action.payload?.authenticated && action.payload?.user) {
            console.log('[AUTH SLICE] Updating user state from auth status');
            state.user = {
              ...state.user, // Keep existing user data
              ...action.payload.user, // Update with data from status
              isAdmin: action.payload.user.isAdmin || action.payload.user.role === 'admin',
            };
            state.securityStatus.sessionValid = true;
            state.tokenExpiresAt = action.payload.token?.expiresAt;
            
            console.log('[AUTH SLICE] User state updated from status:', {
              email: state.user.email,
              role: state.user.role,
              isAdmin: state.user.isAdmin
            });
          }
        }
      );
  },
});

// Export actions
export const {
  setLoading,
  loginSuccess,
  loginFailure,
  logout,
  updateUserProfile,
  updateSecurityStatus,
  updateLastActivity,
  tokenRefreshed,
  sessionExpired,
  clearError,
  restoreAuthState,
  setPasswordChangeRequired,
  securityAlert,
} = authSlice.actions;

// Selectors for accessing auth state
export const selectAuth = (state) => state.auth;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectUser = (state) => state.auth.user;
export const selectAuthLoading = (state) => state.auth.isLoading;
export const selectAuthError = (state) => state.auth.error;
export const selectSessionInfo = (state) => state.auth.sessionInfo;
export const selectSecurityStatus = (state) => state.auth.securityStatus;
export const selectTokenExpiresAt = (state) => state.auth.tokenExpiresAt;

// Helper selector to check if token is about to expire (within 5 minutes)
export const selectIsTokenExpiringSoon = (state) => {
  const expiresAt = state.auth.tokenExpiresAt;
  if (!expiresAt) return false;
  
  const now = new Date();
  const expiry = new Date(expiresAt);
  const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds
  
  return (expiry - now) < fiveMinutes;
};

// Helper selector to check if session is valid
export const selectIsSessionValid = (state) => {
  const { isAuthenticated, tokenExpiresAt, securityStatus } = state.auth;
  
  if (!isAuthenticated || !tokenExpiresAt || !securityStatus.sessionValid) {
    return false;
  }
  
  const now = new Date();
  const expiry = new Date(tokenExpiresAt);
  
  return expiry > now;
};

export default authSlice.reducer; 