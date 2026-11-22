import type { IButton } from "../../message/types.js";
import { Button } from "../button.js";
import { buildButtonPermission } from "../permission.js";

/**
 * 指令按钮。
 *
 * `action.type` 固定为 2，点击后在输入框插入 `data`；
 * 开启 {@link enter} 时直接发送指令（仅单聊可用）。
 */
export abstract class CommandButton extends Button {
  /** 指令内容。 */
  abstract command: string;

  /** 点击后直接发送指令，仅单聊可用，默认 false。 */
  enter = false;

  /** 指令是否带引用回复本消息，默认 false。 */
  reply = false;

  /** 设置后忽略 {@link enter}；1 表示唤起选图器（仅手机端单聊）。 */
  anchor?: number;

  /** 版本过低时的提示文案。 */
  unsupport_tips?: string;

  override build(command?: string | IButton): IButton {
    if (typeof command === "object" && command !== null) {
      return this.createButton({ type: 2 }, command);
    }

    return this.createButton({
      type: 2,
      data: command ?? this.command,
      enter: this.enter,
      reply: this.reply,
      anchor: this.anchor,
      permission: buildButtonPermission(this.scope),
      unsupport_tips: this.unsupport_tips,
    });
  }
}
