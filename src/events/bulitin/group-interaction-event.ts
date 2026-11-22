import type {
  InteractionContext,
  InteractionEvent as QQBotInteractionEvent,
} from "@tencent-connect/qqbot-nodejs";
import type { App } from "../../app.js";
import type { Group } from "../../models/group.js";
import type { Member } from "../../models/user.js";
import { InteractionEvent } from "./interaction-event.js";

/** 群互动事件。 */
export class GroupInteractionEvent extends InteractionEvent {
  declare readonly sender: Member;

  constructor(
    app: App,
    ctx: InteractionContext,
    interaction: QQBotInteractionEvent,
    sender: Member,
    readonly group: Group,
  ) {
    super(app, ctx, interaction, sender);
  }

  override get kind(): "group" {
    return "group";
  }
}
