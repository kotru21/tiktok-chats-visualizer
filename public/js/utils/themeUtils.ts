import type { Theme, ChartColorScheme, DisplayModeFlags } from "../../../types/ui.js";

export function resolveInitialTheme(
  storedTheme: string | null | undefined,
  systemPrefersDark: boolean
): Theme {
  if (storedTheme === "dark" || storedTheme === "light") return storedTheme;
  return systemPrefersDark ? "dark" : "light";
}

export function nextTheme(current: Theme): Theme {
  return current === "dark" ? "light" : "dark";
}

export function computeChartDisplayMode(flags: DisplayModeFlags): Theme {
  const { hasDarkClass, systemPrefersDark } = flags;
  return hasDarkClass || systemPrefersDark ? "dark" : "light";
}

export function buildChartColorScheme(mode: Theme): ChartColorScheme {
  const isDarkMode = mode === "dark";
  if (isDarkMode) {
    return {
      fontColor: "#fafafa",
      gridColor: "rgba(255, 255, 255, 0.08)",
      backgroundColor: "#0a0a0a",
      barFill: "#737373",
      barSecondary: "#525252",
      lineBorder: "#60a5fa",
      lineFill: "rgba(96, 165, 250, 0.12)",
      pieColors: ["#a3a3a3", "#737373", "#525252", "#d4d4d4", "#e5e5e5"],
      timePieColors: ["#737373", "#525252", "#a3a3a3", "#d4d4d4"],
    };
  }
  return {
    fontColor: "#0a0a0a",
    gridColor: "rgba(0, 0, 0, 0.08)",
    backgroundColor: "#ffffff",
    barFill: "#404040",
    barSecondary: "#525252",
    lineBorder: "#2563eb",
    lineFill: "rgba(37, 99, 235, 0.1)",
    pieColors: ["#171717", "#404040", "#525252", "#737373", "#a3a3a3"],
    timePieColors: ["#404040", "#525252", "#737373", "#a3a3a3"],
  };
}
