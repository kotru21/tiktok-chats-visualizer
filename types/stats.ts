/**
 * Типы для статистики чатов
 */

import type { WeekdayName, TimeOfDayBucket } from "./date.js";

/**
 * Частота слова
 */
export interface WordFrequency {
  word: string;
  count: number;
}

/**
 * Частота пары слов (биграммы)
 */
export interface WordPairFrequency {
  pair: string;
  count: number;
}

/**
 * Статистика по дате
 */
export interface DateStat {
  date: string;
  count: number;
}

/**
 * Период общения в чате
 */
export interface ChatPeriod {
  /** Дата первого сообщения */
  firstDate: string;
  /** Дата последнего сообщения */
  lastDate: string;
  /** Общее количество дней общения */
  totalDays: number;
}

/**
 * Полная статистика по пользователю
 */
export interface UserStats {
  /** ID пользователя */
  userId: string;
  /** Общее количество сообщений */
  totalMessages: number;
  /** Количество сообщений по авторам */
  messagesByAuthor: Record<string, number>;
  /** Часто используемые слова */
  frequentWords: WordFrequency[];
  /** Часто используемые пары слов */
  frequentWordPairs: WordPairFrequency[];
  /** Статистика по датам */
  dateStats: DateStat[];
  /** Количество сообщений по дням недели */
  messagesByWeekday: Record<WeekdayName, number>;
  /** Количество сообщений по времени суток */
  messagesByTimeOfDay: Record<TimeOfDayBucket, number>;
  /** Среднее количество сообщений в день */
  avgMessagesPerDay: number;
  /** Период общения */
  chatPeriod: ChatPeriod;
}

/**
 * Элемент для агрегации (ключ-количество)
 */
export interface KeyCount {
  key: string;
  count: number;
}

/**
 * Результат подсчёта с сортировкой
 */
export type CountResult = KeyCount[];

/**
 * Словарь для подсчёта частот
 */
export type FrequencyMap = Record<string, number>;
