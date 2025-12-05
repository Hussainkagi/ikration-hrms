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

// Skeleton Components
const SkeletonCard = () => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2 md:pb-2">
      <div className="h-3 w-20 md:h-4 md:w-24 bg-gray-200 rounded animate-pulse" />
      <div className="w-4 h-4 md:w-5 md:h-5 bg-gray-200 rounded animate-pulse" />
    </CardHeader>
    <CardContent className="py-2 md:py-3">
      <div className="h-7 w-12 md:h-9 md:w-16 bg-gray-200 rounded animate-pulse mb-1 md:mb-2" />
      <div className="h-2.5 w-24 md:h-3 md:w-32 bg-gray-200 rounded animate-pulse" />
    </CardContent>
  </Card>
);

const SkeletonRecentActivity = () => (
  <Card>
    <CardHeader className="pb-3 md:pb-4">
      <div className="h-5 w-40 md:h-6 md:w-48 bg-gray-200 rounded animate-pulse mb-1.5 md:mb-2" />
      <div className="h-3 w-28 md:h-4 md:w-36 bg-gray-200 rounded animate-pulse" />
    </CardHeader>
    <CardContent>
      <div className="space-y-2.5 md:space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between p-2.5 md:p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center gap-2 md:gap-3 flex-1">
              <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse" />
              <div className="flex-1 space-y-1.5 md:space-y-2">
                <div className="h-3.5 w-24 md:h-4 md:w-32 bg-gray-200 rounded animate-pulse" />
                <div className="h-2.5 w-32 md:h-3 md:w-40 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
            <div className="h-3.5 w-10 md:h-4 md:w-12 bg-gray-200 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const SkeletonAttendanceOverview = () => (
  <Card>
    <CardHeader className="pb-3 md:pb-4">
      <div className="h-5 w-40 md:h-6 md:w-48 bg-gray-200 rounded animate-pulse mb-1.5 md:mb-2" />
      <div className="h-3 w-28 md:h-4 md:w-36 bg-gray-200 rounded animate-pulse" />
    </CardHeader>
    <CardContent>
      <div className="space-y-2 md:space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between p-3 md:p-4 border border-gray-200 rounded-lg"
          >
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-gray-300 rounded-full animate-pulse" />
              <div className="space-y-1.5 md:space-y-2">
                <div className="h-3.5 w-24 md:h-4 md:w-32 bg-gray-200 rounded animate-pulse" />
                <div className="h-2.5 w-32 md:h-3 md:w-40 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
            <div className="space-y-1.5 md:space-y-2">
              <div className="h-3.5 w-16 md:h-4 md:w-20 bg-gray-200 rounded animate-pulse ml-auto" />
              <div className="h-2.5 w-24 md:h-3 md:w-32 bg-gray-200 rounded animate-pulse" />
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
            <div className="h-7 w-40 md:h-9 md:w-48 bg-gray-200 rounded animate-pulse mb-1.5 md:mb-2" />
            <div className="h-3 w-56 md:h-4 md:w-72 bg-gray-200 rounded animate-pulse" />
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
          <div className="text-red-500">Error: {error}</div>
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
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Dashboard
          </h1>
          <p className="text-sm md:text-base text-gray-500 mt-1">
            Overview of employee attendance and tracking
          </p>
        </div>

        {/* Stats Cards - 2 columns on mobile, 4 on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 md:pb-2 px-4 pt-4 md:px-6 md:pt-6">
              <CardTitle className="text-xs md:text-sm font-medium text-gray-600">
                Total Employees
              </CardTitle>
              <Users className="w-4 h-4 md:w-5 md:h-5 text-orange-600" />
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0 md:px-6 md:pb-6">
              <div className="text-2xl md:text-3xl font-bold text-gray-900">
                {stats?.users?.total || 0}
              </div>
              <p className="text-[10px] md:text-xs text-gray-500 mt-1">
                {stats?.users?.admins || 0} admins,{" "}
                {stats?.users?.employees || 0} employees
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 md:pb-2 px-4 pt-4 md:px-6 md:pt-6">
              <CardTitle className="text-xs md:text-sm font-medium text-gray-600">
                Checked In
              </CardTitle>
              <UserCheck className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0 md:px-6 md:pb-6">
              <div className="text-2xl md:text-3xl font-bold text-gray-900">
                {stats?.attendance?.today?.checkedIn || 0}
              </div>
              <p className="text-[10px] md:text-xs text-gray-500 mt-1">
                {attendanceRate}% attendance
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 md:pb-2 px-4 pt-4 md:px-6 md:pt-6">
              <CardTitle className="text-xs md:text-sm font-medium text-gray-600">
                Checked Out
              </CardTitle>
              <UserX className="w-4 h-4 md:w-5 md:h-5 text-red-600" />
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0 md:px-6 md:pb-6">
              <div className="text-2xl md:text-3xl font-bold text-gray-900">
                {stats?.attendance?.today?.checkedOut || 0}
              </div>
              <p className="text-[10px] md:text-xs text-gray-500 mt-1">
                {stats?.attendance?.today?.pending || 0} working
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 md:pb-2 px-4 pt-4 md:px-6 md:pt-6">
              <CardTitle className="text-xs md:text-sm font-medium text-gray-600">
                Avg Hours
              </CardTitle>
              <Clock className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0 md:px-6 md:pb-6">
              <div className="text-2xl md:text-3xl font-bold text-gray-900">
                {stats?.attendance?.averageHours?.toFixed(1) || 0}h
              </div>
              <p className="text-[10px] md:text-xs text-gray-500 mt-1">
                Daily average
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <Card>
            <CardHeader className="pb-3 md:pb-4">
              <CardTitle className="text-base md:text-lg">
                Recent Employee Actions
              </CardTitle>
              <CardDescription className="text-xs md:text-sm">
                Latest check-ins and check-outs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2.5 md:space-y-4">
                {stats?.recentEmployeeActions?.length > 0 ? (
                  stats.recentEmployeeActions.slice(0, 4).map((action: any) => (
                    <div
                      key={action.id}
                      className="flex items-center justify-between p-2.5 md:p-3 bg-gray-50 rounded-lg"
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
                          <p className="text-sm md:text-base font-medium text-gray-900">
                            {action.userId.firstName} {action.userId.lastName}
                          </p>
                          <p className="text-xs md:text-sm text-gray-500">
                            {action.action === "check-in"
                              ? "Checked in"
                              : "Checked out"}{" "}
                            at {formatTime(action.actionTime)}
                          </p>
                        </div>
                      </div>
                      {action.totalHours && (
                        <div className="text-xs md:text-sm text-gray-600">
                          {action.totalHours.toFixed(1)}h
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-6 md:py-8 text-sm">
                    No recent activity
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 md:pb-4">
              <CardTitle className="text-base md:text-lg">
                Today's Check-in Locations
              </CardTitle>
              <CardDescription className="text-xs md:text-sm">
                Employee check-in locations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2.5 md:space-y-4">
                {stats?.mapLocations?.length > 0 ? (
                  stats.mapLocations.slice(0, 4).map((loc: any) => (
                    <div
                      key={loc.id}
                      className="flex items-start gap-2 md:gap-3 p-2.5 md:p-3 bg-gray-50 rounded-lg"
                    >
                      <MapPin className="w-4 h-4 md:w-5 md:h-5 text-orange-600 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm md:text-base font-medium text-gray-900 truncate">
                          {loc.userId.firstName} {loc.userId.lastName}
                        </p>
                        <p className="text-xs md:text-sm text-gray-500">
                          Checked in at {formatTime(loc.checkInTime)}
                        </p>
                        <p className="text-[10px] md:text-xs text-gray-400 mt-1 truncate">
                          {loc.location.latitude.toFixed(4)},{" "}
                          {loc.location.longitude.toFixed(4)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-6 md:py-8 text-sm">
                    No check-in locations today
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Attendance Overview */}
        <Card>
          <CardHeader className="pb-3 md:pb-4">
            <CardTitle className="text-base md:text-lg">
              Attendance Overview
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Recent attendance records
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 md:space-y-3">
              {stats?.recentAttendance?.length > 0 ? (
                stats.recentAttendance.slice(0, 5).map((record: any) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-3 md:p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
                      <div
                        className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full flex-shrink-0 ${
                          record.status === "checked-in"
                            ? "bg-green-500"
                            : "bg-gray-400"
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm md:text-base font-medium text-gray-900 truncate">
                          {record.userId.firstName} {record.userId.lastName}
                        </p>
                        <p className="text-xs md:text-sm text-gray-500 truncate">
                          {record.userId.employeeId || record.userId.email}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className="text-xs md:text-sm font-medium text-gray-900">
                        {record.status === "checked-in" ? "Working" : "Done"}
                      </p>
                      <p className="text-[10px] md:text-xs text-gray-500 whitespace-nowrap">
                        In: {formatTime(record.checkInTime)}
                      </p>
                      {record.checkOutTime && (
                        <p className="text-[10px] md:text-xs text-gray-500 whitespace-nowrap">
                          Out: {formatTime(record.checkOutTime)}
                        </p>
                      )}
                      {record.totalHours && (
                        <p className="text-[10px] md:text-xs text-gray-600 mt-1">
                          {record.totalHours.toFixed(1)}h
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-6 md:py-8 text-sm">
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
