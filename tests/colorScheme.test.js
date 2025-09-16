import assert from "assert";
import { JSDOM } from "jsdom";

// Хелпер для настройки окна и документа
function setupDom({ darkPreferred = false, hasDarkClass = false } = {}) {
  const dom = new JSDOM("<!doctype html><html><body></body></html>", {
    url: "http://localhost/",
    pretendToBeVisual: true,
  });

  // имитируем matchMedia
  dom.window.matchMedia = (query) => ({
    matches: query.includes("dark") ? darkPreferred : false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  });

  if (hasDarkClass) dom.window.document.body.classList.add("dark-theme");
  return dom;
}

describe("charts/colorScheme", () => {
  it("должен возвращать светлую схему по умолчанию", async () => {
    const dom = setupDom({ darkPreferred: false, hasDarkClass: false });
    global.window = dom.window;
    global.document = dom.window.document;

    const { getChartColorScheme, invalidateChartColorCache } = await import(
      "../public/js/charts/colorScheme.js"
    );

    invalidateChartColorCache();
    const scheme = getChartColorScheme();
    assert.strictEqual(scheme.fontColor, "#333");
  });

  it("должен переключаться на тёмную схему при классе dark-theme", async () => {
    const dom = setupDom({ darkPreferred: false, hasDarkClass: true });
    global.window = dom.window;
    global.document = dom.window.document;

    const { getChartColorScheme, invalidateChartColorCache } = await import(
      "../public/js/charts/colorScheme.js"
    );

    invalidateChartColorCache();
    const scheme = getChartColorScheme();
    assert.strictEqual(scheme.fontColor, "#e1e1e1");
  });
});
