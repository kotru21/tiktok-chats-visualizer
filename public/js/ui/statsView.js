import {
  createAuthorChart,
  createWordsChart,
  createWordPairsChart,
  createDateChart,
  createWeekdayChart,
  createTimeOfDayChart,
} from "../charts.js";

export function renderStats(stats) {
  // Общая карточка
  const myMessageAuthor = Object.keys(stats.messagesByAuthor).find(
    (author) => author !== stats.userId && author !== "TikTok"
  );
  const myMessages = stats.messagesByAuthor[myMessageAuthor] || 0;
  const generalStatsHtml = `
    <div class="stats-grid">
      <div class="stat-item"><div class="stat-label">Всего сообщений</div><div class="stat-value">${
        stats.totalMessages
      }</div></div>
      <div class="stat-item"><div class="stat-label">Начало переписки</div><div class="stat-value">${
        stats.chatPeriod.firstDate
      }</div></div>
      <div class="stat-item"><div class="stat-label">Конец переписки</div><div class="stat-value">${
        stats.chatPeriod.lastDate
      }</div></div>
      <div class="stat-item"><div class="stat-label">Продолжительность</div><div class="stat-value">${
        stats.chatPeriod.totalDays
      } дн.</div></div>
      <div class="stat-item"><div class="stat-label">Сообщений в день</div><div class="stat-value">${
        stats.avgMessagesPerDay
      }</div></div>
      <div class="stat-item"><div class="stat-label">Моих сообщений</div><div class="stat-value">${myMessages}</div></div>
      <div class="stat-item"><div class="stat-label">Сообщений собеседника</div><div class="stat-value">${
        stats.messagesByAuthor[stats.userId] || 0
      }</div></div>
      <div class="stat-item"><div class="stat-label">Активных дней</div><div class="stat-value">${
        stats.dateStats.length
      }</div></div>
    </div>`;
  document.getElementById("general-stats").innerHTML = generalStatsHtml;

  document.querySelector(".stat-card")?.classList.add("full-width-card");

  // Обновляем контейнеры
  document.getElementById("frequent-pairs").innerHTML =
    '<canvas id="pairs-chart"></canvas><div class="loading">Загрузка...</div>';
  document.getElementById("weekday-activity").innerHTML =
    '<canvas id="weekday-chart"></canvas><div class="loading">Загрузка...</div>';
  document.getElementById("time-of-day-activity").innerHTML =
    '<canvas id="time-of-day-chart"></canvas><div class="loading">Загрузка...</div>';

  // Чарты
  createAuthorChart("author-chart", stats.messagesByAuthor);
  createWordsChart("words-chart", stats.frequentWords);
  createWordPairsChart("pairs-chart", stats.frequentWordPairs);
  createDateChart("date-chart", stats.dateStats);
  createWeekdayChart("weekday-chart", stats.messagesByWeekday);
  createTimeOfDayChart("time-of-day-chart", stats.messagesByTimeOfDay);
}
