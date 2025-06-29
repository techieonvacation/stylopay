/**
 * Redux Store Configuration for StyloPay Frontend
 * Configures Redux Toolkit with authentication and API state management
 */

import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import authReducer from './slices/authSlice';
import { authApi } from './api/authApi';
import { userApi } from './api/userApi';
import { zoqqApi } from './api/zoqqApi';

/**
 * Configure Redux store with reducers and middleware
 */
export const store = configureStore({
  reducer: {
    // Auth slice for authentication state
    auth: authReducer,
    
    // RTK Query API slices
    [authApi.reducerPath]: authApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [zoqqApi.reducerPath]: zoqqApi.reducer,
  },
  
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Configure serialization checks for banking security
      serializableCheck: {
        ignoredActions: [
          // Ignore RTK Query actions
          'api/executeQuery/fulfilled',
          'api/executeQuery/pending',
          'api/executeQuery/rejected',
        ],
        ignoredPaths: [
          // Ignore API slice state
          'api.queries',
          'api.mutations',
        ],
      },
      // Enable immutability checks in development
      immutableCheck: process.env.NODE_ENV !== 'production',
    })
    .concat(authApi.middleware)
    .concat(userApi.middleware)
    .concat(zoqqApi.middleware),

  // Enable Redux DevTools in development only
  devTools: process.env.NODE_ENV !== 'production',
});

// Setup listeners for refetchOnFocus/refetchOnReconnect behaviors
setupListeners(store.dispatch);

export default store; 