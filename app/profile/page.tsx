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
} from "lucide-react";
import { GoogleMap, LoadScript, Circle, Marker } from "@react-google-maps/api";

const mapContainerStyle = {
  width: "100%",
  height: "400px",
  borderRadius: "8px",
};

const circleOptions = {
  strokeColor: "#FB923C",
  strokeOpacity: 0.8,
  strokeWeight: 2,
  fillColor: "#FB923C",
  fillOpacity: 0.2,
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
  const [updating, setUpdating] = useState(false);

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
    // Reset form data to original profile data
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

  const getWeeklyOffDays = () => {
    if (!profileData?.weeklyOffDays || profileData.weeklyOffDays.length === 0) {
      return "None";
    }

    const dayNames = [
      "Sunday", // 0
      "Monday", // 1
      "Tuesday", // 2
      "Wednesday", // 3
      "Thursday", // 4
      "Friday", // 5
      "Saturday", // 6
    ];

    return profileData.weeklyOffDays
      .map((day: any) => dayNames[day])
      .join(", ");
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Card className="max-w-md">
            <CardContent className="pt-6">
              <div className="text-center text-red-600">
                <p className="font-semibold">Error loading profile</p>
                <p className="text-sm mt-2">{error}</p>
                <button
                  onClick={fetchProfileData}
                  className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Company Profile
            </h1>
            <p className="text-gray-500 mt-1">
              Organization details and configuration
            </p>
          </div>
          <div className="flex gap-3">
            {!isEditing ? (
              <button
                onClick={handleEdit}
                className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
              >
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  onClick={handleCancel}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  disabled={updating}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={updating}
                  className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updating ? "Saving..." : "Save Changes"}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Company Name
              </CardTitle>
              <Building2 className="w-5 h-5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {profileData?.companyName}
              </div>
              <p className="text-xs text-gray-500 mt-1">Organization</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                  placeholder="Enter office address"
                />
              ) : (
                <div className="text-lg font-bold text-gray-900">
                  {profileData?.officeAddress}
                </div>
              )}
              {isEditing ? (
                <input
                  type="number"
                  value={formData.radius}
                  onChange={(e) => handleInputChange("radius", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 mt-2"
                  placeholder="Radius in meters"
                />
              ) : (
                <p className="text-xs text-gray-500 mt-1">
                  Radius: {profileData?.radius}m
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Work Hours
              </CardTitle>
              <Clock className="w-5 h-5 text-green-600" />
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={formData.workStartTime}
                      onChange={(e) =>
                        handleInputChange("workStartTime", e.target.value)
                      }
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                    />
                    <span className="text-gray-500">to</span>
                    <input
                      type="time"
                      value={formData.workEndTime}
                      onChange={(e) =>
                        handleInputChange("workEndTime", e.target.value)
                      }
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                    />
                  </div>
                </div>
              ) : (
                <div className="text-lg font-bold text-gray-900">
                  {formatTime(profileData?.workStartTime)} -{" "}
                  {formatTime(profileData?.workEndTime)}
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">Daily schedule</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
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
                          className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-600"
                        />
                        <span className="text-sm text-gray-700">
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
                        className="px-3 py-1 text-sm rounded-full bg-green-100 text-green-700 font-medium"
                      >
                        {getDayName(day)}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500 text-sm">None</span>
                  )}
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">Days off per week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Status
              </CardTitle>
              <Activity className="w-5 h-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-gray-900">
                {profileData?.isActive ? (
                  <span className="text-green-600">Active</span>
                ) : (
                  <span className="text-red-600">Inactive</span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">Organization status</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Agreement
              </CardTitle>
              <Shield className="w-5 h-5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-gray-900">
                {profileData?.agreementAccepted ? (
                  <span className="text-green-600">Accepted</span>
                ) : (
                  <span className="text-yellow-600">Pending</span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">Terms & conditions</p>
            </CardContent>
          </Card>
        </div>

        {/* Map Section */}
        <Card>
          <CardHeader>
            <CardTitle>Office Location Map</CardTitle>
            <CardDescription>
              {isEditing ? (
                <div className="space-y-2 mt-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Latitude
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={formData.latitude}
                        onChange={(e) =>
                          handleInputChange("latitude", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 mt-1"
                        placeholder="Latitude"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Longitude
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={formData.longitude}
                        onChange={(e) =>
                          handleInputChange("longitude", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 mt-1"
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
                  options={circleOptions}
                />
              </GoogleMap>
            </LoadScript>
          </CardContent>
        </Card>

        {/* Additional Details */}
        <Card>
          <CardHeader>
            <CardTitle>Organization Details</CardTitle>
            <CardDescription>
              Additional information about the organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* <div>
                <p className="text-sm font-medium text-gray-600">
                  Organization ID
                </p>
                <p className="text-sm text-gray-900 mt-1">{profileData?.id}</p>
              </div> */}
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Created Date
                </p>
                <p className="text-sm text-gray-900 mt-1">
                  {formatDate(profileData?.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Last Updated
                </p>
                <p className="text-sm text-gray-900 mt-1">
                  {formatDate(profileData?.updatedAt)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Coordinates</p>
                <p className="text-sm text-gray-900 mt-1">
                  {profileData?.latitude?.toFixed(6)},{" "}
                  {profileData?.longitude?.toFixed(6)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
