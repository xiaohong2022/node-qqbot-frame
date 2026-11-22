import type { Command, CommandParamDefinesMatch, CommandParams } from "./command.js";
import { tokenizeCommand } from "./tokenizer.js";
import type {
  GroupMessageEvent,
  MessageEvent,
} from "../events/bulitin/index.js";
import type { MessageContent } from "../message/types.js";
import { isMemberAdmin } from "../models/member-type.js";
import { normalizeCommandScope } from "../scope/command-scope.js";
import { Registry, type Constructor } from "../registry.js";
import type { Logger } from "../logger.js";
import type { App } from "../app.js";
import { randId } from "../utils/rand-id.js";
import { CommandParamError } from "./param.js";

/**
 * 去除消息开头的 @机器人 标记，并判断 mentions 第一项是否指向机器人。
 *
 * 标记格式为 `<@openid>`，openid 取 mentions 第一项（`is_you` 为 true）的 id。
 */
function parseAtBot(msg: MessageEvent["msg"]): {
  at: boolean;
  content: string;
} {
  const mention = msg.mentions?.[0];
  const at = mention?.is_you === true;
  const id = at ? mention?.id : undefined;

  const content =
    typeof id === "string" && id.length > 0
      ? msg.content.replace(`<@${id}>`, "")
      : msg.content;

  return { at, content: content.trim() };
}

/** 命令管理器。 */
export class CommandManager {
  private readonly registry = new Registry<Command>("命令");
  private readonly logger: Logger;

  constructor(
    private readonly app: App,
  ) {
    this.logger = app.logger.child("command");

    app.events.on("message", (event) => {
      void this.handle(event).catch(() => {
        // 命令处理为后台流程，避免异常冒泡影响其他事件监听器
      });
    });
  }

  /** 注册命令并返回实例。 */
  register(id: string, ctor: Constructor<Command>): Command {
    this.logger.info(`注册 "${id}"`);
    return this.registry.register(id, ctor);
  }

  /** 注销命令，成功返回 true。 */
  unregister(id: string): boolean {
    this.logger.info(`注销 "${id}"`);
    return this.registry.unregister(id);
  }

  /** 列出当前消息环境下可用的命令（按 scope 与 only_at 过滤）。 */
  listAvailable(event: MessageEvent | GroupMessageEvent, with_only_at = false): Command[] {
    const { at } = parseAtBot(event.msg);
    const isAdmin =
      event.kind === "group" &&
      isMemberAdmin((event as GroupMessageEvent).sender.type);

    return [...this.registry.values()].filter((command) => {
      if (!with_only_at && command.only_at && event.kind === "group" && !at) {
        return false;
      }

      return normalizeCommandScope(command.scope).check(
        event.kind,
        event.sender.openid,
        isAdmin,
      );
    });
  }

  private async handle(event: MessageEvent | GroupMessageEvent): Promise<void> {
    const { at, content } = parseAtBot(event.msg);
    if (!content) {
      return;
    }

    const nameEnd = content.search(/\s/);
    const name = nameEnd === -1 ? content : content.slice(0, nameEnd);

    const command = this.findByName(name);
    if (!command) {
      return;
    }
    this.logger.debug("匹配到", name);

    // 在**群聊**时，如果声明了必须@，但是没有@，则不触发
    if (command.only_at && event.kind === "group" && !at) {
      this.logger.debug("- 非@，跳过执行");
      return;
    }

    const isAdmin =
      event.kind === "group" &&
      isMemberAdmin((event as GroupMessageEvent).sender.type);

    if (
      !normalizeCommandScope(command.scope).check(
        event.kind,
        event.sender.openid,
        isAdmin,
      )
    ) {
      this.logger.debug("- 权限不足，跳过执行");
      return;
    }

    let tokens: string[];
    try {
      tokens = tokenizeCommand(content);
    } catch (error) {
      await this.serverError(event, error);
      return;
    }
    this.logger.debug("- 分词结果", ...tokens);

    const args = tokens.slice(1);

    const patterns: CommandParamDefinesMatch[] =
      command.params.length === 0 ? [[]] : command.params;
    const candidates = patterns.filter(
      (pattern) => pattern.length === args.length,
    );

    if (candidates.length === 0) {
      this.logger.debug("- 没有匹配的参数");
      await this.safeEcho(event, "参数不匹配，用法：\n" + this.buildUsage(command));
      return;
    }

    let firstError: unknown;

    for (const pattern of candidates) {
      let params: CommandParams;
      try {
        params = this.parseParams(pattern, args);
      } catch (error) {
        firstError ??= error;
        continue;
      }

      this.logger.debug("- 参数解析结果", params);

      let result;
      try {
        result = await command.handle(params, event);
      } catch (error) {
        await this.serverError(event, error);
        return;
      }

      this.logger.debug("- 命令处理结果", result);

      if (typeof result === "string") {
        await this.safeEcho(event, result);
      } else if (result && typeof result === "object") {
        await this.safeEcho(event, result);
      }
      return;
    }

    await this.serverError(event, firstError);
  }

  private serverError(event: GroupMessageEvent | MessageEvent, error: unknown) {
    // 参数错误，直接反馈
    if (error instanceof CommandParamError) {
      return this.safeEcho(event, error.message);
    }

    // 其他则向用户展示错误追踪ID
    const id = randId();

    this.logger.error(`[${id}] 执行命令时出现错误！`, error);
    return this.safeEcho(event, `啊哈？貌似出了点意外...\nTraceId: ${id}`);
  }

  private findByName(name: string): Command | undefined {
    for (const command of this.registry.values()) {
      if (command.name === name) {
        return command;
      }
    }
    return undefined;
  }

  private parseParams(
    pattern: CommandParamDefinesMatch,
    args: string[],
  ): CommandParams {
    const params: CommandParams = {};

    for (let index = 0; index < pattern.length; index += 1) {
      const [id, param] = pattern[index]!;
      params[id] = param.parse(args[index]!);
    }

    return params;
  }

  private buildUsage(command: Command): string {
    const lines = [];

    if (command.params.length > 0) {
      for (const pattern of command.params) {
        const suffix = pattern.map(([id, define]) => ` ${define.usage(id)}`).join("");
        lines.push(`${command.name}${suffix}`);
      }
    } else {
      lines.push(`${command.name}`);
    }

    if (command.description) {
      lines.push(command.description);
    }

    return lines.join("\n");
  }

  private async safeEcho(
    event: MessageEvent | GroupMessageEvent,
    content: MessageContent,
  ): Promise<void> {
    try {
      await event.echo(content);
    } catch {
      // 发送失败不影响命令流程
    }
  }
}
