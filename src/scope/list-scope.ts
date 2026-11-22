/**
 * 列表作用域。
 *
 * - 不传 / `{}` / `true`：默认通过所有
 * - `false`：全部不通过
 * - `string[]`：白名单
 * - `{ whitelist, blacklist }`：同时支持白名单与黑名单
 */
export type ListScopeInput =
  | boolean
  | string[]
  | {
      whitelist?: string[];
      blacklist?: string[];
    };

export class ListScope {
  private readonly mode: "all" | "none" | "list";
  private readonly whitelist?: ReadonlySet<string>;
  private readonly blacklist?: ReadonlySet<string>;

  constructor(input: ListScopeInput = {}) {
    if (input === true) {
      this.mode = "all";
      return;
    }
    if (input === false) {
      this.mode = "none";
      return;
    }
    if (Array.isArray(input)) {
      this.mode = "list";
      this.whitelist = new Set(input);
      return;
    }

    this.mode = "list";
    if (input.whitelist) {
      this.whitelist = new Set(input.whitelist);
    }
    if (input.blacklist) {
      this.blacklist = new Set(input.blacklist);
    }
  }

  check(openid: string): boolean {
    if (this.mode === "all") {
      return true;
    }
    if (this.mode === "none") {
      return false;
    }
    if (this.whitelist && !this.whitelist.has(openid)) {
      return false;
    }
    if (this.blacklist?.has(openid)) {
      return false;
    }
    return true;
  }
}

export function normalizeListScope(input: ListScope | ListScopeInput | undefined): ListScope {
  return input instanceof ListScope ? input : new ListScope(input);
}
