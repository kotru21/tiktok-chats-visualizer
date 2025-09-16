import { setupUploader } from "./uploader.js";
import { getUsers, getUserStats } from "./api.js";
import { renderUserList, filterUserList } from "./ui/userList.js";
import { renderStats } from "./ui/statsView.js";
import "./theme.js"; // применяет тему при загрузке

document.addEventListener("DOMContentLoaded", () => {
  setupUploader({ onUploaded: loadUsers });
  setupEventListeners();

  // загрузка списка пользователей
  async function loadUsers() {
    try {
      const users = await getUsers();
      renderUserList(document.getElementById("userList"), users, loadUserStats);
      const sidebar = document.getElementById("sidebar");
      const toggleBtn = document.getElementById("sidebar-toggle");
      sidebar.classList.remove("hidden");
      sidebar.classList.add("active");
      toggleBtn?.classList.remove("hidden");
    } catch (error) {
      console.error("Ошибка:", error);
      document.getElementById("userList").innerHTML = `<div class="error">${
        error.message || "Ошибка при загрузке пользователей"
      }</div>`;
    }
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
        "<div class=\"loading\">Загрузка статистики...</div>";
      document.getElementById("messages-by-author").innerHTML =
        "<canvas id=\"author-chart\"></canvas><div class=\"loading\">Загрузка...</div>";
      document.getElementById("frequent-words").innerHTML =
        "<canvas id=\"words-chart\"></canvas><div class=\"loading\">Загрузка...</div>";
      document.getElementById("date-activity").innerHTML =
        "<canvas id=\"date-chart\"></canvas><div class=\"loading\">Загрузка...</div>";
      document.getElementById("weekday-activity").innerHTML =
        "<canvas id=\"weekday-chart\"></canvas><div class=\"loading\">Загрузка...</div>";
      document.getElementById("time-of-day-activity").innerHTML =
        "<canvas id=\"time-of-day-chart\"></canvas><div class=\"loading\">Загрузка...</div>";

      // загрузка статистики
      const stats = await getUserStats(userId);
      displayUserStats(stats);
    } catch (error) {
      console.error("Ошибка:", error);
      document.getElementById("general-stats").innerHTML =
        "<div class=\"error\">Ошибка при загрузке статистики. Пожалуйста, попробуйте позже.</div>";
    }
  }

  // функция для отображения статистики пользователя
  function displayUserStats(stats) {
    renderStats(stats);
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
      searchInput.addEventListener("input", () =>
        filterUserList(document.getElementById("userList"), searchInput.value)
      );
    }
  }
});
