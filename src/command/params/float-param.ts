import { CommandParam, CommandParamError } from "../param.js";

const FLOAT_PATTERN = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/;

class FloatParamImpl extends CommandParam<number> {
  parse(value: string): number {
    if (!FLOAT_PATTERN.test(value)) {
      throw new CommandParamError(`参数 "${value}" 不是合法的浮点数`);
    }
    const result = Number(value);
    if (!Number.isFinite(result)) {
      throw new CommandParamError(`参数 "${value}" 不是合法的浮点数`);
    }
    return result;
  }
}

/** 浮点数参数：匹配任意 10 进制数字。 */
export const FloatParam: CommandParam<number> = new FloatParamImpl();
