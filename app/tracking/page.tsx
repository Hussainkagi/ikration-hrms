'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/hooks/use-toast'
import { LogIn, LogOut, Clock, Calendar } from 'lucide-react'

interface TrackingRecord {
  id: string
  employeeName: string
  type: 'check-in' | 'check-out'
  timestamp: string
  image: string
}

const dummyEmployees = [
  { id: '1', name: 'John Doe', image: '/professional-male.jpg' },
  { id: '2', name: 'Sarah Smith', image: '/professional-female.png' },
  { id: '3', name: 'Mike Johnson', image: '/professional-male-2.jpg' },
]

export default function TrackingPage() {
  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [trackingRecords, setTrackingRecords] = useState<TrackingRecord[]>([])

  const handleCheckIn = () => {
    if (!selectedEmployee) {
      toast({
        title: "No Employee Selected",
        description: "Please select an employee first.",
        variant: "destructive",
      })
      return
    }

    const employee = dummyEmployees.find(emp => emp.id === selectedEmployee)
    if (!employee) return

    const newRecord: TrackingRecord = {
      id: Date.now().toString(),
      employeeName: employee.name,
      type: 'check-in',
      timestamp: new Date().toISOString(),
      image: employee.image,
    }

    setTrackingRecords([newRecord, ...trackingRecords])
    toast({
      title: "Checked In Successfully",
      description: `${employee.name} checked in at ${new Date().toLocaleTimeString()}`,
    })
  }

  const handleCheckOut = () => {
    if (!selectedEmployee) {
      toast({
        title: "No Employee Selected",
        description: "Please select an employee first.",
        variant: "destructive",
      })
      return
    }

    const employee = dummyEmployees.find(emp => emp.id === selectedEmployee)
    if (!employee) return

    const newRecord: TrackingRecord = {
      id: Date.now().toString(),
      employeeName: employee.name,
      type: 'check-out',
      timestamp: new Date().toISOString(),
      image: employee.image,
    }

    setTrackingRecords([newRecord, ...trackingRecords])
    toast({
      title: "Checked Out Successfully",
      description: `${employee.name} checked out at ${new Date().toLocaleTimeString()}`,
    })
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString(),
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employee Tracking</h1>
          <p className="text-gray-500 mt-1">Record employee check-in and check-out times</p>
        </div>

        {/* Check-in/out Form */}
        <Card>
          <CardHeader>
            <CardTitle>Time Tracking</CardTitle>
            <CardDescription>Select an employee and record their attendance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Employee
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {dummyEmployees.map((employee) => (
                  <button
                    key={employee.id}
                    onClick={() => setSelectedEmployee(employee.id)}
                    className={`p-4 border-2 rounded-xl transition-all ${
                      selectedEmployee === employee.id
                        ? 'border-orange-600 bg-orange-50'
                        : 'border-gray-200 hover:border-orange-300 bg-white'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <img
                        src={employee.image || "/placeholder.svg"}
                        alt={employee.name}
                        className="w-20 h-20 rounded-full object-cover"
                      />
                      <span className="font-medium text-gray-900">{employee.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleCheckIn}
                disabled={!selectedEmployee}
                className="flex-1 h-14 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <LogIn className="w-5 h-5" />
                Check In
              </button>
              <button
                onClick={handleCheckOut}
                disabled={!selectedEmployee}
                className="flex-1 h-14 bg-gray-700 hover:bg-gray-800 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                Check Out
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Tracking History */}
        <Card>
          <CardHeader>
            <CardTitle>Tracking History</CardTitle>
            <CardDescription>Recent check-in and check-out records</CardDescription>
          </CardHeader>
          <CardContent>
            {trackingRecords.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>No tracking records yet. Start tracking employee attendance.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {trackingRecords.map((record) => {
                  const { date, time } = formatTimestamp(record.timestamp)
                  return (
                    <div
                      key={record.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={record.image || "/placeholder.svg"}
                          alt={record.employeeName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{record.employeeName}</p>
                          <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {date}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {time}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <span
                          className={`px-4 py-2 rounded-full text-sm font-medium ${
                            record.type === 'check-in'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {record.type === 'check-in' ? 'Checked In' : 'Checked Out'}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
