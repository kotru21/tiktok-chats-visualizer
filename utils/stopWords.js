/**
 * Наборы стоп-слов для русского языка.
 */

export const baseStopWords = [
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
];

export const additionalStopWords = [
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
];

export const allStopWords = [...baseStopWords, ...additionalStopWords];
