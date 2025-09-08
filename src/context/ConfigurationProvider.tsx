import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAppState } from './AppStateProvider';
import type {
  ProductConfiguration,
  ProductLine,
  OptionSet,
  ServiceResult,
  ConfigurationState,
  RuleOverrides
} from '../services/types/ServiceTypes';

interface ConfigurationContextValue {
  // Configuration State
  configuration: ProductConfiguration | null;
  configurationState: ConfigurationState;
  
  // Available Options
  availableOptions: Record<string, OptionSet>;
  availableOptionIds: Record<string, number[]>;
  constraints: Record<string, any>;
  
  // Loading States
  isLoading: boolean;
  isComputingAvailability: boolean;
  errors: string[];
  
  // Actions
  updateConfiguration: (field: keyof ProductConfiguration, value: any) => Promise<ServiceResult<ProductConfiguration>>;
  resetConfiguration: (productLine?: ProductLine) => Promise<ServiceResult<ProductConfiguration>>;
  switchProductLine: (productLine: ProductLine) => Promise<ServiceResult<void>>;
  
  // Utilities
  getCurrentSizeId: () => string;
  validateConfiguration: () => Promise<ServiceResult<{ valid: boolean; errors: string[] }>>;
  computeRuleOverrides: () => Promise<ServiceResult<RuleOverrides>>;
  
  // Quote Management
  quoteItems: ProductConfiguration[];
  addToQuote: () => void;
  removeFromQuote: (configId: string) => void;
  clearQuote: () => void;
}

const ConfigurationContext = createContext<ConfigurationContextValue | null>(null);

export const useConfiguration = (): ConfigurationContextValue => {
  const context = useContext(ConfigurationContext);
  if (!context) {
    throw new Error('useConfiguration must be used within a ConfigurationProvider');
  }
  return context;
};

interface ConfigurationProviderProps {
  children: ReactNode;
}

