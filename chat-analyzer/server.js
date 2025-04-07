/**
 * Основной файл сервера для приложения анализа данных чатов TikTok.
 * Использует Express для создания RESTful API и обслуживания статических файлов.
 * Предоставляет два основных API эндпоинта:
 * 1. /api/users - получение списка всех пользователей чата
 * 2. /api/users/:userId/stats - получение детальной статистики по конкретному пользователю
 */
const express = require("express");
const path = require("path");
const fs = require("fs");
const dataProcessor = require("./utils/dataProcessor");
// Модули для потоковой обработки JSON (используются при больших файлах)
const { parser } = require("stream-json");
const { pick } = require("stream-json/filters/Pick");
const { streamValues } = require("stream-json/streamers/StreamValues");
const { chain } = require("stream-chain");

const app = express();
const PORT = process.env.PORT || 3000;

// Глобальный кэш для данных, хранит обработанные данные чатов для повторного использования
let cachedData = null;

// Обслуживание статических файлов из директории public
app.use(express.static(path.join(__dirname, "public")));

/**
 * Асинхронная функция для загрузки и парсинга данных чатов из JSON файла.
 * Особенности:
 * - Использует кэширование для предотвращения повторной загрузки больших данных
 * - Адаптирована для работы со специфической структурой JSON-экспорта TikTok
 * - Преобразует данные в формат, удобный для дальнейшего анализа
 *
 * @returns {Promise<Array>} Промис с массивом обработанных данных чатов
 */
function loadChatDataAsync() {
  return new Promise((resolve, reject) => {
    // Возвращаем кэшированные данные, если они уже загружены
    if (cachedData) {
      return resolve(cachedData);
    }

    const dataPath = path.join(__dirname, "data/chats.json");

    // Загружаем файл целиком, так как stream-json не справился со структурой
    fs.readFile(dataPath, "utf8", (err, data) => {
      if (err) {
        return reject(err);
      }

      try {
        const parsedData = JSON.parse(data);

        // Навигация по вложенной структуре JSON файла TikTok
        const chatHistory =
          parsedData?.["Direct Message"]?.["Direct Messages"]?.["ChatHistory"];

        if (!chatHistory) {
          return reject(
            new Error("Структура данных не соответствует ожидаемой")
          );
        }

        // Преобразование сложной структуры данных в более простой формат
        const chatArray = [];

        Object.entries(chatHistory).forEach(([chatName, messages]) => {
          // Извлекаем имя пользователя из строки "Chat History with username:"
          const usernameMatch = chatName.match(/Chat History with ([^:]+):/);
          const username = usernameMatch ? usernameMatch[1] : chatName;

          // Преобразуем исходный формат сообщений в более удобный для анализа
          const formattedMessages = messages.map((message) => ({
            timestamp: message.Date, // Дата и время сообщения
            from: message.From, // Отправитель сообщения
            text: message.Content, // Содержимое сообщения
          }));

          chatArray.push({
            user: username, // Имя пользователя чата
            messages: formattedMessages, // Массив сообщений
          });
        });

        //  кэш для повторного использования
        cachedData = chatArray;
        resolve(chatArray);
      } catch (error) {
        reject(error);
      }
    });
  });
}

/**
 * API эндпоинт для получения списка всех пользователей.
 * Возвращает массив объектов с информацией о пользователях.
 */
app.get("/api/users", async (req, res) => {
  try {
    const chatData = await loadChatDataAsync();
    const users = dataProcessor.extractUsers(chatData);
    res.json(users);
  } catch (error) {
    console.error("Ошибка при чтении данных:", error);
    res
      .status(500)
      .json({ error: "Ошибка при получении списка пользователей" });
  }
});

/**
 * API эндпоинт для получения детальной статистики по выбранному пользователю.
 * Возвращает объект с различными статистическими показателями.
 */
app.get("/api/users/:userId/stats", async (req, res) => {
  try {
    const userId = req.params.userId;
    const chatData = await loadChatDataAsync();
    const userStats = dataProcessor.generateUserStats(chatData, userId);
    res.json(userStats);
  } catch (error) {
    console.error("Ошибка при обработке статистики:", error);
    res
      .status(500)
      .json({ error: "Ошибка при получении статистики пользователя" });
  }
});

// Запуск сервера на указанном порту
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
