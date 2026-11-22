import { dirname } from "node:path";
import type { App } from "../app.js";
import type { Group } from "../models/group.js";
import type { User } from "../models/user.js";
import { PluginButtonRegistry } from "./context/button-registry.js";
import { PluginCommandRegistry } from "./context/command-registry.js";
import { PluginEventRegistry } from "./context/event-registry.js";
import type { Logger } from "../logger.js";

/**
 * 插件运行上下文。
 *
 * 插件通过这里注册命令/按钮、监听事件；框架记录全部资源，
 * 卸载时自动取消，不影响主程序或其他插件。
 */
export class PluginContext {
  readonly commands: PluginCommandRegistry;
  readonly buttons: PluginButtonRegistry;
  readonly events: PluginEventRegistry;
  readonly logger: Logger;

  constructor(
    private readonly app: App,
    readonly id: string,
    readonly file?: string,
  ) {
    this.commands = new PluginCommandRegistry(app);
    this.buttons = new PluginButtonRegistry(app);
    this.events = new PluginEventRegistry(app);
    this.logger = app.logger.child(`plugin:${id}`);
  }

  /** 插件文件所在目录；内置插件没有文件，返回 undefined。 */
  get dir(): string | undefined {
    return this.file ? dirname(this.file) : undefined;
  }

  /** 构建 Group 快速操作对象。 */
  group(openid: string): Group {
    return this.app.group(openid);
  }

  /** 构建 User 快速操作对象。 */
  user(openid: string): User {
    return this.app.user(openid);
  }

  /** 框架内部：取消该插件的全部注册与监听。 */
  dispose(): void {
    this.events.dispose();
    this.commands.dispose();
    this.buttons.dispose();
  }
}
