import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, Shield, BarChart3 } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Label } from "../ui/Label";
import { Link } from "react-router";

export default function SignupForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

            <form className="space-y-5 relative z-10">
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
                    placeholder="John"
                    className="h-12 border-2 border-gray-200 focus:border-brand-400 focus:ring-brand-400/20 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm text-foreground">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    className="h-12 border-2 border-gray-200 focus:border-brand-400 focus:ring-brand-400/20 rounded-xl"
                  />
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
                    placeholder="john@example.com"
                    className="pl-12 h-12 border-2 border-gray-200 focus:border-brand-400 focus:ring-brand-400/20 rounded-xl"
                  />
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
                    placeholder="Create a strong password"
                    className="pl-12 pr-12 h-12 border-2 border-gray-200 focus:border-brand-400 focus:ring-brand-400/20 rounded-xl"
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
                    placeholder="Confirm your password"
                    className="pl-12 pr-12 h-12 border-2 border-gray-200 focus:border-brand-400 focus:ring-brand-400/20 rounded-xl"
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
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <input
                  id="terms"
                  type="checkbox"
                  className="h-4 w-4 text-brand-500 focus:ring-brand-500 border-border rounded mt-1"
                />
                <Label
                  htmlFor="terms"
                  className="text-sm text-foreground leading-5"
                >
                  I agree to the{" "}
                  <Link
                    to="#"
                    className="text-brand-500 hover:text-brand-600 font-medium"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    to="#"
                    className="text-brand-500 hover:text-brand-600 font-medium"
                  >
                    Privacy Policy
                  </Link>
                </Label>
              </div>

              <Button
                variant="default"
                size="lg"
                fullWidth
                rightIcon={<Shield className="size-5" />}
              >
                Create Account
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
          </div>
        </div>
      </div>
    </div>
  );
}
