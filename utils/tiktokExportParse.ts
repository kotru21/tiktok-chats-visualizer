import { z } from "zod";
import type { ChatData, ChatMessage } from "../types/chat.js";

const tikTokChatEntrySchema = z.object({
  Date: z.string(),
  From: z.string(),
  Content: z.union([z.string(), z.null()]).optional(),
});

const chatHistorySchema = z.record(z.string(), z.array(tikTokChatEntrySchema));

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Known TikTok export paths (structure may vary by export version). */
function extractRawChatHistory(root: Record<string, unknown>): unknown {
  const directMessage = root["Direct Message"];
  if (isRecord(directMessage)) {
    const inner = directMessage["Direct Messages"];
    if (isRecord(inner) && "ChatHistory" in inner) {
      return inner["ChatHistory"];
    }
  }

  const directMessages = root["Direct Messages"];
  if (isRecord(directMessages)) {
    const chatHistoryBlock = directMessages["Chat History"];
    if (isRecord(chatHistoryBlock) && "ChatHistory" in chatHistoryBlock) {
      return chatHistoryBlock["ChatHistory"];
    }
    if ("ChatHistory" in directMessages) {
      return directMessages["ChatHistory"];
    }
  }

  return undefined;
}

function mapEntryToMessage(entry: z.infer<typeof tikTokChatEntrySchema>): ChatMessage {
  const content = entry.Content;
  return {
    timestamp: entry.Date,
    from: entry.From,
    text: content ?? null,
  };
}

/**
 * Parse TikTok JSON export into normalized chat data. Validates structure with Zod.
 */
export function parseTiktokExportJsonString(fileContent: string): ChatData {
  let parsed: unknown;
  try {
    parsed = JSON.parse(fileContent) as unknown;
  } catch {
    throw new Error("Файл не является корректным JSON");
  }

  if (!isRecord(parsed)) {
    throw new Error("Формат файла не соответствует экспорту TikTok");
  }

  const rawHistory = extractRawChatHistory(parsed);
  if (rawHistory === undefined) {
    throw new Error("Формат файла не соответствует экспорту TikTok");
  }

  const validated = chatHistorySchema.safeParse(rawHistory);
  if (!validated.success) {
    throw new Error("Структура ChatHistory в файле не соответствует ожидаемому формату");
  }

  const chatHistory = validated.data;
  const chatArray: ChatData = [];

  for (const [chatName, messages] of Object.entries(chatHistory)) {
    const usernameMatch = /Chat History with ([^:]+):/.exec(chatName);
    const username = usernameMatch?.[1] ?? chatName;

    const formattedMessages: ChatMessage[] = messages.map(mapEntryToMessage);

    chatArray.push({
      user: username,
      messages: formattedMessages,
    });
  }

  return chatArray;
}
