/**
 * Smart Product Configurator Service
 * 
 * Implements intelligent SKU generation with real-time filtering and validation
 * based on product constraints, business rules, and user selections.
 */

import {
  getAllProducts,
  getActiveProductLines,
  getRules,
  getActiveFrameColors,
  getActiveSizes,
  getActiveLightOutputs,
  getActiveColorTemperatures,
  getActiveDrivers,
  getActiveMountingOptions,
  getActiveAccessories,
  getActiveLightDirections,
  getActiveFrameThicknesses,
  getActiveMirrorStyles,
  type Product,
  type ProductLine,
  type Rule,
  type FrameColor,
  type Size,
  type LightOutput,
  type ColorTemperature,
  type Driver,
  type MountingOption,
  type Accessory,
  type LightDirection,
  type FrameThickness,
  type MirrorStyle
} from './directus';

import { 
  evaluateRuleConditions, 
  applyRuleActions, 
  buildRuleConstraints,
  applyConstraintsToIds,
  type RuleConstraints 
} from './rules-engine';

// Configuration interface matching the smart generator logic
export interface SmartConfig {
  product_id?: number;
  product_line?: number;
  frame_color?: number;
  size?: number;
  light_output?: number;
  color_temperature?: number;
  driver?: number;
  mounting_option?: number;
  accessory?: number[]; // Array for multi-select accessories
  [key: string]: any; // Allow rule-added fields
}

// Collection data structure
export interface CollectionData {
  products: Product[];
  productLines: ProductLine[];
  rules: Rule[];
  frameColors: FrameColor[];
  sizes: Size[];
  lightOutputs: LightOutput[];
  colorTemperatures: ColorTemperature[];
  drivers: Driver[];
  mountingOptions: MountingOption[];
  accessories: Accessory[];
  lightDirections: LightDirection[];
  frameThicknesses: FrameThickness[];
  mirrorStyles: MirrorStyle[];
}

// Available options for a configuration
export interface AvailableOptions {
  products: Product[];
  frameColors: FrameColor[];
  sizes: Size[];
  lightOutputs: LightOutput[];
  colorTemperatures: ColorTemperature[];
  drivers: Driver[];
  mountingOptions: MountingOption[];
  accessories: Accessory[];
  lightDirections: LightDirection[];
  frameThicknesses: FrameThickness[];
  mirrorStyles: MirrorStyle[];
}

// SKU generation result
export interface SkuResult {
  sku: string;
  isValid: boolean;
  appliedRules: string[];
  errors: string[];
}

/**
 * Smart Configurator Class - Main service for intelligent product configuration
 */
export class SmartConfigurator {
  private cachedData: CollectionData | null = null;
  private cacheTimestamp = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Get cached collection data or fetch fresh data
   */
  private async getCollectionData(): Promise<CollectionData> {
    const now = Date.now();
    
    // Return cached data if still valid
    if (this.cachedData && (now - this.cacheTimestamp) < this.CACHE_DURATION) {
      return this.cachedData;
    }

    // Fetch fresh data from all collections
    const [
      products,
      productLines,
      rules,
      frameColors,
      sizes,
      lightOutputs,
      colorTemperatures,
      drivers,
      mountingOptions,
      accessories,
      lightDirections,
      frameThicknesses,
      mirrorStyles
    ] = await Promise.all([
      getAllProducts(),
      getActiveProductLines(),
      getRules(),
      getActiveFrameColors(),
      getActiveSizes(),
      getActiveLightOutputs(),
      getActiveColorTemperatures(),
      getActiveDrivers(),
      getActiveMountingOptions(),
      getActiveAccessories(),
      getActiveLightDirections(),
      getActiveFrameThicknesses(),
      getActiveMirrorStyles()
    ]);

    this.cachedData = {
      products,
      productLines,
      rules,
      frameColors,
      sizes,
      lightOutputs,
      colorTemperatures,
      drivers,
      mountingOptions,
      accessories,
      lightDirections,
      frameThicknesses,
      mirrorStyles
    };
    
    this.cacheTimestamp = now;
    
    console.log('🔄 Smart configurator data cached:', {
      products: products.length,
      productLines: productLines.length,
      rules: rules.length,
      frameColors: frameColors.length,
      sizes: sizes.length,
      lightOutputs: lightOutputs.length,
      colorTemperatures: colorTemperatures.length,
      drivers: drivers.length,
      mountingOptions: mountingOptions.length,
      accessories: accessories.length
    });

    return this.cachedData;
  }

