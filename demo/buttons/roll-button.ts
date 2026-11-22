/**
 * 指令按钮：点击后在输入框写入指令；enter 仅单聊生效。
 */
import { ButtonStyle, CommandButton } from "node-qqbot-frame";

export class RollButton extends CommandButton {
  id = "demo_roll";
  label = "掷骰子";
  style = ButtonStyle.HIGHLIGHT;
  command = "/roll";
  override enter = true;
}
