document.addEventListener("DOMContentLoaded", () => {
  // Инициализация приложения
  loadUsers();
  setupEventListeners();

  // Функция для загрузки списка пользователей
  async function loadUsers() {
    try {
      const response = await fetch("/api/users");
      if (!response.ok) {
        throw new Error("Ошибка при загрузке пользователей");
      }

      const users = await response.json();
      displayUsers(users);
    } catch (error) {
      console.error("Ошибка:", error);
      document.getElementById("userList").innerHTML =
        '<div class="error">Ошибка при загрузке пользователей. Пожалуйста, попробуйте позже.</div>';
    }
  }

  // Функция для отображения списка пользователей
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

    // Добавляем обработчики событий для пользователей
    document.querySelectorAll(".user-item").forEach((item) => {
      item.addEventListener("click", function () {
        // Удаляем активный класс у всех элементов
        document
          .querySelectorAll(".user-item")
          .forEach((el) => el.classList.remove("active"));

        // Добавляем активный класс к выбранному элементу
        this.classList.add("active");

        // Загружаем статистику для выбранного пользователя
        const userId = this.getAttribute("data-user-id");
        loadUserStats(userId);
      });
    });
  }

  // Функция для загрузки статистики пользователя
  async function loadUserStats(userId) {
    try {
      // Показываем информацию о загрузке
      document.getElementById("welcome-message").style.display = "none";
      document.getElementById("user-stats").style.display = "block";
      document.getElementById("user-name").textContent = userId;

      // Очищаем предыдущие данные
      document.getElementById("general-stats").innerHTML =
        '<div class="loading">Загрузка статистики...</div>';
      document.getElementById("messages-by-author").innerHTML =
        '<canvas id="author-chart"></canvas><div class="loading">Загрузка...</div>';
      document.getElementById("frequent-words").innerHTML =
        '<canvas id="words-chart"></canvas><div class="loading">Загрузка...</div>';
      document.getElementById("date-activity").innerHTML =
        '<canvas id="date-chart"></canvas><div class="loading">Загрузка...</div>';

      // Загружаем статистику
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

  // Функция для отображения статистики пользователя
  function displayUserStats(stats) {
    // Общая статистика
    const generalStatsHtml = `
            <table>
                <tr>
                    <th>Всего сообщений</th>
                    <td>${stats.totalMessages}</td>
                </tr>
                <tr>
                    <th>Среднее количество сообщений в день</th>
                    <td>${stats.avgMessagesPerDay}</td>
                </tr>
            </table>
        `;
    document.getElementById("general-stats").innerHTML = generalStatsHtml;

    // Визуализируем статистику на графиках с помощью Chart.js
    createAuthorChart("author-chart", stats.messagesByAuthor);
    createWordsChart("words-chart", stats.frequentWords);
    createDateChart("date-chart", stats.dateStats);
  }

  // Настройка обработчиков событий
  function setupEventListeners() {
    // Мобильное меню
    const sidebarToggle = document.getElementById("sidebar-toggle");
    const sidebar = document.getElementById("sidebar");

    if (sidebarToggle) {
      sidebarToggle.addEventListener("click", () => {
        sidebar.classList.toggle("active");
      });
    }

    // Кнопка "Назад" на мобильных устройствах
    const backButton = document.getElementById("back-to-list");
    if (backButton) {
      backButton.addEventListener("click", () => {
        document.getElementById("user-stats").style.display = "none";
        document.getElementById("welcome-message").style.display = "flex";
        sidebar.classList.add("active");
      });
    }

    // Закрытие сайдбара при клике на основной контент на мобильных
    const mainContent = document.querySelector(".main-content");
    if (mainContent) {
      mainContent.addEventListener("click", () => {
        if (window.innerWidth <= 768 && sidebar.classList.contains("active")) {
          sidebar.classList.remove("active");
        }
      });
    }

    // Поиск по пользователям
    const searchInput = document.getElementById("user-search");
    if (searchInput) {
      searchInput.addEventListener("input", filterUsers);
    }
  }

  // Фильтрация пользователей при поиске
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