  /**
   * Get available options based on product constraints and current configuration
   */
  async getAvailableOptions(config: Partial<SmartConfig> = {}): Promise<AvailableOptions> {
    const data = await this.getCollectionData();
    
    // Start with all active options
    let availableOptions: AvailableOptions = {
      products: [...data.products],
      frameColors: [...data.frameColors],
      sizes: [...data.sizes],
      lightOutputs: [...data.lightOutputs],
      colorTemperatures: [...data.colorTemperatures],
      drivers: [...data.drivers],
      mountingOptions: [...data.mountingOptions],
      accessories: [...data.accessories],
      lightDirections: [...data.lightDirections],
      frameThicknesses: [...data.frameThicknesses],
      mirrorStyles: [...data.mirrorStyles]
    };

    // Apply product line constraints if product is selected
    if (config.product_id) {
      const selectedProduct = data.products.find(p => p.id === config.product_id);
      if (selectedProduct?.product_line) {
        const productLine = data.productLines.find(pl => pl.id === selectedProduct.product_line);
        if (productLine?.default_options) {
          availableOptions = this.applyProductLineConstraints(availableOptions, productLine.default_options);
        }
      }
    }

    // Apply rule-based constraints
    const constraints = buildRuleConstraints(data.rules, config);
    const availableIds = this.extractAvailableIds(availableOptions);
    const constrainedIds = applyConstraintsToIds(availableIds, constraints, (field) => {
      const collectionMap: Record<string, any[]> = {
        frame_color: data.frameColors,
        size: data.sizes,
        light_output: data.lightOutputs,
        color_temperature: data.colorTemperatures,
        driver: data.drivers,
        mounting_option: data.mountingOptions,
        accessory: data.accessories
      };
      return (collectionMap[field] || []).map(item => item.id);
    });

    // Filter options based on constrained IDs
    return this.filterOptionsByIds(data, constrainedIds);
  }

  /**
   * Apply product line default options as constraints
   */
  private applyProductLineConstraints(options: AvailableOptions, defaultOptions: any): AvailableOptions {
    const filtered = { ...options };

    // Filter each collection based on default_options
    if (defaultOptions.frame_colors?.length) {
      filtered.frameColors = options.frameColors.filter(item => 
        defaultOptions.frame_colors.includes(item.id)
      );
    }

    if (defaultOptions.sizes?.length) {
      filtered.sizes = options.sizes.filter(item => 
        defaultOptions.sizes.includes(item.id)
      );
    }

    if (defaultOptions.light_outputs?.length) {
      filtered.lightOutputs = options.lightOutputs.filter(item => 
        defaultOptions.light_outputs.includes(item.id)
      );
    }

    if (defaultOptions.color_temperatures?.length) {
      filtered.colorTemperatures = options.colorTemperatures.filter(item => 
        defaultOptions.color_temperatures.includes(item.id)
      );
    }

    if (defaultOptions.drivers?.length) {
      filtered.drivers = options.drivers.filter(item => 
        defaultOptions.drivers.includes(item.id)
      );
    }

    if (defaultOptions.mounting_options?.length) {
      filtered.mountingOptions = options.mountingOptions.filter(item => 
        defaultOptions.mounting_options.includes(item.id)
      );
    }

    if (defaultOptions.accessories?.length) {
      filtered.accessories = options.accessories.filter(item => 
        defaultOptions.accessories.includes(item.id)
      );
    }

    return filtered;
  }

