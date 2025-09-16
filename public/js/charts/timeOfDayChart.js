import { getChartColorScheme } from "./colorScheme.js";
import { TIME_OF_DAY_ORDER } from "../config.js";

export function createTimeOfDayChart(canvasId, data) {
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext("2d");

  const parent = canvas.parentNode;
  const loaders = parent.querySelectorAll(".loading");
  loaders.forEach((loader) => loader.remove());

  const labels = TIME_OF_DAY_ORDER;
  const values = TIME_OF_DAY_ORDER.map((time) => data[time] || 0);
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
