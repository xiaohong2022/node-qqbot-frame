import type { QQBot } from "@tencent-connect/qqbot-nodejs";

/**
 * 框架内部所需的最小宿主接口。
 *
 * 事件、模型等模块只依赖该接口，而不依赖完整的 {@link App}，
 * 从而降低模块之间的耦合。
 */
export interface BotHost {
  readonly bot: QQBot;
}
