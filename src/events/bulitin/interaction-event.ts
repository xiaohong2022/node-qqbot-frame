import type {
  InteractionContext,
  InteractionEvent as QQBotInteractionEvent,
} from "@tencent-connect/qqbot-nodejs";
import type { App } from "../../app.js";
import { sendMessage } from "../../message/sender.js";
import type { MessageSendingResult } from "../../message/sending-result.js";
import type { MessageContent } from "../../message/types.js";
import type { User } from "../../models/user.js";
import { Event } from "./../event.js";

/** 互动事件（C2C）。 */
export class InteractionEvent extends Event<InteractionContext> {
  constructor(
    app: App,
    ctx: InteractionContext,
    readonly interaction: QQBotInteractionEvent,
    readonly sender: User,
  ) {
    super(app, ctx);
  }

  get kind(): "c2c" | "group" {
    return this.interaction.scene === "group" || this.interaction.group_openid
      ? "group"
      : "c2c";
  }

  /** 互动类型。 */
  get type(): number {
    return this.interaction.type;
  }

  /** 触发时间。 */
  get timestamp(): string | undefined {
    return this.interaction.timestamp;
  }

  /** 互动数据。 */
  get data(): QQBotInteractionEvent["data"] {
    return this.interaction.data;
  }

  /** 互动召回消息。 */
  echo(content: MessageContent): Promise<MessageSendingResult> {
    const targetId =
      this.kind === "group"
        ? this.interaction.group_openid
        : this.interaction.user_openid;

    if (!targetId) {
      throw new Error("互动事件缺少消息发送目标 openid");
    }

    return sendMessage(this.app, this.kind, targetId, content, {
      eventId: this.interaction.id,
    });
  }
}
