import assert from "assert";
import {
  getWeekdayName,
  getTimeOfDayBucket,
  formatDateISO,
  formatDisplayDate,
} from "../utils/dateUtils.js";

describe("dateUtils", () => {
  it("getWeekdayName should map day index", () => {
    const d = new Date("2024-12-01T10:00:00Z"); // Sunday
    assert.strictEqual(getWeekdayName(d), "Воскресенье");
  });

  it("getTimeOfDayBucket should detect buckets", () => {
    const m = new Date("2024-01-01T08:00:00Z");
    const d = new Date("2024-01-01T14:00:00Z");
    const e = new Date("2024-01-01T20:00:00Z");
    const n = new Date("2024-01-01T02:00:00Z");
    assert.match(getTimeOfDayBucket(m), /Утро/);
    assert.match(getTimeOfDayBucket(d), /День/);
    assert.match(getTimeOfDayBucket(e), /Вечер/);
    assert.match(getTimeOfDayBucket(n), /Ночь/);
  });

  it("formatDateISO should format YYYY-MM-DD", () => {
    const ts = "2025-03-05T12:34:56.000Z";
    assert.strictEqual(formatDateISO(ts), "2025-03-05");
  });

  it("formatDisplayDate should format DD.MM.YYYY", () => {
    const dt = new Date("2025-03-05T12:00:00Z");
    assert.strictEqual(formatDisplayDate(dt), "05.03.2025");
  });
});
