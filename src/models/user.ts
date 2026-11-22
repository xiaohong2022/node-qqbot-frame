import type { StreamSession } from "@tencent-connect/qqbot-nodejs";
import type { App } from "../app.js";
import { muteMemberUntil, removeMember, unmuteMember } from "../api/group.js";
import { MessageDeleteBuilder } from "../message/delete-builder.js";
import { sendMessage } from "../message/sender.js";
import { MessageSendingResult } from "../message/sending-result.js";
import type { MessageContent } from "../message/types.js";
import { Group } from "./group.js";
import { MemberType } from "./member-type.js";

/** 单聊用户快速操作类。 */
export class User {
  constructor(
    readonly app: App,
    readonly openid: string,
    readonly nickname: string = "",
    readonly isBot: boolean = false,
  ) {}

  /** 主动发送 C2C 消息。 */
  c2cMsg(content: MessageContent): Promise<MessageSendingResult> {
    return sendMessage(this.app, "c2c", this.openid, content);
  }

  /** 打开 C2C 流式消息会话（msgid 为触发本次回复的入站消息 ID）。 */
  openC2CStream(msgid: string): StreamSession {
    return this.app.bot.openStream({
      target: {
        scope: "c2c",
        targetId: this.openid,
        msgId: msgid,
      },
    });
  }

  /** 撤回 C2C 中的消息，返回是否成功。 */
  deleteC2CMsg(msgid: string): Promise<boolean> {
    return MessageDeleteBuilder.build(this.app, "c2c", this.openid, msgid)();
  }

  /** 基于群 openid 构建该用户在指定群中的 Member。 */
  toMember(group_openid: string): Member {
    return new Member(
      this.app,
      this.openid,
      group_openid,
      this.nickname,
      MemberType.MEMBER,
      this.isBot,
    );
  }
}

/**
 * 群成员快速操作类。
 *
 * 继承 {@link User}，额外提供群管理能力。
 */
export class Member extends User {
  readonly group: Group;
  readonly type: MemberType;

  constructor(
    app: App,
    openid: string,
    group: string | Group,
    nickname: string = "",
    type: MemberType = MemberType.MEMBER,
    isBot: boolean = false,
  ) {
    super(app, openid, nickname, isBot);
    this.group = typeof group === "string" ? new Group(app, group) : group;
    this.type = type;
  }

  /** 禁言群成员指定秒数，返回是否成功。 */
  ban(second: number): Promise<boolean> {
    return muteMemberUntil(
      this.app,
      this.group.openid,
      this.openid,
      Date.now() + second * 1000,
    );
  }

  /** 禁言群成员到指定时刻（Unix 毫秒时间戳），返回是否成功。 */
  banTo(timestamp: number): Promise<boolean> {
    return muteMemberUntil(this.app, this.group.openid, this.openid, timestamp);
  }

  /** 解除群成员禁言，返回是否成功。 */
  unban(): Promise<boolean> {
    return unmuteMember(this.app, this.group.openid, this.openid);
  }

  /** 移除群成员，返回是否成功。 */
  remove(add_to_member_blacklist: boolean = false): Promise<boolean> {
    return removeMember(
      this.app,
      this.group.openid,
      this.openid,
      add_to_member_blacklist,
    );
  }
}
