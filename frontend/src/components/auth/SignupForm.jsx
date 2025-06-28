import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, Shield, BarChart3, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Label } from "../ui/Label";

// Redux
import { 
  setLoading, 
  clearError,
  selectAuthLoading,
  selectAuthError,
  selectIsAuthenticated 
} from "../../store/slices/authSlice";
import { useSignupMutation } from "../../store/api/authApi";

export default function SignupForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  // Redux state
  const isLoading = useSelector(selectAuthLoading);
  const authError = useSelector(selectAuthError);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // API hooks
  const [signupMutation] = useSignupMutation();

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
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Watch password to validate confirm password
  const watchPassword = watch("password");

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
      dispatch(setLoading(true));
      dispatch(clearError());

      const signupData = {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email.toLowerCase().trim(),
        password: data.password,
        confirmPassword: data.confirmPassword,
        agreeToTerms: agreeToTerms.toString(),
        deviceInfo: getDeviceInfo(),
      };

      const result = await signupMutation(signupData).unwrap();

      toast.success("Account created successfully! Please check your email to verify your account.", {
        duration: 5000,
      });

      // Redirect to login page after successful signup
      navigate("/login", { 
        state: { 
          from: location.state?.from,
          signupSuccess: true,
          message: "Please verify your email before signing in."
        }
      });

    } catch (error) {
      const errorMessage = error.message || error.data?.error || "Signup failed. Please try again.";
      toast.error(errorMessage, { duration: 5000 });
      
      // Clear passwords for security
      reset({ 
        ...data, 
        password: "", 
        confirmPassword: "" 
      });
    } finally {
      dispatch(setLoading(false));
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
    if (isAuthenticated) {
      const redirectTo = location.state?.from || "/dashboard";
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

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
          <BarChart3 className="absolute bottom-1/4 left-1/2 h-8 w-8 text-white/40 animate-pulse" />
        </div>
        <div className="relative z-10 flex items-center justify-center p-12">
          <div className="text-center text-primary-foreground max-w-lg">
            <div className="w-20 h-20 bg-primary-foreground/20 rounded-full flex items-center justify-center mx-auto mb-8 backdrop-blur-sm">
              <BarChart3 className="h-10 w-10" />
            </div>
            <h1 className="text-5xl font-bold mb-6">StyloPay</h1>
            <p className="text-xl opacity-90 leading-relaxed">
              Join thousands of professionals managing their finances with our
              secure and powerful platform.
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
                Create Account
              </h2>
              <p className="mt-2 text-foreground">
                Start your secure financial journey today
              </p>
            </div>

            {/* Show error message if any */}
            {authError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 relative z-10">
                <p className="text-red-800 text-sm">{authError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-5 relative z-10">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label
                    htmlFor="firstName"
                    className="text-sm text-foreground"
                  >
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    autoComplete="given-name"
                    placeholder="John"
                    className={`h-12 border-2 ${
                      errors.firstName 
                        ? "border-red-400 focus:border-red-400 focus:ring-red-400/20" 
                        : "border-gray-200 focus:border-brand-400 focus:ring-brand-400/20"
                    } rounded-xl`}
                    {...register("firstName", {
                      required: "First name is required",
                      minLength: {
                        value: 2,
                        message: "First name must be at least 2 characters",
                      },
                      maxLength: {
                        value: 50,
                        message: "First name must be less than 50 characters",
                      },
                      pattern: {
                        value: /^[a-zA-Z\s'-]+$/,
                        message: "First name can only contain letters, spaces, hyphens, and apostrophes",
                      },
                    })}
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm text-foreground">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    autoComplete="family-name"
                    placeholder="Doe"
                    className={`h-12 border-2 ${
                      errors.lastName 
                        ? "border-red-400 focus:border-red-400 focus:ring-red-400/20" 
                        : "border-gray-200 focus:border-brand-400 focus:ring-brand-400/20"
                    } rounded-xl`}
                    {...register("lastName", {
                      required: "Last name is required",
                      minLength: {
                        value: 2,
                        message: "Last name must be at least 2 characters",
                      },
                      maxLength: {
                        value: 50,
                        message: "Last name must be less than 50 characters",
                      },
                      pattern: {
                        value: /^[a-zA-Z\s'-]+$/,
                        message: "Last name can only contain letters, spaces, hyphens, and apostrophes",
                      },
                    })}
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm text-foreground">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-foreground h-5 w-5" />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="john@example.com"
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
                    <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
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
                    autoComplete="new-password"
                    placeholder="Create a strong password"
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
                      pattern: {
                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                        message: "Password must contain uppercase, lowercase, number, and special character",
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
                    <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="text-sm text-foreground"
                >
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Confirm your password"
                    className={`pl-12 pr-12 h-12 border-2 ${
                      errors.confirmPassword 
                        ? "border-red-400 focus:border-red-400 focus:ring-red-400/20" 
                        : "border-gray-200 focus:border-brand-400 focus:ring-brand-400/20"
                    } rounded-xl`}
                    {...register("confirmPassword", {
                      required: "Password confirmation is required",
                      validate: (value) =>
                        value === watchPassword || "Password confirmation does not match password",
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <input
                  id="terms"
                  type="checkbox"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  className="h-4 w-4 text-brand-500 focus:ring-brand-500 border-border rounded mt-1"
                />
                <Label
                  htmlFor="terms"
                  className="text-sm text-foreground leading-5"
                >
                  I agree to the{" "}
                  <Link
                    to="/terms"
                    className="text-brand-500 hover:text-brand-600 font-medium"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    to="/privacy"
                    className="text-brand-500 hover:text-brand-600 font-medium"
                  >
                    Privacy Policy
                  </Link>
                </Label>
                {!agreeToTerms && errors.agreeToTerms && (
                  <p className="text-red-500 text-xs mt-1">You must agree to the terms of service</p>
                )}
              </div>

              <Button
                type="submit"
                variant="default"
                size="lg"
                fullWidth
                disabled={isLoading || isSubmitting || !agreeToTerms}
                rightIcon={
                  isLoading || isSubmitting ? (
                    <Loader2 className="size-5 animate-spin" />
                  ) : (
                    <Shield className="size-5" />
                  )
                }
              >
                {isLoading || isSubmitting ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            <div className="text-center relative z-10">
              <p className="text-sm text-foreground">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-brand-500 hover:text-brand-600 font-semibold"
                >
                  Sign in
                </Link>
              </p>
            </div>

            {/* Security Notice */}
            <div className="text-center relative z-10">
              <p className="text-xs text-muted-foreground">
                <Shield className="w-3 h-3 inline mr-1" />
                Your data is protected with bank-grade security
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
