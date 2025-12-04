import { describe, it, expect } from "bun:test";
import {
  getWeekdayName,
  getTimeOfDayBucket,
  formatDateISO,
  formatDisplayDate,
} from "../utils/dateUtils.js";

describe("dateUtils", () => {
  it("getWeekdayName should map day index", () => {
    const d = new Date("2024-12-01T10:00:00Z"); // Sunday
    expect(getWeekdayName(d)).toBe("Воскресенье");
  });

  it("getTimeOfDayBucket should detect buckets", () => {
    const m = new Date("2024-01-01T08:00:00Z");
    const d = new Date("2024-01-01T14:00:00Z");
    const e = new Date("2024-01-01T20:00:00Z");
    const n = new Date("2024-01-01T02:00:00Z");
    expect(getTimeOfDayBucket(m)).toMatch(/Утро/);
    expect(getTimeOfDayBucket(d)).toMatch(/День/);
    expect(getTimeOfDayBucket(e)).toMatch(/Вечер/);
    expect(getTimeOfDayBucket(n)).toMatch(/Ночь/);
  });

  it("formatDateISO should format YYYY-MM-DD", () => {
    const ts = "2025-03-05T12:34:56.000Z";
    expect(formatDateISO(ts)).toBe("2025-03-05");
  });

  it("formatDisplayDate should format DD.MM.YYYY", () => {
    const dt = new Date("2025-03-05T12:00:00Z");
    expect(formatDisplayDate(dt)).toBe("05.03.2025");
  });
});
