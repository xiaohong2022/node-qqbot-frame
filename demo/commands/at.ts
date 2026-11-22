/**
 * `/at <@成员>`：演示 AtParam，返回可直接发送的 @ 标记。
 */
import {
  AtParam,
  Command,
  at,
  type CommandParamDefinesMatch,
  type CommandParams,
} from "node-qqbot-frame";

export class AtCommand extends Command {
  name = "/at";
  override description = "@ 一个用户（At 参数）";
  override params: CommandParamDefinesMatch[] = [[["user", AtParam]]];

  handle(params: CommandParams): string {
    const openid = params.user as string;
    return `${at(openid)} 已解析 openid：${openid}`;
  }
}
