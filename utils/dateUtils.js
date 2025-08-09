/**
 * Датовые утилиты: день недели, время суток, форматирование.
 */
const moment = require("moment");

const weekdayNames = [
  "Воскресенье",
  "Понедельник",
  "Вторник",
  "Среда",
  "Четверг",
  "Пятница",
  "Суббота",
];

const timeOfDayBuckets = {
  "Утро (6:00-12:00)": [6, 12],
  "День (12:00-18:00)": [12, 18],
  "Вечер (18:00-00:00)": [18, 24],
  "Ночь (00:00-6:00)": [0, 6],
};

function getWeekdayName(date) {
  return weekdayNames[date.getDay()];
}

function getTimeOfDayBucket(date) {
  const hour = date.getHours();
  if (hour >= 6 && hour < 12) return "Утро (6:00-12:00)";
  if (hour >= 12 && hour < 18) return "День (12:00-18:00)";
  if (hour >= 18 && hour < 24) return "Вечер (18:00-00:00)";
  return "Ночь (00:00-6:00)";
}

function formatDateISO(ts) {
  return moment(ts).format("YYYY-MM-DD");
}

function formatDisplayDate(date) {
  return moment(date).format("DD.MM.YYYY");
}

module.exports = {
  weekdayNames,
  timeOfDayBuckets,
  getWeekdayName,
  getTimeOfDayBucket,
  formatDateISO,
  formatDisplayDate,
};
