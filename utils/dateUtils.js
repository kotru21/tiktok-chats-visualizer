/**
 * Датовые утилиты: день недели, время суток, форматирование.
 */
import moment from "moment";

export const weekdayNames = [
  "Воскресенье",
  "Понедельник",
  "Вторник",
  "Среда",
  "Четверг",
  "Пятница",
  "Суббота",
];

export const timeOfDayBuckets = {
  "Утро (6:00-12:00)": [6, 12],
  "День (12:00-18:00)": [12, 18],
  "Вечер (18:00-00:00)": [18, 24],
  "Ночь (00:00-6:00)": [0, 6],
};

export function getWeekdayName(date) {
  return weekdayNames[date.getDay()];
}

export function getTimeOfDayBucket(date) {
  const hour = date.getHours();
  if (hour >= 6 && hour < 12) return "Утро (6:00-12:00)";
  if (hour >= 12 && hour < 18) return "День (12:00-18:00)";
  if (hour >= 18 && hour < 24) return "Вечер (18:00-00:00)";
  return "Ночь (00:00-6:00)";
}

export function formatDateISO(ts) {
  return moment(ts).format("YYYY-MM-DD");
}

export function formatDisplayDate(date) {
  return moment(date).format("DD.MM.YYYY");
}
