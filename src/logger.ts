/**
 * 日志输出目标。
 *
 * `info` 与 `error` 必须提供，`warn` 与 `debug` 可选；
 * 未提供的级别会被静默忽略。
 */
export interface LoggerTarget {
  info(message: unknown, ...args: unknown[]): void;
  error(message: unknown, ...args: unknown[]): void;
  warn?(message: unknown, ...args: unknown[]): void;
  debug?(message: unknown, ...args: unknown[]): void;
}

/**
 * 带名称前缀的日志器。
 *
 * 所有输出均带 `[name] [LEVEL]` 前缀；`child()` 使用同一个
 * 日志对象创建新的名称。
 */
export class Logger {
  constructor(
    private readonly target: LoggerTarget,
    readonly name: string,
  ) {}

  info(message: unknown, ...args: unknown[]): void {
    this.target.info(`[${this.name}]`, message, ...args);
  }

  debug(message: unknown, ...args: unknown[]): void {
    this.target.debug?.(`[${this.name}]`, message, ...args);
  }

  warn(message: unknown, ...args: unknown[]): void {
    this.target.warn?.(`[${this.name}]`, message, ...args);
  }

  error(message: unknown, ...args: unknown[]): void {
    this.target.error(`[${this.name}]`, message, ...args);
  }

  /** 使用同一个日志对象创建子日志器。 */
  child(name: string): Logger {
    return new Logger(this.target, name);
  }
}
