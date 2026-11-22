import type { App } from "../app.js";
import { MessageDeleteBuilder } from "../message/delete-builder.js";
import { sendMessage } from "../message/sender.js";
import { MessageSendingResult } from "../message/sending-result.js";
import type { MessageContent } from "../message/types.js";
import { Member } from "./user.js";

/** 群聊快速操作类。 */
export class Group {
  constructor(
    readonly app: App,
    readonly openid: string,
  ) {}

  /** 主动发送群聊消息（不关联入站消息）。 */
  directMsg(content: MessageContent): Promise<MessageSendingResult> {
    return sendMessage(this.app, "group", this.openid, content);
  }

  /** 撤回群中的消息，返回是否成功。 */
  deleteGroupMsg(msgid: string): Promise<boolean> {
    return MessageDeleteBuilder.build(this.app, "group", this.openid, msgid)();
  }

  /** 根据成员 openid 构建 Member。 */
  member(openid: string): Member {
    return new Member(this.app, openid, this);
  }
}
