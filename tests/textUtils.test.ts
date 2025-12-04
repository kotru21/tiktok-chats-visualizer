import { describe, it, expect } from "bun:test";
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
    expect(out).not.toContain("http");
    expect(out).not.toContain("www.");
    expect(/\b\w+\.(com|ru)\b/.test(out)).toBe(false);
  });

  it("normalizeText should lower and remove punctuation", () => {
    const out = normalizeText(" ПрИвЕт, мир!!! ");
    expect(out).toBe("привет мир");
  });

  it("splitWords should split by space", () => {
    expect(splitWords("a b  c")).toEqual(["a", "b", "", "c"]);
  });

  it("filterWords should apply min length, stop words and numbers", () => {
    const stop = new Set(["привет"]);
    const input = ["привет", "мир", "1234", "abc", "дом"];
    const out = filterWords(input, stop, 3);
    expect(out).toEqual(["мир", "abc", "дом"]);
  });

  it("getBigrams should build pairs", () => {
    const out = getBigrams(["a", "b", "c"]);
    expect(out).toEqual(["a b", "b c"]);
  });
});
