/**
 * `/config <开关>` 或 `/config <开关> <JSON>`：演示 BoolParam 与 JsonParam。
 */
import {
  BoolParam,
  Command,
  JsonParam,
  type CommandParamDefinesMatch,
  type CommandParams,
} from "node-qqbot-frame";

export class ConfigCommand extends Command {
  name = "/config";
  override description = "布尔开关，可附加一个 JSON 配置";
  override params: CommandParamDefinesMatch[] = [
    [["enable", BoolParam]],
    [["enable", BoolParam], ["value", JsonParam]],
  ];

  handle(params: CommandParams): string {
    const enable = params.enable as boolean;
    const value = params.value;

    const lines = [`开关：${enable ? "开启" : "关闭"}`];
    if (value !== undefined) {
      lines.push(`配置：${JSON.stringify(value)}`);
    }
    return lines.join("\n");
  }
}
