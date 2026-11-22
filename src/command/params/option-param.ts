import { CommandParam, CommandParamError } from "../param.js";

class OptionParamImpl extends CommandParam<string> {
  constructor(private readonly options: Record<string, string>) {
    super();
  }

  parse(value: string): string {
    for (const [key, label] of Object.entries(this.options)) {
      if (label === value) {
        return key;
      }
    }

    const labels = Object.values(this.options).join("、");
    throw new CommandParamError(
      `参数 "${value}" 不在可选项中（可选：${labels}）`,
    );
  }

  override usage(): string{
    return `(${Object.values(this.options).join('|')})`
  }
}

/**
 * Option 参数：在一个列表内选择。
 *
 * 配置为 `{ key: label }`，输入 label，转换为 key。
 */
export function OptionParam(options: Record<string, string>): CommandParam<string> {
  return new OptionParamImpl(options);
}
