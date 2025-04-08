/**
 * Основной файл сервера для приложения анализа данных чатов TikTok.
 * Использует Express для создания RESTful API и обслуживания статических файлов.
 */
const express = require("express");
const path = require("path");
const session = require("express-session");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const dataProcessor = require("./utils/dataProcessor");

const app = express();
const PORT = process.env.PORT || 3000;

// Настройка хранилища для загружаемых файлов (в памяти)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // Лимит 15MB
});

// Настройка сессий
app.use(
  session({
    secret: "tiktok-analyzer-secret",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // В production установите true с HTTPS
  })
);

// Обслуживание статических файлов из директории public
app.use(express.static(path.join(__dirname, "public")));

// Проверка наличия загруженных данных в сессии
const checkSessionData = (req, res, next) => {
  if (!req.session.chatData) {
    return res
      .status(400)
      .json({ error: "Данные не загружены. Загрузите файл чатов." });
  }
  next();
};

// Обработчик загрузки файла JSON
app.post("/api/upload", upload.single("chatFile"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Файл не загружен" });
    }

    // Преобразуем загруженный файл из буфера в строку, затем в JSON
    const fileContent = req.file.buffer.toString("utf8");
    const parsedData = JSON.parse(fileContent);

    // Навигация по вложенной структуре JSON файла TikTok
    const chatHistory =
      parsedData?.["Direct Message"]?.["Direct Messages"]?.["ChatHistory"];

    if (!chatHistory) {
      return res
        .status(400)
        .json({ error: "Формат файла не соответствует экспорту TikTok" });
    }

    // Преобразование данных в удобный формат
    const chatArray = [];

    Object.entries(chatHistory).forEach(([chatName, messages]) => {
      // Извлекаем имя пользователя из строки "Chat History with username:"
      const usernameMatch = chatName.match(/Chat History with ([^:]+):/);
      const username = usernameMatch ? usernameMatch[1] : chatName;

      // Преобразуем исходный формат сообщений
      const formattedMessages = messages.map((message) => ({
        timestamp: message.Date,
        from: message.From,
        text: message.Content,
      }));

      chatArray.push({
        user: username,
        messages: formattedMessages,
      });
    });

    // Сохраняем в сессию пользователя
    req.session.chatData = chatArray;
    req.session.uploadId = uuidv4(); // Уникальный ID загрузки

    res.json({
      success: true,
      message: "Файл успешно загружен",
      count: chatArray.length,
    });
  } catch (error) {
    console.error("Ошибка при обработке файла:", error);
    res.status(500).json({ error: "Ошибка при обработке файла" });
  }
});

// API для получения списка пользователей чата
app.get("/api/users", checkSessionData, (req, res) => {
  try {
    const users = dataProcessor.extractUsers(req.session.chatData);
    res.json(users);
  } catch (error) {
    console.error("Ошибка при обработке данных:", error);
    res
      .status(500)
      .json({ error: "Ошибка при получении списка пользователей" });
  }
});

// API для получения статистики по конкретному пользователю
app.get("/api/users/:userId/stats", checkSessionData, (req, res) => {
  try {
    const userId = req.params.userId;
    const userStats = dataProcessor.generateUserStats(
      req.session.chatData,
      userId
    );
    res.json(userStats);
  } catch (error) {
    console.error("Ошибка при обработке статистики:", error);
    res
      .status(500)
      .json({ error: "Ошибка при получении статистики пользователя" });
  }
});

// Запуск сервера. Для production изменить на https и добавить домен
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}: http://localhost:${PORT}`);
});
