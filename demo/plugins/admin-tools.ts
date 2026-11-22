/**
 * 示例插件：群管理。
 *
 * 演示插件注册命令与互动按钮、命令 scope / only_at，以及
 * 通过快速操作对象管理成员（Member.remove）。
 */
import {
  AtParam,
  BasePlugin,
  ButtonStyle,
  Command,
  GroupInteractionEvent,
  GroupMessageEvent,
  InteractionStatus,
  InteractButton,
  type CommandParamDefinesMatch,
  type CommandParams,
  type IButton,
  type InteractionEvent,
  type MessageEvent,
  type PluginContext,
} from "node-qqbot-frame";

/** `/kick <@成员>`：仅管理员、必须 @机器人。 */
class KickCommand extends Command {
  name = "/kick";
  override description = "插件示例：移除群成员（仅管理员）";
  override only_at = true;
  override scope = { only_admin: true, group: true, c2c: false };
  override params: CommandParamDefinesMatch[] = [[["user", AtParam]]];

  async handle(
    params: CommandParams,
    event: MessageEvent | GroupMessageEvent,
  ): Promise<string> {
    if (!(event instanceof GroupMessageEvent)) {
      return "该命令仅群聊可用";
    }

    const ok = await event.group.member(params.user as string).remove(false);
    return ok ? "已移出该成员" : "操作失败（需机器人具备群管理权限）";
  }
}

/** 互动按钮：点击后移除 data 指定的成员。 */
class KickButton extends InteractButton {
  id = "demo_mod_kick";
  label = "移出本群";
  override visited_label = "已处理";
  style = ButtonStyle.DANGER;
  override scope = { only_admin: true };
  override modal = {
    content: "确认将该成员移出本群？",
    confirm_text: "移出",
    cancel_text: "取消",
  };

  async handle(
    data: string,
    event: InteractionEvent | GroupInteractionEvent,
  ): Promise<InteractionStatus> {
    if (!data || !(event instanceof GroupInteractionEvent)) {
      return InteractionStatus.FAILED;
    }

    const removed = await event.group.member(data).remove(false);
    await event.echo(removed ? `已移出成员 ${data}` : "移出失败");

    return removed ? InteractionStatus.SUCCESS : InteractionStatus.FAILED;
  }
}

/** 插件安装时创建，供 `/mod-panel` 组装键盘。 */
let kickButton: InteractButton | undefined;

/** `/mod-panel <@成员>`：发送带「移出本群」按钮的 Markdown 卡片。 */
class ModPanelCommand extends Command {
  name = "/mod-panel";
  override description = "插件示例：发送带管理按钮的卡片";
  override only_at = true;
  override scope = { only_admin: true, group: true, c2c: false };
  override params: CommandParamDefinesMatch[] = [[["user", AtParam]]];

  handle(
    params: CommandParams,
  ): { type: "markdown"; markdown: string; keyboard: IButton[][] } | string {
    if (!kickButton) {
      return "按钮尚未注册";
    }

    const openid = params.user as string;
    return {
      type: "markdown",
      markdown: `### 成员管理\n目标：<@${openid}>`,
      keyboard: [[kickButton.build(openid)]],
    };
  }
}

/** 插件入口。 */
export default class AdminToolsPlugin extends BasePlugin {
  override id = "admin-tools";

  override onInstall(ctx: PluginContext): void {
    ctx.logger.info("admin-tools 插件已安装");

    kickButton = ctx.buttons.register("demo_mod_kick", KickButton);

    ctx.commands.register("demo_mod_kick_command", KickCommand);
    ctx.commands.register("demo_mod_panel_command", ModPanelCommand);

    ctx.events.on("interaction", (event) => {
      ctx.logger.debug(`收到互动事件 类型=${event.type}`);
    });
  }

  override onUninstall(ctx: PluginContext): void {
    kickButton = undefined;
    ctx.logger.info("admin-tools 插件已卸载");
  }
}
