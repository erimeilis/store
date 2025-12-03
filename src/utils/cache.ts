import type { Bindings } from '@/types/bindings.js';

/**
 * Cache service using Cloudflare KV
 * Provides TTL-based caching for expensive operations
 */
export class CacheService {
  private kv: KVNamespace | undefined;
  private prefix: string;

  constructor(env: Bindings, prefix = 'cache') {
    this.kv = env.KV;
    this.prefix = prefix;
  }

  /**
   * Check if caching is available
   */
  isAvailable(): boolean {
    return !!this.kv;
  }

  /**
   * Generate cache key with prefix
   */
  private getKey(key: string): string {
    return `${this.prefix}:${key}`;
  }

  /**
   * Get cached value
   * @returns Parsed value or null if not found/expired
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.kv) return null;

    try {
      const value = await this.kv.get(this.getKey(key), 'json');
      return value as T | null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set cached value with TTL
   * @param key - Cache key
   * @param value - Value to cache (will be JSON stringified)
   * @param ttlSeconds - Time to live in seconds (default: 300 = 5 minutes)
   */
  async set<T>(key: string, value: T, ttlSeconds = 300): Promise<boolean> {
    if (!this.kv) return false;

    try {
      await this.kv.put(this.getKey(key), JSON.stringify(value), {
        expirationTtl: ttlSeconds,
      });
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  /**
   * Delete cached value
   */
  async delete(key: string): Promise<boolean> {
    if (!this.kv) return false;

    try {
      await this.kv.delete(this.getKey(key));
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  /**
   * Get or compute value with caching
   * If cached value exists, return it. Otherwise compute, cache, and return.
   */
  async getOrCompute<T>(
    key: string,
    computeFn: () => Promise<T>,
    ttlSeconds = 300
  ): Promise<T> {
    // Try cache first
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Compute value
    const value = await computeFn();

    // Cache the result (fire and forget)
    this.set(key, value, ttlSeconds).catch(() => {});

    return value;
  }

  /**
   * Generate cache key for column values query
   */
  static columnValuesKey(
    columnName: string,
    tableIds: string[],
    filters: Record<string, string>
  ): string {
    const sortedTableIds = [...tableIds].sort().join(',');
    const filterStr = Object.entries(filters)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join('&');
    return `values:${columnName}:${sortedTableIds}:${filterStr}`;
  }
}
