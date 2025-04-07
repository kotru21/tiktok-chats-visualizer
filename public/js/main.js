document.addEventListener("DOMContentLoaded", () => {
  // настройка обработчиков загрузки файла
  setupFileUpload();
  setupEventListeners();

  // функция для настройки загрузки файла
  function setupFileUpload() {
    const uploadForm = document.getElementById("upload-form");
    const chatFileInput = document.getElementById("chat-file");
    const uploadStatus = document.getElementById("upload-status");
    const fileText = document.querySelector(".file-text");

    // отображение имени выбранного файла
    chatFileInput.addEventListener("change", () => {
      if (chatFileInput.files.length > 0) {
        fileText.textContent = chatFileInput.files[0].name;
      } else {
        fileText.textContent = "Выберите JSON файл";
      }
    });

    // обработка отправки формы
    uploadForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (!chatFileInput.files[0]) {
        uploadStatus.className = "upload-status status-error";
        uploadStatus.textContent = "Пожалуйста, выберите файл";
        return;
      }

      // отображение статуса загрузки
      uploadStatus.className = "upload-status status-loading";
      uploadStatus.innerHTML =
        '<div class="spinner"></div><span>Загрузка файла...</span>';

      // подготовка данных для отправки
      const formData = new FormData();
      formData.append("chatFile", chatFileInput.files[0]);

      try {
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Ошибка при загрузке файла");
        }

        // отображение успешного сообщения
        uploadStatus.className = "upload-status status-success";
        uploadStatus.textContent = `Файл успешно загружен! Найдено ${result.count} чатов.`;

        // скрытие формы загрузки
        document.getElementById("upload-container").classList.add("hidden");

        // загрузка списка пользователей
        loadUsers();
      } catch (error) {
        console.error("Ошибка:", error);
        uploadStatus.className = "upload-status status-error";
        uploadStatus.textContent = error.message || "Ошибка при загрузке файла";
      }
    });
  }

  // функция для загрузки списка пользователей
  async function loadUsers() {
    try {
      const response = await fetch("/api/users");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Ошибка при загрузке пользователей");
      }

      const users = await response.json();
      displayUsers(users);

      // отображение сайдбара после успешной загрузки
      document.getElementById("sidebar").classList.add("active");
    } catch (error) {
      console.error("Ошибка:", error);
      document.getElementById("userList").innerHTML = `<div class="error">${
        error.message || "Ошибка при загрузке пользователей"
      }</div>`;
    }
  }

  // функция для отображения списка пользователей
  function displayUsers(users) {
    const userListElement = document.getElementById("userList");

    if (users.length === 0) {
      userListElement.innerHTML =
        '<div class="no-data">Пользователи не найдены</div>';
      return;
    }

    const userItems = users
      .map(
        (user) => `
            <div class="user-item" data-user-id="${user.id}">
                <div class="user-name">${user.name}</div>
                <div class="user-message-count">${user.messageCount} сообщений</div>
            </div>
        `
      )
      .join("");

    userListElement.innerHTML = userItems;

    // добавление обработчиков событий для пользователей
    document.querySelectorAll(".user-item").forEach((item) => {
      item.addEventListener("click", function () {
        // удаление активного класса у всех элементов
        document
          .querySelectorAll(".user-item")
          .forEach((el) => el.classList.remove("active"));

        // добавление активного класса к выбранному элементу
        this.classList.add("active");

        // загрузка статистики для выбранного пользователя
        const userId = this.getAttribute("data-user-id");
        loadUserStats(userId);
      });
    });
  }

  // функция для загрузки статистики пользователя
  async function loadUserStats(userId) {
    try {
      // отображение информации о загрузке
      document.getElementById("welcome-message").style.display = "none";
      document.getElementById("user-stats").style.display = "block";
      document.getElementById("user-name").textContent = userId;

      // очистка предыдущих данных
      document.getElementById("general-stats").innerHTML =
        '<div class="loading">Загрузка статистики...</div>';
      document.getElementById("messages-by-author").innerHTML =
        '<canvas id="author-chart"></canvas><div class="loading">Загрузка...</div>';
      document.getElementById("frequent-words").innerHTML =
        '<canvas id="words-chart"></canvas><div class="loading">Загрузка...</div>';
      document.getElementById("date-activity").innerHTML =
        '<canvas id="date-chart"></canvas><div class="loading">Загрузка...</div>';

      // загрузка статистики
      const response = await fetch(`/api/users/${userId}/stats`);
      if (!response.ok) {
        throw new Error("Ошибка при загрузке статистики");
      }

      const stats = await response.json();
      displayUserStats(stats);
    } catch (error) {
      console.error("Ошибка:", error);
      document.getElementById("general-stats").innerHTML =
        '<div class="error">Ошибка при загрузке статистики. Пожалуйста, попробуйте позже.</div>';
    }
  }

  // функция для отображения статистики пользователя
  function displayUserStats(stats) {
    // Определяем собственный идентификатор пользователя (обычно "Me" или имя аккаунта)
    // TikTok обычно использует "Me" для обозначения собственных сообщений
    const myMessageAuthor = Object.keys(stats.messagesByAuthor).find(
      (author) => author !== stats.userId && author !== "TikTok"
    );

    // Количество сообщений от пользователя
    const myMessages = stats.messagesByAuthor[myMessageAuthor] || 0;

    // общая статистика в виде сетки 4х2
    const generalStatsHtml = `
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-label">Всего сообщений</div>
          <div class="stat-value">${stats.totalMessages}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Начало переписки</div>
          <div class="stat-value">${stats.chatPeriod.firstDate}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Конец переписки</div>
          <div class="stat-value">${stats.chatPeriod.lastDate}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Продолжительность</div>
          <div class="stat-value">${stats.chatPeriod.totalDays} дн.</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Сообщений в день</div>
          <div class="stat-value">${stats.avgMessagesPerDay}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Моих сообщений</div>
          <div class="stat-value">${myMessages}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Сообщений собеседника</div>
          <div class="stat-value">${
            stats.messagesByAuthor[stats.userId] || 0
          }</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Активных дней</div>
          <div class="stat-value">${stats.dateStats.length}</div>
        </div>
      </div>
    `;
    document.getElementById("general-stats").innerHTML = generalStatsHtml;

    // добавляем класс full-width-card к первой карточке
    document.querySelector(".stat-card").classList.add("full-width-card");

    // визуализация статистики на графиках с помощью Chart.js
    createAuthorChart("author-chart", stats.messagesByAuthor);
    createWordsChart("words-chart", stats.frequentWords);
    createDateChart("date-chart", stats.dateStats);
  }

  // настройка обработчиков событий
  function setupEventListeners() {
    // мобильное меню
    const sidebarToggle = document.getElementById("sidebar-toggle");
    const sidebar = document.getElementById("sidebar");

    if (sidebarToggle) {
      sidebarToggle.addEventListener("click", () => {
        sidebar.classList.toggle("active");
      });
    }

    // кнопка "Назад" на мобильных устройствах
    const backButton = document.getElementById("back-to-list");
    if (backButton) {
      backButton.addEventListener("click", () => {
        document.getElementById("user-stats").style.display = "none";
        document.getElementById("welcome-message").style.display = "flex";
        sidebar.classList.add("active");
      });
    }

    // закрытие сайдбара при клике на основной контент на мобильных
    const mainContent = document.querySelector(".main-content");
    if (mainContent) {
      mainContent.addEventListener("click", () => {
        if (window.innerWidth <= 768 && sidebar.classList.contains("active")) {
          sidebar.classList.remove("active");
        }
      });
    }

    // поиск по пользователям
    const searchInput = document.getElementById("user-search");
    if (searchInput) {
      searchInput.addEventListener("input", filterUsers);
    }
  }

  // фильтрация пользователей при поиске
  function filterUsers() {
    const searchInput = document.getElementById("user-search");
    const searchTerm = searchInput.value.toLowerCase();
    const userItems = document.querySelectorAll(".user-item");

    userItems.forEach((item) => {
      const userName = item
        .querySelector(".user-name")
        .textContent.toLowerCase();
      if (userName.includes(searchTerm)) {
        item.style.display = "block";
      } else {
        item.style.display = "none";
      }
    });
  }
});
