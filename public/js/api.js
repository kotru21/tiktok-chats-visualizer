export async function uploadFile(file) {
  const formData = new FormData();
  formData.append("chatFile", file);
  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || "Ошибка при загрузке файла");
  return result; // { count }
}

export async function getUsers() {
  const response = await fetch("/api/users");
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || "Ошибка при загрузке пользователей");
  return result; // users[]
}

export async function getUserStats(userId) {
  const response = await fetch(`/api/users/${encodeURIComponent(userId)}/stats`);
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || "Ошибка при загрузке статистики");
  return result; // stats
}
