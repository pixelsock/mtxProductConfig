/**
 * Custom hook for optimized URL synchronization with configurator state
 * Implements debouncing and batching to reduce excessive history.replaceState calls
 * while maintaining immediate visual feedback through optimistic updates
 */

import { useRef, useCallback, useMemo } from 'react';
import { buildFullSku } from '../utils/sku-builder';
import type { ProductConfig, ProductOptions } from '../types/product';
import type { ProductLine } from '../services/directus';

interface UseUrlSyncOptions {
  debounceMs?: number;
  enableOptimisticUpdates?: boolean;
  enableBatching?: boolean;
}

interface UpdateUrlParams {
  config: ProductConfig;
  options: ProductOptions;
  productLine: ProductLine;
  overrides?: Parameters<typeof buildFullSku>[3];
  currentProductName?: string;
}

/**
 * Hook that provides optimized URL synchronization for configurator state
 * Features:
 * - Debounced URL updates to reduce browser history pollution
 * - Optimistic URL updates for immediate visual feedback
 * - Batching support for rapid consecutive changes
 * - Error handling and fallback behavior
 */
export function useUrlSync(options: UseUrlSyncOptions = {}) {
  const {
    debounceMs = 300,
    enableOptimisticUpdates = true,
    enableBatching = true
  } = options;

  // Refs for managing debouncing and batching
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const pendingUpdate = useRef<UpdateUrlParams | null>(null);
  const lastUrlUpdate = useRef<string>('');
  const isOptimisticUpdate = useRef<boolean>(false);

  // Memoized debounced URL update function
  const debouncedUrlUpdate = useCallback(
    (params: UpdateUrlParams) => {
      // Clear existing timer
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      // Store pending update for batching
      pendingUpdate.current = params;

      // Set new debounced timer
      debounceTimer.current = setTimeout(() => {
        const finalParams = pendingUpdate.current;
        if (!finalParams) return;

        try {
          const { config, options, productLine, overrides, currentProductName } = finalParams;
          
          // Include accessories if configured for this product line
          const includeAccessories = Array.isArray((productLine as any).default_options)
            ? ((productLine as any).default_options as any[]).some((d: any) => d?.collection === 'accessories')
            : false;

          // Build final SKU with all overrides
          const finalOverrides = {
            ...overrides,
            productSkuOverride: currentProductName || undefined,
            includeAccessories
          };

          const fullSku = buildFullSku(config, options, productLine, finalOverrides).sku;
          const newUrl = `${window.location.pathname}?search=${encodeURIComponent(fullSku)}`;
          
          // Only update if URL actually changed
          if (newUrl !== window.location.href) {
            window.history.replaceState({}, '', newUrl);
            lastUrlUpdate.current = newUrl;
            isOptimisticUpdate.current = false;
            
            if (import.meta.env.DEV) {
              console.log(`🔄 URL updated (debounced): ${fullSku}`);
            }
          }
        } catch (error) {
          console.warn('Failed to update URL:', error);
          // Revert optimistic update if it failed
          if (isOptimisticUpdate.current && lastUrlUpdate.current) {
            try {
              window.history.replaceState({}, '', lastUrlUpdate.current);
              isOptimisticUpdate.current = false;
            } catch {
              // Ignore revert failures
            }
          }
        }

        // Clear pending update
        pendingUpdate.current = null;
        debounceTimer.current = null;
      }, debounceMs);
    },
    [debounceMs]
  );

  // Optimistic URL update for immediate visual feedback
  const optimisticUrlUpdate = useCallback(
    (params: UpdateUrlParams) => {
      if (!enableOptimisticUpdates) return;

      try {
        const { config, options, productLine, overrides, currentProductName } = params;
        
        // Build optimistic SKU (may be slightly inaccurate due to async rules)
        const includeAccessories = Array.isArray((productLine as any).default_options)
          ? ((productLine as any).default_options as any[]).some((d: any) => d?.collection === 'accessories')
          : false;

        const optimisticOverrides = {
          ...overrides,
          productSkuOverride: currentProductName || undefined,
          includeAccessories
        };

        const optimisticSku = buildFullSku(config, options, productLine, optimisticOverrides).sku;
        const optimisticUrl = `${window.location.pathname}?search=${encodeURIComponent(optimisticSku)}`;
        
        // Only update if URL would change
        if (optimisticUrl !== window.location.href) {
          window.history.replaceState({}, '', optimisticUrl);
          isOptimisticUpdate.current = true;
          
          if (import.meta.env.DEV) {
            console.log(`⚡ URL updated (optimistic): ${optimisticSku}`);
          }
        }
      } catch (error) {
        console.warn('Optimistic URL update failed:', error);
      }
    },
    [enableOptimisticUpdates]
  );

  // Main update function that coordinates optimistic + debounced updates
  const updateUrl = useCallback(
    (params: UpdateUrlParams) => {
      // Immediate optimistic update for visual feedback
      if (enableOptimisticUpdates) {
        optimisticUrlUpdate(params);
      }

      // Debounced canonical update
      debouncedUrlUpdate(params);
    },
    [enableOptimisticUpdates, optimisticUrlUpdate, debouncedUrlUpdate]
  );

  // Immediate (non-debounced) update for critical cases
  const updateUrlImmediate = useCallback(
    async (params: UpdateUrlParams) => {
      // Clear any pending debounced updates
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
        debounceTimer.current = null;
      }
      pendingUpdate.current = null;

      try {
        const { config, options, productLine, overrides, currentProductName } = params;
        
        const includeAccessories = Array.isArray((productLine as any).default_options)
          ? ((productLine as any).default_options as any[]).some((d: any) => d?.collection === 'accessories')
          : false;

        const finalOverrides = {
          ...overrides,
          productSkuOverride: currentProductName || undefined,
          includeAccessories
        };

        const fullSku = buildFullSku(config, options, productLine, finalOverrides).sku;
        const newUrl = `${window.location.pathname}?search=${encodeURIComponent(fullSku)}`;
        
        if (newUrl !== window.location.href) {
          window.history.replaceState({}, '', newUrl);
          lastUrlUpdate.current = newUrl;
          isOptimisticUpdate.current = false;
          
          if (import.meta.env.DEV) {
            console.log(`🔄 URL updated (immediate): ${fullSku}`);
          }
        }
      } catch (error) {
        console.warn('Immediate URL update failed:', error);
        throw error;
      }
    },
    []
  );

  // Cleanup function
  const cleanup = useCallback(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
    pendingUpdate.current = null;
  }, []);

  // Flush any pending updates immediately
  const flush = useCallback(() => {
    if (debounceTimer.current && pendingUpdate.current) {
      clearTimeout(debounceTimer.current);
      const params = pendingUpdate.current;
      debounceTimer.current = null;
      pendingUpdate.current = null;
      
      // Execute the pending update immediately
      updateUrlImmediate(params);
    }
  }, [updateUrlImmediate]);

  // Check if there are pending URL updates
  const hasPendingUpdates = useMemo(() => {
    return debounceTimer.current !== null || pendingUpdate.current !== null;
  }, []);

  return {
    updateUrl,
    updateUrlImmediate,
    cleanup,
    flush,
    hasPendingUpdates,
    isOptimistic: isOptimisticUpdate.current
  };
}

