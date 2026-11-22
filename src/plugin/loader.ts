import { createJiti } from "jiti";

/**
 * 加载 `.ts` 插件模块。
 *
 * 每次加载使用独立的 jiti 实例并禁用模块缓存，
 * 保证卸载后重新安装时能读取最新代码。
 */
export async function importPluginModule(
  file: string,
): Promise<Record<string, unknown>> {
  const jiti = createJiti(import.meta.url, {
    moduleCache: false,
    interopDefault: false,
  });

  return (await jiti.import(file)) as Record<string, unknown>;
}
