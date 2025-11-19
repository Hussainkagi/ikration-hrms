'use client'

import { useState, useRef } from 'react'
import { X, Upload, FileSpreadsheet, Download } from 'lucide-react'
import * as XLSX from 'xlsx'
import { toast } from '@/hooks/use-toast'

interface ImportEmployeeModalProps {
  isOpen: boolean
  onClose: () => void
  onImport: (employees: Array<{ name: string; email: string }>) => void
}

export default function ImportEmployeeModal({ isOpen, onClose, onImport }: ImportEmployeeModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [previewData, setPreviewData] = useState<Array<{ name: string; email: string }>>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      const fileType = selectedFile.name.split('.').pop()?.toLowerCase()
      if (fileType !== 'xlsx' && fileType !== 'xls' && fileType !== 'csv') {
        toast({
          title: "Invalid File Type",
          description: "Please upload an Excel file (.xlsx, .xls) or CSV file.",
          variant: "destructive",
        })
        return
      }
      setFile(selectedFile)
      processFile(selectedFile)
    }
  }

  const processFile = async (file: File) => {
    setIsProcessing(true)
    try {
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data, { type: 'array' })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as Array<any>

      const employees = jsonData.map((row: any) => ({
        name: row.Name || row.name || row.NAME || '',
        email: row.Email || row.email || row.EMAIL || '',
      })).filter(emp => emp.name && emp.email)

      if (employees.length === 0) {
        toast({
          title: "No Valid Data",
          description: "Excel file must contain 'Name' and 'Email' columns with data.",
          variant: "destructive",
        })
        setFile(null)
      } else {
        setPreviewData(employees)
      }
    } catch (error) {
      toast({
        title: "Error Processing File",
        description: "Unable to read the Excel file. Please check the file format.",
        variant: "destructive",
      })
      setFile(null)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleImport = () => {
    if (previewData.length > 0) {
      onImport(previewData)
      handleClose()
    }
  }

  const handleClose = () => {
    setFile(null)
    setPreviewData([])
    onClose()
  }

  const downloadTemplate = () => {
    const template = [
      { Name: 'John Doe', Email: 'john.doe@company.com' },
      { Name: 'Jane Smith', Email: 'jane.smith@company.com' },
    ]
    const worksheet = XLSX.utils.json_to_sheet(template)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Employees')
    XLSX.writeFile(workbook, 'employee_template.xlsx')
    
    toast({
      title: "Template Downloaded",
      description: "Use this template to format your employee data.",
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Import Employees</h2>
            <p className="text-gray-500 text-sm mt-1">Upload an Excel file to import multiple employees</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Download Template Button */}
          <div className="mb-6">
            <button
              onClick={downloadTemplate}
              className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium"
            >
              <Download className="w-4 h-4" />
              Download Template
            </button>
            <p className="text-sm text-gray-500 mt-1">
              Download a sample Excel template with the required format
            </p>
          </div>

          {/* File Upload Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-orange-600 transition-colors cursor-pointer bg-gray-50"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="flex flex-col items-center gap-3">
              {file ? (
                <>
                  <FileSpreadsheet className="w-12 h-12 text-orange-600" />
                  <div>
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">Click to change file</p>
                  </div>
                </>
              ) : (
                <>
                  <Upload className="w-12 h-12 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">Click to upload Excel file</p>
                    <p className="text-sm text-gray-500">Supports .xlsx, .xls, and .csv files</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Preview Data */}
          {previewData.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold text-gray-900 mb-3">
                Preview ({previewData.length} employee{previewData.length !== 1 ? 's' : ''})
              </h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden max-h-60 overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Name</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.slice(0, 10).map((emp, idx) => (
                      <tr key={idx} className="border-t border-gray-100">
                        <td className="py-2 px-4 text-sm text-gray-900">{emp.name}</td>
                        <td className="py-2 px-4 text-sm text-gray-600">{emp.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {previewData.length > 10 && (
                  <div className="text-center py-2 text-sm text-gray-500 bg-gray-50">
                    ... and {previewData.length - 10} more
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-6 p-4 bg-orange-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">File Requirements:</h4>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li>Excel file must contain columns: <strong>Name</strong> and <strong>Email</strong></li>
              <li>Column names are case-insensitive</li>
              <li>Empty rows will be skipped automatically</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="flex-1 h-11 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={previewData.length === 0 || isProcessing}
            className="flex-1 h-11 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Processing...' : `Import ${previewData.length} Employee${previewData.length !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  )
}
