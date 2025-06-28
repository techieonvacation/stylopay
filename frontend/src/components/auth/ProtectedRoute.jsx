/**
 * Protected Route Component
 * Handles authentication and authorization for secure banking routes
 */

import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Shield, AlertTriangle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

// Redux selectors
import {
  selectIsAuthenticated,
  selectIsSessionValid,
  selectAuthLoading,
  selectAuthError,
  selectUser,
} from '../../store/slices/authSlice';

// API hooks
import { useValidateTokenMutation } from '../../store/api/authApi';

/**
 * Loading component for authentication checks
 */
const AuthLoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center">
      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        Verifying Authentication
      </h3>
      <p className="text-muted-foreground">
        Please wait while we verify your session...
      </p>
    </div>
  </div>
);

/**
 * Access denied component for unauthorized users
 */
const AccessDenied = ({ reason = 'Access denied' }) => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center max-w-md mx-auto p-6">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertTriangle className="w-8 h-8 text-red-600" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        Access Denied
      </h3>
      <p className="text-muted-foreground mb-4">
        {reason}
      </p>
      <button
        onClick={() => window.history.back()}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
      >
        Go Back
      </button>
    </div>
  </div>
);

/**
 * Protected Route Component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render when authenticated
 * @param {boolean} props.requireAdmin - Whether route requires admin access
 * @param {string[]} props.requiredPermissions - Required permissions for access
 * @param {boolean} props.strictMode - Enable strict security checks
 */
const ProtectedRoute = ({ 
  children, 
  requireAdmin = false, 
  requiredPermissions = [], 
  strictMode = true 
}) => {
  const location = useLocation();
  const [isValidating, setIsValidating] = useState(true);
  const [validationError, setValidationError] = useState(null);

  // Redux state
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isSessionValid = useSelector(selectIsSessionValid);
  const authLoading = useSelector(selectAuthLoading);
  const authError = useSelector(selectAuthError);
  const user = useSelector(selectUser);

  // Debug logging
  console.log('[PROTECTED ROUTE] Redux state check:', {
    isAuthenticated,
    isSessionValid,
    authLoading,
    authError,
    user: user ? { email: user.email, role: user.role } : null,
    route: location.pathname
  });

  // API hooks
  const [validateToken] = useValidateTokenMutation();

  /**
   * Validate current session and token
   */
  const validateSession = async () => {
    try {
      setIsValidating(true);
      setValidationError(null);

      // Get token from storage
      const token = localStorage.getItem('stylopay_token') || sessionStorage.getItem('stylopay_token');
      
      console.log('[PROTECTED ROUTE] Validating session:', {
        hasToken: !!token,
        tokenStart: token ? token.substring(0, 20) + '...' : 'null',
        fromStorage: localStorage.getItem('stylopay_token') ? 'localStorage' : 'sessionStorage'
      });
      
      if (!token) {
        console.log('[PROTECTED ROUTE] No token found in storage');
        setValidationError('No authentication token found');
        return false;
      }

      // Validate token with backend
      console.log('[PROTECTED ROUTE] Calling backend token validation...');
      const result = await validateToken(token).unwrap();
      
      console.log('[PROTECTED ROUTE] Backend validation result:', result);
      
      if (!result.valid || result.expired) {
        console.log('[PROTECTED ROUTE] Token validation failed:', { valid: result.valid, expired: result.expired });
        setValidationError('Session has expired');
        toast.error('Your session has expired. Please log in again.');
        return false;
      }

      console.log('[PROTECTED ROUTE] Session validation successful');
      return true;

    } catch (error) {
      console.error('[PROTECTED ROUTE] Session validation failed:', error);
      setValidationError('Session validation failed');
      toast.error('Unable to verify session. Please log in again.');
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  /**
   * Check user permissions and admin access
   */
  const checkPermissions = () => {
    // Check admin requirement
    if (requireAdmin) {
      const isAdmin = user?.isAdmin === true || user?.role === 'admin';
      console.log('[PROTECTED ROUTE] Admin access check:', {
        requireAdmin,
        userRole: user?.role,
        userIsAdmin: user?.isAdmin,
        isAdmin,
        userEmail: user?.email
      });
      
      if (!isAdmin) {
        console.error('[PROTECTED ROUTE] Admin access denied - user role:', user?.role, 'isAdmin:', user?.isAdmin);
        toast.error('Admin access required');
        return false;
      }
      
      console.log('[PROTECTED ROUTE] Admin access granted');
    }

    // Check specific permissions (if implemented)
    if (requiredPermissions.length > 0) {
      const userPermissions = user?.permissions || [];
      const hasRequiredPermissions = requiredPermissions.every(
        permission => userPermissions.includes(permission)
      );

      if (!hasRequiredPermissions) {
        toast.error('Insufficient permissions');
        return false;
      }
    }

    return true;
  };

  /**
   * Effect to validate session on route access
   */
  useEffect(() => {
    const validateAccess = async () => {
      // Skip validation if already loading or not authenticated
      if (authLoading || !isAuthenticated) {
        setIsValidating(false);
        return;
      }

      // Skip validation if session is already confirmed valid
      if (isSessionValid && !strictMode) {
        setIsValidating(false);
        return;
      }

      // Perform session validation
      const isValid = await validateSession();
      
      if (isValid) {
        // Check permissions after successful validation
        const hasPermissions = checkPermissions();
        if (!hasPermissions) {
          setValidationError('Insufficient permissions');
        }
      }
    };

    validateAccess();
  }, [isAuthenticated, location.pathname]);

  /**
   * Effect to handle authentication errors
   */
  useEffect(() => {
    if (authError) {
      console.log('[PROTECTED ROUTE] Authentication error detected:', authError);
      setValidationError(authError);
    }
  }, [authError]);

  /**
   * Effect to monitor authentication state changes
   */
  useEffect(() => {
    console.log('[PROTECTED ROUTE] Authentication state changed:', {
      isAuthenticated,
      user: user ? { email: user.email, role: user.role } : null
    });
  }, [isAuthenticated, user]);

  // Show loading screen during initial auth check or validation
  if (authLoading || isValidating) {
    return <AuthLoadingScreen />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log('[PROTECTED ROUTE] User not authenticated, redirecting to login');
    
    // Store the attempted location for redirect after login
    const redirectPath = location.pathname + location.search;
    
    return (
      <Navigate 
        to="/login" 
        state={{ from: redirectPath }} 
        replace 
      />
    );
  }

  // Show access denied if validation failed
  if (validationError) {
    return <AccessDenied reason={validationError} />;
  }

  // Check if session is invalid
  if (strictMode && !isSessionValid) {
    return <AccessDenied reason="Your session is invalid. Please log in again." />;
  }

  // Additional security check for sensitive admin routes
  if (requireAdmin && location.pathname.startsWith('/admin')) {
    console.log('[PROTECTED ROUTE] Admin route access granted');
  }

  // Log successful route access for security monitoring
  console.log('[PROTECTED ROUTE] Access granted to:', location.pathname);

  // Render protected content
  return (
    <div className="protected-route">
      {/* Optional: Add security indicators for banking app */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-0 left-0 z-50 bg-green-500 text-white px-2 py-1 text-xs">
          <Shield className="w-3 h-3 inline mr-1" />
          Protected Route
        </div>
      )}
      
      {children}
    </div>
  );
};

export default ProtectedRoute; 