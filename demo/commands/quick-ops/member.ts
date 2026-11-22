/**
 * `/member <@成员>`：Group.member 与 User.toMember。
 */
import {
  AtParam,
  Command,
  GroupMessageEvent,
  type CommandParamDefinesMatch,
  type CommandParams,
  type MessageEvent,
} from "node-qqbot-frame";

export class MemberCommand extends Command {
  name = "/member";
  override description = "展示 Group.member / User.toMember";
  override scope = { only_admin: true, group: true, c2c: false };
  override params: CommandParamDefinesMatch[] = [[["user", AtParam]]];

  handle(
    params: CommandParams,
    event: GroupMessageEvent,
  ): string {
    const openid = params.user as string;
    const member = event.group.member(openid);
    const viaUser = event.app.user(openid).toMember(event.group.openid);

    return [
      `Group.member：${member.openid}`,
      `User.toMember：${viaUser.openid}（群 ${viaUser.group.openid}）`,
      `成员类型：${member.type}`,
    ].join("\n");
  }
}
