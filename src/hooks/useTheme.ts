/**
 * Theme Management Hook
 *
 * Manages Light/Dark/System theme toggling with localStorage persistence.
 * Provides glassmorphic class names for UI components.
 */

import { useState, useCallback, useEffect } from "react";

export type ThemeMode = "light" | "dark" | "system";

interface UseThemeReturn {
  theme: ThemeMode;
  isDark: boolean;
  setTheme: (theme: ThemeMode) => void;
  glassClasses: string;
}

const THEME_STORAGE_KEY = "theme";

// Glassmorphic classes for panels
const GLASS_CLASSES = "backdrop-blur-xl bg-white/10 border border-white/20";

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "dark";
  if (window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return "dark";
}

function resolveTheme(mode: ThemeMode): "light" | "dark" {
  if (mode === "system") {
    return getSystemTheme();
  }
  return mode;
}

export function useTheme(): UseThemeReturn {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return (stored as ThemeMode) || "system";
  });

  const setTheme = useCallback((newTheme: ThemeMode) => {
    setThemeState(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
  }, []);

  const resolvedTheme = resolveTheme(theme);
  const isDark = resolvedTheme === "dark";

  return {
    theme,
    isDark,
    setTheme,
    glassClasses: GLASS_CLASSES,
  };
}
