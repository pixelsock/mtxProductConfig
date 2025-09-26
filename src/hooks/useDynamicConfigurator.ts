/**
 * Dynamic Configurator Hook - Server-Side Integration
 * 
 * Provides a clean React interface to the server-side configurator logic
 * with automatic state management and real-time updates.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { dynamicConfiguratorClient } from '../services/dynamic-configurator-client';
import type { 
  ConfigurationSchema, 
  FilteredOptionsResponse, 
  ProductImage 
} from '../services/dynamic-configurator-client';

export interface DynamicConfiguratorState {
  // Data
  schema: ConfigurationSchema;
  filteredOptions: FilteredOptionsResponse | null;
  productImage: ProductImage | null;
  
  // UI State
  isLoading: boolean;
  error: string | null;
  
  // Configuration
  currentSelections: Record<string, any>;
  
  // Computed
  isConfigurationComplete: boolean;
  availableCollections: string[];
  totalDisabledOptions: number;
}

export interface DynamicConfiguratorActions {
  updateSelection: (collection: string, value: any) => void;
  clearSelection: (collection: string) => void;
  resetConfiguration: () => void;
  refreshData: () => Promise<void>;
}

export function useDynamicConfigurator(productLineId: number) {
  const [state, setState] = useState<DynamicConfiguratorState>({
    schema: {},
    filteredOptions: null,
    productImage: null,
    isLoading: true,
    error: null,
    currentSelections: {},
    isConfigurationComplete: false,
    availableCollections: [],
    totalDisabledOptions: 0
  });

  // Load initial data and refresh when product line changes
  const loadData = useCallback(async () => {
    if (!productLineId) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Load schema and filtered options in parallel
      const [schema, filteredOptions] = await Promise.all([
        dynamicConfiguratorClient.getConfigurationSchema(productLineId),
        dynamicConfiguratorClient.getFilteredOptions(productLineId, state.currentSelections)
      ]);

      // Load product image if we have selections
      let productImage: ProductImage | null = null;
      if (Object.keys(state.currentSelections).length > 0) {
        productImage = await dynamicConfiguratorClient.getProductImages(
          productLineId,
          state.currentSelections
        );
      }

      setState(prev => ({
        ...prev,
        schema,
        filteredOptions,
        productImage,
        isLoading: false,
        availableCollections: Object.keys(schema),
        totalDisabledOptions: Object.values(filteredOptions?.disabledOptions || {})
          .flat().length
      }));

      // Apply any set values from rules
      if (filteredOptions?.setValues && Object.keys(filteredOptions.setValues).length > 0) {
        setState(prev => ({
          ...prev,
          currentSelections: {
            ...prev.currentSelections,
            ...filteredOptions.setValues
          }
        }));
      }

    } catch (error) {
      console.error('Failed to load configurator data:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load data',
        isLoading: false
      }));
    }
  }, [productLineId, state.currentSelections]);

  // Update selection and refresh filtered options
  const updateSelection = useCallback(async (collection: string, value: any) => {
    const newSelections = {
      ...state.currentSelections,
      [collection]: value
    };

    setState(prev => ({
      ...prev,
      currentSelections: newSelections,
      isLoading: true
    }));

    try {
      // Get updated filtered options from server
      const filteredOptions = await dynamicConfiguratorClient.getFilteredOptions(
        productLineId,
        newSelections
      );

      // Get updated product image
      const productImage = await dynamicConfiguratorClient.getProductImages(
        productLineId,
        newSelections
      );

      setState(prev => ({
        ...prev,
        filteredOptions,
        productImage,
        isLoading: false,
        totalDisabledOptions: Object.values(filteredOptions?.disabledOptions || {})
          .flat().length
      }));

      // Apply any set values from rules
      if (filteredOptions?.setValues && Object.keys(filteredOptions.setValues).length > 0) {
        setState(prev => ({
          ...prev,
          currentSelections: {
            ...prev.currentSelections,
            ...filteredOptions.setValues
          }
        }));
      }

    } catch (error) {
      console.error('Failed to update selection:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to update selection',
        isLoading: false
      }));
    }
  }, [productLineId, state.currentSelections]);

  const clearSelection = useCallback((collection: string) => {
    const newSelections = { ...state.currentSelections };
    delete newSelections[collection];
    
    setState(prev => ({
      ...prev,
      currentSelections: newSelections
    }));

    // Refresh filtered options
    loadData();
  }, [state.currentSelections, loadData]);

  const resetConfiguration = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentSelections: {},
      productImage: null
    }));
    
    // Reload with empty selections
    loadData();
  }, [loadData]);

  const refreshData = useCallback(async () => {
    dynamicConfiguratorClient.clearCache();
    await loadData();
  }, [loadData]);

  // Load data on mount and product line change
  useEffect(() => {
    loadData();
  }, [productLineId]);

  // Check if configuration is complete (has all required selections)
  const isConfigurationComplete = useMemo(() => {
    if (!state.filteredOptions) return false;
    
    // Configuration is complete if we have selections for all available collections
    const requiredCollections = state.availableCollections.filter(collection => {
      const options = state.schema[collection] || [];
      return options.length > 1; // Only require selection if there are multiple options
    });

    return requiredCollections.every(collection => 
      state.currentSelections[collection] !== undefined
    );
  }, [state.filteredOptions, state.availableCollections, state.currentSelections, state.schema]);

  // Update computed state
  useEffect(() => {
    setState(prev => ({
      ...prev,
      isConfigurationComplete
    }));
  }, [isConfigurationComplete]);

  const actions: DynamicConfiguratorActions = {
    updateSelection,
    clearSelection,
    resetConfiguration,
    refreshData
  };

  return {
    ...state,
    ...actions
  };
}