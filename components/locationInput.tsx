"use client";

import { useState, useRef, useEffect } from "react";
import {
  MapPin,
  Loader2,
  ArrowLeft,
  Search,
  X,
  ChevronDown,
  Globe,
} from "lucide-react";
import { AgreementCheckbox } from "@/components/agreement";
import {
  COUNTRIES,
  Country,
  searchCountries,
} from "@/hooks/Countries.constant";

interface LocationData {
  latitude: string;
  longitude: string;
  address: string;
  radius: string;
  country: string;
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
    country: "",
  });
  const [error, setError] = useState("");
  const [gettingLocation, setGettingLocation] = useState(false);
  const [hasAgreed, setHasAgreed] = useState(false);

  // Country selector state
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [countrySearchQuery, setCountrySearchQuery] = useState("");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [filteredCountries, setFilteredCountries] =
    useState<Country[]>(COUNTRIES);
  const countryDropdownRef = useRef<HTMLDivElement>(null);

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
      if ((window as any).google?.maps?.places) {
        console.log("✅ Google Maps already loaded, initializing services");
        initializeServices();
        return;
      }

      const existingScript = document.querySelector(
        'script[src*="maps.googleapis.com"]',
      );

      if (existingScript) {
        console.log("✅ Script tag found, waiting for load");
        if (!(window as any).google?.maps?.places) {
          const checkInterval = setInterval(() => {
            if ((window as any).google?.maps?.places) {
              clearInterval(checkInterval);
              initializeServices();
            }
          }, 100);
          setTimeout(() => clearInterval(checkInterval), 10000);
        } else {
          initializeServices();
        }
        return;
      }

      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY;

      if (!apiKey) {
        console.error(
          "❌ Google Maps API key not found in environment variables",
        );
        setError(
          "Google Maps API key is missing. Please configure NEXT_PUBLIC_GOOGLE_MAP_API_KEY",
        );
        return;
      }

      console.log("📍 Loading Google Maps script...");
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.id = "google-maps-script";

      script.onload = () => {
        console.log("✅ Google Maps script loaded");
        setTimeout(initializeServices, 100);
      };

      script.onerror = (err) => {
        console.error("❌ Failed to load Google Maps script:", err);
        setError(
          "Failed to load Google Maps. Please check your API key and internet connection.",
        );
      };

      document.head.appendChild(script);
    };

    loadGoogleMapsScript();
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

  // Handle click outside to close country dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        countryDropdownRef.current &&
        !countryDropdownRef.current.contains(event.target as Node)
      ) {
        setShowCountryDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter countries based on search
  useEffect(() => {
    const results = searchCountries(countrySearchQuery);
    setFilteredCountries(results);
  }, [countrySearchQuery]);

  // Handle country selection
  const handleSelectCountry = (country: Country) => {
    setSelectedCountry(country);
    setLocation({ ...location, country: country.name });
    setCountrySearchQuery("");
    setShowCountryDropdown(false);
    setError("");
  };

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
          types: ["establishment", "geocode"],
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
              })),
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
                "Google Maps API access denied. Please check your API key and restrictions.",
              );
            }
          }
        },
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
              "Could not get location details. Please try another location.",
            );
          }
        },
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
      },
    );
  };

  const handleSubmit = () => {
    if (!hasAgreed) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      setError("Please read and agree to the Agreement");
      return;
    }

    if (!location.country) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      setError("Please select your country");
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

    onComplete(location);
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-medium transition-colors"
        disabled={isLoading}
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Company Details
      </button>

      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <MapPin className="w-8 h-8 text-orange-600 dark:text-orange-400" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Office Location Setup
        </h2>
        <p className="text-muted-foreground">
          Set your office location for attendance tracking
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {/* ---------------------------------------------------------- Country Selector */}
        <div className="space-y-2" ref={countryDropdownRef}>
          <label className="block text-sm font-medium text-foreground">
            Country <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowCountryDropdown(!showCountryDropdown)}
              disabled={isLoading}
              className="w-full h-11 px-4 pr-10 border border-border bg-background text-foreground rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none transition-all text-left flex items-center gap-3 disabled:opacity-50"
            >
              {selectedCountry ? (
                <>
                  <span className="text-2xl">{selectedCountry.flag}</span>
                  <span className="text-foreground">
                    {selectedCountry.name}
                  </span>
                </>
              ) : (
                <>
                  <Globe className="w-5 h-5 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Select your country
                  </span>
                </>
              )}
              <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-3" />
            </button>

            {/* Country Dropdown */}
            {showCountryDropdown && (
              <div className="absolute z-50 left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg max-h-80 overflow-hidden flex flex-col">
                {/* Search Input */}
                <div className="p-3 border-b border-border sticky top-0 bg-background">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search countries..."
                      value={countrySearchQuery}
                      onChange={(e) => setCountrySearchQuery(e.target.value)}
                      className="w-full pl-9 pr-8 py-2 border border-border bg-background text-foreground rounded-lg text-sm focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none placeholder:text-muted-foreground"
                      onClick={(e) => e.stopPropagation()}
                    />
                    {countrySearchQuery && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCountrySearchQuery("");
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Countries List */}
                <div className="overflow-y-auto max-h-64">
                  {filteredCountries.length > 0 ? (
                    filteredCountries.map((country) => (
                      <button
                        key={country.code}
                        onClick={() => handleSelectCountry(country)}
                        className="w-full px-4 py-3 text-left hover:bg-orange-50 dark:hover:bg-orange-950/60 transition-colors border-b border-border last:border-b-0 flex items-center gap-3"
                      >
                        <span className="text-2xl">{country.flag}</span>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-foreground">
                            {country.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {country.code} • {country.timezone}
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                      No countries found
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          {selectedCountry && (
            <p className="text-xs text-muted-foreground">
              Timezone: {selectedCountry.timezone}
            </p>
          )}
        </div>

        {/* ---------------------------------------------------------- Get Current Location */}
        <label className="block text-sm font-medium text-foreground mb-2 mt-2">
          Your Office / Outlet Location
        </label>
        <button
          onClick={getCurrentLocation}
          disabled={gettingLocation || isLoading}
          className="w-full h-11 border-2 border-orange-600 text-orange-600 hover:bg-orange-50 dark:border-orange-400 dark:text-orange-400 dark:hover:bg-orange-950/60 font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {gettingLocation && <Loader2 className="w-4 h-4 animate-spin" />}
          {gettingLocation ? "Getting Location..." : "Get My Current Location"}
        </button>

        {/* ---------------------------------------------------------- OR Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-background text-muted-foreground font-medium">
              OR
            </span>
          </div>
        </div>

        {/* ---------------------------------------------------------- Google Places Search */}
        <div className="space-y-2 relative" ref={searchRef}>
          <label className="block text-sm font-medium text-foreground">
            Search Location
            {mapsLoaded && (
              <span className="ml-2 text-xs text-green-600 dark:text-green-400">
                ✓ Ready
              </span>
            )}
            {!mapsLoaded && (
              <span className="ml-2 text-xs text-orange-600 dark:text-orange-400">
                ⏳ Loading...
              </span>
            )}
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search for your office location..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              className="w-full h-11 pl-10 pr-10 border border-border bg-background text-foreground rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none transition-all placeholder:text-muted-foreground"
              disabled={isLoading || !mapsLoaded}
            />
            {searchQuery && !isLoadingPlaces && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSuggestions([]);
                  setShowSuggestions(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            {isLoadingPlaces && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-orange-600 dark:text-orange-400" />
            )}

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-50 left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.place_id}
                    onClick={() =>
                      handleSelectPlace(
                        suggestion.place_id,
                        suggestion.description,
                      )
                    }
                    className="w-full px-4 py-3 text-left hover:bg-orange-50 dark:hover:bg-orange-950/60 transition-colors border-b border-border last:border-b-0 text-sm"
                  >
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <span className="text-foreground">
                        {suggestion.description}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ---------------------------------------------------------- Manual Coordinates */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
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
              className="w-full h-11 px-4 border border-border bg-background text-foreground rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none transition-all placeholder:text-muted-foreground"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
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
              className="w-full h-11 px-4 border border-border bg-background text-foreground rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none transition-all placeholder:text-muted-foreground"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* ---------------------------------------------------------- Office Address */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">
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
            className="w-full px-4 py-3 border border-border bg-background text-foreground rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none transition-all resize-none placeholder:text-muted-foreground"
            disabled={isLoading}
          />
        </div>

        {/* ---------------------------------------------------------- Geofence Radius */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">
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
            className="w-full h-11 px-4 border border-border bg-background text-foreground rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none transition-all placeholder:text-muted-foreground"
            disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground">
            Set the radius for geofencing (minimum 10 meters)
          </p>
        </div>

        {/* ---------------------------------------------------------- Agreement Checkbox */}
        <AgreementCheckbox
          isChecked={hasAgreed}
          onCheckedChange={(checked) => {
            setHasAgreed(checked);
            if (checked) setError("");
          }}
        />

        {/* ---------------------------------------------------------- Submit */}
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full h-11 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6 cursor-pointer"
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          {isLoading ? "Processing..." : "Continue to Verification"}
        </button>
      </div>
    </div>
  );
}
