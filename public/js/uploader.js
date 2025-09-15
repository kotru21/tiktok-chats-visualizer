import { uploadFile } from "./api.js";

export function setupUploader({ onUploaded } = {}) {
  const uploadForm = document.getElementById("upload-form");
  const chatFileInput = document.getElementById("chat-file");
  const uploadStatus = document.getElementById("upload-status");
  const fileText = document.querySelector(".file-text");
  const fileLabel = document.querySelector(".file-label");

  if (!uploadForm || !chatFileInput) return;

  const setStatus = (type, message) => {
    uploadStatus.className = `upload-status status-${type}`;
    uploadStatus.innerHTML =
      type === "loading"
        ? `<div class="spinner"></div><span>${message}</span>`
        : message;
  };

  const handleFile = async (file) => {
    if (!file) {
      setStatus("error", "Пожалуйста, выберите файл");
      return;
    }
    if (!file.name.toLowerCase().endsWith(".json")) {
      setStatus("error", "Пожалуйста, выберите JSON файл");
      return;
    }
    fileText.textContent = file.name;
    setStatus("loading", "Загрузка файла...");
    try {
      const result = await uploadFile(file);
      setStatus(
        "success",
        `Файл успешно загружен! Найдено ${result.count} чатов.`
      );
      document.getElementById("upload-container")?.classList.add("hidden");
      onUploaded && onUploaded();
    } catch (err) {
      console.error(err);
      setStatus("error", err.message || "Ошибка при загрузке файла");
    }
  };

  // Автозапуск при ручном выборе
  chatFileInput.addEventListener("change", () => {
    const file = chatFileInput.files[0];
    handleFile(file);
  });

  // Сабмит формы (на всякий случай)
  uploadForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const file = chatFileInput.files[0];
    handleFile(file);
  });

  // Drag & Drop
  const preventDefaults = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const highlight = () => fileLabel?.classList.add("dragover");
  const unhighlight = () => fileLabel?.classList.remove("dragover");

  ["dragenter", "dragover"].forEach((evt) => {
    uploadForm.addEventListener(evt, (e) => {
      preventDefaults(e);
      highlight();
    });
    fileLabel?.addEventListener(evt, (e) => {
      preventDefaults(e);
      highlight();
    });
  });

  ["dragleave", "drop"].forEach((evt) => {
    uploadForm.addEventListener(evt, (e) => {
      preventDefaults(e);
      unhighlight();
    });
    fileLabel?.addEventListener(evt, (e) => {
      preventDefaults(e);
      unhighlight();
    });
  });

  ["dragover", "drop"].forEach((evt) => {
    window.addEventListener(evt, (e) => {
      if (!uploadForm.contains(e.target)) return;
      e.preventDefault();
    });
  });

  uploadForm.addEventListener("drop", (e) => {
    const files = e.dataTransfer?.files || [];
    if (!files.length) return;
    const file = files[0];
    try {
      chatFileInput.files = files;
    } catch (_) {
      const dtAssign = new DataTransfer();
      dtAssign.items.add(file);
      chatFileInput.files = dtAssign.files;
    }
    handleFile(file);
  });
}
