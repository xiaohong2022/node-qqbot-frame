/**
 * `/delete <msgid>`：按消息 ID 撤回（User.deleteC2CMsg / Group.deleteGroupMsg）。
 */
import {
  Command,
  GroupMessageEvent,
  StringParam,
  type CommandParamDefinesMatch,
  type CommandParams,
  type MessageEvent,
} from "node-qqbot-frame";

export class DeleteCommand extends Command {
  name = "/delete";
  override description = "按消息 ID 撤回消息";
  override params: CommandParamDefinesMatch[] = [[["msgid", StringParam]]];

  async handle(
    params: CommandParams,
    event: MessageEvent | GroupMessageEvent,
  ): Promise<string> {
    const msgid = params.msgid as string;

    const removed =
      event instanceof GroupMessageEvent
        ? await event.group.deleteGroupMsg(msgid)
        : await event.sender.deleteC2CMsg(msgid);

    return removed ? `已撤回消息 ${msgid}` : `撤回失败：${msgid}`;
  }
}
