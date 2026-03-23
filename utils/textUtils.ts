export function removeUrls(text: string): string {
  return text
    .replace(/https?:\/\/[^\s]+/g, "")
    .replace(/www\.[^\s]+/g, "")
    .replace(/\b\w+\.(?:com|ru|org|net|io)\b/g, "");
}

export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()\"\"\"''«»\[\]]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function splitWords(text: string): string[] {
  if (!text) return [];
  return text.split(" ");
}

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

export function getBigrams(words: string[]): string[] {
  const pairs: string[] = [];
  for (let i = 0; i < words.length - 1; i++) {
    pairs.push(`${words[i]} ${words[i + 1]}`);
  }
  return pairs;
}
