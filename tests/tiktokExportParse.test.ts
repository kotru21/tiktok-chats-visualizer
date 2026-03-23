import { describe, it, expect } from "bun:test";
import { parseTiktokExportJsonString } from "../utils/tiktokExportParse.js";

const entry = (date: string, from: string, content?: string | null) => ({
  Date: date,
  From: from,
  ...(content !== undefined ? { Content: content } : {}),
});

function buildExportDirectMessage(chatHistory: Record<string, ReturnType<typeof entry>[]>) {
  return {
    "Direct Message": {
      "Direct Messages": {
        ChatHistory: chatHistory,
      },
    },
  };
}

function buildExportDirectMessagesAlt(chatHistory: Record<string, ReturnType<typeof entry>[]>) {
  return {
    "Direct Messages": {
      "Chat History": {
        ChatHistory: chatHistory,
      },
    },
  };
}

function buildExportDirectMessagesFlat(chatHistory: Record<string, ReturnType<typeof entry>[]>) {
  return {
    "Direct Messages": {
      ChatHistory: chatHistory,
    },
  };
}

describe("parseTiktokExportJsonString", () => {
  it("парсит ветку Direct Message → Direct Messages → ChatHistory", () => {
    const json = JSON.stringify(
      buildExportDirectMessage({
        "Chat History with Alice:": [entry("2020-01-01T12:00:00.000Z", "me", "hi")],
      })
    );
    const data = parseTiktokExportJsonString(json);
    expect(data).toHaveLength(1);
    expect(data[0]?.user).toBe("Alice");
    expect(data[0]?.messages).toHaveLength(1);
    expect(data[0]?.messages[0]).toEqual({
      timestamp: "2020-01-01T12:00:00.000Z",
      from: "me",
      text: "hi",
    });
  });

  it("парсит ветку Direct Messages → Chat History → ChatHistory", () => {
    const json = JSON.stringify(
      buildExportDirectMessagesAlt({
        "Chat History with Bob:": [entry("2020-02-02T12:00:00.000Z", "Bob", null)],
      })
    );
    const data = parseTiktokExportJsonString(json);
    expect(data).toHaveLength(1);
    expect(data[0]?.user).toBe("Bob");
    expect(data[0]?.messages[0]?.text).toBeNull();
  });

  it("парсит ChatHistory напрямую под Direct Messages", () => {
    const json = JSON.stringify(
      buildExportDirectMessagesFlat({
        OtherKey: [entry("2020-03-03T12:00:00.000Z", "x", undefined)],
      })
    );
    const data = parseTiktokExportJsonString(json);
    expect(data).toHaveLength(1);
    expect(data[0]?.user).toBe("OtherKey");
    expect(data[0]?.messages[0]?.text).toBeNull();
  });

  it("бросает на невалидном JSON", () => {
    expect(() => parseTiktokExportJsonString("{")).toThrow("корректным JSON");
  });

  it("бросает если нет известной структуры чатов", () => {
    expect(() => parseTiktokExportJsonString("{}")).toThrow("не соответствует");
  });
});
