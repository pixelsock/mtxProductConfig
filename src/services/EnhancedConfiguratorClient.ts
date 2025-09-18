/**
 * Enhanced Configurator Client Service
 * Provides dynamic option availability, progressive narrowing, and smart guidance
 * Version: 2.0
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../../supabase';
import {
  EnhancedConfiguratorOption,
  DynamicOptionCollection,
  ConfigurationSummary,
  SelectionGuidance,
  GuidanceResponse,
  OptionDependency,
  MinimumSelection,
  ConfigurationProgress,
  DynamicOptionsResponse,
  SelectionUpdateResponse,
  ValidationResponse,
  ConfigurationState,
  CollectionKey,
  DynamicOptionRow,
  SelectionGuidanceRow,
  ConfigurationSummaryRow,
  OptionDependencyRow,
  MinimumSelectionRow,
  OptionAvailabilityState,
  GuidanceType,
  ConfigurationStateType,
  ENHANCED_CONFIGURATOR_CONFIG,
  ConfiguratorError,
  QueryPerformanceMetrics
} from '../types/enhanced-configurator';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export class EnhancedConfiguratorClient {
  private supabase: SupabaseClient<Database>;
  private cache = new Map<string, CacheEntry<any>>();
  private performanceMetrics: QueryPerformanceMetrics[] = [];

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient<Database>(supabaseUrl, supabaseKey);
  }

  // ============================================================================
  // Core Dynamic Options Methods
  // ============================================================================

  /**
   * Get all available options with dynamic availability states
   */
  async getDynamicOptions(
    productLineId: number,
    currentSelections: ConfigurationState = {}
  ): Promise<DynamicOptionsResponse> {
    const startTime = Date.now();
    const cacheKey = `dynamic_options_${productLineId}_${JSON.stringify(currentSelections)}`;

    // Check cache first
    const cached = this.getCachedData<DynamicOptionsResponse>(cacheKey);
    if (cached) {
      this.recordPerformance('getDynamicOptions', Date.now() - startTime, 0, true);
      return cached;
    }

    try {
      // Get dynamic options
      const { data: optionsData, error: optionsError } = await this.supabase
        .rpc('get_dynamic_options', {
          p_product_line_id: productLineId,
          p_current_selections: currentSelections as any
        });

      if (optionsError) throw new Error(`Dynamic options query failed: ${optionsError.message}`);

      // Get configuration summary
      const summary = await this.getConfigurationSummary(productLineId, currentSelections);

      // Get selection guidance
      const guidance = await this.getSelectionGuidance(productLineId, currentSelections);

      // Get minimum selections requirements
      const requirements = await this.getSelectionRequirements(productLineId);

      // Transform and group options by collection
      const collections = this.transformOptionsToCollections(optionsData || [], currentSelections);

      const response: DynamicOptionsResponse = {
        collections,
        summary,
        guidance,
        requirements,
        productLineId,
        timestamp: Date.now()
      };

      // Cache the response
      this.setCachedData(cacheKey, response, ENHANCED_CONFIGURATOR_CONFIG.DEFAULT_OPTIONS_TTL);
      this.recordPerformance('getDynamicOptions', Date.now() - startTime, collections.length, false);

      return response;
    } catch (error) {
      this.recordPerformance('getDynamicOptions', Date.now() - startTime, 0, false);
      throw this.handleError('DYNAMIC_OPTIONS_FAILED', error);
    }
  }

  /**
   * Update selection and get new configuration state
   */
  async updateSelection(
    productLineId: number,
    collection: CollectionKey,
    optionId: number | null,
    currentSelections: ConfigurationState = {}
  ): Promise<SelectionUpdateResponse> {
    const startTime = Date.now();

    try {
      // Create new selections with the update
      const newSelections = { ...currentSelections };
      const selectionKey = this.getSelectionKey(collection);

      if (optionId === null) {
        delete newSelections[selectionKey];
      } else {
        newSelections[selectionKey] = optionId;
      }

      // Validate the new selection
      const validation = await this.validateConfiguration(productLineId, newSelections);

      if (!validation.isValid && validation.validationErrors.length > 0) {
        return {
          success: false,
          newState: currentSelections,
          progress: await this.getConfigurationProgress(productLineId, currentSelections),
          errors: validation.validationErrors
        };
      }

      // Get updated progress
      const progress = await this.getConfigurationProgress(productLineId, newSelections);

      // Check for auto-selections (forced options)
      const autoSelections = await this.getAutoSelections(productLineId, newSelections);

      // Apply auto-selections if any
      const finalSelections = { ...newSelections, ...autoSelections };

      this.recordPerformance('updateSelection', Date.now() - startTime, 1, false);

      return {
        success: true,
        newState: finalSelections,
        progress,
        autoSelections: Object.keys(autoSelections).length > 0 ? autoSelections : undefined,
        warnings: validation.suggestions
      };
    } catch (error) {
      this.recordPerformance('updateSelection', Date.now() - startTime, 0, false);
      throw this.handleError('SELECTION_UPDATE_FAILED', error);
    }
  }

  // ============================================================================
  // Selection Guidance Methods
  // ============================================================================

  /**
   * Get smart selection guidance based on current state
   */
  async getSelectionGuidance(
    productLineId: number,
    currentSelections: ConfigurationState = {}
  ): Promise<GuidanceResponse> {
    const startTime = Date.now();
    const cacheKey = `guidance_${productLineId}_${JSON.stringify(currentSelections)}`;

    const cached = this.getCachedData<GuidanceResponse>(cacheKey);
    if (cached) {
      this.recordPerformance('getSelectionGuidance', Date.now() - startTime, 0, true);
      return cached;
    }

    try {
      const { data, error } = await this.supabase
        .rpc('get_selection_guidance', {
          p_product_line_id: productLineId,
          p_current_selections: currentSelections as any
        });

      if (error) throw new Error(`Guidance query failed: ${error.message}`);

      const guidanceItems = (data || []).map(this.transformGuidanceRow);

      const response: GuidanceResponse = {
        guidanceItems,
        primaryGuidance: guidanceItems.find(g => g.priorityScore >= 90) || guidanceItems[0] || null,
        hasForced: guidanceItems.some(g => g.guidanceType === 'forced'),
        hasBacktrack: guidanceItems.some(g => g.guidanceType === 'backtrack'),
        isComplete: guidanceItems.some(g => g.guidanceType === 'complete')
      };

      this.setCachedData(cacheKey, response, ENHANCED_CONFIGURATOR_CONFIG.DEFAULT_GUIDANCE_TTL);
      this.recordPerformance('getSelectionGuidance', Date.now() - startTime, guidanceItems.length, false);

      return response;
    } catch (error) {
      this.recordPerformance('getSelectionGuidance', Date.now() - startTime, 0, false);
      throw this.handleError('GUIDANCE_FAILED', error);
    }
  }

  /**
   * Get option dependencies for impact analysis
   */
  async getOptionDependencies(
    productLineId: number,
    collection: CollectionKey,
    optionId: number
  ): Promise<OptionDependency[]> {
    const startTime = Date.now();
    const cacheKey = `dependencies_${productLineId}_${collection}_${optionId}`;

    const cached = this.getCachedData<OptionDependency[]>(cacheKey);
    if (cached) {
      this.recordPerformance('getOptionDependencies', Date.now() - startTime, 0, true);
      return cached;
    }

    try {
      const { data, error } = await this.supabase
        .rpc('get_option_dependencies', {
          p_product_line_id: productLineId,
          p_collection_name: collection,
          p_option_id: optionId
        });

      if (error) throw new Error(`Dependencies query failed: ${error.message}`);

      const dependencies = (data || []).map(this.transformDependencyRow);

      this.setCachedData(cacheKey, dependencies, ENHANCED_CONFIGURATOR_CONFIG.DEFAULT_DEPENDENCIES_TTL);
      this.recordPerformance('getOptionDependencies', Date.now() - startTime, dependencies.length, false);

      return dependencies;
    } catch (error) {
      this.recordPerformance('getOptionDependencies', Date.now() - startTime, 0, false);
      throw this.handleError('DEPENDENCIES_FAILED', error);
    }
  }

  // ============================================================================
  // Configuration State Methods
  // ============================================================================

  /**
   * Get comprehensive configuration summary
   */
  async getConfigurationSummary(
    productLineId: number,
    currentSelections: ConfigurationState = {}
  ): Promise<ConfigurationSummary> {
    const startTime = Date.now();

    try {
      const { data, error } = await this.supabase
        .rpc('get_configuration_summary', {
          p_product_line_id: productLineId,
          p_current_selections: currentSelections as any
        });

      if (error) throw new Error(`Summary query failed: ${error.message}`);

      const summaryData = data?.[0];
      if (!summaryData) {
        throw new Error('No configuration summary data returned');
      }

      const summary = this.transformSummaryRow(summaryData);
      this.recordPerformance('getConfigurationSummary', Date.now() - startTime, 1, false);

      return summary;
    } catch (error) {
      this.recordPerformance('getConfigurationSummary', Date.now() - startTime, 0, false);
      throw this.handleError('SUMMARY_FAILED', error);
    }
  }

  /**
   * Get complete configuration progress including all components
   */
  async getConfigurationProgress(
    productLineId: number,
    currentSelections: ConfigurationState = {}
  ): Promise<ConfigurationProgress> {
    const startTime = Date.now();

    try {
      const [dynamicOptions, guidance, dependencies, minimumSelections] = await Promise.all([
        this.getDynamicOptions(productLineId, currentSelections),
        this.getSelectionGuidance(productLineId, currentSelections),
        this.getAllRelevantDependencies(productLineId, currentSelections),
        this.getMinimumSelections(productLineId)
      ]);

      this.recordPerformance('getConfigurationProgress', Date.now() - startTime, 1, false);

      return {
        summary: dynamicOptions.summary,
        collections: dynamicOptions.collections,
        guidance,
        dependencies,
        minimumSelections
      };
    } catch (error) {
      this.recordPerformance('getConfigurationProgress', Date.now() - startTime, 0, false);
      throw this.handleError('PROGRESS_FAILED', error);
    }
  }

  /**
   * Validate current configuration and get SKU if complete
   */
  async validateConfiguration(
    productLineId: number,
    currentSelections: ConfigurationState = {}
  ): Promise<ValidationResponse> {
    const startTime = Date.now();

    try {
      // First check if we have a product selected (required for validation)
      if (!currentSelections.productId) {
        return {
          isValid: false,
          skuCode: null,
          skuData: null,
          validationErrors: ['Product selection is required'],
          suggestions: ['Please select a product first']
        };
      }

      const { data, error } = await this.supabase
        .rpc('validate_configuration', {
          p_product_id: currentSelections.productId,
          p_selections: currentSelections as any
        });

      if (error) throw new Error(`Validation query failed: ${error.message}`);

      const validationData = data?.[0];

      this.recordPerformance('validateConfiguration', Date.now() - startTime, 1, false);

      return {
        isValid: validationData?.is_valid || false,
        skuCode: validationData?.sku_code || null,
        skuData: validationData?.sku || null,
        validationErrors: validationData?.is_valid ? [] : ['Configuration is incomplete or invalid'],
        suggestions: validationData?.is_valid ? [] : ['Continue making selections to complete configuration']
      };
    } catch (error) {
      this.recordPerformance('validateConfiguration', Date.now() - startTime, 0, false);
      throw this.handleError('VALIDATION_FAILED', error);
    }
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  /**
   * Get minimum required selections for a product line
   */
  private async getMinimumSelections(productLineId: number): Promise<MinimumSelection[]> {
    const { data, error } = await this.supabase
      .rpc('get_minimum_selections_required', {
        p_product_line_id: productLineId
      });

    if (error) throw new Error(`Minimum selections query failed: ${error.message}`);

    return (data || []).map(this.transformMinimumSelectionRow);
  }

  /**
   * Get selection requirements summary
   */
  private async getSelectionRequirements(productLineId: number) {
    const minimumSelections = await this.getMinimumSelections(productLineId);

    return {
      requiredCollections: minimumSelections
        .filter(s => s.isRequired)
        .map(s => s.collectionName as CollectionKey),
      optionalCollections: minimumSelections
        .filter(s => !s.isRequired && s.hasUserChoice)
        .map(s => s.collectionName as CollectionKey),
      autoSelectableCollections: minimumSelections
        .filter(s => !s.hasUserChoice)
        .map(s => s.collectionName as CollectionKey),
      totalRequiredSelections: minimumSelections.filter(s => s.isRequired).length,
      estimatedMinimumSelections: minimumSelections.filter(s => s.hasUserChoice).length
    };
  }

  /**
   * Get auto-selections for forced options
   */
  private async getAutoSelections(
    productLineId: number,
    currentSelections: ConfigurationState
  ): Promise<Record<string, number>> {
    const dynamicOptions = await this.getDynamicOptions(productLineId, currentSelections);
    const autoSelections: Record<string, number> = {};

    for (const collection of dynamicOptions.collections) {
      const forcedOptions = collection.options.filter(o => o.isForced && o.availabilityState === 'available');

      if (forcedOptions.length === 1 && !collection.hasSelection) {
        const selectionKey = this.getSelectionKey(collection.collection);
        autoSelections[selectionKey] = forcedOptions[0].id;
      }
    }

    return autoSelections;
  }

  /**
   * Get all relevant dependencies for current selections
   */
  private async getAllRelevantDependencies(
    productLineId: number,
    currentSelections: ConfigurationState
  ): Promise<OptionDependency[]> {
    const dependencies: OptionDependency[] = [];

    for (const [key, value] of Object.entries(currentSelections)) {
      if (value && typeof value === 'number') {
        const collection = this.getCollectionFromSelectionKey(key);
        if (collection) {
          try {
            const deps = await this.getOptionDependencies(productLineId, collection, value);
            dependencies.push(...deps);
          } catch (error) {
            // Log error but don't fail the entire request
            console.warn(`Failed to get dependencies for ${collection}:${value}`, error);
          }
        }
      }
    }

    return dependencies;
  }

  // ============================================================================
  // Data Transformation Methods
  // ============================================================================

  private transformOptionsToCollections(
    optionsData: DynamicOptionRow[],
    currentSelections: ConfigurationState
  ): DynamicOptionCollection[] {
    const collectionMap = new Map<string, DynamicOptionCollection>();

    for (const row of optionsData) {
      const collection = row.collection_name as CollectionKey;

      if (!collectionMap.has(collection)) {
        const selectionKey = this.getSelectionKey(collection);
        collectionMap.set(collection, {
          collection,
          options: [],
          totalOptions: 0,
          availableOptions: 0,
          forcedOptions: 0,
          hasSelection: selectionKey in currentSelections && currentSelections[selectionKey] != null,
          selectedOptionId: currentSelections[selectionKey] as number | undefined
        });
      }

      const collectionData = collectionMap.get(collection)!;
      const option: EnhancedConfiguratorOption = {
        id: row.option_id,
        name: row.option_name,
        sku_code: row.option_sku_code,
        metadata: row.option_metadata || {},
        availabilityState: row.availability_state,
        skuCount: row.sku_count,
        isForced: row.is_forced,
        selectionPriority: row.selection_priority,
        ...row.option_metadata // Spread any additional metadata
      };

      collectionData.options.push(option);
      collectionData.totalOptions++;

      if (option.availabilityState === 'available') {
        collectionData.availableOptions++;
      }

      if (option.isForced) {
        collectionData.forcedOptions++;
      }
    }

    return Array.from(collectionMap.values())
      .sort((a, b) => a.collection.localeCompare(b.collection));
  }

  private transformGuidanceRow(row: SelectionGuidanceRow): SelectionGuidance {
    return {
      guidanceType: row.guidance_type,
      collectionName: row.collection_name as CollectionKey,
      suggestedOptionId: row.suggested_option_id,
      suggestedOptionName: row.suggested_option_name,
      reason: row.reason,
      impactDescription: row.impact_description,
      resultingSkuCount: row.resulting_sku_count,
      priorityScore: row.priority_score
    };
  }

  private transformSummaryRow(row: ConfigurationSummaryRow): ConfigurationSummary {
    return {
      totalPossibleSkus: row.total_possible_skus,
      currentMatchingSkus: row.current_matching_skus,
      reductionPercentage: row.reduction_percentage,
      selectionsMade: row.selections_made,
      requiredSelectionsRemaining: row.required_selections_remaining,
      estimatedSelectionsToUnique: row.estimated_selections_to_unique,
      isConfigurationComplete: row.is_configuration_complete,
      finalSkuCode: row.final_sku_code,
      configurationState: row.configuration_state
    };
  }

  private transformDependencyRow(row: OptionDependencyRow): OptionDependency {
    return {
      affectedCollection: row.affected_collection as CollectionKey,
      affectedOptionId: row.affected_option_id,
      affectedOptionName: row.affected_option_name,
      dependencyType: row.dependency_type,
      skuCountBefore: row.sku_count_before,
      skuCountAfter: row.sku_count_after,
      impactScore: Math.abs(row.sku_count_before - row.sku_count_after)
    };
  }

  private transformMinimumSelectionRow(row: MinimumSelectionRow): MinimumSelection {
    return {
      collectionName: row.collection_name as CollectionKey,
      isRequired: row.is_required,
      reason: row.reason,
      uniqueOptionsCount: row.unique_options_count,
      hasUserChoice: row.unique_options_count > 1
    };
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  private getSelectionKey(collection: CollectionKey): keyof ConfigurationState {
    const keyMap: Record<CollectionKey, keyof ConfigurationState> = {
      products: 'productId',
      sizes: 'size_id',
      frame_colors: 'frame_color_id',
      accessories: 'accessory_id',
      drivers: 'driver_id',
      light_outputs: 'light_output_id',
      color_temperatures: 'color_temperature_id',
      mounting_options: 'mounting_option_id',
      hanging_techniques: 'hanging_technique_id',
      mirror_styles: 'mirror_style_id',
      light_directions: 'light_direction_id',
      frame_thicknesses: 'frame_thickness_id'
    };
    return keyMap[collection];
  }

  private getCollectionFromSelectionKey(key: string): CollectionKey | null {
    const collectionMap: Record<string, CollectionKey> = {
      productId: 'products',
      size_id: 'sizes',
      frame_color_id: 'frame_colors',
      accessory_id: 'accessories',
      driver_id: 'drivers',
      light_output_id: 'light_outputs',
      color_temperature_id: 'color_temperatures',
      mounting_option_id: 'mounting_options',
      hanging_technique_id: 'hanging_techniques',
      mirror_style_id: 'mirror_styles',
      light_direction_id: 'light_directions',
      frame_thickness_id: 'frame_thicknesses'
    };
    return collectionMap[key] || null;
  }

  // ============================================================================
  // Cache Management
  // ============================================================================

  private getCachedData<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.timestamp + entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  private setCachedData<T>(key: string, data: T, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });

    // Clean up old entries periodically
    if (this.cache.size > 100) {
      this.cleanupCache();
    }
  }

  private cleanupCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.timestamp + entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // ============================================================================
  // Performance Tracking
  // ============================================================================

  private recordPerformance(
    queryType: string,
    duration: number,
    resultCount: number,
    cacheHit: boolean
  ): void {
    this.performanceMetrics.push({
      queryType,
      duration,
      resultCount,
      cacheHit,
      timestamp: Date.now()
    });

    // Keep only recent metrics
    if (this.performanceMetrics.length > 100) {
      this.performanceMetrics = this.performanceMetrics.slice(-50);
    }

    // Warn about slow queries
    if (duration > ENHANCED_CONFIGURATOR_CONFIG.SLOW_QUERY_THRESHOLD) {
      console.warn(`Slow query detected: ${queryType} took ${duration}ms`);
    }
  }

  public getPerformanceMetrics(): QueryPerformanceMetrics[] {
    return [...this.performanceMetrics];
  }

  public clearCache(): void {
    this.cache.clear();
  }

  // ============================================================================
  // Error Handling
  // ============================================================================

  private handleError(code: string, error: any): ConfiguratorError {
    const message = error instanceof Error ? error.message : String(error);

    return {
      code,
      message,
      timestamp: Date.now(),
      context: {
        originalError: error,
        stack: error instanceof Error ? error.stack : undefined
      }
    };
  }
}