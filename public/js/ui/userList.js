export function renderUserList(container, users, onSelect) {
  if (!container) return;
  if (!users || users.length === 0) {
    container.innerHTML = '<div class="no-data">Пользователи не найдены</div>';
    return;
  }
  container.innerHTML = users
    .map(
      (user) => `
        <div class="user-item" data-user-id="${user.id}">
          <div class="user-name">${user.name}</div>
          <div class="user-message-count">${user.messageCount} сообщений</div>
        </div>`
    )
    .join("");

  container.querySelectorAll(".user-item").forEach((item) => {
    item.addEventListener("click", function () {
      container
        .querySelectorAll(".user-item")
        .forEach((el) => el.classList.remove("active"));
      this.classList.add("active");
      const userId = this.getAttribute("data-user-id");
      onSelect && onSelect(userId);
    });
  });
}

export function filterUserList(container, term) {
  if (!container) return;
  const q = (term || "").toLowerCase();
  container.querySelectorAll(".user-item").forEach((item) => {
    const name =
      item.querySelector(".user-name")?.textContent.toLowerCase() || "";
    item.style.display = name.includes(q) ? "block" : "none";
  });
}
