/**
 * `/echo <text>` 或 `/echo <text> <times>`：演示多组参数配对。
 */
import {
  Command,
  IntParam,
  StringParam,
  type CommandParamDefinesMatch,
  type CommandParams,
} from "node-qqbot-frame";

export class EchoCommand extends Command {
  name = "/echo";
  override description = "重复输出文本，可选重复次数";
  override params: CommandParamDefinesMatch[] = [
    [["text", StringParam]],
    [["text", StringParam], ["times", IntParam]],
  ];

  handle(params: CommandParams): string {
    const text = params.text as string;
    const times = Math.min(Math.max((params.times as number | undefined) ?? 1, 1), 5);
    return Array.from({ length: times }, () => text).join("\n");
  }
}
