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
import { Plus, Pencil, Trash2, Mail, User, Phone, Upload } from "lucide-react";
import ImportEmployeeModal from "@/components/import-employee-modal";

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  role: string;
  status: string;
  createdAt: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default function EmployeesPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingEmployee, setIsAddingEmployee] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobileNumber: "",
    role: "employee",
    status: "active",
  });
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Get token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem("accessToken");
  };

  // Fetch employees from API
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
      console.error("Error fetching employees:", error);
      toast({
        title: "Error",
        description: "Failed to fetch employees. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = getAuthToken();

      const response = await fetch(`${API_BASE_URL}/user`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to add employee");

      toast({
        title: "Employee Added",
        description: `${formData.firstName} ${formData.lastName} has been added successfully.`,
      });

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
      });
    } catch (error) {
      console.error("Error saving employee:", error);
      toast({
        title: "Error",
        description: "Failed to save employee. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (employee: Employee) => {
    // Redirect to edit page
    router.push(`/employees/${employee.id}`);
  };

  const handleDelete = async (employee: Employee) => {
    if (
      !confirm(
        `Are you sure you want to delete ${employee.firstName} ${employee.lastName}?`
      )
    ) {
      return;
    }

    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/user/${employee.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to delete employee");

      toast({
        title: "Employee Deleted",
        description: `${employee.firstName} ${employee.lastName} has been removed from the system.`,
        variant: "destructive",
      });

      await fetchEmployees();
    } catch (error) {
      console.error("Error deleting employee:", error);
      toast({
        title: "Error",
        description: "Failed to delete employee. Please try again.",
        variant: "destructive",
      });
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
    });
  };

  const handleImportEmployees = async (
    importedEmployees: Array<{
      firstName: string;
      lastName: string;
      email: string;
      mobileNumber: string;
    }>
  ) => {
    try {
      const token = getAuthToken();

      // Import employees one by one
      const promises = importedEmployees.map((emp) =>
        fetch(`${API_BASE_URL}/user`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...emp,
            role: "employee",
            status: "active",
          }),
        })
      );

      await Promise.all(promises);

      toast({
        title: "Employees Imported",
        description: `${importedEmployees.length} employee(s) have been imported successfully.`,
      });

      setIsImportModalOpen(false);
      await fetchEmployees();
    } catch (error) {
      console.error("Error importing employees:", error);
      toast({
        title: "Error",
        description: "Failed to import employees. Please try again.",
        variant: "destructive",
      });
    }
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
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="h-11 px-6 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Add Employee
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="h-11 px-6 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors"
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
    </DashboardLayout>
  );
}
