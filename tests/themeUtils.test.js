import assert from "assert";
import {
  resolveInitialTheme,
  nextTheme,
  computeChartDisplayMode,
  buildChartColorScheme,
} from "../public/js/utils/themeUtils.js";

describe("themeUtils (pure)", () => {
  it("resolveInitialTheme: при сохранённой теме возвращает её", () => {
    assert.strictEqual(resolveInitialTheme("dark", false), "dark");
    assert.strictEqual(resolveInitialTheme("light", true), "light");
  });

  it("resolveInitialTheme: без сохранённой темы учитывает системное предпочтение", () => {
    assert.strictEqual(resolveInitialTheme(null, true), "dark");
    assert.strictEqual(resolveInitialTheme(undefined, false), "light");
  });

  it("nextTheme: переключает режим", () => {
    assert.strictEqual(nextTheme("dark"), "light");
    assert.strictEqual(nextTheme("light"), "dark");
  });

  it("computeChartDisplayMode: dark если есть класс или системный dark", () => {
    assert.strictEqual(
      computeChartDisplayMode({ hasDarkClass: true, systemPrefersDark: false }),
      "dark"
    );
    assert.strictEqual(
      computeChartDisplayMode({ hasDarkClass: false, systemPrefersDark: true }),
      "dark"
    );
    assert.strictEqual(
      computeChartDisplayMode({ hasDarkClass: false, systemPrefersDark: false }),
      "light"
    );
  });

  it("buildChartColorScheme: корректные цвета для light/dark", () => {
    const light = buildChartColorScheme("light");
    assert.strictEqual(light.fontColor, "#333");
    assert.strictEqual(light.backgroundColor, "#ffffff");

    const dark = buildChartColorScheme("dark");
    assert.strictEqual(dark.fontColor, "#e1e1e1");
    assert.strictEqual(dark.backgroundColor, "#1e1e1e");
  });
});
