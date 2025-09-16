import assert from "assert";

// Тестовые данные для chatData
const makeISO = (y, m, d, h = 12, min = 0, s = 0) =>
  new Date(Date.UTC(y, m - 1, d, h, min, s)).toISOString();

describe("dataProcessor", () => {
  it("extractUsers должен возвращать список пользователей с количеством сообщений", async () => {
    const { extractUsers } = await import("../utils/dataProcessor.js");

    const chatData = [
      { user: "Alice", messages: [{}, {}] },
      { user: "Bob", messages: [{}] },
    ];

    const users = extractUsers(chatData);
    assert.deepStrictEqual(users, [
      { id: "Alice", name: "Alice", messageCount: 2 },
      { id: "Bob", name: "Bob", messageCount: 1 },
    ]);
  });

  it("generateUserStats должен агрегировать статистику без учета URL и со стоп-словами", async () => {
    const { generateUserStats } = await import("../utils/dataProcessor.js");

    const ts1 = makeISO(2025, 3, 5, 12, 0, 0);
    const ts2 = makeISO(2025, 3, 6, 12, 0, 0);
    const ts3 = makeISO(2025, 3, 6, 13, 0, 0);

    const chatData = [
      {
        user: "user-1",
        messages: [
          {
            from: "A",
            text: "Привет добрый день! Заходи на https://example.com",
            timestamp: ts1,
          },
          { from: "B", text: "Добрый день, привет!", timestamp: ts2 },
          { from: "A", text: "www.site.ru", timestamp: ts2 }, // будет проигнорирован в текстовой статистике
          { from: "B", text: "добрый день добрый день", timestamp: ts3 },
        ],
      },
    ];

    const stats = generateUserStats(chatData, "user-1");

    // Базовые поля
    assert.strictEqual(stats.userId, "user-1");
    assert.strictEqual(stats.totalMessages, 4);

    // messagesByAuthor
    assert.deepStrictEqual(stats.messagesByAuthor, { A: 2, B: 2 });

    // frequentWords: проверяем наличие ожидаемых слов и счётчиков
    const wordMap = Object.fromEntries(stats.frequentWords.map((x) => [x.word, x.count]));
    // ожидаем верхних частот
    assert.strictEqual(wordMap["добрый"], 4);
    assert.strictEqual(wordMap["день"], 4);
    assert.strictEqual(wordMap["привет"], 2);
    assert.strictEqual(wordMap["заходи"], 1);

    // frequentWordPairs: должны остаться только пары с count > 1
    const pairMap = Object.fromEntries(stats.frequentWordPairs.map((x) => [x.pair, x.count]));
    assert.strictEqual(pairMap["добрый день"], 4);
    // другие пары встречаются 1 раз и потому отфильтрованы
    assert.strictEqual(Object.keys(pairMap).length, 1);

    // dateStats: две даты (05 и 06 марта)
    assert.ok(Array.isArray(stats.dateStats));
    assert.strictEqual(stats.dateStats.length, 2);
    const dates = stats.dateStats.map((d) => d.date);
    assert.ok(dates.includes("2025-03-05"));
    assert.ok(dates.includes("2025-03-06"));

    // Среднее сообщений в день: 4 / 2 = 2.00
    assert.strictEqual(stats.avgMessagesPerDay, 2);

    // Период чата заполнен
    assert.ok(stats.chatPeriod.firstDate && stats.chatPeriod.firstDate !== "Н/Д");
    assert.ok(stats.chatPeriod.lastDate && stats.chatPeriod.lastDate !== "Н/Д");
    assert.strictEqual(stats.chatPeriod.totalDays, 2);

    // Бакеты по дням недели и времени суток: сумма по каждому словарю равна totalMessages
    const sum = (obj) => Object.values(obj).reduce((a, b) => a + b, 0);
    assert.strictEqual(sum(stats.messagesByWeekday), stats.totalMessages);
    assert.strictEqual(sum(stats.messagesByTimeOfDay), stats.totalMessages);
  });
});
