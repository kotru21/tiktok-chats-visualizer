/**
 * Типы для сообщений чата TikTok
 */

/**
 * Одно сообщение в чате
 */
export interface ChatMessage {
  /** Временная метка сообщения (ISO 8601 или строка от TikTok) */
  timestamp: string;
  /** Отправитель сообщения */
  from: string;
  /** Текст сообщения (может быть null для медиа-сообщений) */
  text: string | null;
}

/**
 * Чат с одним пользователем
 */
export interface Chat {
  /** Имя пользователя (собеседника) */
  user: string;
  /** Массив сообщений в чате */
  messages: ChatMessage[];
}

/**
 * Полные данные чата (массив чатов)
 */
export type ChatData = Chat[];

/**
 * Пользователь в списке
 */
export interface User {
  /** Уникальный идентификатор (обычно имя пользователя) */
  id: string;
  /** Отображаемое имя */
  name: string;
  /** Количество сообщений в чате */
  messageCount: number;
}

/**
 * Результат загрузки файла
 */
export interface UploadResult {
  /** Успешность операции */
  success: boolean;
  /** Сообщение для пользователя */
  message: string;
  /** Количество загруженных чатов */
  count: number;
}

/**
 * Ответ API на запрос списка пользователей
 */
export type UsersResponse = User[];

/**
 * Структура JSON-файла TikTok (входные данные)
 */
export interface TikTokDataExport {
  "Direct Messages"?: {
    "Chat History"?: {
      ChatHistory?: Record<string, TikTokChatEntry[]>;
    };
  };
}

/**
 * Запись чата в формате TikTok
 */
export interface TikTokChatEntry {
  Date: string;
  From: string;
  Content?: string;
}
