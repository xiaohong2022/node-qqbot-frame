import type { App } from "../../app.js";
import type { Command } from "../../command/command.js";
import type { Constructor } from "../../registry.js";

/** 插件命令注册入口，自动追踪注册 ID。 */
export class PluginCommandRegistry {
  private readonly ids = new Set<string>();

  constructor(private readonly app: App) {}

  /** 注册命令并记录，卸载时自动注销。 */
  register(id: string, ctor: Constructor<Command>): Command {
    const command = this.app.commands.register(id, ctor);
    this.ids.add(id);
    return command;
  }

  /** 注销本插件注册的命令。 */
  unregister(id: string): boolean {
    if (!this.ids.has(id)) {
      return false;
    }
    const removed = this.app.commands.unregister(id);
    this.ids.delete(id);
    return removed;
  }

  /** 框架内部：注销该插件的全部命令。 */
  dispose(): void {
    for (const id of [...this.ids]) {
      this.app.commands.unregister(id);
    }
    this.ids.clear();
  }
}
