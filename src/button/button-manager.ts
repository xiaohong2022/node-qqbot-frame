import type { App } from "../app.js";
import type { InteractButton } from "./bulitin/index.js";
import { InteractionStatus } from "./interaction-status.js";
import type { EventEmitter } from "../events/emitter.js";
import type {
  GroupInteractionEvent,
  InteractionEvent,
} from "../events/bulitin/index.js";
import type { AppEventMap } from "../events/types.js";
import { Registry, type Constructor } from "../registry.js";
import { normalizeWhiteListScope } from "../scope/white-list-scope.js";
import type { Logger } from "../logger.js";

/** 键盘按钮管理器。 */
export class ButtonManager {
  private readonly registry = new Registry<InteractButton>("按钮");
  private readonly logger: Logger;

  constructor(
    private readonly app: App,
  ) {
    this.logger = app.logger.child("button");

    app.events.on("interaction", (event) => {
      void this.handle(event).catch(() => {
        // 互动处理为后台流程，避免异常冒泡影响其他事件监听器
      });
    });
  }

  /** 注册按钮并返回实例。 */
  register(id: string, ctor: Constructor<InteractButton>): InteractButton {
    this.logger.info(`注册 "${id}"`);
    return this.registry.register(id, ctor, (button) => {
      if (button.id !== id) {
        throw new Error(
          `按钮注册 ID "${id}" 与实例 id "${button.id}" 不一致`,
        );
      }
    });
  }

  /** 注销按钮，成功返回 true。 */
  unregister(id: string): boolean {
    this.logger.info(`注销 "${id}"`);
    return this.registry.unregister(id);
  }

  private async handle(
    event: InteractionEvent | GroupInteractionEvent,
  ): Promise<void> {
    if (event.interaction.type !== 11) {
      return;
    }

    const resolved = event.interaction.data?.resolved;
    const buttonId = resolved?.button_id;

    if (!buttonId) {
      await this.ack(event, InteractionStatus.FAILED);
      return;
    }

    const button = this.registry.get(buttonId);
    if (!button) {
      await this.ack(event, InteractionStatus.FAILED);
      return;
    }
    this.logger.debug("匹配到", buttonId);

    if (!normalizeWhiteListScope(button.scope).check(event.sender.openid)) {
      this.logger.debug("- 权限不足，跳过执行");
      await this.ack(event, InteractionStatus.NO_PERMISSION);
      return;
    }

    let status: InteractionStatus;
    try {
      status =
        (await button.handle(resolved?.button_data ?? "", event)) ??
        InteractionStatus.SUCCESS;
    } catch (error) {
      this.logger.error("- 交互处理失败", error);
      status = InteractionStatus.FAILED;
    }

    this.logger.debug("- 执行完毕！交互结果", status);

    await this.ack(event, status);
  }

  private async ack(
    event: InteractionEvent | GroupInteractionEvent,
    status: InteractionStatus,
  ): Promise<void> {
    try {
      await this.app.bot.acknowledgeInteraction(
        event.interaction.id,
        status,
      );
    } catch {
      // 互动回应失败无法再补救，忽略
    }
  }
}
