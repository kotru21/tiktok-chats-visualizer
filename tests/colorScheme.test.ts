import { describe, it, expect, beforeEach } from "bun:test";

// happy-dom регистрируется в tests/setup.ts через bunfig.toml preload

interface SetupDomOptions {
  darkPreferred?: boolean;
  hasDarkClass?: boolean;
}

// Хелпер для настройки окна и документа
function setupDom({ darkPreferred = false, hasDarkClass = false }: SetupDomOptions = {}): void {
  // Сбрасываем состояние
  document.body.className = "";

  // имитируем matchMedia
  window.matchMedia = ((query: string) => ({
    matches: query.includes("dark") ? darkPreferred : false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => true,
    onchange: null,
  })) as typeof window.matchMedia;

  if (hasDarkClass) document.body.classList.add("dark-theme");
}

describe("charts/colorScheme", () => {
  beforeEach(() => {
    // Очищаем кеш модуля перед каждым тестом
    delete require.cache[require.resolve("../public/js/charts/colorScheme.js")];
  });

  it("должен возвращать светлую схему по умолчанию", async () => {
    setupDom({ darkPreferred: false, hasDarkClass: false });

    const { getChartColorScheme, invalidateChartColorCache } =
      await import("../public/js/charts/colorScheme.js");

    invalidateChartColorCache();
    const scheme = getChartColorScheme();
    expect(scheme.fontColor).toBe("#333");
  });

  it("должен переключаться на тёмную схему при классе dark-theme", async () => {
    setupDom({ darkPreferred: false, hasDarkClass: true });

    const { getChartColorScheme, invalidateChartColorCache } =
      await import("../public/js/charts/colorScheme.js");

    invalidateChartColorCache();
    const scheme = getChartColorScheme();
    expect(scheme.fontColor).toBe("#e1e1e1");
  });
});
