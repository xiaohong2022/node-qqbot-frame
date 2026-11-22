import type { IButton } from "../../message/types.js";
import { Button } from "../button.js";
import { buildButtonPermission } from "../permission.js";

/**
 * 跳转按钮。
 *
 * `action.type` 固定为 0，点击后跳转至链接或小程序，不会触发 `INTERACTION_CREATE`。
 */
export abstract class LinkButton extends Button {
  /** 跳转地址（http 链接或小程序）。 */
  abstract link: string;

  /** 版本过低时的提示文案。 */
  unsupport_tips?: string;

  override build(link?: string | IButton): IButton {
    if (typeof link === "object" && link !== null) {
      return this.createButton({ type: 0 }, link);
    }

    return this.createButton({
      type: 0,
      data: link ?? this.link,
      permission: buildButtonPermission(this.scope),
      unsupport_tips: this.unsupport_tips,
    });
  }
}
