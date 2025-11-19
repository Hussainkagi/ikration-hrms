'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

// Types
export interface Employee {
  id: string
  name: string
  email: string
  image: string
  createdAt: string
}

export interface TrackingRecord {
  id: string
  employeeId: string
  employeeName: string
  type: 'check-in' | 'check-out'
  timestamp: string
  image: string
}

export interface User {
  email: string
  name: string
  role: 'admin' | 'employee'
}

interface AppContextType {
  // User state
  user: User | null
  setUser: (user: User | null) => void
  isAuthenticated: boolean
  
  // Employees state
  employees: Employee[]
  addEmployee: (employee: Omit<Employee, 'id' | 'createdAt'>) => void
  updateEmployee: (id: string, employee: Partial<Employee>) => void
  deleteEmployee: (id: string) => void
  getEmployeeById: (id: string) => Employee | undefined
  
  // Tracking state
  trackingRecords: TrackingRecord[]
  addTrackingRecord: (record: Omit<TrackingRecord, 'id' | 'timestamp'>) => void
  getTrackingRecordsByEmployee: (employeeId: string) => TrackingRecord[]
  getTodayRecords: () => TrackingRecord[]
  
  // Utility functions
  clearAllData: () => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

// Initial data
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

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees)
  const [trackingRecords, setTrackingRecords] = useState<TrackingRecord[]>([])

  // Load data from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('hrms_user')
    const storedEmployees = localStorage.getItem('hrms_employees')
    const storedRecords = localStorage.getItem('hrms_tracking_records')

    if (storedUser) setUser(JSON.parse(storedUser))
    if (storedEmployees) setEmployees(JSON.parse(storedEmployees))
    if (storedRecords) setTrackingRecords(JSON.parse(storedRecords))
  }, [])

  // Persist data to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('hrms_user', JSON.stringify(user))
    } else {
      localStorage.removeItem('hrms_user')
    }
  }, [user])

  useEffect(() => {
    localStorage.setItem('hrms_employees', JSON.stringify(employees))
  }, [employees])

  useEffect(() => {
    localStorage.setItem('hrms_tracking_records', JSON.stringify(trackingRecords))
  }, [trackingRecords])

  // Employee functions
  const addEmployee = (employeeData: Omit<Employee, 'id' | 'createdAt'>) => {
    const newEmployee: Employee = {
      id: Date.now().toString(),
      ...employeeData,
      createdAt: new Date().toISOString().split('T')[0],
    }
    setEmployees([...employees, newEmployee])
  }

  const updateEmployee = (id: string, employeeData: Partial<Employee>) => {
    setEmployees(employees.map(emp => 
      emp.id === id ? { ...emp, ...employeeData } : emp
    ))
  }

  const deleteEmployee = (id: string) => {
    setEmployees(employees.filter(emp => emp.id !== id))
  }

  const getEmployeeById = (id: string) => {
    return employees.find(emp => emp.id === id)
  }

  // Tracking functions
  const addTrackingRecord = (recordData: Omit<TrackingRecord, 'id' | 'timestamp'>) => {
    const newRecord: TrackingRecord = {
      id: Date.now().toString(),
      ...recordData,
      timestamp: new Date().toISOString(),
    }
    setTrackingRecords([newRecord, ...trackingRecords])
  }

  const getTrackingRecordsByEmployee = (employeeId: string) => {
    return trackingRecords.filter(record => record.employeeId === employeeId)
  }

  const getTodayRecords = () => {
    const today = new Date().toISOString().split('T')[0]
    return trackingRecords.filter(record => 
      record.timestamp.split('T')[0] === today
    )
  }

  // Utility functions
  const clearAllData = () => {
    setUser(null)
    setEmployees(initialEmployees)
    setTrackingRecords([])
    localStorage.clear()
  }

  const value: AppContextType = {
    user,
    setUser,
    isAuthenticated: !!user,
    employees,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    getEmployeeById,
    trackingRecords,
    addTrackingRecord,
    getTrackingRecordsByEmployee,
    getTodayRecords,
    clearAllData,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

// Custom hook to use the context
export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
