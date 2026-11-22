import { ListScope, normalizeListScope, type ListScopeInput } from "./list-scope.js";

/**
 * 命令作用域。
 *
 * - `c2c`：C2C 消息的 openid 列表作用域，默认通过所有
 * - `group`：Group 消息的 openid 列表作用域，默认通过所有
 * - `only_admin`：仅管理员（仅 Group 环境生效），默认 `false`
 */
export interface CommandScopeInput {
  c2c?: ListScope | ListScopeInput;
  group?: ListScope | ListScopeInput;
  only_admin?: boolean;
}

export class CommandScope {
  readonly c2c: ListScope;
  readonly group: ListScope;
  readonly only_admin: boolean;

  constructor(input: CommandScopeInput = {}) {
    this.c2c = normalizeListScope(input.c2c);
    this.group = normalizeListScope(input.group);
    this.only_admin = input.only_admin ?? false;
  }

  check(kind: "c2c" | "group", openid: string, isAdmin = false): boolean {
    const scope = kind === "c2c" ? this.c2c : this.group;
    if (!scope.check(openid)) {
      return false;
    }
    if (kind === "group" && this.only_admin && !isAdmin) {
      return false;
    }
    return true;
  }
}

export function normalizeCommandScope(
  input: CommandScope | CommandScopeInput | undefined,
): CommandScope {
  return input instanceof CommandScope ? input : new CommandScope(input);
}
