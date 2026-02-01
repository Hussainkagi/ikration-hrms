"use client";

import { Moon, Sun, Palette, Check } from "lucide-react";
import { useTheme } from "@/contexts/theme-context";
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function ThemeToggle() {
  const {
    themeMode,
    colorTheme,
    toggleThemeMode,
    setColorTheme,
    predefinedThemes,
    createCustomTheme,
  } = useTheme();
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [customColor, setCustomColor] = useState("#FB923C");

  const handleCustomColorSubmit = () => {
    createCustomTheme({
      primary: customColor,
      secondary: customColor,
      accent: customColor,
      background: "#FFFFFF",
      foreground: "#1C1818",
    });
    setShowColorPicker(false);
  };

  return (
    <div className="flex items-center gap-2">
      {/* Theme Mode Toggle */}
      <button
        onClick={toggleThemeMode}
        className="relative inline-flex h-9 w-16 items-center rounded-full bg-secondary transition-colors hover:opacity-80"
        aria-label="Toggle theme mode"
        title={`Switch to ${themeMode === "light" ? "dark" : "light"} mode`}
      >
        <span
          className={`inline-block h-7 w-7 transform rounded-full bg-card transition-transform shadow-md ${
            themeMode === "dark" ? "translate-x-8" : "translate-x-1"
          }`}
        >
          {themeMode === "light" ? (
            <Sun className="h-7 w-7 p-1.5 text-amber-500" />
          ) : (
            <Moon className="h-7 w-7 p-1.5 text-blue-400" />
          )}
        </span>
      </button>

      {/* Color Theme Selector */}
      <Popover>
        <PopoverTrigger asChild>
          <button
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-secondary transition-colors hover:opacity-80"
            aria-label="Select color theme"
            title="Choose a color theme"
          >
            <Palette
              className="h-5 w-5"
              style={{ color: colorTheme.colors.primary }}
            />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4 bg-card border-border" align="end">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-card-foreground mb-3">
                Choose Color Theme
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {predefinedThemes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setColorTheme(theme)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all hover:scale-105 ${
                      colorTheme.id === theme.id
                        ? "border-primary bg-accent"
                        : "border-border bg-card"
                    }`}
                  >
                    <div
                      className="w-5 h-5 rounded-full"
                      style={{ backgroundColor: theme.colors.primary }}
                    />
                    <span className="text-sm font-medium text-card-foreground flex-1 text-left">
                      {theme.name}
                    </span>
                    {colorTheme.id === theme.id && (
                      <Check className="w-4 h-4 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-border">
              <h4 className="font-medium text-card-foreground mb-2 text-sm">
                Custom Color
              </h4>
              {showColorPicker ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={customColor}
                      onChange={(e) => setCustomColor(e.target.value)}
                      className="h-10 w-full rounded border-border cursor-pointer"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCustomColorSubmit}
                      className="flex-1 px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
                    >
                      Apply
                    </button>
                    <button
                      onClick={() => setShowColorPicker(false)}
                      className="flex-1 px-3 py-2 bg-secondary text-secondary-foreground rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowColorPicker(true)}
                  className="w-full px-3 py-2 bg-secondary text-secondary-foreground rounded-lg hover:opacity-90 transition-opacity text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Palette className="w-4 h-4" />
                  Create Custom Theme
                </button>
              )}
              {colorTheme.id === "custom" && !showColorPicker && (
                <div className="mt-2 px-3 py-2 bg-accent rounded-lg">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-5 h-5 rounded-full"
                      style={{ backgroundColor: colorTheme.colors.primary }}
                    />
                    <span className="text-sm font-medium text-accent-foreground">
                      Custom Theme Active
                    </span>
                    <Check className="w-4 h-4 text-primary ml-auto" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
