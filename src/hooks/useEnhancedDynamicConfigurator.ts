/**
 * Enhanced Dynamic Configurator Hook
 *
 * Provides state management for the enhanced dynamic product configurator
 * with real-time option availability, selection guidance, and progress tracking.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  EnhancedDynamicConfiguratorClient,
  OptionAvailabilityState,
  SelectionGuidance,
  ConfigurationSummary,
  EnhancedProductLine,
  CurrentSelection
} from '../services/EnhancedDynamicConfiguratorClient';

export interface UseEnhancedDynamicConfiguratorProps {
  supabaseUrl: string;
  supabaseKey: string;
  productLineId?: number;
  autoApplyGuidance?: boolean;
  onSelectionChange?: (selections: CurrentSelection) => void;
  onConfigurationComplete?: (sku: string) => void;
  onError?: (error: string) => void;
}

export interface UseEnhancedDynamicConfiguratorReturn {
  // State
  productLines: EnhancedProductLine[];
  selectedProductLineId: number | null;
  currentSelections: CurrentSelection;
  availableOptions: OptionAvailabilityState[];
  selectionGuidance: SelectionGuidance[];
  configurationSummary: ConfigurationSummary | null;

  // Loading states
  isLoadingProductLines: boolean;
  isLoadingOptions: boolean;
  isLoadingGuidance: boolean;
  isLoadingSummary: boolean;

  // Error states
  error: string | null;

  // Actions
  selectProductLine: (productLineId: number) => Promise<void>;
  selectOption: (collectionName: string, optionId: number, optionData?: any) => Promise<void>;
  clearSelection: (collectionName: string) => Promise<void>;
  clearAllSelections: () => Promise<void>;
  applyGuidance: (guidance: SelectionGuidance) => Promise<void>;
  refreshState: () => Promise<void>;

  // Computed properties
  isConfigurationComplete: boolean;
  finalSKU: string | null;
  progress: {
    percentage: number;
    selectionsRemaining: number;
    currentState: string;
  };

  // Enhanced features status
  enhancedFunctionsAvailable: boolean;
}

export function useEnhancedDynamicConfigurator({
  supabaseUrl,
  supabaseKey,
  productLineId,
  autoApplyGuidance = false,
  onSelectionChange,
  onConfigurationComplete,
  onError
}: UseEnhancedDynamicConfiguratorProps): UseEnhancedDynamicConfiguratorReturn {

  // Initialize client
  const clientRef = useRef<EnhancedDynamicConfiguratorClient | null>(null);
  if (!clientRef.current) {
    clientRef.current = new EnhancedDynamicConfiguratorClient(supabaseUrl, supabaseKey);
  }
  const client = clientRef.current;

  // State
  const [productLines, setProductLines] = useState<EnhancedProductLine[]>([]);
  const [selectedProductLineId, setSelectedProductLineId] = useState<number | null>(productLineId || null);
  const [currentSelections, setCurrentSelections] = useState<CurrentSelection>({});
  const [availableOptions, setAvailableOptions] = useState<OptionAvailabilityState[]>([]);
  const [selectionGuidance, setSelectionGuidance] = useState<SelectionGuidance[]>([]);
  const [configurationSummary, setConfigurationSummary] = useState<ConfigurationSummary | null>(null);

  // Loading states
  const [isLoadingProductLines, setIsLoadingProductLines] = useState(false);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [isLoadingGuidance, setIsLoadingGuidance] = useState(false);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  // Error state
  const [error, setError] = useState<string | null>(null);

  // Enhanced features status
  const [enhancedFunctionsAvailable, setEnhancedFunctionsAvailable] = useState(false);

  /**
   * Load product lines
   */
  const loadProductLines = useCallback(async () => {
    setIsLoadingProductLines(true);
    setError(null);

    try {
      const lines = await client.getEnhancedProductLines();
      setProductLines(lines);

      // Auto-select first product line if none selected and one is available
      if (!selectedProductLineId && lines.length > 0) {
        setSelectedProductLineId(lines[0].id);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load product lines';
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setIsLoadingProductLines(false);
    }
  }, [client, selectedProductLineId, onError]);

  /**
   * Load available options for current state
   */
  const loadAvailableOptions = useCallback(async () => {
    if (!selectedProductLineId) return;

    setIsLoadingOptions(true);
    setError(null);

    try {
      const options = await client.getDynamicOptions(selectedProductLineId, currentSelections);
      setAvailableOptions(options);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load options';
      setError(errorMsg);
    } finally {
      setIsLoadingOptions(false);
    }
  }, [client, selectedProductLineId, currentSelections]);

  /**
   * Load selection guidance
   */
  const loadSelectionGuidance = useCallback(async () => {
    if (!selectedProductLineId) return;

    setIsLoadingGuidance(true);

    try {
      const guidance = await client.getSelectionGuidance(selectedProductLineId, currentSelections);
      setSelectionGuidance(guidance);

      // Auto-apply guidance if enabled and guidance suggests forced selections
      if (autoApplyGuidance && guidance.length > 0) {
        const forcedGuidance = guidance.find(g => g.guidance_type === 'forced');
        if (forcedGuidance && forcedGuidance.suggested_option_id) {
          await selectOption(
            forcedGuidance.collection_name,
            forcedGuidance.suggested_option_id
          );
        }
      }
    } catch (err) {
      console.warn('Failed to load selection guidance:', err);
    } finally {
      setIsLoadingGuidance(false);
    }
  }, [client, selectedProductLineId, currentSelections, autoApplyGuidance]);

  /**
   * Load configuration summary
   */
  const loadConfigurationSummary = useCallback(async () => {
    if (!selectedProductLineId) return;

    setIsLoadingSummary(true);

    try {
      const summary = await client.getConfigurationSummary(selectedProductLineId, currentSelections);
      setConfigurationSummary(summary);

      // Trigger completion callback if configuration is complete
      if (summary.is_configuration_complete && summary.final_sku_code) {
        onConfigurationComplete?.(summary.final_sku_code);
      }
    } catch (err) {
      console.warn('Failed to load configuration summary:', err);
    } finally {
      setIsLoadingSummary(false);
    }
  }, [client, selectedProductLineId, currentSelections, onConfigurationComplete]);

  /**
   * Check enhanced functions availability
   */
  const checkEnhancedFunctions = useCallback(async () => {
    try {
      const available = await client.checkEnhancedFunctionsAvailable();
      setEnhancedFunctionsAvailable(available);

      if (!available) {
        console.info('Enhanced configurator functions not yet available - using fallback simulation');
      }
    } catch (err) {
      setEnhancedFunctionsAvailable(false);
    }
  }, [client]);

  /**
   * Select a product line
   */
  const selectProductLine = useCallback(async (productLineId: number) => {
    setSelectedProductLineId(productLineId);
    setCurrentSelections({});
    setAvailableOptions([]);
    setSelectionGuidance([]);
    setConfigurationSummary(null);
  }, []);

  /**
   * Select an option
   */
  const selectOption = useCallback(async (
    collectionName: string,
    optionId: number,
    optionData?: any
  ) => {
    const newSelections = {
      ...currentSelections,
      [`${collectionName.replace(/s$/, '')}_id`]: optionId
    };

    setCurrentSelections(newSelections);
    onSelectionChange?.(newSelections);
  }, [currentSelections, onSelectionChange]);

  /**
   * Clear a selection
   */
  const clearSelection = useCallback(async (collectionName: string) => {
    const selectionKey = `${collectionName.replace(/s$/, '')}_id`;
    const newSelections = { ...currentSelections };
    delete newSelections[selectionKey];

    setCurrentSelections(newSelections);
    onSelectionChange?.(newSelections);
  }, [currentSelections, onSelectionChange]);

  /**
   * Clear all selections
   */
  const clearAllSelections = useCallback(async () => {
    setCurrentSelections({});
    onSelectionChange?.({});
  }, [onSelectionChange]);

  /**
   * Apply guidance recommendation
   */
  const applyGuidance = useCallback(async (guidance: SelectionGuidance) => {
    if (guidance.suggested_option_id && guidance.collection_name) {
      await selectOption(guidance.collection_name, guidance.suggested_option_id);
    }
  }, [selectOption]);

  /**
   * Refresh all state
   */
  const refreshState = useCallback(async () => {
    await Promise.all([
      loadAvailableOptions(),
      loadSelectionGuidance(),
      loadConfigurationSummary()
    ]);
  }, [loadAvailableOptions, loadSelectionGuidance, loadConfigurationSummary]);

  // Effects
  useEffect(() => {
    loadProductLines();
    checkEnhancedFunctions();
  }, [loadProductLines, checkEnhancedFunctions]);

  useEffect(() => {
    if (selectedProductLineId) {
      loadAvailableOptions();
      loadSelectionGuidance();
      loadConfigurationSummary();
    }
  }, [selectedProductLineId, currentSelections, loadAvailableOptions, loadSelectionGuidance, loadConfigurationSummary]);

  // Computed properties
  const isConfigurationComplete = configurationSummary?.is_configuration_complete ?? false;
  const finalSKU = configurationSummary?.final_sku_code ?? null;

  const progress = {
    percentage: configurationSummary?.reduction_percentage ?? 0,
    selectionsRemaining: configurationSummary?.required_selections_remaining ?? 0,
    currentState: configurationSummary?.configuration_state ?? 'starting'
  };

  return {
    // State
    productLines,
    selectedProductLineId,
    currentSelections,
    availableOptions,
    selectionGuidance,
    configurationSummary,

    // Loading states
    isLoadingProductLines,
    isLoadingOptions,
    isLoadingGuidance,
    isLoadingSummary,

    // Error state
    error,

    // Actions
    selectProductLine,
    selectOption,
    clearSelection,
    clearAllSelections,
    applyGuidance,
    refreshState,

    // Computed properties
    isConfigurationComplete,
    finalSKU,
    progress,

    // Enhanced features status
    enhancedFunctionsAvailable
  };
}