import type { User, UploadResult } from "../../types/chat.js";
import type { UserStats } from "../../types/stats.js";

/**
 * Модуль API для работы с данными чатов TikTok.
 * Использует Web Worker для обработки данных в отдельном потоке.
 */

// === Типы для Worker ===

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

// === Инициализация Worker ===

let worker: Worker | null = null;
let messageId = 0;
const pendingRequests = new Map<
  number,
  { resolve: (value: unknown) => void; reject: (error: Error) => void }
>();

/**
 * Инициализирует Web Worker для обработки данных
 */
function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL("./workers/dataProcessor.worker.ts", import.meta.url), {
      type: "module",
    });

    worker.onmessage = (e: MessageEvent<WorkerResponse>): void => {
      const { type, payload, id } = e.data;
      const pending = pendingRequests.get(id);

      if (pending) {
        pendingRequests.delete(id);
        if (type === "success") {
          pending.resolve(payload);
        } else {
          pending.reject(new Error(payload as string));
        }
      }
    };

    worker.onerror = (error): void => {
      console.error("Worker error:", error);
    };
  }

  return worker;
}

/**
 * Отправляет сообщение Worker и ждёт ответа
 */
function sendToWorker<T>(type: WorkerMessage["type"], payload?: unknown): Promise<T> {
  return new Promise((resolve, reject) => {
    const id = ++messageId;
    pendingRequests.set(id, {
      resolve: resolve as (value: unknown) => void,
      reject,
    });

    const message: WorkerMessage = { type, payload, id };
    getWorker().postMessage(message);
  });
}

// === Кеш ===

let cachedUsers: User[] | null = null;
const statsCache = new Map<string, UserStats>();

/**
 * Загружает и парсит файл чата TikTok
 * Обработка происходит в Web Worker
 */
export async function uploadFile(file: File): Promise<UploadResult> {
  // Очищаем кеш при загрузке нового файла
  clearApiCache();

  // Читаем файл
  const fileContent = await file.text();

  // Парсим в Worker
  const result = await sendToWorker<UploadResult>("parse", fileContent);

  return result;
}

/**
 * Получает список пользователей из загруженных данных
 */
export async function getUsers(): Promise<User[]> {
  // Проверяем кеш
  if (cachedUsers) {
    return cachedUsers;
  }

  const users = await sendToWorker<User[]>("getUsers");
  cachedUsers = users;
  return users;
}

/**
 * Получает статистику по конкретному пользователю
 */
export async function getUserStats(userId: string): Promise<UserStats> {
  // Проверяем кеш
  const cached = statsCache.get(userId);
  if (cached) {
    return cached;
  }

  const stats = await sendToWorker<UserStats>("getUserStats", userId);
  statsCache.set(userId, stats);
  return stats;
}

/**
 * Очищает весь кеш
 * Вызывается после загрузки нового файла
 */
export function clearApiCache(): void {
  cachedUsers = null;
  statsCache.clear();
}
