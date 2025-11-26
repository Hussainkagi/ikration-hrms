"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

interface AuthGuardProps {
  children: React.ReactNode;
  publicRoutes?: string[];
}

export function AuthGuard({
  children,
  publicRoutes = ["/login", "/register", "/setup-password"],
}: AuthGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isPublicRoute = publicRoutes.includes(pathname);

  // Routes that employees cannot access
  const employeeRestrictedRoutes = ["/dashboard", "/employees"];

  useEffect(() => {
    if (!isLoading) {
      // Not authenticated - redirect to login
      if (!isAuthenticated && !isPublicRoute) {
        router.push("/login");
        return;
      }

      // Authenticated but on public route - redirect to appropriate page
      if (isAuthenticated && isPublicRoute) {
        if (user?.role === "employee") {
          router.push("/tracking");
        } else {
          router.push("/dashboard");
        }
        return;
      }

      // Employee trying to access restricted routes
      if (
        isAuthenticated &&
        user?.role === "employee" &&
        employeeRestrictedRoutes.includes(pathname)
      ) {
        router.push("/tracking");
        return;
      }
    }
  }, [isAuthenticated, isLoading, isPublicRoute, router, pathname, user]);

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600" />
      </div>
    );
  }

  // Show nothing while redirecting
  if (
    (!isAuthenticated && !isPublicRoute) ||
    (isAuthenticated && isPublicRoute) ||
    (user?.role === "employee" && employeeRestrictedRoutes.includes(pathname))
  ) {
    return null;
  }

  return <>{children}</>;
}
