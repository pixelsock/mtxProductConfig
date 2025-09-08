export abstract class BaseService {
  protected cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  protected readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes default

  protected async withCaching<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = this.CACHE_TTL
  ): Promise<T> {
    const cached = this.cache.get(key);
    const now = Date.now();

    if (cached && (now - cached.timestamp) < cached.ttl) {
      return cached.data;
    }

    try {
      const data = await fetcher();
      this.cache.set(key, { data, timestamp: now, ttl });
      return data;
    } catch (error) {
      if (cached) {
        console.warn(`Service ${this.constructor.name}: Using stale cache for ${key}`, error);
        return cached.data;
      }
      throw error;
    }
  }

  protected clearCache(pattern?: string): void {
    if (pattern) {
      const regex = new RegExp(pattern);
      for (const [key] of this.cache) {
        if (regex.test(key)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  protected log(message: string, data?: any): void {
    if (import.meta.env.DEV) {
      console.log(`[${this.constructor.name}] ${message}`, data || '');
    }
  }

  protected error(message: string, error?: any): void {
    console.error(`[${this.constructor.name}] ${message}`, error || '');
  }
}

export interface ServiceEvent<T = any> {
  type: string;
  data: T;
  timestamp: number;
}

export abstract class EventEmittingService extends BaseService {
  private listeners = new Map<string, Array<(event: ServiceEvent) => void>>();

  protected emit<T>(type: string, data: T): void {
    const event: ServiceEvent<T> = { type, data, timestamp: Date.now() };
    const listeners = this.listeners.get(type) || [];
    listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        this.error(`Error in event listener for ${type}`, error);
      }
    });
  }

  public on(type: string, listener: (event: ServiceEvent) => void): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type)!.push(listener);

    return () => this.off(type, listener);
  }

  public off(type: string, listener: (event: ServiceEvent) => void): void {
    const listeners = this.listeners.get(type);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }
}