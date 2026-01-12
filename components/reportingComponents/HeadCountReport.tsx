"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Download, Search } from "lucide-react";

interface EmployeeHeadcount {
  empNo: string;
  name: string;
  shift: string;
  present: number;
  absent: number;
  weekOff: number;
  weekOffPresent: number;
  holiday: number;
  holidayPresent: number;
  leave: number;
  total: number;
}

interface HeadcountData {
  employees: EmployeeHeadcount[];
}

interface HeadcountReportProps {
  data: HeadcountData;
}

export default function HeadcountReport({ data }: HeadcountReportProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredEmployees = data.employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.empNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.shift.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAttendancePercentage = (emp: EmployeeHeadcount) => {
    const workingDays = emp.total - emp.weekOff - emp.holiday;
    if (workingDays === 0) return 0;
    return ((emp.present / workingDays) * 100).toFixed(1);
  };

  const getWorkingDays = (emp: EmployeeHeadcount) => {
    return emp.total - emp.weekOff - emp.holiday;
  };

  const exportToCSV = () => {
    const headers = [
      "Emp No",
      "Name",
      "Shift",
      "Present",
      "Absent",
      "Week Off",
      "Week Off Present",
      "Holiday",
      "Holiday Present",
      "Leave",
      "Working Days",
      "Total Days",
      "Attendance %",
    ];

    const rows = data.employees.map((emp) => [
      emp.empNo,
      emp.name,
      emp.shift,
      emp.present,
      emp.absent,
      emp.weekOff,
      emp.weekOffPresent,
      emp.holiday,
      emp.holidayPresent,
      emp.leave,
      getWorkingDays(emp),
      emp.total,
      getAttendancePercentage(emp) + "%",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `headcount_report_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    a.click();
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-orange-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                HeadCount Report
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

        {/* Headcount Table */}
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 border-r border-gray-200 min-w-[100px]">
                  Emp No
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 border-r border-gray-200 min-w-[180px]">
                  Employee Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 border-r border-gray-200 min-w-[120px]">
                  Shift
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 border-r border-gray-200 min-w-[80px]">
                  Present
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 border-r border-gray-200 min-w-[80px]">
                  Absent
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 border-r border-gray-200 min-w-[80px]">
                  Week Off
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 border-r border-gray-200 min-w-[80px]">
                  WO Present
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 border-r border-gray-200 min-w-[80px]">
                  Holiday
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 border-r border-gray-200 min-w-[80px]">
                  H Present
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 border-r border-gray-200 min-w-[80px]">
                  Leave
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 border-r border-gray-200 min-w-[100px]">
                  Working Days
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 border-r border-gray-200 min-w-[80px]">
                  Total Days
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 min-w-[100px]">
                  Attendance %
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((employee, idx) => {
                const attendancePercentage: any =
                  getAttendancePercentage(employee);
                const workingDays = getWorkingDays(employee);

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
                      <span className="inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700">
                        {employee.present}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-sm border-r border-gray-200">
                      <span className="inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700">
                        {employee.absent}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-sm border-r border-gray-200">
                      <span className="inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                        {employee.weekOff}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-sm border-r border-gray-200">
                      <span className="inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-700">
                        {employee.weekOffPresent}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-sm border-r border-gray-200">
                      <span className="inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700">
                        {employee.holiday}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-sm border-r border-gray-200">
                      <span className="inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
                        {employee.holidayPresent}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-sm border-r border-gray-200">
                      <span className="inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-700">
                        {employee.leave}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-sm font-medium text-gray-900 border-r border-gray-200">
                      {workingDays}
                    </td>
                    <td className="px-4 py-3 text-center text-sm font-medium text-gray-900 border-r border-gray-200">
                      {employee.total}
                    </td>
                    <td className="px-4 py-3 text-center text-sm">
                      <span
                        className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold ${
                          parseFloat(attendancePercentage) >= 90
                            ? "bg-green-100 text-green-700"
                            : parseFloat(attendancePercentage) >= 75
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {attendancePercentage}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredEmployees.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
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
