"use client";

import { useState, useEffect, useRef } from "react";
import { Building2, Eye, EyeOff, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const formContainerRef = useRef<HTMLDivElement>(null);

  // Handle input focus to scroll into view on mobile
  useEffect(() => {
    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT") {
        setTimeout(() => {
          target.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }, 300);
      }
    };

    document.addEventListener("focusin", handleFocus);
    return () => document.removeEventListener("focusin", handleFocus);
  }, []);

  const handleInputChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
    setSuccessMessage("");
  };

  const handleKeyPress = (e: any) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  const handleForgotPasswordKeyPress = (e: any) => {
    if (e.key === "Enter") {
      handleForgotPassword();
    }
  };

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL || ""}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        if (data.accessToken) {
          localStorage.setItem("accessToken", data.accessToken);
        }

        if (data.user) {
          localStorage.setItem("userId", data.user.id);
          localStorage.setItem("userEmail", data.user.email);
          localStorage.setItem("userRole", data.user.role);
          localStorage.setItem(
            "userName",
            `${data.user.firstName} ${data.user.lastName}`
          );
        }

        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1000);
      } else {
        setError(
          data.message || "Login failed. Please check your credentials."
        );
      }
    } catch (error) {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail) {
      setError("Please enter your email address");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL || ""}/auth/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: forgotPasswordEmail,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(
          data.message ||
            "If an account with this email exists, a password reset link has been sent."
        );
        setForgotPasswordEmail("");
      } else {
        setError(
          data.message || "Failed to send reset link. Please try again."
        );
      }
    } catch (error) {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setShowForgotPassword(false);
    setError("");
    setSuccessMessage("");
    setForgotPasswordEmail("");
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col bg-white">
        {/* Logo */}
        <div className="p-4 lg:p-8">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-semibold text-gray-900">
              HRMS Portal
            </span>
          </div>
        </div>

        {/* Form Container */}
        <div
          ref={formContainerRef}
          className="flex-1 flex items-start lg:items-center justify-center px-6 lg:px-16 pt-4 pb-8 lg:py-0 overflow-y-auto"
        >
          <div className="w-full max-w-md">
            {!showForgotPassword ? (
              <>
                {/* Login Form Header */}
                <div className="mb-6 lg:mb-8">
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                    Welcome back
                  </h1>
                  <p className="text-gray-600">Please enter your details</p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-4 lg:mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                {/* Login Form */}
                <div className="space-y-4 lg:space-y-5">
                  {/* Email Field */}
                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-900"
                    >
                      Email address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}
                      onKeyPress={handleKeyPress}
                      className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none transition-all"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-900"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleInputChange}
                        onKeyPress={handleKeyPress}
                        className="w-full h-11 px-4 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none transition-all"
                        required
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Forgot Password */}
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm text-orange-600 hover:text-orange-700 font-medium transition-colors disabled:opacity-50"
                      disabled={isLoading}
                    >
                      Forgot password
                    </button>
                  </div>

                  {/* Sign In Button */}
                  <button
                    onClick={handleLogin}
                    disabled={isLoading}
                    className="w-full h-11 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isLoading ? "Signing in..." : "Sign in"}
                  </button>

                  {/* Sign Up Link */}
                  <div className="text-center pt-2">
                    <span className="text-sm text-gray-600">
                      Don't have an account?{" "}
                    </span>
                    <button
                      type="button"
                      className="text-sm font-semibold text-orange-600 hover:text-orange-700 transition-colors disabled:opacity-50 cursor-pointer"
                      disabled={isLoading}
                    >
                      Sign up
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Forgot Password Form Header */}
                <div className="mb-6 lg:mb-8">
                  <button
                    onClick={handleBackToLogin}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                    disabled={isLoading}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm font-medium">Back to login</span>
                  </button>
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                    Forgot password?
                  </h1>
                  <p className="text-gray-600">
                    No worries, we'll send you reset instructions.
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-4 lg:mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                {/* Success Message */}
                {successMessage && (
                  <div className="mb-4 lg:mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-600">{successMessage}</p>
                  </div>
                )}

                {/* Forgot Password Form */}
                <div className="space-y-4 lg:space-y-5">
                  {/* Email Field */}
                  <div className="space-y-2">
                    <label
                      htmlFor="forgot-email"
                      className="block text-sm font-medium text-gray-900"
                    >
                      Email address
                    </label>
                    <input
                      id="forgot-email"
                      name="forgot-email"
                      type="email"
                      placeholder="Enter your email"
                      value={forgotPasswordEmail}
                      onChange={(e) => {
                        setForgotPasswordEmail(e.target.value);
                        setError("");
                        setSuccessMessage("");
                      }}
                      onKeyPress={handleForgotPasswordKeyPress}
                      className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none transition-all"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  {/* Reset Password Button */}
                  <button
                    onClick={handleForgotPassword}
                    disabled={isLoading}
                    className="w-full h-11 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isLoading ? "Sending..." : "Reset password"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-orange-300 via-orange-400 to-orange-500 items-center justify-center p-12 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-16 h-16 border-2 border-white rounded-lg"></div>
          <div className="absolute top-20 right-20 w-12 h-12 border-2 border-white rounded-full"></div>
          <div className="absolute bottom-20 left-20 w-20 h-20 border-2 border-white rounded-lg"></div>
          <div className="absolute bottom-32 right-32 w-8 h-8 border-2 border-white rounded-full"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 text-center text-white max-w-lg">
          <div className="mb-8">
            <div className="w-32 h-32 mx-auto bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm mb-6">
              <Building2 className="w-16 h-16 text-orange-500" />
            </div>
            <h2 className="text-4xl font-bold mb-4">Manage Your Workforce</h2>
            <p className="text-lg text-white text-opacity-90">
              Streamline HR operations, track employee performance, and boost
              productivity with our comprehensive HRMS solution.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
