/**
 * Enhanced Dynamic Configurator Client
 *
 * This service bridges our existing functions with the enhanced dynamic
 * option availability features. It provides the foundation for real-time
 * option state management and progressive narrowing.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface OptionAvailabilityState {
  collection_name: string;
  option_id: number;
  option_name: string;
  option_sku_code: string;
  option_metadata: Record<string, any>;
  availability_state: 'available' | 'disabled' | 'hidden';
  sku_count: number;
  is_forced: boolean;
  selection_priority: number;
}

export interface SelectionGuidance {
  guidance_type: 'complete' | 'forced' | 'narrow' | 'backtrack';
  collection_name: string;
  suggested_option_id?: number;
  suggested_option_name?: string;
  reason: string;
  impact_description: string;
  resulting_sku_count: number;
  priority_score: number;
}

export interface ConfigurationSummary {
  total_possible_skus: number;
  current_matching_skus: number;
  reduction_percentage: number;
  selections_made: number;
  required_selections_remaining: number;
  estimated_selections_to_unique: number;
  is_configuration_complete: boolean;
  final_sku_code?: string;
  configuration_state: 'starting' | 'in_progress' | 'narrowing' | 'complete' | 'invalid';
}

export interface EnhancedProductLine {
  id: number;
  name: string;
  code: string;
  total_products: number;
  available_attributes: number;
  requires_enhanced_functions: boolean;
}

export interface CurrentSelection {
  [key: string]: any;
}

export class EnhancedDynamicConfiguratorClient {
  private supabase: SupabaseClient;
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Get active product lines with enhanced metadata
   */
  async getEnhancedProductLines(): Promise<EnhancedProductLine[]> {
    const cacheKey = 'enhanced_product_lines';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      // Use existing function but enhance the response
      const { data, error } = await this.supabase.rpc('get_active_product_lines');

      if (error) throw error;

      const enhancedLines: EnhancedProductLine[] = data.map((line: any) => ({
        id: line.id,
        name: line.name,
        code: line.code,
        total_products: line.total_products,
        available_attributes: line.attributes?.length || 0,
        requires_enhanced_functions: line.total_products > 1 // Multi-product lines benefit from enhanced features
      }));

      this.setCache(cacheKey, enhancedLines);
      return enhancedLines;
    } catch (error) {
      console.error('Error fetching enhanced product lines:', error);
      throw new Error('Failed to load product lines');
    }
  }

  /**
   * Get dynamic options with availability states
   * Falls back to existing functions if enhanced functions aren't available
   */
  async getDynamicOptions(
    productLineId: number,
    currentSelections: CurrentSelection = {}
  ): Promise<OptionAvailabilityState[]> {
    const cacheKey = `dynamic_options_${productLineId}_${JSON.stringify(currentSelections)}`;
    const cached = this.getFromCache(cacheKey, 2 * 60 * 1000); // 2 minute cache
    if (cached) return cached;

    try {
      // Try enhanced function first
      const { data: enhancedData, error: enhancedError } = await this.supabase
        .rpc('get_dynamic_options', {
          p_product_line_id: productLineId,
          p_current_selections: currentSelections
        });

      if (!enhancedError && enhancedData) {
        this.setCache(cacheKey, enhancedData, 2 * 60 * 1000);
        return enhancedData;
      }

      // Fallback to existing function with state simulation
      console.log('Enhanced functions not available, using fallback with state simulation');
      return await this.simulateDynamicOptions(productLineId, currentSelections);

    } catch (error) {
      console.error('Error fetching dynamic options:', error);
      return await this.simulateDynamicOptions(productLineId, currentSelections);
    }
  }

  /**
   * Simulate dynamic options using existing functions
   */
  private async simulateDynamicOptions(
    productLineId: number,
    currentSelections: CurrentSelection
  ): Promise<OptionAvailabilityState[]> {
    try {
      const { data, error } = await this.supabase.rpc('get_available_options', {
        p_product_line_id: productLineId,
        p_current_selection: currentSelections
      });

      if (error) throw error;

      const simulatedOptions: OptionAvailabilityState[] = [];
      const availableAttributes = data.available_attributes || {};

      Object.entries(availableAttributes).forEach(([collectionName, attrData]: [string, any]) => {
        const options = attrData.available_options || [];

        options.forEach((option: any, index: number) => {
          simulatedOptions.push({
            collection_name: collectionName,
            option_id: option.id || index,
            option_name: option.name || option.code,
            option_sku_code: option.code || '',
            option_metadata: option.metadata || {},
            availability_state: 'available' as const,
            sku_count: Math.max(1, Math.floor(data.matching_count / options.length)), // Estimate
            is_forced: options.length === 1,
            selection_priority: index + 1
          });
        });
      });

      return simulatedOptions;
    } catch (error) {
      console.error('Error simulating dynamic options:', error);
      return [];
    }
  }

  /**
   * Get selection guidance
   */
  async getSelectionGuidance(
    productLineId: number,
    currentSelections: CurrentSelection = {}
  ): Promise<SelectionGuidance[]> {
    try {
      // Try enhanced function first
      const { data: enhancedData, error: enhancedError } = await this.supabase
        .rpc('get_selection_guidance', {
          p_product_line_id: productLineId,
          p_current_selections: currentSelections
        });

      if (!enhancedError && enhancedData) {
        return enhancedData;
      }

      // Fallback to basic guidance
      return await this.simulateSelectionGuidance(productLineId, currentSelections);

    } catch (error) {
      console.error('Error fetching selection guidance:', error);
      return await this.simulateSelectionGuidance(productLineId, currentSelections);
    }
  }

  /**
   * Simulate selection guidance using existing functions
   */
  private async simulateSelectionGuidance(
    productLineId: number,
    currentSelections: CurrentSelection
  ): Promise<SelectionGuidance[]> {
    try {
      const { data, error } = await this.supabase.rpc('get_available_options', {
        p_product_line_id: productLineId,
        p_current_selection: currentSelections
      });

      if (error) throw error;

      const guidance: SelectionGuidance[] = [];
      const matchingCount = data.matching_count || 0;
      const selectionsCount = Object.keys(currentSelections).length;

      // Determine guidance based on current state
      if (matchingCount === 1) {
        guidance.push({
          guidance_type: 'complete',
          collection_name: '',
          reason: 'Configuration is complete - unique product found',
          impact_description: `Your selections result in exactly one product`,
          resulting_sku_count: 1,
          priority_score: 100
        });
      } else if (matchingCount === 0) {
        guidance.push({
          guidance_type: 'backtrack',
          collection_name: '',
          reason: 'No products match current selections',
          impact_description: 'Please modify your selections to find matching products',
          resulting_sku_count: 0,
          priority_score: 90
        });
      } else if (selectionsCount === 0) {
        guidance.push({
          guidance_type: 'narrow',
          collection_name: 'size',
          reason: 'Start by selecting a size to narrow your options',
          impact_description: 'Size selection typically reduces options significantly',
          resulting_sku_count: Math.floor(matchingCount / 2),
          priority_score: 80
        });
      } else {
        guidance.push({
          guidance_type: 'narrow',
          collection_name: 'frame_color',
          reason: 'Continue narrowing with color selection',
          impact_description: `From ${matchingCount} products, select additional options`,
          resulting_sku_count: Math.floor(matchingCount / 3),
          priority_score: 70
        });
      }

      return guidance;
    } catch (error) {
      console.error('Error simulating selection guidance:', error);
      return [];
    }
  }

  /**
   * Get configuration summary
   */
  async getConfigurationSummary(
    productLineId: number,
    currentSelections: CurrentSelection = {}
  ): Promise<ConfigurationSummary> {
    try {
      // Try enhanced function first
      const { data: enhancedData, error: enhancedError } = await this.supabase
        .rpc('get_configuration_summary', {
          p_product_line_id: productLineId,
          p_current_selections: currentSelections
        });

      if (!enhancedError && enhancedData && enhancedData.length > 0) {
        return enhancedData[0];
      }

      // Fallback to simulated summary
      return await this.simulateConfigurationSummary(productLineId, currentSelections);

    } catch (error) {
      console.error('Error fetching configuration summary:', error);
      return await this.simulateConfigurationSummary(productLineId, currentSelections);
    }
  }

  /**
   * Simulate configuration summary
   */
  private async simulateConfigurationSummary(
    productLineId: number,
    currentSelections: CurrentSelection
  ): Promise<ConfigurationSummary> {
    try {
      const { data, error } = await this.supabase.rpc('get_available_options', {
        p_product_line_id: productLineId,
        p_current_selection: currentSelections
      });

      if (error) throw error;

      const currentMatching = data.matching_count || 0;
      const selectionsCount = Object.keys(currentSelections).length;
      const estimatedTotal = currentMatching * Math.pow(2, Math.max(0, 3 - selectionsCount));

      return {
        total_possible_skus: estimatedTotal,
        current_matching_skus: currentMatching,
        reduction_percentage: estimatedTotal > 0 ? ((estimatedTotal - currentMatching) / estimatedTotal) * 100 : 0,
        selections_made: selectionsCount,
        required_selections_remaining: Math.max(0, 3 - selectionsCount),
        estimated_selections_to_unique: currentMatching <= 1 ? 0 : Math.ceil(Math.log2(currentMatching)),
        is_configuration_complete: currentMatching === 1,
        final_sku_code: currentMatching === 1 ? 'SKU-Generated' : undefined,
        configuration_state: this.determineConfigurationState(currentMatching, selectionsCount)
      };
    } catch (error) {
      console.error('Error simulating configuration summary:', error);
      return this.getDefaultConfigurationSummary();
    }
  }

  /**
   * Determine configuration state based on current conditions
   */
  private determineConfigurationState(
    matchingCount: number,
    selectionsCount: number
  ): ConfigurationSummary['configuration_state'] {
    if (matchingCount === 0) return 'invalid';
    if (matchingCount === 1) return 'complete';
    if (selectionsCount === 0) return 'starting';
    if (matchingCount <= 10) return 'narrowing';
    return 'in_progress';
  }

  /**
   * Get default configuration summary
   */
  private getDefaultConfigurationSummary(): ConfigurationSummary {
    return {
      total_possible_skus: 0,
      current_matching_skus: 0,
      reduction_percentage: 0,
      selections_made: 0,
      required_selections_remaining: 3,
      estimated_selections_to_unique: 3,
      is_configuration_complete: false,
      configuration_state: 'starting'
    };
  }

  /**
   * Cache management
   */
  private getFromCache(key: string, customTtl?: number): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const ttl = customTtl || this.CACHE_TTL;
    if (Date.now() - cached.timestamp > ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  private setCache(key: string, data: any, customTtl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: customTtl || this.CACHE_TTL
    });
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Check if enhanced functions are available
   */
  async checkEnhancedFunctionsAvailable(): Promise<boolean> {
    try {
      const { error } = await this.supabase.rpc('get_dynamic_options', {
        p_product_line_id: 1,
        p_current_selections: {}
      });

      return !error;
    } catch {
      return false;
    }
  }
}