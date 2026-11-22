import type { ListScopeInput } from "../scope/list-scope.js";
import type { BasePlugin } from "./base-plugin.js";

/** 插件管理器配置。 */
export interface PluginManagerOptions {
  /** 插件根目录，默认 `path.resolve(process.cwd(), "plugin")`。 */
  root?: string;
  /**
   * 自动加载配置，按插件文件名（去掉 `.ts`）过滤。
   *
   * - `false`：不自动加载
   * - `true`：加载全部
   * - `string[]`：白名单
   * - `{ whitelist, blacklist }`：白名单 / 黑名单
   */
  autoLoad?: ListScopeInput;
}

/** 已安装插件信息。 */
export interface PluginInfo {
  /** 插件 ID。 */
  id: string;
  /** 插件来源：文件绝对路径，或内置插件 ID。 */
  file: string;
  /** 插件实例。 */
  instance: BasePlugin;
  /** 安装时间（Unix 毫秒时间戳）。 */
  installedAt: number;
}
