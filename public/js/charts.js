function createAuthorChart(canvasId, data) {
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext("2d");

  const parent = canvas.parentNode;
  const loaders = parent.querySelectorAll(".loading");
  loaders.forEach((loader) => loader.remove());

  const labels = Object.keys(data);
  const values = Object.values(data);

  new Chart(ctx, {
    type: "pie",
    data: {
      labels: labels,
      datasets: [
        {
          data: values,
          backgroundColor: [
            "#4a6fa5",
            "#ff7675",
            "#fdcb6e",
            "#00cec9",
            "#6c5ce7",
          ],
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
        },
      },
    },
  });
}

// Создает график частоты использования слов
function createWordsChart(canvasId, data) {
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext("2d");

  const parent = canvas.parentNode;
  const loaders = parent.querySelectorAll(".loading");
  loaders.forEach((loader) => loader.remove());

  if (!data || data.length === 0) {
    parent.innerHTML =
      '<div class="no-data">Недостаточно данных для анализа слов</div>';
    return;
  }

  const top10Words = data.slice(0, 10);

  const labels = top10Words.map((item) => item.word);
  const values = top10Words.map((item) => item.count);

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
        },
        x: {
          beginAtZero: true,
          ticks: {
            precision: 0,
          },
        },
      },
    },
  });
}

//  график активности по датам
function createDateChart(canvasId, data) {
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext("2d");

  const parent = canvas.parentNode;
  const loaders = parent.querySelectorAll(".loading");
  loaders.forEach((loader) => loader.remove());

  const labels = data.map((item) => item.date);
  const values = data.map((item) => item.count);

  new Chart(ctx, {
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
          ticks: {
            precision: 0,
          },
        },
      },
    },
  });
}

// Создает график для частоты использования сочетаний слов
function createWordPairsChart(canvasId, data) {
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext("2d");

  const parent = canvas.parentNode;
  const loaders = parent.querySelectorAll(".loading");
  loaders.forEach((loader) => loader.remove());

  if (!data || data.length === 0) {
    parent.innerHTML =
      '<div class="no-data">Недостаточно данных для анализа сочетаний слов</div>';
    return;
  }

  // Ограничим до 10 самых частых сочетаний для лучшей читаемости
  const top10Pairs = data.slice(0, 10);

  const labels = top10Pairs.map((item) => item.pair);
  const values = top10Pairs.map((item) => item.count);

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Частота использования",
          data: values,
          backgroundColor: "#69c9d0", // Используем дополнительный цвет TikTok для разнообразия
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
        },
        x: {
          beginAtZero: true,
          ticks: {
            precision: 0,
          },
        },
      },
    },
  });
}
