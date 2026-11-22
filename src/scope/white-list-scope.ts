/**
 * 白名单作用域（用于按钮）。
 *
 * - `ids`：`true` 通过所有，`false` 都不通过，数组为 openid 白名单
 * - `only_admin`：仅管理员（在 Group 环境下），默认 `false`
 *
 * 说明：`only_admin` 在按钮构建时映射为平台 `action.permission`，
 * 点击时框架只校验 `ids`。
 */
export type WhiteListIdsInput = boolean | string[];

export interface WhiteListScopeInput {
  ids?: WhiteListIdsInput;
  only_admin?: boolean;
}

export class WhiteListScope {
  readonly ids: WhiteListIdsInput;
  readonly only_admin: boolean;

  constructor(input: WhiteListScopeInput = {}) {
    this.ids = input.ids ?? true;
    this.only_admin = input.only_admin ?? false;
  }

  check(openid: string): boolean {
    if (this.ids === true) {
      return true;
    }
    if (this.ids === false) {
      return false;
    }
    return this.ids.includes(openid);
  }
}

export function normalizeWhiteListScope(
  input: WhiteListScope | WhiteListScopeInput | undefined,
): WhiteListScope {
  return input instanceof WhiteListScope ? input : new WhiteListScope(input);
}
