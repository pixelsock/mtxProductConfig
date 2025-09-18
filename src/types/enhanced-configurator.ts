/**
 * Enhanced Configurator Types for Dynamic Option Availability
 * Supports progressive narrowing, option state tracking, and smart guidance
 * Version: 2.0
 */

import { Database } from '../../supabase';
import { ConfigurationState, CollectionKey } from './database';

// ============================================================================
// Enhanced Option Types
// ============================================================================

export type OptionAvailabilityState = 'available' | 'disabled' | 'hidden';

export interface EnhancedConfiguratorOption {
  id: number;
  name: string;
  sku_code: string;
  metadata: Record<string, any>;
  availabilityState: OptionAvailabilityState;
  skuCount: number;
  isForced: boolean; // true if this is the only available option
  selectionPriority: number;

  // Collection-specific fields
  hex_code?: string; // frame_colors
  width?: string;    // sizes
  height?: string;   // sizes
  description?: string;
  price?: number;
  sort?: number;
}

export interface DynamicOptionCollection {
  collection: CollectionKey;
  options: EnhancedConfiguratorOption[];
  totalOptions: number;
  availableOptions: number;
  forcedOptions: number; // options where is_forced = true
  hasSelection: boolean;
  selectedOptionId?: number;
}

// ============================================================================
// Selection Guidance Types
// ============================================================================

export type GuidanceType = 'complete' | 'backtrack' | 'forced' | 'narrow' | 'recommend';

export interface SelectionGuidance {
  guidanceType: GuidanceType;
  collectionName: CollectionKey | '';
  suggestedOptionId: number | null;
  suggestedOptionName: string;
  reason: string;
  impactDescription: string;
  resultingSkuCount: number;
  priorityScore: number;
}

export interface GuidanceResponse {
  guidanceItems: SelectionGuidance[];
  primaryGuidance: SelectionGuidance | null;
  hasForced: boolean;
  hasBacktrack: boolean;
  isComplete: boolean;
}

// ============================================================================
// Configuration State and Progress
// ============================================================================

export type ConfigurationStateType = 'starting' | 'in_progress' | 'narrowing' | 'complete' | 'invalid';

export interface ConfigurationSummary {
  totalPossibleSkus: number;
  currentMatchingSkus: number;
  reductionPercentage: number;
  selectionsMade: number;
  requiredSelectionsRemaining: number;
  estimatedSelectionsToUnique: number;
  isConfigurationComplete: boolean;
  finalSkuCode: string | null;
  configurationState: ConfigurationStateType;
}

export interface ConfigurationProgress {
  summary: ConfigurationSummary;
  collections: DynamicOptionCollection[];
  guidance: GuidanceResponse;
  dependencies: OptionDependency[];
  minimumSelections: MinimumSelection[];
}

// ============================================================================
// Option Dependencies and Relationships
// ============================================================================

export type DependencyType = 'enables' | 'disables' | 'requires' | 'affects' | 'no_change';

export interface OptionDependency {
  affectedCollection: CollectionKey;
  affectedOptionId: number;
  affectedOptionName: string;
  dependencyType: DependencyType;
  skuCountBefore: number;
  skuCountAfter: number;
  impactScore: number; // calculated: abs(before - after)
}

export interface OptionImpactAnalysis {
  collection: CollectionKey;
  optionId: number;
  optionName: string;
  dependencies: OptionDependency[];
  totalImpact: number;
  recommendationScore: number;
}

// ============================================================================
// Minimum Selections
// ============================================================================

export interface MinimumSelection {
  collectionName: CollectionKey;
  isRequired: boolean;
  reason: string;
  uniqueOptionsCount: number;
  hasUserChoice: boolean; // true if user needs to make a choice
}

export interface SelectionRequirements {
  requiredCollections: CollectionKey[];
  optionalCollections: CollectionKey[];
  autoSelectableCollections: CollectionKey[]; // collections with only one option
  totalRequiredSelections: number;
  estimatedMinimumSelections: number;
}

