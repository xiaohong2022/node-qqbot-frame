import type { ChatScope } from "@tencent-connect/qqbot-nodejs";
import type { BotHost } from "../bot-host.js";
import { MessageSendingResult } from "./sending-result.js";
import { toTextMessage, type Message, type MessageContent } from "./types.js";

export interface SendOptions {
  /** 被动回复的消息 ID。 */
  msgId?: string;
  /** 互动事件 ID（互动召回消息使用）。 */
  eventId?: string;
  /** 引用消息的引用索引。 */
  referenceId?: string;
}

function buildBody(message: Message): Record<string, unknown> {
  switch (message.type) {
    case "text":
      return {
        msg_type: 0,
        content: message.text,
      };

    case "markdown": {
      let markdown: string = "";
      if (Array.isArray(message.markdown)) markdown = message.markdown.join('\n');
      else markdown = message.markdown;

      const body: Record<string, unknown> = {
        msg_type: 2,
        markdown: {
          content: markdown,
        },
      };
      if (message.keyboard) {
        body.keyboard = {
          content: {
            rows: message.keyboard.map((row) => ({ buttons: row })),
          },
        };
      }
      return body;
    }

    case "media":
      return {
        msg_type: 7,
        media: {
          file_info: message.file_info,
        },
      };

    case "card":
      return {
        msg_type: 8,
        card: message.card,
      };
  }
}

/**
 * 发送消息（文本 / Markdown / 富媒体 / 卡片）。
 *
 * 底层统一使用 SDK 的 raw 发送能力，以完整支持 QQ 平台字段。
 */
export async function sendMessage(
  host: BotHost,
  scope: ChatScope,
  targetId: string,
  content: MessageContent,
  options: SendOptions = {},
): Promise<MessageSendingResult> {
  const message = typeof content === "string" ? toTextMessage(content) : content;
  const body = buildBody(message);

  if (options.msgId) {
    body.msg_id = options.msgId;
  }
  if (options.eventId) {
    body.event_id = options.eventId;
  }
  if (options.referenceId) {
    body.message_reference = {
      message_id: options.referenceId,
    };
  }

  const response = await host.bot.messageApi.sendRaw(
    scope,
    targetId,
    host.bot.getCredentials(),
    body,
  );

  return new MessageSendingResult(host, scope, targetId, response);
}
