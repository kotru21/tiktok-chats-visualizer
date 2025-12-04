import assert from "assert";
import { countByAuthor, tally, topNEntries } from "../utils/statsUtils.js";
import type { ChatMessage } from "../types/chat.js";

describe("statsUtils", () => {
  it("countByAuthor should count by from field", () => {
    const messages: Pick<ChatMessage, "from">[] = [{ from: "A" }, { from: "B" }, { from: "A" }];
    assert.deepStrictEqual(countByAuthor(messages as ChatMessage[]), { A: 2, B: 1 });
  });

  it("tally should count items", () => {
    const items = ["x", "y", "x"];
    assert.deepStrictEqual(tally(items), { x: 2, y: 1 });
  });

  it("topNEntries should sort, filter and map", () => {
    const m: Record<string, number> = { a: 5, b: 1, c: 3 };
    const top2 = topNEntries(m, 2, 2);
    assert.deepStrictEqual(top2, [
      { key: "a", count: 5 },
      { key: "c", count: 3 },
    ]);
  });
});
