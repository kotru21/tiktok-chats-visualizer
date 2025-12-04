import { Chart } from "./chartSetup.js";
import { getChartColorScheme } from "./colorScheme.js";
import { WEEKDAY_ORDER } from "../config.js";
import type { WeekdayName } from "../../../types/date.js";

export function createWeekdayChart(
  canvasId: string,
  data: Record<WeekdayName, number>
): Chart<"bar"> | null {
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const parent = canvas.parentNode as HTMLElement;
  const loaders = parent.querySelectorAll(".loading");
  loaders.forEach((loader) => loader.remove());

  const labels = [...WEEKDAY_ORDER];
  const values = WEEKDAY_ORDER.map((day) => data[day]);
  const colorScheme = getChartColorScheme();

  return new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Количество сообщений",
          data: values,
          backgroundColor: "#ee1d52",
          borderWidth: 1,
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
