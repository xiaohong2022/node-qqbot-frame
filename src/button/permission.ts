import type { IButtonPermission } from "../message/types.js";
import {
  normalizeWhiteListScope,
  type WhiteListScope,
  type WhiteListScopeInput,
} from "../scope/white-list-scope.js";

/**
 * 将按钮作用域映射为平台权限。
 *
 * - `only_admin` → 管理员
 * - `ids === true` → 所有人
 * - `ids === false` → 指定用户（空列表）
 * - `ids` 为数组 → 指定用户
 */
export function buildButtonPermission(
  scope: WhiteListScope | WhiteListScopeInput | undefined,
): IButtonPermission {
  const normalized = normalizeWhiteListScope(scope);

  if (normalized.only_admin) {
    return { type: 1 };
  }
  if (normalized.ids === true) {
    return { type: 2 };
  }
  if (normalized.ids === false) {
    return { type: 0, specify_user_ids: [] };
  }
  return { type: 0, specify_user_ids: [...normalized.ids] };
}
