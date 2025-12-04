import type { WeekdayName, TimeOfDayBucket } from "../../types/date.js";

// Общие константы конфигурации фронтенда
export const CHART_TOP_N_WORDS = 10 as const;
export const CHART_TOP_N_PAIRS = 10 as const;

export const WEEKDAY_ORDER: readonly WeekdayName[] = [
  "Понедельник",
  "Вторник",
  "Среда",
  "Четверг",
  "Пятница",
  "Суббота",
  "Воскресенье",
] as const;

export const TIME_OF_DAY_ORDER: readonly TimeOfDayBucket[] = [
  "Утро (6:00-12:00)",
  "День (12:00-18:00)",
  "Вечер (18:00-00:00)",
  "Ночь (00:00-6:00)",
] as const;
