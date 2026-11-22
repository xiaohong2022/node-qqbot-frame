import { CommandParam } from "../param.js";

class StringParamImpl extends CommandParam<string> {
  parse(value: string): string {
    return value;
  }
}

/** 字符串参数：支持无空格文本，或使用引号包裹的含空格文本。 */
export const StringParam: CommandParam<string> = new StringParamImpl();
