import type { App } from "../../app.js";
import type { EventListener } from "../../events/emitter.js";
import type { AppEventMap } from "../../events/types.js";

/** 已追踪的事件监听。 */
interface TrackedEntry {
  event: keyof AppEventMap;
  /** 插件传入的原始监听器。 */
  source: EventListener<unknown>;
  /** 实际注册到 EventEmitter 的监听器（once 时为包装器）。 */
  listener: EventListener<unknown>;
}

/** 插件事件监听入口，全部监听器可被统一移除。 */
export class PluginEventRegistry {
  private readonly entries = new Set<TrackedEntry>();

  constructor(private readonly app: App) {}

  /** 监听事件。 */
  on<K extends keyof AppEventMap>(
    event: K,
    listener: EventListener<AppEventMap[K]>,
  ): this {
    const entry: TrackedEntry = {
      event,
      source: listener as unknown as EventListener<unknown>,
      listener: listener as unknown as EventListener<unknown>,
    };

    this.app.events.on(event, listener);
    this.entries.add(entry);
    return this;
  }

  /** 只监听一次。 */
  once<K extends keyof AppEventMap>(
    event: K,
    listener: EventListener<AppEventMap[K]>,
  ): this {
    let entry: TrackedEntry | undefined;

    const wrapper: EventListener<AppEventMap[K]> = (payload) => {
      if (entry) {
        this.detach(entry);
      }
      listener(payload);
    };

    entry = {
      event,
      source: listener as unknown as EventListener<unknown>,
      listener: wrapper as unknown as EventListener<unknown>,
    };

    this.entries.add(entry);
    this.app.events.on(event, wrapper);
    return this;
  }

  /** 移除监听器。 */
  off<K extends keyof AppEventMap>(
    event: K,
    listener: EventListener<AppEventMap[K]>,
  ): this {
    const source = listener as unknown as EventListener<unknown>;

    for (const entry of [...this.entries]) {
      if (entry.event === event && entry.source === source) {
        this.detach(entry);
      }
    }
    return this;
  }

  /** 移除本插件的全部监听器，可按事件过滤。 */
  removeAllListeners(event?: keyof AppEventMap): this {
    for (const entry of [...this.entries]) {
      if (event === undefined || entry.event === event) {
        this.detach(entry);
      }
    }
    return this;
  }

  /** 框架内部：移除该插件的全部监听器。 */
  dispose(): void {
    this.removeAllListeners();
  }

  private detach(entry: TrackedEntry): void {
    if (!this.entries.delete(entry)) {
      return;
    }

    type Off = (
      event: keyof AppEventMap,
      listener: EventListener<unknown>,
    ) => void;

    (this.app.events.off as unknown as Off)(entry.event, entry.listener);
  }
}
