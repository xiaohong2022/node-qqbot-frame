/**
 * `/admin`：演示 CommandScope.only_admin 与 only_at。
 */
import { Command } from "node-qqbot-frame";

export class AdminCommand extends Command {
  name = "/admin";
  override description = "仅群管理员可用，且必须 @机器人";
  override only_at = true;
  override scope = { only_admin: true, group: true, c2c: false };

  handle(): string {
    return "管理员命令执行成功（scope.only_admin + only_at）";
  }
}
