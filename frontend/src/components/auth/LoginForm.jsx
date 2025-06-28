import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, Shield, TrendingUp } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Label } from "../ui/Label";
import { Link } from "react-router";

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);

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

            <form className="space-y-5 relative z-10">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm text-foreground"
                >
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-12 h-12 border-2 border-gray-200 focus:border-brand-400 focus:ring-brand-400/20 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm text-foreground"
                >
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
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

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    id="remember"
                    type="checkbox"
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <Label htmlFor="remember" className="mb-0">Remember me</Label>
                </div>
                <Link
                  to="#"
                  className="text-sm text-brand-500 hover:text-brand-600 font-medium"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                variant="default"
                size="lg"
                fullWidth
                rightIcon={<Shield className="size-5" />}
              >
                Sign In
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
          </div>
        </div>
      </div>
    </div>
  );
}
