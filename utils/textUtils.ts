/**
 * Текстовые утилиты: очистка и токенизация.
 */

/**
 * Удаляет URL-адреса из текста.
 */
export function removeUrls(text: string): string {
  return text
    .replace(/https?:\/\/[^\s]+/g, "")
    .replace(/www\.[^\s]+/g, "")
    .replace(/\b\w+\.(?:com|ru|org|net|io)\b/g, "");
}

/**
 * Нормализует текст: нижний регистр, удаление пунктуации и лишних пробелов.
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()\"\"\"''«»\[\]]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Делит текст на слова.
 */
export function splitWords(text: string): string[] {
  if (!text) return [];
  return text.split(" ");
}

/**
 * Фильтрует слова: минимальная длина, исключение стоп-слов, точек и чисел.
 */
export function filterWords(
  words: string[],
  stopWordsSet: ReadonlySet<string> | Set<string>,
  minLen: number = 4
): string[] {
  return words.filter(
    (word) =>
      word &&
      word.length >= minLen &&
      !stopWordsSet.has(word) &&
      !word.includes(".") &&
      !/^\d+$/.test(word)
  );
}

/**
 * Возвращает массив биграм (пар слов) из массива слов.
 */
export function getBigrams(words: string[]): string[] {
  const pairs: string[] = [];
  for (let i = 0; i < words.length - 1; i++) {
    pairs.push(`${words[i]} ${words[i + 1]}`);
  }
  return pairs;
}
