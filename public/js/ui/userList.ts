import type { User } from "../../../types/chat.js";

type UserSelectCallback = (userId: string) => void;

export function renderUserList(
  container: HTMLElement | null,
  users: User[],
  onSelect: UserSelectCallback
): void {
  if (!container) return;
  if (users.length === 0) {
    container.innerHTML = "<div class=\"no-data\">Пользователи не найдены</div>";
    return;
  }
  container.setAttribute("role", "listbox");
  container.setAttribute("aria-label", "Список пользователей");
  container.innerHTML = users
    .map(
      (user) => `
        <div class="user-item" data-user-id="${user.id}" role="option" tabindex="0">
          <div class="user-name">${user.name}</div>
          <div class="user-message-count">${user.messageCount} сообщений</div>
        </div>`
    )
    .join("");

  container.querySelectorAll(".user-item").forEach((item) => {
    item.addEventListener("click", function (this: HTMLElement) {
      container.querySelectorAll(".user-item").forEach((el) => {
        el.classList.remove("active");
        el.setAttribute("aria-selected", "false");
      });
      this.classList.add("active");
      this.setAttribute("aria-selected", "true");
      const userId = this.getAttribute("data-user-id");
      if (userId) onSelect(userId);
    });
  });

  // Клавиатурная навигация: стрелки и Enter
  container.addEventListener("keydown", (e: KeyboardEvent) => {
    const items = Array.from(container.querySelectorAll<HTMLElement>(".user-item")).filter(
      (el) => el.style.display !== "none"
    );
    if (!items.length) return;

    const currentIndex = items.findIndex((el) => el === document.activeElement);
    const focusItem = (idx: number): void => {
      const safeIdx = Math.max(0, Math.min(items.length - 1, idx));
      const el = items[safeIdx];
      el?.focus();
    };

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        focusItem(currentIndex >= 0 ? currentIndex + 1 : 0);
        break;
      case "ArrowUp":
        e.preventDefault();
        focusItem(currentIndex >= 0 ? currentIndex - 1 : items.length - 1);
        break;
      case "Home":
        e.preventDefault();
        focusItem(0);
        break;
      case "End":
        e.preventDefault();
        focusItem(items.length - 1);
        break;
      case "Enter":
      case " ": {
        if (currentIndex >= 0) {
          e.preventDefault();
          const el = items[currentIndex];
          if (el) {
            container.querySelectorAll(".user-item").forEach((n) => {
              n.classList.remove("active");
              n.setAttribute("aria-selected", "false");
            });
            el.classList.add("active");
            el.setAttribute("aria-selected", "true");
            const userId = el.getAttribute("data-user-id");
            if (userId) onSelect(userId);
          }
        }
        break;
      }
      default:
        break;
    }
  });
}

export function filterUserList(container: HTMLElement | null, term: string): void {
  if (!container) return;
  const q = (term || "").toLowerCase();
  container.querySelectorAll<HTMLElement>(".user-item").forEach((item) => {
    const name = (item.querySelector(".user-name")?.textContent ?? "").toLowerCase();
    item.style.display = name.includes(q) ? "block" : "none";
  });
}
