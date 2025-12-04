import { uploadFile } from "./api.js";
import type { UploaderOptions } from "../../types/ui.js";

export function setupUploader({ onUploaded }: UploaderOptions = {}): void {
  const uploadForm = document.getElementById("upload-form") as HTMLFormElement | null;
  const chatFileInput = document.getElementById("chat-file") as HTMLInputElement | null;
  const uploadStatus = document.getElementById("upload-status");
  const fileText = document.querySelector(".file-text");
  const fileLabel = document.querySelector(".file-label");

  // DnD overlay
  let dragCounter = 0;
  const ensureOverlay = (): HTMLElement => {
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

  const setStatus = (type: "loading" | "success" | "error", message: string): void => {
    if (!uploadStatus) return;
    uploadStatus.className = `upload-status status-${type}`;
    if (type === "loading") {
      uploadStatus.setAttribute("aria-busy", "true");
    } else {
      uploadStatus.setAttribute("aria-busy", "false");
    }
    uploadStatus.innerHTML =
      type === "loading" ? `<div class="spinner"></div><span>${message}</span>` : message;
  };

  const handleFile = async (file: File | undefined): Promise<void> => {
    if (!file) {
      setStatus("error", "Пожалуйста, выберите файл");
      return;
    }
    if (!file.name.toLowerCase().endsWith(".json")) {
      setStatus("error", "Пожалуйста, выберите JSON файл");
      return;
    }
    if (fileText) fileText.textContent = file.name;
    setStatus("loading", "Загрузка файла...");
    try {
      const result = await uploadFile(file);
      setStatus("success", `Файл успешно загружен! Найдено ${result.count} чатов.`);
      document.getElementById("upload-container")?.classList.add("hidden");
      onUploaded?.();
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "Ошибка при загрузке файла";
      setStatus("error", errorMessage);
    }
  };

  // Автозапуск при ручном выборе
  chatFileInput.addEventListener("change", () => {
    const file = chatFileInput.files?.[0];
    void handleFile(file);
  });

  // Сабмит формы (на всякий случай)
  uploadForm.addEventListener("submit", (e: Event) => {
    e.preventDefault();
    const file = chatFileInput.files?.[0];
    void handleFile(file);
  });

  // Drag & Drop
  const preventDefaults = (e: Event): void => {
    e.preventDefault();
    e.stopPropagation();
  };
  const highlight = (): void => fileLabel?.classList.add("dragover");
  const unhighlight = (): void => fileLabel?.classList.remove("dragover");

  (["dragenter", "dragover"] as const).forEach((evt) => {
    uploadForm.addEventListener(evt, (_e) => {
      preventDefaults(_e);
      highlight();
    });
    fileLabel?.addEventListener(evt, (_e) => {
      preventDefaults(_e);
      highlight();
    });
  });

  (["dragleave", "drop"] as const).forEach((evt) => {
    uploadForm.addEventListener(evt, (_e) => {
      preventDefaults(_e);
      unhighlight();
    });
    fileLabel?.addEventListener(evt, (_e) => {
      preventDefaults(_e);
      unhighlight();
    });
  });

  (["dragover", "drop"] as const).forEach((evt) => {
    window.addEventListener(evt, (e) => {
      const target = e.target as Node;
      if (!uploadForm.contains(target)) return;
      e.preventDefault();
    });
  });

  uploadForm.addEventListener("drop", (e: DragEvent) => {
    const files = e.dataTransfer?.files;
    if (!files?.length) return;
    const file = files[0];
    if (!file) return;
    try {
      chatFileInput.files = files;
    } catch {
      const dtAssign = new DataTransfer();
      dtAssign.items.add(file);
      chatFileInput.files = dtAssign.files;
    }
    void handleFile(file);
  });

  // Глобальные события для оверлея и дропа «куда угодно»
  window.addEventListener("dragenter", (_e) => {
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
  window.addEventListener("drop", (e: DragEvent) => {
    e.preventDefault();
    dragCounter = 0;
    const overlay = ensureOverlay();
    overlay.classList.remove("visible");
    // Если дропнули внутрь формы, локальный обработчик справится
    const target = e.target as Node;
    if (uploadForm.contains(target)) return;
    const files = e.dataTransfer?.files;
    if (!files?.length) return;
    const file = files[0];
    if (!file) return;
    try {
      chatFileInput.files = files;
    } catch {
      const dtAssign = new DataTransfer();
      dtAssign.items.add(file);
      chatFileInput.files = dtAssign.files;
    }
    void handleFile(file);
  });

  // Вставка из буфера обмена: поддержка JSON-текста или файла
  window.addEventListener("paste", (e: ClipboardEvent) => {
    // Не перехватываем, если фокус на инпуте/текстареа/контент-эдитабл
    const ae = document.activeElement as HTMLElement | null;
    const isEditable =
      ae && (ae.tagName === "INPUT" || ae.tagName === "TEXTAREA" || ae.isContentEditable);
    if (isEditable) return;

    const items = Array.from(e.clipboardData?.items ?? []);
    // Пробуем как файл
    const fileItem = items.find((it) => it.kind === "file");
    if (fileItem) {
      const file = fileItem.getAsFile();
      if (file?.name.toLowerCase().endsWith(".json")) {
        void handleFile(file);
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
        } catch {
          // Игнорирование ошибок при назначении файлов
        }
        void handleFile(file);
      } catch {
        // не JSON — игнорирование
      }
    }
  });
}
