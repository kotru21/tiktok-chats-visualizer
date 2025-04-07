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

  // Собираем количество сообщений от каждого участника чата
  const messagesByAuthor = _.countBy(userChat.messages, "from");

  // Анализ часто используемых слов с корректной обработкой предложений и очисткой от знаков препинания
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

    // Удаляем все URL более надежно
    text = text
      .replace(/https?:\/\/[^\s]+/g, "")
      .replace(/www\.[^\s]+/g, "")
      .replace(/\b\w+\.(?:com|ru|org|net|io)\b/g, "");

    if (text.trim() === "") return;

    // Более полная очистка текста от знаков препинания и символов
    text = text
      .toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()"""''«»\[\]]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    // Разбиваем на слова
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
      // Улучшенная фильтрация слов
      if (
        word &&
        word.length > 3 &&
        !allStopWords.includes(word) &&
        !word.includes(".") && // Исключаем все части URL с точками
        !/^\d+$/.test(word) // Исключаем числа
      ) {
        words[word] = (words[word] || 0) + 1;
      }
    });
  });

  // Определяем топ-20 наиболее часто используемых слов
  const frequentWords = Object.entries(words)
    // Проверяем количество уникальных слов
    .sort((a, b) => b[1] - a[1])
    // Если слов больше 20, фильтруем редкие
    // Если слов мало, не фильтруем, чтобы показать хоть что-то
    .filter(([word, count]) => {
      if (Object.keys(words).length >= 20) {
        return count > 1; // Для больших чатов фильтруем редкие слова
      }
      return true; // Для маленьких чатов показываем все слова
    })
    .slice(0, 20) // Топ-20 слов
    .map(([word, count]) => ({ word, count }));

  // Группируем сообщения по датам для анализа активности
  const messagesByDate = {};
  userChat.messages.forEach((msg) => {
    const date = moment(msg.timestamp).format("YYYY-MM-DD");
    messagesByDate[date] = (messagesByDate[date] || 0) + 1;
  });

  // Преобразуем данные по датам в формат для построения графиков
  const dateStats = Object.entries(messagesByDate)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  // Расчет полного периода переписки в днях, включая дни без сообщений
  let totalDays = 0;
  if (userChat.messages.length > 0) {
    // Определяем временной интервал между первым и последним сообщением
    const timestamps = userChat.messages.map((msg) => new Date(msg.timestamp));
    const firstDate = new Date(Math.min(...timestamps));
    const lastDate = new Date(Math.max(...timestamps));

    // Вычисляем разницу в днях, включая начальный день
    totalDays = Math.floor((lastDate - firstDate) / (1000 * 60 * 60 * 24)) + 1;
  }

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
  };
}

// Экспорт функций для использования в других модулях
module.exports = {
  extractUsers,
  generateUserStats,
};
