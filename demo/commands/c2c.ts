/**
 * `/c2c`：演示 ListScope（group: false 表示群聊全部拒绝）。
 */
import { Command } from "node-qqbot-frame";

export class C2CCommand extends Command {
  name = "/c2c";
  override description = "仅 C2C 私聊可用";
  override scope = { c2c: true, group: false };

  handle(): string {
    return "这条命令只会在 C2C 私聊中触发";
  }
}
