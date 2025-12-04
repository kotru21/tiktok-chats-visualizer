/**
 * Типы для UI и темы
 */

/**
 * Тема оформления
 */
export type Theme = "dark" | "light";

/**
 * Цветовая схема для графиков
 */
export interface ChartColorScheme {
  /** Цвет текста и подписей */
  fontColor: string;
  /** Цвет сетки */
  gridColor: string;
  /** Цвет фона */
  backgroundColor: string;
}

/**
 * Флаги для определения темы
 */
export interface DisplayModeFlags {
  /** Есть ли класс dark на document.body */
  hasDarkClass: boolean;
  /** Предпочитает ли система тёмную тему */
  systemPrefersDark: boolean;
}

/**
 * Опции загрузчика файлов
 */
export interface UploaderOptions {
  /** Callback после успешной загрузки */
  onUploaded?: () => void;
}

/**
 * Состояние загрузки
 */
export type UploadStatus = "idle" | "uploading" | "success" | "error";
