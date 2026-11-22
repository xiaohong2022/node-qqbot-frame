import { CommandParam, CommandParamError } from "../param.js";

class JsonParamImpl extends CommandParam<unknown> {
  parse(value: string): unknown {
    let parsed: unknown;
    try {
      parsed = JSON.parse(value);
    } catch {
      throw new CommandParamError(`参数 "${value}" 不合法`);
    }

    if (parsed === null || typeof parsed !== "object") {
      throw new CommandParamError(`参数 "${value}" 必须是列表或对象`);
    }

    return parsed;
  }
}

/** JSON 参数：仅接受 JSON 列表或对象。 */
export const JsonParam: CommandParam<unknown> = new JsonParamImpl();
