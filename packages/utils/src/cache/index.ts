/**
 * Caching utility functions
 */

/**
 * Simple in-memory cache with TTL
 */
export class MemoryCache<T> {
  private cache = new Map<string, { value: T; expiry: number }>();

  constructor(private defaultTtlMs: number = 60000) {}

  get(key: string): T | undefined {
    const item = this.cache.get(key);
    if (!item) return undefined;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return undefined;
    }

    return item.value;
  }

  set(key: string, value: T, ttlMs?: number): void {
    const expiry = Date.now() + (ttlMs ?? this.defaultTtlMs);
    this.cache.set(key, { value, expiry });
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  has(key: string): boolean {
    const value = this.get(key);
    return value !== undefined;
  }
}

/**
 * Memoize a function with optional cache key generator
 */
export const memoize = <TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => TResult,
  keyGenerator?: (...args: TArgs) => string
): ((...args: TArgs) => TResult) => {
  const cache = new Map<string, TResult>();

  return (...args: TArgs): TResult => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};
