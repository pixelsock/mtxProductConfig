import { useState, useEffect, useCallback } from 'react';
import {
  dynamicConfiguratorClient,
  ProductConfiguration,
  ConfigurationValidation,
  ConfigurationPrice,
  ConfigurationStats
} from '../services/DynamicConfiguratorClient';

export interface DynamicConfiguratorState {
  // Loading states
  loading: boolean;
  configLoading: boolean;
  validationLoading: boolean;
  priceLoading: boolean;

  // Data
  productConfiguration: ProductConfiguration | null;
  currentConfiguration: Record<string, any>;
  validation: ConfigurationValidation | null;
  pricing: ConfigurationPrice | null;
  generatedSKU: string | null;
  stats: ConfigurationStats | null;

  // UI State
  selectedProductId: number | null;
  isConnected: boolean;
  errors: string[];
}

export interface DynamicConfiguratorActions {
  selectProduct: (productId: number) => Promise<void>;
  updateConfiguration: (attribute: string, value: any) => Promise<void>;
  validateConfiguration: () => Promise<boolean>;
  calculatePrice: () => Promise<void>;
  generateSKU: () => Promise<void>;
  resetConfiguration: () => void;
  testConnection: () => Promise<boolean>;
}

/**
 * React hook for managing dynamic product configuration
 *
 * This hook replaces the legacy sku-index based system with
 * the new dynamic configuration system using configuration_attributes
 * and the new RPC endpoints.
 */
export function useDynamicConfigurator(): [DynamicConfiguratorState, DynamicConfiguratorActions] {
  const [state, setState] = useState<DynamicConfiguratorState>({
    loading: false,
    configLoading: false,
    validationLoading: false,
    priceLoading: false,
    productConfiguration: null,
    currentConfiguration: {},
    validation: null,
    pricing: null,
    generatedSKU: null,
    stats: null,
    selectedProductId: null,
    isConnected: false,
    errors: []
  });

  // Test connection on mount
  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = useCallback(async (): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, loading: true, errors: [] }));

      const result = await dynamicConfiguratorClient.testConnection();

      setState(prev => ({
        ...prev,
        loading: false,
        isConnected: result.connected,
        stats: result.stats,
        errors: result.connected ? [] : ['Failed to connect to dynamic configurator API']
      }));

      return result.connected;
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        isConnected: false,
        errors: [error instanceof Error ? error.message : 'Connection test failed']
      }));
      return false;
    }
  }, []);

  const selectProduct = useCallback(async (productId: number): Promise<void> => {
    try {
      setState(prev => ({
        ...prev,
        configLoading: true,
        errors: [],
        selectedProductId: productId,
        // Reset dependent data
        currentConfiguration: {},
        validation: null,
        pricing: null,
        generatedSKU: null
      }));

      const productConfiguration = await dynamicConfiguratorClient.getProductConfiguration(productId);

      setState(prev => ({
        ...prev,
        configLoading: false,
        productConfiguration
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        configLoading: false,
        errors: [error instanceof Error ? error.message : 'Failed to load product configuration']
      }));
    }
  }, []);

  const updateConfiguration = useCallback(async (attribute: string, value: any): Promise<void> => {
    const newConfiguration = {
      ...state.currentConfiguration,
      [attribute]: value
    };

    setState(prev => ({
      ...prev,
      currentConfiguration: newConfiguration,
      // Clear validation and pricing when configuration changes
      validation: null,
      pricing: null,
      generatedSKU: null
    }));

    // Auto-validate if we have a complete configuration
    if (state.selectedProductId && state.productConfiguration) {
      // Check if all required attributes are filled
      const requiredAttributes = state.productConfiguration.attributes
        .filter(attr => attr.is_required)
        .map(attr => attr.code);

      const hasAllRequired = requiredAttributes.every(attr =>
        newConfiguration[attr] !== undefined && newConfiguration[attr] !== null
      );

      if (hasAllRequired) {
        // Auto-validate and calculate price
        setTimeout(() => {
          validateConfiguration();
          calculatePrice();
        }, 300); // Debounce
      }
    }
  }, [state.currentConfiguration, state.selectedProductId, state.productConfiguration]);

  const validateConfiguration = useCallback(async (): Promise<boolean> => {
    if (!state.selectedProductId) {
      setState(prev => ({
        ...prev,
        errors: ['No product selected for validation']
      }));
      return false;
    }

    try {
      setState(prev => ({ ...prev, validationLoading: true, errors: [] }));

      const validation = await dynamicConfiguratorClient.validateConfiguration(
        state.selectedProductId,
        state.currentConfiguration
      );

      setState(prev => ({
        ...prev,
        validationLoading: false,
        validation
      }));

      return validation.valid;

    } catch (error) {
      setState(prev => ({
        ...prev,
        validationLoading: false,
        errors: [error instanceof Error ? error.message : 'Validation failed']
      }));
      return false;
    }
  }, [state.selectedProductId, state.currentConfiguration]);

  const calculatePrice = useCallback(async (): Promise<void> => {
    if (!state.selectedProductId) {
      setState(prev => ({
        ...prev,
        errors: ['No product selected for pricing']
      }));
      return;
    }

    try {
      setState(prev => ({ ...prev, priceLoading: true, errors: [] }));

      const pricing = await dynamicConfiguratorClient.calculatePrice(
        state.selectedProductId,
        state.currentConfiguration
      );

      setState(prev => ({
        ...prev,
        priceLoading: false,
        pricing
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        priceLoading: false,
        errors: [error instanceof Error ? error.message : 'Price calculation failed']
      }));
    }
  }, [state.selectedProductId, state.currentConfiguration]);

  const generateSKU = useCallback(async (): Promise<void> => {
    if (!state.selectedProductId) {
      setState(prev => ({
        ...prev,
        errors: ['No product selected for SKU generation']
      }));
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true, errors: [] }));

      const sku = await dynamicConfiguratorClient.generateSKU(
        state.selectedProductId,
        state.currentConfiguration
      );

      setState(prev => ({
        ...prev,
        loading: false,
        generatedSKU: sku
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        errors: [error instanceof Error ? error.message : 'SKU generation failed']
      }));
    }
  }, [state.selectedProductId, state.currentConfiguration]);

  const resetConfiguration = useCallback((): void => {
    setState(prev => ({
      ...prev,
      currentConfiguration: {},
      validation: null,
      pricing: null,
      generatedSKU: null,
      errors: []
    }));
  }, []);

  const actions: DynamicConfiguratorActions = {
    selectProduct,
    updateConfiguration,
    validateConfiguration,
    calculatePrice,
    generateSKU,
    resetConfiguration,
    testConnection
  };

  return [state, actions];
}

export default useDynamicConfigurator;