/**
 * 示例插件：欢迎语。
 *
 * 演示插件生命周期、PluginContext 的命令 / 事件 / 日志与快速操作构建。
 */
import {
  BasePlugin,
  Command,
  GroupMessageEvent,
  at,
  type CommandParams,
  type MessageEvent,
  type PluginContext,
} from "node-qqbot-frame";

/** `/welcome`：按会话类型返回欢迎语。 */
class WelcomeCommand extends Command {
  name = "/welcome";
  override description = "插件示例：发送欢迎语";
  override scope = { c2c: true, group: true };

  handle(
    _params: CommandParams,
    event: MessageEvent | GroupMessageEvent,
  ): string {
    if (event instanceof GroupMessageEvent) {
      return `欢迎加入本群！\n${at(event.sender.openid)}`;
    }
    return "欢迎私聊！发送 /panel 查看按钮演示。";
  }
}

/** 插件入口。 */
export default class WelcomePlugin extends BasePlugin {
  override id = "welcome";

  override onInstall(ctx: PluginContext): void {
    ctx.logger.info("welcome 插件已安装");

    ctx.commands.register("welcome_command", WelcomeCommand);

    // 首个群消息 / 私聊消息只记录一次，演示 ctx.events.once 与 ctx.group / ctx.user
    ctx.events.once("group_message", (event) => {
      ctx.logger.info(`首次群消息，群 openid=${ctx.group(event.group.openid).openid}`);
    });
    ctx.events.once("c2c_message", (event) => {
      ctx.logger.info(`首次私聊，用户 openid=${ctx.user(event.sender.openid).openid}`);
    });
  }

  override onUninstall(ctx: PluginContext): void {
    ctx.logger.info("welcome 插件已卸载");
  }
}
