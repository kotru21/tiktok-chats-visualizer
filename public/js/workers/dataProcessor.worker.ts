/**
 * Web Worker для обработки данных чатов TikTok.
 * Выполняет тяжёлые вычисления в отдельном потоке, не блокируя UI.
 */

// === Типы ===

interface ChatMessage {
  timestamp: string;
  from: string;
  text: string | null;
}

interface Chat {
  user: string;
  messages: ChatMessage[];
}

type ChatData = Chat[];

interface User {
  id: string;
  name: string;
  messageCount: number;
}

interface WordFrequency {
  word: string;
  count: number;
}

interface WordPairFrequency {
  pair: string;
  count: number;
}

interface DateStat {
  date: string;
  count: number;
}

type WeekdayName =
  | "Понедельник"
  | "Вторник"
  | "Среда"
  | "Четверг"
  | "Пятница"
  | "Суббота"
  | "Воскресенье";

type TimeOfDayBucket =
  | "Утро (6:00-12:00)"
  | "День (12:00-18:00)"
  | "Вечер (18:00-00:00)"
  | "Ночь (00:00-6:00)";

interface ChatPeriod {
  firstDate: string;
  lastDate: string;
  totalDays: number;
}

interface UserStats {
  userId: string;
  totalMessages: number;
  messagesByAuthor: Record<string, number>;
  frequentWords: WordFrequency[];
  frequentWordPairs: WordPairFrequency[];
  dateStats: DateStat[];
  messagesByWeekday: Record<WeekdayName, number>;
  messagesByTimeOfDay: Record<TimeOfDayBucket, number>;
  avgMessagesPerDay: number;
  chatPeriod: ChatPeriod;
}

type FrequencyMap = Record<string, number>;

interface TikTokChatEntry {
  Date: string;
  From: string;
  Content?: string;
}

interface TikTokExport {
  "Direct Message"?: {
    "Direct Messages"?: {
      ChatHistory?: Record<string, TikTokChatEntry[]>;
    };
  };
}

// === Сообщения Worker ===

interface WorkerMessage {
  type: "parse" | "getUsers" | "getUserStats";
  payload?: unknown;
  id: number;
}

interface WorkerResponse {
  type: "success" | "error";
  payload: unknown;
  id: number;
}

// === Стоп-слова ===

const baseStopWords: readonly string[] = [
  "это",
  "как",
  "так",
  "что",
  "для",
  "при",
  "его",
  "все",
  "она",
  "они",
  "оно",
] as const;

const additionalStopWords: readonly string[] = [
  "есть",
  "быть",
  "просто",
  "тоже",
  "только",
  "меня",
  "тебя",
  "себя",
  "свой",
  "наш",
  "ваш",
  "этот",
  "тот",
  "такой",
  "который",
  "когда",
  "если",
] as const;

const stopWordsSet: ReadonlySet<string> = new Set([...baseStopWords, ...additionalStopWords]);

// === Текстовые утилиты ===

function removeUrls(text: string): string {
  return text
    .replace(/https?:\/\/[^\s]+/g, "")
    .replace(/www\.[^\s]+/g, "")
    .replace(/\b\w+\.(?:com|ru|org|net|io)\b/g, "");
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()\"\"\"''«»\[\]]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function splitWords(text: string): string[] {
  if (!text) return [];
  return text.split(" ");
}

function filterWords(
  words: string[],
  stopWords: ReadonlySet<string>,
  minLen: number = 4
): string[] {
  return words.filter(
    (word) =>
      word &&
      word.length >= minLen &&
      !stopWords.has(word) &&
      !word.includes(".") &&
      !/^\d+$/.test(word)
  );
}

function getBigrams(words: string[]): string[] {
  const pairs: string[] = [];
  for (let i = 0; i < words.length - 1; i++) {
    pairs.push(`${words[i]} ${words[i + 1]}`);
  }
  return pairs;
}

// === Датовые утилиты (без moment.js) ===

const weekdayNames: readonly string[] = [
  "Воскресенье",
  "Понедельник",
  "Вторник",
  "Среда",
  "Четверг",
  "Пятница",
  "Суббота",
] as const;

function getWeekdayName(date: Date): WeekdayName {
  return weekdayNames[date.getDay()] as WeekdayName;
}

function getTimeOfDayBucket(date: Date): TimeOfDayBucket {
  const hour = date.getHours();
  if (hour >= 6 && hour < 12) return "Утро (6:00-12:00)";
  if (hour >= 12 && hour < 18) return "День (12:00-18:00)";
  if (hour >= 18 && hour < 24) return "Вечер (18:00-00:00)";
  return "Ночь (00:00-6:00)";
}

