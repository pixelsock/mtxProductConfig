import { useCallback } from 'react';
import { useConfiguration as useConfigContext } from '../context/ConfigurationProvider';
import type { ProductConfiguration, ServiceResult } from '../services/types/ServiceTypes';

export interface UseConfigurationReturn {
  // State
  configuration: ProductConfiguration | null;
  isLoading: boolean;
  isComputingAvailability: boolean;
  errors: string[];
  
  // Actions
  updateField: (field: keyof ProductConfiguration, value: any) => Promise<ServiceResult<ProductConfiguration>>;
  resetConfiguration: () => Promise<ServiceResult<ProductConfiguration>>;
  validateConfiguration: () => Promise<ServiceResult<{ valid: boolean; errors: string[] }>>;
  
  // Computed values
  getCurrentSizeId: () => string;
  isValid: boolean;
  hasErrors: boolean;
}

export const useConfiguration = (): UseConfigurationReturn => {
  const context = useConfigContext();

  const updateField = useCallback(
    async (field: keyof ProductConfiguration, value: any) => {
      return context.updateConfiguration(field, value);
    },
    [context]
  );

  const resetConfiguration = useCallback(async () => {
    return context.resetConfiguration();
  }, [context]);

  const validateConfiguration = useCallback(async () => {
    return context.validateConfiguration();
  }, [context]);

  const getCurrentSizeId = useCallback(() => {
    return context.getCurrentSizeId();
  }, [context]);

  return {
    // State
    configuration: context.configuration,
    isLoading: context.isLoading,
    isComputingAvailability: context.isComputingAvailability,
    errors: context.errors,
    
    // Actions
    updateField,
    resetConfiguration,
    validateConfiguration,
    
    // Computed values
    getCurrentSizeId,
    isValid: context.errors.length === 0,
    hasErrors: context.errors.length > 0,
  };
};