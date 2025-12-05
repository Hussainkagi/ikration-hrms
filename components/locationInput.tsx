"use client";

import { useState, useRef, useEffect } from "react";
import { MapPin, Loader2, ArrowLeft, Search, X } from "lucide-react";
import { AgreementModal } from "@/components/agreement";

interface LocationData {
  latitude: string;
  longitude: string;
  address: string;
  radius: string;
  workStartTime: string;
  workEndTime: string;
  weeklyOffDays: number[];
}

interface LocationSetupProps {
  onComplete: (location: LocationData) => void;
  onBack: () => void;
  isLoading?: boolean;
}

interface PlaceSuggestion {
  description: string;
  place_id: string;
}

const DAYS_OF_WEEK = [
  { label: "Sunday", value: 0 },
  { label: "Monday", value: 1 },
  { label: "Tuesday", value: 2 },
  { label: "Wednesday", value: 3 },
  { label: "Thursday", value: 4 },
  { label: "Friday", value: 5 },
  { label: "Saturday", value: 6 },
];

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
    workStartTime: "09:00",
    workEndTime: "18:00",
    weeklyOffDays: [0, 6],
  });
  const [error, setError] = useState("");
  const [gettingLocation, setGettingLocation] = useState(false);
  const [isAgreementOpen, setIsAgreementOpen] = useState(false);
  const [hasAgreed, setHasAgreed] = useState(false);

  // Google Places Autocomplete
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(false);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const autocompleteService = useRef<any>(null);
  const placesService = useRef<any>(null);

  // Load Google Maps Script
  // Load Google Maps Script
  useEffect(() => {
    const initializeServices = () => {
      try {
        if ((window as any).google?.maps?.places) {
          autocompleteService.current = new (
            window as any
          ).google.maps.places.AutocompleteService();
          placesService.current = new (
            window as any
          ).google.maps.places.PlacesService(document.createElement("div"));
          setMapsLoaded(true);
          console.log("✅ Google Maps services initialized successfully");
        }
      } catch (err) {
        console.error("❌ Error initializing Google Maps services:", err);
      }
    };

    const loadGoogleMapsScript = () => {
      // Check if already loaded and initialized
      if ((window as any).google?.maps?.places) {
        console.log("✅ Google Maps already loaded, initializing services");
        initializeServices();
        return;
      }

      // Check if script is already in DOM
      const existingScript = document.querySelector(
        'script[src*="maps.googleapis.com"]'
      );

      if (existingScript) {
        console.log("✅ Script tag found, waiting for load");
        // If script exists but not loaded yet, wait for it
        if (!(window as any).google?.maps?.places) {
          const checkInterval = setInterval(() => {
            if ((window as any).google?.maps?.places) {
              clearInterval(checkInterval);
              initializeServices();
            }
          }, 100);

          // Clear interval after 10 seconds to prevent memory leak
          setTimeout(() => clearInterval(checkInterval), 10000);
        } else {
          initializeServices();
        }
        return;
      }

      // Load the script only if it doesn't exist
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY;

      if (!apiKey) {
        console.error(
          "❌ Google Maps API key not found in environment variables"
        );
        setError(
          "Google Maps API key is missing. Please configure NEXT_PUBLIC_GOOGLE_MAP_API_KEY"
        );
        return;
      }

      console.log("📍 Loading Google Maps script...");
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.id = "google-maps-script"; // Add ID to prevent duplicates

      script.onload = () => {
        console.log("✅ Google Maps script loaded");
        setTimeout(initializeServices, 100); // Small delay to ensure everything is ready
      };

      script.onerror = (err) => {
        console.error("❌ Failed to load Google Maps script:", err);
        setError(
          "Failed to load Google Maps. Please check your API key and internet connection."
        );
      };

      document.head.appendChild(script);
    };

    loadGoogleMapsScript();

    // Cleanup function
    return () => {
      // Don't remove the script on unmount as it might be used by other components
    };
  }, []);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search for places
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);

    if (value.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    if (!mapsLoaded || !autocompleteService.current) {
      console.warn("⚠️ Google Maps not ready yet");
      return;
    }

    setIsLoadingPlaces(true);

    try {
      autocompleteService.current.getPlacePredictions(
        {
          input: value,
          types: ["establishment", "geocode"], // Get both businesses and addresses
        },
        (predictions: any[], status: string) => {
          setIsLoadingPlaces(false);

          console.log("📍 Places API Status:", status);

          if (status === "OK" && predictions && predictions.length > 0) {
            console.log("✅ Found predictions:", predictions.length);
            setSuggestions(
              predictions.map((p) => ({
                description: p.description,
                place_id: p.place_id,
              }))
            );
            setShowSuggestions(true);
          } else if (status === "ZERO_RESULTS") {
            console.log("ℹ️ No results found");
            setSuggestions([]);
            setShowSuggestions(false);
          } else {
            console.error("❌ Places API Error:", status);
            setSuggestions([]);
            setShowSuggestions(false);

            if (status === "REQUEST_DENIED") {
              setError(
                "Google Maps API access denied. Please check your API key and restrictions."
              );
            }
          }
        }
      );
    } catch (err) {
      console.error("❌ Error calling Places API:", err);
      setIsLoadingPlaces(false);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Select a place from suggestions
  const handleSelectPlace = (placeId: string, description: string) => {
    if (!placesService.current) {
      console.error("❌ Places service not available");
      return;
    }

    setIsLoadingPlaces(true);

    try {
      placesService.current.getDetails(
        {
          placeId,
          fields: ["geometry", "formatted_address", "name"],
        },
        (place: any, status: string) => {
          setIsLoadingPlaces(false);

          if (status === "OK" && place?.geometry?.location) {
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();

            console.log("✅ Location found:", { lat, lng });

            setLocation({
              ...location,
              latitude: lat.toFixed(6),
              longitude: lng.toFixed(6),
              address: place.formatted_address || description,
            });
            setSearchQuery("");
            setSuggestions([]);
            setShowSuggestions(false);
            setError("");
          } else {
            console.error("❌ Place details error:", status);
            setError(
              "Could not get location details. Please try another location."
            );
          }
        }
      );
    } catch (err) {
      console.error("❌ Error getting place details:", err);
      setIsLoadingPlaces(false);
    }
  };

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

  const toggleWeeklyOffDay = (day: number) => {
    setLocation({
      ...location,
      weeklyOffDays: location.weeklyOffDays.includes(day)
        ? location.weeklyOffDays.filter((d) => d !== day)
        : [...location.weeklyOffDays, day],
    });
  };

  const handleSubmit = () => {
    if (!hasAgreed) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      setError("Please read and agree to the Terms & Conditions Agreement");
      return;
    }

    if (!location.latitude || !location.longitude || !location.address) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      setError("Please provide location coordinates and address");
      return;
    }

    const radiusNum = parseInt(location.radius);
    if (!location.radius || radiusNum < 10) {
      setError("Radius must be at least 10 meters");
      return;
    }

    if (!location.workStartTime || !location.workEndTime) {
      setError("Please provide work hours");
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
          Office Location & Work Schedule
        </h2>
        <p className="text-gray-600">
          Set your office location and work hours for attendance tracking
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {/* Get Current Location Button */}
        <button
          onClick={getCurrentLocation}
          disabled={gettingLocation || isLoading}
          className="w-full h-11 border-2 border-orange-600 text-orange-600 hover:bg-orange-50 font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {gettingLocation && <Loader2 className="w-4 h-4 animate-spin" />}
          {gettingLocation ? "Getting Location..." : "Get My Current Location"}
        </button>

        {/* OR Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500 font-medium">OR</span>
          </div>
        </div>

        {/* Google Places Search */}
        <div className="space-y-2 relative" ref={searchRef}>
          <label className="block text-sm font-medium text-gray-900">
            Search Location
            {mapsLoaded && (
              <span className="ml-2 text-xs text-green-600">✓ Ready</span>
            )}
            {!mapsLoaded && (
              <span className="ml-2 text-xs text-orange-600">
                ⏳ Loading...
              </span>
            )}
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for your office location..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              className="w-full h-11 pl-10 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none transition-all"
              disabled={isLoading || !mapsLoaded}
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSuggestions([]);
                  setShowSuggestions(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            {isLoadingPlaces && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-orange-600" />
            )}

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={suggestion.place_id}
                    onClick={() =>
                      handleSelectPlace(
                        suggestion.place_id,
                        suggestion.description
                      )
                    }
                    className="w-full px-4 py-3 text-left hover:bg-orange-50 transition-colors border-b border-gray-100 last:border-b-0 text-sm"
                  >
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">
                        {suggestion.description}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Manual Coordinates */}
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

        {/* Office Address */}
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

        {/* Geofence Radius */}
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

        {/* Work Hours */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-900">
              Work Start Time <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              value={location.workStartTime}
              onChange={(e) =>
                setLocation({ ...location, workStartTime: e.target.value })
              }
              className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none transition-all"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-900">
              Work End Time <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              value={location.workEndTime}
              onChange={(e) =>
                setLocation({ ...location, workEndTime: e.target.value })
              }
              className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none transition-all"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Weekly Off Days */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-900">
            Weekly Off Days <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {DAYS_OF_WEEK.map((day) => (
              <label
                key={day.value}
                className={`flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer transition-all ${
                  location.weeklyOffDays.includes(day.value)
                    ? "bg-orange-50 border-orange-600 text-orange-900"
                    : "border-gray-300 hover:border-gray-400"
                } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={location.weeklyOffDays.includes(day.value)}
                  onChange={() => toggleWeeklyOffDay(day.value)}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-600"
                  disabled={isLoading}
                />
                <span className="text-sm font-medium">
                  {day.label.slice(0, 3)}
                </span>
              </label>
            ))}
          </div>
          <p className="text-xs text-gray-500">
            Select the days when your office is closed
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
