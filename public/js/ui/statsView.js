import {
  createAuthorChart,
  createWordsChart,
  createWordPairsChart,
  createDateChart,
  createWeekdayChart,
  createTimeOfDayChart,
} from "../charts.js";
import { invalidateChartColorCache } from "../charts/colorScheme.js";

// Реестр активных графиков для корректного уничтожения/пересоздания
let chartRegistry = [];

function destroyCharts() {
  chartRegistry.forEach((chart) => {
    try {
      chart.destroy();
    } catch {}
  });
  chartRegistry = [];
}

function createAllCharts(stats) {
  const jobs = [
    {
      id: "author-chart",
      create: () => createAuthorChart("author-chart", stats.messagesByAuthor),
    },
    {
      id: "words-chart",
      create: () => createWordsChart("words-chart", stats.frequentWords),
    },
    {
      id: "pairs-chart",
      create: () => createWordPairsChart("pairs-chart", stats.frequentWordPairs),
    },
    {
      id: "date-chart",
      create: () => createDateChart("date-chart", stats.dateStats),
    },
    {
      id: "weekday-chart",
      create: () => createWeekdayChart("weekday-chart", stats.messagesByWeekday),
    },
    {
      id: "time-of-day-chart",
      create: () => createTimeOfDayChart("time-of-day-chart", stats.messagesByTimeOfDay),
    },
  ];

  // Ленивая инициализация с IntersectionObserver
  const observer = new IntersectionObserver(
    (entries, obs) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const canvas = entry.target.querySelector("canvas");
          if (!canvas) continue;
          const job = jobs.find((j) => j.id === canvas.id);
          if (!job) continue;
          const chart = job.create();
          if (chart) chartRegistry.push(chart);
          obs.unobserve(entry.target);
        }
      }
    },
    { root: null, rootMargin: "0px", threshold: 0.2 }
  );

  // Подписываемся на карточки-контейнеры с графиками
  [
    document.getElementById("messages-by-author"),
    document.getElementById("frequent-words"),
    document.getElementById("frequent-pairs"),
    document.getElementById("date-activity"),
    document.getElementById("weekday-activity"),
    document.getElementById("time-of-day-activity"),
  ].forEach((container) => container && observer.observe(container));
}

// Храним последние статистики, чтобы пересоздавать на смену темы
let lastStats = null;

// Подписка на смену темы: пересоздаем графики, чтобы обновить цвета осей/лейблов
window.addEventListener("theme:changed", () => {
  if (!lastStats) return;
  invalidateChartColorCache();
  destroyCharts();
  createAllCharts(lastStats);
});

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
    "<canvas id=\"pairs-chart\"></canvas><div class=\"loading\">Загрузка...</div>";
  document.getElementById("weekday-activity").innerHTML =
    "<canvas id=\"weekday-chart\"></canvas><div class=\"loading\">Загрузка...</div>";
  document.getElementById("time-of-day-activity").innerHTML =
    "<canvas id=\"time-of-day-chart\"></canvas><div class=\"loading\">Загрузка...</div>";

  // Уничтожаем предыдущие графики, если есть
  destroyCharts();

  // Создаем новые графики (лениво по видимости)
  createAllCharts(stats);

  // Сохраняем последние данные статистики
  lastStats = stats;
}
