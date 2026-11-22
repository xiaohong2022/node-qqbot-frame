import type {
  IButton,
  IButtonAction,
  IButtonModal,
} from "../message/types.js";
import type { ButtonStyle } from "./button-style.js";
import type {
  WhiteListScope,
  WhiteListScopeInput,
} from "../scope/white-list-scope.js";

/**
 * 键盘按钮抽象基类。
 *
 * 按钮通过 `app.buttons.register(id, ButtonClass)` 注册后生效。
 */
export abstract class Button {
  /** 按钮唯一 ID。 */
  abstract id: string;

  /** 按钮作用域。 */
  scope: WhiteListScope | WhiteListScopeInput = { ids: true };

  /** 按钮文字。 */
  abstract label: string;

  /** 点击后文字；未设置时与 {@link label} 相同。 */
  visited_label?: string;

  /** 按钮风格。 */
  abstract style: ButtonStyle | number;

  /** 用户点击二次确认操作。 */
  modal?: IButtonModal;

  /** 构建 IButton。传入自定义对象时直接深拷贝。 */
  abstract build(custom?: IButton): IButton;

  protected createButton(action: IButtonAction, custom?: IButton): IButton {
    if (custom) {
      return structuredClone(custom);
    }

    const finalAction: IButtonAction = { ...action };
    if (this.modal) {
      finalAction.modal = { ...this.modal };
    }

    return {
      id: this.id,
      render_data: {
        label: this.label,
        visited_label: this.visited_label ?? this.label,
        style: this.style,
      },
      action: finalAction,
    };
  }
}
