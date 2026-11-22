/**
 * `/unmute <@成员>`：Member.unban。
 */
import {
  AtParam,
  Command,
  GroupMessageEvent,
  type CommandParamDefinesMatch,
  type CommandParams,
  type MessageEvent,
} from "node-qqbot-frame";

export class UnmuteCommand extends Command {
  name = "/unmute";
  override description = "解除成员禁言（Member.unban）";
  override only_at = true;
  override scope = { only_admin: true, group: true, c2c: false };
  override params: CommandParamDefinesMatch[] = [[["user", AtParam]]];

  async handle(
    params: CommandParams,
    event: GroupMessageEvent,
  ): Promise<string> {
    const ok = await event.group.member(params.user as string).unban();
    return ok ? "已解除禁言" : "解除失败（需机器人具备群管理权限）";
  }
}
