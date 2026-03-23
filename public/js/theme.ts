import { resolveInitialTheme, nextTheme } from "./utils/themeUtils.js";
import type { Theme } from "../../types/ui.js";

export function detectColorScheme(): Theme {
  const storedTheme = localStorage.getItem("theme");
  const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return resolveInitialTheme(storedTheme, systemPrefersDark);
}

export function applyTheme(theme: Theme): void {
  if (theme === "dark") {
    document.documentElement.classList.add("dark-theme");
    localStorage.setItem("theme", "dark");
  } else {
    document.documentElement.classList.remove("dark-theme");
    localStorage.setItem("theme", "light");
  }

  window.dispatchEvent(new CustomEvent("theme:changed", { detail: { theme } }));
}

export function toggleTheme(): void {
  const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const currentTheme = (localStorage.getItem("theme") ??
    (systemPrefersDark ? "dark" : "light")) as Theme;
  const newTheme = nextTheme(currentTheme);
  applyTheme(newTheme);
}

applyTheme(detectColorScheme());

window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (event) => {
  if (!localStorage.getItem("theme")) {
    applyTheme(event.matches ? "dark" : "light");
  }
});
