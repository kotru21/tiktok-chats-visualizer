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
    parent.innerHTML = '<div class="no-data">Недостаточно данных</div>';
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
    parent.innerHTML = '<div class="no-data">Недостаточно данных</div>';
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

// Создает график активности по дням недели
function createWeekdayChart(canvasId, data) {
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext("2d");

  const parent = canvas.parentNode;
  const loaders = parent.querySelectorAll(".loading");
  loaders.forEach((loader) => loader.remove());

  // Определяем порядок дней недели
  const weekdayOrder = [
    "Понедельник",
    "Вторник",
    "Среда",
    "Четверг",
    "Пятница",
    "Суббота",
    "Воскресенье",
  ];

  const labels = weekdayOrder;
  const values = weekdayOrder.map((day) => data[day] || 0);

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Количество сообщений",
          data: values,
          backgroundColor: "#ee1d52", // Основной цвет TikTok
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
          ticks: {
            precision: 0,
          },
        },
      },
    },
  });
}

// Создает график активности по времени суток
function createTimeOfDayChart(canvasId, data) {
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext("2d");

  const parent = canvas.parentNode;
  const loaders = parent.querySelectorAll(".loading");
  loaders.forEach((loader) => loader.remove());

  // Порядок времени суток для графика
  const timeOrder = [
    "Утро (6:00-12:00)",
    "День (12:00-18:00)",
    "Вечер (18:00-00:00)",
    "Ночь (00:00-6:00)",
  ];

  const labels = timeOrder;
  const values = timeOrder.map((time) => data[time] || 0);

  // Разные цвета для разных периодов суток
  const backgroundColors = [
    "#fdcb6e", // утро - желтый
    "#74b9ff", // день - голубой
    "#6c5ce7", // вечер - фиолетовый
    "#2d3436", // ночь - темно-серый
  ];

  new Chart(ctx, {
    type: "pie",
    data: {
      labels: labels,
      datasets: [
        {
          data: values,
          backgroundColor: backgroundColors,
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
