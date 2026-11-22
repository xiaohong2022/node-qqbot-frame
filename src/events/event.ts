import type { App } from "../app.js";

/**
 * 事件基类。
 *
 * - `app`：框架应用实例
 * - `ctx`：底层 SDK 的 context
 */
export abstract class Event<TContext> {
  constructor(
    readonly app: App,
    readonly ctx: TContext,
  ) {}
}
