"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Clock, Save, Loader2 } from "lucide-react";

interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  lateTime: string;
  days: number[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function EditShiftPage() {
  const router = useRouter();
  const params = useParams();
  const shiftId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    startTime: "",
    endTime: "",
    lateTime: "",
    days: [0, 0, 0, 0, 0, 0, 0],
  });

  const getAuthToken = () => {
    return localStorage.getItem("accessToken");
  };

  // Fetch shift data by ID
  const fetchShift = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();

      const response = await fetch(`${API_BASE_URL}/shift/${shiftId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch shift");

      const data: Shift = await response.json();
      setFormData({
        name: data.name,
        startTime: data.startTime,
        endTime: data.endTime,
        lateTime: data.lateTime,
        days: data.days,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch shift data. Please try again.",
        variant: "destructive",
      });
      router.push("/shifts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (shiftId) {
      fetchShift();
    }
  }, [shiftId]);

  const handleSubmit = async () => {
    try {
      setSaving(true);
      const token = getAuthToken();

      const response = await fetch(`${API_BASE_URL}/shift/${shiftId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      // If API returns an error, extract the message
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        const apiMessage =
          errorData?.message ||
          errorData?.error ||
          "Failed to update shift. Please try again.";

        throw new Error(apiMessage);
      }

      toast({
        title: "Shift Updated",
        description: `${formData.name} has been updated successfully.`,
      });

      router.push("/shifts");
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleDay = (index: number) => {
    const newDays = [...formData.days];
    newDays[index] = newDays[index] === 0 ? 1 : 0;
    setFormData({ ...formData, days: newDays });
  };

  const handleCancel = () => {
    router.push("/shifts");
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-orange-600 mx-auto mb-4" />
            <p className="text-muted-foreground">Loading shift data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={() => router.push("/shifts")}
                className="p-2 hover:bg-secondary rounded-lg transition-colors"
                title="Back to shifts"
              >
                <ArrowLeft className="w-5 h-5 text-muted-foreground" />
              </button>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                Edit Shift
              </h1>
            </div>
            <p className="text-muted-foreground text-sm sm:text-base ml-14">
              Update shift schedule and working days
            </p>
          </div>
        </div>

        {/* Edit Shift Form */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <Clock className="w-5 h-5 text-orange-600" />
              Shift Information
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Modify the shift details and save changes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Shift Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Morning Shift"
                  className="w-full h-11 px-4 border border-border bg-input text-foreground rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor="startTime"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Start Time
                  </label>
                  <input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) =>
                      setFormData({ ...formData, startTime: e.target.value })
                    }
                    className="w-full h-11 px-4 border border-border bg-input text-foreground rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div>
                  <label
                    htmlFor="endTime"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    End Time
                  </label>
                  <input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) =>
                      setFormData({ ...formData, endTime: e.target.value })
                    }
                    className="w-full h-11 px-4 border border-border bg-input text-foreground rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div>
                  <label
                    htmlFor="lateTime"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Late Time
                  </label>
                  <input
                    id="lateTime"
                    type="time"
                    value={formData.lateTime}
                    onChange={(e) =>
                      setFormData({ ...formData, lateTime: e.target.value })
                    }
                    className="w-full h-11 px-4 border border-border bg-input text-foreground rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  Working Days
                </label>
                <div className="flex flex-wrap gap-2">
                  {DAYS_OF_WEEK.map((day, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => toggleDay(index)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        formData.days[index] === 1
                          ? "bg-orange-600 text-white"
                          : "bg-secondary text-foreground hover:bg-secondary/80"
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Select the working days for this shift
                </p>
              </div>

              <div className="flex gap-3 pt-4 border-t border-border">
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="h-11 px-6 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="h-11 px-6 border border-border hover:bg-secondary disabled:bg-secondary/50 text-foreground font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-1">
                  About Shift Times
                </h3>
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  The <strong>Start Time</strong> is when the shift begins. The{" "}
                  <strong>Late Time</strong> is the grace period after which an
                  employee will be marked as late. The <strong>End Time</strong>{" "}
                  is when the shift concludes. Make sure to select all working
                  days for this shift.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
