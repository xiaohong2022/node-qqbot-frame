import type { ChatScope } from "@tencent-connect/qqbot-nodejs";
import type { BotHost } from "../bot-host.js";

/**
 * 通过 c2c openid / group openid 以及 msgId 构建撤回函数。
 *
 * 返回值：`true` 表示撤回成功，`false` 表示撤回失败（异常被吞掉）。
 */
export class MessageDeleteBuilder {
  private constructor(
    private readonly host: BotHost,
    private readonly scope: ChatScope,
    private readonly targetId: string,
    private readonly msgId: string,
  ) {}

  static build(
    host: BotHost,
    scope: ChatScope,
    targetId: string,
    msgId: string,
  ): () => Promise<boolean> {
    const builder = new MessageDeleteBuilder(host, scope, targetId, msgId);
    return () => builder.delete();
  }

  private async delete(): Promise<boolean> {
    try {
      await this.host.bot.messageApi.recallMessage(
        this.scope,
        this.targetId,
        this.msgId,
        this.host.bot.getCredentials(),
      );
      return true;
    } catch {
      return false;
    }
  }
}
