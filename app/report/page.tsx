import React from "react";
import DashboardLayout from "@/components/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Employeetracking from "@/components/EmployeeTacking";

function ReportPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Employee Tracking Report
          </h1>
          <p className="text-gray-500 mt-1">
            Track daily attendance and work hours with accuracy.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Employees Tracking History</CardTitle>
            <CardDescription>check-in and check-out records</CardDescription>
          </CardHeader>
          <CardContent>
            <Employeetracking />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default ReportPage;
