import assert from "assert";
import {
  removeUrls,
  normalizeText,
  splitWords,
  filterWords,
  getBigrams,
} from "../utils/textUtils.js";

describe("textUtils", () => {
  it("removeUrls should strip http/https and www domains", () => {
    const input = "see https://example.com and http://x.y and www.test.ru hello";
    const out = removeUrls(input);
    assert(!out.includes("http"));
    assert(!out.includes("www."));
    assert(!/\b\w+\.(com|ru)\b/.test(out));
  });

  it("normalizeText should lower and remove punctuation", () => {
    const out = normalizeText(" ПрИвЕт, мир!!! ");
    assert.strictEqual(out, "привет мир");
  });

  it("splitWords should split by space", () => {
    assert.deepStrictEqual(splitWords("a b  c"), ["a", "b", "", "c"]);
  });

  it("filterWords should apply min length, stop words and numbers", () => {
    const stop = new Set(["привет"]);
    const input = ["привет", "мир", "1234", "abc", "дом"];
    const out = filterWords(input, stop, 3);
    assert.deepStrictEqual(out, ["мир", "abc", "дом"]);
  });

  it("getBigrams should build pairs", () => {
    const out = getBigrams(["a", "b", "c"]);
    assert.deepStrictEqual(out, ["a b", "b c"]);
  });
});
