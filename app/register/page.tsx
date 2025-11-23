"use client";

import { useState, useEffect } from "react";
import {
  Building2,
  Mail,
  MapPin,
  Loader2,
  ArrowLeft,
  Edit2,
} from "lucide-react";
import { EmailVerification } from "@/components/emailVerification";
import { LocationSetup } from "@/components/locationInput";
import { useRouter } from "next/navigation";

const API = {
  sendOTP: async (email: any) => {
    // Uncomment when ready to use real API
    /*
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/organization/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    return await response.json();
    */
    return { success: true };
  },

  verifyOTP: async (email: any, otp: any) => {
    /*
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/organization/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });
    return await response.json();
    */
    return { success: true };
  },

  resendOTP: async (email: any) => {
    /*
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/organization/resend-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    return await response.json();
    */
    return { success: true };
  },

  register: async (data: any) => {
    /*
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/organization/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await response.json();
    */
    return { success: true };
  },

  completeRegistration: async (email: any, location: any) => {
    /*
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/organization/complete-registration`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        officeLocation: {
          latitude: parseFloat(location.latitude),
          longitude: parseFloat(location.longitude),
          address: location.address,
          radius: 100,
        },
      }),
    });
    return await response.json();
    */
    return { success: true };
  },
};

// ============ MAIN REGISTRATION PAGE ============
export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showOTP, setShowOTP] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    companyEmail: "",
    fullName: "",
    password: "",
    confirmPassword: "",
  });
  const [tempEmail, setTempEmail] = useState("");

  const router = useRouter();

  // Prevent page reload/close if user has started registration
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Show warning only if user has entered any data or progressed beyond initial state
      if (
        formData.companyEmail ||
        formData.companyName ||
        formData.fullName ||
        formData.password ||
        showOTP ||
        currentStep > 1
      ) {
        e.preventDefault();
        e.returnValue =
          "Your information will be lost. Are you sure you want to leave?";
        return "Your information will be lost. Are you sure you want to leave?";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [formData, showOTP, currentStep]);

  const handleInputChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const validateStep1 = () => {
    if (!formData.companyEmail) {
      setError("Please enter your email address");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.companyEmail)) {
      setError("Please enter a valid email address");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
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
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleSendOTP = async () => {
    if (!validateStep1()) return;

    setIsLoading(true);
    setError("");

    // Simulate API call for demo
    setTimeout(() => {
      setTempEmail(formData.companyEmail);
      setShowOTP(true);
      setIsLoading(false);
    }, 1000);

    // Uncomment when ready to use real API
    // try {
    //   await API.sendOTP(formData.companyEmail);
    //   setTempEmail(formData.companyEmail);
    //   setShowOTP(true);
    // } catch (error) {
    //   setError("Failed to send verification code. Please try again.");
    // } finally {
    //   setIsLoading(false);
    // }
  };

  const handleEditEmail = () => {
    setShowOTP(false);
    setTempEmail("");
    setError("");
  };

  const handleVerifyOTP = async (otp: string) => {
    setIsLoading(true);
    setError("");

    // Simulate API call for demo
    setTimeout(() => {
      setCurrentStep(2);
      setIsLoading(false);
    }, 1000);

    // Uncomment when ready to use real API
    // try {
    //   await API.verifyOTP(tempEmail, otp);
    //   setCurrentStep(2);
    // } catch (error) {
    //   setError("Invalid verification code. Please try again.");
    // } finally {
    //   setIsLoading(false);
    // }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);

    // Simulate API call for demo
    setTimeout(() => {
      alert("Verification code resent successfully!");
      setIsLoading(false);
    }, 1000);

    // Uncomment when ready to use real API
    // try {
    //   await API.resendOTP(tempEmail);
    //   alert("Verification code resent successfully!");
    // } catch (error) {
    //   setError("Failed to resend code. Please try again.");
    // } finally {
    //   setIsLoading(false);
    // }
  };

  const handleRegisterDetails = async () => {
    if (!validateStep2()) return;

    setIsLoading(true);
    setError("");

    // Simulate API call for demo
    setTimeout(() => {
      setCurrentStep(3);
      setIsLoading(false);
    }, 1000);

    // Uncomment when ready to use real API
    // try {
    //   await API.register({
    //     companyName: formData.companyName,
    //     companyEmail: tempEmail,
    //     fullName: formData.fullName,
    //     password: formData.password,
    //   });
    //   setCurrentStep(3);
    // } catch (error) {
    //   setError("Registration failed. Please try again.");
    // } finally {
    //   setIsLoading(false);
    // }
  };

  const handleBackToStep2 = () => {
    setCurrentStep(2);
    setError("");
  };

  const handleLocationComplete = async (location: any) => {
    setIsLoading(true);
    setError("");

    // Simulate API call for demo
    setTimeout(() => {
      alert("Registration completed successfully!");
      setIsLoading(false);
      // In production: window.location.href = "/login";
    }, 1000);

    // Uncomment when ready to use real API
    // try {
    //   await API.completeRegistration(tempEmail, location);
    //   window.location.href = "/login";
    // } catch (error) {
    //   setError("Failed to complete registration. Please try again.");
    // } finally {
    //   setIsLoading(false);
    // }
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
        <div className="flex-1 flex items-center justify-center px-6 lg:px-16 py-8">
          <div className="w-full max-w-md">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {currentStep === 1 && "Register Your Organization"}
                {currentStep === 2 && "Complete Your Profile"}
                {currentStep === 3 && "Setup Office Location"}
              </h1>
              <p className="text-gray-600">Step {currentStep} of 3</p>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex gap-2">
                {[1, 2, 3].map((step) => (
                  <div
                    key={step}
                    className={`flex-1 h-2 rounded-full transition-all ${
                      currentStep >= step ? "bg-orange-600" : "bg-gray-200"
                    }`}
                  ></div>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {error && (currentStep === 1 || currentStep === 2) && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Step 1 - Email and OTP Verification */}
            {currentStep === 1 && (
              <div className="space-y-4">
                {!showOTP ? (
                  <>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-900">
                        Company Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="companyEmail"
                        type="email"
                        placeholder="company@example.com"
                        value={formData.companyEmail}
                        onChange={handleInputChange}
                        className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none transition-all"
                        disabled={isLoading}
                      />
                    </div>

                    <button
                      onClick={handleSendOTP}
                      disabled={isLoading}
                      className="w-full h-11 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
                    >
                      {isLoading && (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      )}
                      {isLoading ? "Sending Code..." : "Send Verification Code"}
                    </button>
                  </>
                ) : (
                  <>
                    {/* Email Display with Edit Button */}
                    <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            Verification code sent to:
                          </p>
                          <p className="text-sm font-medium text-gray-900">
                            {tempEmail}
                          </p>
                        </div>
                        <button
                          onClick={handleEditEmail}
                          className="flex items-center gap-1 text-orange-600 hover:text-orange-700 text-sm font-medium transition-colors"
                          disabled={isLoading}
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit
                        </button>
                      </div>
                    </div>

                    <EmailVerification
                      email={tempEmail}
                      onVerify={handleVerifyOTP}
                      onResend={handleResendOTP}
                      isLoading={isLoading}
                    />
                  </>
                )}
              </div>
            )}

            {/* Step 2 - Company Details and Password */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-900">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="companyName"
                    type="text"
                    placeholder="Enter company name"
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
                  <input
                    name="password"
                    type="password"
                    placeholder="At least 8 characters"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none transition-all"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-900">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="confirmPassword"
                    type="password"
                    placeholder="Re-enter your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none transition-all"
                    disabled={isLoading}
                  />
                </div>

                <button
                  onClick={handleRegisterDetails}
                  disabled={isLoading}
                  className="w-full h-11 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isLoading ? "Creating Account..." : "Continue"}
                </button>
              </div>
            )}

            {/* Step 3 - Location Setup */}
            {currentStep === 3 && (
              <>
                {/* Back Button */}
                <button
                  onClick={handleBackToStep2}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium mb-6 transition-colors"
                  disabled={isLoading}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Company Details
                </button>

                <LocationSetup
                  onComplete={handleLocationComplete}
                  isLoading={isLoading}
                />
              </>
            )}

            {/* Sign In Link */}
            {currentStep === 1 && !showOTP && (
              <div className="text-center pt-6">
                <span className="text-sm text-gray-600">
                  Already have an account?{" "}
                </span>
                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="text-sm font-semibold text-orange-600 hover:text-orange-700 transition-colors"
                  disabled={isLoading}
                >
                  Sign in
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

        <div className="relative z-10 text-center text-white max-w-lg">
          <div className="mb-8">
            <div className="w-32 h-32 mx-auto bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm mb-6">
              {currentStep === 1 && (
                <Mail className="w-16 h-16 text-orange-500" />
              )}
              {currentStep === 2 && (
                <Building2 className="w-16 h-16 text-orange-500" />
              )}
              {currentStep === 3 && (
                <MapPin className="w-16 h-16 text-orange-500" />
              )}
            </div>
            <h2 className="text-4xl font-bold mb-4">
              {currentStep === 1 && "Verify Your Email"}
              {currentStep === 2 && "Tell Us About Your Company"}
              {currentStep === 3 && "Almost There!"}
            </h2>
            <p className="text-lg text-white text-opacity-90">
              {currentStep === 1 &&
                "Enter your company email to get started. We'll send you a verification code to ensure your account security."}
              {currentStep === 2 &&
                "Provide your company details and create a secure password to complete your profile."}
              {currentStep === 3 &&
                "Set up your office location for accurate attendance tracking and geofencing."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
