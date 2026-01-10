"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Users,
  CheckCircle,
  XCircle,
  Calendar,
  Briefcase,
  CalendarX,
  CalendarCheck,
  Download,
  Search,
} from "lucide-react";

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

  const totalStats = data.employees.reduce(
    (acc, emp) => ({
      present: acc.present + emp.present,
      absent: acc.absent + emp.absent,
      weekOff: acc.weekOff + emp.weekOff,
      weekOffPresent: acc.weekOffPresent + emp.weekOffPresent,
      holiday: acc.holiday + emp.holiday,
      holidayPresent: acc.holidayPresent + emp.holidayPresent,
      leave: acc.leave + emp.leave,
    }),
    {
      present: 0,
      absent: 0,
      weekOff: 0,
      weekOffPresent: 0,
      holiday: 0,
      holidayPresent: 0,
      leave: 0,
    }
  );

  const getAttendancePercentage = (emp: EmployeeHeadcount) => {
    const workingDays = emp.total - emp.weekOff - emp.holiday;
    if (workingDays === 0) return 0;
    return ((emp.present / workingDays) * 100).toFixed(1);
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
    <div className="space-y-6">
      {/* Header Section */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-orange-600" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
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

          {/* Overall Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-xs font-medium text-green-700">
                  Present
                </span>
              </div>
              <p className="text-2xl font-bold text-green-900">
                {totalStats.present}
              </p>
            </div>

            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <div className="flex items-center gap-2 mb-1">
                <XCircle className="w-4 h-4 text-red-600" />
                <span className="text-xs font-medium text-red-700">Absent</span>
              </div>
              <p className="text-2xl font-bold text-red-900">
                {totalStats.absent}
              </p>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-medium text-blue-700">
                  Week Off
                </span>
              </div>
              <p className="text-2xl font-bold text-blue-900">
                {totalStats.weekOff}
              </p>
            </div>

            <div className="bg-cyan-50 rounded-lg p-4 border border-cyan-200">
              <div className="flex items-center gap-2 mb-1">
                <CalendarCheck className="w-4 h-4 text-cyan-600" />
                <span className="text-xs font-medium text-cyan-700">
                  WO Present
                </span>
              </div>
              <p className="text-2xl font-bold text-cyan-900">
                {totalStats.weekOffPresent}
              </p>
            </div>

            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center gap-2 mb-1">
                <CalendarX className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-medium text-purple-700">
                  Holiday
                </span>
              </div>
              <p className="text-2xl font-bold text-purple-900">
                {totalStats.holiday}
              </p>
            </div>

            <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
              <div className="flex items-center gap-2 mb-1">
                <CalendarCheck className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-medium text-indigo-700">
                  H Present
                </span>
              </div>
              <p className="text-2xl font-bold text-indigo-900">
                {totalStats.holidayPresent}
              </p>
            </div>

            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <div className="flex items-center gap-2 mb-1">
                <Briefcase className="w-4 h-4 text-yellow-600" />
                <span className="text-xs font-medium text-yellow-700">
                  Leave
                </span>
              </div>
              <p className="text-2xl font-bold text-yellow-900">
                {totalStats.leave}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employee Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEmployees.map((employee) => {
          const attendancePercentage: any = getAttendancePercentage(employee);
          const workingDays =
            employee.total - employee.weekOff - employee.holiday;

          return (
            <Card
              key={employee.empNo}
              className="hover:shadow-lg transition-shadow"
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
                        <Briefcase className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-600">
                          {employee.shift}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Attendance Badge */}
                  <div className="text-right">
                    <div
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                        parseFloat(attendancePercentage) >= 90
                          ? "bg-green-100 text-green-700"
                          : parseFloat(attendancePercentage) >= 75
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {attendancePercentage}%
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Attendance</p>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="w-3 h-3 text-green-600" />
                      <span className="text-xs font-medium text-green-700">
                        Present
                      </span>
                    </div>
                    <p className="text-lg font-bold text-green-900">
                      {employee.present}
                    </p>
                  </div>

                  <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                    <div className="flex items-center gap-2 mb-1">
                      <XCircle className="w-3 h-3 text-red-600" />
                      <span className="text-xs font-medium text-red-700">
                        Absent
                      </span>
                    </div>
                    <p className="text-lg font-bold text-red-900">
                      {employee.absent}
                    </p>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-3 h-3 text-blue-600" />
                      <span className="text-xs font-medium text-blue-700">
                        Week Off
                      </span>
                    </div>
                    <p className="text-lg font-bold text-blue-900">
                      {employee.weekOff}
                    </p>
                  </div>

                  <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Briefcase className="w-3 h-3 text-yellow-600" />
                      <span className="text-xs font-medium text-yellow-700">
                        Leave
                      </span>
                    </div>
                    <p className="text-lg font-bold text-yellow-900">
                      {employee.leave}
                    </p>
                  </div>

                  {employee.weekOffPresent > 0 && (
                    <div className="bg-cyan-50 rounded-lg p-3 border border-cyan-200">
                      <div className="flex items-center gap-2 mb-1">
                        <CalendarCheck className="w-3 h-3 text-cyan-600" />
                        <span className="text-xs font-medium text-cyan-700">
                          WO Present
                        </span>
                      </div>
                      <p className="text-lg font-bold text-cyan-900">
                        {employee.weekOffPresent}
                      </p>
                    </div>
                  )}

                  {employee.holiday > 0 && (
                    <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                      <div className="flex items-center gap-2 mb-1">
                        <CalendarX className="w-3 h-3 text-purple-600" />
                        <span className="text-xs font-medium text-purple-700">
                          Holiday
                        </span>
                      </div>
                      <p className="text-lg font-bold text-purple-900">
                        {employee.holiday}
                      </p>
                    </div>
                  )}

                  {employee.holidayPresent > 0 && (
                    <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-200">
                      <div className="flex items-center gap-2 mb-1">
                        <CalendarCheck className="w-3 h-3 text-indigo-600" />
                        <span className="text-xs font-medium text-indigo-700">
                          H Present
                        </span>
                      </div>
                      <p className="text-lg font-bold text-indigo-900">
                        {employee.holidayPresent}
                      </p>
                    </div>
                  )}
                </div>

                {/* Summary Footer */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Working Days:</span>
                    <span className="font-semibold text-gray-900">
                      {workingDays}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-600">Total Days:</span>
                    <span className="font-semibold text-gray-900">
                      {employee.total}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredEmployees.length === 0 && (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
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
