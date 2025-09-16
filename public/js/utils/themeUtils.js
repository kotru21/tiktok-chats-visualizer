/**
 * Чистые утилиты для вычисления темы и цветовых схем без доступа к DOM.
 */

/**
 * Выбирает начальную тему на основе сохранённого значения и системного предпочтения.
 * @param {"dark"|"light"|null|undefined} storedTheme
 * @param {boolean} systemPrefersDark
 * @returns {"dark"|"light"}
 */
export function resolveInitialTheme(storedTheme, systemPrefersDark) {
  if (storedTheme === "dark" || storedTheme === "light") return storedTheme;
  return systemPrefersDark ? "dark" : "light";
}

/**
 * Возвращает следующую тему (переключение dark <-> light).
 * @param {"dark"|"light"} current
 * @returns {"dark"|"light"}
 */
export function nextTheme(current) {
  return current === "dark" ? "light" : "dark";
}

/**
 * Вычисляет режим отображения для графиков на основе флагов.
 * @param {{ hasDarkClass: boolean, systemPrefersDark: boolean }} flags
 * @returns {"dark"|"light"}
 */
export function computeChartDisplayMode(flags) {
  const { hasDarkClass, systemPrefersDark } = flags;
  return hasDarkClass || systemPrefersDark ? "dark" : "light";
}

/**
 * Строит цветовую схему для графиков по режиму.
 * @param {"dark"|"light"} mode
 * @returns {{ fontColor: string, gridColor: string, backgroundColor: string }}
 */
export function buildChartColorScheme(mode) {
  const isDarkMode = mode === "dark";
  return {
    fontColor: isDarkMode ? "#e1e1e1" : "#333",
    gridColor: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
    backgroundColor: isDarkMode ? "#1e1e1e" : "#ffffff",
  };
}
