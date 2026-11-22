import type {
  InteractionContext,
  InteractionEvent as QQBotInteractionEvent,
  MiddlewareContext,
  QQBot,
  QQBotInboundMessage,
} from "@tencent-connect/qqbot-nodejs";
import type { BotHost } from "./bot-host.js";
import { EventEmitter } from "./events/emitter.js";
import {
  GroupInteractionEvent,
  GroupMessageEvent,
  InteractionEvent,
  MessageEvent,
} from "./events/bulitin/index.js";
import type { AppEventMap } from "./events/types.js";
import { ButtonManager } from "./button/button-manager.js";
import { CommandManager } from "./command/command-manager.js";
import { Group } from "./models/group.js";
import { parseMemberType } from "./models/member-type.js";
import { Member, User } from "./models/user.js";
import { Logger, type LoggerTarget } from "./logger.js";
import { PluginManager } from "./plugin/plugin-manager.js";
import type { PluginManagerOptions } from "./plugin/types.js";

/** App 配置。 */
export interface AppOptions {
  /** 日志输出对象，默认 `console`。 */
  logger?: LoggerTarget;
  /** 插件系统配置。 */
  plugins?: PluginManagerOptions;
}

/**
 * 机器人应用。
 *
 * 每个 App 绑定一个 {@link QQBot} 实例，统一提供命令、按钮、事件
 * 以及 User / Group 快速操作入口。
 */
export class App implements BotHost {
  readonly events = new EventEmitter<AppEventMap>();
  readonly logger: Logger;
  readonly commands: CommandManager;
  readonly buttons: ButtonManager;
  readonly plugins: PluginManager;
  readonly options: AppOptions;

  constructor(
    readonly bot: QQBot,
    options: AppOptions = {},
  ) {
    this.options = options;
    this.logger = new Logger(options.logger ?? console, "app");
    this.commands = new CommandManager(this);
    this.buttons = new ButtonManager(this);
    this.bindBotEvents();
    this.plugins = new PluginManager(this, options.plugins);
  }

  /** 根据群 openid 构建 Group。 */
  group(openid: string): Group {
    return new Group(this, openid);
  }

  /** 根据用户 openid 构建 User（nickname 为空字符串）。 */
  user(openid: string): User {
    return new User(this, openid);
  }

  private bindBotEvents(): void {
    this.bot.on("message", (ctx, msg) => {
      this.safelyDispatch(() => {
        this.dispatchMessage(ctx, msg);
      })
    });
    this.bot.on("interaction", (ctx, interaction) => {
      this.safelyDispatch(() => {
        this.dispatchInteraction(ctx, interaction);
      })
    });
  }

  private dispatchMessage(
    ctx: MiddlewareContext,
    msg: QQBotInboundMessage,
  ): void {
    if (msg.kind === "group") {
      if (!msg.groupOpenid) {
        return;
      }

      const group = new Group(this, msg.groupOpenid);
      const sender = new Member(
        this,
        msg.senderId,
        group,
        msg.senderName ?? "",
        parseMemberType(readMemberRole(msg)),
        msg.senderIsBot ?? false,
      );
      const event = new GroupMessageEvent(this, ctx, msg, sender, group);

      this.events.emit("message", event);
      this.events.emit("group_message", event);
      return;
    }

    if (msg.kind === "c2c") {
      const sender = new User(
        this,
        msg.senderId,
        msg.senderName ?? "",
        msg.senderIsBot ?? false,
      );
      const event = new MessageEvent(this, ctx, msg, sender);

      this.events.emit("message", event);
      this.events.emit("c2c_message", event);
    }
  }

  private dispatchInteraction(
    ctx: InteractionContext,
    interaction: QQBotInteractionEvent,
  ): void {
    if (interaction.scene === "group" || (!interaction.scene && interaction.group_openid)) {
      if (!interaction.group_openid || !interaction.group_member_openid) {
        return;
      }

      const group = new Group(this, interaction.group_openid);
      const sender = new Member(
        this,
        interaction.group_member_openid,
        group,
      );
      const event = new GroupInteractionEvent(
        this,
        ctx,
        interaction,
        sender,
        group,
      );

      this.events.emit("interaction", event);
      return;
    }

    if (interaction.scene === "c2c" || (!interaction.scene && interaction.user_openid)) {
      if (!interaction.user_openid) {
        return;
      }

      const sender = new User(this, interaction.user_openid);
      const event = new InteractionEvent(this, ctx, interaction, sender);

      this.events.emit("interaction", event);
    }
  }

  private safelyDispatch(todo: () => void): void {
    try {
      return todo();
    } catch (error) {
      this.logger.error("处理事件失败", error);
    }
  }
}

function readMemberRole(msg: QQBotInboundMessage): unknown {
  const raw = msg.raw as { author?: { member_role?: string } };
  return raw.author?.member_role;
}
