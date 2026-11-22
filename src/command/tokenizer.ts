/**
 * 将命令文本切分为参数 token。
 *
 * - 使用空白字符作为分隔符
 * - 支持用 `"` 或 `'` 包裹包含空格的参数
 * - `{` / `[` 开头的参数按 JSON 处理：保留其中的双引号与空白，
 *   直到最外层括号闭合
 */
export function tokenizeCommand(input: string): string[] {
  const tokens: string[] = [];
  let current = "";
  let hasToken = false;
  let quote: '"' | "'" | null = null;
  const jsonStack: string[] = [];
  let jsonInString = false;
  let jsonEscaped = false;

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i]!;

    // JSON 参数：原样保留字符，只根据括号层级判断结束。
    if (jsonStack.length > 0) {
      current += char;

      if (jsonInString) {
        if (jsonEscaped) {
          jsonEscaped = false;
        } else if (char === "\\") {
          jsonEscaped = true;
        } else if (char === '"') {
          jsonInString = false;
        }
        continue;
      }

      if (char === '"') {
        jsonInString = true;
        continue;
      }

      if (char === "{" || char === "[") {
        jsonStack.push(char);
        continue;
      }

      if (char === "}" || char === "]") {
        const open = jsonStack.pop();
        if ((open === "{") !== (char === "}")) {
          throw new Error("JSON 参数中的括号不匹配");
        }
        if (jsonStack.length === 0) {
          tokens.push(current);
          current = "";
          hasToken = false;
        }
      }
      continue;
    }

    if (quote) {
      if (char === quote) {
        quote = null;
        continue;
      }
      current += char;
      continue;
    }

    if (char === '"' || char === "'") {
      quote = char;
      hasToken = true;
      continue;
    }

    if ((char === "{" || char === "[") && !hasToken) {
      jsonStack.push(char);
      current += char;
      hasToken = true;
      continue;
    }

    if (/\s/.test(char)) {
      if (hasToken) {
        tokens.push(current);
        current = "";
        hasToken = false;
      }
      continue;
    }

    current += char;
    hasToken = true;
  }

  if (quote) {
    throw new Error("命令内容中存在未闭合的引号");
  }

  if (jsonStack.length > 0) {
    throw new Error("命令内容中存在未闭合的 JSON 参数");
  }

  if (hasToken) {
    tokens.push(current);
  }

  return tokens;
}
