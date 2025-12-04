import assert from "assert";
import { JSDOM } from "jsdom";

interface SetupDomOptions {
  prefersDark?: boolean;
  storedTheme?: string | null;
}

interface MockLocalStorage {
  getItem: (k: string) => string | null;
  setItem: (k: string, v: string) => void;
  removeItem: (k: string) => void;
}

function setupDom({ prefersDark = false, storedTheme = null }: SetupDomOptions = {}): JSDOM {
  const dom = new JSDOM("<!doctype html><html><body></body></html>", {
    url: "http://localhost/",
    pretendToBeVisual: true,
  });

  // localStorage заглушка
  const store = new Map<string, string>();
  if (storedTheme) store.set("theme", storedTheme);

  const mockLocalStorage: MockLocalStorage = {
    getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
    setItem: (k: string, v: string) => {
      store.set(k, v);
    },
    removeItem: (k: string) => {
      store.delete(k);
    },
  };

  Object.defineProperty(dom.window, "localStorage", { value: mockLocalStorage, writable: true });

  // matchMedia заглушка
  dom.window.matchMedia = ((query: string) => ({
    matches: query.includes("dark") ? prefersDark : false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as unknown as typeof dom.window.matchMedia;

  return dom;
}

describe("theme", () => {
  it("detectColorScheme: должен уважать сохранённую тему", async () => {
    const dom = setupDom({ prefersDark: false, storedTheme: "dark" });
    (global as unknown as { window: typeof dom.window }).window = dom.window;
    (global as unknown as { document: typeof dom.window.document }).document = dom.window.document;
    (global as unknown as { localStorage: MockLocalStorage }).localStorage = dom.window
      .localStorage as unknown as MockLocalStorage;

    const mod = await import("../public/js/theme.js");
    const scheme = mod.detectColorScheme();
    assert.strictEqual(scheme, "dark");
  });

  it("applyTheme: добавляет/удаляет класс и пишет в localStorage", async () => {
    const dom = setupDom();
    (global as unknown as { window: typeof dom.window }).window = dom.window;
    (global as unknown as { document: typeof dom.window.document }).document = dom.window.document;
    (global as unknown as { localStorage: MockLocalStorage }).localStorage = dom.window
      .localStorage as unknown as MockLocalStorage;

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
    (global as unknown as { window: typeof dom.window }).window = dom.window;
    (global as unknown as { document: typeof dom.window.document }).document = dom.window.document;
    (global as unknown as { localStorage: MockLocalStorage }).localStorage = dom.window
      .localStorage as unknown as MockLocalStorage;

    const { toggleTheme } = await import("../public/js/theme.js");
    toggleTheme();
    assert.strictEqual(localStorage.getItem("theme"), "light");
    toggleTheme();
    assert.strictEqual(localStorage.getItem("theme"), "dark");
  });
});
