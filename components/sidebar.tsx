"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Clock,
  Menu,
  X,
  Building2,
  LogOut,
  AlertCircle,
  UserCircle,
  ChartLine,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { ThemeToggle } from "@/components/theme-toggle";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "manager"],
  },
  {
    name: "Employees",
    href: "/employees",
    icon: Users,
    roles: ["admin", "manager"],
  },
  {
    name: "Clock in/out",
    href: "/tracking",
    icon: Clock,
    roles: ["admin", "manager", "employee"],
  },
  {
    name: "Track Report",
    href: "/report",
    icon: ChartLine,
    roles: ["admin", "manager"],
  },
  {
    name: "Company Profile",
    href: "/profile",
    icon: UserCircle,
    roles: ["admin", "manager"],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();

      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });

      setIsLogoutDialogOpen(false);
      router.push("/login");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      });
    }
  };

  const openLogoutDialog = () => {
    setIsLogoutDialogOpen(true);
  };

  // Filter navigation based on user role
  const filteredNavigation = navigation.filter(
    (item) => user?.role && item.roles.includes(user.role),
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col bg-card border-r border-border">
        <div className="flex flex-col flex-1 min-h-0">
          {/* Logo */}
          <div className="flex items-center gap-3 h-16 px-6 border-b border-border">
            <div className="w-10 h-10 bg-background rounded-lg flex items-center justify-center">
              <img src="./tlogo.png" alt="" />
            </div>
            <div className="flex flex-col flex-1">
              <span className="flex text-sm text-muted-foreground text-bold items-end justify-start">
                Ikration
              </span>
              <span className="text-xl font-bold">
                <span className="bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent">
                  team
                </span>
                <span className="text-foreground">Book</span>
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-3">
              Main Navigation
            </div>
            {filteredNavigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all no-underline ${
                    isActive
                      ? "bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 font-medium"
                      : "text-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                  style={{ textDecoration: "none" }}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-border">
            <button
              onClick={openLogoutDialog}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all w-full font-medium"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-card border-b border-border flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-background rounded-lg flex items-center justify-center">
            <img src="./tlogo.png" alt="" />
          </div>
          <div className="flex flex-col">
            <span className="flex text-sm text-muted-foreground text-bold items-end justify-start">
              Ikration
            </span>
            <span className="text-xl font-bold">
              <span className="bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent">
                team
              </span>
              <span className="text-foreground">Book</span>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Theme Toggle on Mobile */}
          {/* <ThemeToggle /> */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-accent"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-foreground" />
            ) : (
              <Menu className="w-6 h-6 text-foreground" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-card pt-16">
          <div className="flex flex-col h-[calc(100vh-4rem)]">
            {/* Navigation Links */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 mb-3">
                Main Navigation
              </div>
              {filteredNavigation.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? "bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 font-medium"
                        : "text-foreground hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Logout Button */}
            <div className="p-4 border-t border-border mt-auto">
              <button
                onClick={() => {
                  openLogoutDialog();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all w-full font-medium"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Dialog */}
      {isLogoutDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-card rounded-lg shadow-xl max-w-md w-full mx-4 p-6 border border-border">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/30 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Confirm Logout
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Are you sure you want to logout? You will be logged out of
                  your account and redirected to the login page.
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setIsLogoutDialogOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-foreground bg-background border border-border rounded-lg hover:bg-accent transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
