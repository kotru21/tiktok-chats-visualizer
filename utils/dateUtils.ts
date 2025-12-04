/**
 * Датовые утилиты: день недели, время суток, форматирование.
 * Без внешних зависимостей - используем встроенный Date API.
 */
import type { WeekdayName, TimeOfDayBucket } from "../types/date.js";

/**
 * Названия дней недели (индекс 0 = Воскресенье, как в Date.getDay())
 */
export const weekdayNames: readonly string[] = [
  "Воскресенье",
  "Понедельник",
  "Вторник",
  "Среда",
  "Четверг",
  "Пятница",
  "Суббота",
] as const;

/**
 * Временные интервалы суток с диапазонами часов
 */
export const timeOfDayBuckets: Record<TimeOfDayBucket, readonly [number, number]> = {
  "Утро (6:00-12:00)": [6, 12],
  "День (12:00-18:00)": [12, 18],
  "Вечер (18:00-00:00)": [18, 24],
  "Ночь (00:00-6:00)": [0, 6],
} as const;

/**
 * Возвращает название дня недели для даты.
 */
export function getWeekdayName(date: Date): WeekdayName {
  return weekdayNames[date.getDay()] as WeekdayName;
}

/**
 * Возвращает временной интервал суток для даты.
 */
export function getTimeOfDayBucket(date: Date): TimeOfDayBucket {
  const hour = date.getHours();
  if (hour >= 6 && hour < 12) return "Утро (6:00-12:00)";
  if (hour >= 12 && hour < 18) return "День (12:00-18:00)";
  if (hour >= 18 && hour < 24) return "Вечер (18:00-00:00)";
  return "Ночь (00:00-6:00)";
}

/**
 * Форматирует timestamp в ISO формат даты (YYYY-MM-DD).
 */
export function formatDateISO(ts: string | Date): string {
  const date = typeof ts === "string" ? new Date(ts) : ts;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Форматирует дату для отображения (DD.MM.YYYY).
 */
export function formatDisplayDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}
