/**
 * 互动按钮：点击后触发 interaction 事件，由 handle 处理并通过事件回复。
 */
import {
  ButtonStyle,
  InteractionStatus,
  InteractButton,
  type GroupInteractionEvent,
  type InteractionEvent,
} from "node-qqbot-frame";

export class HelpButton extends InteractButton {
  id = "demo_help";
  label = "查看帮助";
  override visited_label = "已查看帮助";
  style = ButtonStyle.PRIMARY;
  override scope = { ids: true };
  override modal = {
    content: "要查看 Demo 帮助吗？",
    confirm_text: "查看",
    cancel_text: "取消",
  };

  async handle(
    _data: string,
    event: InteractionEvent | GroupInteractionEvent,
  ): Promise<InteractionStatus> {
    await event.echo(
      [
        "Demo 命令：",
        "/echo <text> [times]  重复文本",
        "/calc <a> <运算> <b>  四则运算",
        "/config <开关> [JSON] 布尔 + JSON",
        "/panel                重新打开按钮面板",
        "/push <text>          主动消息",
        "/stream <text>        C2C 流式消息",
      ].join("\n"),
    );
    return InteractionStatus.SUCCESS;
  }
}
