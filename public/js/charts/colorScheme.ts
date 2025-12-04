import { computeChartDisplayMode, buildChartColorScheme } from "../utils/themeUtils.js";
import type { Theme, ChartColorScheme } from "../../../types/ui.js";

let cachedScheme: ChartColorScheme | null = null;
let cachedMode: Theme | null = null;

function computeMode(): Theme {
  const hasDarkClass = document.body.classList.contains("dark-theme");
  const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return computeChartDisplayMode({ hasDarkClass, systemPrefersDark });
}

export function getChartColorScheme(): ChartColorScheme {
  const mode = computeMode();
  if (cachedScheme && cachedMode === mode) return cachedScheme;
  cachedMode = mode;
  cachedScheme = buildChartColorScheme(mode);
  return cachedScheme;
}

export function invalidateChartColorCache(): void {
  cachedScheme = null;
  cachedMode = null;
}
