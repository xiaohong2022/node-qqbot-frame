import type {
  GroupInteractionEvent,
  InteractionEvent,
} from "../../events/bulitin/index.js";
import type { IButton } from "../../message/types.js";
import { Button } from "../button.js";
import { InteractionStatus } from "../interaction-status.js";
import { buildButtonPermission } from "../permission.js";

/**
 * 互动按钮。
 *
 * `action.type` 固定为 1；点击后触发 `INTERACTION_CREATE`，
 * 由框架调用 {@link InteractButton.handle} 并回传 {@link InteractionStatus}。
 */
export abstract class InteractButton extends Button {
  /** 处理点击。 */
  abstract handle(
    data: string,
    event: InteractionEvent | GroupInteractionEvent,
  ): InteractionStatus | Promise<InteractionStatus>;

  override build(data?: string | IButton): IButton {
    if (typeof data === "object" && data !== null) {
      return this.createButton({ type: 1 }, data);
    }

    return this.createButton({
      type: 1,
      data: data ?? "",
      permission: buildButtonPermission(this.scope),
    });
  }
}
