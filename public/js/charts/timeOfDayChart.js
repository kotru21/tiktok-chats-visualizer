import { getChartColorScheme } from "./colorScheme.js";

export function createTimeOfDayChart(canvasId, data) {
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext("2d");

  const parent = canvas.parentNode;
  const loaders = parent.querySelectorAll(".loading");
  loaders.forEach((loader) => loader.remove());

  const timeOrder = [
    "Утро (6:00-12:00)",
    "День (12:00-18:00)",
    "Вечер (18:00-00:00)",
    "Ночь (00:00-6:00)",
  ];

  const labels = timeOrder;
  const values = timeOrder.map((time) => data[time] || 0);
  const backgroundColors = ["#fdcb6e", "#74b9ff", "#6c5ce7", "#2d3436"];
  const colorScheme = getChartColorScheme();

  new Chart(ctx, {
    type: "pie",
    data: {
      labels: labels,
      datasets: [
        { data: values, backgroundColor: backgroundColors, borderWidth: 1 },
      ],
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
