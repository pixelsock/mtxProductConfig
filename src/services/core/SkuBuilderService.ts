import { EventEmittingService } from './BaseService';
import { buildFullSku } from '../../utils/sku-builder';
import { 
  buildDynamicSku, 
  validateDynamicConfig,
  getRequiredCollections 
} from '../dynamic-sku-builder';
import { 
  getSkuCodeOrder,
  shouldIncludeInSku,
  getSkuOrderPosition,
  getEnabledOptionSets,
  type SkuCodeOrderItem as ApiSkuCodeOrderItem,
  type SkuCodeOrder
} from '../sku-code-order';
import type {
  ProductConfiguration,
  ProductLine,
  ServiceResult,
  SkuCodeOrderItem,
  OptionSet,
  RuleOverrides
} from '../types/ServiceTypes';

export interface SkuBuildOptions {
  includeAccessories?: boolean;
  overrides?: RuleOverrides;
  separator?: string;
  useFullCodes?: boolean;
}

export interface SkuBuildResult {
  sku: string;
  segments: SkuSegment[];
  warnings: string[];
  usedOverrides: string[];
}

export interface SkuSegment {
  collection: string;
  position: number;
  value: string;
  originalValue?: string;
  source: 'option' | 'override' | 'default';
  separator?: string;
  prefix?: string;
  suffix?: string;
}

export class SkuBuilderService extends EventEmittingService {
  private skuCodeOrder: SkuCodeOrder | null = null;
  private isInitialized = false;

  constructor() {
    super();
    this.log('SkuBuilderService initialized');
  }

  // Initialization
  public async initialize(): Promise<ServiceResult<SkuCodeOrder>> {
    if (this.isInitialized && this.skuCodeOrder) {
      return { success: true, data: this.skuCodeOrder };
    }

    return this.withCaching('sku-code-order-api', async () => {
      try {
        this.log('Loading SKU code order from API');
        const skuCodeOrder = await getSkuCodeOrder();
        
        this.skuCodeOrder = skuCodeOrder;
        this.isInitialized = true;
        
        this.log(`Loaded ${skuCodeOrder.items.length} SKU code order items`);
        this.log('Enabled collections:', Array.from(skuCodeOrder.enabledItems));
        this.emit('sku-order-loaded', { skuCodeOrder });
        
        return { success: true, data: this.skuCodeOrder };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load SKU code order from API';
        this.error('Failed to initialize SKU builder from API', error);
        return { success: false, error: errorMessage };
      }
    });
  }

  // SKU Building
  public async buildSku(
    configuration: ProductConfiguration,
    productLine: ProductLine,
    options: Record<string, OptionSet>,
    buildOptions: SkuBuildOptions = {}
  ): Promise<ServiceResult<SkuBuildResult>> {
    if (!this.isInitialized) {
      const initResult = await this.initialize();
      if (!initResult.success) {
        return { success: false, error: initResult.error };
      }
    }

    try {
      this.log('Building SKU for configuration', configuration.id);

      // Convert configuration to dynamic format
      const dynamicConfig = this.convertToDynamicConfig(configuration, productLine, buildOptions);
      
      // Validate the configuration first
      const validation = await validateDynamicConfig(dynamicConfig);
      if (!validation.isValid) {
        this.log('Configuration validation warnings:', validation.missingFields);
        // Continue with warnings but log them
      }

      // Build SKU using the fully API-driven approach
      const sku = await buildDynamicSku(dynamicConfig);

      // Build result object with details
      const result: SkuBuildResult = {
        sku,
        segments: await this.buildSegmentDetails(dynamicConfig),
        warnings: validation.missingFields.map(field => `Missing value for ${field}`),
        usedOverrides: this.getUsedOverrides(buildOptions.overrides || {})
      };

      this.emit('sku-built', { 
        configuration, 
        result,
        dynamicConfig,
        validation
      });

      return { success: true, data: result };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to build SKU using API-driven approach';
      this.error('Failed to build SKU with API', error);
      return { success: false, error: errorMessage };
    }
  }

