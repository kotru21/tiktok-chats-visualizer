/**
 * Утилиты для агрегации статистики.
 */

export function countByAuthor(messages) {
  const map = {};
  for (const m of messages) {
    const key = m.from;
    map[key] = (map[key] || 0) + 1;
  }
  return map;
}

export function tally(items) {
  const map = {};
  for (const it of items) {
    map[it] = (map[it] || 0) + 1;
  }
  return map;
}

export function topNEntries(mapObj, n, minCount = 1) {
  return Object.entries(mapObj)
    .sort((a, b) => b[1] - a[1])
    .filter(([, count]) => count >= minCount)
    .slice(0, n)
    .map(([key, count]) => ({ key, count }));
}
