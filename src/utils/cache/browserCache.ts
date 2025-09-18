/**
 * Browser-based cache utility with TTL support
 * Uses sessionStorage for temporary caching and localStorage for persistent caching
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
  key: string;
}

interface CacheOptions {
  ttl?: number; // Default 5 minutes
  persistent?: boolean; // Use localStorage instead of sessionStorage
  maxSize?: number; // Maximum number of entries (default 100)
}

class BrowserCache {
  private defaultTTL = 5 * 60 * 1000; // 5 minutes
  private maxSize = 100;
  private keyPrefix = 'mtx_cache_';

  /**
   * Get storage based on persistence option
   */
  private getStorage(persistent: boolean = false): Storage {
    return persistent ? localStorage : sessionStorage;
  }

  /**
   * Generate cache key with prefix
   */
  private getCacheKey(key: string): string {
    return `${this.keyPrefix}${key}`;
  }

  /**
   * Check if cache entry is expired
   */
  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  /**
   * Clean up expired entries
   */
  private cleanup(storage: Storage): void {
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key && key.startsWith(this.keyPrefix)) {
        try {
          const entry = JSON.parse(storage.getItem(key) || '{}') as CacheEntry<any>;
          if (this.isExpired(entry)) {
            keysToRemove.push(key);
          }
        } catch (error) {
          // Invalid entry, remove it
          keysToRemove.push(key);
        }
      }
    }

    keysToRemove.forEach(key => storage.removeItem(key));
  }

  /**
   * Enforce cache size limit
   */
  private enforceSizeLimit(storage: Storage): void {
    const cacheKeys: Array<{ key: string; timestamp: number }> = [];
    
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key && key.startsWith(this.keyPrefix)) {
        try {
          const entry = JSON.parse(storage.getItem(key) || '{}') as CacheEntry<any>;
          cacheKeys.push({ key, timestamp: entry.timestamp });
        } catch (error) {
          // Invalid entry, will be cleaned up
        }
      }
    }

    if (cacheKeys.length > this.maxSize) {
      // Sort by timestamp (oldest first) and remove excess
      cacheKeys.sort((a, b) => a.timestamp - b.timestamp);
      const toRemove = cacheKeys.slice(0, cacheKeys.length - this.maxSize);
      toRemove.forEach(({ key }) => storage.removeItem(key));
    }
  }

  /**
   * Set cache entry
   */
  set<T>(key: string, data: T, options: CacheOptions = {}): void {
    const {
      ttl = this.defaultTTL,
      persistent = false,
      maxSize = this.maxSize
    } = options;

    const storage = this.getStorage(persistent);
    const cacheKey = this.getCacheKey(key);

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      key: cacheKey
    };

    try {
      storage.setItem(cacheKey, JSON.stringify(entry));
      
      // Cleanup and enforce size limits periodically
      if (Math.random() < 0.1) { // 10% chance to cleanup
        this.cleanup(storage);
        this.enforceSizeLimit(storage);
      }
    } catch (error) {
      console.warn('Cache storage failed:', error);
      // If storage is full, try to cleanup and retry
      this.cleanup(storage);
      this.enforceSizeLimit(storage);
      try {
        storage.setItem(cacheKey, JSON.stringify(entry));
      } catch (retryError) {
        console.error('Cache storage failed after cleanup:', retryError);
      }
    }
  }

  /**
   * Get cache entry
   */
  get<T>(key: string, persistent: boolean = false): T | null {
    const storage = this.getStorage(persistent);
    const cacheKey = this.getCacheKey(key);

    try {
      const item = storage.getItem(cacheKey);
      if (!item) return null;

      const entry = JSON.parse(item) as CacheEntry<T>;
      
      if (this.isExpired(entry)) {
        storage.removeItem(cacheKey);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.warn('Cache retrieval failed:', error);
      storage.removeItem(cacheKey);
      return null;
    }
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string, persistent: boolean = false): boolean {
    return this.get(key, persistent) !== null;
  }

  /**
   * Remove specific cache entry
   */
  delete(key: string, persistent: boolean = false): void {
    const storage = this.getStorage(persistent);
    const cacheKey = this.getCacheKey(key);
    storage.removeItem(cacheKey);
  }

  /**
   * Clear all cache entries
   */
  clear(persistent: boolean = false): void {
    const storage = this.getStorage(persistent);
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key && key.startsWith(this.keyPrefix)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => storage.removeItem(key));
  }

  /**
   * Get cache statistics
   */
  getStats(persistent: boolean = false): {
    totalEntries: number;
    expiredEntries: number;
    totalSize: number;
    oldestEntry: number | null;
    newestEntry: number | null;
  } {
    const storage = this.getStorage(persistent);
    let totalEntries = 0;
    let expiredEntries = 0;
    let totalSize = 0;
    let oldestEntry: number | null = null;
    let newestEntry: number | null = null;

    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key && key.startsWith(this.keyPrefix)) {
        const item = storage.getItem(key);
        if (item) {
          totalSize += item.length;
          try {
            const entry = JSON.parse(item) as CacheEntry<any>;
            totalEntries++;
            
            if (this.isExpired(entry)) {
              expiredEntries++;
            }

            if (oldestEntry === null || entry.timestamp < oldestEntry) {
              oldestEntry = entry.timestamp;
            }
            if (newestEntry === null || entry.timestamp > newestEntry) {
              newestEntry = entry.timestamp;
            }
          } catch (error) {
            // Invalid entry
            expiredEntries++;
          }
        }
      }
    }

    return {
      totalEntries,
      expiredEntries,
      totalSize,
      oldestEntry,
      newestEntry
    };
  }

  /**
   * Get or set pattern - fetch data if not cached
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const cached = this.get<T>(key, options.persistent);
    if (cached !== null) {
      console.log(`Cache hit for key: ${key}`);
      return cached;
    }

    console.log(`Cache miss for key: ${key}, fetching...`);
    const data = await fetcher();
    this.set(key, data, options);
    return data;
  }

  /**
   * Invalidate cache entries by pattern
   */
  invalidatePattern(pattern: string, persistent: boolean = false): void {
    const storage = this.getStorage(persistent);
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key && key.startsWith(this.keyPrefix) && key.includes(pattern)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => storage.removeItem(key));
    console.log(`Invalidated ${keysToRemove.length} cache entries matching pattern: ${pattern}`);
  }
}

// Export singleton instance
export const browserCache = new BrowserCache();

// Export cache key generators for consistent naming
export const cacheKeys = {
  productLines: () => 'product_lines_all',
  
  configurationOptions: (productLineId?: string | number, selections?: Record<string, any>) => {
    const plId = productLineId || 'all'
    const selectionsHash = selections && Object.keys(selections).length > 0 
      ? btoa(JSON.stringify(selections)).slice(0, 16)
      : 'none'
    return `config_options_${plId}_${selectionsHash}`
  },
  
  matchingSKUs: (configuration: any) => {
    const configHash = btoa(JSON.stringify(configuration)).slice(0, 16)
    return `matching_skus_${configHash}_all`
  },
  
  optionRecords: (table: string, ids: number[]) => {
    const idsHash = btoa(JSON.stringify(ids.sort())).slice(0, 16)
    return `option_records_${table}_${idsHash}`
  },
  
  configurationUI: () => 'configuration_ui',
  
  rules: () => 'rules'
};

export default browserCache;
