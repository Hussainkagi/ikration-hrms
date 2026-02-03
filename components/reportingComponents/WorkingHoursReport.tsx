"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Download, Search } from "lucide-react";

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
    "completion",
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Convert minutes to readable format
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  // Filter employees
  const filteredEmployees = data.employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.empNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.shift.toLowerCase().includes(searchTerm.toLowerCase()),
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
      "Status",
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
      getPerformanceStatus(emp.shiftHoursPercentage).label,
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

  const handleSort = (column: "completion" | "overtime" | "name") => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "desc" ? "asc" : "desc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  const statusColors = {
    green: {
      bg: "bg-green-100 dark:bg-green-900/30",
      text: "text-green-700 dark:text-green-400",
      border: "border-green-200 dark:border-green-700",
    },
    blue: {
      bg: "bg-blue-100 dark:bg-blue-900/30",
      text: "text-blue-700 dark:text-blue-400",
      border: "border-blue-200 dark:border-blue-700",
    },
    yellow: {
      bg: "bg-yellow-100 dark:bg-yellow-900/30",
      text: "text-yellow-700 dark:text-yellow-400",
      border: "border-yellow-200 dark:border-yellow-700",
    },
    orange: {
      bg: "bg-orange-100 dark:bg-orange-900/30",
      text: "text-orange-700 dark:text-orange-400",
      border: "border-orange-200 dark:border-orange-700",
    },
    red: {
      bg: "bg-red-100 dark:bg-red-900/30",
      text: "text-red-700 dark:text-red-400",
      border: "border-red-200 dark:border-red-700",
    },
  };

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-orange-600" />
            <div>
              <h2 className="text-xl font-bold text-foreground">
                Working Hours Report
              </h2>
              <p className="text-sm text-muted-foreground">
                {data.employees.length} employees
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-border bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 w-full sm:w-64"
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

        {/* Working Hours Table */}
        <div className="overflow-x-auto border border-border rounded-lg">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-secondary">
                <th className="px-4 py-3 text-left text-xs font-semibold text-foreground border-r border-border min-w-[100px]">
                  Emp No
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-semibold text-foreground border-r border-border min-w-[180px] cursor-pointer hover:bg-secondary/80"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center gap-2">
                    Employee Name
                    {sortBy === "name" && (
                      <span>{sortOrder === "desc" ? "↓" : "↑"}</span>
                    )}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-foreground border-r border-border min-w-[120px]">
                  Shift
                </th>
                <th
                  className="px-4 py-3 text-center text-xs font-semibold text-foreground border-r border-border min-w-[120px] cursor-pointer hover:bg-secondary/80"
                  onClick={() => handleSort("completion")}
                >
                  <div className="flex items-center justify-center gap-2">
                    Shift Hours %
                    {sortBy === "completion" && (
                      <span>{sortOrder === "desc" ? "↓" : "↑"}</span>
                    )}
                  </div>
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-foreground border-r border-border min-w-[120px]">
                  Hours Completed
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-foreground border-r border-border min-w-[120px]">
                  Hours Scheduled
                </th>
                <th
                  className="px-4 py-3 text-center text-xs font-semibold text-foreground border-r border-border min-w-[100px] cursor-pointer hover:bg-secondary/80"
                  onClick={() => handleSort("overtime")}
                >
                  <div className="flex items-center justify-center gap-2">
                    Overtime %
                    {sortBy === "overtime" && (
                      <span>{sortOrder === "desc" ? "↓" : "↑"}</span>
                    )}
                  </div>
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-foreground border-r border-border min-w-[120px]">
                  Overtime Hours
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-foreground border-r border-border min-w-[120px]">
                  Total Worked
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-foreground min-w-[120px]">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedEmployees.map((employee, idx) => {
                const status = getPerformanceStatus(
                  employee.shiftHoursPercentage,
                );
                const colors =
                  statusColors[status.color as keyof typeof statusColors];

                return (
                  <tr
                    key={employee.empNo}
                    className={idx % 2 === 0 ? "bg-card" : "bg-secondary/50"}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-foreground border-r border-border">
                      {employee.empNo}
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground border-r border-border">
                      <div className="font-medium">{employee.name}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground border-r border-border">
                      {employee.shift}
                    </td>
                    <td className="px-4 py-3 text-center text-sm border-r border-border">
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-semibold text-foreground">
                          {employee.shiftHoursPercentage.toFixed(1)}%
                        </span>
                        {/* Progress bar */}
                        <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
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
                                100,
                              )}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-sm border-r border-border">
                      <span className="inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-semibold bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                        {formatTime(employee.shiftHoursCompleted)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-sm border-r border-border">
                      <span className="inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                        {formatTime(employee.shiftHoursScheduled)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-sm border-r border-border">
                      <span className="font-semibold text-foreground">
                        {employee.overtimePercentage.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-sm border-r border-border">
                      {employee.overtimeMinutes > 0 ? (
                        <span className="inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-semibold bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400">
                          {formatTime(employee.overtimeMinutes)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-sm font-medium text-foreground border-r border-border">
                      {formatTime(employee.totalWorkedMinutes)}
                    </td>
                    <td className="px-4 py-3 text-center text-sm">
                      <span
                        className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold border ${colors.bg} ${colors.text} ${colors.border}`}
                      >
                        {status.label}
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
            <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No employees found
            </h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
