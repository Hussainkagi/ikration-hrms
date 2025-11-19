'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'
import { Plus, Pencil, Trash2, Mail, User, Upload } from 'lucide-react'
import ImportEmployeeModal from '@/components/import-employee-modal'

interface Employee {
  id: string
  name: string
  email: string
  image: string
  createdAt: string
}

const initialEmployees: Employee[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@company.com',
    image: '/professional-male.jpg',
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'Sarah Smith',
    email: 'sarah.smith@company.com',
    image: '/professional-female.png',
    createdAt: '2024-01-20',
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike.johnson@company.com',
    image: '/professional-male-2.jpg',
    createdAt: '2024-02-01',
  },
]

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees)
  const [isAddingEmployee, setIsAddingEmployee] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [formData, setFormData] = useState({ name: '', email: '' })
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingEmployee) {
      // Edit employee
      setEmployees(employees.map(emp => 
        emp.id === editingEmployee.id 
          ? { ...emp, name: formData.name, email: formData.email }
          : emp
      ))
      toast({
        title: "Employee Updated",
        description: `${formData.name} has been updated successfully.`,
      })
      setEditingEmployee(null)
    } else {
      // Add new employee
      const newEmployee: Employee = {
        id: Date.now().toString(),
        name: formData.name,
        email: formData.email,
        image: `/placeholder.svg?height=40&width=40&query=${formData.name}`,
        createdAt: new Date().toISOString().split('T')[0],
      }
      setEmployees([...employees, newEmployee])
      toast({
        title: "Employee Added",
        description: `${formData.name} has been added successfully.`,
      })
      setIsAddingEmployee(false)
    }
    
    setFormData({ name: '', email: '' })
  }

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee)
    setFormData({ name: employee.name, email: employee.email })
    setIsAddingEmployee(true)
  }

  const handleDelete = (employee: Employee) => {
    setEmployees(employees.filter(emp => emp.id !== employee.id))
    toast({
      title: "Employee Deleted",
      description: `${employee.name} has been removed from the system.`,
      variant: "destructive",
    })
  }

  const handleCancel = () => {
    setIsAddingEmployee(false)
    setEditingEmployee(null)
    setFormData({ name: '', email: '' })
  }

  const handleImportEmployees = (importedEmployees: Array<{ name: string; email: string }>) => {
    const newEmployees: Employee[] = importedEmployees.map((emp) => ({
      id: Date.now().toString() + Math.random(),
      name: emp.name,
      email: emp.email,
      image: `/placeholder.svg?height=40&width=40&query=${emp.name}`,
      createdAt: new Date().toISOString().split('T')[0],
    }))
    
    setEmployees([...employees, ...newEmployees])
    toast({
      title: "Employees Imported",
      description: `${newEmployees.length} employee(s) have been imported successfully.`,
    })
    setIsImportModalOpen(false)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Employees</h1>
            <p className="text-gray-500 mt-1">Manage your employee records</p>
          </div>
          {!isAddingEmployee && (
            <div className="flex gap-3">
              <Button
                onClick={() => setIsImportModalOpen(true)}
                className="bg-white hover:bg-gray-50 text-orange-600 border border-orange-600"
              >
                <Upload className="w-4 h-4 mr-2" />
                Import from Excel
              </Button>
              <Button
                onClick={() => setIsAddingEmployee(true)}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Employee
              </Button>
            </div>
          )}
        </div>

        {/* Add/Edit Employee Form */}
        {isAddingEmployee && (
          <Card>
            <CardHeader>
              <CardTitle>{editingEmployee ? 'Edit Employee' : 'Add New Employee'}</CardTitle>
              <CardDescription>
                {editingEmployee ? 'Update employee information' : 'Enter employee details to create a new record'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="John Doe"
                        className="w-full h-11 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="john.doe@company.com"
                        className="w-full h-11 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-transparent outline-none transition-all"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="h-11 px-6 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors"
                  >
                    {editingEmployee ? 'Update Employee' : 'Add Employee'}
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
        <Card>
          <CardHeader>
            <CardTitle>Employee List</CardTitle>
            <CardDescription>View and manage all employees</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Employee</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Email</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Join Date</th>
                    <th className="text-right py-4 px-4 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-12 text-gray-500">
                        No employees found. Add your first employee to get started.
                      </td>
                    </tr>
                  ) : (
                    employees.map((employee) => (
                      <tr key={employee.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={employee.image || "/placeholder.svg"}
                              alt={employee.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                            <span className="font-medium text-gray-900">{employee.name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-600">{employee.email}</td>
                        <td className="py-4 px-4 text-gray-600">{employee.createdAt}</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEdit(employee)}
                              className="p-2 hover:bg-orange-50 text-orange-600 rounded-lg transition-colors"
                              title="Edit employee"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(employee)}
                              className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                              title="Delete employee"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Import Modal */}
      <ImportEmployeeModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportEmployees}
      />
    </DashboardLayout>
  )
}
