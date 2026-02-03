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
import { Mail, User, Phone, ArrowLeft, Loader2, Clock } from "lucide-react";
import { useTheme } from "@/contexts/theme-context";

interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  lateTime: string;
  days: number[];
  organizationId: string;
  isDefault: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}

interface EmployeeDetails {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
  role: string;
  status: string;
  remote: boolean;
  organizationId: string;
  shiftId: string | null;
  shift?: Shift;
  createdAt: string;
  updatedAt: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default function EmployeeEditPage() {
  const router = useRouter();
  const params = useParams();
  const employeeId = params?.id as string;
  const { colorTheme } = useTheme();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [employee, setEmployee] = useState<EmployeeDetails | null>(null);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobileNumber: "",
    status: "active",
    remote: false,
    shiftId: "",
  });
  const [originalShiftId, setOriginalShiftId] = useState<string | null>(null);

  const getAuthToken = () => {
    return localStorage.getItem("accessToken");
  };

  // Fetch shifts
  const fetchShifts = async () => {
    try {
      const token = getAuthToken();

      const response = await fetch(`${API_BASE_URL}/shift`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch shifts");

      const data = await response.json();
      setShifts(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch shifts. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Fetch employee details
  const fetchEmployeeDetails = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();

      const response = await fetch(`${API_BASE_URL}/user/${employeeId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch employee details");

      const data: EmployeeDetails = await response.json();
      setEmployee(data);
      setOriginalShiftId(data.shiftId);

      // Set form data
      setFormData({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        mobileNumber: data.mobileNumber,
        status: data.status,
        remote: data.remote || false,
        shiftId: data.shiftId || "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch employee details. Please try again.",
        variant: "destructive",
      });
      router.push("/employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (employeeId) {
      fetchEmployeeDetails();
      fetchShifts();
    }
  }, [employeeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      const token = getAuthToken();

      // Update employee basic info (without shiftId)
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        mobileNumber: formData.mobileNumber,
        status: formData.status,
        remote: formData.remote,
      };

      const response = await fetch(`${API_BASE_URL}/user/${employeeId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.message || "Failed to update employee");
      }

      // Handle shift assignment changes
      const shiftChanged = formData.shiftId !== (originalShiftId || "default");

      if (shiftChanged) {
        // If user selected a non-default shift, assign it
        if (formData.shiftId && formData.shiftId !== "default") {
          const assignResponse = await fetch(`${API_BASE_URL}/shift/assign`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: employeeId,
              shiftId: formData.shiftId,
            }),
          });

          if (!assignResponse.ok) {
            toast({
              title: "Warning",
              description: `Employee updated but shift assignment failed.`,
              variant: "default",
            });
          }
        }
      }

      setTimeout(() => {
        toast({
          title: "Employee Updated",
          description: `${formData.firstName} ${formData.lastName} has been updated successfully.`,
        });
        router.push("/employees");
      }, 800);
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.message || "Failed to update employee. Please try again.",
        variant: "destructive",
      });
    } finally {
      setTimeout(() => {
        setSaving(false);
      }, 800);
    }
  };

  const toggleStatus = () => {
    setFormData({
      ...formData,
      status: formData.status === "active" ? "inactive" : "active",
    });
  };

  const handleRemoveShift = async () => {
    if (!originalShiftId || originalShiftId === "default") {
      toast({
        title: "Info",
        description: "Employee is already using the default shift.",
        variant: "default",
      });
      return;
    }

    try {
      setSaving(true);
      const token = getAuthToken();

      const response = await fetch(
        `${API_BASE_URL}/shift/assign/${employeeId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to remove shift assignment");
      }

      toast({
        title: "Shift Removed",
        description: "Employee has been assigned to the default shift.",
      });

      // Refresh employee details to get updated shift info
      await fetchEmployeeDetails();
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.message || "Failed to remove shift. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Helper function to get shift display info
  const getCurrentShiftInfo = () => {
    // If employee has a specific shiftId assigned (not null and not "default")
    if (originalShiftId && originalShiftId !== "default") {
      const shift = shifts.find((s) => s.id === originalShiftId);
      return shift
        ? `${shift.name} (${shift.startTime} - ${shift.endTime})`
        : "Unknown Shift";
    }

    // If shiftId is null or "default", find and show the default shift
    const defaultShift = shifts.find((s) => s.isDefault === true);
    if (defaultShift) {
      return `${defaultShift.name} (${defaultShift.startTime} - ${defaultShift.endTime})`;
    }

    return "Not Assigned";
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2
              className="w-8 h-8 animate-spin mx-auto mb-4"
              style={{ color: colorTheme.colors.primary }}
            />
            <p className="text-muted-foreground">Loading employee details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Button
              onClick={() => router.push("/employees")}
              variant="ghost"
              className="mb-2 -ml-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Employees
            </Button>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Edit Employee
            </h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              Update employee information
            </p>
          </div>
        </div>

        {/* Edit Form */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">
              Employee Information
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Update the details for {employee?.firstName} {employee?.lastName}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    First Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      id="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          firstName: e.target.value,
                        })
                      }
                      placeholder="John"
                      className="w-full h-11 pl-10 pr-4 border border-border bg-input text-foreground rounded-lg focus:ring-2 ring-primary focus:border-transparent outline-none transition-all"
                      required
                      disabled={saving}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Last Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      id="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      placeholder="Doe"
                      className="w-full h-11 pl-10 pr-4 border border-border bg-input text-foreground rounded-lg focus:ring-2 ring-primary focus:border-transparent outline-none transition-all"
                      required
                      disabled={saving}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="john.doe@company.com"
                      className="w-full h-11 pl-10 pr-4 border border-border bg-input text-foreground rounded-lg focus:ring-2 ring-primary focus:border-transparent outline-none transition-all"
                      required
                      disabled={saving}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="mobileNumber"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Mobile Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      id="mobileNumber"
                      type="tel"
                      value={formData.mobileNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          mobileNumber: e.target.value,
                        })
                      }
                      placeholder="+1234567890"
                      className="w-full h-11 pl-10 pr-4 border border-border bg-input text-foreground rounded-lg focus:ring-2 ring-primary focus:border-transparent outline-none transition-all"
                      required
                      disabled={saving}
                    />
                  </div>
                </div>

                <div className="md:col-span-1">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="shift"
                      className="block text-sm font-medium text-foreground mb-2"
                    >
                      Assign Shift
                    </label>

                    {/* Add More Shift Timings Link */}
                    <span
                      onClick={() => router.push("/shifts")}
                      className="text-sm cursor-pointer hover:underline"
                      style={{ color: colorTheme.colors.primary }}
                    >
                      Add more shift timings
                    </span>
                  </div>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <select
                      id="shift"
                      value={
                        formData.shiftId === "default" ? "" : formData.shiftId
                      }
                      onChange={(e) =>
                        setFormData({ ...formData, shiftId: e.target.value })
                      }
                      className="w-full h-11 pl-10 pr-4 border border-border bg-input text-foreground rounded-lg focus:ring-2 ring-primary focus:border-transparent outline-none transition-all appearance-none"
                      disabled={saving}
                    >
                      <option value="">Select a shift</option>
                      {shifts
                        .filter((shift) => !shift.isDefault)
                        .map((shift) => (
                          <option key={shift.id} value={shift.id}>
                            {shift.name} ({shift.startTime} - {shift.endTime})
                          </option>
                        ))}
                    </select>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    <span className="font-medium">Current shift:</span>{" "}
                    <span style={{ color: colorTheme.colors.primary }}>
                      {getCurrentShiftInfo()}
                    </span>
                  </p>
                  {!originalShiftId || originalShiftId === "default" ? (
                    <div
                      className="mt-2 p-2 border rounded-md"
                      style={{
                        backgroundColor: `${colorTheme.colors.primary}10`,
                        borderColor: `${colorTheme.colors.primary}30`,
                      }}
                    >
                      <p
                        className="text-xs"
                        style={{ color: colorTheme.colors.primary }}
                      >
                        💡 This employee is currently using the default shift.
                        Select a shift above to assign a custom shift.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleRemoveShift}
                        disabled={saving}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-300 dark:border-red-800"
                      >
                        Remove Custom Shift & Use Default
                      </Button>
                      <p className="text-xs text-muted-foreground mt-1">
                        Click to remove the custom shift and assign the default
                        shift
                      </p>
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Employee Status
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={toggleStatus}
                      disabled={saving}
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                      style={
                        {
                          backgroundColor:
                            formData.status === "active"
                              ? "#10B981"
                              : "var(--secondary)",
                          "--tw-ring-color": colorTheme.colors.primary,
                        } as any
                      }
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform shadow-md ${
                          formData.status === "active"
                            ? "translate-x-7"
                            : "translate-x-1"
                        }`}
                      />
                    </button>
                    <span
                      className={`text-sm font-medium ${
                        formData.status === "active"
                          ? "text-green-600"
                          : "text-muted-foreground"
                      }`}
                    >
                      {formData.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Toggle to change employee status between active and inactive
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-3">
                    Is this employee working remotely?
                  </label>
                  <div className="flex gap-6">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="isRemote"
                        value="true"
                        checked={formData.remote === true}
                        onChange={() =>
                          setFormData({ ...formData, remote: true })
                        }
                        className="w-4 h-4 focus:ring-2 cursor-pointer"
                        style={{ accentColor: colorTheme.colors.primary }}
                        disabled={saving}
                      />
                      <span className="ml-2 text-sm text-foreground">Yes</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="isRemote"
                        value="false"
                        checked={formData.remote === false}
                        onChange={() =>
                          setFormData({ ...formData, remote: false })
                        }
                        className="w-4 h-4 focus:ring-2 cursor-pointer"
                        style={{ accentColor: colorTheme.colors.primary }}
                        disabled={saving}
                      />
                      <span className="ml-2 text-sm text-foreground">No</span>
                    </label>
                  </div>
                  <div
                    className="mt-3 p-3 border rounded-lg"
                    style={{
                      backgroundColor: `${colorTheme.colors.primary}10`,
                      borderColor: `${colorTheme.colors.primary}30`,
                    }}
                  >
                    <p
                      className="text-sm"
                      style={{ color: colorTheme.colors.primary }}
                    >
                      <strong>Note:</strong> If set to "Yes", the employee will
                      be able to check-in/check-out even when not within the
                      office location range.
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              {employee && (
                <div className="pt-4 border-t border-border">
                  <h3 className="text-sm font-medium text-foreground mb-3">
                    Additional Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Role:</span>
                      <span
                        className="ml-2 font-medium capitalize px-2 py-1 rounded"
                        style={{
                          backgroundColor: `${colorTheme.colors.primary}15`,
                          color: colorTheme.colors.primary,
                        }}
                      >
                        {employee.role}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Created:</span>
                      <span className="ml-2 font-medium text-foreground">
                        {new Date(employee.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Last Updated:
                      </span>
                      <span className="ml-2 font-medium text-foreground">
                        {new Date(employee.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={saving} className="btn-primary">
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Update Employee"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/employees")}
                  disabled={saving}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
