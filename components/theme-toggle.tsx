"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/theme-context";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex h-8 w-14 items-center rounded-full bg-secondary transition-colors hover:opacity-80"
      aria-label="Toggle theme"
    >
      <span
        className={`inline-block h-6 w-6 transform rounded-full bg-card transition-transform shadow-md ${
          theme === "dark" ? "translate-x-7" : "translate-x-1"
        }`}
      >
        {theme === "light" ? (
          <Sun className="h-6 w-6 p-1 text-orange-500" />
        ) : (
          <Moon className="h-6 w-6 p-1 text-blue-400" />
        )}
      </span>
    </button>
  );
}
