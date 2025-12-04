import { setupUploader } from "./uploader.js";
import { getUsers, getUserStats } from "./api.js";
import { renderUserList, filterUserList } from "./ui/userList.js";
import { renderStats } from "./ui/statsView.js";
import { debounce } from "./utils/performance.js";
import "./theme.js"; // применяет тему при загрузке

document.addEventListener("DOMContentLoaded", () => {
  setupUploader({ onUploaded: loadUsers });
  setupEventListeners();

  // загрузка списка пользователей
  async function loadUsers(): Promise<void> {
    try {
      const users = await getUsers();
      renderUserList(document.getElementById("userList"), users, loadUserStats);
      const sidebar = document.getElementById("sidebar");
      const toggleBtn = document.getElementById("sidebar-toggle");
      sidebar?.classList.remove("hidden");
      sidebar?.classList.add("active");
      toggleBtn?.classList.remove("hidden");
    } catch (error) {
      console.error("Ошибка:", error);
      const userList = document.getElementById("userList");
      if (userList) {
        const errorMessage =
          error instanceof Error ? error.message : "Ошибка при загрузке пользователей";
        userList.innerHTML = `<div class="error">${errorMessage}</div>`;
      }
    }
  }

  // функция для загрузки статистики пользователя
  async function loadUserStats(userId: string): Promise<void> {
    try {
      // отображение информации о загрузке
      const welcomeMessage = document.getElementById("welcome-message");
      const userStats = document.getElementById("user-stats");
      const userName = document.getElementById("user-name");

      if (welcomeMessage) welcomeMessage.style.display = "none";
      if (userStats) userStats.style.display = "block";
      if (userName) userName.textContent = userId;

      // очистка предыдущих данных
      const generalStats = document.getElementById("general-stats");
      const messagesByAuthor = document.getElementById("messages-by-author");
      const frequentWords = document.getElementById("frequent-words");
      const dateActivity = document.getElementById("date-activity");
      const weekdayActivity = document.getElementById("weekday-activity");
      const timeOfDayActivity = document.getElementById("time-of-day-activity");

      if (generalStats) {
        generalStats.innerHTML = "<div class=\"loading\">Загрузка статистики...</div>";
      }
      if (messagesByAuthor) {
        messagesByAuthor.innerHTML =
          "<canvas id=\"author-chart\"></canvas><div class=\"loading\">Загрузка...</div>";
      }
      if (frequentWords) {
        frequentWords.innerHTML =
          "<canvas id=\"words-chart\"></canvas><div class=\"loading\">Загрузка...</div>";
      }
      if (dateActivity) {
        dateActivity.innerHTML =
          "<canvas id=\"date-chart\"></canvas><div class=\"loading\">Загрузка...</div>";
      }
      if (weekdayActivity) {
        weekdayActivity.innerHTML =
          "<canvas id=\"weekday-chart\"></canvas><div class=\"loading\">Загрузка...</div>";
      }
      if (timeOfDayActivity) {
        timeOfDayActivity.innerHTML =
          "<canvas id=\"time-of-day-chart\"></canvas><div class=\"loading\">Загрузка...</div>";
      }

      // загрузка статистики
      const stats = await getUserStats(userId);
      displayUserStats(stats);
    } catch (error) {
      console.error("Ошибка:", error);
      const generalStats = document.getElementById("general-stats");
      if (generalStats) {
        generalStats.innerHTML =
          "<div class=\"error\">Ошибка при загрузке статистики. Пожалуйста, попробуйте позже.</div>";
      }
    }
  }

  // функция для отображения статистики пользователя
  function displayUserStats(stats: Awaited<ReturnType<typeof getUserStats>>): void {
    renderStats(stats);
  }

  // настройка обработчиков событий
  function setupEventListeners(): void {
    // мобильное меню
    const sidebarToggle = document.getElementById("sidebar-toggle");
    const sidebar = document.getElementById("sidebar");

    if (sidebarToggle) {
      sidebarToggle.addEventListener("click", () => {
        sidebar?.classList.toggle("active");
      });
    }

    // кнопка "Назад" на мобильных устройствах
    const backButton = document.getElementById("back-to-list");
    if (backButton) {
      backButton.addEventListener("click", () => {
        const userStatsEl = document.getElementById("user-stats");
        const welcomeMessage = document.getElementById("welcome-message");
        if (userStatsEl) userStatsEl.style.display = "none";
        if (welcomeMessage) welcomeMessage.style.display = "flex";
        sidebar?.classList.add("active");
      });
    }

    // закрытие сайдбара при клике на основной контент на мобильных
    const mainContent = document.querySelector(".main-content");
    if (mainContent) {
      mainContent.addEventListener("click", () => {
        if (window.innerWidth <= 768 && sidebar?.classList.contains("active")) {
          sidebar.classList.remove("active");
        }
      });
    }

    // поиск по пользователям с debounce для оптимизации
    const searchInput = document.getElementById("user-search") as HTMLInputElement | null;
    if (searchInput) {
      const debouncedFilter = debounce((value: string) => {
        filterUserList(document.getElementById("userList"), value);
      }, 150);

      searchInput.addEventListener("input", () => debouncedFilter(searchInput.value));
    }
  }
});
