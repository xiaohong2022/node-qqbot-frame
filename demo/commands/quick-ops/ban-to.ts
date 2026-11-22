/**
 * `/ban-to <@成员> <时间戳>`：Member.banTo。
 */
import {
  AtParam,
  Command,
  GroupMessageEvent,
  IntParam,
  type CommandParamDefinesMatch,
  type CommandParams,
  type MessageEvent,
} from "node-qqbot-frame";

export class BanToCommand extends Command {
  name = "/ban-to";
  override description = "禁言成员到指定 Unix 毫秒时间戳（Member.banTo）";
  override only_at = true;
  override scope = { only_admin: true, group: true, c2c: false };
  override params: CommandParamDefinesMatch[] = [
    [["user", AtParam], ["timestamp", IntParam]],
  ];

  async handle(
    params: CommandParams,
    event: GroupMessageEvent,
  ): Promise<string> {
    const timestamp = params.timestamp as number;
    const ok = await event.group.member(params.user as string).banTo(timestamp);

    return ok
      ? `已禁言至 ${new Date(timestamp).toISOString()}`
      : "禁言失败（需机器人具备群管理权限）";
  }
}
