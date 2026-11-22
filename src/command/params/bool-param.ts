import { CommandParam, CommandParamError } from "../param.js";

const TRUE_VALUES = new Set(["1", "true", "on", "yes", "y"]);
const FALSE_VALUES = new Set(["0", "false", "off", "no", "n"]);

class BoolParamImpl extends CommandParam<boolean> {
  parse(value: string): boolean {
    const normalized = value.toLowerCase();
    if (TRUE_VALUES.has(normalized)) {
      return true;
    }
    if (FALSE_VALUES.has(normalized)) {
      return false;
    }
    throw new CommandParamError(
      `参数 "${value}" 不是合法的布尔值（可用：1/0、true/false、on/off）`,
    );
  }
}

/** 布尔值参数：1/true/on 等为 true，0/false/off 等为 false。 */
export const BoolParam: CommandParam<boolean> = new BoolParamImpl();
