/**
 * Zoqq API Slice using RTK Query
 * Comprehensive implementation of all Zoqq endpoints with automatic caching,
 * error handling, optimistic updates, and proper loading states
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { toast } from 'react-hot-toast';

// Base URL for the backend API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Base query with authentication and comprehensive error handling
 */
const baseQueryWithAuth = fetchBaseQuery({
  baseUrl: `${API_BASE_URL}/zoqq`,
  credentials: 'include',
  
  prepareHeaders: (headers, { getState }) => {
    // Add common headers for security
    headers.set('Content-Type', 'application/json');
    headers.set('X-Requested-With', 'XMLHttpRequest');
    
    // Get token from localStorage or sessionStorage
    const token = localStorage.getItem('stylopay_token') || sessionStorage.getItem('stylopay_token');
    
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    
    return headers;
  },
});

/**
 * Enhanced base query with retry logic and comprehensive error handling
 */
const baseQueryWithRetry = async (args, api, extraOptions) => {
  let result = await baseQueryWithAuth(args, api, extraOptions);
  
  // Handle token expiration and automatic refresh
  if (result.error && result.error.status === 401) {
    console.log('[ZOQQ API] Token expired or missing, attempting to refresh...');
    
    // Try to refresh token from auth API
    const refreshResult = await baseQueryWithAuth(
      { url: '../auth/refresh', method: 'POST' },
      api,
      extraOptions
    );
    
    if (refreshResult.data) {
      console.log('[ZOQQ API] Token refreshed successfully');
      
      // Store new token
      const { accessToken } = refreshResult.data;
      if (accessToken) {
        localStorage.setItem('stylopay_token', accessToken);
      }
      
      // Retry original request with new token
      result = await baseQueryWithAuth(args, api, extraOptions);
    } else {
      console.log('[ZOQQ API] Token refresh failed, redirecting to login');
      
      // Clear invalid tokens
      localStorage.removeItem('stylopay_token');
      sessionStorage.removeItem('stylopay_token');
      
      // Show error toast
      toast.error('Session expired. Please login again.');
      
      // Dispatch logout action
      api.dispatch({ type: 'auth/sessionExpired' });
    }
  }
  
  // Log API errors for monitoring
  if (result.error) {
    console.error('[ZOQQ API] Error:', {
      endpoint: args.url || args,
      status: result.error.status,
      message: result.error.data?.message || result.error.error,
      code: result.error.data?.code,
    });
    
    // Show user-friendly error messages
    const errorMessage = result.error.data?.message || 'An error occurred';
    if (result.error.status !== 401) { // Don't show toast for auth errors (handled above)
      toast.error(errorMessage);
    }
  }
  
  return result;
};

/**
 * Zoqq API slice with comprehensive endpoint coverage
 */
