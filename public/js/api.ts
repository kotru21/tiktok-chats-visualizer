import type { User, UploadResult } from "../../types/chat.js";
import type { UserStats } from "../../types/stats.js";

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

let worker: Worker | null = null;
let messageId = 0;
const pendingRequests = new Map<
  number,
  { resolve: (value: unknown) => void; reject: (error: Error) => void }
>();

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL("./workers/dataProcessor.worker.ts", import.meta.url), {
      type: "module",
    });

    worker.onmessage = (e: MessageEvent<WorkerResponse>): void => {
      const { type, payload, id } = e.data;
      const pending = pendingRequests.get(id);

      if (pending) {
        pendingRequests.delete(id);
        if (type === "success") {
          pending.resolve(payload);
        } else {
          pending.reject(new Error(payload as string));
        }
      }
    };

    worker.onerror = (error): void => {
      console.error("Worker error:", error);
    };
  }

  return worker;
}

function sendToWorker<T>(type: WorkerMessage["type"], payload?: unknown): Promise<T> {
  return new Promise((resolve, reject) => {
    const id = ++messageId;
    pendingRequests.set(id, {
      resolve: resolve as (value: unknown) => void,
      reject,
    });

    const message: WorkerMessage = { type, payload, id };
    getWorker().postMessage(message);
  });
}

let cachedUsers: User[] | null = null;
const statsCache = new Map<string, UserStats>();

export async function uploadFile(file: File): Promise<UploadResult> {
  clearApiCache();
  const fileContent = await file.text();
  const result = await sendToWorker<UploadResult>("parse", fileContent);
  return result;
}

export async function getUsers(): Promise<User[]> {
  if (cachedUsers) {
    return cachedUsers;
  }

  const users = await sendToWorker<User[]>("getUsers");
  cachedUsers = users;
  return users;
}

export async function getUserStats(userId: string): Promise<UserStats> {
  const cached = statsCache.get(userId);
  if (cached) {
    return cached;
  }

  const stats = await sendToWorker<UserStats>("getUserStats", userId);
  statsCache.set(userId, stats);
  return stats;
}

export function clearApiCache(): void {
  cachedUsers = null;
  statsCache.clear();
}
