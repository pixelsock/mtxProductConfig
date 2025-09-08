// Debug Logger Service - Centralized debugging system for the app

export interface DebugConfig {
  enabled: boolean;
  categories: {
    rules: boolean;
    sku: boolean;
    products: boolean;
    config: boolean;
    api: boolean;
  };
}

export class DebugLogger {
  private static instance: DebugLogger;
  private config: DebugConfig;

  private constructor() {
    this.config = {
      enabled: process.env.NODE_ENV === 'development',
      categories: {
        rules: false,
        sku: false,
        products: false,
        config: false,
        api: false,
      }
    };
  }

  public static getInstance(): DebugLogger {
    if (!DebugLogger.instance) {
      DebugLogger.instance = new DebugLogger();
    }
    return DebugLogger.instance;
  }

  public configure(config: Partial<DebugConfig>): void {
    this.config = { ...this.config, ...config };
  }

  public enableCategory(category: keyof DebugConfig['categories']): void {
    this.config.categories[category] = true;
  }

  public disableCategory(category: keyof DebugConfig['categories']): void {
    this.config.categories[category] = false;
  }

  public rules(message: string, data?: any): void {
    this.log('rules', '🔧', message, data);
  }

  public sku(message: string, data?: any): void {
    this.log('sku', '📝', message, data);
  }

  public products(message: string, data?: any): void {
    this.log('products', '📦', message, data);
  }

  public config(message: string, data?: any): void {
    this.log('config', '⚙️', message, data);
  }

  public api(message: string, data?: any): void {
    this.log('api', '🌐', message, data);
  }

  private log(category: keyof DebugConfig['categories'], icon: string, message: string, data?: any): void {
    if (!this.config.enabled || !this.config.categories[category]) {
      return;
    }

    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const prefix = `[${timestamp}] ${icon}`;
    
    if (data) {
      console.log(`${prefix} ${message}`, data);
    } else {
      console.log(`${prefix} ${message}`);
    }
  }
}

// Global debug instance
export const debug = DebugLogger.getInstance();

// Helper function to enable specific debug categories
export function enableDebug(...categories: (keyof DebugConfig['categories'])[]): void {
  categories.forEach(category => debug.enableCategory(category));
}

// Helper function to disable all debug categories
export function disableAllDebug(): void {
  Object.keys(debug['config'].categories).forEach(category => {
    debug.disableCategory(category as keyof DebugConfig['categories']);
  });
}