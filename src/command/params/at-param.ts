import { CommandParam, CommandParamError } from "../param.js";

const AT_PATTERN = /^<@([^>]+)>$/;

class AtParamImpl extends CommandParam<string> {
  parse(value: string): string {
    const matched = AT_PATTERN.exec(value);
    if (!matched) {
      throw new CommandParamError(
        `参数 "${value}" 不是合法的 @ 标记`,
      );
    }
    return matched[1]!;
  }
}

/** At 参数：匹配 `<@openid>`，转换为其中的 openid。 */
export const AtParam: CommandParam<string> = new AtParamImpl();
