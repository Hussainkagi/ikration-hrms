"use client";

import { useState, useRef } from "react";
import { X, Upload, FileSpreadsheet, Download, Loader2 } from "lucide-react";
import * as XLSX from "xlsx";

interface ImportEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (
    employees: Array<{
      firstName: string;
      lastName: string;
      email: string;
      mobileNumber: string;
    }>
  ) => Promise<void>;
}

export default function ImportEmployeeModal({
  isOpen,
  onClose,
  onImport,
}: ImportEmployeeModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [validationStatus, setValidationStatus] = useState<
    "success" | "error" | null
  >(null);
  const [validationMessage, setValidationMessage] = useState<string>("");
  const [previewData, setPreviewData] = useState<
    Array<{
      firstName: string;
      lastName: string;
      email: string;
      mobileNumber: string;
    }>
  >([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const toast = (options: any) => {
    console.log(options.title, options.description);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const fileType = selectedFile.name.split(".").pop()?.toLowerCase();
      if (fileType !== "xlsx" && fileType !== "xls" && fileType !== "csv") {
        toast({
          title: "Invalid File Type",
          description: "Please upload an Excel file (.xlsx, .xls) or CSV file.",
          variant: "destructive",
        });
        return;
      }
      // Reset previous state
      setPreviewData([]);
      setValidationStatus(null);
      setValidationMessage("");
      setFile(selectedFile);
      processFile(selectedFile);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreviewData([]);
    setValidationStatus(null);
    setValidationMessage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as Array<any>;

      const employees = jsonData
        .map((row: any) => ({
          firstName:
            row.firstName ||
            row.FirstName ||
            row.firstname ||
            row.FIRSTNAME ||
            "",
          lastName:
            row.lastName || row.LastName || row.lastname || row.LASTNAME || "",
          email: row.email || row.Email || row.EMAIL || "",
          mobileNumber:
            row.mobileNumber ||
            row.MobileNumber ||
            row.mobilenumber ||
            row.MOBILENUMBER ||
            row.phone ||
            row.Phone ||
            row.PHONE ||
            "",
        }))
        .filter((emp) => emp.firstName && emp.lastName && emp.email);

      if (employees.length === 0) {
        toast({
          title: "No Valid Data",
          description:
            "Excel file must contain 'firstName', 'lastName', and 'email' columns with data.",
          variant: "destructive",
        });
        setFile(null);
      } else {
        setPreviewData(employees);
      }
    } catch (error) {
      toast({
        title: "Error Processing File",
        description:
          "Unable to read the Excel file. Please check the file format.",
        variant: "destructive",
      });
      setFile(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = async () => {
    if (previewData.length > 0) {
      setIsImporting(true);
      try {
        await onImport(previewData);
        // Only close after successful import
        handleClose();
      } catch (error) {
        // Keep modal open on error
        console.error("Import failed:", error);
        setIsImporting(false);
      }
    }
  };

  const handleClose = () => {
    // Prevent closing if import is in progress
    if (isImporting) {
      return;
    }

    setFile(null);
    setPreviewData([]);
    setValidationStatus(null);
    setValidationMessage("");
    setIsImporting(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  };

  const downloadTemplate = () => {
    const template = [
      {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@company.com",
        mobileNumber: "",
        role: "employee",
        status: "active",
      },
      {
        firstName: "Jane",
        lastName: "Smith",
        email: "jane.smith@company.com",
        mobileNumber: "",
        role: "employee",
        status: "active",
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(template);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Employees");
    XLSX.writeFile(workbook, "employee_template.xlsx");

    toast({
      title: "Template Downloaded",
      description: "Use this template to format your employee data.",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Import Employees
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Upload an Excel file to import multiple employees
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={isImporting}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
              disabled={isImporting}
              className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              Download Template
            </button>
            <p className="text-sm text-gray-500 mt-1">
              Download a sample Excel template with the required format
            </p>
          </div>

          {/* File Upload Area */}
          <div className="space-y-3">
            <div
              onClick={() => !isImporting && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isImporting ? "cursor-not-allowed opacity-50" : "cursor-pointer"
              } ${
                validationStatus === "error"
                  ? "border-red-300 bg-red-50"
                  : validationStatus === "success"
                  ? "border-green-300 bg-green-50"
                  : "border-gray-300 bg-gray-50 hover:border-orange-600"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                disabled={isImporting}
                className="hidden"
              />
              <div className="flex flex-col items-center gap-3">
                {file ? (
                  <>
                    <FileSpreadsheet
                      className={`w-12 h-12 ${
                        validationStatus === "error"
                          ? "text-red-600"
                          : validationStatus === "success"
                          ? "text-green-600"
                          : "text-orange-600"
                      }`}
                    />
                    <div>
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {isImporting ? "Importing..." : "Click to change file"}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <Upload className="w-12 h-12 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">
                        Click to upload Excel file
                      </p>
                      <p className="text-sm text-gray-500">
                        Supports .xlsx, .xls, and .csv files
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Remove File Button */}
            {file && !isImporting && (
              <button
                onClick={handleRemoveFile}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
                Remove File
              </button>
            )}
          </div>

          {/* Importing Status */}
          {isImporting && (
            <div className="mt-4 p-4 rounded-lg flex items-start gap-3 bg-blue-50 border border-blue-200">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">
                  Importing Employees...
                </p>
                <p className="text-sm mt-1 text-blue-700">
                  Please wait while we add {previewData.length} employee
                  {previewData.length !== 1 ? "s" : ""} to the system. Do not
                  close this window.
                </p>
              </div>
            </div>
          )}

          {/* Validation Message */}
          {validationStatus && !isImporting && (
            <div
              className={`mt-4 p-4 rounded-lg flex items-start gap-3 ${
                validationStatus === "error"
                  ? "bg-red-50 border border-red-200"
                  : "bg-green-50 border border-green-200"
              }`}
            >
              <div
                className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                  validationStatus === "error" ? "bg-red-100" : "bg-green-100"
                }`}
              >
                {validationStatus === "error" ? (
                  <X className="w-3 h-3 text-red-600" />
                ) : (
                  <svg
                    className="w-3 h-3 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
              <div>
                <p
                  className={`font-medium ${
                    validationStatus === "error"
                      ? "text-red-900"
                      : "text-green-900"
                  }`}
                >
                  {validationStatus === "error"
                    ? "Validation Error"
                    : "Success"}
                </p>
                <p
                  className={`text-sm mt-1 ${
                    validationStatus === "error"
                      ? "text-red-700"
                      : "text-green-700"
                  }`}
                >
                  {validationMessage}
                </p>
              </div>
            </div>
          )}

          {/* Preview Data */}
          {previewData.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold text-gray-900 mb-3">
                Preview ({previewData.length} employee
                {previewData.length !== 1 ? "s" : ""})
              </h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden max-h-60 overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        First Name
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Last Name
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Email
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Mobile
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.slice(0, 10).map((emp, idx) => (
                      <tr key={idx} className="border-t border-gray-100">
                        <td className="py-2 px-4 text-sm text-gray-900">
                          {emp.firstName}
                        </td>
                        <td className="py-2 px-4 text-sm text-gray-900">
                          {emp.lastName}
                        </td>
                        <td className="py-2 px-4 text-sm text-gray-600">
                          {emp.email}
                        </td>
                        <td className="py-2 px-4 text-sm text-gray-600">
                          {emp.mobileNumber || "-"}
                        </td>
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
            <h4 className="font-medium text-gray-900 mb-2">
              File Requirements:
            </h4>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li>
                Excel file must contain columns: <strong>firstName</strong>,{" "}
                <strong>lastName</strong>, and <strong>email</strong>
              </li>
              <li>
                Optional column: <strong>mobileNumber</strong> (or phone)
              </li>
              <li>Column names are case-insensitive</li>
              <li>Empty rows will be skipped automatically</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200">
          <button
            onClick={handleClose}
            disabled={isImporting}
            className="flex-1 h-11 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={previewData.length === 0 || isProcessing || isImporting}
            className="flex-1 h-11 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isImporting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isImporting
              ? "Importing..."
              : isProcessing
              ? "Processing..."
              : `Import ${previewData.length} Employee${
                  previewData.length !== 1 ? "s" : ""
                }`}
          </button>
        </div>
      </div>
    </div>
  );
}
