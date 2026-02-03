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
  Globe,
  Edit3,
  Save,
  X,
  ChevronRight,
  MapPinned,
  CalendarDays,
  Timer,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { GoogleMap, LoadScript, Circle, Marker } from "@react-google-maps/api";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTheme } from "@/contexts/theme-context";

const mapContainerStyle = {
  width: "100%",
  height: "450px",
  borderRadius: "12px",
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

  const getDayAbbr = (dayNum: any) => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
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
      <div className="space-y-6 pb-8">
        {/* Header Section */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                Company Profile
              </h1>
              <p className="text-muted-foreground mt-1.5 text-sm">
                Organization details and configuration
              </p>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <ThemeToggle />
              {!isEditing ? (
                <button
                  onClick={handleEdit}
                  className="flex-1 sm:flex-none px-4 sm:px-5 py-2.5 btn-primary rounded-lg font-medium flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all"
                >
                  <Edit3 className="w-4 h-4" />
                  <span className="whitespace-nowrap">Edit Profile</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={handleCancel}
                    className="flex-1 sm:flex-none px-4 sm:px-5 py-2.5 bg-secondary/80 hover:bg-secondary text-foreground rounded-lg font-medium flex items-center justify-center gap-2 transition-all"
                    disabled={updating}
                  >
                    <X className="w-4 h-4" />
                    <span className="hidden sm:inline">Cancel</span>
                  </button>
                  <button
                    onClick={handleUpdate}
                    disabled={updating}
                    className="flex-1 sm:flex-none px-4 sm:px-5 py-2.5 btn-primary rounded-lg font-medium flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-4 h-4" />
                    <span className="whitespace-nowrap">
                      {updating ? "Saving..." : "Save Changes"}
                    </span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Main Info Cards - 3 Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Company Name Card */}
          <Card className="bg-gradient-to-br from-card to-card/50 border-border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div
                  className="p-3 rounded-xl"
                  style={{
                    backgroundColor: `${colorTheme.colors.primary}15`,
                  }}
                >
                  <Building2
                    className="w-6 h-6"
                    style={{ color: colorTheme.colors.primary }}
                  />
                </div>
              </div>
              <p className="text-sm text-muted-foreground font-medium mb-2">
                Company Name
              </p>
              <h3 className="text-2xl font-bold text-foreground mb-1">
                {profileData?.companyName}
              </h3>
              <p className="text-xs text-muted-foreground">Organization</p>
            </CardContent>
          </Card>

          {/* Office Location Card */}
          <Card className="bg-gradient-to-br from-card to-card/50 border-border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-blue-500/10">
                  <MapPin className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground font-medium mb-2">
                Office Location
              </p>
              {isEditing ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={formData.officeAddress}
                    onChange={(e) =>
                      handleInputChange("officeAddress", e.target.value)
                    }
                    className="w-full px-3 py-2 text-sm border border-border bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 ring-primary"
                    placeholder="Enter office address"
                  />
                  <input
                    type="number"
                    value={formData.radius}
                    onChange={(e) =>
                      handleInputChange("radius", e.target.value)
                    }
                    className="w-full px-3 py-2 text-sm border border-border bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 ring-primary"
                    placeholder="Radius in meters"
                  />
                </div>
              ) : (
                <>
                  <h3 className="text-xl font-bold text-foreground mb-1 line-clamp-2">
                    {profileData?.officeAddress}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Radius: {profileData?.radius}m
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Timezone Card */}
          <Card className="bg-gradient-to-br from-card to-card/50 border-border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-orange-500/10">
                  <Globe className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground font-medium mb-2">
                Timezone
              </p>
              <h3 className="text-xl font-bold text-foreground mb-1">
                {profileData?.timezone || "N/A"}
              </h3>
              <p className="text-xs text-muted-foreground">
                Organization timezone
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Work Details - 2 Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Work Hours & Weekly Off Combined Card */}
          <Card className="bg-card border-border shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <CardTitle className="text-lg">Work Schedule</CardTitle>
                  <CardDescription className="text-xs">
                    Daily hours and weekly offs
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Work Hours */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Work Hours
                </label>
                {isEditing ? (
                  <div className="flex items-center gap-3">
                    <input
                      type="time"
                      value={formData.workStartTime}
                      onChange={(e) =>
                        handleInputChange("workStartTime", e.target.value)
                      }
                      className="flex-1 px-3 py-2.5 border border-border bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 ring-primary"
                    />
                    <span className="text-muted-foreground font-medium">
                      to
                    </span>
                    <input
                      type="time"
                      value={formData.workEndTime}
                      onChange={(e) =>
                        handleInputChange("workEndTime", e.target.value)
                      }
                      className="flex-1 px-3 py-2.5 border border-border bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 ring-primary"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-4 py-3 bg-accent/50 rounded-lg">
                    <Timer className="w-5 h-5 text-muted-foreground" />
                    <span className="text-lg font-semibold text-foreground">
                      {formatTime(profileData?.workStartTime)} -{" "}
                      {formatTime(profileData?.workEndTime)}
                    </span>
                  </div>
                )}
              </div>

              {/* Weekly Off Days */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-3 block">
                  Weekly Off Days
                </label>
                {isEditing ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
                    {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                      <label
                        key={day}
                        className={`flex flex-col items-center gap-1.5 p-2.5 sm:p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          formData.weeklyOffDays.includes(day)
                            ? "border-primary bg-primary/10"
                            : "border-border bg-background hover:border-primary/50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.weeklyOffDays.includes(day)}
                          onChange={() => handleWeeklyOffDaysChange(day)}
                          className="hidden"
                        />
                        <span
                          className={`text-xs font-semibold ${
                            formData.weeklyOffDays.includes(day)
                              ? "text-primary"
                              : "text-muted-foreground"
                          }`}
                        >
                          {getDayAbbr(day)}
                        </span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profileData?.weeklyOffDays?.length > 0 ? (
                      profileData.weeklyOffDays.map((day: any) => (
                        <span
                          key={day}
                          className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-lg"
                          style={{
                            backgroundColor: `${colorTheme.colors.primary}20`,
                            color: colorTheme.colors.primary,
                          }}
                        >
                          {getDayName(day)}
                        </span>
                      ))
                    ) : (
                      <span className="text-muted-foreground text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 bg-accent/50 rounded-lg">
                        No weekly offs
                      </span>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Status & Agreement Card */}
          <Card className="bg-card border-border shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <CardTitle className="text-lg">Organization Status</CardTitle>
                  <CardDescription className="text-xs">
                    Current state and agreements
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status */}
              <div className="flex items-center justify-between p-4 bg-accent/50 rounded-lg">
                <div className="flex items-center gap-3">
                  {profileData?.isActive ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Status
                    </p>
                    <p
                      className={`text-lg font-bold ${
                        profileData?.isActive
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {profileData?.isActive ? "Active" : "Inactive"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Agreement */}
              <div className="flex items-center justify-between p-4 bg-accent/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Shield
                    className={`w-5 h-5 ${
                      profileData?.agreementAccepted
                        ? "text-green-600"
                        : "text-yellow-600"
                    }`}
                  />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Agreement
                    </p>
                    <p
                      className={`text-lg font-bold ${
                        profileData?.agreementAccepted
                          ? "text-green-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {profileData?.agreementAccepted ? "Accepted" : "Pending"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Organization Info */}
              <div className="pt-2 space-y-3 border-t border-border">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Created</span>
                  <span className="text-sm font-medium text-foreground">
                    {formatDate(profileData?.createdAt)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Updated</span>
                  <span className="text-sm font-medium text-foreground">
                    {formatDate(profileData?.updatedAt)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Country</span>
                  <span className="text-sm font-medium text-foreground">
                    {profileData?.country || "N/A"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Shift Timings Card */}
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                <div className="p-2.5 sm:p-3 rounded-xl bg-indigo-500/10 flex-shrink-0">
                  <CalendarDays className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-foreground">
                    Shift Timings
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                    Manage employee shift schedules and configurations
                  </p>
                </div>
              </div>
              <button
                onClick={() => router.push("/shifts")}
                className="w-full sm:w-auto px-4 sm:px-5 py-2.5 btn-primary rounded-lg font-medium flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all"
              >
                <span>Manage Shifts</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Map Section */}
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-red-500/10">
                  <MapPinned className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <CardTitle className="text-lg">Office Location Map</CardTitle>
                  <CardDescription className="text-xs">
                    {isEditing
                      ? "Update coordinates and check-in radius"
                      : `${profileData?.officeAddress} • ${profileData?.radius}m radius`}
                  </CardDescription>
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-4 pt-4 border-t border-border">
                <div>
                  <label className="text-xs sm:text-sm font-medium text-muted-foreground block mb-2">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) =>
                      handleInputChange("latitude", e.target.value)
                    }
                    className="w-full px-3 py-2.5 text-sm border border-border bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 ring-primary"
                    placeholder="Latitude"
                  />
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-medium text-muted-foreground block mb-2">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) =>
                      handleInputChange("longitude", e.target.value)
                    }
                    className="w-full px-3 py-2.5 text-sm border border-border bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 ring-primary"
                    placeholder="Longitude"
                  />
                </div>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <div className="rounded-xl overflow-hidden border border-border">
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
            </div>
            {!isEditing && (
              <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 p-4 bg-accent/50 rounded-lg">
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-1">
                    Coordinates
                  </p>
                  <p className="text-xs sm:text-sm font-mono font-medium text-foreground break-all">
                    {profileData?.latitude?.toFixed(6)},{" "}
                    {profileData?.longitude?.toFixed(6)}
                  </p>
                </div>
                <div className="hidden sm:block h-8 w-px bg-border"></div>
                <div className="flex-shrink-0">
                  <p className="text-xs text-muted-foreground mb-1">
                    Check-in Radius
                  </p>
                  <p className="text-xs sm:text-sm font-semibold text-foreground">
                    {profileData?.radius} meters
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card className="bg-gradient-to-br from-card to-card/50 border-border shadow-sm">
          <CardContent className="p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                <div className="p-2.5 sm:p-3 rounded-xl bg-pink-500/10 flex-shrink-0">
                  <Palette className="w-5 h-5 sm:w-6 sm:h-6 text-pink-600 dark:text-pink-400" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-foreground">
                    Appearance
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                    Customize your interface theme and colors
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-accent rounded-lg">
                  <div
                    className="w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: colorTheme.colors.primary }}
                  />
                  <span className="text-xs sm:text-sm font-medium text-foreground whitespace-nowrap">
                    {colorTheme.name}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
