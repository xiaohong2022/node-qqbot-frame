import { Command } from "../../command/command.js";
import { BasePlugin } from "../base-plugin.js";
import type { PluginContext } from "../plugin-context.js";

class PingCommand extends Command {
  name = "/ping";

  async handle() {
    return "pong";
  }
}

/**
 * 内置 ping-pong 插件。
 *
 * - 命令 `/ping` 返回 `pong`
 * - 消息内容为 `ping` 时回复 `pong`
 */
export class BulitinPingPongPlugin extends BasePlugin {
  override id = "builtin:ping";

  override onInstall(ctx: PluginContext): void {
    ctx.logger.info("ping-pong 已安装");

    ctx.commands.register("builtin_ping_pong_command", PingCommand);

    ctx.events.on("message", (event) => {
      if (event.content.trim().toLowerCase() === "ping") {
        void event.echo("pong");
      }
    });
  }

  override onUninstall(ctx: PluginContext): void {
    ctx.logger.info("ping-pong 已卸载");
  }
}
