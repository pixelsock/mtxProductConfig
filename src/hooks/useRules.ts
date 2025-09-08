import { useCallback } from 'react';
import { useAppState } from '../context/AppStateProvider';
import { useConfiguration } from '../context/ConfigurationProvider';
import type { 
  ProductConfiguration, 
  ServiceResult, 
  RuleOverrides,
  Rule 
} from '../services/types/ServiceTypes';

export interface UseRulesReturn {
  // State
  constraints: Record<string, any>;
  isProcessingRules: boolean;
  
  // Actions
  processConfiguration: (config: ProductConfiguration) => Promise<ServiceResult<{ constraints: Record<string, any>; overrides: RuleOverrides }>>;
  computeRuleOverrides: (config?: ProductConfiguration) => Promise<ServiceResult<RuleOverrides>>;
  applyRules: (config: ProductConfiguration) => Promise<ServiceResult<void>>;
  
  // Rule Management
  loadRules: () => Promise<ServiceResult<Rule[]>>;
  validateRule: (rule: Rule) => boolean;
  
  // Computed values
  hasConstraints: boolean;
  constraintCount: number;
  activeRulesCount: number;
}

export const useRules = (): UseRulesReturn => {
  const { state } = useAppState();
  const { constraints, configuration, computeRuleOverrides: contextComputeOverrides } = useConfiguration();

  const processConfiguration = useCallback(
    async (config: ProductConfiguration) => {
      return state.services.rules.processConfiguration(config);
    },
    [state.services.rules]
  );

  const computeRuleOverrides = useCallback(
    async (config?: ProductConfiguration) => {
      if (config) {
        return state.services.rules.computeRuleOverrides(config);
      }
      return contextComputeOverrides();
    },
    [state.services.rules, contextComputeOverrides]
  );

  const applyRules = useCallback(
    async (config: ProductConfiguration) => {
      const result = await state.services.rules.processConfiguration(config);
      if (result.success) {
        // Rules have been applied - constraints will be updated through event system
        return { success: true };
      }
      return { success: false, error: result.error };
    },
    [state.services.rules]
  );

  const loadRules = useCallback(async () => {
    try {
      // This would load rules from the API - implementation depends on rules service
      const rules = await state.services.rules.loadRules();
      return { success: true, data: rules };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load rules';
      return { success: false, error: errorMessage };
    }
  }, [state.services.rules]);

  const validateRule = useCallback(
    (rule: Rule) => {
      return state.services.rules.validateRule(rule);
    },
    [state.services.rules]
  );

  // Calculate constraint count
  const constraintCount = Object.keys(constraints).reduce((count, collection) => {
    const collectionConstraints = constraints[collection];
    if (collectionConstraints) {
      if (collectionConstraints.allow?.size > 0) count++;
      if (collectionConstraints.deny?.size > 0) count++;
    }
    return count;
  }, 0);

  return {
    // State
    constraints,
    isProcessingRules: state.isLoading, // Could be more specific with rules processing state
    
    // Actions
    processConfiguration,
    computeRuleOverrides,
    applyRules,
    
    // Rule Management
    loadRules,
    validateRule,
    
    // Computed values
    hasConstraints: Object.keys(constraints).length > 0,
    constraintCount,
    activeRulesCount: 0, // Would need to track loaded rules in service
  };
};