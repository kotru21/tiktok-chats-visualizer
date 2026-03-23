import { parseTiktokExportJsonString } from "../../../utils/tiktokExportParse.js";
import { extractUsers, generateUserStats } from "../../../utils/dataProcessor.js";
import type { ChatData, User } from "../../../types/chat.js";
import type { UserStats } from "../../../types/stats.js";

interface WorkerMessage {
  type: "parse" | "getUsers" | "getUserStats";
  payload?: unknown;
  id: number;
}

interface WorkerResponse {
  type: "success" | "error";
  payload: unknown;
  id: number;
}

let chatData: ChatData | null = null;

function parseFile(fileContent: string): { success: boolean; count: number; message: string } {
  chatData = parseTiktokExportJsonString(fileContent);
  return {
    success: true,
    count: chatData.length,
    message: "Файл успешно загружен",
  };
}

function getUsersFromStore(): User[] {
  if (!chatData) {
    throw new Error("Данные не загружены. Загрузите файл чатов.");
  }
  return extractUsers(chatData);
}

function getStatsFromStore(userId: string): UserStats | null {
  if (!chatData) {
    throw new Error("Данные не загружены. Загрузите файл чатов.");
  }
  return generateUserStats(chatData, userId);
}

self.onmessage = (e: MessageEvent<WorkerMessage>): void => {
  const { type, payload, id } = e.data;

  try {
    let result: unknown;

    switch (type) {
      case "parse":
        if (typeof payload !== "string") {
          throw new Error("Ожидалось текстовое содержимое файла");
        }
        result = parseFile(payload);
        break;
      case "getUsers":
        result = getUsersFromStore();
        break;
      case "getUserStats":
        if (typeof payload !== "string") {
          throw new Error("Ожидался идентификатор пользователя");
        }
        result = getStatsFromStore(payload);
        break;
      default: {
        const exhaustiveCheck: never = type;
        throw new Error(`Неизвестный тип сообщения: ${String(exhaustiveCheck)}`);
      }
    }

    const response: WorkerResponse = { type: "success", payload: result, id };
    self.postMessage(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Неизвестная ошибка";
    const response: WorkerResponse = { type: "error", payload: errorMessage, id };
    self.postMessage(response);
  }
};
