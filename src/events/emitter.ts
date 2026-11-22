/**
 * 轻量级、类型安全的事件发射器。
 *
 * 不依赖 Node.js 内置 EventEmitter，保证框架事件行为完全可控。
 */
export type EventListener<T> = (payload: T) => void;

export class EventEmitter<Events extends object> {
  private readonly listeners = new Map<keyof Events, Set<EventListener<never>>>();

  on<K extends keyof Events>(event: K, listener: EventListener<Events[K]>): this {
    let set = this.listeners.get(event);
    if (!set) {
      set = new Set();
      this.listeners.set(event, set);
    }
    set.add(listener as EventListener<never>);
    return this;
  }

  once<K extends keyof Events>(event: K, listener: EventListener<Events[K]>): this {
    const wrapper: EventListener<Events[K]> = (payload) => {
      this.off(event, wrapper);
      listener(payload);
    };
    return this.on(event, wrapper);
  }

  off<K extends keyof Events>(event: K, listener: EventListener<Events[K]>): this {
    const set = this.listeners.get(event);
    if (!set) {
      return this;
    }
    set.delete(listener as EventListener<never>);
    if (set.size === 0) {
      this.listeners.delete(event);
    }
    return this;
  }

  emit<K extends keyof Events>(event: K, payload: Events[K]): void {
    const set = this.listeners.get(event);
    if (!set) {
      return;
    }
    // 复制一份，避免监听器在回调中增删监听导致迭代行为异常
    for (const listener of [...set]) {
      (listener as EventListener<Events[K]>)(payload);
    }
  }

  removeAllListeners(event?: keyof Events): this {
    if (event === undefined) {
      this.listeners.clear();
    } else {
      this.listeners.delete(event);
    }
    return this;
  }

  listenerCount(event: keyof Events): number {
    return this.listeners.get(event)?.size ?? 0;
  }
}
