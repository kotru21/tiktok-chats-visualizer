import assert from "assert";
import { JSDOM } from "jsdom";

function setupDom({ prefersDark = false, storedTheme = null } = {}) {
  const dom = new JSDOM("<!doctype html><html><body></body></html>", {
    url: "http://localhost/",
    pretendToBeVisual: true,
  });

  // localStorage заглушка
  const store = new Map();
  if (storedTheme) store.set("theme", storedTheme);
  dom.window.localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, v),
    removeItem: (k) => store.delete(k),
  };

  // matchMedia заглушка
  dom.window.matchMedia = (query) => ({
    matches: query.includes("dark") ? prefersDark : false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  });

  return dom;
}

describe("theme", () => {
  it("detectColorScheme: должен уважать сохранённую тему", async () => {
    const dom = setupDom({ prefersDark: false, storedTheme: "dark" });
    global.window = dom.window;
    global.document = dom.window.document;
    global.localStorage = dom.window.localStorage;

    const mod = await import("../public/js/theme.js");
    const scheme = mod.detectColorScheme();
    assert.strictEqual(scheme, "dark");
  });

  it("applyTheme: добавляет/удаляет класс и пишет в localStorage", async () => {
    const dom = setupDom();
    global.window = dom.window;
    global.document = dom.window.document;
    global.localStorage = dom.window.localStorage;

    const { applyTheme } = await import("../public/js/theme.js");

    applyTheme("dark");
    assert.ok(document.body.classList.contains("dark-theme"));
    assert.strictEqual(localStorage.getItem("theme"), "dark");

    applyTheme("light");
    assert.ok(!document.body.classList.contains("dark-theme"));
    assert.strictEqual(localStorage.getItem("theme"), "light");
  });

  it("toggleTheme: переключает сохранённую тему", async () => {
    const dom = setupDom({ storedTheme: "dark" });
    global.window = dom.window;
    global.document = dom.window.document;
    global.localStorage = dom.window.localStorage;

    const { toggleTheme } = await import("../public/js/theme.js");
    toggleTheme();
    assert.strictEqual(localStorage.getItem("theme"), "light");
    toggleTheme();
    assert.strictEqual(localStorage.getItem("theme"), "dark");
  });
});
