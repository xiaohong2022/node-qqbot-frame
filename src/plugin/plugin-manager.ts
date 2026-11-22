import type { Dirent } from "node:fs";
import { readdir, stat } from "node:fs/promises";
import { basename, isAbsolute, resolve } from "node:path";
import type { App } from "../app.js";
import type { Logger } from "../logger.js";
import type { Constructor } from "../registry.js";
import {
  normalizeListScope,
  type ListScope,
  type ListScopeInput,
} from "../scope/list-scope.js";
import { BasePlugin } from "./base-plugin.js";
import { BULITIN_PLUGINS } from "./bulitin/index.js";
import { importPluginModule } from "./loader.js";
import { PluginContext } from "./plugin-context.js";
import type {
  PluginInfo,
  PluginManagerOptions,
} from "./types.js";

interface InstalledPlugin extends PluginInfo {
  ctx: PluginContext;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function isPluginClass(value: unknown): value is Constructor<BasePlugin> {
  return typeof value === "function" && value.prototype instanceof BasePlugin;
}

function resolvePluginClass(
  module: Record<string, unknown>,
): Constructor<BasePlugin> {
  if (isPluginClass(module.default)) {
    return module.default;
  }

  const candidates = Object.values(module).filter(isPluginClass);
  if (candidates.length === 1) {
    return candidates[0]!;
  }
  if (candidates.length === 0) {
    throw new Error("插件文件必须导出一个继承 BasePlugin 的类");
  }
  throw new Error(
    "插件文件导出了多个 BasePlugin 子类，请使用 default 导出指定插件类",
  );
}

/**
 * 插件管理器。
 *
 * 负责 `.ts` 插件的安装、卸载与自动加载，并通过 {@link PluginContext}
 * 追踪插件注册的命令、按钮与事件监听，卸载时统一清理。
 */
export class PluginManager {
  readonly root: string;
  readonly ready: Promise<void>;

  private readonly logger: Logger;
  private readonly filter: ListScope;
  private readonly plugins = new Map<string, InstalledPlugin>();

  constructor(
    private readonly app: App,
    options: PluginManagerOptions = {},
  ) {
    this.root = resolve(options.root ?? resolve(process.cwd(), "plugin"));
    this.logger = app.logger.child("plugin");

    const autoLoad = options.autoLoad ?? false;
    this.filter = normalizeListScope(autoLoad === false ? true : autoLoad);
    this.ready =
      autoLoad === false
        ? Promise.resolve()
        : this.loadAll().then(() => undefined);
  }

  /** 安装（加载）插件；`builtin:` 开头时安装内置插件，其余按文件路径安装。 */
  async install(file: string): Promise<PluginInfo> {
    if (file.startsWith("builtin:")) {
      return this.installBuiltin(file);
    }

    const absolute = isAbsolute(file) ? file : resolve(this.root, file);

    if (!absolute.endsWith(".ts") || absolute.endsWith(".d.ts")) {
      throw new Error(`插件必须是 .ts 文件：${absolute}`);
    }

    let fileStat;
    try {
      fileStat = await stat(absolute);
    } catch (error) {
      throw new Error(`无法读取插件文件 ${absolute}：${errorMessage(error)}`);
    }
    if (!fileStat.isFile()) {
      throw new Error(`插件路径不是文件：${absolute}`);
    }

    for (const info of this.plugins.values()) {
      if (info.file === absolute) {
        throw new Error(`插件文件已安装：${absolute}`);
      }
    }

    const module = await importPluginModule(absolute);
    const PluginClass = resolvePluginClass(module);
    const instance = new PluginClass();

    const customId =
      typeof instance.id === "string" ? instance.id.trim() : "";
    const id = customId || basename(absolute, ".ts");

    return this.installInstance(instance, id, absolute, absolute);
  }

  /** 安装内置插件；内置插件默认不装载，必须显式调用 install。 */
  private async installBuiltin(builtinId: string): Promise<PluginInfo> {
    const PluginClass = BULITIN_PLUGINS.get(builtinId);
    if (!PluginClass) {
      throw new Error(`未知内置插件：${builtinId}`);
    }

    const existing = this.plugins.get(builtinId);
    if (existing) {
      throw new Error(`插件 ID "${builtinId}" 已被 ${existing.file} 使用`);
    }

    const instance = new PluginClass();
    const id = typeof instance.id === "string" ? instance.id.trim() : "";

    if (id !== builtinId) {
      throw new Error(
        `内置插件 ID 不一致：期望 "${builtinId}"，实际 "${id}"`,
      );
    }

    return this.installInstance(instance, builtinId, builtinId, undefined);
  }