  /**
   * Extract available IDs from options
   */
  private extractAvailableIds(options: AvailableOptions): Record<string, number[]> {
    return {
      frame_color: options.frameColors.map(item => item.id),
      size: options.sizes.map(item => item.id),
      light_output: options.lightOutputs.map(item => item.id),
      color_temperature: options.colorTemperatures.map(item => item.id),
      driver: options.drivers.map(item => item.id),
      mounting_option: options.mountingOptions.map(item => item.id),
      accessory: options.accessories.map(item => item.id)
    };
  }

  /**
   * Filter options by constrained IDs
   */
  private filterOptionsByIds(data: CollectionData, constrainedIds: Record<string, number[]>): AvailableOptions {
    return {
      products: [...data.products], // Products aren't constrained by rules typically
      frameColors: data.frameColors.filter(item => constrainedIds.frame_color?.includes(item.id) ?? true),
      sizes: data.sizes.filter(item => constrainedIds.size?.includes(item.id) ?? true),
      lightOutputs: data.lightOutputs.filter(item => constrainedIds.light_output?.includes(item.id) ?? true),
      colorTemperatures: data.colorTemperatures.filter(item => constrainedIds.color_temperature?.includes(item.id) ?? true),
      drivers: data.drivers.filter(item => constrainedIds.driver?.includes(item.id) ?? true),
      mountingOptions: data.mountingOptions.filter(item => constrainedIds.mounting_option?.includes(item.id) ?? true),
      accessories: data.accessories.filter(item => constrainedIds.accessory?.includes(item.id) ?? true)
    };
  }

  /**
   * Generate all valid combinations for a product
   */
  async generateValidCombinations(productId: number, limit: number = 100): Promise<SmartConfig[]> {
    const data = await this.getCollectionData();
    const baseConfig: SmartConfig = { product_id: productId };

    // Get available options for this product
    const availableOptions = await this.getAvailableOptions(baseConfig);

    // Generate combinations from available options
    const combinations = this.generateCombinations(availableOptions, baseConfig);

    // Apply rules to filter and modify combinations
    const validCombinations = await this.applyRulesToCombinations(combinations, data.rules, limit);

    return validCombinations;
  }

  /**
   * Generate combinations from available options
   */
  private generateCombinations(options: AvailableOptions, baseConfig: SmartConfig): SmartConfig[] {
    const combinations: SmartConfig[] = [];

    // Define collections to iterate through
    const collections = [
      { name: 'frameColors', field: 'frame_color' },
      { name: 'sizes', field: 'size' },
      { name: 'lightOutputs', field: 'light_output' },
      { name: 'colorTemperatures', field: 'color_temperature' },
      { name: 'drivers', field: 'driver' },
      { name: 'mountingOptions', field: 'mounting_option' },
      { name: 'accessories', field: 'accessory' }
    ];

    // Generate combinations recursively
    const generateRecursive = (currentConfig: SmartConfig, collectionIndex: number) => {
      if (collectionIndex >= collections.length) {
        combinations.push({ ...currentConfig });
        return;
      }

      const collection = collections[collectionIndex];
      const items = options[collection.name as keyof AvailableOptions] as any[];

      // Handle accessories differently (multi-select)
      if (collection.field === 'accessory') {
        // Generate all combinations of accessories including empty set
        const accessoryIds = items.map(item => item.id);
        const accessoryCombos = this.generateAccessoryCombinations(accessoryIds);

        for (const combo of accessoryCombos) {
          generateRecursive({ ...currentConfig, [collection.field]: combo }, collectionIndex + 1);
        }
      } else {
        // Single select for other fields
        for (const item of items) {
          generateRecursive({ ...currentConfig, [collection.field]: item.id }, collectionIndex + 1);
        }
      }
    };

    generateRecursive(baseConfig, 0);
    return combinations;
  }

