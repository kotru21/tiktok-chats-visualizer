/**
 * Наборы стоп-слов для русского языка.
 */

export const baseStopWords: readonly string[] = [
  "это",
  "как",
  "так",
  "что",
  "для",
  "при",
  "его",
  "все",
  "она",
  "они",
  "оно",
] as const;

export const additionalStopWords: readonly string[] = [
  "есть",
  "быть",
  "просто",
  "тоже",
  "только",
  "меня",
  "тебя",
  "себя",
  "свой",
  "наш",
  "ваш",
  "этот",
  "тот",
  "такой",
  "который",
  "когда",
  "если",
] as const;

export const allStopWords: readonly string[] = [...baseStopWords, ...additionalStopWords];

/**
 * Предварительно созданный Set стоп-слов для O(1) поиска
 * Создаётся один раз при импорте модуля
 */
export const stopWordsSet: ReadonlySet<string> = new Set(allStopWords);
