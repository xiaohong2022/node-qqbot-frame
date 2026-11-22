import { CommandParam, CommandParamError } from "../param.js";

const INTEGER_PATTERN = /^[+-]?\d+$/;

class IntParamImpl extends CommandParam<number> {
  parse(value: string): number {
    if (!INTEGER_PATTERN.test(value)) {
      throw new CommandParamError(`参数 "${value}" 不是合法的整数`);
    }
    return Number(value);
  }
}

/** 整数参数：匹配 10 进制整数。 */
export const IntParam: CommandParam<number> = new IntParamImpl();
