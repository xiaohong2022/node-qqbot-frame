/**
 * `/push <text>`：主动消息（Group.directMsg / User.c2cMsg）。
 */
import {
  Command,
  GroupMessageEvent,
  StringParam,
  type CommandParamDefinesMatch,
  type CommandParams,
  type MessageEvent,
} from "node-qqbot-frame";

export class PushCommand extends Command {
  name = "/push";
  override description = "主动推送一条消息（不关联本次入站消息）";
  override params: CommandParamDefinesMatch[] = [[["text", StringParam]]];

  async handle(
    params: CommandParams,
    event: MessageEvent | GroupMessageEvent,
  ): Promise<string> {
    const text = params.text as string;

    const result =
      event instanceof GroupMessageEvent
        ? await event.group.directMsg(text)
        : await event.sender.c2cMsg(text);

    return `已主动发送，msgId=${result.msgId}`;
  }
}
