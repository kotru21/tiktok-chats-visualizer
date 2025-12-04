/**
 * Чистые утилиты для вычисления темы и цветовых схем без доступа к DOM.
 */

import type { Theme, ChartColorScheme, DisplayModeFlags } from "../../../types/ui.js";

/**
 * Выбирает начальную тему на основе сохранённого значения и системного предпочтения.
 */
export function resolveInitialTheme(
  storedTheme: string | null | undefined,
  systemPrefersDark: boolean
): Theme {
  if (storedTheme === "dark" || storedTheme === "light") return storedTheme;
  return systemPrefersDark ? "dark" : "light";
}

/**
 * Возвращает следующую тему (переключение dark <-> light).
 */
export function nextTheme(current: Theme): Theme {
  return current === "dark" ? "light" : "dark";
}

/**
 * Вычисляет режим отображения для графиков на основе флагов.
 */
export function computeChartDisplayMode(flags: DisplayModeFlags): Theme {
  const { hasDarkClass, systemPrefersDark } = flags;
  return hasDarkClass || systemPrefersDark ? "dark" : "light";
}

/**
 * Строит цветовую схему для графиков по режиму.
 */
export function buildChartColorScheme(mode: Theme): ChartColorScheme {
  const isDarkMode = mode === "dark";
  return {
    fontColor: isDarkMode ? "#e1e1e1" : "#333",
    gridColor: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
    backgroundColor: isDarkMode ? "#1e1e1e" : "#ffffff",
  };
}
