import { useQueryState, parseAsString } from 'nuqs';
import { useEffect, useRef } from 'react';

/**
 * Hook to sync SKU with URL query parameters using nuqs
 *
 * Best practices from nuqs documentation:
 * - Use parseAsString for string values
 * - Use history: 'replace' to avoid polluting browser history
 * - Use shallow: true for client-side only updates
 * - Use throttleMs for built-in throttling
 * - Handle URL as source of truth on mount
 */
export function useSkuUrlSync() {
  // Use nuqs with proper parser and options
  const [skuParam, setSkuParam] = useQueryState(
    'sku',
    parseAsString.withOptions({
      history: 'replace', // Don't clutter browser history
      shallow: true, // Don't trigger server re-renders (client-side only)
      throttleMs: 500, // Built-in throttling for URL updates
    })
  );

  const isInitialMount = useRef(true);
  const initialSkuValue = useRef(skuParam);

  // Mark that we've moved past the initial mount
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    }
  }, []);

  /**
   * Update the URL with a new SKU
   * Nuqs handles throttling automatically with throttleMs option
   */
  const updateSkuInUrl = (newSku: string | null) => {
    // Skip if trying to set the same value
    if (newSku === skuParam) return;

    setSkuParam(newSku || null);
  };

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
