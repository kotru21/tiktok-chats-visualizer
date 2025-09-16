/**
 * Модуль для управления темами оформления
 * Поддерживает автоматическое определение предпочитаемой системной темы
 */
import { resolveInitialTheme, nextTheme } from "./utils/themeUtils.js";

// Определение первоначальной темы
export function detectColorScheme() {
  const storedTheme = localStorage.getItem("theme");
  const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return resolveInitialTheme(storedTheme, systemPrefersDark);
}

export function applyTheme(theme) {
  if (theme === "dark") {
    document.body.classList.add("dark-theme");
    localStorage.setItem("theme", "dark");
  } else {
    document.body.classList.remove("dark-theme");
    localStorage.setItem("theme", "light");
  }

  window.dispatchEvent(new CustomEvent("theme:changed", { detail: { theme } }));
}

export function toggleTheme() {
  const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const currentTheme = localStorage.getItem("theme") || (systemPrefersDark ? "dark" : "light");
  const newTheme = nextTheme(currentTheme);
  applyTheme(newTheme);
}

// Первоначальное применение темы
applyTheme(detectColorScheme());

// Слушатель события изменения системных настроек
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (event) => {
  if (!localStorage.getItem("theme")) {
    applyTheme(event.matches ? "dark" : "light");
  }
});
