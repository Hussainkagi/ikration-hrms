"use client";

import { useState, useEffect } from "react";
import { Building2, Eye, EyeOff, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");

  const router = useRouter();

  useEffect(() => {
    // Extract token and email from URL query parameters
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get("token");
    const emailParam = params.get("email");

    if (tokenParam) setToken(tokenParam);
    if (emailParam) setEmail(emailParam);

    if (!tokenParam) {
      setError(
        "Invalid or missing token. Please use the link from your email.",
      );
    }
  }, []);

  const handleInputChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleKeyPress = (e: any) => {
    if (e.key === "Enter") {
      handleResetPassword();
    }
  };

  const validatePassword = () => {
    if (!formData.password || !formData.confirmPassword) {
      setError("Please fill in all fields");
      return false;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    return true;
  };

  const handleResetPassword = async () => {
    if (!validatePassword()) return;

    if (!token) {
      setError(
        "Invalid or missing token. Please use the link from your email.",
      );
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL || ""}/auth/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: token,
            password: formData.password,
          }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        setError(
          data.message ||
            "Failed to reset password. Please try again or request a new link.",
        );
      }
    } catch (error) {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRedirectToLogin = () => {
    router.push("/login");
  };

  if (success) {
    return (
      <div className="min-h-screen flex">
        {/* Left side - Success Message */}
        <div className="w-full lg:w-1/2 flex flex-col bg-background">
          {/* Logo */}
          <div className="p-6 lg:p-8">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-background rounded-lg flex items-center justify-center">
                <img src="./tlogo.png" alt="" />
              </div>
              <div className="flex flex-col flex-1">
                <span className="flex text-sm text-muted-foreground text-bold items-end justify-start">
                  Ikration
                </span>
                <span className="text-xl font-bold">
                  <span className="bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent">
                    team
                  </span>
                  <span className="text-foreground">Book</span>
                </span>
              </div>
            </div>
          </div>

          {/* Success Container */}
          <div className="flex-1 flex items-center justify-center px-6 lg:px-16">
            <div className="w-full max-w-md text-center">
              {/* Success Icon */}
              <div className="mb-6 flex justify-center">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
                </div>
              </div>

              {/* Success Message */}
              <h1 className="text-3xl font-bold text-foreground mb-3">
                Password Reset Successfully!
              </h1>
              <p className="text-muted-foreground mb-8">
                Your password has been reset successfully. You can now sign in
                to your account with your new password.
              </p>

              {/* Redirect Button */}
              <button
                onClick={handleRedirectToLogin}
                className="w-full h-11 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors cursor-pointer"
              >
                Go to Login
              </button>
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
              <h2 className="text-4xl font-bold mb-4">Welcome Back!</h2>
              <p className="text-lg text-white text-opacity-90">
                Your account is secure. Continue managing your workforce
                efficiently with our comprehensive HRMS solution.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Reset Password Form */}
      <div className="w-full lg:w-1/2 flex flex-col bg-background">
        {/* Logo */}
        <div className="p-6 lg:p-8">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-background rounded-lg flex items-center justify-center">
              <img src="./tlogo.png" alt="" />
            </div>
            <div className="flex flex-col flex-1">
              <span className="flex text-sm text-muted-foreground text-bold items-end justify-start">
                Ikration
              </span>
              <span className="text-xl font-bold">
                <span className="bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent">
                  team
                </span>
                <span className="text-foreground">Book</span>
              </span>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center px-6 lg:px-16">
          <div className="w-full max-w-md">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Reset your password
              </h1>
              <p className="text-muted-foreground">
                {email
                  ? `Setting up password for ${email}`
                  : "Please create a secure password for your account"}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              </div>
            )}

            {/* Form */}
            <div className="space-y-5">
              {/* Password Field */}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-foreground"
                >
                  New Password
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
                    className="w-full h-11 px-4 pr-12 border border-border bg-background text-foreground rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none transition-all placeholder:text-muted-foreground"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Must be at least 8 characters long
                </p>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-foreground"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    className="w-full h-11 px-4 pr-12 border border-border bg-background text-foreground rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none transition-all placeholder:text-muted-foreground"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Reset Password Button */}
              <button
                onClick={handleResetPassword}
                disabled={isLoading || !token}
                className="w-full h-11 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? "Resetting..." : "Reset Password"}
              </button>

              {/* Back to Login Link */}
              <div className="text-center pt-2">
                <span className="text-sm text-muted-foreground">
                  Remember your password?{" "}
                </span>
                <button
                  type="button"
                  className="text-sm font-semibold text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors disabled:opacity-50 cursor-pointer"
                  disabled={isLoading}
                  onClick={handleRedirectToLogin}
                >
                  Sign in
                </button>
              </div>
            </div>
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
            <h2 className="text-4xl font-bold mb-4">Secure Your Account</h2>
            <p className="text-lg text-white text-opacity-90">
              Create a strong password to protect your account and start
              managing your workforce efficiently.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
