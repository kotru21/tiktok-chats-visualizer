import { Chart } from "../charts/chartSetup.js";
import {
  createAuthorChart,
  createWordsChart,
  createWordPairsChart,
  createDateChart,
  createWeekdayChart,
  createTimeOfDayChart,
} from "../charts.js";
import { invalidateChartColorCache } from "../charts/colorScheme.js";
import type { UserStats } from "../../../types/stats.js";

type ChartInstance = Chart<"pie" | "bar" | "line">;

interface ChartJob {
  id: string;
  create: () => ChartInstance | null;
}

let chartRegistry: ChartInstance[] = [];

let chartObserver: IntersectionObserver | null = null;

function destroyCharts(): void {
  chartRegistry.forEach((chart) => {
    try {
      chart.destroy();
    } catch {}
  });
  chartRegistry = [];
}

function createAllCharts(stats: UserStats): void {
  const jobs: ChartJob[] = [
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

  chartObserver?.disconnect();

  chartObserver = new IntersectionObserver(
    (entries, obs) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const container = entry.target as HTMLElement;
          const canvas = container.querySelector("canvas");
          if (!canvas) continue;
          const job = jobs.find((j) => j.id === canvas.id);
          if (!job) continue;
          const chart = job.create();
          if (chart) chartRegistry.push(chart);
          const loadingEl = container.querySelector(".loading");
          if (loadingEl) loadingEl.remove();
          obs.unobserve(entry.target);
        }
      }
    },
    { root: null, rootMargin: "80px 0px", threshold: 0.05 }
  );

  const containers = [
    document.getElementById("messages-by-author"),
    document.getElementById("frequent-words"),
    document.getElementById("frequent-pairs"),
    document.getElementById("date-activity"),
    document.getElementById("weekday-activity"),
    document.getElementById("time-of-day-activity"),
  ];
  containers.forEach((container) => container && chartObserver?.observe(container));
}

let lastStats: UserStats | null = null;

window.addEventListener("theme:changed", () => {
  if (!lastStats) return;
  invalidateChartColorCache();
  destroyCharts();
  createAllCharts(lastStats);
});

export function renderStats(stats: UserStats): void {
  const myMessageAuthor = Object.keys(stats.messagesByAuthor).find(
    (author) => author !== stats.userId && author !== "TikTok"
  );
  const myMessages = myMessageAuthor ? (stats.messagesByAuthor[myMessageAuthor] ?? 0) : 0;
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
        stats.messagesByAuthor[stats.userId] ?? 0
      }</div></div>
      <div class="stat-item"><div class="stat-label">Активных дней</div><div class="stat-value">${
        stats.dateStats.length
      }</div></div>
    </div>`;

  const generalStatsEl = document.getElementById("general-stats");
  if (generalStatsEl) generalStatsEl.innerHTML = generalStatsHtml;

  document.querySelector(".stat-card")?.classList.add("full-width-card");

  const chartContainers = [
    { id: "frequent-pairs", canvasId: "pairs-chart" },
    { id: "weekday-activity", canvasId: "weekday-chart" },
    { id: "time-of-day-activity", canvasId: "time-of-day-chart" },
    { id: "messages-by-author", canvasId: "author-chart" },
    { id: "frequent-words", canvasId: "words-chart" },
    { id: "date-activity", canvasId: "date-chart" },
  ];

  for (const { id, canvasId } of chartContainers) {
    const container = document.getElementById(id);
    if (container) {
      container.innerHTML = `<canvas id="${canvasId}"></canvas><div class="loading"><div class="spinner"></div>Загрузка...</div>`;
    }
  }

  destroyCharts();
  createAllCharts(stats);
  lastStats = stats;
}
