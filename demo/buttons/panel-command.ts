/**
 * `/panel`：发送带键盘的 Markdown 消息。
 *
 * 按钮实例由 main.ts 注册后注入，避免模块间共享可变状态。
 */
import {
  Command,
  type CommandButton,
  type IButton,
  type InteractButton,
  type LinkButton,
} from "node-qqbot-frame";

/** `/panel` 需要的按钮集合。 */
export interface PanelButtons {
  help: InteractButton;
  adminNote: InteractButton;
  wiki: LinkButton;
  roll: CommandButton;
}

export class PanelCommand extends Command {
  name = "/panel";
  override description = "按钮演示：发送带键盘的 Markdown 卡片";

  private readonly buttons: PanelButtons;

  constructor(buttons: PanelButtons) {
    super();
    this.buttons = buttons;
  }

  handle(): { type: "markdown"; markdown: string; keyboard: IButton[][] } {
    const { help, adminNote, wiki, roll } = this.buttons;

    return {
      type: "markdown",
      markdown: [
        "### 按钮演示",
        "- **互动按钮**：点击后由机器人回调并回复",
        "- **跳转按钮**：直接打开链接",
        "- **指令按钮**：点击写入 / 发送指令",
      ].join("\n"),
      keyboard: [
        [help.build("help"), wiki.build(), roll.build()],
        [adminNote.build()],
      ],
    };
  }
}
