import type {
  GroupInteractionEvent,
  GroupMessageEvent,
  InteractionEvent,
  MessageEvent,
} from "./bulitin/index.js";

/** App 事件表。 */
export interface AppEventMap {
  message: MessageEvent | GroupMessageEvent;
  c2c_message: MessageEvent;
  group_message: GroupMessageEvent;
  interaction: InteractionEvent | GroupInteractionEvent;
}
