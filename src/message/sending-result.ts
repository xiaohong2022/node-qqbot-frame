import type { ChatScope, MessageResponse } from "@tencent-connect/qqbot-nodejs";
import type { BotHost } from "../bot-host.js";
import { MessageDeleteBuilder } from "./delete-builder.js";

/** 消息发送结果。 */
export class MessageSendingResult {
  /** 消息 ID。 */
  readonly msgId: string;
  /** 发送时间戳。 */
  readonly timestamp: number | string;
  /** 消息引用索引。 */
  readonly msgIdx?: string;

  constructor(
    private readonly host: BotHost,
    private readonly scope: ChatScope,
    private readonly targetId: string,
    response: MessageResponse,
  ) {
    this.msgId = response.id;
    this.timestamp = response.timestamp;
    this.msgIdx = response.ext_info?.ref_idx;
  }

  /** 撤回本条消息，返回是否成功。 */
  delete(): Promise<boolean> {
    return MessageDeleteBuilder.build(this.host, this.scope, this.targetId, this.msgId)();
  }
}