function formatDateISO(ts: string | Date): string {
  const date = typeof ts === "string" ? new Date(ts) : ts;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

// === Статистические утилиты ===

function countByAuthor(messages: ChatMessage[]): FrequencyMap {
  const map: FrequencyMap = {};
  for (const m of messages) {
    const key = m.from;
    map[key] = (map[key] ?? 0) + 1;
  }
  return map;
}

// === Хранилище данных в Worker ===

let chatData: ChatData | null = null;

// === Основные функции обработки ===

function parseFile(fileContent: string): { success: boolean; count: number; message: string } {
  try {
    const parsedData = JSON.parse(fileContent) as TikTokExport;
    const chatHistory = parsedData["Direct Message"]?.["Direct Messages"]?.["ChatHistory"];

    if (!chatHistory) {
      throw new Error("Формат файла не соответствует экспорту TikTok");
    }

    const chatArray: ChatData = [];

    Object.entries(chatHistory).forEach(([chatName, messages]) => {
      const usernameMatch = /Chat History with ([^:]+):/.exec(chatName);
      const username = usernameMatch?.[1] ?? chatName;

      const formattedMessages = messages.map((message) => ({
        timestamp: message.Date,
        from: message.From,
        text: message.Content ?? null,
      }));

      chatArray.push({
        user: username,
        messages: formattedMessages,
      });
    });

    chatData = chatArray;

    return {
      success: true,
      count: chatArray.length,
      message: "Файл успешно загружен",
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Ошибка при обработке файла";
    throw new Error(errorMessage);
  }
}

function extractUsers(): User[] {
  if (!chatData) {
    throw new Error("Данные не загружены. Загрузите файл чатов.");
  }

  return chatData.map((chat) => ({
    id: chat.user,
    name: chat.user,
    messageCount: chat.messages.length,
  }));
}

function generateUserStats(userId: string): UserStats | null {
  if (!chatData) {
    throw new Error("Данные не загружены. Загрузите файл чатов.");
  }

  const userChat = chatData.find((chat) => chat.user === userId);
  if (!userChat) return null;

  const messagesByAuthor = countByAuthor(userChat.messages);
  const words: FrequencyMap = {};
  const wordPairs: FrequencyMap = {};

  const messagesByWeekday: Record<WeekdayName, number> = {
    Понедельник: 0,
    Вторник: 0,
    Среда: 0,
    Четверг: 0,
    Пятница: 0,
    Суббота: 0,
    Воскресенье: 0,
  };

  const messagesByTimeOfDay: Record<TimeOfDayBucket, number> = {
    "Утро (6:00-12:00)": 0,
    "День (12:00-18:00)": 0,
    "Вечер (18:00-00:00)": 0,
    "Ночь (00:00-6:00)": 0,
  };

  userChat.messages.forEach((msg) => {
    if (!msg.text) return;

    const date = new Date(msg.timestamp);
    messagesByWeekday[getWeekdayName(date)]++;
    messagesByTimeOfDay[getTimeOfDayBucket(date)]++;

    let text = removeUrls(msg.text);
    if (text.trim() === "") return;

    text = normalizeText(text);
    const tokens = splitWords(text);
    const filtered = filterWords(tokens, stopWordsSet, 4);

    for (const w of filtered) {
      words[w] = (words[w] ?? 0) + 1;
    }

    const bigrams = getBigrams(filtered);
    for (const p of bigrams) {
      wordPairs[p] = (wordPairs[p] ?? 0) + 1;
    }
  });

  const frequentWords: WordFrequency[] = Object.entries(words)
    .sort((a, b) => b[1] - a[1])
    .filter(([, count]) => (Object.keys(words).length >= 20 ? count > 1 : true))
    .slice(0, 20)
    .map(([word, count]) => ({ word, count }));

  const frequentWordPairs: WordPairFrequency[] = Object.entries(wordPairs)
    .sort((a, b) => b[1] - a[1])
    .filter(([, count]) => count > 1)
    .slice(0, 15)
    .map(([pair, count]) => ({ pair, count }));

  const messagesByDate: FrequencyMap = {};
  userChat.messages.forEach((msg) => {
    const d = formatDateISO(msg.timestamp);
    messagesByDate[d] = (messagesByDate[d] ?? 0) + 1;
  });

  const dateStats: DateStat[] = Object.entries(messagesByDate)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let totalDays = 0;
  let firstDate: Date | null = null;
  let lastDate: Date | null = null;

  if (userChat.messages.length > 0) {
    const timestamps = userChat.messages.map((m) => new Date(m.timestamp).getTime());
    firstDate = new Date(Math.min(...timestamps));
    lastDate = new Date(Math.max(...timestamps));
    totalDays = Math.floor((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  }

  const firstDateFormatted = firstDate ? formatDisplayDate(firstDate) : "Н/Д";
  const lastDateFormatted = lastDate ? formatDisplayDate(lastDate) : "Н/Д";

  const avgMessagesPerDay = totalDays > 0 ? userChat.messages.length / totalDays : 0;

  return {
    userId,
    totalMessages: userChat.messages.length,
    messagesByAuthor,
    frequentWords,
    frequentWordPairs,
    dateStats,
    messagesByWeekday,
    messagesByTimeOfDay,
    avgMessagesPerDay: Math.round(avgMessagesPerDay * 100) / 100,
    chatPeriod: {
      firstDate: firstDateFormatted,
      lastDate: lastDateFormatted,
      totalDays,
    },
  };
}

// === Обработчик сообщений ===

self.onmessage = (e: MessageEvent<WorkerMessage>) => {
  const { type, payload, id } = e.data;

  try {
    let result: unknown;

    switch (type) {
      case "parse":
        result = parseFile(payload as string);
        break;
      case "getUsers":
        result = extractUsers();
        break;
      case "getUserStats":
        result = generateUserStats(payload as string);
        break;
      default:
        throw new Error(`Неизвестный тип сообщения: ${type}`);
    }

    const response: WorkerResponse = { type: "success", payload: result, id };
    self.postMessage(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Неизвестная ошибка";
    const response: WorkerResponse = { type: "error", payload: errorMessage, id };
    self.postMessage(response);
  }
};
