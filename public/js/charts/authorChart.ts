import { Chart } from "./chartSetup.js";
import { getChartColorScheme } from "./colorScheme.js";
import type { FrequencyMap } from "../../../types/stats.js";

export function createAuthorChart(canvasId: string, data: FrequencyMap): Chart<"pie"> | null {
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const parent = canvas.parentNode as HTMLElement;
  const loaders = parent.querySelectorAll(".loading");
  loaders.forEach((loader) => loader.remove());

  const labels = Object.keys(data);
  const values = Object.values(data);
  const colorScheme = getChartColorScheme();

  const pie = colorScheme.pieColors;
  const sliceColors = labels.map((_, i) => pie[i % pie.length] ?? pie[0] ?? "#737373");

  return new Chart(ctx, {
    type: "pie",
    data: {
      labels: labels,
      datasets: [
        {
          data: values,
          backgroundColor: sliceColors,
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "right",
          labels: { color: colorScheme.fontColor },
        },
      },
    },
  });
}
