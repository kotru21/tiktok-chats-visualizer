/**
 * Модуль для управления темами оформления
 * Поддерживает автоматическое определение предпочитаемой системной темы
 */

// Определение первоначальной темы
export function detectColorScheme() {
  const storedTheme = localStorage.getItem("theme");

  if (storedTheme) {
    return storedTheme;
  }

  //  системные настройки
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function applyTheme(theme) {
  if (theme === "dark") {
    document.body.classList.add("dark-theme");
    localStorage.setItem("theme", "dark");
  } else {
    document.body.classList.remove("dark-theme");
    localStorage.setItem("theme", "light");
  }
}

export function toggleTheme() {
  const currentTheme =
    localStorage.getItem("theme") ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light");

  const newTheme = currentTheme === "dark" ? "light" : "dark";
  applyTheme(newTheme);
}

// Первоначальное применение темы
applyTheme(detectColorScheme());

// Слушатель события изменения системных настроек
window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", (event) => {
    if (!localStorage.getItem("theme")) {
      applyTheme(event.matches ? "dark" : "light");
    }
  });
