"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function PrivacyPolicy() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const lastUpdated = "December 31, 2025";

  const navigationItems = [
    { id: "introduction", label: "Introduction" },
    { id: "information-we-collect", label: "Information We Collect" },
    { id: "location-permission", label: "Location Permission" },
    { id: "camera-permission", label: "Camera Permission" },
    { id: "notification-permission", label: "Notification Permission" },
    { id: "how-we-use", label: "How We Use Your Information" },
    { id: "data-sharing", label: "Data Sharing and Disclosure" },
    { id: "data-security", label: "Data Security" },
    { id: "data-retention", label: "Data Retention" },
    { id: "your-rights", label: "Your Rights" },
    { id: "third-party", label: "Third-Party Services" },
    { id: "children-privacy", label: "Children's Privacy" },
    { id: "changes", label: "Changes to This Privacy Policy" },
    { id: "contact", label: "Contact Us" },
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setSidebarOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 bg-white border-b border-orange-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                aria-label="Toggle menu"
              >
                {sidebarOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
              <h1 className="text-xl sm:text-2xl font-normal text-gray-900">
                <span className="font-medium text-orange-600">Teambook</span>{" "}
                Privacy & Terms
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="flex gap-8 lg:gap-12">
          <aside
            className={`
              fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] lg:h-auto
              w-64 lg:w-56 xl:w-64 flex-shrink-0
              bg-white lg:bg-transparent
              border-r border-orange-100 lg:border-0
              transition-transform duration-300 lg:transition-none
              z-40 lg:z-0
              ${
                sidebarOpen
                  ? "translate-x-0"
                  : "-translate-x-full lg:translate-x-0"
              }
            `}
          >
            <nav className="sticky top-20 py-4 lg:py-0 px-4 lg:px-0 overflow-y-auto max-h-[calc(100vh-8rem)]">
              <ul className="space-y-1">
                {navigationItems.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => scrollToSection(item.id)}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-700 rounded-lg transition-colors"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* Overlay for mobile */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/20 z-30 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Main Content */}
          <main className="flex-1 max-w-3xl pb-16">
            <div className="mb-12">
              <h2 className="text-3xl sm:text-4xl font-normal text-gray-900 mb-6">
                <span className="text-orange-600">Privacy Policy</span>
              </h2>
              <p className="text-sm text-gray-600">
                Last Updated: {lastUpdated}
              </p>
            </div>

            {/* Introduction */}
            <section id="introduction" className="mb-12 scroll-mt-20">
              <h3 className="text-2xl font-normal text-orange-600 mb-4">
                Introduction
              </h3>
              <p className="text-base text-gray-700 leading-relaxed">
                This Privacy Policy describes how Teambook Application ("App",
                "we", "us", or "our") collects, uses, and protects information
                when you use our check-in/check-out system for employee duty
                management. This policy applies to both our web application and
                mobile application.
              </p>
            </section>

            {/* Information We Collect */}
            <section id="information-we-collect" className="mb-12 scroll-mt-20">
              <h3 className="text-2xl font-normal text-orange-600 mb-4">
                Information We Collect
              </h3>

              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">
                    Personal Information
                  </h4>
                  <ul className="space-y-2 text-gray-700">
                    <li className="pl-4">• Name (First and Last Name)</li>
                    <li className="pl-4">• Email Address</li>
                    <li className="pl-4">• Mobile Number</li>
                    <li className="pl-4">• Employee ID</li>
                    <li className="pl-4">• Role and Department</li>
                    <li className="pl-4">• Employment Status</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">
                    Location Data
                  </h4>
                  <ul className="space-y-2 text-gray-700">
                    <li className="pl-4">
                      • GPS coordinates (latitude and longitude) at check-in
                      time
                    </li>
                    <li className="pl-4">
                      • GPS coordinates (latitude and longitude) at check-out
                      time
                    </li>
                    <li className="pl-4">• Location accuracy information</li>
                    <li className="pl-4">
                      • Location data is collected only when you perform
                      check-in or check-out actions
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">
                    Image Data
                  </h4>
                  <ul className="space-y-2 text-gray-700">
                    <li className="pl-4">
                      • Selfie photographs taken during check-in
                    </li>
                    <li className="pl-4">
                      • Selfie photographs taken during check-out
                    </li>
                    <li className="pl-4">
                      • Images are stored securely and used solely for
                      attendance verification
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">
                    Attendance Records
                  </h4>
                  <ul className="space-y-2 text-gray-700">
                    <li className="pl-4">• Check-in date and time</li>
                    <li className="pl-4">• Check-out date and time</li>
                    <li className="pl-4">
                      • Duty status (checked-in, checked-out, absent)
                    </li>
                    <li className="pl-4">• Duration of duty hours</li>
                    <li className="pl-4">• Historical attendance records</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">
                    Device Information
                  </h4>
                  <ul className="space-y-2 text-gray-700">
                    <li className="pl-4">• Device type and model</li>
                    <li className="pl-4">• Operating system version</li>
                    <li className="pl-4">• App version</li>
                    <li className="pl-4">
                      • Device identifiers (for notification delivery)
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Location Permission */}
            <section id="location-permission" className="mb-12 scroll-mt-20">
              <h3 className="text-2xl font-normal text-orange-600 mb-4">
                Location Permission
              </h3>
              <p className="text-base text-gray-700 leading-relaxed mb-4">
                We request location permission to verify your physical presence
                at duty locations during check-in and check-out. Location data
                is:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="pl-4">
                  • Collected only at the moment of check-in or check-out
                </li>
                <li className="pl-4">
                  • NOT tracked continuously or in the background
                </li>
                <li className="pl-4">
                  • Used to ensure attendance accuracy and prevent fraud
                </li>
                <li className="pl-4">
                  • Stored with your attendance records for verification
                  purposes
                </li>
                <li className="pl-4">
                  • Visible to authorized administrators and supervisors
                </li>
                <li className="pl-4">
                  • You must grant location permission to use the
                  check-in/check-out features
                </li>
              </ul>
            </section>

            {/* Camera Permission */}
            <section id="camera-permission" className="mb-12 scroll-mt-20">
              <h3 className="text-2xl font-normal text-orange-600 mb-4">
                Camera Permission
              </h3>
              <p className="text-base text-gray-700 leading-relaxed mb-4">
                We request camera permission to capture verification selfies
                during attendance recording. Camera access is:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="pl-4">
                  • Used only when you initiate check-in or check-out
                </li>
                <li className="pl-4">
                  • Required to take a selfie for identity verification
                </li>
                <li className="pl-4">• NOT accessed at any other time</li>
                <li className="pl-4">
                  • Selfies are stored securely on our servers
                </li>
                <li className="pl-4">
                  • Images are accessible only to authorized personnel
                </li>
                <li className="pl-4">
                  • Used to prevent buddy-punching and ensure attendance
                  integrity
                </li>
                <li className="pl-4">
                  • You must grant camera permission to complete
                  check-in/check-out
                </li>
              </ul>
            </section>

            {/* Notification Permission */}
            <section
              id="notification-permission"
              className="mb-12 scroll-mt-20"
            >
              <h3 className="text-2xl font-normal text-orange-600 mb-4">
                Notification Permission (Mobile App)
              </h3>
              <p className="text-base text-gray-700 leading-relaxed mb-4">
                Our mobile app requests notification permission to send you
                helpful reminders:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="pl-4">
                  • Check-in reminders at your scheduled duty start time
                </li>
                <li className="pl-4">
                  • Check-out reminders at your scheduled duty end time
                </li>
                <li className="pl-4">
                  • Important announcements from your organization
                </li>
                <li className="pl-4">• Attendance status updates</li>
                <li className="pl-4">
                  • Notifications can be disabled in your device settings
                </li>
                <li className="pl-4">
                  • We do NOT send promotional or marketing notifications
                </li>
                <li className="pl-4">
                  • Notification content is work-related only
                </li>
              </ul>
            </section>

            {/* How We Use Your Information */}
            <section id="how-we-use" className="mb-12 scroll-mt-20">
              <h3 className="text-2xl font-normal text-orange-600 mb-4">
                How We Use Your Information
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li className="pl-4">
                  • Verify employee attendance and work hours
                </li>
                <li className="pl-4">
                  • Track check-in and check-out times accurately
                </li>
                <li className="pl-4">
                  • Confirm employee identity through selfie verification
                </li>
                <li className="pl-4">
                  • Validate physical presence at duty locations
                </li>
                <li className="pl-4">
                  • Generate attendance reports for supervisors and HR
                </li>
                <li className="pl-4">• Calculate work hours and overtime</li>
                <li className="pl-4">• Manage duty rosters and schedules</li>
                <li className="pl-4">
                  • Send duty reminders and notifications
                </li>
                <li className="pl-4">
                  • Maintain historical attendance records
                </li>
                <li className="pl-4">
                  • Comply with employment regulations and company policies
                </li>
                <li className="pl-4">
                  • Investigate attendance disputes or discrepancies
                </li>
              </ul>
            </section>

            {/* Data Sharing and Disclosure */}
            <section id="data-sharing" className="mb-12 scroll-mt-20">
              <h3 className="text-2xl font-normal text-orange-600 mb-4">
                Data Sharing and Disclosure
              </h3>
              <p className="text-base text-gray-700 leading-relaxed mb-4">
                Your information is shared only within your organization:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="pl-4">
                  • Your direct supervisors and managers can view your
                  attendance records
                </li>
                <li className="pl-4">
                  • HR department has access for payroll and compliance purposes
                </li>
                <li className="pl-4">
                  • Company administrators can access data for system management
                </li>
                <li className="pl-4">
                  • We do NOT sell your personal information to third parties
                </li>
                <li className="pl-4">
                  • We do NOT share your data with external organizations
                  without consent
                </li>
                <li className="pl-4">
                  • Data may be disclosed if required by law or legal process
                </li>
                <li className="pl-4">
                  • Cloud storage providers (Google Drive) are used with strict
                  security measures
                </li>
              </ul>
            </section>

            {/* Data Security */}
            <section id="data-security" className="mb-12 scroll-mt-20">
              <h3 className="text-2xl font-normal text-orange-600 mb-4">
                Data Security
              </h3>
              <p className="text-base text-gray-700 leading-relaxed mb-4">
                We implement industry-standard security measures to protect your
                information:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="pl-4">
                  • All data transmission is encrypted using HTTPS/SSL
                </li>
                <li className="pl-4">
                  • Secure authentication with access tokens
                </li>
                <li className="pl-4">
                  • Images are stored on secure cloud storage (Google Drive)
                </li>
                <li className="pl-4">
                  • Role-based access control limits data visibility
                </li>
                <li className="pl-4">• Regular security audits and updates</li>
                <li className="pl-4">
                  • Passwords are encrypted and never stored in plain text
                </li>
                <li className="pl-4">
                  • Location data is stored with limited precision for privacy
                </li>
                <li className="pl-4">
                  • Access logs are maintained for security monitoring
                </li>
              </ul>
            </section>

            {/* Data Retention */}
            <section id="data-retention" className="mb-12 scroll-mt-20">
              <h3 className="text-2xl font-normal text-orange-600 mb-4">
                Data Retention
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li className="pl-4">
                  • Attendance records are retained as per company policy and
                  legal requirements
                </li>
                <li className="pl-4">
                  • Typically, records are kept for the duration of employment
                  plus applicable legal retention periods
                </li>
                <li className="pl-4">
                  • Selfie images are retained for verification purposes
                </li>
                <li className="pl-4">
                  • You may request deletion of your data upon employment
                  termination (subject to legal requirements)
                </li>
                <li className="pl-4">
                  • Backup data is retained for disaster recovery purposes
                </li>
              </ul>
            </section>

            {/* Your Rights */}
            <section id="your-rights" className="mb-12 scroll-mt-20">
              <h3 className="text-2xl font-normal text-orange-600 mb-4">
                Your Rights
              </h3>
              <p className="text-base text-gray-700 leading-relaxed mb-4">
                You have the following rights regarding your personal data:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="pl-4">
                  • Access your personal data and attendance records
                </li>
                <li className="pl-4">
                  • Request correction of inaccurate information
                </li>
                <li className="pl-4">
                  • Request deletion of your data (subject to legal retention
                  requirements)
                </li>
                <li className="pl-4">
                  • Opt-out of non-essential notifications
                </li>
                <li className="pl-4">
                  • Revoke app permissions (note: this will limit app
                  functionality)
                </li>
                <li className="pl-4">
                  • Request data portability (receive your data in a structured
                  format)
                </li>
                <li className="pl-4">
                  • File complaints with relevant data protection authorities
                </li>
              </ul>
            </section>

            <section id="third-party" className="mb-12 scroll-mt-20">
              <h3 className="text-2xl font-normal text-orange-600 mb-4">
                Third-Party Services
              </h3>
              <p className="text-base text-gray-700 leading-relaxed mb-4">
                We use the following third-party services to provide our
                application:
              </p>
              <div className="space-y-4">
                <div className="border border-orange-200 rounded-lg p-4 hover:border-orange-300 transition-colors">
                  <h4 className="font-medium text-gray-900 mb-2">
                    Google Drive
                  </h4>
                  <p className="text-sm text-gray-700 mb-2">
                    <span className="font-medium">Purpose:</span> Secure storage
                    of selfie images
                  </p>
                  <a
                    href="https://policies.google.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-orange-600 hover:text-orange-700 hover:underline"
                  >
                    View Privacy Policy
                  </a>
                </div>
                <div className="border border-orange-200 rounded-lg p-4 hover:border-orange-300 transition-colors">
                  <h4 className="font-medium text-gray-900 mb-2">
                    Cloud Hosting Services
                  </h4>
                  <p className="text-sm text-gray-700 mb-2">
                    <span className="font-medium">Purpose:</span> Application
                    hosting and data storage
                  </p>
                  <p className="text-sm text-gray-600">
                    Subject to provider's privacy policy
                  </p>
                </div>
              </div>
            </section>

            {/* Children's Privacy */}
            <section id="children-privacy" className="mb-12 scroll-mt-20">
              <h3 className="text-2xl font-normal text-orange-600 mb-4">
                Children's Privacy
              </h3>
              <p className="text-base text-gray-700 leading-relaxed">
                Our application is intended for use by employees of legal
                working age. We do not knowingly collect information from
                individuals under the age of 18. If you believe we have
                collected information from a minor, please contact us
                immediately.
              </p>
            </section>

            {/* Changes to This Privacy Policy */}
            <section id="changes" className="mb-12 scroll-mt-20">
              <h3 className="text-2xl font-normal text-orange-600 mb-4">
                Changes to This Privacy Policy
              </h3>
              <p className="text-base text-gray-700 leading-relaxed">
                We may update this Privacy Policy from time to time to reflect
                changes in our practices or for legal, operational, or
                regulatory reasons. We will notify you of any significant
                changes by posting the new policy on this page and updating the
                "Last Updated" date. We encourage you to review this policy
                periodically.
              </p>
            </section>

            {/* Contact Us */}
            <section id="contact" className="mb-12 scroll-mt-20">
              <h3 className="text-2xl font-normal text-orange-600 mb-4">
                Contact Us
              </h3>
              <p className="text-base text-gray-700 leading-relaxed mb-4">
                If you have any questions, concerns, or requests regarding this
                Privacy Policy or our data practices, please contact us:
              </p>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                <p className="text-sm text-gray-700 mb-2">
                  <span className="font-medium text-gray-900">Email:</span>{" "}
                  <a
                    href="mailto:support@teambook.com"
                    className="text-orange-600 hover:text-orange-700 hover:underline"
                  >
                    info@ikration.com
                  </a>
                </p>

                <p className="text-sm text-gray-700">
                  <span className="font-medium text-gray-900">
                    Response Time:
                  </span>{" "}
                  We aim to r espond to all inquiries within 48 business hours
                </p>
              </div>
            </section>

            <footer className="mt-16 pt-8 border-t border-orange-200">
              <p className="text-sm text-gray-600 text-center">
                By using the Teambook application, you acknowledge that you have
                read and understood this Privacy Policy and agree to its terms.
              </p>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}
