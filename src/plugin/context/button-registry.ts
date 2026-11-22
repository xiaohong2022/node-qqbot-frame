import type { App } from "../../app.js";
import type { InteractButton } from "../../button/bulitin/index.js";
import type { Constructor } from "../../registry.js";

/** 插件按钮注册入口，自动追踪注册 ID。 */
export class PluginButtonRegistry {
  private readonly ids = new Set<string>();

  constructor(private readonly app: App) {}

  /** 注册互动按钮并记录，卸载时自动注销。 */
  register(id: string, ctor: Constructor<InteractButton>): InteractButton {
    const button = this.app.buttons.register(id, ctor);
    this.ids.add(id);
    return button;
  }

  /** 注销本插件注册的按钮。 */
  unregister(id: string): boolean {
    if (!this.ids.has(id)) {
      return false;
    }
    const removed = this.app.buttons.unregister(id);
    this.ids.delete(id);
    return removed;
  }

  /** 框架内部：注销该插件的全部按钮。 */
  dispose(): void {
    for (const id of [...this.ids]) {
      this.app.buttons.unregister(id);
    }
    this.ids.clear();
  }
}
