/**
 * Утилиты для агрегации статистики.
 */

import type { FrequencyMap, KeyCount } from "../types/stats.js";

/**
 * Интерфейс для сообщения с полем from
 */
interface MessageWithFrom {
  from: string;
}

/**
 * Подсчитывает количество сообщений по авторам.
 */
export function countByAuthor(messages: MessageWithFrom[]): FrequencyMap {
  const map: FrequencyMap = {};
  for (const m of messages) {
    const key = m.from;
    map[key] = (map[key] ?? 0) + 1;
  }
  return map;
}

/**
 * Подсчитывает частоту элементов в массиве.
 */
export function tally(items: string[]): FrequencyMap {
  const map: FrequencyMap = {};
  for (const it of items) {
    map[it] = (map[it] ?? 0) + 1;
  }
  return map;
}

/**
 * Возвращает топ-N записей из объекта частот.
 */
export function topNEntries(mapObj: FrequencyMap, n: number, minCount: number = 1): KeyCount[] {
  return Object.entries(mapObj)
    .sort((a, b) => b[1] - a[1])
    .filter(([, count]) => count >= minCount)
    .slice(0, n)
    .map(([key, count]) => ({ key, count }));
}
