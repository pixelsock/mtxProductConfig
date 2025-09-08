/**
 * Dynamic Configuration Service
 * 
 * Provides dynamic mapping between Directus collections and configuration keys
 * based on configuration_ui and product line default_options data.
 */

import { readItems } from '@directus/sdk';
import { directusClient } from './directus-client';
import { ProductLine } from './directus-client';
import { createFallbackMappings, shouldUseFallback } from './fallback-config';

export interface ConfigurationUiItem {
  id: string;
  collection: string | null;
  item?: string | null;
  ui_type?: string | null;
  sort?: number | null;
  value_field?: string | null;
  display_field?: string | null;
  image_field?: string | null;
  status_mode?: 'status' | 'active' | 'none' | null;
  published_values?: string[] | null;
  sort_field?: string | null;
  group?: string | null;
  section_label?: string | null;
  section_sort?: number | null;
}

export interface DynamicMapping {
  collection: string;
  configKey: string;
  valueField: string;
  displayField: string;
  uiType: string;
  sort: number;
  isMultiple: boolean;
}

// Cache for dynamic mappings
let dynamicMappingCache: DynamicMapping[] | null = null;
let configUiCache: Record<string, ConfigurationUiItem> | null = null;

/**
 * Clear all caches - useful for testing or when data changes
 */
export function clearDynamicConfigCache() {
  dynamicMappingCache = null;
  configUiCache = null;
}

/**
 * Get configuration UI data from Directus
 */
async function getConfigurationUi(): Promise<Record<string, ConfigurationUiItem>> {
  if (configUiCache) return configUiCache;

  try {
    const rows = await directusClient.request<ConfigurationUiItem[]>(
      readItems('configuration_ui' as any, { 
        limit: -1, 
        sort: ['sort'] 
      } as any)
    );

    const result: Record<string, ConfigurationUiItem> = {};
    for (const row of rows || []) {
      if (row.collection) {
        result[row.collection] = row;
      }
    }

    configUiCache = result;
    return result;
  } catch (error) {
    console.error('Failed to fetch configuration_ui:', error);
    return {};
  }
}

/**
 * Generate dynamic mappings from configuration_ui data or fallback
 */
export async function getDynamicMappings(): Promise<DynamicMapping[]> {
  if (dynamicMappingCache) return dynamicMappingCache;

  // Check if we should use fallback configuration
  if (shouldUseFallback()) {
    console.log('📋 Using fallback configuration mappings');
    dynamicMappingCache = createFallbackMappings();
    return dynamicMappingCache;
  }

  const configUi = await getConfigurationUi();
  const mappings: DynamicMapping[] = [];

  // Generate config key from collection name
  // e.g., 'frame_colors' -> 'frameColor', 'mirror_styles' -> 'mirrorStyle'
  const generateConfigKey = (collection: string): string => {
    // Handle special cases
    const specialCases: Record<string, string> = {
      'light_directions': 'lighting',
      'frame_thicknesses': 'frameThickness',
      'mounting_options': 'mounting',
      'color_temperatures': 'colorTemperature',
      'light_outputs': 'lightOutput'
    };

    if (specialCases[collection]) {
      return specialCases[collection];
    }

    // Convert snake_case to camelCase, handling plurals
    return collection
      .replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
      .replace(/s$/, '') // Remove trailing 's' for singular
      .replace(/ies$/, 'y'); // Handle plurals like 'accessories' -> 'accessory'
  };

  for (const [collection, config] of Object.entries(configUi)) {
    const configKey = generateConfigKey(collection);
    
    mappings.push({
      collection,
      configKey,
      valueField: config.value_field || 'id',
      displayField: config.display_field || 'name',
      uiType: config.ui_type || 'grid-2',
      sort: config.sort || 999,
      isMultiple: config.ui_type === 'multi' || collection === 'accessories'
    });
  }

  // Sort by sort order
  mappings.sort((a, b) => a.sort - b.sort);

  dynamicMappingCache = mappings;
  return mappings;
}

/**
 * Get mapping for a specific collection
 */
export async function getMappingForCollection(collection: string): Promise<DynamicMapping | null> {
  const mappings = await getDynamicMappings();
  return mappings.find(m => m.collection === collection) || null;
}

/**
 * Get config key for a collection
 */
export async function getConfigKeyForCollection(collection: string): Promise<string | null> {
  const mapping = await getMappingForCollection(collection);
  return mapping?.configKey || null;
}

/**
 * Get collection name for a config key
 */
export async function getCollectionForConfigKey(configKey: string): Promise<string | null> {
  const mappings = await getDynamicMappings();
  const mapping = mappings.find(m => m.configKey === configKey);
  return mapping?.collection || null;
}

/**
 * Get all collections used by a product line, in UI sort order
 */
export async function getCollectionsForProductLine(productLine: ProductLine): Promise<string[]> {
  if (!productLine.default_options || !Array.isArray(productLine.default_options)) {
    return [];
  }

  // Extract collection names from default_options
  const collections = new Set<string>();
  
  for (const option of productLine.default_options) {
    if (typeof option === 'object' && option.collection) {
      collections.add(option.collection);
    }
  }

  // Get mappings to sort properly
  const mappings = await getDynamicMappings();
  const collectionArray = Array.from(collections);
  
  // Sort by configuration UI sort order
  collectionArray.sort((a, b) => {
    const mappingA = mappings.find(m => m.collection === a);
    const mappingB = mappings.find(m => m.collection === b);
    return (mappingA?.sort || 999) - (mappingB?.sort || 999);
  });

  return collectionArray;
}

/**
 * Convert a configuration value using dynamic mapping
 */
export async function convertConfigValue(
  collection: string,
  value: any,
  options: any[]
): Promise<any> {
  const mapping = await getMappingForCollection(collection);
  if (!mapping) return value;

  // Handle special cases like sizes
  if (collection === 'sizes' && typeof value === 'object') {
    const option = options.find(o => 
      String(o.width) === String(value.width) && 
      String(o.height) === String(value.height)
    );
    return option ? String(option[mapping.valueField]) : '';
  }

  return value;
}

/**
 * Create a configuration object from dynamic mappings
 */
export async function createDynamicConfig(productLine: ProductLine): Promise<Record<string, any>> {
  const collections = await getCollectionsForProductLine(productLine);
  const mappings = await getDynamicMappings();
  const config: Record<string, any> = {};

  // Initialize all config keys
  for (const collection of collections) {
    const mapping = mappings.find(m => m.collection === collection);
    if (mapping) {
      config[mapping.configKey] = mapping.isMultiple ? [] : '';
    }
  }

  // Add required fields that aren't collections
  config.productLineId = productLine.id;
  config.width = '';
  config.height = '';

  return config;
}