  private async installInstance(
    instance: BasePlugin,
    id: string,
    file: string,
    contextFile: string | undefined,
  ): Promise<PluginInfo> {
    const existing = this.plugins.get(id);
    if (existing) {
      throw new Error(`插件 ID "${id}" 已被 ${existing.file} 使用`);
    }

    const ctx = new PluginContext(this.app, id, contextFile);

    try {
      await instance.onInstall?.(ctx);
    } catch (error) {
      ctx.dispose();
      this.logger.error(
        `安装 "${id}" 失败：${errorMessage(error)}`,
      );
      throw error;
    }

    const installed: InstalledPlugin = {
      id,
      file,
      instance,
      installedAt: Date.now(),
      ctx,
    };

    this.plugins.set(id, installed);
    this.logger.info(`已安装 "${id}"（${file}）`);
    return this.toInfo(installed);
  }

  /** 卸载插件；参数可以是插件 ID 或文件路径。 */
  async uninstall(idOrFile: string): Promise<boolean> {
    const installed = this.resolveInstalled(idOrFile);
    if (!installed) {
      return false;
    }

    let failure: unknown;
    try {
      await installed.instance.onUninstall?.(installed.ctx);
    } catch (error) {
      failure = error;
      this.logger.error(
        `卸载 "${installed.id}" 时 onUninstall 失败：${errorMessage(error)}`,
      );
    }

    installed.ctx.dispose();
    this.plugins.delete(installed.id);
    this.logger.info(`已卸载 "${installed.id}"`);

    if (failure) {
      throw failure;
    }
    return true;
  }

  /**
   * 扫描并安装插件根目录下的 `.ts` 文件（不递归）。
   *
   * 未传 `filter` 时使用 `autoLoad` 配置对应的过滤规则。
   */
  async loadAll(filter?: ListScopeInput): Promise<PluginInfo[]> {
    const scope =
      filter === undefined ? this.filter : normalizeListScope(filter);

    let entries: Dirent[];
    try {
      entries = await readdir(this.root, { withFileTypes: true });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        this.logger.warn(`插件目录不存在：${this.root}`);
        return [];
      }
      throw error;
    }

    const files = entries
      .filter(
        (entry) =>
          entry.isFile() &&
          entry.name.endsWith(".ts") &&
          !entry.name.endsWith(".d.ts"),
      )
      .map((entry) => entry.name)
      .sort();

    const installed: PluginInfo[] = [];
    for (const name of files) {
      const fileId = name.slice(0, -".ts".length);
      if (!scope.check(fileId)) {
        continue;
      }

      try {
        installed.push(await this.install(resolve(this.root, name)));
      } catch (error) {
        this.logger.error(
          `加载 "${name}" 失败：${errorMessage(error)}`,
        );
      }
    }

    return installed;
  }

  /** 卸载全部插件。 */
  async uninstallAll(): Promise<void> {
    let failure: unknown;

    for (const id of [...this.plugins.keys()]) {
      try {
        await this.uninstall(id);
      } catch (error) {
        failure ??= error;
      }
    }

    if (failure) {
      throw failure;
    }
  }

  /** 当前已安装插件列表。 */
  list(): PluginInfo[] {
    return [...this.plugins.values()].map((info) => this.toInfo(info));
  }

  /** 是否已安装指定 ID。 */
  has(id: string): boolean {
    return this.plugins.has(id);
  }

  /** 获取已安装插件信息。 */
  get(id: string): PluginInfo | undefined {
    const installed = this.plugins.get(id);
    return installed ? this.toInfo(installed) : undefined;
  }

  private resolveInstalled(idOrFile: string): InstalledPlugin | undefined {
    const byId = this.plugins.get(idOrFile);
    if (byId) {
      return byId;
    }

    const absolute = isAbsolute(idOrFile)
      ? idOrFile
      : resolve(this.root, idOrFile);

    for (const installed of this.plugins.values()) {
      if (installed.file === absolute) {
        return installed;
      }
    }
    return undefined;
  }

  private toInfo(installed: InstalledPlugin): PluginInfo {
    return {
      id: installed.id,
      file: installed.file,
      instance: installed.instance,
      installedAt: installed.installedAt,
    };
  }
}
