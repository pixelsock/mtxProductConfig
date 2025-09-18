/**
 * Enhanced Configurator React Hook
 * Provides state management and real-time updates for dynamic product configuration
 * Version: 2.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { EnhancedConfiguratorClient } from '../services/EnhancedConfiguratorClient';
import {
  EnhancedConfiguratorState,
  ConfigurationState,
  ConfigurationProgress,
  DynamicOptionsResponse,
  SelectionUpdateResponse,
  CollectionKey,
  GuidanceType,
  OptionAvailabilityState,
  ENHANCED_CONFIGURATOR_CONFIG,
  ConfiguratorError
} from '../types/enhanced-configurator';

interface UseEnhancedConfiguratorOptions {
  supabaseUrl: string;
  supabaseKey: string;
  productLineId: number | null;
  initialSelections?: ConfigurationState;
  autoApplyGuidance?: boolean;
  enablePerformanceTracking?: boolean;
}

interface UseEnhancedConfiguratorReturn {
  // State
  state: EnhancedConfiguratorState;
  progress: ConfigurationProgress | null;

  // Actions
  selectOption: (collection: CollectionKey, optionId: number | null) => Promise<void>;
  clearSelection: (collection: CollectionKey) => Promise<void>;
  clearAllSelections: () => Promise<void>;
  applyGuidance: (guidanceIndex?: number) => Promise<void>;
  resetConfiguration: () => Promise<void>;

  // Data access
  getAvailableOptions: (collection: CollectionKey) => any[];
  getSelectedOption: (collection: CollectionKey) => any | null;
  getOptionState: (collection: CollectionKey, optionId: number) => OptionAvailabilityState;

  // Configuration info
  isComplete: boolean;
  isValid: boolean;
  finalSKU: string | null;
  remainingSkuCount: number;
  reductionPercentage: number;

  // Guidance
  primaryGuidance: any | null;
  hasForced: boolean;
  needsBacktrack: boolean;

  // Performance
  performanceMetrics: any[];
  clearCache: () => void;

  // Error handling
  lastError: ConfiguratorError | null;
  clearError: () => void;
}

export function useEnhancedConfigurator({
  supabaseUrl,
  supabaseKey,
  productLineId,
  initialSelections = {},
  autoApplyGuidance = ENHANCED_CONFIGURATOR_CONFIG.AUTO_APPLY_FORCED_SELECTIONS,
  enablePerformanceTracking = true
}: UseEnhancedConfiguratorOptions): UseEnhancedConfiguratorReturn {

  // Initialize client
  const clientRef = useRef<EnhancedConfiguratorClient>();
  if (!clientRef.current) {
    clientRef.current = new EnhancedConfiguratorClient(supabaseUrl, supabaseKey);
  }
  const client = clientRef.current;

  // Core state
  const [state, setState] = useState<EnhancedConfiguratorState>({
    productLineId,
    currentSelections: initialSelections,
    progress: null,
    lastUpdate: 0,
    isLoading: false,
    loadingCollections: new Set(),
    errors: {},
    warnings: [],
    queryCount: 0,
    lastQueryDuration: 0,
    cacheHitRatio: 0
  });

  const [lastError, setLastError] = useState<ConfiguratorError | null>(null);

  // ============================================================================
  // Core Actions
  // ============================================================================

  const selectOption = useCallback(async (
    collection: CollectionKey,
    optionId: number | null
  ): Promise<void> => {
    if (!productLineId) {
      setLastError({
        code: 'NO_PRODUCT_LINE',
        message: 'No product line selected',
        timestamp: Date.now()
      });
      return;
    }

    setState(prev => ({
      ...prev,
      isLoading: true,
      loadingCollections: new Set([...prev.loadingCollections, collection])
    }));

    try {
      const response: SelectionUpdateResponse = await client.updateSelection(
        productLineId,
        collection,
        optionId,
        state.currentSelections
      );

      if (!response.success) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          loadingCollections: new Set([...prev.loadingCollections].filter(c => c !== collection)),
          errors: {
            ...prev.errors,
            [collection]: response.errors?.[0] || 'Selection failed'
          }
        }));
        return;
      }

      // Update state with new selections and progress
      setState(prev => ({
        ...prev,
        currentSelections: response.newState,
        progress: response.progress,
        lastUpdate: Date.now(),
        isLoading: false,
        loadingCollections: new Set([...prev.loadingCollections].filter(c => c !== collection)),
        warnings: response.warnings || [],
        errors: { ...prev.errors, [collection]: undefined },
        queryCount: prev.queryCount + 1
      }));

      // Auto-apply guidance if enabled and forced selections exist
      if (autoApplyGuidance && response.autoSelections) {
        console.log('Auto-applied selections:', response.autoSelections);
      }

      setLastError(null);
    } catch (error) {
      const configuratorError = error as ConfiguratorError;
      setLastError(configuratorError);

      setState(prev => ({
        ...prev,
        isLoading: false,
        loadingCollections: new Set([...prev.loadingCollections].filter(c => c !== collection)),
        errors: {
          ...prev.errors,
          [collection]: configuratorError.message
        }
      }));
    }
  }, [productLineId, state.currentSelections, client, autoApplyGuidance]);

  const clearSelection = useCallback(async (collection: CollectionKey): Promise<void> => {
    await selectOption(collection, null);
  }, [selectOption]);

  const clearAllSelections = useCallback(async (): Promise<void> => {
    setState(prev => ({
      ...prev,
      currentSelections: { productLineId: prev.productLineId },
      progress: null,
      lastUpdate: Date.now(),
      errors: {},
      warnings: []
    }));

    if (productLineId) {
      await loadConfiguration();
    }
  }, [productLineId]);

  const applyGuidance = useCallback(async (guidanceIndex: number = 0): Promise<void> => {
    if (!state.progress?.guidance.guidanceItems[guidanceIndex]) {
      return;
    }

    const guidance = state.progress.guidance.guidanceItems[guidanceIndex];

    if (guidance.collectionName && guidance.suggestedOptionId) {
      await selectOption(guidance.collectionName, guidance.suggestedOptionId);
    }
  }, [state.progress, selectOption]);

  const resetConfiguration = useCallback(async (): Promise<void> => {
    setState({
      productLineId,
      currentSelections: { productLineId },
      progress: null,
      lastUpdate: 0,
      isLoading: false,
      loadingCollections: new Set(),
      errors: {},
      warnings: [],
      queryCount: 0,
      lastQueryDuration: 0,
      cacheHitRatio: 0
    });

    setLastError(null);
    client.clearCache();

    if (productLineId) {
      await loadConfiguration();
    }
  }, [productLineId, client]);

  // ============================================================================
  // Configuration Loading
  // ============================================================================

  const loadConfiguration = useCallback(async (): Promise<void> => {
    if (!productLineId) return;

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const startTime = Date.now();
      const response: DynamicOptionsResponse = await client.getDynamicOptions(
        productLineId,
        state.currentSelections
      );

      const progress: ConfigurationProgress = {
        summary: response.summary,
        collections: response.collections,
        guidance: response.guidance,
        dependencies: [],
        minimumSelections: []
      };

      setState(prev => ({
        ...prev,
        progress,
        lastUpdate: Date.now(),
        isLoading: false,
        lastQueryDuration: Date.now() - startTime,
        queryCount: prev.queryCount + 1
      }));

      setLastError(null);
    } catch (error) {
      const configuratorError = error as ConfiguratorError;
      setLastError(configuratorError);

      setState(prev => ({
        ...prev,
        isLoading: false,
        errors: { general: configuratorError.message }
      }));
    }
  }, [productLineId, state.currentSelections, client]);

  // ============================================================================
  // Data Access Helpers
  // ============================================================================

  const getAvailableOptions = useCallback((collection: CollectionKey) => {
    const collectionData = state.progress?.collections.find(c => c.collection === collection);
    return collectionData?.options.filter(o => o.availabilityState === 'available') || [];
  }, [state.progress]);

  const getSelectedOption = useCallback((collection: CollectionKey) => {
    const collectionData = state.progress?.collections.find(c => c.collection === collection);
    if (!collectionData?.hasSelection) return null;

    return collectionData.options.find(o => o.id === collectionData.selectedOptionId) || null;
  }, [state.progress]);

  const getOptionState = useCallback((
    collection: CollectionKey,
    optionId: number
  ): OptionAvailabilityState => {
    const collectionData = state.progress?.collections.find(c => c.collection === collection);
    const option = collectionData?.options.find(o => o.id === optionId);
    return option?.availabilityState || 'hidden';
  }, [state.progress]);

  // ============================================================================
  // Computed Properties
  // ============================================================================

  const isComplete = state.progress?.summary.isConfigurationComplete || false;
  const isValid = state.progress?.summary.currentMatchingSkus !== 0;
  const finalSKU = state.progress?.summary.finalSkuCode || null;
  const remainingSkuCount = state.progress?.summary.currentMatchingSkus || 0;
  const reductionPercentage = state.progress?.summary.reductionPercentage || 0;

  const primaryGuidance = state.progress?.guidance.primaryGuidance || null;
  const hasForced = state.progress?.guidance.hasForced || false;
  const needsBacktrack = state.progress?.guidance.hasBacktrack || false;

  // ============================================================================
  // Performance and Cache Management
  // ============================================================================

  const performanceMetrics = enablePerformanceTracking ? client.getPerformanceMetrics() : [];

  const clearCache = useCallback(() => {
    client.clearCache();
  }, [client]);

  const clearError = useCallback(() => {
    setLastError(null);
    setState(prev => ({ ...prev, errors: {} }));
  }, []);

  // ============================================================================
  // Effects
  // ============================================================================

  // Load configuration when product line changes
  useEffect(() => {
    if (productLineId) {
      loadConfiguration();
    }
  }, [productLineId]);

  // Auto-apply forced selections if enabled
  useEffect(() => {
    if (autoApplyGuidance && hasForced && !state.isLoading) {
      const forcedGuidance = state.progress?.guidance.guidanceItems.find(
        g => g.guidanceType === 'forced'
      );

      if (forcedGuidance && forcedGuidance.collectionName && forcedGuidance.suggestedOptionId) {
        // Check if this collection doesn't already have a selection
        const collection = state.progress?.collections.find(
          c => c.collection === forcedGuidance.collectionName
        );

        if (collection && !collection.hasSelection) {
          selectOption(forcedGuidance.collectionName, forcedGuidance.suggestedOptionId);
        }
      }
    }
  }, [hasForced, autoApplyGuidance, state.isLoading, state.progress, selectOption]);

  // Update cache hit ratio
  useEffect(() => {
    if (enablePerformanceTracking && performanceMetrics.length > 0) {
      const recentMetrics = performanceMetrics.slice(-10);
      const cacheHits = recentMetrics.filter(m => m.cacheHit).length;
      const cacheHitRatio = cacheHits / recentMetrics.length;

      setState(prev => ({ ...prev, cacheHitRatio }));
    }
  }, [performanceMetrics, enablePerformanceTracking]);

  // ============================================================================
  // Return Interface
  // ============================================================================

  return {
    // State
    state,
    progress: state.progress,

    // Actions
    selectOption,
    clearSelection,
    clearAllSelections,
    applyGuidance,
    resetConfiguration,

    // Data access
    getAvailableOptions,
    getSelectedOption,
    getOptionState,

    // Configuration info
    isComplete,
    isValid,
    finalSKU,
    remainingSkuCount,
    reductionPercentage,

    // Guidance
    primaryGuidance,
    hasForced,
    needsBacktrack,

    // Performance
    performanceMetrics,
    clearCache,

    // Error handling
    lastError,
    clearError
  };
}