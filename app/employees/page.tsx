"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard-layout";
import CommonTable from "@/components/ui/commonTable";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  Plus,
  Pencil,
  Trash2,
  Mail,
  User,
  Phone,
  Upload,
  Clock,
  Loader2,
} from "lucide-react";
import ImportEmployeeModal from "@/components/import-employee-modal";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  role: string;
  status: string;
  createdAt: string;
  remote: boolean;
  shiftId: string | null;
}

interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  lateTime: string;
  days: number[];
  organizationId: string;
  isDefault: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default function EmployeesPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingEmployee, setIsAddingEmployee] = useState(false);
  const [isSavingEmployee, setIsSavingEmployee] = useState(false);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobileNumber: "",
    role: "employee",
    status: "active",
    remote: false,
    shiftId: "",
  });
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    employee: Employee | null;
    isDeleting: boolean;
  }>({
    isOpen: false,
    employee: null,
    isDeleting: false,
  });

  // Get token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem("accessToken");
  };

  // Fetch employees
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();

      const response = await fetch(`${API_BASE_URL}/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch employees");

      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch employees. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch shifts
  const fetchShifts = async () => {
    try {
      const token = getAuthToken();

      const response = await fetch(`${API_BASE_URL}/shift`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch shifts");

      const data = await response.json();
      setShifts(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch shifts. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchShifts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingEmployee(true);

    try {
      const token = getAuthToken();

      // First, create the employee without shiftId
      const employeeData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        mobileNumber: formData.mobileNumber,
        role: formData.role,
        status: formData.status,
        remote: formData.remote,
      };

      const response = await fetch(`${API_BASE_URL}/user`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(employeeData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.message || "Something went wrong");
      }

      const newEmployee = await response.json();

      // Check if the selected shift is the default shift
      const selectedShift = shifts.find((s) => s.id === formData.shiftId);
      const isDefaultShift = selectedShift?.isDefault === true;

      // If a shift is selected and it's NOT the default shift, assign it using the separate API
      if (formData.shiftId && !isDefaultShift) {
        const assignResponse = await fetch(`${API_BASE_URL}/shift/assign`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: newEmployee.id,
            shiftId: formData.shiftId,
          }),
        });

        if (!assignResponse.ok) {
          // Employee was created but shift assignment failed
          toast({
            title: "Warning",
            description: `${formData.firstName} ${formData.lastName} was added but shift assignment failed.`,
            variant: "default",
          });
        } else {
          toast({
            title: "Employee Added",
            description: `${formData.firstName} ${formData.lastName} has been added and assigned to shift successfully.`,
          });
        }
      } else {
        // Employee added without explicit shift assignment (will use default shift)
        const shiftMessage = isDefaultShift
          ? " Default shift will be applied automatically."
          : "";
        toast({
          title: "Employee Added",
          description: `${formData.firstName} ${formData.lastName} has been added successfully.${shiftMessage}`,
        });
      }
      // Refresh the employee list
      await fetchEmployees();

      setIsAddingEmployee(false);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        mobileNumber: "",
        role: "employee",
        status: "active",
        remote: false,
        shiftId: "",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsSavingEmployee(false);
    }
  };

  const handleEdit = (employee: Employee) => {
    // Redirect to edit page
    router.push(`/employees/${employee.id}`);
  };

  const handleDelete = (employee: Employee) => {
    setDeleteConfirmation({
      isOpen: true,
      employee: employee,
      isDeleting: false,
    });
  };

  const confirmDelete = async () => {
    if (!deleteConfirmation.employee) return;

    setDeleteConfirmation((prev) => ({ ...prev, isDeleting: true }));

    try {
      const token = getAuthToken();
      const response = await fetch(
        `${API_BASE_URL}/user/${deleteConfirmation.employee.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json(); // ⬅️ Read backend response

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete employee");
      }

      setTimeout(async () => {
        toast({
          title: "Employee Deleted",
          description: `${deleteConfirmation.employee?.firstName} ${deleteConfirmation.employee?.lastName} has been removed from the system.`,
          variant: "destructive",
        });

        await fetchEmployees();
        setDeleteConfirmation({
          isOpen: false,
          employee: null,
          isDeleting: false,
        });
      }, 800);
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.message || "Failed to delete employee. Please try again.",
        variant: "destructive",
      });

      setDeleteConfirmation((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  const handleCancel = () => {
    setIsAddingEmployee(false);
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      mobileNumber: "",
      role: "employee",
      status: "active",
      remote: false,
      shiftId: "",
    });
  };

  const handleImportEmployees = async (file: File) => {
    const token = getAuthToken();

    // Create FormData to send the file
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${API_BASE_URL}/user/bulk-upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to import employees");
      }

      const result = await response.json();

      // Show appropriate toast based on results
      if (result.success > 0 && result.failed === 0) {
        toast({
          title: "Import Successful",
          description: `${result.success} employee${
            result.success !== 1 ? "s" : ""
          } imported successfully.`,
        });
      } else if (result.success > 0 && result.failed > 0) {
        toast({
          title: "Partial Import",
          description: `${result.success} imported, ${result.failed} failed. Check details below.`,
          variant: "default",
        });
      } else if (result.failed > 0) {
        toast({
          title: "Import Failed",
          description: `All ${result.failed} employee${
            result.failed !== 1 ? "s" : ""
          } failed to import.`,
          variant: "destructive",
        });
      }

      // Refresh the employee list if any were successful
      if (result.success > 0) {
        await fetchEmployees();
      }

      return result;
    } catch (error) {
      toast({
        title: "Import Failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to import employees. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Helper function to get shift name by ID
  const getShiftName = (row: Employee | any) => {
    if (row.shiftId) {
      const shift = shifts.find((s) => s.id === row.shiftId);
      return shift ? shift.name : "Unknown Shift";
    }

    // If no shiftId but shift object exists:
    if (row.shift) return row.shift.name;

    return "Not Assigned";
  };

  // Helper function to format shift time
  const formatShiftTime = (shiftId: string | null) => {
    if (!shiftId) return "";
    const shift = shifts.find((s) => s.id === shiftId);
    return shift ? `${shift.startTime} - ${shift.endTime}` : "";
  };

  // Define columns for CommonTable
  const columns = [
    {
      key: "firstName",
      header: "First Name",
      sortable: true,
      searchable: true,
      filterable: true,
    },
    {
      key: "lastName",
      header: "Last Name",
      sortable: true,
      searchable: true,
      filterable: true,
    },
    {
      key: "email",
      header: "Email",
      sortable: true,
      searchable: true,
      render: (row: Employee) => (
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-gray-400" />
          <span>{row.email}</span>
        </div>
      ),
    },
    {
      key: "mobileNumber",
      header: "Mobile",
      sortable: true,
      searchable: true,
      render: (row: Employee) => (
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-gray-400" />
          <span>{row.mobileNumber}</span>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      sortable: true,
      filterable: true,
      render: (row: Employee) => (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full capitalize">
          {row.role}
        </span>
      ),
    },
    {
      key: "shift",
      header: "Shift",
      sortable: true,
      render: (row: Employee) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="font-medium text-sm">{getShiftName(row)}</span>
          </div>
          {row.shiftId && (
            <span className="text-xs text-gray-500 ml-6">
              {formatShiftTime(row.shiftId)}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      filterable: true,
      render: (row: Employee) => (
        <span
          className={`px-2 py-1 text-xs rounded-full capitalize ${
            row.status === "active"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      key: "remote",
      header: "Location",
      sortable: true,
      render: (row: Employee) => (
        <span
          className={`px-2 py-1 text-xs rounded-full capitalize ${
            row.remote === true
              ? "bg-green-100 text-green-800"
              : "bg-orange-100 text-orange-800"
          }`}
        >
          {row.remote ? "Remote" : "Onsite"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      sortable: false,
      render: (row: Employee) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(row);
            }}
            className="p-2 hover:bg-orange-50 text-orange-600 rounded-lg transition-colors"
            title="Edit employee"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row);
            }}
            className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
            title="Delete employee"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Employees
            </h1>
            <p className="text-gray-500 mt-1 text-sm sm:text-base">
              Manage your employee records
            </p>
          </div>
          {!isAddingEmployee && (
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Button
                onClick={() => setIsImportModalOpen(true)}
                className="bg-white hover:bg-gray-50 text-orange-600 border border-orange-600 w-full sm:w-auto"
              >
                <Upload className="w-4 h-4 mr-2" />
                Import from Excel
              </Button>
              <Button
                onClick={() => setIsAddingEmployee(true)}
                className="bg-orange-600 hover:bg-orange-700 text-white w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Employee
              </Button>
            </div>
          )}
        </div>

        {/* Add Employee Form */}
        {isAddingEmployee && (
          <Card>
            <CardHeader>
              <CardTitle>Add New Employee</CardTitle>
              <CardDescription>
                Enter employee details to create a new record
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      First Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        id="firstName"
                        type="text"
                        value={formData.firstName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            firstName: e.target.value,
                          })
                        }
                        placeholder="John"
                        className="w-full h-11 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none transition-all"
                        required
                        disabled={isSavingEmployee}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Last Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        id="lastName"
                        type="text"
                        value={formData.lastName}
                        onChange={(e) =>
                          setFormData({ ...formData, lastName: e.target.value })
                        }
                        placeholder="Doe"
                        className="w-full h-11 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none transition-all"
                        required
                        disabled={isSavingEmployee}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder="john.doe@company.com"
                        className="w-full h-11 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none transition-all"
                        required
                        disabled={isSavingEmployee}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="mobileNumber"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Mobile Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        id="mobileNumber"
                        type="tel"
                        value={formData.mobileNumber}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            mobileNumber: e.target.value,
                          })
                        }
                        placeholder="+1234567890"
                        className="w-full h-11 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none transition-all"
                        required
                        disabled={isSavingEmployee}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="role"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Role
                    </label>
                    <select
                      id="role"
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({ ...formData, role: e.target.value })
                      }
                      className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none transition-all"
                      disabled={isSavingEmployee}
                    >
                      <option value="employee">Employee</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="status"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Status
                    </label>
                    <select
                      id="status"
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                      className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none transition-all"
                      disabled={isSavingEmployee}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div className="md:col-span-1">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="shift"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Assign Shift
                      </label>

                      {/* Add More Shift Timings Link */}
                      <span
                        onClick={() => router.push("/shifts")}
                        className="text-sm text-orange-600 cursor-pointer hover:underline"
                      >
                        Add more shift timings
                      </span>
                    </div>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <select
                        id="shift"
                        value={formData.shiftId}
                        onChange={(e) =>
                          setFormData({ ...formData, shiftId: e.target.value })
                        }
                        className="w-full h-11 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none transition-all appearance-none bg-white"
                        disabled={isSavingEmployee}
                      >
                        <option value="">No Shift Assigned</option>
                        {shifts.map((shift) => (
                          <option key={shift.id} value={shift.id}>
                            {shift.name} ({shift.startTime} - {shift.endTime})
                            {shift.isDefault ? " - Default" : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Is this employee working remotely?
                  </label>
                  <div className="flex gap-6">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="isRemote"
                        value="true"
                        checked={formData.remote === true}
                        onChange={() =>
                          setFormData({ ...formData, remote: true })
                        }
                        className="w-4 h-4 text-orange-600 focus:ring-2 focus:ring-orange-600 cursor-pointer"
                        disabled={isSavingEmployee}
                      />
                      <span className="ml-2 text-sm text-gray-700">Yes</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="isRemote"
                        value="false"
                        checked={formData.remote === false}
                        onChange={() =>
                          setFormData({ ...formData, remote: false })
                        }
                        className="w-4 h-4 text-orange-600 focus:ring-2 focus:ring-orange-600 cursor-pointer"
                        disabled={isSavingEmployee}
                      />
                      <span className="ml-2 text-sm text-gray-700">No</span>
                    </label>
                  </div>
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> If set to "Yes", the employee will
                      be able to check-in/check-out even when not within the
                      office location range.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isSavingEmployee}
                    className="h-11 px-6 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors disabled:bg-orange-400 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSavingEmployee ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Adding Employee...
                      </>
                    ) : (
                      "Add Employee"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={isSavingEmployee}
                    className="h-11 px-6 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Employee Table */}
        <CommonTable
          data={employees}
          columns={columns}
          loading={loading}
          hover={true}
          striped={true}
          responsive={true}
          perPage={10}
          showPagination={true}
          showSearch={true}
          searchPlaceholder="Search employees..."
          emptyMessage="No employees found. Add your first employee to get started."
          emptyIcon="bi-people"
          sortable={true}
          showColumnToggle={true}
          showPerPageSelector={true}
          exportable={true}
          selectableRows={false}
          rowClickable={false}
        />
      </div>

      {/* Import Modal */}
      <ImportEmployeeModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportEmployees}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={deleteConfirmation.isOpen}
        onClose={() =>
          setDeleteConfirmation({
            isOpen: false,
            employee: null,
            isDeleting: false,
          })
        }
        onConfirm={confirmDelete}
        employeeName={
          deleteConfirmation.employee
            ? `${deleteConfirmation.employee.firstName} ${deleteConfirmation.employee.lastName}`
            : ""
        }
        isDeleting={deleteConfirmation.isDeleting}
      />
    </DashboardLayout>
  );
}
