"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Clock,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Award,
  Download,
  Search,
  Target,
} from "lucide-react";

interface EmployeePunctuality {
  empNo: string;
  name: string;
  shift: string;
  onTimePercentage: number;
  onTimeCount: number;
  latePercentage: number;
  lateCount: number;
  totalCheckIns: number;
}

interface PunctualityData {
  employees: EmployeePunctuality[];
}

interface PunctualityReportProps {
  data: PunctualityData;
}

export default function PunctualityReport({ data }: PunctualityReportProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"onTime" | "late" | "name">("onTime");
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
    if (sortBy === "onTime") {
      comparison = a.onTimePercentage - b.onTimePercentage;
    } else if (sortBy === "late") {
      comparison = a.latePercentage - b.latePercentage;
    } else {
      comparison = a.name.localeCompare(b.name);
    }
    return sortOrder === "asc" ? comparison : -comparison;
  });

  // Calculate overall stats
  const totalCheckIns = data.employees.reduce(
    (acc, emp) => acc + emp.totalCheckIns,
    0
  );
  const totalOnTime = data.employees.reduce(
    (acc, emp) => acc + emp.onTimeCount,
    0
  );
  const totalLate = data.employees.reduce((acc, emp) => acc + emp.lateCount, 0);
  const overallOnTimePercentage =
    totalCheckIns > 0 ? ((totalOnTime / totalCheckIns) * 100).toFixed(1) : "0";

  // Get performance rating
  const getPerformanceRating = (onTimePercentage: number) => {
    if (onTimePercentage >= 95) return { label: "Excellent", color: "green" };
    if (onTimePercentage >= 85) return { label: "Good", color: "blue" };
    if (onTimePercentage >= 75) return { label: "Average", color: "yellow" };
    if (onTimePercentage >= 60)
      return { label: "Below Average", color: "orange" };
    return { label: "Poor", color: "red" };
  };

  const exportToCSV = () => {
    const headers = [
      "Emp No",
      "Name",
      "Shift",
      "On Time %",
      "On Time Count",
      "Late %",
      "Late Count",
      "Total Check-ins",
      "Performance",
    ];

    const rows = data.employees.map((emp) => [
      emp.empNo,
      emp.name,
      emp.shift,
      emp.onTimePercentage.toFixed(1) + "%",
      emp.onTimeCount,
      emp.latePercentage.toFixed(1) + "%",
      emp.lateCount,
      emp.totalCheckIns,
      getPerformanceRating(emp.onTimePercentage).label,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `punctuality_report_${
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
                  Punctuality Ratio Report
                </h2>
                <p className="text-sm text-gray-500">
                  {data.employees.length} employees • {totalCheckIns} total
                  check-ins
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium text-orange-900">
                  Overall Punctuality
                </span>
              </div>
              <p className="text-3xl font-bold text-orange-900">
                {overallOnTimePercentage}%
              </p>
            </div>

            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-700">
                  On Time
                </span>
              </div>
              <p className="text-3xl font-bold text-green-900">{totalOnTime}</p>
              <p className="text-xs text-green-600 mt-1">Total check-ins</p>
            </div>

            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-5 h-5 text-red-600" />
                <span className="text-sm font-medium text-red-700">Late</span>
              </div>
              <p className="text-3xl font-bold text-red-900">{totalLate}</p>
              <p className="text-xs text-red-600 mt-1">Total check-ins</p>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">
                  Total Check-ins
                </span>
              </div>
              <p className="text-3xl font-bold text-blue-900">
                {totalCheckIns}
              </p>
            </div>
          </div>

          {/* Sort Controls */}
          <div className="flex gap-3 mt-6 flex-wrap">
            <button
              onClick={() => {
                setSortBy("onTime");
                setSortOrder(
                  sortBy === "onTime" && sortOrder === "desc" ? "asc" : "desc"
                );
              }}
              className={`px-4 py-2 rounded-lg border font-medium transition-colors ${
                sortBy === "onTime"
                  ? "bg-orange-600 text-white border-orange-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              Sort by On Time{" "}
              {sortBy === "onTime" && (sortOrder === "desc" ? "↓" : "↑")}
            </button>
            <button
              onClick={() => {
                setSortBy("late");
                setSortOrder(
                  sortBy === "late" && sortOrder === "desc" ? "asc" : "desc"
                );
              }}
              className={`px-4 py-2 rounded-lg border font-medium transition-colors ${
                sortBy === "late"
                  ? "bg-orange-600 text-white border-orange-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              Sort by Late{" "}
              {sortBy === "late" && (sortOrder === "desc" ? "↓" : "↑")}
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
          const rating = getPerformanceRating(employee.onTimePercentage);
          const ratingColors = {
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
            ratingColors[rating.color as keyof typeof ratingColors];

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

                  {/* Performance Badge */}
                  <div className="text-right">
                    <div
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${colors.bg} ${colors.text} ${colors.border} border`}
                    >
                      {rating.label === "Excellent" && (
                        <Award className="w-3 h-3" />
                      )}
                      {rating.label === "Poor" && (
                        <AlertCircle className="w-3 h-3" />
                      )}
                      {rating.label}
                    </div>
                  </div>
                </div>

                {/* Circular Progress */}
                <div className="flex justify-center mb-6">
                  <div className="relative w-40 h-40">
                    <svg className="w-full h-full transform -rotate-90">
                      {/* Background circle */}
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        stroke="#E5E7EB"
                        strokeWidth="12"
                        fill="none"
                      />
                      {/* Progress circle - On Time */}
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        stroke="#10B981"
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray={`${
                          (employee.onTimePercentage / 100) * 439.6
                        } 439.6`}
                        className="transition-all duration-1000 ease-out"
                      />
                      {/* Progress circle - Late */}
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        stroke="#EF4444"
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray={`${
                          (employee.latePercentage / 100) * 439.6
                        } 439.6`}
                        strokeDashoffset={`-${
                          (employee.onTimePercentage / 100) * 439.6
                        }`}
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <p className="text-3xl font-bold text-gray-900">
                        {employee.onTimePercentage.toFixed(1)}%
                      </p>
                      <p className="text-xs text-gray-500">On Time</p>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="text-xs font-medium text-green-700">
                        On Time
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-green-900">
                      {employee.onTimeCount}
                    </p>
                    <p className="text-xs text-green-600">
                      {employee.onTimePercentage.toFixed(1)}%
                    </p>
                  </div>

                  <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingDown className="w-4 h-4 text-red-600" />
                      <span className="text-xs font-medium text-red-700">
                        Late
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-red-900">
                      {employee.lateCount}
                    </p>
                    <p className="text-xs text-red-600">
                      {employee.latePercentage.toFixed(1)}%
                    </p>
                  </div>
                </div>

                {/* Total Check-ins */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Total Check-ins
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                      {employee.totalCheckIns}
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
