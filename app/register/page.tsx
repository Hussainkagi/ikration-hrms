"use client";

import { useState } from "react";
import { Building2, MapPin } from "lucide-react";

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    companyName: "",
    companyLocation: "",
    companyEmail: "",
    displayName: "",
    companyDomain: "",
    adminFirstName: "",
    adminLastName: "",
    adminEmail: "",
    officeLatitude: "",
    officeLongitude: "",
    officeAddress: "",
    officeRadius: "100",
  });

  const handleInputChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const validateStep1 = () => {
    if (
      !formData.companyName ||
      !formData.companyEmail ||
      !formData.companyDomain
    ) {
      setError("Please fill in all required company fields");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.companyEmail)) {
      setError("Please enter a valid company email");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (
      !formData.adminFirstName ||
      !formData.adminLastName ||
      !formData.adminEmail
    ) {
      setError("Please fill in all required admin fields");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.adminEmail)) {
      setError("Please enter a valid admin email");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
      setError("");
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
    setError("");
  };

  const handleRegister = async () => {
    if (!validateStep2()) return;

    setIsLoading(true);
    setError("");

    try {
      const requestBody = {
        companyName: formData.companyName,
        companyLocation: formData.companyLocation || formData.officeAddress,
        companyEmail: formData.companyEmail,
        displayName: formData.displayName || formData.companyName,
        companyDomain: formData.companyDomain,
        adminFirstName: formData.adminFirstName,
        adminLastName: formData.adminLastName,
        adminEmail: formData.adminEmail,
        officeLocation: {
          latitude: parseFloat(formData.officeLatitude) || 40.7128,
          longitude: parseFloat(formData.officeLongitude) || -74.006,
          address:
            formData.officeAddress ||
            formData.companyLocation ||
            "Not specified",
          radius: parseInt(formData.officeRadius) || 100,
        },
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL || ""}/organization/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Show success message and redirect to login
        alert("Organization registered successfully! Please login.");
        window.location.href = "/login";
      } else {
        setError(data.message || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
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
                Register Your Organization
              </h1>
              <p className="text-gray-600">
                Step {currentStep} of 2 -{" "}
                {currentStep === 1 ? "Company Details" : "Admin Account"}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex gap-2">
                <div
                  className={`flex-1 h-2 rounded-full ${
                    currentStep >= 1 ? "bg-orange-600" : "bg-gray-200"
                  }`}
                ></div>
                <div
                  className={`flex-1 h-2 rounded-full ${
                    currentStep >= 2 ? "bg-orange-600" : "bg-gray-200"
                  }`}
                ></div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Step 1 - Company Details */}
            {currentStep === 1 && (
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
                    required
                  />
                </div>

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
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-900">
                    Company Domain <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="companyDomain"
                    type="text"
                    placeholder="companyname"
                    value={formData.companyDomain}
                    onChange={handleInputChange}
                    className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-900">
                    Display Name
                  </label>
                  <input
                    name="displayName"
                    type="text"
                    placeholder="Display name (optional)"
                    value={formData.displayName}
                    onChange={handleInputChange}
                    className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-900">
                    Company Location
                  </label>
                  <input
                    name="companyLocation"
                    type="text"
                    placeholder="123 Business St, City, State, ZIP"
                    value={formData.companyLocation}
                    onChange={handleInputChange}
                    className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none transition-all"
                  />
                </div>

                {/* Office Location Details */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-medium text-gray-900">
                      Office Location (Optional)
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-gray-700">
                        Latitude
                      </label>
                      <input
                        name="officeLatitude"
                        type="number"
                        step="any"
                        placeholder="40.7128"
                        value={formData.officeLatitude}
                        onChange={handleInputChange}
                        className="w-full h-10 px-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-gray-700">
                        Longitude
                      </label>
                      <input
                        name="officeLongitude"
                        type="number"
                        step="any"
                        placeholder="-74.0060"
                        value={formData.officeLongitude}
                        onChange={handleInputChange}
                        className="w-full h-10 px-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 mt-3">
                    <label className="block text-xs font-medium text-gray-700">
                      Radius (meters)
                    </label>
                    <input
                      name="officeRadius"
                      type="number"
                      placeholder="100"
                      value={formData.officeRadius}
                      onChange={handleInputChange}
                      className="w-full h-10 px-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>

                <button
                  onClick={handleNext}
                  className="w-full h-11 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors mt-6"
                >
                  Continue
                </button>
              </div>
            )}

            {/* Step 2 - Admin Account */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-900">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="adminFirstName"
                      type="text"
                      placeholder="John"
                      value={formData.adminFirstName}
                      onChange={handleInputChange}
                      className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none transition-all"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-900">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="adminLastName"
                      type="text"
                      placeholder="Doe"
                      value={formData.adminLastName}
                      onChange={handleInputChange}
                      className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none transition-all"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-900">
                    Admin Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="adminEmail"
                    type="email"
                    placeholder="admin@example.com"
                    value={formData.adminEmail}
                    onChange={handleInputChange}
                    className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none transition-all"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleBack}
                    disabled={isLoading}
                    className="flex-1 h-11 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors disabled:opacity-50"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleRegister}
                    disabled={isLoading}
                    className="flex-1 h-11 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Registering..." : "Register"}
                  </button>
                </div>
              </div>
            )}

            {/* Sign In Link */}
            <div className="text-center pt-6">
              <span className="text-sm text-gray-600">
                Already have an account?{" "}
              </span>
              <button
                type="button"
                onClick={() => (window.location.href = "/login")}
                className="text-sm font-semibold text-orange-600 hover:text-orange-700 transition-colors"
                disabled={isLoading}
              >
                Sign in
              </button>
            </div>
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
              <Building2 className="w-16 h-16 text-white" />
            </div>
            <h2 className="text-4xl font-bold mb-4">
              Start Managing Your Team
            </h2>
            <p className="text-lg text-white text-opacity-90">
              Join thousands of organizations using our HRMS platform to
              streamline operations and empower their workforce.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
