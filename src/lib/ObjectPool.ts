// Object pool for better memory management during frenzy
export class ObjectPool<T> {
  private pool: T[] = [];
  private createFn: () => T;

  constructor(createFn: () => T, initialSize = 20) {
    this.createFn = createFn;
    // Pre-allocate objects
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(createFn());
    }
  }

  get(): T {
    return this.pool.pop() || this.createFn();
  }

  release(obj: T): void {
    if (this.pool.length < 50) {
      // Cap pool size
      this.pool.push(obj);
    }
  }
}
