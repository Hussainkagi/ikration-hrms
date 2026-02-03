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
import { Users, UserCheck, UserX, Clock, MapPin } from "lucide-react";
import { useTheme } from "@/contexts/theme-context";

// Skeleton Components
const SkeletonCard = () => (
  <Card className="bg-card border-border">
    <CardHeader className="flex flex-row items-center justify-between pb-2 md:pb-2">
      <div className="h-3 w-20 md:h-4 md:w-24 bg-secondary rounded animate-pulse" />
      <div className="w-4 h-4 md:w-5 md:h-5 bg-secondary rounded animate-pulse" />
    </CardHeader>
    <CardContent className="py-2 md:py-3">
      <div className="h-7 w-12 md:h-9 md:w-16 bg-secondary rounded animate-pulse mb-1 md:mb-2" />
      <div className="h-2.5 w-24 md:h-3 md:w-32 bg-secondary rounded animate-pulse" />
    </CardContent>
  </Card>
);

const SkeletonRecentActivity = () => (
  <Card className="bg-card border-border">
    <CardHeader className="pb-3 md:pb-4">
      <div className="h-5 w-40 md:h-6 md:w-48 bg-secondary rounded animate-pulse mb-1.5 md:mb-2" />
      <div className="h-3 w-28 md:h-4 md:w-36 bg-secondary rounded animate-pulse" />
    </CardHeader>
    <CardContent>
      <div className="space-y-2.5 md:space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between p-2.5 md:p-3 bg-secondary/50 rounded-lg"
          >
            <div className="flex items-center gap-2 md:gap-3 flex-1">
              <div className="w-2 h-2 bg-muted rounded-full animate-pulse" />
              <div className="flex-1 space-y-1.5 md:space-y-2">
                <div className="h-3.5 w-24 md:h-4 md:w-32 bg-secondary rounded animate-pulse" />
                <div className="h-2.5 w-32 md:h-3 md:w-40 bg-secondary rounded animate-pulse" />
              </div>
            </div>
            <div className="h-3.5 w-10 md:h-4 md:w-12 bg-secondary rounded animate-pulse" />
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const SkeletonAttendanceOverview = () => (
  <Card className="bg-card border-border">
    <CardHeader className="pb-3 md:pb-4">
      <div className="h-5 w-40 md:h-6 md:w-48 bg-secondary rounded animate-pulse mb-1.5 md:mb-2" />
      <div className="h-3 w-28 md:h-4 md:w-36 bg-secondary rounded animate-pulse" />
    </CardHeader>
    <CardContent>
      <div className="space-y-2 md:space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between p-3 md:p-4 border border-border rounded-lg"
          >
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-muted rounded-full animate-pulse" />
              <div className="space-y-1.5 md:space-y-2">
                <div className="h-3.5 w-24 md:h-4 md:w-32 bg-secondary rounded animate-pulse" />
                <div className="h-2.5 w-32 md:h-3 md:w-40 bg-secondary rounded animate-pulse" />
              </div>
            </div>
            <div className="space-y-1.5 md:space-y-2">
              <div className="h-3.5 w-16 md:h-4 md:w-20 bg-secondary rounded animate-pulse ml-auto" />
              <div className="h-2.5 w-24 md:h-3 md:w-32 bg-secondary rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [error, setError] = useState(null);
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const { colorTheme } = useTheme();

  useEffect(() => {
    const skeletonTimer = setTimeout(() => {
      setShowSkeleton(false);
    }, 800);

    fetchDashboardStats();

    return () => clearTimeout(skeletonTimer);
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");

      if (!token) {
        throw new Error("No access token found");
      }

      const response = await fetch(`${BASE_URL}/dashboard/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch dashboard stats");
      }

      const data = await response.json();
      setStats(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: any) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString: any) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  if (showSkeleton || loading) {
    return (
      <DashboardLayout>
        <div className="space-y-4 md:space-y-6">
          <div>
            <div className="h-7 w-40 md:h-9 md:w-48 bg-secondary rounded animate-pulse mb-1.5 md:mb-2" />
            <div className="h-3 w-56 md:h-4 md:w-72 bg-secondary rounded animate-pulse" />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <SkeletonRecentActivity />
            <SkeletonRecentActivity />
          </div>

          <SkeletonAttendanceOverview />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Card className="max-w-md bg-card border-border">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="font-semibold text-destructive mb-2">
                  Error loading dashboard
                </p>
                <p className="text-sm text-muted-foreground mb-4">{error}</p>
                <button
                  onClick={fetchDashboardStats}
                  className="px-4 py-2 btn-primary rounded-lg transition-colors"
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

  const attendanceRate =
    stats?.users?.total > 0
      ? Math.round((stats.attendance.today.checkedIn / stats.users.total) * 100)
      : 0;

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Dashboard
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Overview of employee attendance and tracking
          </p>
        </div>

        {/* Stats Cards - 2 columns on mobile, 4 on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          <Card className="bg-card border-border hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 md:pb-2 px-4 pt-4 md:px-6 md:pt-6">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                Total Employees
              </CardTitle>
              <Users
                className="w-4 h-4 md:w-5 md:h-5"
                style={{ color: colorTheme.colors.primary }}
              />
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0 md:px-6 md:pb-6">
              <div className="text-2xl md:text-3xl font-bold text-card-foreground">
                {stats?.users?.total || 0}
              </div>
              <p className="text-[10px] md:text-xs text-muted-foreground mt-1">
                {stats?.users?.admins || 0} admins,{" "}
                {stats?.users?.employees || 0} employees
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 md:pb-2 px-4 pt-4 md:px-6 md:pt-6">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                Checked In
              </CardTitle>
              <UserCheck className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0 md:px-6 md:pb-6">
              <div className="text-2xl md:text-3xl font-bold text-card-foreground">
                {stats?.attendance?.today?.checkedIn || 0}
              </div>
              <p className="text-[10px] md:text-xs text-muted-foreground mt-1">
                <span
                  className="font-semibold"
                  style={{ color: colorTheme.colors.primary }}
                >
                  {attendanceRate}%
                </span>{" "}
                attendance
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 md:pb-2 px-4 pt-4 md:px-6 md:pt-6">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                Checked Out
              </CardTitle>
              <UserX className="w-4 h-4 md:w-5 md:h-5 text-red-600" />
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0 md:px-6 md:pb-6">
              <div className="text-2xl md:text-3xl font-bold text-card-foreground">
                {stats?.attendance?.today?.checkedOut || 0}
              </div>
              <p className="text-[10px] md:text-xs text-muted-foreground mt-1">
                <span
                  className="font-semibold"
                  style={{ color: colorTheme.colors.primary }}
                >
                  {stats?.attendance?.today?.pending || 0}
                </span>{" "}
                working
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 md:pb-2 px-4 pt-4 md:px-6 md:pt-6">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                Avg Hours
              </CardTitle>
              <Clock className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0 md:px-6 md:pb-6">
              <div className="text-2xl md:text-3xl font-bold text-card-foreground">
                {stats?.attendance?.averageHours?.toFixed(1) || 0}
                <span className="text-base md:text-lg">h</span>
              </div>
              <p className="text-[10px] md:text-xs text-muted-foreground mt-1">
                Daily average
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <Card className="bg-card border-border">
            <CardHeader className="pb-3 md:pb-4">
              <CardTitle className="text-base md:text-lg text-card-foreground">
                Recent Employee Actions
              </CardTitle>
              <CardDescription className="text-xs md:text-sm text-muted-foreground">
                Latest check-ins and check-outs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2.5 md:space-y-4">
                {stats?.recentEmployeeActions?.length > 0 ? (
                  stats.recentEmployeeActions.slice(0, 4).map((action: any) => (
                    <div
                      key={action.id}
                      className="flex items-center justify-between p-2.5 md:p-3 bg-secondary/50 rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center gap-2 md:gap-3">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            action.action === "check-in"
                              ? "bg-green-500"
                              : "bg-red-500"
                          }`}
                        />
                        <div>
                          <p className="text-sm md:text-base font-medium text-card-foreground">
                            {action.userId.firstName} {action.userId.lastName}
                          </p>
                          <p className="text-xs md:text-sm text-muted-foreground">
                            <span
                              style={{
                                color:
                                  action.action === "check-in"
                                    ? "#10B981"
                                    : "#EF4444",
                              }}
                            >
                              {action.action === "check-in"
                                ? "Checked in"
                                : "Checked out"}
                            </span>{" "}
                            at {formatTime(action.actionTime)}
                          </p>
                        </div>
                      </div>
                      {action.totalHours && (
                        <div
                          className="text-xs md:text-sm font-semibold"
                          style={{ color: colorTheme.colors.primary }}
                        >
                          {action.totalHours.toFixed(1)}h
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-6 md:py-8 text-sm">
                    No recent activity
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-3 md:pb-4">
              <CardTitle className="text-base md:text-lg text-card-foreground">
                Today's Check-in Locations
              </CardTitle>
              <CardDescription className="text-xs md:text-sm text-muted-foreground">
                Employee check-in locations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2.5 md:space-y-4">
                {stats?.mapLocations?.length > 0 ? (
                  stats.mapLocations.slice(0, 4).map((loc: any) => (
                    <div
                      key={loc.id}
                      className="flex items-start gap-2 md:gap-3 p-2.5 md:p-3 bg-secondary/50 rounded-lg hover:bg-accent transition-colors"
                    >
                      <MapPin
                        className="w-4 h-4 md:w-5 md:h-5 mt-0.5"
                        style={{ color: colorTheme.colors.primary }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm md:text-base font-medium text-card-foreground truncate">
                          {loc.userId.firstName} {loc.userId.lastName}
                        </p>
                        <p className="text-xs md:text-sm text-muted-foreground">
                          Checked in at{" "}
                          <span
                            className="font-semibold"
                            style={{ color: colorTheme.colors.primary }}
                          >
                            {formatTime(loc.checkInTime)}
                          </span>
                        </p>
                        <p className="text-[10px] md:text-xs text-muted-foreground mt-1 truncate">
                          📍 {loc.location.latitude.toFixed(4)},{" "}
                          {loc.location.longitude.toFixed(4)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-6 md:py-8 text-sm">
                    No check-in locations today
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Attendance Overview */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3 md:pb-4">
            <CardTitle className="text-base md:text-lg text-card-foreground">
              Attendance Overview
            </CardTitle>
            <CardDescription className="text-xs md:text-sm text-muted-foreground">
              Recent attendance records
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 md:space-y-3">
              {stats?.recentAttendance?.length > 0 ? (
                stats.recentAttendance.slice(0, 5).map((record: any) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-3 md:p-4 border border-border rounded-lg hover:shadow-md transition-all hover:border-primary/30"
                    style={{
                      borderLeftWidth: "4px",
                      borderLeftColor:
                        record.status === "checked-in"
                          ? colorTheme.colors.primary
                          : "#9CA3AF",
                    }}
                  >
                    <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
                      <div
                        className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full flex-shrink-0`}
                        style={{
                          backgroundColor:
                            record.status === "checked-in"
                              ? colorTheme.colors.primary
                              : "#9CA3AF",
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm md:text-base font-medium text-card-foreground truncate">
                          {record.userId.firstName} {record.userId.lastName}
                        </p>
                        <p className="text-xs md:text-sm text-muted-foreground truncate">
                          {record.userId.employeeId || record.userId.email}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p
                        className="text-xs md:text-sm font-semibold"
                        style={{
                          color:
                            record.status === "checked-in"
                              ? colorTheme.colors.primary
                              : "#10B981",
                        }}
                      >
                        {record.status === "checked-in" ? "Working" : "Done"}
                      </p>
                      <p className="text-[10px] md:text-xs text-muted-foreground whitespace-nowrap">
                        In: {formatTime(record.checkInTime)}
                      </p>
                      {record.checkOutTime && (
                        <p className="text-[10px] md:text-xs text-muted-foreground whitespace-nowrap">
                          Out: {formatTime(record.checkOutTime)}
                        </p>
                      )}
                      {record.totalHours && (
                        <p
                          className="text-[10px] md:text-xs font-semibold mt-1"
                          style={{ color: colorTheme.colors.primary }}
                        >
                          {record.totalHours.toFixed(1)}h
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-6 md:py-8 text-sm">
                  No attendance records
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
