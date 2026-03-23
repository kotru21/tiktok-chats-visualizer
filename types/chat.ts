export interface ChatMessage {
  timestamp: string;
  from: string;
  text: string | null;
}

export interface Chat {
  user: string;
  messages: ChatMessage[];
}

export type ChatData = Chat[];

export interface User {
  id: string;
  name: string;
  messageCount: number;
}

export interface UploadResult {
  success: boolean;
  message: string;
  count: number;
}

export type UsersResponse = User[];

export interface TikTokDataExport {
  "Direct Messages"?: {
    "Chat History"?: {
      ChatHistory?: Record<string, TikTokChatEntry[]>;
    };
  };
}

export interface TikTokChatEntry {
  Date: string;
  From: string;
  Content?: string;
}
