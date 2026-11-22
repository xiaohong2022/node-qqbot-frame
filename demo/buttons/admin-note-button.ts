/**
 * 互动按钮：only_admin 会映射为平台侧“仅管理员可点击”。
 */
import {
  ButtonStyle,
  InteractionStatus,
  InteractButton,
  type GroupInteractionEvent,
  type InteractionEvent,
} from "node-qqbot-frame";

export class AdminNoteButton extends InteractButton {
  id = "demo_admin_note";
  label = "管理员备注";
  override visited_label = "已记录";
  style = ButtonStyle.DANGER;
  override scope = { only_admin: true };

  async handle(
    _data: string,
    event: InteractionEvent | GroupInteractionEvent,
  ): Promise<InteractionStatus> {
    await event.echo("该按钮仅管理员可点击（scope.only_admin → 平台权限）");
    return InteractionStatus.SUCCESS;
  }
}