  // Helper method to convert ProductConfiguration to dynamic config format
  private convertToDynamicConfig(
    configuration: ProductConfiguration,
    productLine: ProductLine,
    buildOptions: SkuBuildOptions
  ): Record<string, any> {
    const dynamicConfig: Record<string, any> = {
      // Product line
      productLineId: productLine.id,
      
      // Configuration fields mapped to their values
      frameColor: configuration.frameColor,
      mirrorStyle: configuration.mirrorStyle,
      lighting: configuration.lighting,
      lightOutput: configuration.lightOutput,
      colorTemperature: configuration.colorTemperature,
      driver: configuration.driver,
      mounting: configuration.mounting,
      width: configuration.width,
      height: configuration.height,
      accessories: configuration.accessories,
      
      // Size handling
      customWidth: configuration.customWidth,
      customHeight: configuration.customHeight,
    };

    // Apply rule overrides if provided
    if (buildOptions.overrides) {
      Object.assign(dynamicConfig, buildOptions.overrides);
    }

    return dynamicConfig;
  }

  // Helper method to build segment details for the result
  private async buildSegmentDetails(dynamicConfig: Record<string, any>): Promise<SkuSegment[]> {
    if (!this.skuCodeOrder) {
      return [];
    }

    const segments: SkuSegment[] = [];

    for (const orderItem of this.skuCodeOrder.items) {
      const collection = orderItem.sku_code_item;
      
      // Create a segment for tracking purposes
      const segment: SkuSegment = {
        collection,
        position: orderItem.order,
        value: '', // Will be filled by dynamic builder
        source: 'option'
      };

      segments.push(segment);
    }

    return segments;
  }

  // Helper method to extract used overrides from RuleOverrides
  private getUsedOverrides(overrides: RuleOverrides): string[] {
    const usedOverrides: string[] = [];
    
    Object.entries(overrides).forEach(([key, value]) => {
      if (value) {
        usedOverrides.push(`${key}: ${value}`);
      }
    });
    
    return usedOverrides;
  }

  // Utilities
  public async validateSkuOrder(): Promise<ServiceResult<{ valid: boolean; issues: string[] }>> {
    if (!this.isInitialized) {
      const initResult = await this.initialize();
      if (!initResult.success) {
        return { success: false, error: initResult.error };
      }
    }

    if (!this.skuCodeOrder) {
      return { success: false, error: 'SKU code order not loaded' };
    }

    const issues: string[] = [];
    
    // Check for duplicate positions
    const positions = this.skuCodeOrder.items.map(item => item.order);
    const duplicatePositions = positions.filter((pos, index) => positions.indexOf(pos) !== index);
    if (duplicatePositions.length > 0) {
      issues.push(`Duplicate positions found: ${duplicatePositions.join(', ')}`);
    }
    
    // Check for missing required collections
    const requiredCollections = ['product_lines'];
    const presentCollections = this.skuCodeOrder.items.map(item => item.sku_code_item);
    const missingRequired = requiredCollections.filter(req => !presentCollections.includes(req));
    if (missingRequired.length > 0) {
      issues.push(`Missing required collections: ${missingRequired.join(', ')}`);
    }
    
    return {
      success: true,
      data: {
        valid: issues.length === 0,
        issues
      }
    };
  }

  public getSkuOrder(): SkuCodeOrder | null {
    return this.skuCodeOrder;
  }

  public async getRequiredCollections(): Promise<ServiceResult<string[]>> {
    try {
      const collections = await getRequiredCollections();
      return { success: true, data: collections };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get required collections';
      return { success: false, error: errorMessage };
    }
  }

  public async reloadSkuOrder(): Promise<ServiceResult<SkuCodeOrder>> {
    this.clearCache('sku-code-order-api');
    this.isInitialized = false;
    this.skuCodeOrder = null;
    return this.initialize();
  }
}