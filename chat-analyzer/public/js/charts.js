// Создает график распределения сообщений по авторам
function createAuthorChart(canvasId, data) {
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext("2d");

  // Очищаем предыдущие загрузочные сообщения
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

  // Очищаем предыдущие загрузочные сообщения
  const parent = canvas.parentNode;
  const loaders = parent.querySelectorAll(".loading");
  loaders.forEach((loader) => loader.remove());

  // Проверяем, есть ли данные для отображения
  if (!data || data.length === 0) {
    // Если данных нет, показываем сообщение
    parent.innerHTML =
      '<div class="no-data">Недостаточно данных для анализа слов</div>';
    return;
  }

  // Берем топ-10 слов для лучшей читаемости
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

// Создает график активности по датам
function createDateChart(canvasId, data) {
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext("2d");

  // Очищаем предыдущие загрузочные сообщения
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
