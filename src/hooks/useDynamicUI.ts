import { useCallback, useMemo } from 'react';
import { useAppState } from '../context/AppStateProvider';
import { useProductLine } from './useProductLine';
import type { 
  DynamicUIConfig, 
  UIComponentConfig, 
  ServiceResult,
  ConfigurationUIItem,
  ProductLine,
  OptionSet 
} from '../services/types/ServiceTypes';

export interface UseDynamicUIReturn {
  // UI Configuration
  generateUIConfig: (productLine: ProductLine, options: Record<string, OptionSet>) => Promise<ServiceResult<DynamicUIConfig>>;
  getAvailableUITypes: () => string[];
  validateUIType: (uiType: string) => boolean;
  registerComponent: (uiType: string, component: any) => void;
  getComponent: (uiType: string) => any;
  
  // UI State
  configurationItems: ConfigurationUIItem[];
  isUILoading: boolean;
  
  // Computed values
  hasUIConfiguration: boolean;
  componentCount: number;
}

export const useDynamicUI = (): UseDynamicUIReturn => {
  const { state } = useAppState();
  const { availableOptions, currentProductLine } = useProductLine();

  const generateUIConfig = useCallback(
    async (productLine: ProductLine, options: Record<string, OptionSet>) => {
      return state.services.uiConfiguration.generateUIConfig(productLine, options);
    },
    [state.services.uiConfiguration]
  );

  const getAvailableUITypes = useCallback(() => {
    return state.services.uiConfiguration.getAvailableUITypes();
  }, [state.services.uiConfiguration]);

  const validateUIType = useCallback(
    (uiType: string) => {
      return state.services.uiConfiguration.validateUIType(uiType);
    },
    [state.services.uiConfiguration]
  );

  const registerComponent = useCallback(
    (uiType: string, component: any) => {
      state.services.uiConfiguration.registerComponent(uiType, component);
    },
    [state.services.uiConfiguration]
  );

  const getComponent = useCallback(
    (uiType: string) => {
      return state.services.uiConfiguration.getComponent(uiType);
    },
    [state.services.uiConfiguration]
  );

  const configurationItems = useMemo(() => {
    return state.services.uiConfiguration.getUIConfiguration();
  }, [state.services.uiConfiguration]);

  return {
    // UI Configuration
    generateUIConfig,
    getAvailableUITypes,
    validateUIType,
    registerComponent,
    getComponent,
    
    // UI State
    configurationItems,
    isUILoading: state.isLoading,
    
    // Computed values
    hasUIConfiguration: configurationItems.length > 0,
    componentCount: configurationItems.length,
  };
};