export const ConfigurationProvider: React.FC<ConfigurationProviderProps> = ({ children }) => {
  const { state: appState } = useAppState();
  const { services } = appState;

  // Configuration State
  const [configurationState, setConfigurationState] = useState<ConfigurationState>(
    services.configuration.getState()
  );
  
  // Options State
  const [availableOptions, setAvailableOptions] = useState<Record<string, OptionSet>>({});
  const [availableOptionIds, setAvailableOptionIds] = useState<Record<string, number[]>>({});
  const [constraints, setConstraints] = useState<Record<string, any>>({});
  
  // Loading States
  const [isComputingAvailability, setIsComputingAvailability] = useState(false);
  
  // Quote State
  const [quoteItems, setQuoteItems] = useState<ProductConfiguration[]>([]);
  
  // Current Product Line
  const [currentProductLine, setCurrentProductLine] = useState<ProductLine | null>(null);

  // Subscribe to configuration service state changes
  useEffect(() => {
    const unsubscribe = services.configuration.subscribe((newState) => {
      setConfigurationState(newState);
    });

    return unsubscribe;
  }, [services.configuration]);

  // Subscribe to product line service changes
  useEffect(() => {
    const unsubscribeProductLine = services.productLine.on('product-line-changed', async (event) => {
      const { newProductLine } = event.data;
      setCurrentProductLine(newProductLine);
      
      // Load options for new product line
      const options = services.productLine.getCurrentOptions();
      setAvailableOptions(options);
      
      // Initialize configuration for new product line
      await services.configuration.initializeConfiguration(newProductLine, options);
    });

    const unsubscribeOptions = services.productLine.on('options-loaded', (event) => {
      const { optionSets } = event.data;
      setAvailableOptions(optionSets);
    });

    return () => {
      unsubscribeProductLine();
      unsubscribeOptions();
    };
  }, [services.productLine, services.configuration]);

  // Subscribe to rules engine changes
  useEffect(() => {
    const unsubscribeRules = services.rules.on('rules-applied', (event) => {
      const { results } = event.data;
      setConstraints(results.constraints);
    });

    return unsubscribeRules;
  }, [services.rules]);

  // Configuration Actions
  const updateConfiguration = async (
    field: keyof ProductConfiguration, 
    value: any
  ): Promise<ServiceResult<ProductConfiguration>> => {
    const result = await services.configuration.updateConfiguration(field, value);
    
    if (result.success && result.data) {
      // Recompute availability after configuration change
      await computeAvailableOptions(result.data);
      
      // Update URL if needed (would be handled by a separate service)
      await updateUrl(result.data);
    }
    
    return result;
  };

  const resetConfiguration = async (productLine?: ProductLine): Promise<ServiceResult<ProductConfiguration>> => {
    const targetProductLine = productLine || currentProductLine;
    const options = targetProductLine ? services.productLine.getCurrentOptions() : undefined;
    
    return services.configuration.resetConfiguration(targetProductLine || undefined, options);
  };

  const switchProductLine = async (productLine: ProductLine): Promise<ServiceResult<void>> => {
    try {
      // Switch product line service
      const switchResult = await services.productLine.switchProductLine(productLine);
      
      if (!switchResult.success) {
        return { success: false, error: switchResult.error };
      }

      // The product line change event will trigger configuration initialization
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to switch product line';
      return { success: false, error: errorMessage };
    }
  };

  // Compute available options based on current configuration
  const computeAvailableOptions = async (config: ProductConfiguration): Promise<void> => {
    if (!currentProductLine) return;

    setIsComputingAvailability(true);
    
    try {
      // Apply rules to get constraints
      const ruleResult = await services.rules.processConfiguration(config);
      
      if (ruleResult.success) {
        setConstraints(ruleResult.data!.constraints);
        
        // Compute available option IDs based on constraints
        const optionIds: Record<string, number[]> = {};
        
        Object.entries(availableOptions).forEach(([collection, optionSet]) => {
          const collectionConstraints = ruleResult.data!.constraints[collection];
          
          if (collectionConstraints) {
            // Apply constraints to filter available options
            let availableIds = optionSet.options.map(opt => opt.id);
            
            if (collectionConstraints.allow?.size > 0) {
              availableIds = availableIds.filter(id => collectionConstraints.allow.has(id));
            }
            
            if (collectionConstraints.deny?.size > 0) {
              availableIds = availableIds.filter(id => !collectionConstraints.deny.has(id));
            }
            
            optionIds[collection] = availableIds;
          } else {
            // No constraints, all options available
            optionIds[collection] = optionSet.options.map(opt => opt.id);
          }
        });
        
        setAvailableOptionIds(optionIds);
      }
    } catch (error) {
      console.error('Failed to compute available options:', error);
    } finally {
      setIsComputingAvailability(false);
    }
  };

  // URL management
  const updateUrl = async (config: ProductConfiguration): Promise<void> => {
    if (!currentProductLine || !availableOptions) return;

    try {
      // Build SKU with rule overrides
      const overridesResult = await services.rules.computeRuleOverrides(config);
      const overrides = overridesResult.success ? overridesResult.data : undefined;
      
      const skuResult = await services.skuBuilder.buildSku(
        config,
        currentProductLine,
        availableOptions,
        { overrides, includeAccessories: true }
      );
      
      if (skuResult.success && skuResult.data) {
        const fullSku = skuResult.data.sku;
        const newUrl = `${window.location.pathname}?search=${encodeURIComponent(fullSku)}`;
        
        if (import.meta.env.DEV) {
          console.log('🔄 URL update:', { field: 'config-change', fullSku });
        }
        
        window.history.replaceState({}, '', newUrl);
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('URL update failed:', error);
      }
    }
  };

  // Utility Methods
  const getCurrentSizeId = (): string => {
    const config = configurationState.configuration;
    if (!config) return '';

    const matchingSize = availableOptions.sizes?.options.find(
      (size) =>
        size.width?.toString() === config.width &&
        size.height?.toString() === config.height
    );

    return matchingSize ? (matchingSize.sku_code || matchingSize.id.toString()) : '';
  };

  const validateConfiguration = async (): Promise<ServiceResult<{ valid: boolean; errors: string[] }>> => {
    const config = configurationState.configuration;
    if (!config) {
      return { success: false, error: 'No configuration to validate' };
    }

    const errors: string[] = [];
    
    // Basic validation
    if (!config.frameColor) errors.push('Frame color is required');
    if (!config.frameThickness) errors.push('Frame thickness is required');
    if (!config.mounting) errors.push('Mounting option is required');
    if (!config.width || !config.height) errors.push('Size is required');
    
    // Rule-based validation would go here
    const ruleResult = await services.rules.processConfiguration(config);
    if (!ruleResult.success) {
      errors.push('Configuration violates business rules');
    }

    return {
      success: true,
      data: {
        valid: errors.length === 0,
        errors
      }
    };
  };

  const computeRuleOverrides = async (): Promise<ServiceResult<RuleOverrides>> => {
    const config = configurationState.configuration;
    if (!config) {
      return { success: false, error: 'No configuration available' };
    }

    return services.rules.computeRuleOverrides(config);
  };

  // Quote Management
  const addToQuote = () => {
    const config = configurationState.configuration;
    if (!config) return;

    const quoteItem: ProductConfiguration = {
      ...config,
      id: `quote-${Date.now()}`,
    };

    setQuoteItems(prev => [...prev, quoteItem]);

    // Reset configuration to defaults
    if (currentProductLine) {
      services.configuration.initializeConfiguration(currentProductLine, availableOptions);
    }
  };

  const removeFromQuote = (configId: string) => {
    setQuoteItems(prev => prev.filter(item => item.id !== configId));
  };

  const clearQuote = () => {
    setQuoteItems([]);
  };

  // Auto-compute availability when configuration changes
  useEffect(() => {
    if (configurationState.configuration && currentProductLine) {
      computeAvailableOptions(configurationState.configuration);
    }
  }, [configurationState.configuration, currentProductLine]);

  const contextValue: ConfigurationContextValue = {
    configuration: configurationState.configuration,
    configurationState,
    availableOptions,
    availableOptionIds,
    constraints,
    isLoading: configurationState.isLoading,
    isComputingAvailability,
    errors: configurationState.errors,
    updateConfiguration,
    resetConfiguration,
    switchProductLine,
    getCurrentSizeId,
    validateConfiguration,
    computeRuleOverrides,
    quoteItems,
    addToQuote,
    removeFromQuote,
    clearQuote,
  };

  return (
    <ConfigurationContext.Provider value={contextValue}>
      {children}
    </ConfigurationContext.Provider>
  );
};