"use client";

import { useRouter } from "next/navigation";
import { Toaster } from "@/components/ui/toaster";
import Sidebar from "@/components/sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      {/* Main Content */}
      <main className="lg:pl-64 pt-16 lg:pt-0">
        {/* Top Bar */}
        {/* <div className="sticky top-0 z-10 bg-card border-b border-border px-6 py-4 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
             //some title
            </div>
            <div className="flex items-center gap-4">
          //some element
            </div>
          </div>
        </div> */}

        {/* Page Content */}
        <div className="p-6 lg:p-8">{children}</div>
      </main>

      <Toaster />
    </div>
  );
}
