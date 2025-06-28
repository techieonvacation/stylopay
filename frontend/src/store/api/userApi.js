/**
 * User API Slice using RTK Query
 * Handles all user-related API calls with secure data management
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import Cookies from 'js-cookie';

// Base URL for the backend API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Base query with authentication for user endpoints
 */
const baseQueryWithAuth = fetchBaseQuery({
  baseUrl: `${API_BASE_URL}/user`,
  credentials: 'include',
  
  prepareHeaders: (headers, { getState }) => {
    // Add common headers
    headers.set('Content-Type', 'application/json');
    headers.set('X-Requested-With', 'XMLHttpRequest');
    
    // Get token from storage
    const token = localStorage.getItem('stylopay_token') || sessionStorage.getItem('stylopay_token');
    
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    
    // Add CSRF protection
    const csrfToken = Cookies.get('csrf_token');
    if (csrfToken) {
      headers.set('X-CSRF-Token', csrfToken);
    }
    
    return headers;
  },
});

/**
 * Enhanced base query with error handling for user endpoints
 */
const baseQueryWithErrorHandling = async (args, api, extraOptions) => {
  let result = await baseQueryWithAuth(args, api, extraOptions);
  
  // Handle authentication errors
  if (result.error && result.error.status === 401) {
    console.log('[USER API] Authentication required, redirecting to login');
    
    // Clear invalid tokens
    localStorage.removeItem('stylopay_token');
    sessionStorage.removeItem('stylopay_token');
    Cookies.remove('auth_session');
    
    // Dispatch session expired action
    api.dispatch({ type: 'auth/sessionExpired' });
  }
  
  // Log API errors for monitoring
  if (result.error) {
    console.error('[USER API] Error:', {
      endpoint: args.url || args,
      status: result.error.status,
      message: result.error.data?.message || result.error.error,
      code: result.error.data?.code,
    });
  }
  
  return result;
};

/**
 * User API slice
 */
