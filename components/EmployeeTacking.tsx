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
  FileText,
  CalendarDays,
  Globe,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import CommonTable from "@/components/ui/commonTable";
import AttendanceDetailedReport from "@/components/reportingComponents/AttendenceDetailed";
import HeadcountReport from "@/components/reportingComponents/HeadCountReport";
import PunctualityReport from "@/components/reportingComponents/PunctualityRatio";
import WorkingHoursReport from "@/components/reportingComponents/WorkingHoursReport";
import CheckInOutReport from "@/components/reportingComponents/CheckinoutRatio";
import { useTheme } from "@/contexts/theme-context";

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

interface OrganizationProfile {
  id: string;
  orgId: string;
  companyName: string;
  officeAddress: string;
  latitude: number;
  longitude: number;
  radius: number;
  country: string;
  timezone: string;
  workStartTime: string;
  workEndTime: string;
  weeklyOffDays: string[];
  agreementAccepted: boolean;
  agreementAcceptedAt: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

type ReportType =
  | "casual"
  | "detailed"
  | "headcount"
  | "punctuality"
  | "workinghours"
  | "checkinout";

export default function EmployeeTracking() {
  const { colorTheme } = useTheme();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [reportType, setReportType] = useState<ReportType>("casual");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [organizationTimezone, setOrganizationTimezone] = useState<string>("");
  const [organizationProfile, setOrganizationProfile] =
    useState<OrganizationProfile | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);
  const [detailedReportData, setDetailedReportData] = useState<any>(null);
  const [headcountData, setHeadcountData] = useState<any>(null);
  const [punctualityData, setPunctualityData] = useState<any>(null);
  const [workingHoursData, setWorkingHoursData] = useState<any>(null);
  const [checkInOutData, setCheckInOutData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingEmployees, setFetchingEmployees] = useState(true);
  const [fetchingOrgProfile, setFetchingOrgProfile] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Fetch organization profile on component mount
  useEffect(() => {
    fetchOrganizationProfile();
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

  const fetchOrganizationProfile = async () => {
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

      const response = await fetch(`${BASE_URL}/organization/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch organization profile");
      }

      const data: OrganizationProfile = await response.json();
      setOrganizationProfile(data);
      setOrganizationTimezone(data.timezone);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch organization profile.",
        variant: "destructive",
      });
    } finally {
      setFetchingOrgProfile(false);
    }
  };

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
      if (organizationTimezone) params.append("timezone", organizationTimezone);

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

  const fetchDetailedReport = async () => {
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
      if (selectedEmployee) params.append("employeeId", selectedEmployee);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      if (organizationTimezone) params.append("timezone", organizationTimezone);

      const queryString = params.toString();
      const url = `${BASE_URL}/attendance-reports/detailed${
        queryString ? `?${queryString}` : ""
      }`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch detailed report");
      }

      const data = await response.json();
      setDetailedReportData(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch detailed attendance report.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchHeadcountReport = async () => {
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
      if (selectedEmployee) params.append("employeeId", selectedEmployee);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      if (organizationTimezone) params.append("timezone", organizationTimezone);

      const queryString = params.toString();
      const url = `${BASE_URL}/attendance-reports/headcount${
        queryString ? `?${queryString}` : ""
      }`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch headcount report");
      }

      const data = await response.json();
      setHeadcountData(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch headcount report.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPunctualityReport = async () => {
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
      if (selectedEmployee) params.append("employeeId", selectedEmployee);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      if (organizationTimezone) params.append("timezone", organizationTimezone);

      const queryString = params.toString();
      const url = `${BASE_URL}/attendance-reports/punctuality-ratio${
        queryString ? `?${queryString}` : ""
      }`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch punctuality report");
      }

      const data = await response.json();
      setPunctualityData(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch punctuality report.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkingHoursReport = async () => {
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
      if (selectedEmployee) params.append("employeeId", selectedEmployee);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      if (organizationTimezone) params.append("timezone", organizationTimezone);

      const queryString = params.toString();
      const url = `${BASE_URL}/attendance-reports/working-hours${
        queryString ? `?${queryString}` : ""
      }`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch working hours report");
      }

      const data = await response.json();
      setWorkingHoursData(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch working hours report.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCheckInOutReport = async () => {
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
      if (selectedEmployee) params.append("employeeId", selectedEmployee);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      if (organizationTimezone) params.append("timezone", organizationTimezone);

      const queryString = params.toString();
      const url = `${BASE_URL}/attendance-reports/check-in-out-ratio${
        queryString ? `?${queryString}` : ""
      }`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch check-in/out report");
      }

      const data = await response.json();
      setCheckInOutData(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch check-in/out report.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (reportType === "casual") {
      fetchAttendanceRecords();
    } else if (reportType === "detailed") {
      fetchDetailedReport();
    } else if (reportType === "headcount") {
      fetchHeadcountReport();
    } else if (reportType === "punctuality") {
      fetchPunctualityReport();
    } else if (reportType === "workinghours") {
      fetchWorkingHoursReport();
    } else if (reportType === "checkinout") {
      fetchCheckInOutReport();
    }
  };

  const handleReset = () => {
    setSelectedEmployee("");
    setStartDate("");
    setEndDate("");
    setAttendanceRecords([]);
    setDetailedReportData(null);
    setHeadcountData(null);
    setPunctualityData(null);
    setWorkingHoursData(null);
    setCheckInOutData(null);
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
        bg: "bg-blue-100 dark:bg-blue-900/30",
        text: "text-blue-700 dark:text-blue-400",
        icon: CheckCircle,
      },
      "checked-out": {
        bg: "bg-green-100 dark:bg-green-900/30",
        text: "text-green-700 dark:text-green-400",
        icon: CheckCircle,
      },
      absent: {
        bg: "bg-red-100 dark:bg-red-900/30",
        text: "text-red-700 dark:text-red-400",
        icon: XCircle,
      },
      "comp-off": {
        bg: "bg-purple-100 dark:bg-purple-900/30",
        text: "text-purple-700 dark:text-purple-400",
        icon: Calendar,
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
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center font-semibold"
            style={{
              backgroundColor: `${colorTheme.colors.primary}20`,
              color: colorTheme.colors.primary,
            }}
          >
            {row.userId.firstName[0]}
            {row.userId.lastName[0]}
          </div>
          <div>
            <p className="font-medium text-foreground">
              {row.userId.firstName} {row.userId.lastName}
            </p>
            <p className="text-sm text-muted-foreground">{row.userId.email}</p>
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
          <Calendar className="w-4 h-4 text-muted-foreground" />
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
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{row.checkInTime}</span>
              </div>
              {row.checkInLocation && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
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
                  className="flex items-center gap-1 text-xs hover:underline"
                  style={{ color: colorTheme.colors.primary }}
                >
                  <ImageIcon className="w-3 h-3" />
                  View Selfie
                </button>
              )}
            </>
          ) : (
            <span className="text-muted-foreground">-</span>
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
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{row.checkOutTime}</span>
              </div>
              {row.checkOutLocation && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
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
                  className="flex items-center gap-1 text-xs hover:underline"
                  style={{ color: colorTheme.colors.primary }}
                >
                  <ImageIcon className="w-3 h-3" />
                  View Selfie
                </button>
              )}
            </>
          ) : (
            <span className="text-muted-foreground">-</span>
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

  const isDataLoading = fetchingEmployees || fetchingOrgProfile;

  return (
    <>
      <Card className="bg-card border-border">
        <CardContent className="space-y-4">
          {isDataLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2
                className="w-6 h-6 animate-spin"
                style={{ color: colorTheme.colors.primary }}
              />
              <span className="ml-2 text-muted-foreground">
                Loading data...
              </span>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Select Employee
                  </label>
                  <select
                    value={selectedEmployee}
                    onChange={(e) => setSelectedEmployee(e.target.value)}
                    className="w-full px-3 py-2 border border-border bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 ring-primary"
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
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Report Type
                  </label>
                  <select
                    value={reportType}
                    onChange={(e) => {
                      setReportType(e.target.value as ReportType);
                      setAttendanceRecords([]);
                      setDetailedReportData(null);
                      setHeadcountData(null);
                      setPunctualityData(null);
                      setWorkingHoursData(null);
                      setCheckInOutData(null);
                    }}
                    className="w-full px-3 py-2 border border-border bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 ring-primary"
                  >
                    <option value="casual">Casual Report</option>
                    <option value="detailed">Attendance Detailed Report</option>
                    <option value="headcount">HeadCount Report</option>
                    <option value="punctuality">Punctuality Ratio</option>
                    <option value="workinghours">Working Hours</option>
                    <option value="checkinout">Check-In/Out Ratio</option>
                  </select>
                </div>

                {/* <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    <Globe className="w-4 h-4 inline mr-1" />
                    Timezone
                  </label>
                  <div className="w-full px-3 py-2 border border-border bg-muted text-foreground rounded-lg cursor-not-allowed opacity-75">
                    {organizationTimezone || "Loading..."}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Organization timezone (read-only)
                  </p>
                </div> */}

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-border bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-border bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    <Globe className="w-4 h-4 inline mr-1" />
                    Timezone
                  </label>
                  <div className="w-full px-3 py-2   text-foreground rounded-lg cursor-not-allowed opacity-75">
                    {organizationTimezone || "Loading..."}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="flex-1 md:flex-none px-6 py-4 sm:py-2 btn-primary font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      {reportType === "casual" ? (
                        <FileText className="w-4 h-4" />
                      ) : (
                        <CalendarDays className="w-4 h-4" />
                      )}
                      View Records
                    </>
                  )}
                </button>

                <button
                  onClick={handleReset}
                  disabled={loading}
                  className="px-6 py-4 sm:py-2 bg-secondary hover:bg-secondary/80 text-foreground font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Reset
                </button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {!isDataLoading && reportType === "casual" && (
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

      {!isDataLoading && reportType === "detailed" && detailedReportData && (
        <div className="mt-6">
          <AttendanceDetailedReport data={detailedReportData} />
        </div>
      )}

      {!isDataLoading && reportType === "headcount" && headcountData && (
        <div className="mt-6">
          <HeadcountReport data={headcountData} />
        </div>
      )}

      {!isDataLoading && reportType === "punctuality" && punctualityData && (
        <div className="mt-6">
          <PunctualityReport data={punctualityData} />
        </div>
      )}

      {!isDataLoading && reportType === "workinghours" && workingHoursData && (
        <div className="mt-6">
          <WorkingHoursReport data={workingHoursData} />
        </div>
      )}

      {!isDataLoading && reportType === "checkinout" && checkInOutData && (
        <div className="mt-6">
          <CheckInOutReport data={checkInOutData} />
        </div>
      )}

      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative bg-card border border-border rounded-2xl shadow-2xl max-w-3xl w-full mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="flex items-center justify-between p-4 border-b"
              style={{ borderColor: `${colorTheme.colors.primary}30` }}
            >
              <h3
                className="text-lg font-bold"
                style={{ color: colorTheme.colors.primary }}
              >
                Selfie
              </h3>
              <button
                onClick={() => setSelectedImage(null)}
                className="p-2 hover:bg-secondary rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <div className="p-4">
              <img
                src={`https://lh3.googleusercontent.com/d/${extractGoogleDriveFileId(
                  selectedImage,
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
