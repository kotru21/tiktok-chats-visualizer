import { describe, it, expect } from "bun:test";
import {
  resolveInitialTheme,
  nextTheme,
  computeChartDisplayMode,
  buildChartColorScheme,
} from "../public/js/utils/themeUtils.js";
import type { DisplayModeFlags } from "../types/ui.js";

describe("themeUtils (pure)", () => {
  it("resolveInitialTheme: при сохранённой теме возвращает её", () => {
    expect(resolveInitialTheme("dark", false)).toBe("dark");
    expect(resolveInitialTheme("light", true)).toBe("light");
  });

  it("resolveInitialTheme: без сохранённой темы учитывает системное предпочтение", () => {
    expect(resolveInitialTheme(null, true)).toBe("dark");
    expect(resolveInitialTheme(undefined, false)).toBe("light");
  });

  it("nextTheme: переключает режим", () => {
    expect(nextTheme("dark")).toBe("light");
    expect(nextTheme("light")).toBe("dark");
  });

  it("computeChartDisplayMode: dark если есть класс или системный dark", () => {
    const darkClassOnly: DisplayModeFlags = { hasDarkClass: true, systemPrefersDark: false };
    const systemDarkOnly: DisplayModeFlags = { hasDarkClass: false, systemPrefersDark: true };
    const lightMode: DisplayModeFlags = { hasDarkClass: false, systemPrefersDark: false };

    expect(computeChartDisplayMode(darkClassOnly)).toBe("dark");
    expect(computeChartDisplayMode(systemDarkOnly)).toBe("dark");
    expect(computeChartDisplayMode(lightMode)).toBe("light");
  });

  it("buildChartColorScheme: корректные цвета для light/dark", () => {
    const light = buildChartColorScheme("light");
    expect(light.fontColor).toBe("#0a0a0a");
    expect(light.backgroundColor).toBe("#ffffff");
    expect(light.barFill).toBe("#404040");
    expect(light.pieColors.length).toBeGreaterThan(0);

    const dark = buildChartColorScheme("dark");
    expect(dark.fontColor).toBe("#fafafa");
    expect(dark.backgroundColor).toBe("#0a0a0a");
    expect(dark.barFill).toBe("#737373");
  });
});
