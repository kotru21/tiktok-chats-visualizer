/**
 * Модуль для обработки и анализа данных чатов TikTok.
 * Предоставляет функции для извлечения списка пользователей и генерации
 * детальной статистики по каждому пользователю.
 */
const _ = require("lodash");
const moment = require("moment");

/**
 * Извлекает список уникальных пользователей из массива данных чатов.
 * Для каждого пользователя вычисляется общее количество сообщений.
 *
 * @param {Array} chatData - Массив данных чатов
 * @returns {Array} Массив объектов пользователей с id, именем и количеством сообщений
 */
function extractUsers(chatData) {
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
function generateUserStats(chatData, userId) {
  const userChat = chatData.find((chat) => chat.user === userId);

  if (!userChat) {
    return null;
  }

  const messagesByAuthor = _.countBy(userChat.messages, "from");

  const words = {};

  // Список стоп-слов (низкоинформативных слов, которые можно исключить из анализа)
  const stopWords = [
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
  ];

  userChat.messages.forEach((msg) => {
    if (!msg.text) return;

    let text = msg.text;

    text = text
      .replace(/https?:\/\/[^\s]+/g, "")
      .replace(/www\.[^\s]+/g, "")
      .replace(/\b\w+\.(?:com|ru|org|net|io)\b/g, "");

    if (text.trim() === "") return;

    // очистка текста от знаков препинания и символов
    text = text
      .toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()"""''«»\[\]]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    // разбивка приложения на слова
    const msgWords = text.split(" ");

    // Дополнительные стоп-слова для русского языка
    const additionalStopWords = [
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
    ];
    const allStopWords = [...stopWords, ...additionalStopWords];

    msgWords.forEach((word) => {
      //  фильтрация слов
      if (
        word &&
        word.length > 3 &&
        !allStopWords.includes(word) &&
        !word.includes(".") &&
        !/^\d+$/.test(word)
      ) {
        words[word] = (words[word] || 0) + 1;
      }
    });
  });

  //  топ-20 наиболее часто используемых слов
  const frequentWords = Object.entries(words)

    .sort((a, b) => b[1] - a[1])

    .filter(([word, count]) => {
      if (Object.keys(words).length >= 20) {
        return count > 1;
      }
      return true;
    })
    .slice(0, 20)
    .map(([word, count]) => ({ word, count }));

  //  сообщения по датам для анализа активности
  const messagesByDate = {};
  userChat.messages.forEach((msg) => {
    const date = moment(msg.timestamp).format("YYYY-MM-DD");
    messagesByDate[date] = (messagesByDate[date] || 0) + 1;
  });

  const dateStats = Object.entries(messagesByDate)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  // Расчет полного периода переписки в днях, включая дни без сообщений
  let totalDays = 0;
  let firstDate = null;
  let lastDate = null;

  if (userChat.messages.length > 0) {
    // временной интервал между первым и последним сообщением
    const timestamps = userChat.messages.map((msg) => new Date(msg.timestamp));
    firstDate = new Date(Math.min(...timestamps));
    lastDate = new Date(Math.max(...timestamps));

    //  разница в днях, включая начальный день
    totalDays = Math.floor((lastDate - firstDate) / (1000 * 60 * 60 * 24)) + 1;
  }

  // Форматирование дат для отображения
  const firstDateFormatted = firstDate
    ? moment(firstDate).format("DD.MM.YYYY")
    : "Н/Д";
  const lastDateFormatted = lastDate
    ? moment(lastDate).format("DD.MM.YYYY")
    : "Н/Д";

  // Среднее количество сообщений в день за весь период переписки
  const avgMessagesPerDay =
    totalDays > 0 ? userChat.messages.length / totalDays : 0;

  return {
    userId,
    totalMessages: userChat.messages.length, // Общее количество всех сообщений
    messagesByAuthor, // Распределение сообщений по авторам
    frequentWords, // Наиболее часто используемые слова
    dateStats, // Статистика по датам
    avgMessagesPerDay: Math.round(avgMessagesPerDay * 100) / 100, // Среднее число сообщений в день (округленное)
    chatPeriod: {
      firstDate: firstDateFormatted,
      lastDate: lastDateFormatted,
      totalDays,
    },
  };
}

module.exports = {
  extractUsers,
  generateUserStats,
};
