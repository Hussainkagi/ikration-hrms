"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Clock,
  TrendingUp,
  Timer,
  Calendar,
  Award,
  AlertTriangle,
  Download,
  Search,
  Zap,
  BarChart3,
} from "lucide-react";

interface EmployeeWorkingHours {
  empNo: string;
  name: string;
  shift: string;
  shiftHoursPercentage: number;
  shiftHoursCompleted: number;
  shiftHoursScheduled: number;
  overtimePercentage: number;
  overtimeMinutes: number;
  totalWorkedMinutes: number;
}

interface WorkingHoursData {
  employees: EmployeeWorkingHours[];
}

interface WorkingHoursReportProps {
  data: WorkingHoursData;
}

export default function WorkingHoursReport({ data }: WorkingHoursReportProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"completion" | "overtime" | "name">(
    "completion"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Convert minutes to hours and minutes
  const formatMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return { hours, mins };
  };

  // Convert minutes to readable format
  const formatTime = (minutes: number) => {
    const { hours, mins } = formatMinutes(minutes);
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

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
    if (sortBy === "completion") {
      comparison = a.shiftHoursPercentage - b.shiftHoursPercentage;
    } else if (sortBy === "overtime") {
      comparison = a.overtimeMinutes - b.overtimeMinutes;
    } else {
      comparison = a.name.localeCompare(b.name);
    }
    return sortOrder === "asc" ? comparison : -comparison;
  });

  // Calculate overall stats
  const totalScheduled = data.employees.reduce(
    (acc, emp) => acc + emp.shiftHoursScheduled,
    0
  );
  const totalCompleted = data.employees.reduce(
    (acc, emp) => acc + emp.shiftHoursCompleted,
    0
  );
  const totalWorked = data.employees.reduce(
    (acc, emp) => acc + emp.totalWorkedMinutes,
    0
  );
  const totalOvertime = data.employees.reduce(
    (acc, emp) => acc + emp.overtimeMinutes,
    0
  );
  const overallCompletionRate =
    totalScheduled > 0
      ? ((totalCompleted / totalScheduled) * 100).toFixed(1)
      : "0";

  // Get performance status
  const getPerformanceStatus = (percentage: number) => {
    if (percentage >= 100) return { label: "Complete", color: "green" };
    if (percentage >= 90) return { label: "Excellent", color: "blue" };
    if (percentage >= 75) return { label: "Good", color: "yellow" };
    if (percentage >= 50) return { label: "Fair", color: "orange" };
    return { label: "Below Target", color: "red" };
  };

  const exportToCSV = () => {
    const headers = [
      "Emp No",
      "Name",
      "Shift",
      "Shift Hours %",
      "Hours Completed",
      "Hours Scheduled",
      "Overtime %",
      "Overtime (Hours)",
      "Total Worked (Hours)",
    ];

    const rows = data.employees.map((emp) => [
      emp.empNo,
      emp.name,
      emp.shift,
      emp.shiftHoursPercentage.toFixed(1) + "%",
      formatTime(emp.shiftHoursCompleted),
      formatTime(emp.shiftHoursScheduled),
      emp.overtimePercentage.toFixed(1) + "%",
      formatTime(emp.overtimeMinutes),
      formatTime(emp.totalWorkedMinutes),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `working_hours_report_${
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
              <Clock className="w-8 h-8 text-orange-600" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Working Hours Report
                </h2>
                <p className="text-sm text-gray-500">
                  {data.employees.length} employees • {formatTime(totalWorked)}{" "}
                  total worked
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
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium text-orange-900">
                  Completion Rate
                </span>
              </div>
              <p className="text-3xl font-bold text-orange-900">
                {overallCompletionRate}%
              </p>
              <p className="text-xs text-orange-600 mt-1">
                {formatTime(totalCompleted)} / {formatTime(totalScheduled)}
              </p>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">
                  Hours Scheduled
                </span>
              </div>
              <p className="text-3xl font-bold text-blue-900">
                {formatTime(totalScheduled)}
              </p>
            </div>

            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <Timer className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-700">
                  Hours Worked
                </span>
              </div>
              <p className="text-3xl font-bold text-green-900">
                {formatTime(totalWorked)}
              </p>
            </div>

            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-700">
                  Total Overtime
                </span>
              </div>
              <p className="text-3xl font-bold text-purple-900">
                {formatTime(totalOvertime)}
              </p>
            </div>
          </div>

          {/* Sort Controls */}
          <div className="flex gap-3 mt-6 flex-wrap">
            <button
              onClick={() => {
                setSortBy("completion");
                setSortOrder(
                  sortBy === "completion" && sortOrder === "desc"
                    ? "asc"
                    : "desc"
                );
              }}
              className={`px-4 py-2 rounded-lg border font-medium transition-colors ${
                sortBy === "completion"
                  ? "bg-orange-600 text-white border-orange-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              Sort by Completion{" "}
              {sortBy === "completion" && (sortOrder === "desc" ? "↓" : "↑")}
            </button>
            <button
              onClick={() => {
                setSortBy("overtime");
                setSortOrder(
                  sortBy === "overtime" && sortOrder === "desc" ? "asc" : "desc"
                );
              }}
              className={`px-4 py-2 rounded-lg border font-medium transition-colors ${
                sortBy === "overtime"
                  ? "bg-orange-600 text-white border-orange-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              Sort by Overtime{" "}
              {sortBy === "overtime" && (sortOrder === "desc" ? "↓" : "↑")}
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
          const status = getPerformanceStatus(employee.shiftHoursPercentage);
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
          const colors =
            statusColors[status.color as keyof typeof statusColors];

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
                        <Clock className="w-3 h-3 text-gray-400" />
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
                      {status.label === "Complete" && (
                        <Award className="w-3 h-3" />
                      )}
                      {status.label === "Below Target" && (
                        <AlertTriangle className="w-3 h-3" />
                      )}
                      {status.label}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Shift Completion
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      {employee.shiftHoursPercentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${
                        employee.shiftHoursPercentage >= 100
                          ? "bg-green-500"
                          : employee.shiftHoursPercentage >= 90
                          ? "bg-blue-500"
                          : employee.shiftHoursPercentage >= 75
                          ? "bg-yellow-500"
                          : employee.shiftHoursPercentage >= 50
                          ? "bg-orange-500"
                          : "bg-red-500"
                      }`}
                      style={{
                        width: `${Math.min(
                          employee.shiftHoursPercentage,
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center mt-1 text-xs text-gray-500">
                    <span>{formatTime(employee.shiftHoursCompleted)}</span>
                    <span>{formatTime(employee.shiftHoursScheduled)}</span>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-medium text-blue-700">
                        Scheduled
                      </span>
                    </div>
                    <p className="text-lg font-bold text-blue-900">
                      {formatTime(employee.shiftHoursScheduled)}
                    </p>
                  </div>

                  <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Timer className="w-4 h-4 text-green-600" />
                      <span className="text-xs font-medium text-green-700">
                        Worked
                      </span>
                    </div>
                    <p className="text-lg font-bold text-green-900">
                      {formatTime(employee.totalWorkedMinutes)}
                    </p>
                  </div>

                  {employee.overtimeMinutes > 0 && (
                    <>
                      <div className="bg-purple-50 rounded-lg p-3 border border-purple-200 col-span-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-purple-600" />
                            <span className="text-xs font-medium text-purple-700">
                              Overtime
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-purple-900">
                              {formatTime(employee.overtimeMinutes)}
                            </p>
                            <p className="text-xs text-purple-600">
                              {employee.overtimePercentage.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Summary */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Efficiency
                    </span>
                    <span
                      className={`font-bold ${
                        employee.shiftHoursPercentage >= 100
                          ? "text-green-600"
                          : employee.shiftHoursPercentage >= 90
                          ? "text-blue-600"
                          : employee.shiftHoursPercentage >= 75
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
                      {employee.shiftHoursPercentage >= 100
                        ? "Target Met ✓"
                        : employee.shiftHoursPercentage >= 90
                        ? "Excellent"
                        : employee.shiftHoursPercentage >= 75
                        ? "On Track"
                        : "Needs Improvement"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {sortedEmployees.length === 0 && (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
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
