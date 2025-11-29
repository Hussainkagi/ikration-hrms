"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
  role: "employee" | "admin" | "manager"; // Add other roles as needed
  status: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "YOUR_BASE_URL_HERE";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserFromAPI = async () => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      // Get user ID from token or localStorage
      const userId = localStorage.getItem("userId");

      if (!userId) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${BASE_URL}/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user");
      }

      const userData = await response.json();
      setUser(userData);
    } catch (error) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userId");
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserFromAPI();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error("Login failed");
    }

    const { user: userData, accessToken } = await response.json();

    // Save token and user ID
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("userId", userData.id);

    setUser(userData);
  };

  const logout = async () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userId");
    setUser(null);
  };

  const refreshUser = async () => {
    await fetchUserFromAPI();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
