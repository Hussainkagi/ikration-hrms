"use client";

import { useState, useRef, useEffect } from "react";
import { X, ScrollText } from "lucide-react";

interface AgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAgree: () => void;
}

export function AgreementModal({
  isOpen,
  onClose,
  onAgree,
}: AgreementModalProps) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset scroll state when modal opens
    if (isOpen) {
      setHasScrolledToBottom(false);
    }
  }, [isOpen]);

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;

    if (isAtBottom) {
      setHasScrolledToBottom(true);
    }
  };

  const handleAgree = () => {
    onAgree();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <ScrollText className="w-5 h-5 text-orange-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              Location Tracking Agreement
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-6 space-y-4 text-gray-700"
        >
          <div className="prose prose-sm max-w-none">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Terms and Conditions
            </h3>

            <p className="mb-4">
              By using this attendance tracking system, you agree to the
              following terms and conditions regarding location tracking and
              data usage.
            </p>

            <h4 className="font-semibold text-gray-900 mt-6 mb-2">
              1. Location Data Collection
            </h4>
            <p className="mb-4">
              This application collects your geographic location data (latitude
              and longitude coordinates) for the purpose of verifying your
              attendance at designated office locations. Location data is
              collected only when you actively use the check-in/check-out
              features of the application.
            </p>

            <h4 className="font-semibold text-gray-900 mt-6 mb-2">
              2. Purpose of Data Collection
            </h4>
            <p className="mb-4">
              The location data collected is used exclusively for:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Verifying employee presence at designated work locations</li>
              <li>Recording accurate attendance timestamps</li>
              <li>Generating attendance reports and analytics</li>
              <li>Ensuring compliance with company attendance policies</li>
            </ul>

            <h4 className="font-semibold text-gray-900 mt-6 mb-2">
              3. Data Storage and Security
            </h4>
            <p className="mb-4">
              Your location data is stored securely and is accessible only to
              authorized personnel within your organization. We implement
              industry-standard security measures to protect your data from
              unauthorized access, disclosure, or misuse.
            </p>

            <h4 className="font-semibold text-gray-900 mt-6 mb-2">
              4. Data Retention
            </h4>
            <p className="mb-4">
              Location data is retained for the duration of your employment and
              may be stored for up to 7 years thereafter for compliance and
              record-keeping purposes, in accordance with applicable labor laws
              and regulations.
            </p>

            <h4 className="font-semibold text-gray-900 mt-6 mb-2">
              5. Geofencing Technology
            </h4>
            <p className="mb-4">
              The application uses geofencing technology to establish virtual
              boundaries around designated office locations. You will only be
              able to check in when you are within the specified radius of the
              office location. The geofence radius is set by your organization
              and is displayed during the setup process.
            </p>

            <h4 className="font-semibold text-gray-900 mt-6 mb-2">
              6. Your Rights
            </h4>
            <p className="mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Access your location data and attendance records</li>
              <li>Request corrections to inaccurate data</li>
              <li>Understand how your data is being used</li>
              <li>Withdraw consent (subject to employment obligations)</li>
            </ul>

            <h4 className="font-semibold text-gray-900 mt-6 mb-2">
              7. Consent
            </h4>
            <p className="mb-4">
              By clicking "I Agree" below, you confirm that:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>You have read and understood this agreement</li>
              <li>
                You consent to the collection of your location data as described
              </li>
              <li>
                You understand that accurate location data is required for
                attendance tracking
              </li>
              <li>
                You agree to comply with your organization's attendance policies
              </li>
            </ul>

            <h4 className="font-semibold text-gray-900 mt-6 mb-2">
              8. Changes to This Agreement
            </h4>
            <p className="mb-4">
              We reserve the right to modify this agreement at any time. You
              will be notified of any significant changes and may be required to
              review and accept the updated terms.
            </p>

            <h4 className="font-semibold text-gray-900 mt-6 mb-2">
              9. Contact Information
            </h4>
            <p className="mb-4">
              If you have any questions or concerns about this agreement or how
              your location data is handled, please contact your HR department
              or system administrator.
            </p>

            <div className="mt-8 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-900 font-medium">
                Important: Your continued use of this application constitutes
                acceptance of these terms and conditions. If you do not agree
                with these terms, please do not proceed with the setup.
              </p>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        {!hasScrolledToBottom && (
          <div className="px-6 py-3 bg-orange-50 border-t border-orange-200">
            <p className="text-sm text-orange-700 text-center">
              Please scroll to the bottom to read the complete agreement
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 h-11 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAgree}
            disabled={!hasScrolledToBottom}
            className="flex-1 h-11 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-orange-600"
          >
            I Agree
          </button>
        </div>
      </div>
    </div>
  );
}
