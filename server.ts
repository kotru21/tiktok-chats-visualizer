/**
 * Основной файл сервера для приложения анализа данных чатов TikTok.
 * Использует Express для создания RESTful API и обслуживания статических файлов.
 */
import express, { Request, Response, NextFunction } from "express";
import path from "node:path";
import session from "express-session";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import * as dataProcessor from "./utils/dataProcessor.js";
import { fileURLToPath } from "node:url";
import type { ChatData, TikTokChatEntry, User } from "./types/chat.js";
import type { UserStats } from "./types/stats.js";

// Расширение типа Session для добавления наших данных
declare module "express-session" {
  interface SessionData {
    chatData: ChatData;
    uploadId: string;
    // Кеш для сессии
    cache: {
      users?: User[];
      stats: Record<string, UserStats | null>;
    };
  }
}

const app = express();
const PORT = process.env["PORT"] ?? 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

/**
 * Middleware для проверки наличия загруженных данных в сессии
 */
function checkSessionData(req: Request, res: Response, next: NextFunction): void {
  if (!req.session.chatData) {
    res.status(400).json({ error: "Данные не загружены. Загрузите файл чатов." });
    return;
  }
  next();
}

/**
 * Интерфейс для структуры TikTok экспорта
 */
interface TikTokExport {
  "Direct Message"?: {
    "Direct Messages"?: {
      ChatHistory?: Record<string, TikTokChatEntry[]>;
    };
  };
}

/**
 * Обработчик загрузки файла JSON
 */
app.post("/api/upload", upload.single("chatFile"), (req: Request, res: Response): void => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "Файл не загружен" });
      return;
    }

    // Преобразуем загруженный файл из буфера в строку, затем в JSON
    const fileContent = req.file.buffer.toString("utf8");
    const parsedData = JSON.parse(fileContent) as TikTokExport;

    // Навигация по вложенной структуре JSON файла TikTok
    const chatHistory = parsedData["Direct Message"]?.["Direct Messages"]?.["ChatHistory"];

    if (!chatHistory) {
      res.status(400).json({ error: "Формат файла не соответствует экспорту TikTok" });
      return;
    }

    // Преобразование данных в удобный формат
    const chatArray: ChatData = [];

    Object.entries(chatHistory).forEach(([chatName, messages]) => {
      // Извлекаем имя пользователя из строки "Chat History with username:"
      const usernameMatch = /Chat History with ([^:]+):/.exec(chatName);
      const username = usernameMatch?.[1] ?? chatName;

      // Преобразуем исходный формат сообщений
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

    // Сохранение в сессию пользователя
    req.session.chatData = chatArray;
    req.session.uploadId = uuidv4(); // Уникальный ID загрузки
    // Очищаем кеш при новой загрузке
    req.session.cache = { stats: {} };

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

/**
 * API для получения списка пользователей чата
 * Результат кешируется в сессии
 */
app.get("/api/users", checkSessionData, (req: Request, res: Response): void => {
  try {
    // Инициализируем кеш, если его нет
    req.session.cache ??= { stats: {} };

    // Проверка кеша
    if (req.session.cache.users) {
      res.json(req.session.cache.users);
      return;
    }

    const chatData = req.session.chatData;
    if (!chatData) {
      res.status(400).json({ error: "Данные чата не загружены" });
      return;
    }
    const users = dataProcessor.extractUsers(chatData);
    req.session.cache.users = users; // Сохранение в кеш
    res.json(users);
  } catch (error) {
    console.error("Ошибка при обработке данных:", error);
    res.status(500).json({ error: "Ошибка при получении списка пользователей" });
  }
});

/**
 * API для получения статистики по конкретному пользователю
 * Результат кешируется в сессии по userId
 */
app.get("/api/users/:userId/stats", checkSessionData, (req: Request, res: Response): void => {
  try {
    const userId = req.params["userId"];
    if (!userId) {
      res.status(400).json({ error: "userId не указан" });
      return;
    }

    // Инициализируем кеш, если его нет
    req.session.cache ??= { stats: {} };

    // Проверка кеша
    if (userId in req.session.cache.stats) {
      res.json(req.session.cache.stats[userId]);
      return;
    }

    const chatData = req.session.chatData;
    if (!chatData) {
      res.status(400).json({ error: "Данные чата не загружены" });
      return;
    }
    const userStats = dataProcessor.generateUserStats(chatData, userId);
    req.session.cache.stats[userId] = userStats; // Сохранение в кеш
    res.json(userStats);
  } catch (error) {
    console.error("Ошибка при обработке статистики:", error);
    res.status(500).json({ error: "Ошибка при получении статистики пользователя" });
  }
});

// Запуск сервера (для production: https + домен)
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}: http://localhost:${PORT}`);
});