  /**
   * Generate all combinations of accessories (power set)
   */
  private generateAccessoryCombinations(accessoryIds: number[]): number[][] {
    const combinations: number[][] = [[]]; // Start with empty set

    for (const id of accessoryIds) {
      const newCombinations: number[][] = [];
      for (const combo of combinations) {
        newCombinations.push([...combo, id]);
      }
      combinations.push(...newCombinations);
    }

    return combinations;
  }

  /**
   * Apply rules to filter and modify combinations
   */
  private async applyRulesToCombinations(
    combinations: SmartConfig[], 
    rules: Rule[], 
    limit: number = 100
  ): Promise<SmartConfig[]> {
    const validCombinations: SmartConfig[] = [];
    let processed = 0;

    for (const combination of combinations) {
      // Stop if we've reached the limit
      if (validCombinations.length >= limit) break;

      let config = { ...combination };
      let isValid = true;

      // Apply each rule
      for (const rule of rules) {
        if (evaluateRuleConditions(rule, config)) {
          config = applyRuleActions(rule, config);
        }
      }

      if (isValid) {
        validCombinations.push(config);
      }

      processed++;
      
      // Log progress every 1000 combinations
      if (processed % 1000 === 0) {
        console.log(`Processed ${processed}/${combinations.length} combinations, valid: ${validCombinations.length}`);
      }
    }

    console.log(`✅ Generated ${validCombinations.length} valid combinations from ${processed} total`);
    return validCombinations;
  }

  /**
   * Build SKU from configuration with rule processing
   */
  async buildSku(config: SmartConfig): Promise<SkuResult> {
    const data = await this.getCollectionData();
    const appliedRules: string[] = [];
    const errors: string[] = [];
    let processedConfig = { ...config };

    try {
      // Apply rules and collect applied rule names
      for (const rule of data.rules) {
        if (evaluateRuleConditions(rule, processedConfig)) {
          processedConfig = applyRuleActions(rule, processedConfig);
          appliedRules.push(rule.name || `Rule ${rule.id}`);
        }
      }

      // Build SKU string using the same logic as the generator
      const sku = await this.buildSkuString(processedConfig, data);

      return {
        sku,
        isValid: sku.length > 0,
        appliedRules,
        errors
      };
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Unknown error');
      return {
        sku: '',
        isValid: false,
        appliedRules,
        errors
      };
    }
  }

  /**
   * Build SKU string from configuration
   */
  private async buildSkuString(config: SmartConfig, data: CollectionData): Promise<string> {
    const parts: string[] = [];

    // Get sku_code_order from API (this would need to be added to collections)
    // For now, use a hardcoded order based on the generator logic
    const skuOrder = [
      { collection: 'products', field: 'product_id' },
      { collection: 'frame_colors', field: 'frame_color' },
      { collection: 'sizes', field: 'size' },
      { collection: 'light_outputs', field: 'light_output' },
      { collection: 'color_temperatures', field: 'color_temperature' },
      { collection: 'drivers', field: 'driver' },
      { collection: 'mounting_options', field: 'mounting_option' },
      { collection: 'accessories', field: 'accessory' }
    ];

    for (const orderItem of skuOrder) {
      const configValue = config[orderItem.field];
      if (!configValue) continue;

      // Check for override fields first
      const overrideField = `${orderItem.field}_sku_override`;
      if (config[overrideField] && config[overrideField] !== 'NA') {
        parts.push(config[overrideField]);
        continue;
      }

      // Get SKU code from the appropriate collection
      const skuCode = this.getSkuCodeFromCollection(
        data, 
        orderItem.collection, 
        configValue
      );

      if (skuCode) {
        parts.push(skuCode);
      }
    }

    return parts.filter(Boolean).join('-');
  }

