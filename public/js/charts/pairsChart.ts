import { Chart } from "./chartSetup.js";
import { getChartColorScheme } from "./colorScheme.js";
import { CHART_TOP_N_PAIRS } from "../config.js";
import type { WordPairFrequency } from "../../../types/stats.js";

export function createWordPairsChart(
  canvasId: string,
  data: WordPairFrequency[]
): Chart<"bar"> | null {
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
  const ctx = canvas.getContext("2d");

  const parent = canvas.parentNode as HTMLElement;
  const loaders = parent.querySelectorAll(".loading");
  loaders.forEach((loader) => loader.remove());

  if (!ctx || data.length === 0) {
    parent.innerHTML = "<div class=\"no-data\">Недостаточно данных</div>";
    return null;
  }

  const top10Pairs = data.slice(0, CHART_TOP_N_PAIRS);

  const labels = top10Pairs.map((item) => item.pair);
  const values = top10Pairs.map((item) => item.count);
  const colorScheme = getChartColorScheme();

  return new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Частота использования",
          data: values,
          backgroundColor: "#69c9d0",
          borderWidth: 1,
        },
      ],
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: colorScheme.fontColor },
          grid: { color: colorScheme.gridColor },
        },
        x: {
          beginAtZero: true,
          ticks: { precision: 0, color: colorScheme.fontColor },
          grid: { color: colorScheme.gridColor },
        },
      },
      plugins: { legend: { labels: { color: colorScheme.fontColor } } },
    },
  });
}