/**
 * Performance monitoring utilities for URL sync
 */
export class UrlSyncMonitor {
  private static instance: UrlSyncMonitor | null = null;
  private updateCount = 0;
  private lastUpdateTime = 0;
  private updateTimes: number[] = [];
  private errorCount = 0;

  static getInstance(): UrlSyncMonitor {
    if (!UrlSyncMonitor.instance) {
      UrlSyncMonitor.instance = new UrlSyncMonitor();
    }
    return UrlSyncMonitor.instance;
  }

  recordUpdate(duration: number = 0) {
    const now = Date.now();
    this.updateCount++;
    this.lastUpdateTime = now;
    this.updateTimes.push(duration);
    
    // Keep only last 100 measurements
    if (this.updateTimes.length > 100) {
      this.updateTimes.shift();
    }
  }

  recordError() {
    this.errorCount++;
  }

  getStats() {
    const avgUpdateTime = this.updateTimes.length > 0 
      ? this.updateTimes.reduce((a, b) => a + b, 0) / this.updateTimes.length 
      : 0;

    return {
      totalUpdates: this.updateCount,
      errorRate: this.updateCount > 0 ? this.errorCount / this.updateCount : 0,
      averageUpdateTime: avgUpdateTime,
      lastUpdateTime: this.lastUpdateTime,
      isHealthy: this.errorRate < 0.05 && avgUpdateTime < 50 // < 5% error rate, < 50ms avg
    };
  }

  reset() {
    this.updateCount = 0;
    this.errorCount = 0;
    this.updateTimes = [];
    this.lastUpdateTime = 0;
  }
}
