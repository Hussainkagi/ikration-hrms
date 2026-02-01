"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

type ThemeMode = "light" | "dark";

interface ColorTheme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
  };
}

interface ThemeContextType {
  themeMode: ThemeMode;
  colorTheme: ColorTheme;
  toggleThemeMode: () => void;
  setThemeMode: (mode: ThemeMode) => void;
  setColorTheme: (theme: ColorTheme) => void;
  predefinedThemes: ColorTheme[];
  createCustomTheme: (colors: ColorTheme["colors"]) => void;
}

const predefinedThemes: ColorTheme[] = [
  {
    id: "default",
    name: "Default Orange",
    colors: {
      primary: "#FB923C", // orange-400
      secondary: "#FDBA74", // orange-300
      accent: "#F97316", // orange-500
      background: "#FFFFFF",
      foreground: "#1C1818",
    },
  },
  {
    id: "blue",
    name: "Ocean Blue",
    colors: {
      primary: "#3B82F6", // blue-500
      secondary: "#60A5FA", // blue-400
      accent: "#2563EB", // blue-600
      background: "#FFFFFF",
      foreground: "#1C1818",
    },
  },
  {
    id: "green",
    name: "Forest Green",
    colors: {
      primary: "#10B981", // emerald-500
      secondary: "#34D399", // emerald-400
      accent: "#059669", // emerald-600
      background: "#FFFFFF",
      foreground: "#1C1818",
    },
  },
  {
    id: "purple",
    name: "Royal Purple",
    colors: {
      primary: "#8B5CF6", // violet-500
      secondary: "#A78BFA", // violet-400
      accent: "#7C3AED", // violet-600
      background: "#FFFFFF",
      foreground: "#1C1818",
    },
  },
  {
    id: "pink",
    name: "Rose Pink",
    colors: {
      primary: "#EC4899", // pink-500
      secondary: "#F472B6", // pink-400
      accent: "#DB2777", // pink-600
      background: "#FFFFFF",
      foreground: "#1C1818",
    },
  },
  {
    id: "teal",
    name: "Teal Aqua",
    colors: {
      primary: "#14B8A6", // teal-500
      secondary: "#2DD4BF", // teal-400
      accent: "#0D9488", // teal-600
      background: "#FFFFFF",
      foreground: "#1C1818",
    },
  },
  {
    id: "amber",
    name: "Amber Gold",
    colors: {
      primary: "#F59E0B", // amber-500
      secondary: "#FBBF24", // amber-400
      accent: "#D97706", // amber-600
      background: "#FFFFFF",
      foreground: "#1C1818",
    },
  },
  {
    id: "red",
    name: "Ruby Red",
    colors: {
      primary: "#EF4444", // red-500
      secondary: "#F87171", // red-400
      accent: "#DC2626", // red-600
      background: "#FFFFFF",
      foreground: "#1C1818",
    },
  },
];

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>("light");
  const [colorTheme, setColorThemeState] = useState<ColorTheme>(
    predefinedThemes[0],
  );
  const [mounted, setMounted] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const storedMode = localStorage.getItem("hrms_theme_mode") as ThemeMode;
    const storedColorTheme = localStorage.getItem("hrms_color_theme");
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
      .matches
      ? "dark"
      : "light";

    setThemeModeState(storedMode || systemTheme);

    if (storedColorTheme) {
      try {
        const parsedTheme = JSON.parse(storedColorTheme);
        setColorThemeState(parsedTheme);
      } catch (e) {
        console.error("Failed to parse stored color theme");
      }
    }
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (!mounted) return;

    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(themeMode);

    // Apply CSS variables for the color theme
    applyColorTheme(colorTheme, themeMode);

    // Persist to localStorage
    localStorage.setItem("hrms_theme_mode", themeMode);
    localStorage.setItem("hrms_color_theme", JSON.stringify(colorTheme));
  }, [themeMode, colorTheme, mounted]);

  const applyColorTheme = (theme: ColorTheme, mode: ThemeMode) => {
    const root = window.document.documentElement;

    // Convert hex to RGB for better manipulation
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
          }
        : { r: 0, g: 0, b: 0 };
    };

    const rgbToOklch = (r: number, g: number, b: number) => {
      // Simplified conversion - in production, use a proper color conversion library
      const rNorm = r / 255;
      const gNorm = g / 255;
      const bNorm = b / 255;
      const lightness =
        (Math.max(rNorm, gNorm, bNorm) + Math.min(rNorm, gNorm, bNorm)) / 2;
      return `oklch(${lightness} 0.15 ${Math.random() * 360})`;
    };

    if (mode === "light") {
      // Light mode colors
      root.style.setProperty("--primary", theme.colors.primary);
      root.style.setProperty("--primary-foreground", "#FFFFFF");
      root.style.setProperty("--secondary", `${theme.colors.primary}15`); // 15% opacity
      root.style.setProperty("--secondary-foreground", theme.colors.foreground);
      root.style.setProperty("--accent", `${theme.colors.primary}20`); // 20% opacity
      root.style.setProperty("--accent-foreground", theme.colors.foreground);
      root.style.setProperty("--background", theme.colors.background);
      root.style.setProperty("--foreground", theme.colors.foreground);
      root.style.setProperty("--card", "#FFFFFF");
      root.style.setProperty("--card-foreground", theme.colors.foreground);
      root.style.setProperty("--muted", "#F5F5F5");
      root.style.setProperty("--muted-foreground", "#6B7280");
      root.style.setProperty("--border", "#E5E7EB");
      root.style.setProperty("--input", "#E5E7EB");
      root.style.setProperty("--ring", theme.colors.primary);
    } else {
      // Dark mode colors
      root.style.setProperty("--primary", theme.colors.primary);
      root.style.setProperty("--primary-foreground", "#FFFFFF");
      root.style.setProperty("--secondary", "#2A2A2A");
      root.style.setProperty("--secondary-foreground", "#FFFFFF");
      root.style.setProperty("--accent", "#2A2A2A");
      root.style.setProperty("--accent-foreground", "#FFFFFF");
      root.style.setProperty("--background", "#1C1818");
      root.style.setProperty("--foreground", "#FFFFFF");
      root.style.setProperty("--card", "#1C1818");
      root.style.setProperty("--card-foreground", "#FFFFFF");
      root.style.setProperty("--muted", "#2A2A2A");
      root.style.setProperty("--muted-foreground", "#9CA3AF");
      root.style.setProperty("--border", "#374151");
      root.style.setProperty("--input", "#374151");
      root.style.setProperty("--ring", theme.colors.primary);
    }

    // Apply primary color variations for different states
    root.style.setProperty(
      "--primary-hover",
      darkenColor(theme.colors.primary, 10),
    );
    root.style.setProperty(
      "--primary-light",
      lightenColor(theme.colors.primary, 20),
    );
  };

  const darkenColor = (color: string, percent: number) => {
    const rgb = hexToRgb(color);
    const factor = 1 - percent / 100;
    return `rgb(${Math.round(rgb.r * factor)}, ${Math.round(rgb.g * factor)}, ${Math.round(rgb.b * factor)})`;
  };

  const lightenColor = (color: string, percent: number) => {
    const rgb = hexToRgb(color);
    const factor = percent / 100;
    return `rgb(${Math.round(rgb.r + (255 - rgb.r) * factor)}, ${Math.round(rgb.g + (255 - rgb.g) * factor)}, ${Math.round(rgb.b + (255 - rgb.b) * factor)})`;
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 };
  };

  const setThemeMode = (newMode: ThemeMode) => {
    setThemeModeState(newMode);
  };

  const toggleThemeMode = () => {
    setThemeModeState((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

  const setColorTheme = (theme: ColorTheme) => {
    setColorThemeState(theme);
  };

  const createCustomTheme = (colors: ColorTheme["colors"]) => {
    const customTheme: ColorTheme = {
      id: "custom",
      name: "Custom Theme",
      colors,
    };
    setColorThemeState(customTheme);
  };

  // Prevent flash of unstyled content
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        colorTheme,
        toggleThemeMode,
        setThemeMode,
        setColorTheme,
        predefinedThemes,
        createCustomTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
