/**
 * `/plugin`：演示插件的安装、卸载与查询。
 */
import {
  Command,
  StringParam,
  type CommandParamDefinesMatch,
  type CommandParams,
  type GroupMessageEvent,
  type MessageEvent,
} from "node-qqbot-frame";

export class PluginCommand extends Command {
  name = "/plugin";
  override description = "插件管理：list / install <文件> / uninstall <ID>";
  override scope = {
    // 填入管理员的 openid
    c2c: ["A1B2C3D4E5F6A1B2C3D4E5F6A1B2C3D4"],
  }
  override params: CommandParamDefinesMatch[] = [
    [["action", StringParam]],
    [["action", StringParam], ["target", StringParam]],
  ];

  async handle(
    params: CommandParams,
    event: MessageEvent | GroupMessageEvent,
  ): Promise<string> {
    const action = params.action as string;
    const target = params.target as string | undefined;
    const plugins = event.app.plugins;

    switch (action) {
      case "list": {
        const infos = plugins.list();
        if (infos.length === 0) {
          return "当前没有已安装插件";
        }
        return infos
          .map((info) => `${info.id}（${info.file}）`)
          .join("\n");
      }

      case "install": {
        if (!target) {
          return "用法：/plugin install <文件名或 builtin:xxx>";
        }
        try {
          const info = await plugins.install(target);
          return `已安装插件：${info.id}`;
        } catch (error) {
          return `安装失败：${error instanceof Error ? error.message : String(error)}`;
        }
      }

      case "uninstall": {
        if (!target) {
          return "用法：/plugin uninstall <插件 ID 或文件>";
        }
        const removed = await plugins.uninstall(target);
        return removed ? `已卸载插件：${target}` : `未找到插件：${target}`;
      }

      default:
        return "用法：/plugin list | /plugin install <文件> | /plugin uninstall <ID>";
    }
  }
}
