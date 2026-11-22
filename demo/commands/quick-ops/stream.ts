/**
 * `/stream <text>`：C2C 流式消息（User.openC2CStream）。
 */
import {
  Command,
  StringParam,
  type CommandParamDefinesMatch,
  type CommandParams,
  type MessageEvent,
} from "node-qqbot-frame";

export class StreamCommand extends Command {
  name = "/stream";
  override description = "C2C 流式消息演示（仅私聊）";
  override scope = { c2c: true, group: false };
  override params: CommandParamDefinesMatch[] = [[["text", StringParam]]];

  async handle(
    params: CommandParams,
    event: MessageEvent,
  ): Promise<string> {

    const text = params.text as string;
    const stream = event.sender.openC2CStream(event.msgId);

    await stream.update(`${text}（第 1 帧）`);
    await stream.update(`${text}（第 1 帧）\n第 2 帧：追加内容`);
    await stream.complete();

    return "流式消息已推送完成（User.openC2CStream）";
  }
}
