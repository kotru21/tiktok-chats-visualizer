/**
 * Модуль для управления темами оформления
 * Поддерживает автоматическое определение предпочитаемой системной темы
 */

(function () {
  // Определение первоначальной темы
  function detectColorScheme() {
    // Проверяем сохраненную пользовательскую настройку
    const storedTheme = localStorage.getItem("theme");

    if (storedTheme) {
      return storedTheme;
    }

    // Проверяем системные настройки
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  // Применение темы к документу
  function applyTheme(theme) {
    if (theme === "dark") {
      document.body.classList.add("dark-theme");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark-theme");
      localStorage.setItem("theme", "light");
    }
  }

  // Функция для переключения темы
  function toggleTheme() {
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
      // Если пользователь не установил ручную настройку, следуем системным настройкам
      if (!localStorage.getItem("theme")) {
        applyTheme(event.matches ? "dark" : "light");
      }
    });

  // Экспорт функций для использования из других модулей
  window.themeManager = {
    toggle: toggleTheme,
    apply: applyTheme,
    detect: detectColorScheme,
  };
})();
