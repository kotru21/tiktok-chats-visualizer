import { describe, it, expect, beforeEach } from "bun:test";

interface SetupDomOptions {
  darkPreferred?: boolean;
  hasDarkClass?: boolean;
}

function setupDom({ darkPreferred = false, hasDarkClass = false }: SetupDomOptions = {}): void {
  document.body.className = "";
  document.documentElement.className = hasDarkClass ? "dark-theme" : "";

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
}

describe("charts/colorScheme", () => {
  beforeEach(() => {
    const modulePath = require.resolve("../public/js/charts/colorScheme.js");
    Reflect.deleteProperty(require.cache, modulePath);
  });

  it("должен возвращать светлую схему по умолчанию", async () => {
    setupDom({ darkPreferred: false, hasDarkClass: false });

    const { getChartColorScheme, invalidateChartColorCache } =
      await import("../public/js/charts/colorScheme.js");

    invalidateChartColorCache();
    const scheme = getChartColorScheme();
    expect(scheme.fontColor).toBe("#0a0a0a");
  });

  it("должен переключаться на тёмную схему при классе dark-theme", async () => {
    setupDom({ darkPreferred: false, hasDarkClass: true });

    const { getChartColorScheme, invalidateChartColorCache } =
      await import("../public/js/charts/colorScheme.js");

    invalidateChartColorCache();
    const scheme = getChartColorScheme();
    expect(scheme.fontColor).toBe("#fafafa");
  });
});
