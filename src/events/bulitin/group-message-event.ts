import type {
  MiddlewareContext,
  QQBotInboundMessage,
} from "@tencent-connect/qqbot-nodejs";
import type { App } from "../../app.js";
import type { Group } from "../../models/group.js";
import type { Member } from "../../models/user.js";
import { MessageEvent } from "./message-event.js";

/** 群消息事件。 */
export class GroupMessageEvent extends MessageEvent {
  declare readonly sender: Member;

  constructor(
    app: App,
    ctx: MiddlewareContext,
    msg: QQBotInboundMessage,
    sender: Member,
    readonly group: Group,
  ) {
    super(app, ctx, msg, sender);
  }

  override get kind(): "group" {
    return "group";
  }
}
