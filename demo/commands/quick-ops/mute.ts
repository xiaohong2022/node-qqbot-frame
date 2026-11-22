/**
 * `/mute <@成员> <秒>`：Member.ban。
 */
import {
  AtParam,
  Command,
  IntParam,
  type CommandParamDefinesMatch,
  type CommandParams,
  type GroupMessageEvent
} from "node-qqbot-frame";

export class MuteCommand extends Command {
  name = "/mute";
  override description = "禁言成员指定秒数（Member.ban）";
  override only_at = true;
  override scope = { only_admin: true, group: true, c2c: false };
  override params: CommandParamDefinesMatch[] = [
    [["user", AtParam], ["seconds", IntParam]],
  ];

  async handle(
    params: CommandParams,
    event: GroupMessageEvent,
  ): Promise<string> {
    const ok = await event.group
      .member(params.user as string)
      .ban(params.seconds as number);

    return ok ? "已禁言该成员" : "禁言失败（需机器人具备群管理权限）";
  }
}
