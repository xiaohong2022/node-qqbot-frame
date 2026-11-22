import type { Constructor } from "../../registry.js";
import type { BasePlugin } from "../base-plugin.js";
import { BulitinCommandsPlugin } from "./commands-plugin.js";
import { BulitinPingPongPlugin } from "./ping-pong-plugin.js";

export { BulitinCommandsPlugin } from "./commands-plugin.js";
export { BulitinPingPongPlugin } from "./ping-pong-plugin.js";

/** 内置插件注册表：内置 ID -> 插件类。 */
export const BULITIN_PLUGINS: ReadonlyMap<
  string,
  Constructor<BasePlugin>
> = new Map([
  ["builtin:ping", BulitinPingPongPlugin],
  ["builtin:commands", BulitinCommandsPlugin],
]);
