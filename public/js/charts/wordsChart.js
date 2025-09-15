import { getChartColorScheme } from "./colorScheme.js";

export function createWordsChart(canvasId, data) {
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext("2d");

  const parent = canvas.parentNode;
  const loaders = parent.querySelectorAll(".loading");
  loaders.forEach((loader) => loader.remove());

  if (!data || data.length === 0) {
    parent.innerHTML = '<div class="no-data">Недостаточно данных</div>';
    return;
  }

  const top10Words = data.slice(0, 10);

  const labels = top10Words.map((item) => item.word);
  const values = top10Words.map((item) => item.count);
  const colorScheme = getChartColorScheme();

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Частота использования",
          data: values,
          backgroundColor: "#4a6fa5",
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
