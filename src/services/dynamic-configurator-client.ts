/**
 * Dynamic Configurator Client - Server-Side Logic Integration
 * 
 * This client interfaces with the new server-side functions to provide
 * a fully dynamic configurator that adapts to any schema changes.
 */

import { supabase } from './supabase';

export interface ConfigurationSchema {
  [collectionKey: string]: ConfigurationOption[];
}

export interface ConfigurationOption {
  id: number;
  name: string;
  skuCode: string;
  active: boolean;
  sort: number;
  description?: string;
  hexCode?: string;
  width?: number;
  height?: number;
}

export interface ConfigurationUI {
  id: string;
  collection: string;
  uiType: string;
  sort: number;
}

export interface FilteredOptionsResponse {
  options: ConfigurationSchema;
  disabledOptions: Record<string, number[]>;
  setValues: Record<string, any>;
  appliedRules: Array<{
    id: string;
    name: string;
    priority: number;
  }>;
  productLineId: number;
  currentSelections: Record<string, any>;
}

export interface ProductImage {
  productId: number;
  productName: string;
  verticalImage: string | null;
  horizontalImage: string | null;
  recommendedOrientation: 'vertical' | 'horizontal';
}

export class DynamicConfiguratorClient {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Get the configuration schema for a product line with canonical naming
   */
  async getConfigurationSchema(productLineId: number): Promise<ConfigurationSchema> {
    const cacheKey = `schema_${productLineId}`;
    
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)!.data;
    }

    try {
      const { data, error } = await supabase.rpc('get_configuration_schema', {
        p_product_line_id: productLineId
      });

      if (error) throw error;

      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      return data || {};
    } catch (error) {
      console.error('Failed to get configuration schema:', error);
      return {};
    }
  }

  /**
   * Get filtered options with server-side rules processing
   */
  async getFilteredOptions(
    productLineId: number,
    currentSelections: Record<string, any> = {}
  ): Promise<FilteredOptionsResponse> {
    const cacheKey = `filtered_${productLineId}_${JSON.stringify(currentSelections)}`;
    
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)!.data;
    }

    try {
      const { data, error } = await supabase.rpc('get_filtered_options', {
        p_product_line_id: productLineId,
        p_current_selections: currentSelections
      });

      if (error) throw error;

      const result: FilteredOptionsResponse = {
        options: data?.options || {},
        disabledOptions: data?.disabledOptions || {},
        setValues: data?.setValues || {},
        appliedRules: data?.appliedRules || [],
        productLineId,
        currentSelections
      };

      this.cache.set(cacheKey, { data: result, timestamp: Date.now() });
      return result;
    } catch (error) {
      console.error('Failed to get filtered options:', error);
      
      // Fallback to schema-only response
      const schema = await this.getConfigurationSchema(productLineId);
      return {
        options: schema,
        disabledOptions: {},
        setValues: {},
        appliedRules: [],
        productLineId,
        currentSelections
      };
    }
  }

  /**
   * Get product images based on current configuration
   */
  async getProductImages(
    productLineId: number,
    currentSelections: Record<string, any>
  ): Promise<ProductImage | null> {
    try {
      const { data, error } = await supabase.rpc('get_product_images', {
        p_product_line_id: productLineId,
        p_current_selections: currentSelections
      });

      if (error) throw error;

      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Failed to get product images:', error);
      return null;
    }
  }

  /**
   * Auto-discover option collections from database schema
   */
  async getOptionCollections(): Promise<Array<{
    tableName: string;
    collectionKey: string;
    fieldMapping: Record<string, string>;
  }>> {
    const cacheKey = 'option_collections';
    
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)!.data;
    }

    try {
      const { data, error } = await supabase.rpc('get_option_collections');

      if (error) throw error;

      this.cache.set(cacheKey, { data: data || [], timestamp: Date.now() });
      return data || [];
    } catch (error) {
      console.error('Failed to get option collections:', error);
      return [];
    }
  }

  /**
   * Clear cache for fresh data
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Check if cache entry is valid
   */
  private isCacheValid(key: string): boolean {
    const cached = this.cache.get(key);
    if (!cached) return false;
    return Date.now() - cached.timestamp < this.CACHE_TTL;
  }

  /**
   * Get cache statistics for debugging
   */
  getCacheStats(): {
    entries: number;
    totalSize: number;
    hitRate: number;
  } {
    return {
      entries: this.cache.size,
      totalSize: Array.from(this.cache.values())
        .reduce((sum, entry) => sum + JSON.stringify(entry.data).length, 0),
      hitRate: 0 // Would need hit/miss tracking for accurate calculation
    };
  }
}

// Export singleton instance
export const dynamicConfiguratorClient = new DynamicConfiguratorClient();