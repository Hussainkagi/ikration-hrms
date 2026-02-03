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
import { LogIn, LogOut, Camera, X, RotateCcw } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

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
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (user) {
      fetchTrackingRecords();
    }
  }, [user]);

  useEffect(() => {
    if (showCameraModal && cameraActive) {
      startCamera();
    } else {
      stopCamera();
      setCapturedImage(null);
      setError(null);
    }

    return () => {
      stopCamera();
    };
  }, [showCameraModal, cameraActive]);

  const fetchTrackingRecords = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token || !user) return;
    } catch (error) {}
  };

  const openCameraModal = (type: "check-in" | "check-out") => {
    setShowCameraModal(type);
    setCameraActive(false);
    setCapturedImage(null);
    setError(null);
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 1280, height: 720 },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError(null);
    } catch (err) {
      setError("Unable to access camera. Please check your permissions.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL("image/jpeg", 0.8);
        setCapturedImage(imageData);
      }
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  const closeCameraModal = () => {
    stopCamera();
    setShowCameraModal(null);
    setCameraActive(false);
    setCapturedImage(null);
    setError(null);
  };

  const goBackToInitialView = () => {
    stopCamera();
    setCameraActive(false);
    setCapturedImage(null);
    setError(null);
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
        },
      );
    });
  };

  const handleCheckInOut = async (skipSelfie = false) => {
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
          <p className="text-muted-foreground">Loading user data...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Attendance Tracking
          </h1>
          <p className="text-muted-foreground mt-1">
            Record your check-in and check-out times
          </p>
        </div>

        {/* User Info & Check-in/out Form */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Time Tracking</CardTitle>
            <CardDescription className="text-muted-foreground">
              Record your attendance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current User Display */}
            <div className="flex items-center gap-4 p-4 bg-orange-50 dark:bg-orange-900/30 rounded-xl border border-orange-200 dark:border-orange-700">
              <div className="w-16 h-16 rounded-full bg-orange-600 flex items-center justify-center text-white text-xl font-bold">
                {getUserInitials()}
              </div>
              <div>
                <p className="font-semibold text-foreground text-lg">
                  {getUserFullName()}
                </p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <p className="text-xs text-muted-foreground mt-1 capitalize">
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
                className="flex-1 h-14 py-5 sm:py-0 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Check Out
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {showCameraModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h3 className="text-2xl font-bold text-foreground">
                  {showCameraModal === "check-in" ? "Check In" : "Check Out"}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {!cameraActive
                    ? "Take a selfie for verification or skip to continue"
                    : capturedImage
                      ? "Review your photo and submit to confirm"
                      : "Position your face in the frame and capture your selfie"}
                </p>
              </div>
              <button
                onClick={closeCameraModal}
                className="p-2 hover:bg-secondary rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {!cameraActive ? (
                <div className="space-y-6">
                  <div className="bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-700 rounded-lg p-8 text-center">
                    <div className="w-20 h-20 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Camera className="w-10 h-10 text-white" />
                    </div>
                    <h4 className="text-lg font-semibold text-foreground mb-2">
                      Selfie Verification
                    </h4>
                    <p className="text-sm text-muted-foreground mb-6">
                      Take a selfie to verify your attendance or skip to
                      continue without a photo
                    </p>

                    <div className="space-y-3">
                      <button
                        onClick={() => setCameraActive(true)}
                        className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <Camera className="w-5 h-5" />
                        Take a Selfie
                      </button>

                      <button
                        onClick={() => handleCheckInOut(true)}
                        disabled={loading}
                        className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Processing...
                          </>
                        ) : (
                          `Skip & ${
                            showCameraModal === "check-in"
                              ? "Check In"
                              : "Check Out"
                          }`
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {error ? (
                    <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-4 text-center">
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {error}
                      </p>
                      <button
                        onClick={startCamera}
                        className="mt-3 px-4 py-2 bg-background border border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/50 transition-colors text-sm font-medium"
                      >
                        Try Again
                      </button>
                    </div>
                  ) : (
                    <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
                      {capturedImage ? (
                        <img
                          src={capturedImage || "/placeholder.svg"}
                          alt="Captured selfie"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover scale-x-[-1]"
                        />
                      )}

                      {/* Face guide overlay */}
                      {!capturedImage && stream && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-40 h-52 sm:w-48 sm:h-64 md:w-64 md:h-80 border-2 sm:border-4 border-orange-500/50 rounded-full" />
                        </div>
                      )}
                    </div>
                  )}

                  <canvas ref={canvasRef} className="hidden" />

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    {capturedImage ? (
                      <>
                        <button
                          onClick={retakePhoto}
                          className="flex-1 h-12 bg-background border-2 border-border hover:bg-secondary text-foreground font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Retake
                        </button>
                        <button
                          onClick={() => handleCheckInOut(false)}
                          disabled={loading}
                          className="flex-1 h-12 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {loading ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Processing...
                            </>
                          ) : (
                            <>
                              <Camera className="w-4 h-4" />
                              <span className="hidden sm:inline">
                                Submit &{" "}
                                {showCameraModal === "check-in"
                                  ? "Check In"
                                  : "Check Out"}
                              </span>
                              <span className="inline sm:hidden">
                                {showCameraModal === "check-in"
                                  ? "Check In"
                                  : "Check Out"}
                              </span>
                            </>
                          )}
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={goBackToInitialView}
                          className="flex-1 h-12 bg-background border-2 border-border hover:bg-secondary text-foreground font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </button>
                        <button
                          onClick={captureImage}
                          disabled={!stream}
                          className="flex-1 h-12 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          <Camera className="w-4 h-4" />
                          Capture Photo
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
