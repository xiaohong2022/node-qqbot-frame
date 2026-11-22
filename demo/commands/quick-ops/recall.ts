/**
 * `/recall`：撤回触发消息（MessageEvent.delete）。
 */
import {
  Command,
  type CommandParams,
  type GroupMessageEvent,
  type MessageEvent,
} from "node-qqbot-frame";

export class RecallCommand extends Command {
  name = "/recall";
  override description = "撤回触发本次命令的消息";

  async handle(
    _params: CommandParams,
    event: MessageEvent | GroupMessageEvent,
  ): Promise<string | void> {
    const removed = await event.delete();
    if (!removed) {
      return "撤回失败（可能超过时限或缺少权限）";
    }
    event.app.logger.info(`已撤回消息 ${event.msgId}`);
  }
}
