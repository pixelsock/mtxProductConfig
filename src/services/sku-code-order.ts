/**
 * SKU Code Order Service
 * 
 * This service manages the sku_code_order collection which defines
 * the order and inclusion of different option sets in the final SKU.
 */

import { getFallbackSkuOrder, shouldUseFallback } from './fallback-config';

export interface SkuCodeOrderItem {
  id: string;
  sku_code_item: string;
  order: number;
}

export interface SkuCodeOrder {
  items: SkuCodeOrderItem[];
  enabledItems: Set<string>;
}

/**
 * Fetches the SKU code order configuration from Directus
 */
export async function getSkuCodeOrder(): Promise<SkuCodeOrder> {
  try {
    const { directusClient } = await import('./directus-client');
    const { readItems } = await import('@directus/sdk');
    
    const items = await directusClient.request(
      readItems('sku_code_order' as any, {
        sort: ['order'],
        fields: ['id', 'sku_code_item', 'order']
      } as any)
    ) as SkuCodeOrderItem[];

    const enabledItems = new Set(items.map((item: SkuCodeOrderItem) => item.sku_code_item));

    console.log('📋 SKU Code Order loaded:', {
      totalItems: items.length,
      enabledItems: Array.from(enabledItems),
      order: items.map(i => `${i.order}: ${i.sku_code_item}`)
    });

    return { items, enabledItems };
  } catch (error) {
    console.error('Failed to fetch SKU code order:', error);
    // Return default order if fetch fails
    // Return empty fallback - the application should handle this gracefully
    console.warn('⚠️ Using empty SKU code order fallback - check sku_code_order collection configuration');
    return {
      items: [],
      enabledItems: new Set()
    };
  }
}

/**
 * Checks if a specific option set should be included in the SKU
 */
export function shouldIncludeInSku(
  skuCodeOrder: SkuCodeOrder,
  optionSetName: string
): boolean {
  return skuCodeOrder.enabledItems.has(optionSetName);
}

/**
 * Gets the order position for a specific option set
 */
export function getSkuOrderPosition(
  skuCodeOrder: SkuCodeOrder,
  optionSetName: string
): number | null {
  const item = skuCodeOrder.items.find(i => i.sku_code_item === optionSetName);
  return item ? item.order : null;
}

/**
 * Gets all enabled option sets in order
 */
export function getEnabledOptionSets(skuCodeOrder: SkuCodeOrder): string[] {
  return skuCodeOrder.items
    .filter(item => skuCodeOrder.enabledItems.has(item.sku_code_item))
    .sort((a, b) => a.order - b.order)
    .map(item => item.sku_code_item);
}

/**
 * Get config key for option set using dynamic mapping
 * @deprecated Use getConfigKeyForCollection from dynamic-config instead
 */
export async function getConfigKeyForOptionSet(optionSet: string): Promise<string | null> {
  const { getConfigKeyForCollection } = await import('./dynamic-config');
  return getConfigKeyForCollection(optionSet);
}

/**
 * Get the collection name for an option set
 * Since option sets are collections, this is typically the same
 * @deprecated Collections are used directly now
 */
export function getCollectionForOptionSet(optionSet: string): string {
  return optionSet;
}