// ============================================================================
// Enhanced API Response Types
// ============================================================================

export interface DynamicOptionsResponse {
  collections: DynamicOptionCollection[];
  summary: ConfigurationSummary;
  guidance: GuidanceResponse;
  requirements: SelectionRequirements;
  productLineId: number;
  timestamp: number;
}

export interface SelectionUpdateResponse {
  success: boolean;
  newState: ConfigurationState;
  progress: ConfigurationProgress;
  autoSelections?: Record<CollectionKey, number>; // auto-applied selections
  warnings?: string[];
  errors?: string[];
}

export interface ValidationResponse {
  isValid: boolean;
  skuCode: string | null;
  skuData: any | null;
  validationErrors: string[];
  suggestions: string[];
}

// ============================================================================
// Enhanced Configuration Context
// ============================================================================

export interface EnhancedConfiguratorState {
  // Core state
  productLineId: number | null;
  currentSelections: ConfigurationState;

  // Dynamic data
  progress: ConfigurationProgress | null;
  lastUpdate: number;

  // UI state
  isLoading: boolean;
  loadingCollections: Set<CollectionKey>;
  errors: Record<string, string>;
  warnings: string[];

  // Performance tracking
  queryCount: number;
  lastQueryDuration: number;
  cacheHitRatio: number;
}

export interface ConfiguratorAction {
  type: 'SELECT_OPTION' | 'CLEAR_SELECTION' | 'RESET_ALL' | 'APPLY_GUIDANCE' | 'SET_LOADING' | 'SET_ERROR';
  payload?: any;
}

// ============================================================================
// Query and Filter Types
// ============================================================================

export interface DynamicOptionsQuery {
  productLineId: number;
  currentSelections: ConfigurationState;
  includeDisabled?: boolean;
  includeHidden?: boolean;
  collections?: CollectionKey[];
  sortBy?: 'priority' | 'name' | 'sku_count';
  sortOrder?: 'asc' | 'desc';
}

export interface GuidanceQuery {
  productLineId: number;
  currentSelections: ConfigurationState;
  guidanceTypes?: GuidanceType[];
  maxSuggestions?: number;
  priorityThreshold?: number;
}

export interface DependencyQuery {
  productLineId: number;
  collection: CollectionKey;
  optionId: number;
  includeNoChange?: boolean;
  minImpactThreshold?: number;
}

// ============================================================================
// Performance and Optimization Types
// ============================================================================

export interface QueryPerformanceMetrics {
  queryType: string;
  duration: number;
  resultCount: number;
  cacheHit: boolean;
  timestamp: number;
}

export interface ConfiguratorPerformance {
  totalQueries: number;
  averageQueryTime: number;
  cacheHitRate: number;
  slowQueries: QueryPerformanceMetrics[];
  lastOptimizationCheck: number;
}

export interface CacheConfiguration {
  optionsTTL: number;
  guidanceTTL: number;
  dependenciesTTL: number;
  maxCacheSize: number;
  preloadPopularConfigurations: boolean;
}

// ============================================================================
// Database Function Types (matching SQL functions)
// ============================================================================

export interface GetDynamicOptionsParams {
  p_product_line_id: number;
  p_current_selections?: Record<string, any>;
}

export interface GetSelectionGuidanceParams {
  p_product_line_id: number;
  p_current_selections?: Record<string, any>;
}

export interface GetConfigurationSummaryParams {
  p_product_line_id: number;
  p_current_selections?: Record<string, any>;
}

export interface GetOptionDependenciesParams {
  p_product_line_id: number;
  p_collection_name: string;
  p_option_id: number;
}

export interface GetMinimumSelectionsParams {
  p_product_line_id: number;
}

// Database function result types (matching SQL return types)
export interface DynamicOptionRow {
  collection_name: string;
  option_id: number;
  option_name: string;
  option_sku_code: string;
  option_metadata: any;
  availability_state: OptionAvailabilityState;
  sku_count: number;
  is_forced: boolean;
  selection_priority: number;
}