export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: baseQueryWithErrorHandling,
  
  // Tag types for cache invalidation
  tagTypes: ['User', 'Profile', 'Security', 'Preferences', 'Session'],
  
  endpoints: (builder) => ({
    /**
     * Get user profile
     */
    getUserProfile: builder.query({
      query: () => '/profile',
      
      transformResponse: (response) => {
        console.log('[USER API] Profile data retrieved');
        return response.profile;
      },
      
      providesTags: ['User', 'Profile'],
      keepUnusedDataFor: 300, // 5 minutes
    }),

    /**
     * Update user profile
     */
    updateUserProfile: builder.mutation({
      query: (profileData) => ({
        url: '/profile',
        method: 'PUT',
        body: profileData,
      }),
      
      transformResponse: (response) => {
        console.log('[USER API] Profile updated successfully');
        return response;
      },
      
      // Invalidate profile cache on update
      invalidatesTags: ['User', 'Profile'],
    }),

    /**
     * Get account status
     */
    getAccountStatus: builder.query({
      query: () => '/account-status',
      
      transformResponse: (response) => {
        console.log('[USER API] Account status retrieved');
        return response.accountStatus;
      },
      
      providesTags: ['User', 'Security'],
      keepUnusedDataFor: 180, // 3 minutes
    }),

    /**
     * Change password
     */
    changePassword: builder.mutation({
      query: (passwordData) => ({
        url: '/change-password',
        method: 'POST',
        body: passwordData,
      }),
      
      transformResponse: (response) => {
        console.log('[USER API] Password changed successfully');
        return response;
      },
      
      // Invalidate security-related cache
      invalidatesTags: ['Security'],
    }),

    /**
     * Get session information
     */
    getSessionInfo: builder.query({
      query: () => '/session-info',
      
      transformResponse: (response) => {
        console.log('[USER API] Session info retrieved');
        return response.session;
      },
      
      providesTags: ['Session'],
      keepUnusedDataFor: 60, // 1 minute
    }),

    /**
     * Get security events
     */
    getSecurityEvents: builder.query({
      query: (params = {}) => ({
        url: '/security-events',
        params: {
          limit: params.limit || 10,
          offset: params.offset || 0,
        },
      }),
      
      transformResponse: (response) => {
        console.log('[USER API] Security events retrieved');
        return {
          events: response.events,
          total: response.total,
        };
      },
      
      providesTags: ['Security'],
      keepUnusedDataFor: 120, // 2 minutes
    }),

    /**
     * Logout from all sessions
     */
    logoutAllSessions: builder.mutation({
      query: () => ({
        url: '/logout-all-sessions',
        method: 'POST',
      }),
      
      transformResponse: (response) => {
        console.log('[USER API] All sessions logged out');
        
        // Clear local tokens as well
        localStorage.removeItem('stylopay_token');
        sessionStorage.removeItem('stylopay_token');
        Cookies.remove('auth_session');
        
        return response;
      },
      
      // Invalidate all user-related cache
      invalidatesTags: ['User', 'Profile', 'Security', 'Session', 'Preferences'],
    }),

    /**
     * Get user preferences
     */
    getUserPreferences: builder.query({
      query: () => '/preferences',
      
      transformResponse: (response) => {
        console.log('[USER API] User preferences retrieved');
        return response.preferences;
      },
      
      providesTags: ['Preferences'],
      keepUnusedDataFor: 600, // 10 minutes
    }),

    /**
     * Update user preferences
     */
    updateUserPreferences: builder.mutation({
      query: (preferences) => ({
        url: '/preferences',
        method: 'PUT',
        body: preferences,
      }),
      
      transformResponse: (response) => {
        console.log('[USER API] User preferences updated');
        return response;
      },
      
      // Invalidate preferences cache
      invalidatesTags: ['Preferences'],
    }),

    /**
     * Get dashboard data (combined user info)
     */
    getDashboardData: builder.query({
      query: () => '/dashboard',
      
      transformResponse: (response) => {
        console.log('[USER API] Dashboard data retrieved');
        return response.dashboard;
      },
      
      providesTags: ['User', 'Profile'],
      keepUnusedDataFor: 180, // 3 minutes
    }),

    /**
     * Update notification settings
     */
    updateNotificationSettings: builder.mutation({
      query: (settings) => ({
        url: '/notifications',
        method: 'PUT',
        body: settings,
      }),
      
      transformResponse: (response) => {
        console.log('[USER API] Notification settings updated');
        return response;
      },
      
      invalidatesTags: ['Preferences'],
    }),

    /**
     * Get user activity log
     */
    getUserActivity: builder.query({
      query: (params = {}) => ({
        url: '/activity',
        params: {
          limit: params.limit || 20,
          offset: params.offset || 0,
          type: params.type, // login, transaction, security, etc.
        },
      }),
      
      transformResponse: (response) => {
        console.log('[USER API] User activity retrieved');
        return {
          activities: response.activities,
          total: response.total,
        };
      },
      
      providesTags: ['Security'],
      keepUnusedDataFor: 300, // 5 minutes
    }),

    /**
     * Verify user action (for sensitive operations)
     */
    verifyUserAction: builder.mutation({
      query: (verificationData) => ({
        url: '/verify-action',
        method: 'POST',
        body: verificationData,
      }),
      
      transformResponse: (response) => {
        console.log('[USER API] User action verified');
        return response;
      },
    }),

    /**
     * Upload profile picture
     */
    uploadProfilePicture: builder.mutation({
      query: (formData) => ({
        url: '/profile-picture',
        method: 'POST',
        body: formData,
        // Don't set Content-Type for FormData, let browser set it with boundary
        formData: true,
      }),
      
      transformResponse: (response) => {
        console.log('[USER API] Profile picture uploaded');
        return response;
      },
      
      invalidatesTags: ['Profile'],
    }),

    /**
     * Delete user account (sensitive operation)
     */
    deleteAccount: builder.mutation({
      query: (confirmationData) => ({
        url: '/delete-account',
        method: 'DELETE',
        body: confirmationData,
      }),
      
      transformResponse: (response) => {
        console.log('[USER API] Account deletion initiated');
        
        // Clear all local data
        localStorage.clear();
        sessionStorage.clear();
        
        return response;
      },
      
      // Invalidate all cache
      invalidatesTags: ['User', 'Profile', 'Security', 'Session', 'Preferences'],
    }),
  }),
});

// Export hooks for use in components
export const {
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
  useGetAccountStatusQuery,
  useChangePasswordMutation,
  useGetSessionInfoQuery,
  useGetSecurityEventsQuery,
  useLogoutAllSessionsMutation,
  useGetUserPreferencesQuery,
  useUpdateUserPreferencesMutation,
  useGetDashboardDataQuery,
  useUpdateNotificationSettingsMutation,
  useGetUserActivityQuery,
  useVerifyUserActionMutation,
  useUploadProfilePictureMutation,
  useDeleteAccountMutation,
} = userApi;

// Export API slice
export default userApi; 