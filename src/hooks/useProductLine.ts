import { useCallback } from 'react';
import { useAppState } from '../context/AppStateProvider';
import { useConfiguration } from '../context/ConfigurationProvider';
import type { ProductLine, ServiceResult, OptionSet } from '../services/types/ServiceTypes';

export interface UseProductLineReturn {
  // State
  availableProductLines: ProductLine[];
  currentProductLine: ProductLine | null;
  availableOptions: Record<string, OptionSet>;
  availableOptionIds: Record<string, number[]>;
  constraints: Record<string, any>;
  
  // Actions
  switchProductLine: (productLine: ProductLine) => Promise<ServiceResult<void>>;
  loadOptionsForProductLine: (productLineId: number) => Promise<ServiceResult<Record<string, OptionSet>>>;
  
  // Computed values
  hasProductLines: boolean;
  hasOptions: boolean;
  isProductLineSelected: boolean;
}

export const useProductLine = (): UseProductLineReturn => {
  const { state, dispatch } = useAppState();
  const configContext = useConfiguration();

  const switchProductLine = useCallback(
    async (productLine: ProductLine) => {
      return configContext.switchProductLine(productLine);
    },
    [configContext]
  );

  const loadOptionsForProductLine = useCallback(
    async (productLineId: number) => {
      try {
        const result = await state.services.productLine.loadOptionsForProductLine(productLineId);
        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load options';
        return { success: false, error: errorMessage };
      }
    },
    [state.services.productLine]
  );

  // Get current product line from available options
  const currentProductLine = state.availableProductLines.find(
    pl => Object.keys(configContext.availableOptions).length > 0
  ) || null;

  return {
    // State
    availableProductLines: state.availableProductLines,
    currentProductLine,
    availableOptions: configContext.availableOptions,
    availableOptionIds: configContext.availableOptionIds,
    constraints: configContext.constraints,
    
    // Actions
    switchProductLine,
    loadOptionsForProductLine,
    
    // Computed values
    hasProductLines: state.availableProductLines.length > 0,
    hasOptions: Object.keys(configContext.availableOptions).length > 0,
    isProductLineSelected: currentProductLine !== null,
  };
};