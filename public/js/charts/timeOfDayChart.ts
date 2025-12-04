import { Chart } from "./chartSetup.js";
import { getChartColorScheme } from "./colorScheme.js";
import { TIME_OF_DAY_ORDER } from "../config.js";
import type { TimeOfDayBucket } from "../../../types/date.js";

export function createTimeOfDayChart(
  canvasId: string,
  data: Record<TimeOfDayBucket, number>
): Chart<"pie"> | null {
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const parent = canvas.parentNode as HTMLElement;
  const loaders = parent.querySelectorAll(".loading");
  loaders.forEach((loader) => loader.remove());

  const labels = [...TIME_OF_DAY_ORDER];
  const values = TIME_OF_DAY_ORDER.map((time) => data[time]);
  const backgroundColors = ["#fdcb6e", "#74b9ff", "#6c5ce7", "#2d3436"];
  const colorScheme = getChartColorScheme();

  return new Chart(ctx, {
    type: "pie",
    data: {
      labels: labels,
      datasets: [{ data: values, backgroundColor: backgroundColors, borderWidth: 1 }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "right", labels: { color: colorScheme.fontColor } },
      },
    },
  });
}
