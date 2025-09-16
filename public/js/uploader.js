import { uploadFile } from "./api.js";

export function setupUploader({ onUploaded } = {}) {
  const uploadForm = document.getElementById("upload-form");
  const chatFileInput = document.getElementById("chat-file");
  const uploadStatus = document.getElementById("upload-status");
  const fileText = document.querySelector(".file-text");
  const fileLabel = document.querySelector(".file-label");

  // DnD overlay
  let dragCounter = 0;
  const ensureOverlay = () => {
    let overlay = document.getElementById("dnd-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "dnd-overlay";
      overlay.className = "dnd-overlay";
      overlay.innerHTML = "<div class=\"dnd-overlay-content\">Отпустите JSON-файл для анализа</div>";
      document.body.appendChild(overlay);
    }
    return overlay;
  };

  if (!uploadForm || !chatFileInput) return;

  const setStatus = (type, message) => {
    uploadStatus.className = `upload-status status-${type}`;
    if (type === "loading") {
      uploadStatus.setAttribute("aria-busy", "true");
    } else {
      uploadStatus.setAttribute("aria-busy", "false");
    }
    uploadStatus.innerHTML =
      type === "loading" ? `<div class="spinner"></div><span>${message}</span>` : message;
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
      setStatus("success", `Файл успешно загружен! Найдено ${result.count} чатов.`);
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
    uploadForm.addEventListener(evt, (_e) => {
      preventDefaults(_e);
      highlight();
    });
    fileLabel?.addEventListener(evt, (_e) => {
      preventDefaults(_e);
      highlight();
    });
  });

  ["dragleave", "drop"].forEach((evt) => {
    uploadForm.addEventListener(evt, (_e) => {
      preventDefaults(_e);
      unhighlight();
    });
    fileLabel?.addEventListener(evt, (_e) => {
      preventDefaults(_e);
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
    } catch {
      const dtAssign = new DataTransfer();
      dtAssign.items.add(file);
      chatFileInput.files = dtAssign.files;
    }
    handleFile(file);
  });

  // Глобальные события для оверлея и дропа «куда угодно»
  window.addEventListener("dragenter", (_e) => {
    // Не мешаем, если тянем изнутри формы
    dragCounter++;
    const overlay = ensureOverlay();
    overlay.classList.add("visible");
  });
  window.addEventListener("dragover", (e) => {
    e.preventDefault();
    const overlay = ensureOverlay();
    overlay.classList.add("visible");
  });
  window.addEventListener("dragleave", (_e) => {
    dragCounter = Math.max(0, dragCounter - 1);
    if (dragCounter === 0) {
      const overlay = ensureOverlay();
      overlay.classList.remove("visible");
    }
  });
  window.addEventListener("drop", (e) => {
    e.preventDefault();
    dragCounter = 0;
    const overlay = ensureOverlay();
    overlay.classList.remove("visible");
    // Если дропнули внутрь формы, локальный обработчик справится
    if (uploadForm.contains(e.target)) return;
    const files = e.dataTransfer?.files || [];
    if (!files.length) return;
    const file = files[0];
    try {
      chatFileInput.files = files;
    } catch {
      const dtAssign = new DataTransfer();
      dtAssign.items.add(file);
      chatFileInput.files = dtAssign.files;
    }
    handleFile(file);
  });

  // Вставка из буфера обмена: поддержка JSON-текста или файла
  window.addEventListener("paste", async (e) => {
    // Не перехватываем, если фокус на инпуте/текстареа/контент-эдитабл
    const ae = document.activeElement;
    const isEditable =
      ae && (ae.tagName === "INPUT" || ae.tagName === "TEXTAREA" || ae.isContentEditable);
    if (isEditable) return;

    const items = Array.from(e.clipboardData?.items || []);
    // Пробуем как файл
    const fileItem = items.find((it) => it.kind === "file");
    if (fileItem) {
      const file = fileItem.getAsFile();
      if (file && file.name.toLowerCase().endsWith(".json")) {
        handleFile(file);
        return;
      }
    }
    // Пробуем как текст JSON
    const text = e.clipboardData?.getData("text");
    if (text) {
      try {
        JSON.parse(text);
        const blob = new Blob([text], { type: "application/json" });
        const file = new File([blob], "pasted.json", { type: "application/json" });
        try {
          const dtAssign = new DataTransfer();
          dtAssign.items.add(file);
          chatFileInput.files = dtAssign.files;
        } catch {}
        handleFile(file);
      } catch {
        // не JSON — игнорируем
      }
    }
  });
}
