"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  LogIn,
  LogOut,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Download,
  Search,
  Activity,
  XCircle,
} from "lucide-react";

interface EmployeeCheckInOut {
  empNo: string;
  name: string;
  shift: string;
  checkInPercentage: number;
  checkInCount: number;
  checkInEligibleDays: number;
  checkOutPercentage: number;
  checkOutCount: number;
  checkOutEligibleDays: number;
}

interface CheckInOutData {
  employees: EmployeeCheckInOut[];
}

interface CheckInOutReportProps {
  data: CheckInOutData;
}

export default function CheckInOutReport({ data }: CheckInOutReportProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"checkIn" | "checkOut" | "name">(
    "checkIn"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Filter employees
  const filteredEmployees = data.employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.empNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.shift.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort employees
  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    let comparison = 0;
    if (sortBy === "checkIn") {
      comparison = a.checkInPercentage - b.checkInPercentage;
    } else if (sortBy === "checkOut") {
      comparison = a.checkOutPercentage - b.checkOutPercentage;
    } else {
      comparison = a.name.localeCompare(b.name);
    }
    return sortOrder === "asc" ? comparison : -comparison;
  });

  // Calculate overall stats
  const totalCheckInEligible = data.employees.reduce(
    (acc, emp) => acc + emp.checkInEligibleDays,
    0
  );
  const totalCheckInCount = data.employees.reduce(
    (acc, emp) => acc + emp.checkInCount,
    0
  );
  const totalCheckOutEligible = data.employees.reduce(
    (acc, emp) => acc + emp.checkOutEligibleDays,
    0
  );
  const totalCheckOutCount = data.employees.reduce(
    (acc, emp) => acc + emp.checkOutCount,
    0
  );

  const overallCheckInPercentage =
    totalCheckInEligible > 0
      ? ((totalCheckInCount / totalCheckInEligible) * 100).toFixed(1)
      : "0";
  const overallCheckOutPercentage =
    totalCheckOutEligible > 0
      ? ((totalCheckOutCount / totalCheckOutEligible) * 100).toFixed(1)
      : "0";

  // Get compliance status
  const getComplianceStatus = (percentage: number) => {
    if (percentage >= 95) return { label: "Excellent", color: "green" };
    if (percentage >= 85) return { label: "Good", color: "blue" };
    if (percentage >= 70) return { label: "Fair", color: "yellow" };
    if (percentage >= 50) return { label: "Poor", color: "orange" };
    return { label: "Critical", color: "red" };
  };

  // Get missing count
  const getMissingCheckIns = (emp: EmployeeCheckInOut) => {
    return emp.checkInEligibleDays - emp.checkInCount;
  };

  const getMissingCheckOuts = (emp: EmployeeCheckInOut) => {
    return emp.checkOutEligibleDays - emp.checkOutCount;
  };

  const exportToCSV = () => {
    const headers = [
      "Emp No",
      "Name",
      "Shift",
      "Check-In %",
      "Check-Ins",
      "Eligible Days",
      "Missing Check-Ins",
      "Check-Out %",
      "Check-Outs",
      "Eligible Days",
      "Missing Check-Outs",
    ];

    const rows = data.employees.map((emp) => [
      emp.empNo,
      emp.name,
      emp.shift,
      emp.checkInPercentage.toFixed(1) + "%",
      emp.checkInCount,
      emp.checkInEligibleDays,
      getMissingCheckIns(emp),
      emp.checkOutPercentage.toFixed(1) + "%",
      emp.checkOutCount,
      emp.checkOutEligibleDays,
      getMissingCheckOuts(emp),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `checkinout_report_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8 text-orange-600" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Check-In/Out Ratio Report
                </h2>
                <p className="text-sm text-gray-500">
                  {data.employees.length} employees • Attendance compliance
                  tracking
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 w-full sm:w-64"
                />
              </div>

              <button
                onClick={exportToCSV}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>

          {/* Overall Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <LogIn className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-900">
                  Check-In Rate
                </span>
              </div>
              <p className="text-3xl font-bold text-green-900">
                {overallCheckInPercentage}%
              </p>
              <p className="text-xs text-green-600 mt-1">
                {totalCheckInCount} / {totalCheckInEligible} days
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <LogOut className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  Check-Out Rate
                </span>
              </div>
              <p className="text-3xl font-bold text-blue-900">
                {overallCheckOutPercentage}%
              </p>
              <p className="text-xs text-blue-600 mt-1">
                {totalCheckOutCount} / {totalCheckOutEligible} days
              </p>
            </div>

            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium text-orange-700">
                  Missing Check-Ins
                </span>
              </div>
              <p className="text-3xl font-bold text-orange-900">
                {totalCheckInEligible - totalCheckInCount}
              </p>
            </div>

            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <span className="text-sm font-medium text-red-700">
                  Missing Check-Outs
                </span>
              </div>
              <p className="text-3xl font-bold text-red-900">
                {totalCheckOutEligible - totalCheckOutCount}
              </p>
            </div>
          </div>

          {/* Sort Controls */}
          <div className="flex gap-3 mt-6 flex-wrap">
            <button
              onClick={() => {
                setSortBy("checkIn");
                setSortOrder(
                  sortBy === "checkIn" && sortOrder === "desc" ? "asc" : "desc"
                );
              }}
              className={`px-4 py-2 rounded-lg border font-medium transition-colors ${
                sortBy === "checkIn"
                  ? "bg-orange-600 text-white border-orange-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              Sort by Check-In{" "}
              {sortBy === "checkIn" && (sortOrder === "desc" ? "↓" : "↑")}
            </button>
            <button
              onClick={() => {
                setSortBy("checkOut");
                setSortOrder(
                  sortBy === "checkOut" && sortOrder === "desc" ? "asc" : "desc"
                );
              }}
              className={`px-4 py-2 rounded-lg border font-medium transition-colors ${
                sortBy === "checkOut"
                  ? "bg-orange-600 text-white border-orange-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              Sort by Check-Out{" "}
              {sortBy === "checkOut" && (sortOrder === "desc" ? "↓" : "↑")}
            </button>
            <button
              onClick={() => {
                setSortBy("name");
                setSortOrder(
                  sortBy === "name" && sortOrder === "desc" ? "asc" : "desc"
                );
              }}
              className={`px-4 py-2 rounded-lg border font-medium transition-colors ${
                sortBy === "name"
                  ? "bg-orange-600 text-white border-orange-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              Sort by Name{" "}
              {sortBy === "name" && (sortOrder === "desc" ? "↓" : "↑")}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Employee Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedEmployees.map((employee) => {
          const checkInStatus = getComplianceStatus(employee.checkInPercentage);
          const checkOutStatus = getComplianceStatus(
            employee.checkOutPercentage
          );
          const missingCheckIns = getMissingCheckIns(employee);
          const missingCheckOuts = getMissingCheckOuts(employee);

          const statusColors = {
            green: {
              bg: "bg-green-100",
              text: "text-green-700",
              border: "border-green-200",
            },
            blue: {
              bg: "bg-blue-100",
              text: "text-blue-700",
              border: "border-blue-200",
            },
            yellow: {
              bg: "bg-yellow-100",
              text: "text-yellow-700",
              border: "border-yellow-200",
            },
            orange: {
              bg: "bg-orange-100",
              text: "text-orange-700",
              border: "border-orange-200",
            },
            red: {
              bg: "bg-red-100",
              text: "text-red-700",
              border: "border-red-200",
            },
          };

          // Use the worse status for the badge
          const overallStatus =
            employee.checkInPercentage < employee.checkOutPercentage
              ? checkInStatus
              : checkOutStatus;
          const colors =
            statusColors[overallStatus.color as keyof typeof statusColors];

          return (
            <Card
              key={employee.empNo}
              className="hover:shadow-lg transition-all duration-300"
            >
              <CardContent className="p-6">
                {/* Employee Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-lg">
                      {employee.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">
                        {employee.name}
                      </h3>
                      <p className="text-sm text-gray-500">{employee.empNo}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Activity className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-600">
                          {employee.shift}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="text-right">
                    <div
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${colors.bg} ${colors.text} ${colors.border} border`}
                    >
                      {overallStatus.label === "Excellent" && (
                        <CheckCircle className="w-3 h-3" />
                      )}
                      {overallStatus.label === "Critical" && (
                        <AlertCircle className="w-3 h-3" />
                      )}
                      {overallStatus.label}
                    </div>
                  </div>
                </div>

                {/* Check-In Section */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <LogIn className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-gray-700">
                        Check-In Compliance
                      </span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      {employee.checkInPercentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${
                        employee.checkInPercentage >= 95
                          ? "bg-green-500"
                          : employee.checkInPercentage >= 85
                          ? "bg-blue-500"
                          : employee.checkInPercentage >= 70
                          ? "bg-yellow-500"
                          : employee.checkInPercentage >= 50
                          ? "bg-orange-500"
                          : "bg-red-500"
                      }`}
                      style={{
                        width: `${Math.min(employee.checkInPercentage, 100)}%`,
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center mt-1 text-xs text-gray-500">
                    <span>
                      {employee.checkInCount} / {employee.checkInEligibleDays}{" "}
                      days
                    </span>
                    {missingCheckIns > 0 && (
                      <span className="text-red-600 font-medium">
                        -{missingCheckIns} missing
                      </span>
                    )}
                  </div>
                </div>

                {/* Check-Out Section */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <LogOut className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-gray-700">
                        Check-Out Compliance
                      </span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      {employee.checkOutPercentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${
                        employee.checkOutPercentage >= 95
                          ? "bg-green-500"
                          : employee.checkOutPercentage >= 85
                          ? "bg-blue-500"
                          : employee.checkOutPercentage >= 70
                          ? "bg-yellow-500"
                          : employee.checkOutPercentage >= 50
                          ? "bg-orange-500"
                          : "bg-red-500"
                      }`}
                      style={{
                        width: `${Math.min(employee.checkOutPercentage, 100)}%`,
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center mt-1 text-xs text-gray-500">
                    <span>
                      {employee.checkOutCount} / {employee.checkOutEligibleDays}{" "}
                      days
                    </span>
                    {missingCheckOuts > 0 && (
                      <span className="text-red-600 font-medium">
                        -{missingCheckOuts} missing
                      </span>
                    )}
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-200">
                  <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-xs font-medium text-green-700">
                        Check-Ins
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-green-900">
                      {employee.checkInCount}
                    </p>
                    <p className="text-xs text-green-600">
                      of {employee.checkInEligibleDays}
                    </p>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-medium text-blue-700">
                        Check-Outs
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-blue-900">
                      {employee.checkOutCount}
                    </p>
                    <p className="text-xs text-blue-600">
                      of {employee.checkOutEligibleDays}
                    </p>
                  </div>
                </div>

                {/* Alerts for missing records */}
                {(missingCheckIns > 0 || missingCheckOuts > 0) && (
                  <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="text-xs text-amber-800">
                        {missingCheckIns > 0 && (
                          <p>• {missingCheckIns} missing check-in(s)</p>
                        )}
                        {missingCheckOuts > 0 && (
                          <p>• {missingCheckOuts} missing check-out(s)</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {sortedEmployees.length === 0 && (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No employees found
              </h3>
              <p className="text-gray-500">
                Try adjusting your search criteria
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
