import type { PluginContext } from "./plugin-context.js";

/**
 * 插件基类。
 *
 * 插件脚本需导出一个继承 {@link BasePlugin} 的类；
 * 实例化与生命周期调用由 PluginManager 负责。
 */
export abstract class BasePlugin {
  /** 插件唯一 ID；未提供时使用文件名（去掉 `.ts`）。 */
  id?: string;

  /** 安装（加载）时调用。 */
  onInstall?(ctx: PluginContext): void | Promise<void>;

  /** 卸载时调用；返回后框架会自动取消该插件的注册与监听。 */
  onUninstall?(ctx: PluginContext): void | Promise<void>;
}
