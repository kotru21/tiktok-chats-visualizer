import { computeChartDisplayMode, buildChartColorScheme } from "../utils/themeUtils.js";

let cachedScheme = null;
let cachedMode = null;

function computeMode() {
  const hasDarkClass = document.body.classList.contains("dark-theme");
  const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return computeChartDisplayMode({ hasDarkClass, systemPrefersDark });
}

export function getChartColorScheme() {
  const mode = computeMode();
  if (cachedScheme && cachedMode === mode) return cachedScheme;
  cachedMode = mode;
  cachedScheme = buildChartColorScheme(mode);
  return cachedScheme;
}

export function invalidateChartColorCache() {
  cachedScheme = null;
  cachedMode = null;
}
