import { Chart } from "./chartSetup.js";
import { getChartColorScheme } from "./colorScheme.js";
import type { DateStat } from "../../../types/stats.js";

export function createDateChart(canvasId: string, data: DateStat[]): Chart<"line"> | null {
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const parent = canvas.parentNode as HTMLElement;
  const loaders = parent.querySelectorAll(".loading");
  loaders.forEach((loader) => loader.remove());

  const labels = data.map((item) => item.date);
  const values = data.map((item) => item.count);
  const colorScheme = getChartColorScheme();

  return new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Количество сообщений",
          data: values,
          backgroundColor: "rgba(74, 111, 165, 0.2)",
          borderColor: "#4a6fa5",
          borderWidth: 2,
          tension: 0.1,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: { precision: 0, color: colorScheme.fontColor },
          grid: { color: colorScheme.gridColor },
        },
      },
      plugins: { legend: { labels: { color: colorScheme.fontColor } } },
    },
  });
}
