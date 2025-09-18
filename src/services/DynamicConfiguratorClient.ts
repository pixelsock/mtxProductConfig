import { createClient } from '@supabase/supabase-js';

// Environment variables
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for the new dynamic configuration system
export interface ConfigurationAttribute {
  id: string;
  code: string;
  name: string;
  data_type: 'select' | 'multi_select' | 'text' | 'number' | 'boolean';
  is_required: boolean;
  is_visible: boolean;
  ui_component: 'dropdown' | 'radio' | 'checkbox' | 'grid' | 'slider' | 'input';
  display_order: number;
  options?: ConfigurationOption[];
}

export interface ConfigurationOption {
  id: string;
  code: string;
  name: string;
  value: any;
  metadata?: Record<string, any>;
  sort_order?: number;
}

export interface ProductConfiguration {
  product: {
    id: number;
    name: string;
    description?: string;
    active: boolean;
  };
  attributes: ConfigurationAttribute[];
}

export interface ConfigurationValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
  configuration: Record<string, any>;
}

export interface ConfigurationPrice {
  base_price: number;
  total_price: number;
  currency: string;
  breakdown: Array<{
    type: 'base' | 'option';
    description: string;
    amount: number;
  }>;
}

export interface ConfigurationStats {
  total_products: number;
  total_attributes: number;
  total_options: number;
  total_configurations: number;
  total_skus_migrated: number;
  total_legacy_skus: number;
  attributes_summary: Record<string, any>;
}

/**
 * Dynamic Product Configurator Client
 *
 * This client interfaces with the new dynamic configuration system
 * that uses configuration_attributes, configuration_options, and dynamic_sku_index
 * instead of the legacy hard-coded rule system.
 */
export class DynamicConfiguratorClient {

  /**
   * Get product configuration for a specific product
   * Returns all available configuration options and attributes
   */
  async getProductConfiguration(productId: number): Promise<ProductConfiguration> {
    const { data, error } = await supabase.rpc('get_product_configuration', {
      p_product_id: productId
    });

    if (error) {
      throw new Error(`Failed to get product configuration: ${error.message}`);
    }

    return data;
  }

  /**
   * Validate a product configuration against business rules
   */
  async validateConfiguration(
    productId: number,
    configuration: Record<string, any>
  ): Promise<ConfigurationValidation> {
    const { data, error } = await supabase.rpc('validate_product_configuration', {
      p_product_id: productId,
      p_configuration: configuration
    });

    if (error) {
      throw new Error(`Failed to validate configuration: ${error.message}`);
    }

    return data;
  }

  /**
   * Generate SKU for a complete configuration
   */
  async generateSKU(
    productId: number,
    configuration: Record<string, any>
  ): Promise<string> {
    const { data, error } = await supabase.rpc('generate_dynamic_sku', {
      p_product_id: productId,
      p_configuration: configuration
    });

    if (error) {
      throw new Error(`Failed to generate SKU: ${error.message}`);
    }

    return data;
  }

  /**
   * Calculate price for a configuration
   */
  async calculatePrice(
    productId: number,
    configuration: Record<string, any>
  ): Promise<ConfigurationPrice> {
    const { data, error } = await supabase.rpc('calculate_configuration_price', {
      p_product_id: productId,
      p_configuration: configuration
    });

    if (error) {
      throw new Error(`Failed to calculate price: ${error.message}`);
    }

    return data;
  }

  /**
   * Get system statistics for the dynamic configurator
   */
  async getStats(): Promise<ConfigurationStats> {
    const { data, error } = await supabase.rpc('get_configuration_stats', {});

    if (error) {
      throw new Error(`Failed to get configuration stats: ${error.message}`);
    }

    return data;
  }

  /**
   * Check configuration dependencies and business rules
   */
  async checkDependencies(
    configuration: Record<string, any>
  ): Promise<{
    valid_combinations: Record<string, any>[];
    conflicts: Record<string, any>[];
    suggestions: Record<string, any>[];
  }> {
    const { data, error } = await supabase.rpc('check_configuration_dependencies', {
      p_configuration: configuration
    });

    if (error) {
      throw new Error(`Failed to check dependencies: ${error.message}`);
    }

    return data;
  }

  /**
   * Get all available products with configuration support
   */
  async getConfigurableProducts(): Promise<Array<{
    id: number;
    name: string;
    description?: string;
    active: boolean;
    has_configuration: boolean;
    attribute_count: number;
  }>> {
    const { data, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        description,
        active,
        product_configurations!inner (
          id
        )
      `)
      .eq('active', true);

    if (error) {
      throw new Error(`Failed to get configurable products: ${error.message}`);
    }

    return data.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      active: product.active,
      has_configuration: (product.product_configurations as any[]).length > 0,
      attribute_count: (product.product_configurations as any[]).length
    }));
  }

  /**
   * Get all configuration attributes (for admin/debug purposes)
   */
  async getAllAttributes(): Promise<ConfigurationAttribute[]> {
    const { data, error } = await supabase
      .from('configuration_attributes')
      .select(`
        *,
        configuration_options (*)
      `)
      .eq('is_active', true)
      .order('display_order');

    if (error) {
      throw new Error(`Failed to get configuration attributes: ${error.message}`);
    }

    return data.map(attr => ({
      ...attr,
      options: attr.configuration_options || []
    }));
  }

  /**
   * Test endpoint for debugging and validation
   */
  async testConnection(): Promise<{
    connected: boolean;
    stats: ConfigurationStats;
    sample_product?: ProductConfiguration;
  }> {
    try {
      const stats = await this.getStats();
      const products = await this.getConfigurableProducts();

      let sampleProduct;
      if (products.length > 0) {
        sampleProduct = await this.getProductConfiguration(products[0].id);
      }

      return {
        connected: true,
        stats,
        sample_product: sampleProduct
      };
    } catch (error) {
      return {
        connected: false,
        stats: {
          total_products: 0,
          total_attributes: 0,
          total_options: 0,
          total_configurations: 0,
          total_skus_migrated: 0,
          total_legacy_skus: 0,
          attributes_summary: {}
        }
      };
    }
  }
}

// Export singleton instance
export const dynamicConfiguratorClient = new DynamicConfiguratorClient();