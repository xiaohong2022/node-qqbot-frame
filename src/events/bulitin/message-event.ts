import type {
  MiddlewareContext,
  QQBotInboundMessage,
} from "@tencent-connect/qqbot-nodejs";
import type { App } from "../../app.js";
import { MessageDeleteBuilder } from "../../message/delete-builder.js";
import { sendMessage } from "../../message/sender.js";
import type { MessageSendingResult } from "../../message/sending-result.js";
import type { MessageContent } from "../../message/types.js";
import type { User } from "../../models/user.js";
import { Event } from "./../event.js";

/** 普通消息事件（C2C）。 */
export class MessageEvent extends Event<MiddlewareContext> {
  constructor(
    app: App,
    ctx: MiddlewareContext,
    readonly msg: QQBotInboundMessage,
    readonly sender: User,
  ) {
    super(app, ctx);
  }

  get kind(): "c2c" | "group" {
    return this.msg.kind === "group" ? "group" : "c2c";
  }

  /** 消息内容。 */
  get content(): string {
    return this.msg.content;
  }

  /** 消息 ID。 */
  get msgId(): string {
    return this.msg.messageId;
  }

  /** 发送时间。 */
  get timestamp(): string {
    return this.msg.timestamp;
  }

  /** 被引用消息的引用索引。 */
  get refMsgIdx(): string | undefined {
    return this.msg.refMsgIdx;
  }

  /** 本条消息的引用索引。 */
  get msgIdx(): string | undefined {
    return this.msg.msgIdx;
  }

  /** 被动消息（关联当前入站消息）。 */
  echo(content: MessageContent): Promise<MessageSendingResult> {
    return sendMessage(
      this.app,
      this.kind,
      this.msg.replyTarget.targetId,
      content,
      { msgId: this.msgId },
    );
  }

  /** 带引用回复的被动消息。 */
  reply(content: MessageContent): Promise<MessageSendingResult> {
    return sendMessage(
      this.app,
      this.kind,
      this.msg.replyTarget.targetId,
      content,
      {
        msgId: this.msgId,
        referenceId: this.refMsgIdx,
      },
    );
  }

  /** 撤回当前消息，返回是否成功。 */
  delete(): Promise<boolean> {
    return MessageDeleteBuilder.build(
      this.app,
      this.kind,
      this.msg.replyTarget.targetId,
      this.msgId,
    )();
  }
}
