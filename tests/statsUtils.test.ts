import { describe, it, expect } from "bun:test";
import { countByAuthor, tally, topNEntries } from "../utils/statsUtils.js";
import type { ChatMessage } from "../types/chat.js";

describe("statsUtils", () => {
  it("countByAuthor should count by from field", () => {
    const messages: Pick<ChatMessage, "from">[] = [{ from: "A" }, { from: "B" }, { from: "A" }];
    expect(countByAuthor(messages as ChatMessage[])).toEqual({ A: 2, B: 1 });
  });

  it("tally should count items", () => {
    const items = ["x", "y", "x"];
    expect(tally(items)).toEqual({ x: 2, y: 1 });
  });

  it("topNEntries should sort, filter and map", () => {
    const m: Record<string, number> = { a: 5, b: 1, c: 3 };
    const top2 = topNEntries(m, 2, 2);
    expect(top2).toEqual([
      { key: "a", count: 5 },
      { key: "c", count: 3 },
    ]);
  });
});
