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
  publicRoutes = ["/login", "/register", "/verification"],
}: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isPublicRoute = publicRoutes.includes(pathname);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated && !isPublicRoute) {
        // User is not authenticated and trying to access protected route
        router.push("/login");
      } else if (isAuthenticated && isPublicRoute) {
        // User is authenticated and trying to access login/register
        router.push("/dashboard");
      }
    }
  }, [isAuthenticated, isLoading, isPublicRoute, router, pathname]);

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
      </div>
    );
  }

  // Show nothing while redirecting
  if (
    (!isAuthenticated && !isPublicRoute) ||
    (isAuthenticated && isPublicRoute)
  ) {
    return null;
  }

  return <>{children}</>;
}
