/**
 * `/quote <text>`：带引用的被动回复（MessageEvent.reply）。
 */
import {
  Command,
  StringParam,
  type CommandParamDefinesMatch,
  type CommandParams,
  type GroupMessageEvent,
  type MessageEvent,
} from "node-qqbot-frame";

export class QuoteCommand extends Command {
  name = "/quote";
  override description = "带引用回复触发消息";
  override params: CommandParamDefinesMatch[] = [[["text", StringParam]]];

  async handle(
    params: CommandParams,
    event: MessageEvent | GroupMessageEvent,
  ): Promise<string> {
    const result = await event.reply(params.text as string);
    return `已引用回复，msgId=${result.msgId}`;
  }
}
