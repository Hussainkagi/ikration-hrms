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
  ImageIcon,
  MapPin,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import CommonTable from "@/components/ui/commonTable";

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

interface Employee {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  mobileNumber?: string;
}

interface AttendanceRecord {
  id: string;
  userId: {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  date: string;
  checkInTime?: string;
  checkInLocation?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  checkInSelfie?: string;
  checkOutTime?: string;
  checkOutLocation?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  checkOutSelfie?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function EmployeeTracking() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [fetchingEmployees, setFetchingEmployees] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  function extractGoogleDriveFileId(url: string): string | null {
    const patterns = [/\/d\/([a-zA-Z0-9_-]+)/, /[?&]id=([a-zA-Z0-9_-]+)/];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }

    return null;
  }

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please login again.",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(`${BASE_URL}/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch employees");
      }

      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch employees list.",
        variant: "destructive",
      });
    } finally {
      setFetchingEmployees(false);
    }
  };

  const fetchAttendanceRecords = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please login again.",
          variant: "destructive",
        });
        return;
      }

      const params = new URLSearchParams();
      if (selectedEmployee) params.append("userId", selectedEmployee);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const queryString = params.toString();
      const url = `${BASE_URL}/attendance${
        queryString ? `?${queryString}` : ""
      }`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch attendance records");
      }

      const data = await response.json();
      setAttendanceRecords(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch attendance records.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchAttendanceRecords();
  };

  const handleReset = () => {
    setSelectedEmployee("");
    setStartDate("");
    setEndDate("");
    setAttendanceRecords([]);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      { bg: string; text: string; icon: any }
    > = {
      "checked-in": {
        bg: "bg-blue-100",
        text: "text-blue-700",
        icon: CheckCircle,
      },
      "checked-out": {
        bg: "bg-green-100",
        text: "text-green-700",
        icon: CheckCircle,
      },
      absent: {
        bg: "bg-red-100",
        text: "text-red-700",
        icon: XCircle,
      },
    };

    const config = statusConfig[status] || statusConfig["checked-in"];
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}
      >
        <Icon className="w-4 h-4" />
        {status.replace("-", " ").toUpperCase()}
      </span>
    );
  };

  const columns = [
    {
      key: "userId.firstName",
      header: "Employee",
      searchable: true,
      sortable: true,
      render: (row: AttendanceRecord) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-semibold">
            {row.userId.firstName[0]}
            {row.userId.lastName[0]}
          </div>
          <div>
            <p className="font-medium text-gray-900">
              {row.userId.firstName} {row.userId.lastName}
            </p>
            <p className="text-sm text-gray-500">{row.userId.email}</p>
          </div>
        </div>
      ),
      searchValue: (row: AttendanceRecord) =>
        `${row.userId.firstName} ${row.userId.lastName} ${row.userId.email}`,
    },
    {
      key: "date",
      header: "Date",
      searchable: true,
      sortable: true,
      render: (row: AttendanceRecord) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{formatDate(row.date)}</span>
        </div>
      ),
    },
    {
      key: "checkInTime",
      header: "Check In",
      sortable: true,
      render: (row: AttendanceRecord) => (
        <div className="space-y-1">
          {row.checkInTime ? (
            <>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="font-medium">
                  {formatTime(row.checkInTime)}
                </span>
              </div>
              {row.checkInLocation && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <MapPin className="w-3 h-3" />
                  <span>
                    {row.checkInLocation.latitude.toFixed(4)},{" "}
                    {row.checkInLocation.longitude.toFixed(4)}
                  </span>
                </div>
              )}
              {row.checkInSelfie && (
                <button
                  onClick={() => setSelectedImage(`${row.checkInSelfie}`)}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                >
                  <ImageIcon className="w-3 h-3" />
                  View Selfie
                </button>
              )}
            </>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </div>
      ),
    },
    {
      key: "checkOutTime",
      header: "Check Out",
      sortable: true,
      render: (row: AttendanceRecord) => (
        <div className="space-y-1">
          {row.checkOutTime ? (
            <>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="font-medium">
                  {formatTime(row.checkOutTime)}
                </span>
              </div>
              {row.checkOutLocation && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <MapPin className="w-3 h-3" />
                  <span>
                    {row.checkOutLocation.latitude.toFixed(4)},{" "}
                    {row.checkOutLocation.longitude.toFixed(4)}
                  </span>
                </div>
              )}
              {row.checkOutSelfie && (
                <button
                  onClick={() => setSelectedImage(`${row.checkOutSelfie}`)}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                >
                  <ImageIcon className="w-3 h-3" />
                  View Selfie
                </button>
              )}
            </>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      filterable: true,
      sortable: true,
      render: (row: AttendanceRecord) => getStatusBadge(row.status),
    },
  ];

  return (
    <>
      <Card>
        <CardContent className="space-y-4">
          {fetchingEmployees ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-orange-600" />
              <span className="ml-2 text-gray-600">Loading employees...</span>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Employee
                  </label>
                  <select
                    value={selectedEmployee}
                    onChange={(e) => setSelectedEmployee(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">All Employees</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="flex-1 md:flex-none px-6 py-4 sm:py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <User className="w-4 h-4" />
                      View Records
                    </>
                  )}
                </button>

                <button
                  onClick={handleReset}
                  disabled={loading}
                  className="px-6 py-4 sm:py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Reset
                </button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {!fetchingEmployees && (
        <div className="mt-6">
          <CommonTable
            data={attendanceRecords}
            columns={columns}
            loading={loading}
            striped={true}
            hover={true}
            showPagination={true}
            showSearch={true}
            searchPlaceholder="Search attendance records..."
            emptyMessage="No attendance records found"
            emptyIcon={<User className="w-12 h-12" />}
            perPage={10}
            sortable={true}
            showColumnToggle={true}
            showPerPageSelector={true}
            exportable={true}
            rowClickable={false}
          />
        </div>
      )}

      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Selfie</h3>
              <button
                onClick={() => setSelectedImage(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-4">
              <img
                src={`https://lh3.googleusercontent.com/d/${extractGoogleDriveFileId(
                  selectedImage
                )}=w1000?authuser=1/view`}
                alt="Employee Selfie"
                className="w-full h-auto rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
