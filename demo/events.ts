/**
 * 事件演示：on / once / off，以及各事件类型的负载。
 */
import type { App, AppEventMap, EventListener } from "node-qqbot-frame";

/** 注册事件监听（仅记录日志，不主动回复）。 */
export function registerEvents(app: App): void {
  const logger = app.logger.child("demo:event");

  // 全部消息：C2C 与群聊都会触发
  app.events.on("message", (event) => {
    logger.info(`消息 [${event.kind}] ${event.sender.openid}: ${event.content}`);
  });

  // 仅群消息
  app.events.on("group_message", (event) => {
    logger.debug(
      `群消息 群=${event.group.openid} 成员=${event.sender.openid} 身份=${event.sender.type}`,
    );
  });

  // 仅 C2C 消息
  app.events.on("c2c_message", (event) => {
    logger.debug(`私聊消息 ${event.sender.openid}`);
  });

  // 按钮等互动事件（框架内部也会监听并分发到按钮处理）
  app.events.on("interaction", (event) => {
    logger.info(`互动事件 场景=${event.kind} 类型=${event.type}`);
  });

  // once / off 演示：只处理首条消息，随后移除自身
  const firstMessage: EventListener<AppEventMap["message"]> = (event) => {
    logger.info(`收到首条消息（${event.kind}），移除该临时监听`);
    app.events.off("message", firstMessage);
  };
  app.events.on("message", firstMessage);
}