export interface SelectionGuidanceRow {
  guidance_type: GuidanceType;
  collection_name: string;
  suggested_option_id: number | null;
  suggested_option_name: string;
  reason: string;
  impact_description: string;
  resulting_sku_count: number;
  priority_score: number;
}

export interface ConfigurationSummaryRow {
  total_possible_skus: number;
  current_matching_skus: number;
  reduction_percentage: number;
  selections_made: number;
  required_selections_remaining: number;
  estimated_selections_to_unique: number;
  is_configuration_complete: boolean;
  final_sku_code: string | null;
  configuration_state: ConfigurationStateType;
}

export interface OptionDependencyRow {
  affected_collection: string;
  affected_option_id: number;
  affected_option_name: string;
  dependency_type: DependencyType;
  sku_count_before: number;
  sku_count_after: number;
}

export interface MinimumSelectionRow {
  collection_name: string;
  is_required: boolean;
  reason: string;
  unique_options_count: number;
}

// ============================================================================
// Utility Functions and Type Guards
// ============================================================================

export function isValidGuidanceType(type: string): type is GuidanceType {
  return ['complete', 'backtrack', 'forced', 'narrow', 'recommend'].includes(type);
}

export function isValidAvailabilityState(state: string): state is OptionAvailabilityState {
  return ['available', 'disabled', 'hidden'].includes(state);
}

export function isValidConfigurationState(state: string): state is ConfigurationStateType {
  return ['starting', 'in_progress', 'narrowing', 'complete', 'invalid'].includes(state);
}

export function isValidDependencyType(type: string): type is DependencyType {
  return ['enables', 'disables', 'requires', 'affects', 'no_change'].includes(type);
}

// ============================================================================
// Constants and Configuration
// ============================================================================

export const ENHANCED_CONFIGURATOR_CONFIG = {
  // Performance thresholds
  SLOW_QUERY_THRESHOLD: 1000, // milliseconds
  MAX_GUIDANCE_SUGGESTIONS: 5,
  MIN_IMPACT_THRESHOLD: 0.1, // 10% change in SKU count

  // Cache settings
  DEFAULT_OPTIONS_TTL: 5 * 60 * 1000, // 5 minutes
  DEFAULT_GUIDANCE_TTL: 2 * 60 * 1000, // 2 minutes
  DEFAULT_DEPENDENCIES_TTL: 10 * 60 * 1000, // 10 minutes

  // UI behavior
  AUTO_APPLY_FORCED_SELECTIONS: true,
  SHOW_DISABLED_OPTIONS: true,
  SHOW_HIDDEN_OPTIONS: false,

  // Priority scoring
  FORCED_SELECTION_PRIORITY: 95,
  NARROWING_SELECTION_PRIORITY: 80,
  COMPLETION_PRIORITY: 100,
  BACKTRACK_PRIORITY: 90,

  // Selection guidance
  OPTIMAL_SKU_RANGE: { min: 1, max: 10 },
  WARNING_SKU_THRESHOLD: 50,
  MAX_SKU_BEFORE_GUIDANCE: 100,
} as const;

export type EnhancedConfiguratorConfig = typeof ENHANCED_CONFIGURATOR_CONFIG;

// ============================================================================
// Error Types
// ============================================================================

export interface ConfiguratorError {
  code: string;
  message: string;
  collection?: CollectionKey;
  optionId?: number;
  context?: Record<string, any>;
  timestamp: number;
}

export class ConfiguratorValidationError extends Error {
  constructor(
    message: string,
    public code: string,
    public collection?: CollectionKey,
    public optionId?: number,
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = 'ConfiguratorValidationError';
  }
}

export class ConfiguratorPerformanceError extends Error {
  constructor(
    message: string,
    public queryType: string,
    public duration: number,
    public threshold: number
  ) {
    super(message);
    this.name = 'ConfiguratorPerformanceError';
  }
}

// ============================================================================
// Export all types
// ============================================================================

export * from './database';