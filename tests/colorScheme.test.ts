import assert from "assert";
import { JSDOM } from "jsdom";

interface SetupDomOptions {
  darkPreferred?: boolean;
  hasDarkClass?: boolean;
}

// Хелпер для настройки окна и документа
function setupDom({ darkPreferred = false, hasDarkClass = false }: SetupDomOptions = {}): JSDOM {
  const dom = new JSDOM("<!doctype html><html><body></body></html>", {
    url: "http://localhost/",
    pretendToBeVisual: true,
  });

  // имитируем matchMedia
  dom.window.matchMedia = ((query: string) => ({
    matches: query.includes("dark") ? darkPreferred : false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as unknown as typeof dom.window.matchMedia;

  if (hasDarkClass) dom.window.document.body.classList.add("dark-theme");
  return dom;
}

describe("charts/colorScheme", () => {
  it("должен возвращать светлую схему по умолчанию", async () => {
    const dom = setupDom({ darkPreferred: false, hasDarkClass: false });
    (global as unknown as { window: typeof dom.window }).window = dom.window;
    (global as unknown as { document: typeof dom.window.document }).document = dom.window.document;

    const { getChartColorScheme, invalidateChartColorCache } = await import(
      "../public/js/charts/colorScheme.js"
    );

    invalidateChartColorCache();
    const scheme = getChartColorScheme();
    assert.strictEqual(scheme.fontColor, "#333");
  });

  it("должен переключаться на тёмную схему при классе dark-theme", async () => {
    const dom = setupDom({ darkPreferred: false, hasDarkClass: true });
    (global as unknown as { window: typeof dom.window }).window = dom.window;
    (global as unknown as { document: typeof dom.window.document }).document = dom.window.document;

    const { getChartColorScheme, invalidateChartColorCache } = await import(
      "../public/js/charts/colorScheme.js"
    );

    invalidateChartColorCache();
    const scheme = getChartColorScheme();
    assert.strictEqual(scheme.fontColor, "#e1e1e1");
  });
});
