"use client";

import { useState, useEffect } from "react";
import {
  Building2,
  Mail,
  MapPin,
  Loader2,
  ArrowLeft,
  User,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react";
import { EmailVerification } from "@/components/emailVerification";
import { LocationSetup } from "@/components/locationInput";
import { useRouter } from "next/navigation";

// API Functions
const API = {
  checkEmail: async (email: string) => {
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_BASE_URL
      }/organization/check-email?email=${encodeURIComponent(email)}`
    );
    return await response.json();
  },

  register: async (data: any) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/organization/register`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }
    );
    return await response.json();
  },

  verifyOTP: async (email: string, otp: string) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/organization/verify-otp`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      }
    );
    return await response.json();
  },

  resendOTP: async (email: string) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/organization/resend-otp`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      }
    );
    return await response.json();
  },
};

// Main Registration Page
export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    companyName: "",
    fullName: "",
    password: "",
    confirmPassword: "",
    latitude: 0,
    longitude: 0,
    radius: 100,
    officeAddress: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const router = useRouter();

  // Prevent page reload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (
        formData.email ||
        formData.companyName ||
        formData.fullName ||
        formData.password ||
        currentStep > 1
      ) {
        e.preventDefault();
        e.returnValue =
          "Your information will be lost. Are you sure you want to leave?";
        return "Your information will be lost. Are you sure you want to leave?";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [formData, currentStep]);

  const handleInputChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  // Step 1: Email validation and check
  const handleEmailSubmit = async () => {
    if (!formData.email) {
      setError("Please enter your email address");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await API.checkEmail(formData.email);
      if (result.exists) {
        setError(
          "This email is already registered. Please use a different email or sign in."
        );
      } else {
        setTimeout(() => {
          setCurrentStep(2);
        }, 1000);
      }
    } catch (err) {
      setError("Failed to verify email. Please try again.");
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    }
  };

  // Step 2: Company details validation
  const validateCompanyDetails = () => {
    if (
      !formData.companyName ||
      !formData.fullName ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("Please fill in all required fields");
      return false;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }

    // Check for uppercase, lowercase, and number
    const hasUpperCase = /[A-Z]/.test(formData.password);
    const hasLowerCase = /[a-z]/.test(formData.password);
    const hasNumber = /[0-9]/.test(formData.password);

    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      setError(
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      );
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleCompanyDetailsSubmit = () => {
    if (validateCompanyDetails()) {
      setCurrentStep(3);
      setError("");
    }
  };

  // Step 3: Location and registration
  const handleLocationComplete = async (location: any) => {
    setIsLoading(true);
    setError("");

    const registrationData = {
      email: formData.email,
      companyName: formData.companyName,
      fullName: formData.fullName,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      longitude: parseFloat(location.longitude),
      latitude: parseFloat(location.latitude),
      radius: parseInt(location.radius),
      officeAddress: location.address,
      agreementAccepted: true,
    };

    try {
      const result = await API.register(registrationData);

      // Check if the response indicates an error
      if (result.statusCode === 400 || result.error) {
        const errorMessage = result.message
          ? Array.isArray(result.message)
            ? result.message.join(", ")
            : result.message
          : "Registration failed. Please try again.";
        setError(errorMessage);
        // Go back to step 2 so user can fix the password
        setCurrentStep(2);
        return;
      }

      // Store location data for later use
      setFormData({
        ...formData,
        latitude: parseFloat(location.latitude),
        longitude: parseFloat(location.longitude),
        radius: parseInt(location.radius),
        officeAddress: location.address,
      });
      setCurrentStep(4); // Move to OTP verification
    } catch (err: any) {
      const errorMessage =
        err.message || "Registration failed. Please try again.";
      setError(errorMessage);
      // Go back to step 2 so user can fix the issue
      setCurrentStep(2);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 4: OTP verification
  // Step 4: OTP verification
  const handleVerifyOTP = async (otp: string) => {
    setIsLoading(true);
    setError("");

    try {
      const result = await API.verifyOTP(formData.email, otp);

      // Check if the response indicates an error
      if (result.statusCode === 400 || result.error) {
        const errorMessage =
          result.message || "Invalid verification code. Please try again.";
        setError(errorMessage);
        return; // Don't proceed to success screen
      }

      // Only move to success screen if verification was successful
      setCurrentStep(5);
    } catch (err: any) {
      const errorMessage =
        err.message || "Invalid verification code. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    try {
      await API.resendOTP(formData.email);
      alert("Verification code resent successfully!");
    } catch (err) {
      setError("Failed to resend code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToLogin = () => {
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Registration Form */}
      <div className="w-full lg:w-1/2 flex flex-col bg-white">
        {/* Logo */}
        <div className="p-6 lg:p-8">
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
        <div className="flex-1 flex items-start lg:items-center justify-center px-6 lg:px-16 py-8">
          <div className="w-full max-w-md">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {currentStep === 1 && "Register Your Organization"}
                {currentStep === 2 && "Company Details"}
                {currentStep === 3 && "Setup Office Location"}
                {currentStep === 4 && "Verify Your Email"}
                {currentStep === 5 && "Registration Complete"}
              </h1>
              {currentStep !== 5 && (
                <p className="text-gray-600">Step {currentStep} of 4</p>
              )}
            </div>

            {/* Progress Bar */}
            {currentStep !== 5 && (
              <div className="mb-8">
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`flex-1 h-2 rounded-full transition-all ${
                        currentStep >= step ? "bg-orange-600" : "bg-gray-200"
                      }`}
                    ></div>
                  ))}
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (currentStep === 1 || currentStep === 2) && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Step 1 - Email */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-900">
                    Company Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="email"
                    type="email"
                    placeholder="company@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none transition-all"
                    disabled={isLoading}
                  />
                </div>

                <button
                  onClick={handleEmailSubmit}
                  disabled={isLoading}
                  className="w-full h-11 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isLoading ? "Checking..." : "Continue"}
                </button>

                <div className="text-center pt-6">
                  <span className="text-sm text-gray-600">
                    Already have an account?{" "}
                  </span>
                  <button
                    type="button"
                    onClick={() => router.push("/login")}
                    className="text-sm font-semibold text-orange-600 hover:text-orange-700 transition-colors"
                  >
                    Sign in
                  </button>
                </div>
              </div>
            )}

            {/* Step 2 - Company Details */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium mb-4 transition-colors"
                  disabled={isLoading}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Email
                </button>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-900">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="companyName"
                    type="text"
                    placeholder="Acme Corporation"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none transition-all"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-900">
                    Your Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none transition-all"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-900">
                    Password <span className="text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="At least 8 characters"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full h-11 px-4 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none transition-all"
                      disabled={isLoading}
                    />

                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onTouchStart={(e) => e.preventDefault()}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>

                  <p className="text-xs text-gray-500">
                    Must contain uppercase, lowercase, and a number
                  </p>
                </div>

                {/* CONFIRM PASSWORD */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-900">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <input
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Re-enter your password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full h-11 px-4 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none transition-all"
                      disabled={isLoading}
                    />

                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onTouchStart={(e) => e.preventDefault()}
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleCompanyDetailsSubmit}
                  disabled={isLoading}
                  className="w-full h-11 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
                >
                  Continue
                </button>
              </div>
            )}

            {/* Step 3 - Location Setup */}
            {currentStep === 3 && (
              <LocationSetup
                onComplete={handleLocationComplete}
                onBack={() => setCurrentStep(2)}
                isLoading={isLoading}
              />
            )}

            {/* Step 4 - OTP Verification */}
            {currentStep === 4 && (
              <>
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}
                <EmailVerification
                  email={formData.email}
                  onVerify={handleVerifyOTP}
                  onResend={handleResendOTP}
                  isLoading={isLoading}
                />
              </>
            )}

            {/* Step 5 - Success Screen */}
            {currentStep === 5 && (
              <div className="text-center py-8">
                {/* Success Animation */}
                <div className="mb-8 relative">
                  <div className="w-40 h-40 mx-auto bg-gradient-to-br from-green-100 to-green-50 rounded-full flex items-center justify-center relative">
                    <div className="w-32 h-32 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                      <CheckCircle2
                        className="w-16 h-16 text-white"
                        strokeWidth={2.5}
                      />
                    </div>
                  </div>
                </div>

                {/* Success Message */}
                <div className="mb-8 space-y-3">
                  <h2 className="text-3xl font-bold text-gray-900">
                    Congratulations!
                  </h2>
                  <p className="text-base text-gray-600 max-w-md mx-auto">
                    Your organization has been successfully registered
                  </p>
                </div>

                {/* Registration Details Card */}
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 mb-8 border border-orange-200 shadow-sm">
                  <div className="space-y-4 text-left">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                        <Building2 className="w-5 h-5 text-orange-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 mb-1">
                          Company Name
                        </p>
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {formData.companyName}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                        <User className="w-5 h-5 text-orange-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 mb-1">Admin Name</p>
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {formData.fullName}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                        <Mail className="w-5 h-5 text-orange-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 mb-1">
                          Email Address
                        </p>
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {formData.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                        <MapPin className="w-5 h-5 text-orange-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 mb-1">
                          Office Location
                        </p>
                        <p className="text-sm font-semibold text-gray-900 line-clamp-2">
                          {formData.officeAddress || "Location set"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Next Steps Info */}
                <div className="bg-blue-50 rounded-xl p-4 mb-8 border border-blue-200">
                  <p className="text-sm text-blue-800 font-medium mb-2">
                    🎉 What's Next?
                  </p>
                  <p className="text-xs text-blue-700">
                    You can now log in to your account and start managing your
                    organization's HR operations
                  </p>
                </div>

                {/* Action Buttons */}
                <button
                  onClick={handleGoToLogin}
                  className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  Continue to Login
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-orange-300 via-orange-400 to-orange-500 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-16 h-16 border-2 border-white rounded-lg"></div>
          <div className="absolute top-20 right-20 w-12 h-12 border-2 border-white rounded-full"></div>
          <div className="absolute bottom-20 left-20 w-20 h-20 border-2 border-white rounded-lg"></div>
          <div className="absolute bottom-32 right-32 w-8 h-8 border-2 border-white rounded-full"></div>
        </div>

        {/* Free Badge */}
        <div className="absolute top-8 right-8 z-20">
          <div className="bg-green-500 bg-opacity-20 backdrop-blur-sm px-6 py-3 rounded-full border-2 border-none shadow-lg">
            <p className="text-white font-bold text-lg">Free of cost</p>
          </div>
        </div>

        <div className="relative z-10 text-center text-white max-w-lg">
          <div className="mb-8">
            <div className="w-32 h-32 mx-auto bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm mb-6">
              {currentStep === 1 && (
                <Mail className="w-16 h-16 text-orange-500" />
              )}
              {currentStep === 2 && (
                <User className="w-16 h-16 text-orange-500" />
              )}
              {currentStep === 3 && (
                <MapPin className="w-16 h-16 text-orange-500" />
              )}
              {currentStep === 4 && (
                <Mail className="w-16 h-16 text-orange-500" />
              )}
              {currentStep === 5 && (
                <CheckCircle2 className="w-16 h-16 text-white" />
              )}
            </div>
            <h2 className="text-4xl font-bold mb-4">
              {currentStep === 1 && "Let's Get Started"}
              {currentStep === 2 && "Tell Us About Your Company"}
              {currentStep === 3 && "Setup Your Office"}
              {currentStep === 4 && "Almost Done!"}
              {currentStep === 5 && "Welcome Aboard!"}
            </h2>
            <p className="text-lg text-white text-opacity-90">
              {currentStep === 1 &&
                "Enter your company email to begin the registration process."}
              {currentStep === 2 &&
                "Provide your company details and create a secure password."}
              {currentStep === 3 &&
                "Set up your office location for accurate attendance tracking and geofencing."}
              {currentStep === 4 &&
                "Verify your email address to complete the registration."}
              {currentStep === 5 &&
                "Your journey to streamlined HR management starts now. Let's transform how you manage your workforce!"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
