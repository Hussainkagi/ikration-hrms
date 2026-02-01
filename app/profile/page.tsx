"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Building2,
  MapPin,
  Clock,
  Calendar,
  Shield,
  Activity,
  Palette,
} from "lucide-react";
import { GoogleMap, LoadScript, Circle, Marker } from "@react-google-maps/api";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTheme } from "@/contexts/theme-context";

const mapContainerStyle = {
  width: "100%",
  height: "400px",
  borderRadius: "8px",
};

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default function CompanyProfilePage() {
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({
    companyName: "",
    officeAddress: "",
    latitude: 0,
    longitude: 0,
    radius: 0,
    workStartTime: "",
    workEndTime: "",
    weeklyOffDays: [],
  });
  const router = useRouter();
  const [updating, setUpdating] = useState(false);
  const { colorTheme } = useTheme();

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");

      if (!token) {
        throw new Error("No access token found");
      }

      const response = await fetch(`${BASE_URL}/organization/profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch profile data");
      }

      const data = await response.json();
      setProfileData(data);
      setFormData({
        companyName: data.companyName || "",
        officeAddress: data.officeAddress || "",
        latitude: data.latitude || 0,
        longitude: data.longitude || 0,
        radius: data.radius || 0,
        workStartTime: data.workStartTime || "",
        workEndTime: data.workEndTime || "",
        weeklyOffDays: data.weeklyOffDays || [],
      });
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time: any) => {
    if (!time) return "N/A";
    return time;
  };

  const formatDate = (dateString: any) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      companyName: profileData.companyName || "",
      officeAddress: profileData.officeAddress || "",
      latitude: profileData.latitude || 0,
      longitude: profileData.longitude || 0,
      radius: profileData.radius || 0,
      workStartTime: profileData.workStartTime || "",
      workEndTime: profileData.workEndTime || "",
      weeklyOffDays: profileData.weeklyOffDays || [],
    });
  };

  const handleInputChange = (field: any, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleWeeklyOffDaysChange = (day: any) => {
    setFormData((prev: any) => {
      const days: any = [...prev.weeklyOffDays];
      const index = days.indexOf(day);
      if (index > -1) {
        days.splice(index, 1);
      } else {
        days.push(day);
      }
      return { ...prev, weeklyOffDays: days.sort((a: any, b: any) => a - b) };
    });
  };

  const handleUpdate = async () => {
    try {
      setUpdating(true);
      const token = localStorage.getItem("accessToken");

      if (!token) {
        throw new Error("No access token found");
      }

      const updatePayload = {
        workStartTime: formData.workStartTime,
        workEndTime: formData.workEndTime,
        weeklyOffDays: formData.weeklyOffDays,
        officeAddress: formData.officeAddress,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        radius: parseInt(formData.radius),
      };

      const response = await fetch(`${BASE_URL}/organization/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatePayload),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const data = await response.json();
      setProfileData(data);
      setFormData({
        companyName: data.companyName || "",
        officeAddress: data.officeAddress || "",
        latitude: data.latitude || 0,
        longitude: data.longitude || 0,
        radius: data.radius || 0,
        workStartTime: data.workStartTime || "",
        workEndTime: data.workEndTime || "",
        weeklyOffDays: data.weeklyOffDays || [],
      });
      setIsEditing(false);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error("Error updating profile:", err);
    } finally {
      setUpdating(false);
    }
  };

  const getDayName = (dayNum: any) => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return days[dayNum] || dayNum;
  };

  const getCircleOptions = () => ({
    strokeColor: colorTheme.colors.primary,
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: colorTheme.colors.primary,
    fillOpacity: 0.2,
  });

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div
              className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto"
              style={{ borderColor: colorTheme.colors.primary }}
            ></div>
            <p className="mt-4 text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Card className="max-w-md bg-card border-border">
            <CardContent className="pt-6">
              <div className="text-center text-red-600">
                <p className="font-semibold">Error loading profile</p>
                <p className="text-sm mt-2">{error}</p>
                <button
                  onClick={fetchProfileData}
                  className="mt-4 px-4 py-2 btn-primary rounded-lg transition-colors"
                >
                  Retry
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const center = {
    lat: profileData?.latitude || 0,
    lng: profileData?.longitude || 0,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Company Profile
            </h1>
            <p className="text-muted-foreground mt-1">
              Organization details and configuration
            </p>
          </div>

          <div className="flex gap-3">
            {!isEditing ? (
              <button
                onClick={handleEdit}
                className="px-6 py-2 btn-primary rounded-lg font-medium"
              >
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  onClick={handleCancel}
                  className="px-6 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-accent transition-colors font-medium"
                  disabled={updating}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={updating}
                  className="px-6 py-2 btn-primary rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updating ? "Saving..." : "Save Changes"}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Company Name
              </CardTitle>
              <Building2 className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">
                {profileData?.companyName}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Organization</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Office Location
              </CardTitle>
              <MapPin className="w-5 h-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.officeAddress}
                  onChange={(e) =>
                    handleInputChange("officeAddress", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-border bg-input text-foreground rounded-lg focus:outline-none focus:ring-2 ring-primary"
                  placeholder="Enter office address"
                />
              ) : (
                <div className="text-lg font-bold text-card-foreground">
                  {profileData?.officeAddress}
                </div>
              )}
              {isEditing ? (
                <input
                  type="number"
                  value={formData.radius}
                  onChange={(e) => handleInputChange("radius", e.target.value)}
                  className="w-full px-3 py-2 border border-border bg-input text-foreground rounded-lg focus:outline-none focus:ring-2 ring-primary mt-2"
                  placeholder="Radius in meters"
                />
              ) : (
                <p className="text-xs text-muted-foreground mt-1">
                  Radius: {profileData?.radius}m
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Work Hours
              </CardTitle>
              <Clock className="w-5 h-5 text-green-600" />
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <input
                      type="time"
                      value={formData.workStartTime}
                      onChange={(e) =>
                        handleInputChange("workStartTime", e.target.value)
                      }
                      className="flex-1 px-3 py-2 border border-border bg-input text-foreground rounded-lg focus:outline-none focus:ring-2 ring-primary"
                    />
                    <span className="text-muted-foreground text-center sm:text-left">
                      to
                    </span>
                    <input
                      type="time"
                      value={formData.workEndTime}
                      onChange={(e) =>
                        handleInputChange("workEndTime", e.target.value)
                      }
                      className="flex-1 px-3 py-2 border border-border bg-input text-foreground rounded-lg focus:outline-none focus:ring-2 ring-primary"
                    />
                  </div>
                </div>
              ) : (
                <div className="text-lg font-bold text-card-foreground">
                  {formatTime(profileData?.workStartTime)} -{" "}
                  {formatTime(profileData?.workEndTime)}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Daily schedule
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Weekly Off
              </CardTitle>
              <Calendar className="w-5 h-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                      <label
                        key={day}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.weeklyOffDays.includes(day)}
                          onChange={() => handleWeeklyOffDaysChange(day)}
                          className="w-4 h-4 text-primary border-border rounded ring-primary"
                          style={{ accentColor: colorTheme.colors.primary }}
                        />
                        <span className="text-sm text-foreground">
                          {getDayName(day)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profileData?.weeklyOffDays?.length > 0 ? (
                    profileData.weeklyOffDays.map((day: any) => (
                      <span
                        key={day}
                        className="px-3 py-1 text-sm rounded-full font-medium"
                        style={{
                          backgroundColor: `${colorTheme.colors.primary}20`,
                          color: colorTheme.colors.primary,
                        }}
                      >
                        {getDayName(day)}
                      </span>
                    ))
                  ) : (
                    <span className="text-muted-foreground text-sm">None</span>
                  )}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Days off per week
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Status
              </CardTitle>
              <Activity className="w-5 h-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">
                {profileData?.isActive ? (
                  <span className="text-green-600">Active</span>
                ) : (
                  <span className="text-red-600">Inactive</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Organization status
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Agreement
              </CardTitle>
              <Shield className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">
                {profileData?.agreementAccepted ? (
                  <span className="text-green-600">Accepted</span>
                ) : (
                  <span className="text-yellow-600">Pending</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Terms & conditions
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">
              Shift Timings
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Your shift timings can be managed here
            </CardDescription>
          </CardHeader>
          <CardContent>
            <button
              onClick={() => router.push("/shifts")}
              className="px-5 py-2 btn-primary rounded-lg font-medium"
            >
              Manage Shift Timings
            </button>
          </CardContent>
        </Card>

        {/* Map Section */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">
              Office Location Map
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {isEditing ? (
                <div className="space-y-2 mt-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Latitude
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={formData.latitude}
                        onChange={(e) =>
                          handleInputChange("latitude", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-border bg-input text-foreground rounded-lg focus:outline-none focus:ring-2 ring-primary mt-1"
                        placeholder="Latitude"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Longitude
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={formData.longitude}
                        onChange={(e) =>
                          handleInputChange("longitude", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-border bg-input text-foreground rounded-lg focus:outline-none focus:ring-2 ring-primary mt-1"
                        placeholder="Longitude"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                `Office located at ${profileData?.officeAddress} with ${profileData?.radius}m check-in radius`
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoadScript
              googleMapsApiKey={
                process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY || ""
              }
            >
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={
                  isEditing
                    ? {
                        lat: parseFloat(formData.latitude),
                        lng: parseFloat(formData.longitude),
                      }
                    : center
                }
                zoom={15}
              >
                <Marker
                  position={
                    isEditing
                      ? {
                          lat: parseFloat(formData.latitude),
                          lng: parseFloat(formData.longitude),
                        }
                      : center
                  }
                />
                <Circle
                  center={
                    isEditing
                      ? {
                          lat: parseFloat(formData.latitude),
                          lng: parseFloat(formData.longitude),
                        }
                      : center
                  }
                  radius={
                    isEditing
                      ? parseInt(formData.radius) || 200
                      : profileData?.radius || 200
                  }
                  options={getCircleOptions()}
                />
              </GoogleMap>
            </LoadScript>
          </CardContent>
        </Card>

        {/* Additional Details */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">
              Organization Details
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Additional information about the organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Created Date
                </p>
                <p className="text-sm text-card-foreground mt-1">
                  {formatDate(profileData?.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Last Updated
                </p>
                <p className="text-sm text-card-foreground mt-1">
                  {formatDate(profileData?.updatedAt)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Coordinates
                </p>
                <p className="text-sm text-card-foreground mt-1">
                  {profileData?.latitude?.toFixed(6)},{" "}
                  {profileData?.longitude?.toFixed(6)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-card-foreground flex items-center gap-2">
                  <Palette className="w-5 h-5 text-primary" />
                  Appearance
                </CardTitle>
                <CardDescription className="text-muted-foreground mt-1">
                  Customize your interface theme and colors
                </CardDescription>
              </div>
              <ThemeToggle />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Toggle between light and dark mode, and choose from a variety of
                color themes or create your own custom theme.
              </p>
              <div className="flex items-center gap-2 p-3 bg-accent rounded-lg">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: colorTheme.colors.primary }}
                />
                <span className="text-sm font-medium text-accent-foreground">
                  Current theme: {colorTheme.name}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