  /**
   * Get SKU code from collection data
   */
  private getSkuCodeFromCollection(
    data: CollectionData, 
    collection: string, 
    value: any
  ): string | null {
    switch (collection) {
      case 'products': {
        const item = data.products.find(p => p.id === value);
        return item?.sku_code || null;
      }
      case 'frame_colors': {
        const item = data.frameColors.find(fc => fc.id === value);
        return item?.sku_code || null;
      }
      case 'sizes': {
        const item = data.sizes.find(s => s.id === value);
        return item?.sku_code || null;
      }
      case 'light_outputs': {
        const item = data.lightOutputs.find(lo => lo.id === value);
        return item?.sku_code || null;
      }
      case 'color_temperatures': {
        const item = data.colorTemperatures.find(ct => ct.id === value);
        return item?.sku_code || null;
      }
      case 'drivers': {
        const item = data.drivers.find(d => d.id === value);
        return item?.sku_code || null;
      }
      case 'mounting_options': {
        const item = data.mountingOptions.find(mo => mo.id === value);
        return item?.sku_code || null;
      }
      case 'accessories': {
        if (Array.isArray(value)) {
          if (value.length === 0) return 'NA';
          const codes = value
            .map(id => {
              const item = data.accessories.find(a => a.id === id);
              return item?.sku_code;
            })
            .filter(Boolean);
          return codes.length > 0 ? codes.join('') : 'NA';
        } else {
          const item = data.accessories.find(a => a.id === value);
          return item?.sku_code || 'NA';
        }
      }
      default:
        return null;
    }
  }

  /**
   * Search for configurations matching a SKU pattern or text
   */
  async searchConfigurations(query: string, limit: number = 50): Promise<{
    results: Array<{
      config: SmartConfig;
      sku: string;
      score: number;
    }>;
    totalFound: number;
  }> {
    const data = await this.getCollectionData();
    const results: Array<{ config: SmartConfig; sku: string; score: number }> = [];

    // Get all Deco products (assuming product line with sku_code 'D')
    const decoProductLine = data.productLines.find(pl => pl.sku_code === 'D');
    if (!decoProductLine) {
      return { results: [], totalFound: 0 };
    }

    const decoProducts = data.products.filter(p => p.product_line === decoProductLine.id);

    // Generate and search through a subset of combinations for each product
    for (const product of decoProducts.slice(0, 3)) { // Limit to first 3 products
      try {
        const combinations = await this.generateValidCombinations(product.id, 100);
        
        for (const config of combinations) {
          const skuResult = await this.buildSku(config);
          
          if (skuResult.isValid) {
            const score = this.calculateMatchScore(skuResult.sku, query);
            if (score > 0) {
              results.push({
                config,
                sku: skuResult.sku,
                score
              });
            }
          }
        }
      } catch (error) {
        console.warn(`Failed to generate combinations for product ${product.id}:`, error);
      }
    }

    // Sort by score and limit results
    results.sort((a, b) => b.score - a.score);
    
    return {
      results: results.slice(0, limit),
      totalFound: results.length
    };
  }

  /**
   * Calculate match score for search
   */
  private calculateMatchScore(sku: string, query: string): number {
    const lowerSku = sku.toLowerCase();
    const lowerQuery = query.toLowerCase();

    // Exact match gets highest score
    if (lowerSku === lowerQuery) return 100;

    // Starts with query gets high score
    if (lowerSku.startsWith(lowerQuery)) return 80;

    // Contains query gets medium score
    if (lowerSku.includes(lowerQuery)) return 60;

    // Partial matches for individual parts
    const skuParts = sku.split('-');
    const queryParts = query.split('-');
    
    let matchingParts = 0;
    for (const queryPart of queryParts) {
      if (skuParts.some(skuPart => skuPart.toLowerCase().includes(queryPart.toLowerCase()))) {
        matchingParts++;
      }
    }

    if (matchingParts > 0) {
      return Math.min(50, (matchingParts / queryParts.length) * 50);
    }

    return 0;
  }

  /**
   * Clear cache to force fresh data fetch
   */
  clearCache(): void {
    this.cachedData = null;
    this.cacheTimestamp = 0;
  }
}

// Export singleton instance
export const smartConfigurator = new SmartConfigurator();

// Export utility functions
export {
  type SmartConfig,
  type CollectionData,
  type AvailableOptions,
  type SkuResult
};