import "@fontsource-variable/geist/index.css";
import "@fontsource-variable/geist-mono/index.css";
import { setupUploader } from "./uploader.js";
import { getUsers, getUserStats } from "./api.js";
import { renderUserList, filterUserList } from "./ui/userList.js";
import { renderStats } from "./ui/statsView.js";
import { debounce } from "./utils/performance.js";
import { toggleTheme } from "./theme.js";

const ICON_MOON =
  "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z\"/></svg>";

const ICON_SUN =
  "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"12\" r=\"4\"/><path d=\"M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41\"/></svg>";

const OVERLAY_SHOW_DELAY_MS = 100;

function doubleRaf(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}

function syncThemeToggleIcons(): void {
  const dark = document.documentElement.classList.contains("dark-theme");
  const icon = dark ? ICON_SUN : ICON_MOON;
  const label = dark ? "Включить светлую тему" : "Включить тёмную тему";
  document.querySelectorAll(".theme-toggle").forEach((btn) => {
    btn.setAttribute("aria-label", label);
    btn.innerHTML = icon;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  syncThemeToggleIcons();
  window.addEventListener("theme:changed", () => syncThemeToggleIcons());

  setupUploader({ onUploaded: loadUsers });
  setupEventListeners();

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

  async function loadUserStats(userId: string): Promise<void> {
    const welcomeMessage = document.getElementById("welcome-message");
    const userStats = document.getElementById("user-stats");
    const overlay = document.getElementById("user-stats-fetch-overlay");
    const userName = document.getElementById("user-name");

    if (welcomeMessage) welcomeMessage.style.display = "none";
    if (userStats) userStats.style.display = "block";
    if (userName) userName.textContent = userId;

    const showOverlayTimer = window.setTimeout(() => {
      overlay?.classList.add("is-visible");
      overlay?.setAttribute("aria-hidden", "false");
    }, OVERLAY_SHOW_DELAY_MS);
    userStats?.setAttribute("aria-busy", "true");

    try {
      const stats = await getUserStats(userId);
      displayUserStats(stats);
      await doubleRaf();
    } catch (error) {
      console.error("Ошибка:", error);
      const generalStats = document.getElementById("general-stats");
      if (generalStats) {
        generalStats.innerHTML =
          "<div class=\"error\">Ошибка при загрузке статистики. Пожалуйста, попробуйте позже.</div>";
      }
    } finally {
      clearTimeout(showOverlayTimer);
      overlay?.classList.remove("is-visible");
      overlay?.setAttribute("aria-hidden", "true");
      userStats?.setAttribute("aria-busy", "false");
    }
  }

  function displayUserStats(stats: Awaited<ReturnType<typeof getUserStats>>): void {
    renderStats(stats);
  }

  function setupEventListeners(): void {
    const sidebarToggle = document.getElementById("sidebar-toggle");
    const sidebar = document.getElementById("sidebar");

    if (sidebarToggle) {
      sidebarToggle.addEventListener("click", () => {
        sidebar?.classList.toggle("active");
      });
    }

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

    const mainContent = document.querySelector(".main-content");
    if (mainContent) {
      mainContent.addEventListener("click", () => {
        if (window.innerWidth <= 768 && sidebar?.classList.contains("active")) {
          sidebar.classList.remove("active");
        }
      });
    }

    const searchInput = document.getElementById("user-search") as HTMLInputElement | null;
    if (searchInput) {
      const debouncedFilter = debounce((value: string) => {
        filterUserList(document.getElementById("userList"), value);
      }, 150);

      searchInput.addEventListener("input", () => debouncedFilter(searchInput.value));
    }

    document.querySelectorAll(".theme-toggle").forEach((btn) => {
      btn.addEventListener("click", () => toggleTheme());
    });
  }
});
