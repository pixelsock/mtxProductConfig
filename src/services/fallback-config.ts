/**
 * Fallback Configuration System
 * 
 * Provides sensible defaults for dynamic configuration when configuration_ui 
 * and sku_code_order collections are not available.
 */

import { DynamicMapping } from './dynamic-config';

/**
 * Create fallback mappings based on collection names and common patterns
 */
export function createFallbackMappings(): DynamicMapping[] {
  const mappings: DynamicMapping[] = [
    {
      collection: 'mirror_styles',
      configKey: 'mirrorStyle',
      valueField: 'id',
      displayField: 'name',
      uiType: 'grid-2',
      sort: 1,
      isMultiple: false
    },
    {
      collection: 'light_directions', 
      configKey: 'lighting',
      valueField: 'id',
      displayField: 'name',
      uiType: 'grid-2',
      sort: 2,
      isMultiple: false
    },
    {
      collection: 'frame_thicknesses',
      configKey: 'frameThickness', 
      valueField: 'id',
      displayField: 'name',
      uiType: 'grid-2',
      sort: 3,
      isMultiple: false
    },
    {
      collection: 'frame_colors',
      configKey: 'frameColor',
      valueField: 'id', 
      displayField: 'name',
      uiType: 'color-swatch',
      sort: 4,
      isMultiple: false
    },
    {
      collection: 'mounting_options',
      configKey: 'mounting',
      valueField: 'id',
      displayField: 'name', 
      uiType: 'grid-2',
      sort: 5,
      isMultiple: false
    },
    {
      collection: 'drivers',
      configKey: 'driver',
      valueField: 'id',
      displayField: 'name',
      uiType: 'grid-2',
      sort: 6,
      isMultiple: false
    },
    {
      collection: 'light_outputs',
      configKey: 'lightOutput',
      valueField: 'id',
      displayField: 'name',
      uiType: 'grid-2',
      sort: 7,
      isMultiple: false
    },
    {
      collection: 'color_temperatures',
      configKey: 'colorTemperature',
      valueField: 'id',
      displayField: 'name',
      uiType: 'grid-2',
      sort: 8,
      isMultiple: false
    },
    {
      collection: 'accessories',
      configKey: 'accessories',
      valueField: 'id',
      displayField: 'name',
      uiType: 'multi',
      sort: 9,
      isMultiple: true
    },
    {
      collection: 'sizes',
      configKey: 'size',
      valueField: 'id',
      displayField: 'name',
      uiType: 'size-grid',
      sort: 10,
      isMultiple: false
    }
  ];

  return mappings;
}

/**
 * Get fallback SKU code order based on common product configuration patterns
 */
export function getFallbackSkuOrder(): string[] {
  return [
    'product_lines',
    'sizes', 
    'light_outputs',
    'color_temperatures',
    'drivers',
    'mounting_options',
    'accessories',
    'frame_colors'
  ];
}

/**
 * Check if we should use fallback configuration
 */
export function shouldUseFallback(): boolean {
  // Now that API permissions are updated, try real API first
  return false;
}