export const zoqqApi = createApi({
  reducerPath: 'zoqqApi',
  baseQuery: baseQueryWithRetry,
  
  // Tag types for intelligent cache invalidation
  tagTypes: ['ZoqqAuth', 'ZoqqUser', 'ZoqqRFI', 'ZoqqStatus'],
  
  endpoints: (builder) => ({
    // ========== AUTHENTICATION ENDPOINTS ==========
    
    /**
     * Get Zoqq Authentication Token
     */
    getZoqqToken: builder.mutation({
      query: () => ({
        url: '/auth/token',
        method: 'POST',
      }),
      
      transformResponse: (response) => {
        console.log('[ZOQQ API] Authentication token obtained:', response.data);
        return response;
      },
      
      transformErrorResponse: (response) => ({
        status: response.status,
        message: response.data?.message || 'Failed to obtain Zoqq token',
        code: response.data?.code || 'ZOQQ_AUTH_ERROR',
      }),
      
      invalidatesTags: ['ZoqqAuth'],
    }),

    // ========== USER MANAGEMENT ENDPOINTS ==========
    
    /**
     * Create User in Zoqq System
     */
    createZoqqUser: builder.mutation({
      query: (userDetails) => ({
        url: '/user/create',
        method: 'POST',
        body: userDetails,
      }),
      
      transformResponse: (response) => {
        console.log('[ZOQQ API] User created successfully:', response.data);
        
        // Show success toast
        toast.success('User account created successfully in Zoqq system!');
        
        return response;
      },
      
      transformErrorResponse: (response) => {
        const errorMessage = response.data?.message || 'Failed to create user account';
        console.error('[ZOQQ API] User creation failed:', errorMessage);
        
        return {
          status: response.status,
          message: errorMessage,
          code: response.data?.code || 'USER_CREATE_ERROR',
          errors: response.data?.errors || []
        };
      },
      
      invalidatesTags: ['ZoqqUser', 'ZoqqStatus'],
    }),
    
    /**
     * Get Zoqq User Details
     */
    getZoqqUser: builder.query({
      query: (userId) => `/user/${userId}`,
      
      transformResponse: (response) => {
        console.log('[ZOQQ API] User details retrieved:', response.data);
        return response;
      },
      
      transformErrorResponse: (response) => ({
        status: response.status,
        message: response.data?.message || 'Failed to retrieve user details',
        code: response.data?.code || 'USER_GET_ERROR',
      }),
      
      providesTags: (result, error, userId) => [
        { type: 'ZoqqUser', id: userId },
        'ZoqqUser'
      ],
    }),
    
    /**
     * Accept Terms and Conditions
     */
    acceptTerms: builder.mutation({
      query: (userId) => ({
        url: `/user/${userId}/terms`,
        method: 'POST',
      }),
      
      transformResponse: (response) => {
        console.log('[ZOQQ API] Terms accepted successfully');
        
        // Show success toast
        toast.success('Terms and conditions accepted successfully!');
        
        return response;
      },
      
      transformErrorResponse: (response) => ({
        status: response.status,
        message: response.data?.message || 'Failed to accept terms and conditions',
        code: response.data?.code || 'TERMS_ACCEPT_ERROR',
      }),
      
      invalidatesTags: (result, error, userId) => [
        { type: 'ZoqqUser', id: userId },
        'ZoqqUser'
      ],
    }),
    
    /**
     * Activate Account
     */
    activateAccount: builder.mutation({
      query: (userId) => ({
        url: `/user/${userId}/activate`,
        method: 'POST',
      }),
      
      transformResponse: (response) => {
        console.log('[ZOQQ API] Account activated successfully');
        
        // Show success toast
        toast.success('Account activated successfully! You can now access all features.');
        
        return response;
      },
      
      transformErrorResponse: (response) => ({
        status: response.status,
        message: response.data?.message || 'Failed to activate account',
        code: response.data?.code || 'ACTIVATION_ERROR',
      }),
      
      invalidatesTags: (result, error, userId) => [
        { type: 'ZoqqUser', id: userId },
        'ZoqqUser',
        'ZoqqStatus'
      ],
    }),

    // ========== RFI (REQUEST FOR INFORMATION) ENDPOINTS ==========
    
    /**
     * Get RFI Details
     */
    getRFIDetails: builder.query({
      query: (userId) => `/user/${userId}/rfi`,
      
      transformResponse: (response) => {
        console.log('[ZOQQ API] RFI details retrieved:', response.data);
        return response;
      },
      
      transformErrorResponse: (response) => ({
        status: response.status,
        message: response.data?.message || 'Failed to retrieve RFI details',
        code: response.data?.code || 'RFI_GET_ERROR',
      }),
      
      providesTags: (result, error, userId) => [
        { type: 'ZoqqRFI', id: userId },
        'ZoqqRFI'
      ],
    }),
    
    /**
     * Respond to RFI
     */
    respondToRFI: builder.mutation({
      query: ({ userId, rfiResponse }) => ({
        url: `/user/${userId}/rfi`,
        method: 'POST',
        body: rfiResponse,
      }),
      
      transformResponse: (response) => {
        console.log('[ZOQQ API] RFI response submitted successfully');
        
        // Show success toast
        toast.success('RFI response submitted successfully!');
        
        return response;
      },
      
      transformErrorResponse: (response) => ({
        status: response.status,
        message: response.data?.message || 'Failed to submit RFI response',
        code: response.data?.code || 'RFI_RESPONSE_ERROR',
        errors: response.data?.errors || []
      }),
      
      invalidatesTags: (result, error, { userId }) => [
        { type: 'ZoqqRFI', id: userId },
        'ZoqqRFI',
        { type: 'ZoqqUser', id: userId }
      ],
    }),

    // ========== STATUS AND MONITORING ENDPOINTS ==========
    
    /**
     * Get Zoqq Integration Status
     */
    getZoqqStatus: builder.query({
      query: () => '/status',
      
      transformResponse: (response) => {
        console.log('[ZOQQ API] Integration status retrieved:', response.data);
        return response;
      },
      
      transformErrorResponse: (response) => ({
        status: response.status,
        message: response.data?.message || 'Failed to check Zoqq status',
        code: response.data?.code || 'STATUS_ERROR',
      }),
      
      providesTags: ['ZoqqStatus'],
      
      // Refresh status every 5 minutes
      pollingInterval: 300000,
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  // Authentication
  useGetZoqqTokenMutation,
  
  // User Management
  useCreateZoqqUserMutation,
  useGetZoqqUserQuery,
  useLazyGetZoqqUserQuery,
  useAcceptTermsMutation,
  useActivateAccountMutation,
  
  // RFI Management
  useGetRFIDetailsQuery,
  useLazyGetRFIDetailsQuery,
  useRespondToRFIMutation,
  
  // Status Monitoring
  useGetZoqqStatusQuery,
  useLazyGetZoqqStatusQuery,
} = zoqqApi;

// Export default for reducer
export default zoqqApi.reducer;

// ========== UTILITY FUNCTIONS ==========

/**
 * Validate Zoqq user creation data
 * @param {Object} userDetails - User data to validate
 * @returns {Object} Validation result with errors
 */
export const validateZoqqUserData = (userDetails) => {
  const errors = {};
  
  // Required fields validation
  const requiredFields = [
    'emailId', 'amount', 'currency', 'businessName', 'businessStructure',
    'contactNumber', 'identificationType', 'Idnumber', 'issuingCountryCode',
    'effectiveAt', 'expireAt', 'firstName', 'lastName', 'dateOfBirth',
    'nationality', 'mobile', 'roles', 'legalEntityType', 'asTrustee',
    'agreedToTermsAndConditions', 'productReference', 'type', 'number',
    'descriptionOfGoodsOrServices', 'industryCategoryCode', 'operatingCountry',
    'registrationAddressLine1', 'registrationCountryCode', 'registrationPostcode',
    'registrationState', 'registrationSuburb', 'residentialAddressLine1',
    'residentialCountryCode', 'residentialPostcode', 'residentialState',
    'residentialSuburb', 'fileId', 'tag', 'frontFileId', 'personDocumentsFileId',
    'personDocumentsTag', 'liveSelfieFileId', 'countryCode'
  ];
  
  requiredFields.forEach(field => {
    if (!userDetails[field]) {
      errors[field] = `${field} is required`;
    }
  });
  
  // Email validation
  if (userDetails.emailId && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userDetails.emailId)) {
    errors.emailId = 'Invalid email format';
  }
  
  // Date validations
  if (userDetails.effectiveAt && userDetails.expireAt) {
    const effectiveDate = new Date(userDetails.effectiveAt);
    const expiryDate = new Date(userDetails.expireAt);
    
    if (effectiveDate >= expiryDate) {
      errors.expireAt = 'Expiry date must be after effective date';
    }
  }
  
  if (userDetails.dateOfBirth) {
    const birthDate = new Date(userDetails.dateOfBirth);
    const today = new Date();
    
    if (birthDate >= today) {
      errors.dateOfBirth = 'Date of birth must be in the past';
    }
  }
  
  // Amount validation
  if (userDetails.amount && (isNaN(userDetails.amount) || parseFloat(userDetails.amount) < 0)) {
    errors.amount = 'Amount must be a positive number';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Format user data for Zoqq API submission
 * @param {Object} rawUserData - Raw form data
 * @returns {Object} Formatted data for API
 */
export const formatZoqqUserData = (rawUserData) => {
  return {
    ...rawUserData,
    emailId: rawUserData.emailId?.toLowerCase().trim(),
    amount: parseFloat(rawUserData.amount).toString(),
    agreedToTermsAndConditions: Boolean(rawUserData.agreedToTermsAndConditions),
    asTrustee: Boolean(rawUserData.asTrustee),
    // Ensure date formats are YYYY-MM-DD
    dateOfBirth: rawUserData.dateOfBirth ? new Date(rawUserData.dateOfBirth).toISOString().split('T')[0] : null,
    effectiveAt: rawUserData.effectiveAt ? new Date(rawUserData.effectiveAt).toISOString().split('T')[0] : null,
    expireAt: rawUserData.expireAt ? new Date(rawUserData.expireAt).toISOString().split('T')[0] : null,
  };
};

/**
 * Get user onboarding status and next steps
 * @param {Object} userData - User data from API
 * @returns {Object} Status and next steps
 */
export const getUserOnboardingStatus = (userData) => {
  if (!userData) {
    return {
      status: 'not_started',
      step: 1,
      totalSteps: 4,
      nextAction: 'Create Zoqq account',
      description: 'Start the onboarding process by creating your Zoqq account'
    };
  }
  
  const accountStatus = userData.account_details?.status || userData.status;
  
  switch (accountStatus) {
    case 'CREATED':
      return {
        status: 'created',
        step: 2,
        totalSteps: 4,
        nextAction: 'Accept Terms and Conditions',
        description: 'Review and accept the terms and conditions to proceed'
      };
    
    case 'terms_accepted':
      return {
        status: 'terms_accepted',
        step: 3,
        totalSteps: 4,
        nextAction: 'Activate Account',
        description: 'Submit your account for activation and verification'
      };
    
    case 'ACTIVE':
      return {
        status: 'active',
        step: 4,
        totalSteps: 4,
        nextAction: 'Complete',
        description: 'Your account is fully activated and ready to use'
      };
    
    case 'ACTION_REQUIRED':
      return {
        status: 'rfi_required',
        step: 3,
        totalSteps: 4,
        nextAction: 'Complete RFI',
        description: 'Additional information is required for compliance verification'
      };
    
    default:
      return {
        status: 'unknown',
        step: 1,
        totalSteps: 4,
        nextAction: 'Check Status',
        description: 'Please check your account status or contact support'
      };
  }
}; 