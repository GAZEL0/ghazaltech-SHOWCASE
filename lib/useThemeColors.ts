"use client";

import { useEffect, useState } from "react";

type ThemeColors = {
  isLight: boolean;
  primary: string;
  accent: string;
  bg: string;
  glow: string;
};

/**
 * Reads current theme based on root class names. Falls back to dark palette.
 * Does not mutate the design system.
 */
export function useThemeColors(): ThemeColors {
  const [colors, setColors] = useState<ThemeColors>({
    isLight: false,
    primary: "#0ea5a4",
    accent: "#22d3ee",
    bg: "#020617",
    glow: "#4ae0ff",
  });

  useEffect(() => {
    const root = document.documentElement;
    const isLight =
      root.classList.contains("theme-light") ||
      root.getAttribute("data-theme") === "light" ||
      root.classList.contains("light");

    const getVar = (name: string, fallback: string) => {
      const val = getComputedStyle(root).getPropertyValue(name).trim();
      return val || fallback;
    };

    setColors({
      isLight,
      primary: getVar("--gt-accent", "#0ea5a4"),
      accent: getVar("--gt-accent-strong", "#22d3ee"),
      bg: isLight ? getVar("--gt-page-bg", "#e6f5ff") : getVar("--background", "#020617"),
      glow: isLight ? "#7ce7ff" : "#4ae0ff",
    });
  }, []);

  return colors;
}
