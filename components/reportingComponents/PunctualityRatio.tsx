"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Download, Search } from "lucide-react";

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

  const handleSort = (column: "onTime" | "late" | "name") => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "desc" ? "asc" : "desc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

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

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-orange-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Punctuality Ratio Report
              </h2>
              <p className="text-sm text-gray-500">
                {data.employees.length} employees
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

        {/* Punctuality Table */}
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 border-r border-gray-200 min-w-[100px]">
                  Emp No
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-700 border-r border-gray-200 min-w-[180px] cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center gap-2">
                    Employee Name
                    {sortBy === "name" && (
                      <span>{sortOrder === "desc" ? "↓" : "↑"}</span>
                    )}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 border-r border-gray-200 min-w-[120px]">
                  Shift
                </th>
                <th
                  className="px-4 py-3 text-center text-xs font-semibold text-gray-700 border-r border-gray-200 min-w-[100px] cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("onTime")}
                >
                  <div className="flex items-center justify-center gap-2">
                    On Time %
                    {sortBy === "onTime" && (
                      <span>{sortOrder === "desc" ? "↓" : "↑"}</span>
                    )}
                  </div>
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 border-r border-gray-200 min-w-[100px]">
                  On Time Count
                </th>
                <th
                  className="px-4 py-3 text-center text-xs font-semibold text-gray-700 border-r border-gray-200 min-w-[100px] cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("late")}
                >
                  <div className="flex items-center justify-center gap-2">
                    Late %
                    {sortBy === "late" && (
                      <span>{sortOrder === "desc" ? "↓" : "↑"}</span>
                    )}
                  </div>
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 border-r border-gray-200 min-w-[100px]">
                  Late Count
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 border-r border-gray-200 min-w-[120px]">
                  Total Check-ins
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 min-w-[120px]">
                  Performance
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedEmployees.map((employee, idx) => {
                const rating = getPerformanceRating(employee.onTimePercentage);
                const colors =
                  ratingColors[rating.color as keyof typeof ratingColors];

                return (
                  <tr
                    key={employee.empNo}
                    className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 border-r border-gray-200">
                      {employee.empNo}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200">
                      <div className="font-medium">{employee.name}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 border-r border-gray-200">
                      {employee.shift}
                    </td>
                    <td className="px-4 py-3 text-center text-sm border-r border-gray-200">
                      <div className="flex items-center justify-center gap-2">
                        <span className="font-semibold text-gray-900">
                          {employee.onTimePercentage.toFixed(1)}%
                        </span>
                        {/* Progress bar */}
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full transition-all"
                            style={{
                              width: `${employee.onTimePercentage}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-sm border-r border-gray-200">
                      <span className="inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700">
                        {employee.onTimeCount}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-sm border-r border-gray-200">
                      <div className="flex items-center justify-center gap-2">
                        <span className="font-semibold text-gray-900">
                          {employee.latePercentage.toFixed(1)}%
                        </span>
                        {/* Progress bar */}
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-red-500 rounded-full transition-all"
                            style={{
                              width: `${employee.latePercentage}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-sm border-r border-gray-200">
                      <span className="inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700">
                        {employee.lateCount}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-sm font-medium text-gray-900 border-r border-gray-200">
                      {employee.totalCheckIns}
                    </td>
                    <td className="px-4 py-3 text-center text-sm">
                      <span
                        className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold border ${colors.bg} ${colors.text} ${colors.border}`}
                      >
                        {rating.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {sortedEmployees.length === 0 && (
          <div className="text-center py-12">
            <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No employees found
            </h3>
            <p className="text-gray-500">Try adjusting your search criteria</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
