import { describe, it, expect, beforeEach } from "bun:test";

// happy-dom регистрируется в tests/setup.ts через bunfig.toml preload

interface SetupDomOptions {
  prefersDark?: boolean;
  storedTheme?: string | null;
}

// Хелпер для настройки окна и документа
function setupDom({ prefersDark = false, storedTheme = null }: SetupDomOptions = {}): void {
  // Сбрасываем состояние
  document.body.className = "";
  localStorage.clear();

  if (storedTheme) localStorage.setItem("theme", storedTheme);

  // matchMedia заглушка
  window.matchMedia = ((query: string) => ({
    matches: query.includes("dark") ? prefersDark : false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => true,
    onchange: null,
  })) as typeof window.matchMedia;
}

describe("theme", () => {
  beforeEach(() => {
    // Очищаем кеш модуля перед каждым тестом
    const modulePath = require.resolve("../public/js/theme.js");
    Reflect.deleteProperty(require.cache, modulePath);
  });

  it("detectColorScheme: должен уважать сохранённую тему", async () => {
    setupDom({ prefersDark: false, storedTheme: "dark" });

    const mod = await import("../public/js/theme.js");
    const scheme = mod.detectColorScheme();
    expect(scheme).toBe("dark");
  });

  it("applyTheme: добавляет/удаляет класс и пишет в localStorage", async () => {
    setupDom();

    const { applyTheme } = await import("../public/js/theme.js");

    applyTheme("dark");
    expect(document.body.classList.contains("dark-theme")).toBe(true);
    expect(localStorage.getItem("theme")).toBe("dark");

    applyTheme("light");
    expect(document.body.classList.contains("dark-theme")).toBe(false);
    expect(localStorage.getItem("theme")).toBe("light");
  });

  it("toggleTheme: переключает сохранённую тему", async () => {
    setupDom({ storedTheme: "dark" });

    const { toggleTheme } = await import("../public/js/theme.js");
    toggleTheme();
    expect(localStorage.getItem("theme")).toBe("light");
    toggleTheme();
    expect(localStorage.getItem("theme")).toBe("dark");
  });
});
