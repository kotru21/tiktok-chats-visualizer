import type { User, UploadResult } from "../../types/chat.js";
import type { UserStats } from "../../types/stats.js";
import { memoizeAsync } from "./utils/performance.js";

/**
 * Загружает файл на сервер
 * После загрузки очищает кеш, так как данные изменились
 */
export async function uploadFile(file: File): Promise<UploadResult> {
  const formData = new FormData();
  formData.append("chatFile", file);
  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });
  const result = (await response.json().catch(() => ({}))) as UploadResult;
  if (!response.ok) throw new Error(result.message || "Ошибка при загрузке файла");

  // Очищаем кеш после загрузки новых данных
  clearApiCache();

  return result;
}

/**
 * Внутренняя функция получения пользователей (без кеша)
 */
async function fetchUsers(): Promise<User[]> {
  const response = await fetch("/api/users");
  const result = (await response.json().catch(() => ({}))) as User[] | { error?: string };
  if (!response.ok) {
    const errorResult = result as { error?: string };
    throw new Error(errorResult.error ?? "Ошибка при загрузке пользователей");
  }
  return result as User[];
}

/**
 * Внутренняя функция получения статистики (без кеша)
 */
async function fetchUserStats(userId: string): Promise<UserStats> {
  const response = await fetch(`/api/users/${encodeURIComponent(userId)}/stats`);
  const result = (await response.json().catch(() => ({}))) as UserStats | { error?: string };
  if (!response.ok) {
    const errorResult = result as { error?: string };
    throw new Error(errorResult.error ?? "Ошибка при загрузке статистики");
  }
  return result as UserStats;
}

/**
 * Мемоизированная версия получения пользователей
 * Кеширует результат до следующей загрузки файла
 */
export const getUsers = memoizeAsync(
  fetchUsers,
  1, // Только один вариант результата
  () => "users" // Фиксированный ключ
);

/**
 * Мемоизированная версия получения статистики
 * Кеширует результаты по userId (до 50 пользователей)
 */
export const getUserStats = memoizeAsync(fetchUserStats, 50, (userId) => userId);

/**
 * Очищает весь API кеш
 * Вызывается после загрузки нового файла
 */
export function clearApiCache(): void {
  getUsers.clear();
  getUserStats.clear();
}
