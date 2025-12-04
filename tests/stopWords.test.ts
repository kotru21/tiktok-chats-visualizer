import assert from "assert";
import { baseStopWords, additionalStopWords, allStopWords } from "../utils/stopWords.js";

describe("stopWords", () => {
  it("allStopWords должен объединять базовый и дополнительный списки без потерь", () => {
    // длина объединения не меньше каждого из списков
    assert.ok(allStopWords.length >= baseStopWords.length);
    assert.ok(allStopWords.length >= additionalStopWords.length);

    // все элементы из базового и дополнительного есть в объединении
    for (const w of baseStopWords) assert.ok(allStopWords.includes(w));
    for (const w of additionalStopWords) assert.ok(allStopWords.includes(w));

    // Нет критичных дубликатов: размер множества равен длине массива
    const uniq = new Set(allStopWords);
    assert.strictEqual(uniq.size, allStopWords.length);
  });
});
