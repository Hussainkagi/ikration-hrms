"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, Download, Search } from "lucide-react";

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
    "checkIn",
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

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
    if (sortBy === "checkIn") {
      comparison = a.checkInPercentage - b.checkInPercentage;
    } else if (sortBy === "checkOut") {
      comparison = b.checkOutPercentage - b.checkOutPercentage;
    } else {
      comparison = a.name.localeCompare(b.name);
    }
    return sortOrder === "asc" ? comparison : -comparison;
  });

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
      "Status",
    ];

    const rows = data.employees.map((emp) => {
      const overallStatus =
        emp.checkInPercentage < emp.checkOutPercentage
          ? getComplianceStatus(emp.checkInPercentage)
          : getComplianceStatus(emp.checkOutPercentage);

      return [
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
        overallStatus.label,
      ];
    });

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

  const handleSort = (column: "checkIn" | "checkOut" | "name") => {
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
            <Activity className="w-6 h-6 text-orange-600" />
            <div>
              <h2 className="text-xl font-bold text-foreground">
                Check-In/Out Ratio Report
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

        {/* Check-In/Out Table */}
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
                  onClick={() => handleSort("checkIn")}
                >
                  <div className="flex items-center justify-center gap-2">
                    Check-In %
                    {sortBy === "checkIn" && (
                      <span>{sortOrder === "desc" ? "↓" : "↑"}</span>
                    )}
                  </div>
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-foreground border-r border-border min-w-[100px]">
                  Check-Ins
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-foreground border-r border-border min-w-[110px]">
                  Eligible Days
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-foreground border-r border-border min-w-[100px]">
                  Missing
                </th>
                <th
                  className="px-4 py-3 text-center text-xs font-semibold text-foreground border-r border-border min-w-[120px] cursor-pointer hover:bg-secondary/80"
                  onClick={() => handleSort("checkOut")}
                >
                  <div className="flex items-center justify-center gap-2">
                    Check-Out %
                    {sortBy === "checkOut" && (
                      <span>{sortOrder === "desc" ? "↓" : "↑"}</span>
                    )}
                  </div>
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-foreground border-r border-border min-w-[100px]">
                  Check-Outs
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-foreground border-r border-border min-w-[110px]">
                  Eligible Days
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-foreground border-r border-border min-w-[100px]">
                  Missing
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-foreground min-w-[120px]">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedEmployees.map((employee, idx) => {
                const checkInStatus = getComplianceStatus(
                  employee.checkInPercentage,
                );
                const checkOutStatus = getComplianceStatus(
                  employee.checkOutPercentage,
                );
                const missingCheckIns = getMissingCheckIns(employee);
                const missingCheckOuts = getMissingCheckOuts(employee);

                // Use the worse status for the overall badge
                const overallStatus =
                  employee.checkInPercentage < employee.checkOutPercentage
                    ? checkInStatus
                    : checkOutStatus;
                const colors =
                  statusColors[
                    overallStatus.color as keyof typeof statusColors
                  ];

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
                          {employee.checkInPercentage.toFixed(1)}%
                        </span>
                        {/* Progress bar */}
                        <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
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
                              width: `${Math.min(
                                employee.checkInPercentage,
                                100,
                              )}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-sm border-r border-border">
                      <span className="inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-semibold bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                        {employee.checkInCount}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-sm font-medium text-foreground border-r border-border">
                      {employee.checkInEligibleDays}
                    </td>
                    <td className="px-4 py-3 text-center text-sm border-r border-border">
                      {missingCheckIns > 0 ? (
                        <span className="inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-semibold bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                          {missingCheckIns}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-sm border-r border-border">
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-semibold text-foreground">
                          {employee.checkOutPercentage.toFixed(1)}%
                        </span>
                        {/* Progress bar */}
                        <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
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
                              width: `${Math.min(
                                employee.checkOutPercentage,
                                100,
                              )}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-sm border-r border-border">
                      <span className="inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                        {employee.checkOutCount}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-sm font-medium text-foreground border-r border-border">
                      {employee.checkOutEligibleDays}
                    </td>
                    <td className="px-4 py-3 text-center text-sm border-r border-border">
                      {missingCheckOuts > 0 ? (
                        <span className="inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-semibold bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                          {missingCheckOuts}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-sm">
                      <span
                        className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold border ${colors.bg} ${colors.text} ${colors.border}`}
                      >
                        {overallStatus.label}
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
            <Activity className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
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
