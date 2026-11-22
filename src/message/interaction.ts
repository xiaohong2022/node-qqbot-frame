function escapeAttribute(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * 文本互动工具。
 *
 * 生成可插入消息文本的 `<qqbot-xxx />` 标记。
 */
export function at(openid: string): string {
  return `<qqbot-at-user id="${escapeAttribute(openid)}" />`;
}

export function at_all(): string {
  return "<qqbot-at-everyone />";
}

export function cmd_enter(text: string): string {
  return `<qqbot-cmd-enter text="${escapeAttribute(text)}" />`;
}

export function cmd_input(text: string, show: string, ref = false): string {
  return `<qqbot-cmd-input text="${escapeAttribute(text)}" show="${escapeAttribute(show)}" reference="${ref}" />`;
}
