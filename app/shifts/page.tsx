"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard-layout";
import { useRouter } from "next/navigation";
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
import { Plus, Trash2, Clock, Calendar, Pencil, ArrowLeft } from "lucide-react";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";

interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  lateTime: string;
  days: number[];
  createdAt?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function ShiftsPage() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingShift, setIsAddingShift] = useState(false);
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    startTime: "",
    endTime: "",
    lateTime: "",
    days: [0, 0, 0, 0, 0, 0, 0],
  });
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    shift: Shift | null;
    isDeleting: boolean;
  }>({
    isOpen: false,
    shift: null,
    isDeleting: false,
  });

  const getAuthToken = () => {
    return localStorage.getItem("accessToken");
  };

  const fetchShifts = async () => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = getAuthToken();

      const response = await fetch(`${API_BASE_URL}/shift`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        console.log("err", errorData);

        const apiMessage =
          errorData?.message ||
          errorData?.error ||
          "Failed to update shift. Please try again.";

        throw new Error(apiMessage);
      }

      toast({
        title: "Shift Added",
        description: `${formData.name} has been added successfully.`,
      });

      await fetchShifts();
      setIsAddingShift(false);
      setFormData({
        name: "",
        startTime: "",
        endTime: "",
        lateTime: "",
        days: [0, 0, 0, 0, 0, 0, 0],
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to save shift. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (employee: Shift) => {
    // Redirect to edit page
    router.push(`/shifts/${employee.id}`);
  };

  const handleDelete = (shift: Shift) => {
    setDeleteConfirmation({
      isOpen: true,
      shift: shift,
      isDeleting: false,
    });
  };

  const confirmDelete = async () => {
    if (!deleteConfirmation.shift) return;

    setDeleteConfirmation((prev) => ({ ...prev, isDeleting: true }));

    try {
      const token = getAuthToken();
      const response = await fetch(
        `${API_BASE_URL}/shift/${deleteConfirmation.shift.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to delete shift");

      setTimeout(async () => {
        toast({
          title: "Shift Deleted",
          description: `${deleteConfirmation.shift?.name} has been removed from the system.`,
          variant: "destructive",
        });
        await fetchShifts();
        setDeleteConfirmation({
          isOpen: false,
          shift: null,
          isDeleting: false,
        });
      }, 800);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete shift. Please try again.",
        variant: "destructive",
      });
      setDeleteConfirmation((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  const handleCancel = () => {
    setIsAddingShift(false);
    setFormData({
      name: "",
      startTime: "",
      endTime: "",
      lateTime: "",
      days: [0, 0, 0, 0, 0, 0, 0],
    });
  };

  const toggleDay = (index: number) => {
    const newDays = [...formData.days];
    newDays[index] = newDays[index] === 0 ? 1 : 0;
    setFormData({ ...formData, days: newDays });
  };

  const formatDays = (days: number[]) => {
    return DAYS_OF_WEEK.filter((_, index) => days[index] === 1).join(", ");
  };

  // Define columns for CommonTable
  const columns = [
    {
      key: "name",
      header: "Shift Name",
      sortable: true,
      searchable: true,
      filterable: true,
      render: (row: Shift) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="font-medium text-gray-900">{row.name}</span>
        </div>
      ),
    },
    {
      key: "time",
      header: "Time",
      sortable: true,
      render: (row: Shift) => (
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-gray-700">
            {row.startTime} - {row.endTime}
          </span>
        </div>
      ),
    },
    {
      key: "lateTime",
      header: "Late Time",
      sortable: true,
      searchable: true,
      render: (row: Shift) => (
        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
          {row.lateTime}
        </span>
      ),
    },
    {
      key: "days",
      header: "Working Days",
      sortable: false,
      render: (row: Shift) => (
        <span className="text-sm text-gray-700">{formatDays(row.days)}</span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      sortable: false,
      render: (row: Shift) => (
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
            title="Delete shift"
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
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="flex items-center text-orange-600 hover:text-orange-700 font-medium w-fit"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </button>

          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Shifts
            </h1>
            <p className="text-gray-500 mt-1 text-sm sm:text-base">
              Manage your work shift schedules
            </p>
          </div>

          {!isAddingShift && (
            <Button
              onClick={() => setIsAddingShift(true)}
              className="bg-orange-600 hover:bg-orange-700 text-white w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Shift
            </Button>
          )}
        </div>

        {/* Add Shift Form */}
        {isAddingShift && (
          <Card>
            <CardHeader>
              <CardTitle>Add New Shift</CardTitle>
              <CardDescription>
                Create a new shift schedule with working days and hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Shift Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., Morning Shift"
                    className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label
                      htmlFor="startTime"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Start Time
                    </label>
                    <input
                      id="startTime"
                      type="time"
                      value={formData.startTime}
                      onChange={(e) =>
                        setFormData({ ...formData, startTime: e.target.value })
                      }
                      className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="endTime"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      End Time
                    </label>
                    <input
                      id="endTime"
                      type="time"
                      value={formData.endTime}
                      onChange={(e) =>
                        setFormData({ ...formData, endTime: e.target.value })
                      }
                      className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="lateTime"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Late Time
                    </label>
                    <input
                      id="lateTime"
                      type="time"
                      value={formData.lateTime}
                      onChange={(e) =>
                        setFormData({ ...formData, lateTime: e.target.value })
                      }
                      className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Working Days
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {DAYS_OF_WEEK.map((day, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => toggleDay(index)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          formData.days[index] === 1
                            ? "bg-orange-600 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Select the working days for this shift
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="h-11 px-6 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Add Shift
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

        {/* Shifts Table */}
        <CommonTable
          data={shifts}
          columns={columns}
          loading={loading}
          hover={true}
          striped={true}
          responsive={true}
          perPage={10}
          showPagination={true}
          showSearch={true}
          searchPlaceholder="Search shifts..."
          emptyMessage="No shifts found. Add your first shift to get started."
          emptyIcon={<Clock className="w-12 h-12" />}
          sortable={true}
          showColumnToggle={true}
          showPerPageSelector={true}
          exportable={true}
          selectableRows={false}
          rowClickable={false}
        />
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={deleteConfirmation.isOpen}
        onClose={() =>
          setDeleteConfirmation({
            isOpen: false,
            shift: null,
            isDeleting: false,
          })
        }
        onConfirm={confirmDelete}
        employeeName={deleteConfirmation.shift?.name || ""}
        isDeleting={deleteConfirmation.isDeleting}
      />
    </DashboardLayout>
  );
}
