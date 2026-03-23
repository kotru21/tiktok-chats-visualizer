import { describe, it, expect } from "bun:test";
import { baseStopWords, additionalStopWords, allStopWords } from "../utils/stopWords.js";

describe("stopWords", () => {
  it("allStopWords должен объединять базовый и дополнительный списки без потерь", () => {
    expect(allStopWords.length).toBeGreaterThanOrEqual(baseStopWords.length);
    expect(allStopWords.length).toBeGreaterThanOrEqual(additionalStopWords.length);

    for (const w of baseStopWords) expect(allStopWords).toContain(w);
    for (const w of additionalStopWords) expect(allStopWords).toContain(w);

    const uniq = new Set(allStopWords);
    expect(uniq.size).toBe(allStopWords.length);
  });
});
