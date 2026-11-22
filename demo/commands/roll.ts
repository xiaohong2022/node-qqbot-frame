/**
 * `/roll`：指令按钮写入的指令；无参数。
 */
import { Command } from "node-qqbot-frame";

export class RollCommand extends Command {
  name = "/roll";
  override description = "掷一个 1~6 的骰子";

  handle(): string {
    return `掷骰结果：${Math.floor(Math.random() * 6) + 1}`;
  }
}
