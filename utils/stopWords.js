/**
 * Наборы стоп-слов для русского языка.
 */

const baseStopWords = [
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

const additionalStopWords = [
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

const allStopWords = [...baseStopWords, ...additionalStopWords];

module.exports = {
  baseStopWords,
  additionalStopWords,
  allStopWords,
};
