/**
 * Dynamic SKU Builder Service
 * 
 * Builds SKUs dynamically using configuration_ui and sku_code_order data
 * instead of hardcoded mappings.
 */

import { getDynamicMappings } from './dynamic-config';
import { getSkuCodeOrder } from './sku-code-order';

export interface SkuBuildConfig {
  [key: string]: any;
  productLineId?: number | string;
  width?: string | number;
  height?: string | number;
}

/**
 * Build a SKU from configuration using dynamic mappings
 */
export async function buildDynamicSku(config: SkuBuildConfig): Promise<string> {
  try {
    // Get dynamic mappings and SKU order
    const [mappings, skuOrder] = await Promise.all([
      getDynamicMappings(),
      getSkuCodeOrder()
    ]);

    const skuParts: string[] = [];

    // Process each SKU code item in order
    for (const orderItem of skuOrder.items) {
      const collection = orderItem.sku_code_item;
      const mapping = mappings.find(m => m.collection === collection);
      
      if (!mapping) {
        console.warn(`No mapping found for collection: ${collection}`);
        continue;
      }

      const configKey = mapping.configKey;
      const configValue = config[configKey];

      // Skip if no value configured
      if (!configValue) {
        console.log(`Skipping ${collection} - no value in config`);
        continue;
      }

      // Get the SKU code for this option
      const skuCode = await getSkuCodeForValue(collection, configValue, mapping);
      
      if (skuCode) {
        skuParts.push(skuCode);
        console.log(`Added ${collection}[${configKey}=${configValue}] -> ${skuCode}`);
      }
    }

    const finalSku = skuParts.join('');
    console.log(`\ud83c\udff7\ufe0f Built dynamic SKU: ${finalSku}`);
    
    return finalSku;
  } catch (error) {
    console.error('Failed to build dynamic SKU:', error);
    return '';
  }
}

/**
 * Get the SKU code for a specific value in a collection
 */
async function getSkuCodeForValue(
  collection: string, 
  configValue: any,
  mapping: any
): Promise<string | null> {
  try {
    // Handle special cases
    if (collection === 'sizes' && typeof configValue === 'object') {
      // For sizes, we might need to construct from width/height
      return null; // Let the caller handle size formatting
    }
    
    // Handle multiple values (like accessories)
    if (Array.isArray(configValue)) {
      const codes: string[] = [];
      for (const value of configValue) {
        const code = await getSingleSkuCode(collection, value);
        if (code) codes.push(code);
      }
      return codes.join('');
    }
    
    // Single value
    return getSingleSkuCode(collection, configValue);
  } catch (error) {
    console.error(`Failed to get SKU code for ${collection}:`, error);
    return null;
  }
}

/**
 * Get SKU code for a single value
 */
async function getSingleSkuCode(collection: string, value: any): Promise<string | null> {
  try {
    const { directusClient } = await import('./directus-client');
    const { readItems } = await import('@directus/sdk');
    
    // Get the option from the collection
    const items = await directusClient.request(
      readItems(collection as any, {
        filter: { id: { _eq: value } },
        fields: ['sku_code']
      } as any)
    ) as any[];

    if (items.length > 0 && items[0].sku_code) {
      return items[0].sku_code;
    }
    
    return null;
  } catch (error) {
    console.error(`Failed to get single SKU code for ${collection}[${value}]:`, error);
    return null;
  }
}

/**
 * Validate that all required collections have values in config
 */
export async function validateDynamicConfig(config: SkuBuildConfig): Promise<{
  isValid: boolean;
  missingFields: string[];
  errors: string[];
}> {
  const errors: string[] = [];
  const missingFields: string[] = [];

  try {
    const [mappings, skuOrder] = await Promise.all([
      getDynamicMappings(),
      getSkuCodeOrder()
    ]);

    // Check each required field
    for (const orderItem of skuOrder.items) {
      const collection = orderItem.sku_code_item;
      const mapping = mappings.find(m => m.collection === collection);
      
      if (!mapping) {
        errors.push(`No mapping found for collection: ${collection}`);
        continue;
      }

      const configKey = mapping.configKey;
      const configValue = config[configKey];

      // Check if required value is missing
      if (!configValue || (Array.isArray(configValue) && configValue.length === 0)) {
        missingFields.push(configKey);
      }
    }

    return {
      isValid: errors.length === 0 && missingFields.length === 0,
      missingFields,
      errors
    };
  } catch (error) {
    return {
      isValid: false,
      missingFields: [],
      errors: [`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
    };
  }
}

/**
 * Get all collections that should be included in SKU building
 */
export async function getRequiredCollections(): Promise<string[]> {
  try {
    const skuOrder = await getSkuCodeOrder();
    return skuOrder.items.map(item => item.sku_code_item);
  } catch (error) {
    console.error('Failed to get required collections:', error);
    return [];
  }
}