import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Shield,
  TrendingUp,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Label } from "../ui/Label";

// Redux
import {
  clearError,
  loginSuccess,
  loginFailure,
  selectAuthLoading,
  selectAuthError,
  selectIsAuthenticated,
  selectUser,
} from "../../store/slices/authSlice";
import { useLoginMutation } from "../../store/api/authApi";

export default function LoginForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Redux state
  const isLoading = useSelector(selectAuthLoading);
  const authError = useSelector(selectAuthError);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);

  // API hooks
  const [loginMutation] = useLoginMutation();

  // Form handling
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
  } = useForm({
    mode: "onBlur",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Get device info for security
  const getDeviceInfo = () => {
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;

    let browser = "Unknown";
    if (userAgent.includes("Chrome")) browser = "Chrome";
    else if (userAgent.includes("Firefox")) browser = "Firefox";
    else if (userAgent.includes("Safari")) browser = "Safari";
    else if (userAgent.includes("Edge")) browser = "Edge";

    return {
      browser,
      os: platform,
      userAgent: userAgent.substring(0, 200),
      timestamp: new Date().toISOString(),
    };
  };

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      const loginData = {
        email: data.email.toLowerCase().trim(),
        password: data.password,
        rememberMe,
        deviceInfo: getDeviceInfo(),
      };

      console.log("[LOGIN FORM] Attempting login for:", loginData.email);
      const result = await loginMutation(loginData).unwrap();

      console.log("[LOGIN FORM] Login successful:", result);

      // Manual Redux state update as backup (in case extraReducers don't work)
      dispatch(
        loginSuccess({
          user: result.user,
          token: result.token,
          expiresAt: result.token.expiresAt,
          rememberMe: rememberMe,
        })
      );

      console.log("[LOGIN FORM] Manual Redux state update dispatched");

      toast.success("Welcome to StyloPay! Login successful.", {
        duration: 3000,
      });

      // Check if user is admin and redirect accordingly
      const isAdmin = result.user?.role === "admin";
      const redirectTo =
        location.state?.from ||
        (isAdmin ? "/admin/dashboard" : "/user/dashboard");

      console.log(
        "[LOGIN FORM] Redirecting to:",
        redirectTo,
        "(User role:",
        result.user?.role,
        ")"
      );

      // Check Redux state before navigation
      console.log("[LOGIN FORM] Current Redux auth state before navigation:", {
        isAuthenticated,
        user,
        hasToken: !!(
          localStorage.getItem("stylopay_token") ||
          sessionStorage.getItem("stylopay_token")
        ),
      });

      // Small delay to ensure Redux state is updated before navigation
      setTimeout(() => {
        console.log("[LOGIN FORM] Navigating to:", redirectTo);
        navigate(redirectTo, { replace: true });
      }, 200);
    } catch (error) {
      console.error("[LOGIN FORM] Login failed:", error);

      // Note: Redux state will be automatically updated by extraReducers
      // in authSlice when the RTK Query mutation is rejected

      const errorMessage =
        error.message || error.data?.error || "Login failed. Please try again.";
      toast.error(errorMessage, { duration: 5000 });
      reset({ email: data.email, password: "" });
    }
  };

  // Handle form errors
  const onError = (errors) => {
    const firstError = Object.values(errors)[0];
    if (firstError?.message) {
      toast.error(firstError.message);
    }
  };

  // Clear errors when user types
  useEffect(() => {
    const subscription = watch(() => {
      if (authError) {
        dispatch(clearError());
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, authError, dispatch]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      // Role-based redirect for already authenticated users
      const isAdmin = user.role === "admin";
      const defaultRoute = isAdmin ? "/admin/dashboard" : "/user/dashboard";
      const redirectTo = location.state?.from || defaultRoute;

      console.log("[LOGIN FORM] Already authenticated, redirecting:", {
        user: user.email,
        role: user.role,
        isAdmin,
        redirectTo,
      });

      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, user, navigate, location]);

  // Security: Clear form on unmount
  useEffect(() => {
    return () => reset();
  }, [reset]);

  return (
    <div className="flex bg-primary rounded-lg overflow-hidden shadow-lg">
      {/* Left Side - Dynamic Design */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0">
          {/* Animated background elements */}
          <div className="absolute top-1/4 left-1/3 w-4 h-4 bg-white/30 rounded-full animate-pulse" />
          <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-white/40 rounded-full animate-bounce" />
          <div className="absolute bottom-1/3 right-1/3 w-3 h-3 bg-white/20 rounded-full animate-pulse" />
          <Shield
            className="absolute top-1/3 right-1/4 h-6 w-6 text-white/30 animate-pulse"
            style={{ animationDuration: "3s" }}
          />
          <TrendingUp className="absolute bottom-1/4 left-1/2 h-8 w-8 text-white/40 animate-pulse" />
        </div>
        <div className="relative z-10 flex items-center justify-center p-12">
          <div className="text-center text-primary-foreground max-w-lg">
            <div className="w-20 h-20 bg-primary-foreground/20 rounded-full flex items-center justify-center mx-auto mb-8 backdrop-blur-sm">
              <Shield className="h-10 w-10" />
            </div>
            <h1 className="text-5xl font-bold mb-6">StyloPay</h1>
            <p className="text-xl opacity-90 leading-relaxed">
              Secure financial management platform designed for modern
              professionals and businesses.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="bg-background rounded-3xl shadow-2xl p-8 space-y-6 relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-brand-400 to-brand-600 rounded-full -translate-y-10 translate-x-10 opacity-10" />
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-br from-blue-light-400 to-brand-500 rounded-full translate-y-8 -translate-x-8 opacity-10" />

            <div className="text-center relative z-10">
              <h2 className="text-3xl font-bold text-foreground">
                Welcome Back
              </h2>
              <p className="mt-2 text-foreground">
                Secure access to your financial dashboard
              </p>
            </div>

            {/* Show error message if any */}
            {authError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 relative z-10">
                <p className="text-red-800 text-sm">{authError}</p>
              </div>
            )}

            <form
              onSubmit={handleSubmit(onSubmit, onError)}
              className="space-y-5 relative z-10"
            >
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm text-foreground">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="Enter your email"
                    className={`pl-12 h-12 border-2 ${
                      errors.email
                        ? "border-red-400 focus:border-red-400 focus:ring-red-400/20"
                        : "border-gray-200 focus:border-brand-400 focus:ring-brand-400/20"
                    } rounded-xl`}
                    {...register("email", {
                      required: "Email address is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Please enter a valid email address",
                      },
                      maxLength: {
                        value: 100,
                        message: "Email address is too long",
                      },
                    })}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm text-foreground">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    className={`pl-12 pr-12 h-12 border-2 ${
                      errors.password
                        ? "border-red-400 focus:border-red-400 focus:ring-red-400/20"
                        : "border-gray-200 focus:border-brand-400 focus:ring-brand-400/20"
                    } rounded-xl`}
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 8,
                        message: "Password must be at least 8 characters",
                      },
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.password.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    id="remember"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <Label htmlFor="remember" className="mb-0">
                    Remember me
                  </Label>
                </div>
                <Link
                  to="/forgot-password"
                  className="text-sm text-brand-500 hover:text-brand-600 font-medium"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                variant="default"
                size="lg"
                fullWidth
                disabled={isLoading || isSubmitting}
                rightIcon={
                  isLoading || isSubmitting ? (
                    <Loader2 className="size-5 animate-spin" />
                  ) : (
                    <Shield className="size-5" />
                  )
                }
              >
                {isLoading || isSubmitting ? "Signing In..." : "Sign In"}
              </Button>
            </form>

            <div className="text-center relative z-10">
              <p className="text-sm text-foreground">
                {"Don't have an account? "}
                <Link
                  to="/signup"
                  className="text-brand-500 hover:text-brand-600 font-semibold"
                >
                  Create account
                </Link>
              </p>
            </div>

            {/* Security Notice */}
            <div className="text-center relative z-10">
              <p className="text-xs text-muted-foreground">
                <Shield className="w-3 h-3 inline mr-1" />
                Your connection is secured with 256-bit SSL encryption
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
