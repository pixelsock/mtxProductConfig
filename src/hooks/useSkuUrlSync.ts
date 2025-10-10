'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook to sync SKU with URL query parameters using Next.js built-in hooks
 *
 * Best practices:
 * - Use router.replace() to avoid polluting browser history
 * - Use shallow updates for client-side only changes
 * - Throttle URL updates to avoid excessive history entries
 * - Handle URL as source of truth on mount
 */
export function useSkuUrlSync() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const skuParam = searchParams.get('sku');
  const isInitialMount = useRef(true);
  const initialSkuValue = useRef(skuParam);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Mark that we've moved past the initial mount
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    }
  }, []);

  /**
   * Update the URL with a new SKU
   * Throttled to avoid excessive history entries
   */
  const updateSkuInUrl = useCallback((newSku: string | null) => {
    // Skip if trying to set the same value
    if (newSku === skuParam) return;

    // Clear any pending updates
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    // Throttle URL updates (500ms)
    updateTimeoutRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());

      if (newSku) {
        params.set('sku', newSku);
      } else {
        params.delete('sku');
      }

      const queryString = params.toString();
      const newUrl = queryString ? `${pathname}?${queryString}` : pathname;

      router.replace(newUrl, { scroll: false });
    }, 500);
  }, [skuParam, searchParams, pathname, router]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Get the current SKU from URL
   */
  const getSkuFromUrl = () => skuParam;

  /**
   * Get the initial SKU that was in the URL when component mounted
   */
  const getInitialSku = () => initialSkuValue.current;

  /**
   * Check if we're still on the initial mount with a SKU parameter
   */
  const hasInitialSku = () => initialSkuValue.current !== null;

  return {
    skuParam,
    updateSkuInUrl,
    getSkuFromUrl,
    getInitialSku,
    hasInitialSku,
  };
}
