"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, ChevronLeft, ChevronRight, Download } from "lucide-react";

interface AttendanceCode {
  code: string;
}

interface EmployeeAttendance {
  empNo: string;
  name: string;
  shift: string;
  attendanceByDate: Record<string, AttendanceCode>;
}

interface DetailedReportData {
  dates: string[];
  employees: EmployeeAttendance[];
  startDate?: string;
  endDate?: string;
}

interface AttendanceDetailedReportProps {
  data: DetailedReportData;
}

const attendanceCodeConfig: Record<
  string,
  { label: string; color: string; bgColor: string; textColor: string }
> = {
  P: {
    label: "Present",
    color: "bg-green-500",
    bgColor: "bg-green-50",
    textColor: "text-green-700",
  },
  A: {
    label: "Absent",
    color: "bg-red-500",
    bgColor: "bg-red-50",
    textColor: "text-red-700",
  },
  HP: {
    label: "Half-Present",
    color: "bg-yellow-500",
    bgColor: "bg-yellow-50",
    textColor: "text-yellow-700",
  },
  WO: {
    label: "Week Off",
    color: "bg-blue-500",
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
  },
  "WO/P": {
    label: "Week Off/Present",
    color: "bg-teal-500",
    bgColor: "bg-teal-50",
    textColor: "text-teal-700",
  },
  "WO/HP": {
    label: "Week Off/Half-Present",
    color: "bg-cyan-500",
    bgColor: "bg-cyan-50",
    textColor: "text-cyan-700",
  },
  H: {
    label: "Holiday",
    color: "bg-indigo-500",
    bgColor: "bg-indigo-50",
    textColor: "text-indigo-700",
  },
  "H/P": {
    label: "Holiday/Present",
    color: "bg-violet-500",
    bgColor: "bg-violet-50",
    textColor: "text-violet-700",
  },
  L: {
    label: "Leave",
    color: "bg-purple-500",
    bgColor: "bg-purple-50",
    textColor: "text-purple-700",
  },
};

export default function AttendanceDetailedReport({
  data,
}: AttendanceDetailedReportProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const datesPerPage = 15; // Show 15 days at a time

  const totalPages = Math.ceil(data.dates.length / datesPerPage);
  const startIndex = currentPage * datesPerPage;
  const endIndex = Math.min(startIndex + datesPerPage, data.dates.length);
  const visibleDates = data.dates.slice(startIndex, endIndex);

  const formatDateRange = (startDate?: string, endDate?: string) => {
    console.log("datag", data);
    if (!startDate || !endDate) {
      // Fallback to first and last date from dates array
      const start = data.dates[0];
      const end = data.dates[data.dates.length - 1];
      return formatDateRangeString(start, end);
    }
    return formatDateRangeString(startDate, endDate);
  };

  const formatDateRangeString = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);

    const formatOptions: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "short",
      year: "numeric",
    };

    const formattedStart = startDate.toLocaleDateString("en-GB", formatOptions);
    const formattedEnd = endDate.toLocaleDateString("en-GB", formatOptions);

    return `${formattedStart} - ${formattedEnd}`;
  };

  const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
    return { day, dayName };
  };

  const getAttendanceCode = (code: string) => {
    return attendanceCodeConfig[code] || attendanceCodeConfig["A"];
  };

  const calculateSummary = (employee: EmployeeAttendance) => {
    const summary: Record<string, number> = {};
    Object.values(employee.attendanceByDate).forEach((attendance) => {
      summary[attendance.code] = (summary[attendance.code] || 0) + 1;
    });
    return summary;
  };

  const exportToCSV = () => {
    const headers = ["Emp No", "Name", "Shift", ...data.dates];
    const rows = data.employees.map((emp) => [
      emp.empNo,
      emp.name,
      emp.shift,
      ...data.dates.map((date) => emp.attendanceByDate[date]?.code || "-"),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance_report_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    a.click();
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-orange-600" />
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-gray-900">
                  Attendance Detailed Report
                </h2>
                <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm font-medium rounded-full">
                  {formatDateRange(data.startDate, data.endDate)}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {data.employees.length} employees • {data.dates.length} days
              </p>
            </div>
          </div>

          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        {/* Legend */}
        <div className="mb-6 flex flex-wrap gap-3">
          {Object.entries(attendanceCodeConfig).map(([code, config]) => (
            <div key={code} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded ${config.color}`}></div>
              <span className="text-sm text-gray-700">
                {code} - {config.label}
              </span>
            </div>
          ))}
        </div>

        {/* Calendar Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="text-sm font-medium text-gray-700">
            Showing {startIndex + 1} - {endIndex} of {data.dates.length} days
          </div>

          <button
            onClick={() =>
              setCurrentPage(Math.min(totalPages - 1, currentPage + 1))
            }
            disabled={currentPage === totalPages - 1}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Attendance Calendar */}
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="sticky left-0 z-20 bg-gray-50 px-4 py-3 text-left text-xs font-semibold text-gray-700 border-r border-gray-200 min-w-[100px]">
                  Emp No
                </th>
                <th className="sticky left-[100px] z-20 bg-gray-50 px-4 py-3 text-left text-xs font-semibold text-gray-700 border-r border-gray-200 min-w-[180px]">
                  Employee Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 border-r border-gray-200 min-w-[120px]">
                  Shift
                </th>
                {visibleDates.map((date) => {
                  const { day, dayName } = formatDateHeader(date);
                  return (
                    <th
                      key={date}
                      className="px-2 py-3 text-center text-xs font-semibold text-gray-700 border-r border-gray-200 min-w-[50px]"
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-gray-500">{dayName}</span>
                        <span className="text-gray-900 font-bold">{day}</span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {data.employees.map((employee, idx) => (
                <tr
                  key={employee.empNo}
                  className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="sticky left-0 z-10 bg-inherit px-4 py-3 text-sm font-medium text-gray-900 border-r border-gray-200">
                    {employee.empNo}
                  </td>
                  <td className="sticky left-[100px] z-10 bg-inherit px-4 py-3 text-sm text-gray-900 border-r border-gray-200">
                    <div className="font-medium">{employee.name}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 border-r border-gray-200">
                    {employee.shift}
                  </td>
                  {visibleDates.map((date) => {
                    const attendance = employee.attendanceByDate[date];
                    const codeConfig = attendance
                      ? getAttendanceCode(attendance.code)
                      : null;

                    return (
                      <td
                        key={date}
                        className="px-2 py-3 text-center border-r border-gray-200"
                      >
                        {attendance ? (
                          <div
                            className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${codeConfig?.bgColor} ${codeConfig?.textColor}`}
                            title={codeConfig?.label}
                          >
                            {attendance.code}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary Section */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Attendance Summary
          </h3>
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 border-r border-gray-200">
                    Employee
                  </th>
                  {Object.entries(attendanceCodeConfig).map(
                    ([code, config]) => (
                      <th
                        key={code}
                        className="px-4 py-3 text-center text-xs font-semibold text-gray-700 border-r border-gray-200"
                      >
                        {code}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {data.employees.map((employee, idx) => {
                  const summary = calculateSummary(employee);
                  return (
                    <tr
                      key={employee.empNo}
                      className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 border-r border-gray-200">
                        {employee.name}
                      </td>
                      {Object.keys(attendanceCodeConfig).map((code) => (
                        <td
                          key={code}
                          className="px-4 py-3 text-center text-sm text-gray-700 border-r border-gray-200"
                        >
                          {summary[code] || 0}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
