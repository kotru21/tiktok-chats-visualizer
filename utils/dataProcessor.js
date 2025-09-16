/**
 * Модуль для обработки и анализа данных чатов TikTok.
 * Публичный API:
 *  - extractUsers(chatData)
 *  - generateUserStats(chatData, userId)
 */
import { allStopWords } from "./stopWords.js";
import { removeUrls, normalizeText, splitWords, filterWords, getBigrams } from "./textUtils.js";
import {
  getWeekdayName,
  getTimeOfDayBucket,
  formatDateISO,
  formatDisplayDate,
} from "./dateUtils.js";
import { countByAuthor } from "./statsUtils.js";

/**
 * Извлекает список уникальных пользователей из массива данных чатов.
 * Для каждого пользователя вычисляется общее количество сообщений.
 *
 * @param {Array} chatData - Массив данных чатов
 * @returns {Array} Массив объектов пользователей с id, именем и количеством сообщений
 */
export function extractUsers(chatData) {
  return chatData.map((chat) => ({
    id: chat.user,
    name: chat.user,
    messageCount: chat.messages.length,
  }));
}

/**
 * Генерирует комплексную статистику для конкретного пользователя.
 * Включает:
 * - Общее количество сообщений
 * - Распределение сообщений по отправителям
 * - Наиболее часто используемые слова (за исключением URL)
 * - Статистика активности по датам
 * - Среднее количество сообщений в день за весь период общения
 *
 * @param {Array} chatData - Массив данных чатов
 * @param {string} userId - ID пользователя для анализа
 * @returns {Object|null} Объект с детальной статистикой или null, если пользователь не найден
 */
export function generateUserStats(chatData, userId) {
  const userChat = chatData.find((chat) => chat.user === userId);
  if (!userChat) return null;

  const messagesByAuthor = countByAuthor(userChat.messages);
  const words = {};
  const wordPairs = {};

  const messagesByWeekday = {
    Понедельник: 0,
    Вторник: 0,
    Среда: 0,
    Четверг: 0,
    Пятница: 0,
    Суббота: 0,
    Воскресенье: 0,
  };

  const messagesByTimeOfDay = {
    "Утро (6:00-12:00)": 0,
    "День (12:00-18:00)": 0,
    "Вечер (18:00-00:00)": 0,
    "Ночь (00:00-6:00)": 0,
  };

  const stopWordsSet = new Set(allStopWords);

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

    for (const w of filtered) words[w] = (words[w] || 0) + 1;

    const bigrams = getBigrams(filtered);
    for (const p of bigrams) wordPairs[p] = (wordPairs[p] || 0) + 1;
  });

  const frequentWords = Object.entries(words)
    .sort((a, b) => b[1] - a[1])
    .filter(([, count]) => (Object.keys(words).length >= 20 ? count > 1 : true))
    .slice(0, 20)
    .map(([word, count]) => ({ word, count }));

  const frequentWordPairs = Object.entries(wordPairs)
    .sort((a, b) => b[1] - a[1])
    .filter(([, count]) => count > 1)
    .slice(0, 15)
    .map(([pair, count]) => ({ pair, count }));

  const messagesByDate = {};
  userChat.messages.forEach((msg) => {
    const d = formatDateISO(msg.timestamp);
    messagesByDate[d] = (messagesByDate[d] || 0) + 1;
  });

  const dateStats = Object.entries(messagesByDate)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  let totalDays = 0;
  let firstDate = null;
  let lastDate = null;
  if (userChat.messages.length > 0) {
    const timestamps = userChat.messages.map((m) => new Date(m.timestamp));
    firstDate = new Date(Math.min(...timestamps));
    lastDate = new Date(Math.max(...timestamps));
    totalDays = Math.floor((lastDate - firstDate) / (1000 * 60 * 60 * 24)) + 1;
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

// ESM: именованные экспорты выше
