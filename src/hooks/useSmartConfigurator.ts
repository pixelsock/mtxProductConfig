/**
 * Smart Configurator React Hook
 * 
 * Provides real-time option filtering and SKU generation
 * with intelligent constraint application based on current selections.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  smartConfigurator, 
  type SmartConfig, 
  type AvailableOptions, 
  type SkuResult 
} from '../services/smart-configurator';

export interface UseSmartConfiguratorOptions {
  /** Enable debug logging */
  debug?: boolean;
  /** Debounce delay for SKU generation (ms) */
  debounceMs?: number;
  /** Enable automatic option filtering */
  autoFilter?: boolean;
}

export interface UseSmartConfiguratorResult {
  /** Current configuration */
  config: SmartConfig;
  /** Available options based on current config */
  availableOptions: AvailableOptions | null;
  /** Current SKU result */
  skuResult: SkuResult | null;
  /** Loading states */
  loading: {
    options: boolean;
    sku: boolean;
    search: boolean;
  };
  /** Error states */
  errors: {
    options: string | null;
    sku: string | null;
    search: string | null;
  };
  /** Update configuration */
  updateConfig: (updates: Partial<SmartConfig>) => void;
  /** Set entire configuration */
  setConfig: (config: SmartConfig) => void;
  /** Search for configurations */
  searchConfigurations: (query: string) => Promise<Array<{
    config: SmartConfig;
    sku: string;
    score: number;
  }>>;
  /** Generate valid combinations for current product */
  generateCombinations: (limit?: number) => Promise<SmartConfig[]>;
  /** Clear all selections */
  clearConfig: () => void;
  /** Refresh data cache */
  refreshCache: () => void;
}

export function useSmartConfigurator(
  initialConfig: Partial<SmartConfig> = {},
  options: UseSmartConfiguratorOptions = {}
): UseSmartConfiguratorResult {
  const {
    debug = false,
    debounceMs = 300,
    autoFilter = true
  } = options;

  // State management
  const [config, setConfigState] = useState<SmartConfig>(() => ({ ...initialConfig }));
  const [availableOptions, setAvailableOptions] = useState<AvailableOptions | null>(null);
  const [skuResult, setSkuResult] = useState<SkuResult | null>(null);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  // Loading states
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [loadingSku, setLoadingSku] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);

  // Error states
  const [optionsError, setOptionsError] = useState<string | null>(null);
  const [skuError, setSkuError] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  const loading = useMemo(() => ({
    options: loadingOptions,
    sku: loadingSku,
    search: loadingSearch
  }), [loadingOptions, loadingSku, loadingSearch]);

  const errors = useMemo(() => ({
    options: optionsError,
    sku: skuError,
    search: searchError
  }), [optionsError, skuError, searchError]);

  // Debug logging
  const log = useCallback((...args: any[]) => {
    if (debug) {
      console.log('[SmartConfigurator]', ...args);
    }
  }, [debug]);

  // Update available options based on current config
  const updateAvailableOptions = useCallback(async () => {
    if (!autoFilter) return;

    setLoadingOptions(true);
    setOptionsError(null);
    
    try {
      log('Updating available options for config:', config);
      const options = await smartConfigurator.getAvailableOptions(config);
      setAvailableOptions(options);
      log('Available options updated:', options);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load options';
      setOptionsError(message);
      log('Error updating options:', error);
    } finally {
      setLoadingOptions(false);
    }
  }, [config, autoFilter, log]);

  // Generate SKU with debouncing
  const updateSku = useCallback(async (configToUse: SmartConfig) => {
    // Clear existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Set new timer
    const timer = setTimeout(async () => {
      setLoadingSku(true);
      setSkuError(null);
      
      try {
        log('Generating SKU for config:', configToUse);
        const result = await smartConfigurator.buildSku(configToUse);
        setSkuResult(result);
        log('SKU generated:', result);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to generate SKU';
        setSkuError(message);
        log('Error generating SKU:', error);
        setSkuResult({
          sku: '',
          isValid: false,
          appliedRules: [],
          errors: [message]
        });
      } finally {
        setLoadingSku(false);
      }
    }, debounceMs);

    setDebounceTimer(timer);
  }, [debounceTimer, debounceMs, log]);

  // Update configuration
  const updateConfig = useCallback((updates: Partial<SmartConfig>) => {
    const newConfig = { ...config, ...updates };
    log('Config updated:', { updates, newConfig });
    setConfigState(newConfig);
  }, [config, log]);

  // Set entire configuration
  const setConfig = useCallback((newConfig: SmartConfig) => {
    log('Config set:', newConfig);
    setConfigState(newConfig);
  }, [log]);

  // Search configurations
  const searchConfigurations = useCallback(async (query: string) => {
    setLoadingSearch(true);
    setSearchError(null);
    
    try {
      log('Searching configurations for:', query);
      const result = await smartConfigurator.searchConfigurations(query, 20);
      log('Search results:', result);
      return result.results;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Search failed';
      setSearchError(message);
      log('Search error:', error);
      return [];
    } finally {
      setLoadingSearch(false);
    }
  }, [log]);

  // Generate combinations
  const generateCombinations = useCallback(async (limit = 100) => {
    if (!config.product_id) {
      throw new Error('Product ID is required to generate combinations');
    }

    try {
      log('Generating combinations for product:', config.product_id);
      const combinations = await smartConfigurator.generateValidCombinations(config.product_id, limit);
      log('Generated combinations:', combinations.length);
      return combinations;
    } catch (error) {
      log('Error generating combinations:', error);
      throw error;
    }
  }, [config.product_id, log]);

  // Clear configuration
  const clearConfig = useCallback(() => {
    log('Clearing configuration');
    setConfigState({});
    setSkuResult(null);
  }, [log]);

  // Refresh cache
  const refreshCache = useCallback(() => {
    log('Refreshing cache');
    smartConfigurator.clearCache();
    // Trigger re-fetch of options and SKU
    updateAvailableOptions();
    if (Object.keys(config).length > 0) {
      updateSku(config);
    }
  }, [updateAvailableOptions, updateSku, config, log]);

  // Effect: Update available options when config changes
  useEffect(() => {
    updateAvailableOptions();
  }, [updateAvailableOptions]);

  // Effect: Update SKU when config changes
  useEffect(() => {
    if (Object.keys(config).length > 0) {
      updateSku(config);
    } else {
      setSkuResult(null);
    }
    
    // Cleanup timer on unmount
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [config, updateSku]); // Don't include debounceTimer in deps to avoid infinite loops

  return {
    config,
    availableOptions,
    skuResult,
    loading,
    errors,
    updateConfig,
    setConfig,
    searchConfigurations,
    generateCombinations,
    clearConfig,
    refreshCache
  };
}

// Utility hook for search functionality
export function useSkuSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Array<{
    config: SmartConfig;
    sku: string;
    score: number;
  }>>([]);
  const [isSearching, setIsSearching] = useState(false);

  const search = useCallback(async (searchQuery: string) => {
    setQuery(searchQuery);
    setIsSearching(true);
    
    try {
      const searchResults = await smartConfigurator.searchConfigurations(searchQuery);
      setResults(searchResults.results);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
  }, []);

  return {
    query,
    results,
    isSearching,
    search,
    clearSearch
  };
}