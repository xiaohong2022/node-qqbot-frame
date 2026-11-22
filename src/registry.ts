/**
 * 通用注册表。
 *
 * 每类可实例化对象（命令、按钮等）都通过唯一 ID 注册到自己的注册表中，
 * 注册时完成实例化，之后才可投入使用。
 */
export type Constructor<T> = new () => T;

export class Registry<T> {
  private readonly items = new Map<string, T>();

  constructor(private readonly label: string) {}

  /**
   * 注册并实例化一个对象。
   *
   * @param id 注册表中的唯一 ID
   * @param ctor 无参构造器
   * @param validate 可选校验，在写入注册表前执行
   */
  register(id: string, ctor: Constructor<T>, validate?: (instance: T) => void): T {
    if (!id) {
      throw new Error(`${this.label} 注册 ID 不能为空`);
    }
    if (this.items.has(id)) {
      throw new Error(`${this.label} "${id}" 已注册`);
    }

    const instance = new ctor();
    validate?.(instance);
    this.items.set(id, instance);
    return instance;
  }

  get(id: string): T | undefined {
    return this.items.get(id);
  }

  /** 从注册表移除指定 ID，成功返回 true。 */
  unregister(id: string): boolean {
    return this.items.delete(id);
  }

  has(id: string): boolean {
    return this.items.has(id);
  }

  values(): IterableIterator<T> {
    return this.items.values();
  }

  entries(): IterableIterator<[string, T]> {
    return this.items.entries();
  }

  get size(): number {
    return this.items.size;
  }
}
