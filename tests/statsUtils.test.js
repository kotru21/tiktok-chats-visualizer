const assert = require("assert");
const { countByAuthor, tally, topNEntries } = require("../utils/statsUtils");

describe("statsUtils", () => {
  it("countByAuthor should count by from field", () => {
    const messages = [{ from: "A" }, { from: "B" }, { from: "A" }];
    assert.deepStrictEqual(countByAuthor(messages), { A: 2, B: 1 });
  });

  it("tally should count items", () => {
    const items = ["x", "y", "x"];
    assert.deepStrictEqual(tally(items), { x: 2, y: 1 });
  });

  it("topNEntries should sort, filter and map", () => {
    const m = { a: 5, b: 1, c: 3 };
    const top2 = topNEntries(m, 2, 2);
    assert.deepStrictEqual(top2, [
      { key: "a", count: 5 },
      { key: "c", count: 3 },
    ]);
  });
});
