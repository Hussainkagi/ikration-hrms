"use client";

import { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import {
  LogIn,
  LogOut,
  Clock,
  Calendar,
  Camera,
  X,
  User,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import Employeetracking from "@/components/EmployeeTacking";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "YOUR_BASE_URL_HERE";

interface TrackingRecord {
  id: string;
  type: "check-in" | "check-out";
  timestamp: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export default function TrackingPage() {
  const { user } = useAuth();
  const [trackingRecords, setTrackingRecords] = useState<TrackingRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState<
    "check-in" | "check-out" | null
  >(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [imageSource, setImageSource] = useState<"camera" | "upload" | null>(
    null
  );
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      fetchTrackingRecords();
    }
  }, [user]);

  const fetchTrackingRecords = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token || !user) return;

      // You can implement fetching tracking history if your API supports it
      // For now, we'll keep it empty until records are created
    } catch (error) {
      console.error("Error fetching tracking records:", error);
    }
  };

  const openCameraModal = (type: "check-in" | "check-out") => {
    setShowCameraModal(type);
    setCapturedImage(null);
    setImageSource(null);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid File",
          description: "Please select an image file.",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setCapturedImage(result);
        setImageSource("upload");
        stopCamera(); // Stop camera if it was active
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraActive(true);
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast({
        title: "Camera Access Denied",
        description: "Please allow camera access to capture selfie.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const captureImage = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const imageData = canvas.toDataURL("image/jpeg");
        setCapturedImage(imageData);
        setImageSource("camera");
        stopCamera();
      }
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setImageSource(null);
  };

  const closeCameraModal = () => {
    stopCamera();
    setShowCameraModal(null);
    setCapturedImage(null);
    setImageSource(null);
  };

  const getCurrentLocation = (): Promise<{
    latitude: number;
    longitude: number;
  }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          reject(error);
        }
      );
    });
  };

  const handleCheckInOut = async (skipSelfie: boolean = false) => {
    if (!showCameraModal) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please login again.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Get current location - REQUIRED
      let location;
      try {
        location = await getCurrentLocation();
      } catch (error) {
        console.error("Location error:", error);
        toast({
          title: "Location Required",
          description: "Please enable location services to check in/out.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Prepare form data
      const formData = new FormData();

      // Always add location data
      formData.append("latitude", location.latitude.toString());
      formData.append("longitude", location.longitude.toString());

      // Add selfie if captured
      if (!skipSelfie && capturedImage) {
        const blob = await fetch(capturedImage).then((r) => r.blob());
        formData.append("selfie", blob, "selfie.jpg");
      }

      // Make API call
      const endpoint =
        showCameraModal === "check-in" ? "check-in" : "check-out";
      const response = await fetch(`${BASE_URL}/attendance/${endpoint}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle API error response
        toast({
          title: "Check-in/out Failed",
          description:
            result.message || `Failed to ${showCameraModal}. Please try again.`,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Add to tracking records
      const newRecord: TrackingRecord = {
        id: result.id || Date.now().toString(),
        type: showCameraModal,
        timestamp: new Date().toISOString(),
        location: location,
      };

      setTrackingRecords([newRecord, ...trackingRecords]);

      toast({
        title: `${
          showCameraModal === "check-in" ? "Checked In" : "Checked Out"
        } Successfully`,
        description: `${
          showCameraModal === "check-in" ? "Check-in" : "Check-out"
        } recorded at ${new Date().toLocaleTimeString()}`,
      });

      closeCameraModal();
    } catch (error) {
      console.error(`Error during ${showCameraModal}:`, error);
      toast({
        title: "Error",
        description: `An unexpected error occurred. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString(),
    };
  };

  const getUserInitials = () => {
    if (!user) return "?";
    return `${user.firstName?.[0] || ""}${
      user.lastName?.[0] || ""
    }`.toUpperCase();
  };

  const getUserFullName = () => {
    if (!user) return "User";
    return `${user.firstName || ""} ${user.lastName || ""}`.trim();
  };

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-500">Loading user data...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Attendance Tracking
          </h1>
          <p className="text-gray-500 mt-1">
            Record your check-in and check-out times
          </p>
        </div>

        {/* User Info & Check-in/out Form */}
        <Card>
          <CardHeader>
            <CardTitle>Time Tracking</CardTitle>
            <CardDescription>Record your attendance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current User Display */}
            <div className="flex items-center gap-4 p-4 bg-orange-50 rounded-xl border border-orange-200">
              <div className="w-16 h-16 rounded-full bg-orange-600 flex items-center justify-center text-white text-xl font-bold">
                {getUserInitials()}
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-lg">
                  {getUserFullName()}
                </p>
                <p className="text-sm text-gray-600">{user.email}</p>
                <p className="text-xs text-gray-500 mt-1 capitalize">
                  {user.role}
                </p>
              </div>
            </div>

            {/* Check-in/out Buttons */}
            <div className="flex flex-col gap-4 sm:flex-row">
              <button
                onClick={() => openCameraModal("check-in")}
                disabled={loading}
                className="flex-1 h-14 py-5 sm:py-0 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <LogIn className="w-5 h-5" />
                Check In
              </button>

              <button
                onClick={() => openCameraModal("check-out")}
                disabled={loading}
                className="flex-1 h-14 py-5 sm:py-0 bg-gray-700 hover:bg-gray-800 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                Check Out
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Tracking History */}
        {/* <Card>
          <CardHeader>
            <CardTitle>Tracking History</CardTitle>
            <CardDescription>
              Your recent check-in and check-out records
            </CardDescription>
          </CardHeader>
          <CardContent>
            {trackingRecords.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>No tracking records yet. Start tracking your attendance.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {trackingRecords.map((record) => {
                  const { date, time } = formatTimestamp(record.timestamp);
                  return (
                    <div
                      key={record.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                          <User className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {getUserFullName()}
                          </p>
                          <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {date}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {time}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <span
                          className={`px-4 py-2 rounded-full text-sm font-medium ${
                            record.type === "check-in"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {record.type === "check-in"
                            ? "Checked In"
                            : "Checked Out"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card> */}
        {user?.role === "admin" && (
          <Card>
            <CardHeader>
              <CardTitle>Employees Tracking History</CardTitle>
              <CardDescription>check-in and check-out records</CardDescription>
            </CardHeader>
            <CardContent>
              <Employeetracking />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Camera/Upload Modal */}
      {showCameraModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {showCameraModal === "check-in" ? "Check In" : "Check Out"}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {capturedImage
                    ? "Review your photo"
                    : "Capture or upload a selfie (optional)"}
                </p>
              </div>
              <button
                onClick={closeCameraModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Camera/Preview Area */}
            <div className="p-6">
              <div className="relative bg-gray-900 rounded-xl overflow-hidden aspect-[4/3]">
                {capturedImage ? (
                  <img
                    src={capturedImage}
                    alt="Captured selfie"
                    className="w-full h-full object-cover"
                  />
                ) : isCameraActive ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                    <ImageIcon className="w-16 h-16 mb-4 opacity-50" />
                    <p className="text-sm opacity-75">Choose an option below</p>
                  </div>
                )}
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* Action Buttons */}
              <div className="mt-6 space-y-3">
                {!capturedImage && !isCameraActive && (
                  <>
                    <button
                      onClick={startCamera}
                      className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Camera className="w-5 h-5" />
                      Open Camera
                    </button>

                    <button
                      onClick={triggerFileUpload}
                      className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Upload className="w-5 h-5" />
                      Upload Photo
                    </button>
                  </>
                )}

                {isCameraActive && !capturedImage && (
                  <button
                    onClick={captureImage}
                    className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Camera className="w-5 h-5" />
                    Capture Photo
                  </button>
                )}

                {capturedImage && (
                  <div className="flex gap-3">
                    <button
                      onClick={retakePhoto}
                      disabled={loading}
                      className="flex-1 h-12 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {imageSource === "camera" ? "Retake" : "Change"}
                    </button>
                    <button
                      onClick={() => handleCheckInOut(false)}
                      disabled={loading}
                      className="flex-1 h-12 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        "Confirm"
                      )}
                    </button>
                  </div>
                )}

                {!capturedImage && (
                  <button
                    onClick={() => handleCheckInOut(true)}
                    disabled={loading}
                    className="w-full h-12 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-gray-700 border-t-transparent rounded-full animate-spin mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      "Skip & Continue"
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
