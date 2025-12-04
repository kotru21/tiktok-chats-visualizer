import { describe, it, expect } from "bun:test";
import { baseStopWords, additionalStopWords, allStopWords } from "../utils/stopWords.js";

describe("stopWords", () => {
  it("allStopWords должен объединять базовый и дополнительный списки без потерь", () => {
    // длина объединения не меньше каждого из списков
    expect(allStopWords.length).toBeGreaterThanOrEqual(baseStopWords.length);
    expect(allStopWords.length).toBeGreaterThanOrEqual(additionalStopWords.length);

    // все элементы из базового и дополнительного есть в объединении
    for (const w of baseStopWords) expect(allStopWords).toContain(w);
    for (const w of additionalStopWords) expect(allStopWords).toContain(w);

    // Нет критичных дубликатов: размер множества равен длине массива
    const uniq = new Set(allStopWords);
    expect(uniq.size).toBe(allStopWords.length);
  });
});
