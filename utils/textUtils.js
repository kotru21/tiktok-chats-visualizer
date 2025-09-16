/**
 * Текстовые утилиты: очистка и токенизация.
 */

/**
 * Удаляет URL-адреса из текста.
 * @param {string} text
 * @returns {string}
 */
export function removeUrls(text) {
  return text
    .replace(/https?:\/\/[^\s]+/g, "")
    .replace(/www\.[^\s]+/g, "")
    .replace(/\b\w+\.(?:com|ru|org|net|io)\b/g, "");
}

/**
 * Нормализует текст: нижний регистр, удаление пунктуации и лишних пробелов.
 * @param {string} text
 * @returns {string}
 */
export function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()\"\"\"''«»\[\]]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Делит текст на слова.
 * @param {string} text
 * @returns {string[]}
 */
export function splitWords(text) {
  if (!text) return [];
  return text.split(" ");
}

/**
 * Фильтрует слова: минимальная длина, исключение стоп-слов, точек и чисел.
 * @param {string[]} words
 * @param {Set<string>} stopWordsSet
 * @param {number} minLen
 * @returns {string[]}
 */
export function filterWords(words, stopWordsSet, minLen = 4) {
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
 * @param {string[]} words
 * @returns {string[]}
 */
export function getBigrams(words) {
  const pairs = [];
  for (let i = 0; i < words.length - 1; i++) {
    pairs.push(`${words[i]} ${words[i + 1]}`);
  }
  return pairs;
}
