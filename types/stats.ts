import type { WeekdayName, TimeOfDayBucket } from "./date.js";

export interface WordFrequency {
  word: string;
  count: number;
}

export interface WordPairFrequency {
  pair: string;
  count: number;
}

export interface DateStat {
  date: string;
  count: number;
}

export interface ChatPeriod {
  firstDate: string;
  lastDate: string;
  totalDays: number;
}

export interface UserStats {
  userId: string;
  totalMessages: number;
  messagesByAuthor: Record<string, number>;
  frequentWords: WordFrequency[];
  frequentWordPairs: WordPairFrequency[];
  dateStats: DateStat[];
  messagesByWeekday: Record<WeekdayName, number>;
  messagesByTimeOfDay: Record<TimeOfDayBucket, number>;
  avgMessagesPerDay: number;
  chatPeriod: ChatPeriod;
}

export interface KeyCount {
  key: string;
  count: number;
}

export type CountResult = KeyCount[];

export type FrequencyMap = Record<string, number>;
