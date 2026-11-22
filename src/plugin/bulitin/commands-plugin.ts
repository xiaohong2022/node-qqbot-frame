import {
  Command,
  type CommandParamDefinesMatch,
  type CommandParams,
} from "../../command/command.js";
import type {
  GroupMessageEvent,
  MessageEvent,
} from "../../events/bulitin/index.js";
import { BasePlugin } from "../base-plugin.js";
import type { PluginContext } from "../plugin-context.js";

function formatUsage(
  command: Command,
  pattern: CommandParamDefinesMatch,
): string {
  const params = pattern
    .map(([id, param]) => param.usage(id))
    .join(" ");

  return (command.only_at ? '@bot ' : '') + (params ? `${command.name} ${params}` : command.name);
}

class CommandsCommand extends Command {
  name = "/commands";
  override description = "列出当前环境下可用的命令";

  async handle(
    _params: CommandParams,
    event: MessageEvent | GroupMessageEvent,
  ): Promise<string> {
    const commands = event.app.commands.listAvailable(event, true);
    const lines: string[] = [];

    for (const command of commands) {
      const patterns: CommandParamDefinesMatch[] =
        command.params.length === 0 ? [[]] : command.params;

      patterns.forEach((pattern, index) => {
        const description =
          index === 0 && command.description
            ? ` - ${command.description}`
            : "";
        lines.push(`${formatUsage(command, pattern)}${description}`);
      });
    }

    return lines.join("\n");
  }
}

/**
 * 内置命令列表插件。
 *
 * 命令 `/commands` 列出当前环境下可用的全部命令。
 */
export class BulitinCommandsPlugin extends BasePlugin {
  override id = "builtin:commands";

  override onInstall(ctx: PluginContext): void {
    ctx.logger.info("commands 已安装");
    ctx.commands.register("builtin_commands_command", CommandsCommand);
  }

  override onUninstall(ctx: PluginContext): void {
    ctx.logger.info("commands 已卸载");
  }
}
