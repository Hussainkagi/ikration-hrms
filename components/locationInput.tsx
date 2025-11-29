"use client";

import { useState } from "react";
import { MapPin, Loader2, ArrowLeft, FileText } from "lucide-react";
import { AgreementModal } from "@/components/agreement";

interface LocationData {
  latitude: string;
  longitude: string;
  address: string;
  radius: string;
}

interface LocationSetupProps {
  onComplete: (location: LocationData) => void;
  onBack: () => void;
  isLoading?: boolean;
}

export function LocationSetup({
  onComplete,
  onBack,
  isLoading = false,
}: LocationSetupProps) {
  const [location, setLocation] = useState<LocationData>({
    latitude: "",
    longitude: "",
    address: "",
    radius: "100",
  });
  const [error, setError] = useState("");
  const [gettingLocation, setGettingLocation] = useState(false);
  const [isAgreementOpen, setIsAgreementOpen] = useState(false);
  const [hasAgreed, setHasAgreed] = useState(false);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setGettingLocation(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          ...location,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6),
        });
        setGettingLocation(false);
      },
      (error) => {
        setError("Unable to retrieve your location. Please enter manually.");
        setGettingLocation(false);
      }
    );
  };

  const handleSubmit = () => {
    if (!hasAgreed) {
      setError("Please read and agree to the Location Tracking Agreement");
      return;
    }

    if (!location.latitude || !location.longitude || !location.address) {
      setError("Please provide location coordinates and address");
      return;
    }

    const radiusNum = parseInt(location.radius);
    if (!location.radius || radiusNum < 10) {
      setError("Radius must be at least 10 meters");
      return;
    }

    onComplete(location);
  };

  const handleAgree = () => {
    setHasAgreed(true);
    setError("");
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
        disabled={isLoading}
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Company Details
      </button>

      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MapPin className="w-8 h-8 text-orange-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Office Location
        </h2>
        <p className="text-gray-600">
          Set your office location for attendance tracking
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        <button
          onClick={getCurrentLocation}
          disabled={gettingLocation || isLoading}
          className="w-full h-11 border-2 border-orange-600 text-orange-600 hover:bg-orange-50 font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {gettingLocation && <Loader2 className="w-4 h-4 animate-spin" />}
          {gettingLocation ? "Getting Location..." : "Get My Current Location"}
        </button>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-900">
              Latitude <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="any"
              placeholder="25.2048"
              value={location.latitude}
              onChange={(e) => {
                setLocation({ ...location, latitude: e.target.value });
                setError("");
              }}
              className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none transition-all"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-900">
              Longitude <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="any"
              placeholder="55.2708"
              value={location.longitude}
              onChange={(e) => {
                setLocation({ ...location, longitude: e.target.value });
                setError("");
              }}
              className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none transition-all"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-900">
            Office Address <span className="text-red-500">*</span>
          </label>
          <textarea
            placeholder="Enter your office address"
            value={location.address}
            onChange={(e) => {
              setLocation({ ...location, address: e.target.value });
              setError("");
            }}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none transition-all resize-none"
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-900">
            Geofence Radius (meters) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            placeholder="100"
            value={location.radius}
            onChange={(e) => {
              setLocation({ ...location, radius: e.target.value });
              setError("");
            }}
            className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none transition-all"
            disabled={isLoading}
          />
          <p className="text-xs text-gray-500">
            Set the radius for geofencing (minimum 10 meters)
          </p>
        </div>

        {/* Agreement Notice */}
        <div className="p-1">
          <div className="flex-1">
            <p className="text-sm text-orange-600">
              <button
                onClick={() => setIsAgreementOpen(true)}
                className="font-semibold text-orange-600 underline"
                disabled={isLoading}
              >
                Agree to the terms & conditions
              </button>
              {hasAgreed && (
                <span className="ml-2 text-green-600 font-medium">
                  ✓ Agreed
                </span>
              )}
            </p>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full h-11 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          {isLoading ? "Processing..." : "Continue to Verification"}
        </button>
      </div>

      {/* Agreement Modal */}
      <AgreementModal
        isOpen={isAgreementOpen}
        onClose={() => setIsAgreementOpen(false)}
        onAgree={handleAgree}
      />
    </div>
  );
}
