import type {
  GroupMessageEvent,
  MessageEvent,
} from "../events/bulitin/index.js";
import type { Message } from "../message/types.js";
import type { CommandScope, CommandScopeInput } from "../scope/command-scope.js";
import type { CommandParam } from "./param.js";

/** 一个参数定义：[参数 id, 参数实例]。 */
export type CommandParamDefine = [string, CommandParam];

/** 一组参数配对定义。 */
export type CommandParamDefinesMatch = CommandParamDefine[];

/** handle() 收到的已解析参数。 */
export type CommandParams = Record<string, unknown>;

/** 命令处理结果。 */
export type CommandHandleResult = void | string | Message;

/**
 * 命令抽象类。
 *
 * 命令通过 `app.commands.register(id, CommandClass)` 注册后生效。
 */
export abstract class Command {
  /** 命令名称，例如 `/my`。 */
  abstract name: string;

  /** 可接受的参数配对列表。 */
  params: CommandParamDefinesMatch[] = [];

  /** 命令描述。 */
  description?: string;

  /** 命令作用域。 */
  scope: CommandScope | CommandScopeInput = {};

  /** 在群聊情况下，是否仅允许 @机器人 的消息调用。 */
  only_at = false;

  /** 处理命令。 */
  abstract handle(
    params: CommandParams,
    event: MessageEvent | GroupMessageEvent,
  ): CommandHandleResult | Promise<CommandHandleResult>;
}
