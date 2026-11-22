/** 命令参数解析错误。 */
export class CommandParamError extends Error {
  override readonly name = "CommandParamError";
}

/**
 * 命令参数。
 *
 * 负责精准匹配参数文本，并将其转换为字面量。
 * 转换失败时应抛出 {@link CommandParamError}，说明错误原因。
 */
export abstract class CommandParam<T = unknown> {
  abstract parse(value: string): T;
  usage(id: string): string {
    return `<${id}>`;
  }
}
