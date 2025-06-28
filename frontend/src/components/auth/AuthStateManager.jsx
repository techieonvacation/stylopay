/**
 * Authentication State Manager Component
 * Handles automatic token refresh, session persistence, and security monitoring
 */

import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

// Redux actions and selectors
import {
  restoreAuthState,
  sessionExpired,
  updateLastActivity,
  tokenRefreshed,
  selectIsAuthenticated,
  selectIsTokenExpiringSoon,
  selectTokenExpiresAt,
  selectUser,
} from '../../store/slices/authSlice';

// API hooks
import { useRefreshTokenMutation, useGetAuthStatusQuery } from '../../store/api/authApi';

/**
 * Authentication State Manager Component
 */
const AuthStateManager = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Redux state
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isTokenExpiringSoon = useSelector(selectIsTokenExpiringSoon);
  const tokenExpiresAt = useSelector(selectTokenExpiresAt);
  const user = useSelector(selectUser);

  // API hooks
  const [refreshToken] = useRefreshTokenMutation();
  
  // Skip auth status query on auth pages to avoid infinite loops
  const skipAuthQuery = location.pathname === '/login' || location.pathname === '/signup';
  const { data: authStatus } = useGetAuthStatusQuery(undefined, {
    skip: !isAuthenticated || skipAuthQuery,
    pollingInterval: 5 * 60 * 1000, // Poll every 5 minutes
  });

  // Refs for timers and intervals
  const refreshTimerRef = useRef(null);
  const activityTimerRef = useRef(null);
  const sessionCheckInterval = useRef(null);

  /**
   * Restore authentication state from storage on app start
   */
  const restoreAuthFromStorage = () => {
    try {
      // Check for stored token
      const token = localStorage.getItem('stylopay_token') || sessionStorage.getItem('stylopay_token');
      
      if (!token) {
        console.log('[AUTH MANAGER] No stored token found');
        return;
      }

      // Try to restore auth state from localStorage
      const storedAuthState = localStorage.getItem('stylopay_auth_state');
      
      if (storedAuthState) {
        const authState = JSON.parse(storedAuthState);
        const now = new Date();
        const expiresAt = new Date(authState.expiresAt);

        if (expiresAt > now) {
          console.log('[AUTH MANAGER] Restoring authentication state');
          dispatch(restoreAuthState(authState));
        } else {
          console.log('[AUTH MANAGER] Stored token expired, clearing storage');
          clearAuthStorage();
        }
      }
    } catch (error) {
      console.error('[AUTH MANAGER] Error restoring auth state:', error);
      clearAuthStorage();
    }
  };

  /**
   * Clear authentication storage
   */
  const clearAuthStorage = () => {
    localStorage.removeItem('stylopay_token');
    localStorage.removeItem('stylopay_auth_state');
    sessionStorage.removeItem('stylopay_token');
  };

  /**
   * Save authentication state to storage
   */
  const saveAuthState = () => {
    if (isAuthenticated && user && tokenExpiresAt) {
      const authState = {
        user,
        expiresAt: tokenExpiresAt,
        sessionInfo: {
          loginTime: new Date().toISOString(),
          lastActivity: new Date().toISOString(),
          rememberMe: !!localStorage.getItem('stylopay_token'),
        },
        securityStatus: {
          sessionValid: true,
        },
      };

      localStorage.setItem('stylopay_auth_state', JSON.stringify(authState));
    }
  };

  /**
   * Handle automatic token refresh
   */
  const handleTokenRefresh = async () => {
    try {
      console.log('[AUTH MANAGER] Attempting token refresh');
      
      const result = await refreshToken().unwrap();
      
      if (result.success && result.refreshRequired) {
        console.log('[AUTH MANAGER] Token refreshed successfully');
        
        dispatch(tokenRefreshed({
          expiresAt: result.token.expiresAt,
        }));
        
        toast.success('Session refreshed successfully', {
          duration: 2000,
        });
      }
    } catch (error) {
      console.error('[AUTH MANAGER] Token refresh failed:', error);
      
      // If refresh fails, logout user
      dispatch(sessionExpired());
      clearAuthStorage();
      
      toast.error('Session expired. Please log in again.');
      navigate('/login');
    }
  };

  /**
   * Set up automatic token refresh timer
   */
  const setupTokenRefreshTimer = () => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }

    if (!tokenExpiresAt) return;

    const now = new Date();
    const expiresAt = new Date(tokenExpiresAt);
    const timeUntilExpiry = expiresAt - now;
    
    // Refresh token 5 minutes before expiry
    const refreshTime = Math.max(timeUntilExpiry - (5 * 60 * 1000), 0);

    if (refreshTime > 0) {
      console.log(`[AUTH MANAGER] Token refresh scheduled in ${Math.round(refreshTime / 1000)} seconds`);
      
      refreshTimerRef.current = setTimeout(() => {
        handleTokenRefresh();
      }, refreshTime);
    } else {
      // Token already expired or expires very soon
      console.log('[AUTH MANAGER] Token expired or expires very soon');
      handleTokenRefresh();
    }
  };

  /**
   * Update user activity timestamp
   */
  const updateActivity = () => {
    if (isAuthenticated) {
      dispatch(updateLastActivity());
    }
  };

  /**
   * Set up activity monitoring
   */
  const setupActivityMonitoring = () => {
    // Clear existing timer
    if (activityTimerRef.current) {
      clearTimeout(activityTimerRef.current);
    }

    // Update activity every 30 seconds if user is active
    activityTimerRef.current = setTimeout(() => {
      updateActivity();
      setupActivityMonitoring(); // Recursive call
    }, 30 * 1000);

    // Listen for user activity events
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      updateActivity();
    };

    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    // Cleanup function
    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
    };
  };

  /**
   * Set up session monitoring
   */
  const setupSessionMonitoring = () => {
    if (sessionCheckInterval.current) {
      clearInterval(sessionCheckInterval.current);
    }

    sessionCheckInterval.current = setInterval(() => {
      // Check if token is still valid
      const token = localStorage.getItem('stylopay_token') || sessionStorage.getItem('stylopay_token');
      
      if (!token && isAuthenticated) {
        console.log('[AUTH MANAGER] Token missing, logging out');
        dispatch(sessionExpired());
        clearAuthStorage();
        navigate('/login');
      }

      // Check if token is expiring soon
      if (isTokenExpiringSoon && isAuthenticated) {
        console.log('[AUTH MANAGER] Token expiring soon, attempting refresh');
        handleTokenRefresh();
      }
    }, 60 * 1000); // Check every minute
  };

  /**
   * Handle page visibility changes (security feature)
   */
  const handleVisibilityChange = () => {
    if (document.hidden) {
      console.log('[AUTH MANAGER] Page hidden, pausing activity monitoring');
    } else {
      console.log('[AUTH MANAGER] Page visible, resuming activity monitoring');
      updateActivity();
    }
  };

  /**
   * Initialize authentication manager on mount
   */
  useEffect(() => {
    console.log('[AUTH MANAGER] Initializing authentication manager');
    
    // Restore auth state from storage
    restoreAuthFromStorage();
    
    // Set up event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Setup monitoring
    const cleanupActivity = setupActivityMonitoring();
    setupSessionMonitoring();
    
    // Cleanup function
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      cleanupActivity();
      
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
      
      if (activityTimerRef.current) {
        clearTimeout(activityTimerRef.current);
      }
      
      if (sessionCheckInterval.current) {
        clearInterval(sessionCheckInterval.current);
      }
    };
  }, []);

  /**
   * Update token refresh timer when token expires at changes
   */
  useEffect(() => {
    if (isAuthenticated && tokenExpiresAt) {
      setupTokenRefreshTimer();
    }
  }, [isAuthenticated, tokenExpiresAt]);

  /**
   * Save auth state when it changes
   */
  useEffect(() => {
    if (isAuthenticated) {
      saveAuthState();
    }
  }, [isAuthenticated, user, tokenExpiresAt]);

  /**
   * Handle auth status response
   */
  useEffect(() => {
    if (authStatus && authStatus.authenticated && isAuthenticated) {
      // Update token expiration if provided
      if (authStatus.token?.expiresAt && authStatus.token.expiresAt !== tokenExpiresAt) {
        dispatch(tokenRefreshed({
          expiresAt: authStatus.token.expiresAt,
        }));
      }
    }
  }, [authStatus]);

  // This component doesn't render anything
  return null;
};

export default AuthStateManager; 