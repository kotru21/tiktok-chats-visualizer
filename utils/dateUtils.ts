/**
 * Датовые утилиты: день недели, время суток, форматирование.
 */
import moment from "moment";
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
  return moment(ts).format("YYYY-MM-DD");
}

/**
 * Форматирует дату для отображения (DD.MM.YYYY).
 */
export function formatDisplayDate(date: string | Date): string {
  return moment(date).format("DD.MM.YYYY");
}
