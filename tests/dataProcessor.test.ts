import { describe, it, expect } from "bun:test";
import type { ChatData, ChatMessage } from "../types/chat.js";

// Тестовые данные для chatData
const makeISO = (y: number, m: number, d: number, h = 12, min = 0, s = 0): string =>
  new Date(Date.UTC(y, m - 1, d, h, min, s)).toISOString();

describe("dataProcessor", () => {
  it("extractUsers должен возвращать список пользователей с количеством сообщений", async () => {
    const { extractUsers } = await import("../utils/dataProcessor.js");

    const chatData: ChatData = [
      { user: "Alice", messages: [{} as ChatMessage, {} as ChatMessage] },
      { user: "Bob", messages: [{} as ChatMessage] },
    ];

    const users = extractUsers(chatData);
    expect(users).toEqual([
      { id: "Alice", name: "Alice", messageCount: 2 },
      { id: "Bob", name: "Bob", messageCount: 1 },
    ]);
  });

  it("generateUserStats должен агрегировать статистику без учета URL и со стоп-словами", async () => {
    const { generateUserStats } = await import("../utils/dataProcessor.js");

    const ts1 = makeISO(2025, 3, 5, 12, 0, 0);
    const ts2 = makeISO(2025, 3, 6, 12, 0, 0);
    const ts3 = makeISO(2025, 3, 6, 13, 0, 0);

    const chatData: ChatData = [
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

    // Проверка: stats не null
    expect(stats).not.toBeNull();
    if (!stats) return; // Type guard для TypeScript

    // Базовые поля
    expect(stats.userId).toBe("user-1");
    expect(stats.totalMessages).toBe(4);

    // messagesByAuthor
    expect(stats.messagesByAuthor).toEqual({ A: 2, B: 2 });

    // frequentWords: проверка наличия ожидаемых слов и счётчиков
    const wordMap = Object.fromEntries(stats.frequentWords.map((x) => [x.word, x.count]));
    // ожидаем верхних частот
    expect(wordMap["добрый"]).toBe(4);
    expect(wordMap["день"]).toBe(4);
    expect(wordMap["привет"]).toBe(2);
    expect(wordMap["заходи"]).toBe(1);

    // frequentWordPairs: должны остаться только пары с count > 1
    const pairMap = Object.fromEntries(stats.frequentWordPairs.map((x) => [x.pair, x.count]));
    expect(pairMap["добрый день"]).toBe(4);
    // другие пары встречаются 1 раз и потому отфильтрованы
    expect(Object.keys(pairMap).length).toBe(1);

    // dateStats: две даты (05 и 06 марта)
    expect(Array.isArray(stats.dateStats)).toBe(true);
    expect(stats.dateStats.length).toBe(2);
    const dates = stats.dateStats.map((d) => d.date);
    expect(dates).toContain("2025-03-05");
    expect(dates).toContain("2025-03-06");

    // Среднее сообщений в день: 4 / 2 = 2.00
    expect(stats.avgMessagesPerDay).toBe(2);

    // Период чата заполнен
    expect(stats.chatPeriod.firstDate && stats.chatPeriod.firstDate !== "Н/Д").toBe(true);
    expect(stats.chatPeriod.lastDate && stats.chatPeriod.lastDate !== "Н/Д").toBe(true);
    expect(stats.chatPeriod.totalDays).toBe(2);

    // Бакеты по дням недели и времени суток: сумма по каждому словарю равна totalMessages
    const sum = (obj: Record<string, number>): number =>
      Object.values(obj).reduce((a, b) => a + b, 0);
    expect(sum(stats.messagesByWeekday)).toBe(stats.totalMessages);
    expect(sum(stats.messagesByTimeOfDay)).toBe(stats.totalMessages);
  });
});
