/**
 * Authentication API Slice using RTK Query
 * Handles all authentication-related API calls with automatic caching and error handling
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import Cookies from 'js-cookie';

// Base URL for the backend API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Base query with authentication and security features
 */
const baseQueryWithAuth = fetchBaseQuery({
  baseUrl: `${API_BASE_URL}/auth`,
  credentials: 'include', // Include cookies for secure session management
  
  prepareHeaders: (headers, { getState }) => {
    // Add common headers for security
    headers.set('Content-Type', 'application/json');
    headers.set('X-Requested-With', 'XMLHttpRequest');
    
    // Get token from localStorage or sessionStorage (if available)
    const token = localStorage.getItem('stylopay_token') || sessionStorage.getItem('stylopay_token');
    
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    
    // Add CSRF protection header if available
    const csrfToken = Cookies.get('csrf_token');
    if (csrfToken) {
      headers.set('X-CSRF-Token', csrfToken);
    }
    
    return headers;
  },
});

/**
 * Enhanced base query with retry logic and error handling
 */
const baseQueryWithRetry = async (args, api, extraOptions) => {
  let result = await baseQueryWithAuth(args, api, extraOptions);
  
  // Handle token expiration and automatic refresh
  if (result.error && result.error.status === 401) {
    console.log('[AUTH API] Token expired, attempting refresh...');
    
    // Try to refresh token
    const refreshResult = await baseQueryWithAuth(
      { url: '/refresh', method: 'POST' },
      api,
      extraOptions
    );
    
    if (refreshResult.data) {
      console.log('[AUTH API] Token refreshed successfully');
      
      // Store new token
      const { accessToken } = refreshResult.data;
      if (accessToken) {
        localStorage.setItem('stylopay_token', accessToken);
      }
      
      // Retry original request with new token
      result = await baseQueryWithAuth(args, api, extraOptions);
    } else {
      console.log('[AUTH API] Token refresh failed, redirecting to login');
      
      // Clear invalid tokens
      localStorage.removeItem('stylopay_token');
      sessionStorage.removeItem('stylopay_token');
      Cookies.remove('auth_session');
      
      // Dispatch logout action
      api.dispatch({ type: 'auth/sessionExpired' });
    }
  }
  
  // Log API errors for monitoring
  if (result.error) {
    console.error('[AUTH API] Error:', {
      endpoint: args.url || args,
      status: result.error.status,
      message: result.error.data?.message || result.error.error,
      code: result.error.data?.code,
    });
  }
  
  return result;
};

/**
 * Authentication API slice
 */
export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: baseQueryWithRetry,
  
  // Tag types for cache invalidation
  tagTypes: ['Auth', 'Session'],
  
  endpoints: (builder) => ({
    /**
     * Login endpoint
     */
    login: builder.mutation({
      query: (credentials) => ({
        url: '/login',
        method: 'POST',
        body: credentials,
      }),
      
      // Transform response to extract relevant data
      transformResponse: (response) => {
        console.log('[AUTH API] Login response received:', response);
        
        // Store token securely - backend sends token in response.token.accessToken
        const accessToken = response.token?.accessToken;
        if (accessToken) {
          console.log('[AUTH API] Storing token for user session');
          if (response.session?.rememberMe) {
            localStorage.setItem('stylopay_token', accessToken);
          } else {
            sessionStorage.setItem('stylopay_token', accessToken);
          }
        } else {
          console.warn('[AUTH API] No access token found in response');
        }
        
        return response;
      },
      
      // Handle errors
      transformErrorResponse: (response) => {
        return {
          status: response.status,
          message: response.data?.error || 'Login failed',
          code: response.data?.code || 'LOGIN_ERROR',
        };
      },
      
      // Invalidate cache on successful login
      invalidatesTags: ['Auth', 'Session'],
    }),

    /**
     * Signup endpoint
     */
    signup: builder.mutation({
      query: (userData) => ({
        url: '/signup',
        method: 'POST',
        body: userData,
      }),
      
      // Transform response to handle signup result
      transformResponse: (response) => {
        console.log('[AUTH API] Signup response received');
        
        // For signup, we don't store tokens immediately
        // User needs to verify email first for security
        return response;
      },
      
      // Handle errors
      transformErrorResponse: (response) => {
        return {
          status: response.status,
          message: response.data?.error || 'Signup failed',
          code: response.data?.code || 'SIGNUP_ERROR',
        };
      },
      
      // No cache invalidation needed for signup
    }),

    /**
     * Logout endpoint
     */
    logout: builder.mutation({
      query: () => ({
        url: '/logout',
        method: 'POST',
      }),
      
      // Clear tokens on logout
      transformResponse: (response) => {
        console.log('[AUTH API] Logout successful');
        
        // Clear all stored tokens
        localStorage.removeItem('stylopay_token');
        sessionStorage.removeItem('stylopay_token');
        Cookies.remove('auth_session');
        
        return response;
      },
      
      // Invalidate all cached data on logout
      invalidatesTags: ['Auth', 'Session'],
    }),

    /**
     * Token refresh endpoint
     */
    refreshToken: builder.mutation({
      query: () => ({
        url: '/refresh',
        method: 'POST',
      }),
      
      transformResponse: (response) => {
        console.log('[AUTH API] Token refresh response received:', response);
        
        // Update stored token if provided
        const accessToken = response.token?.accessToken || response.accessToken;
        if (accessToken) {
          console.log('[AUTH API] Updating stored token after refresh');
          const currentToken = localStorage.getItem('stylopay_token');
          if (currentToken) {
            localStorage.setItem('stylopay_token', accessToken);
          } else {
            sessionStorage.setItem('stylopay_token', accessToken);
          }
        } else {
          console.warn('[AUTH API] No access token found in refresh response');
        }
        
        return response;
      },
      
      invalidatesTags: ['Session'],
    }),

    /**
     * Get authentication status
     */
    getAuthStatus: builder.query({
      query: () => '/status',
      
      transformResponse: (response) => {
        console.log('[AUTH API] Auth status retrieved');
        return response;
      },
      
      // Provide cache tags
      providesTags: ['Auth', 'Session'],
      
      // Keep data fresh
      keepUnusedDataFor: 60, // 1 minute
    }),

    /**
     * Validate token endpoint
     */
    validateToken: builder.mutation({
      query: (token) => ({
        url: '/validate-token',
        method: 'POST',
        body: { token },
      }),
      
      transformResponse: (response) => {
        console.log('[AUTH API] Token validation result:', response.valid);
        return response;
      },
    }),

    /**
     * Health check for auth service
     */
    getAuthHealth: builder.query({
      query: () => '/health',
      
      transformResponse: (response) => {
        console.log('[AUTH API] Auth service health:', response.status);
        return response;
      },
      
      // Keep health data for shorter time
      keepUnusedDataFor: 30, // 30 seconds
    }),
  }),
});

// Export hooks for use in components
export const {
  useLoginMutation,
  useSignupMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
  useGetAuthStatusQuery,
  useValidateTokenMutation,
  useGetAuthHealthQuery,
} = authApi;

// Export API slice
export default authApi; 