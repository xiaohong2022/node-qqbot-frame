/**
 * `/temp <text>`：发送后 3 秒自动撤回（MessageSendingResult.delete）。
 */
import {
  Command,
  StringParam,
  type CommandParamDefinesMatch,
  type CommandParams,
  type GroupMessageEvent,
  type MessageEvent,
} from "node-qqbot-frame";

export class TempCommand extends Command {
  name = "/temp";
  override description = "发送一条消息，3 秒后自动撤回";
  override params: CommandParamDefinesMatch[] = [[["text", StringParam]]];

  async handle(
    params: CommandParams,
    event: MessageEvent | GroupMessageEvent,
  ): Promise<string> {
    const result = await event.echo(params.text as string);

    setTimeout(() => {
      void result.delete().then((removed) => {
        event.app.logger.info(
          removed
            ? `MessageSendingResult.delete 已撤回 ${result.msgId}`
            : `自动撤回失败 ${result.msgId}`,
        );
      });
    }, 3000);

    return "已发送，3 秒后自动撤回（MessageSendingResult.delete）";
  }
}
