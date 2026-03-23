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

export interface TikTokChatEntry {
  Date: string;
  From: string;
  Content?: string | null;
}

/**
 * TikTok data export JSON may use either nesting (observed in app parser) or alternate keys.
 * Parser accepts both — see `utils/tiktokExportParse.ts`.
 */
export interface TikTokExportDirectMessage {
  "Direct Message"?: {
    "Direct Messages"?: {
      ChatHistory?: Record<string, TikTokChatEntry[]>;
    };
  };
}

export interface TikTokExportDirectMessagesBlock {
  "Direct Messages"?: {
    "Chat History"?: {
      ChatHistory?: Record<string, TikTokChatEntry[]>;
    };
    ChatHistory?: Record<string, TikTokChatEntry[]>;
  };
}

export type TikTokDataExport = TikTokExportDirectMessage & TikTokExportDirectMessagesBlock;
