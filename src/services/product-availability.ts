/**
 * Product Availability Service - Dynamic Filtering
 *
 * Computes which options are available based on actual products in the database.
 * Follows the facet-style algorithm from CLAUDE.md:
 *
 * 1. Start with all products in the active product_line
 * 2. Compute facet counts by key attributes (mirror_style, light_direction, etc.)
 * 3. When user selects an attribute, filter scope and recompute facets
 * 4. Disable options with zero matching products
 *
 * GOLDEN RULE: Availability is computed from products table, never hard-coded
 */

import { getProducts } from './supabase';
import { ProductConfig } from '../store/types';

export interface AvailabilityResult {
  // Maps collection names to arrays of available option IDs
  availableOptions: Record<string, number[]>;
  // Maps collection names to arrays of unavailable option IDs
  unavailableOptions: Record<string, number[]>;
  // Number of matching products for current selections
  matchingProductCount: number;
}

// Map config fields to product table columns
const CONFIG_TO_PRODUCT_FIELD: Record<string, string> = {
  mirrorStyle: 'mirror_style',
  frameThickness: 'frame_thickness',
  lighting: 'light_direction',
  // Add other mappings as needed
};

// Map config fields to collection names for disabled options
const CONFIG_TO_COLLECTION: Record<string, string> = {
  mirrorStyle: 'mirror_styles',
  frameThickness: 'frame_thicknesses',
  lighting: 'light_directions',
};

/**
 * Compute available options based on actual product inventory
 * This is the core dynamic filtering logic
 */
export async function computeProductAvailability(
  productLineId: number,
  currentConfig: ProductConfig
): Promise<AvailabilityResult> {
  try {
    // 1. Start scope: all products in the active product_line with active=true
    const allProducts = await getProducts();
    let scope = allProducts.filter(
      (p) => p.product_line === productLineId && p.active === true
    );

    if (import.meta.env.DEV) {
      console.log('🔍 Dynamic Filtering: Starting scope', {
        productLineId,
        totalProducts: scope.length,
      });
    }

    // 2. Filter scope based on current selections
    scope = filterProductsBySelections(scope, currentConfig);

    if (import.meta.env.DEV) {
      console.log('🔍 Dynamic Filtering: After selection filters', {
        matchingProducts: scope.length,
        selections: extractSelections(currentConfig),
      });
    }

    // 3. Compute facet counts for each attribute
    const facets = computeFacets(scope);

    if (import.meta.env.DEV) {
      console.log('🔍 Dynamic Filtering: Computed facets', facets);
    }

    // 4. Build availability result
    const availableOptions: Record<string, number[]> = {};
    const unavailableOptions: Record<string, number[]> = {};

    for (const [configField, collection] of Object.entries(CONFIG_TO_COLLECTION)) {
      const productField = CONFIG_TO_PRODUCT_FIELD[configField];
      if (!productField || !facets[productField]) continue;

      const availableIds = Array.from(facets[productField]);
      availableOptions[collection] = availableIds;

      // Note: We don't compute unavailableOptions here because we don't have
      // the full list of options. That will be handled in the calling code
      // by comparing against productOptions
    }

    return {
      availableOptions,
      unavailableOptions, // Will be computed by caller
      matchingProductCount: scope.length,
    };
  } catch (error) {
    console.error('❌ Failed to compute product availability:', error);
    return {
      availableOptions: {},
      unavailableOptions: {},
      matchingProductCount: 0,
    };
  }
}

/**
 * Filter products based on current configuration selections
 */
function filterProductsBySelections(
  products: any[],
  config: ProductConfig
): any[] {
  let filtered = products;

  // Apply each selection as a filter
  for (const [configField, productField] of Object.entries(CONFIG_TO_PRODUCT_FIELD)) {
    const value = config[configField as keyof ProductConfig];
    if (!value) continue; // Skip unset fields

    const valueId = parseInt(value as string);

    filtered = filtered.filter((p) => {
      const productValue = p[productField];

      // Handle JSON object format for frame_thickness
      if (typeof productValue === 'object' && productValue !== null) {
        return (productValue as any).key === valueId;
      }

      // Handle direct ID
      return productValue === valueId;
    });
  }

  return filtered;
}

/**
 * Compute facet counts - which option IDs exist in the product scope
 * Returns a map of { productField -> Set<optionId> }
 */
function computeFacets(products: any[]): Record<string, Set<number>> {
  const facets: Record<string, Set<number>> = {};

  // Initialize facet sets for each product field
  for (const productField of Object.values(CONFIG_TO_PRODUCT_FIELD)) {
    facets[productField] = new Set();
  }

  // Scan products and collect unique values for each field
  for (const product of products) {
    for (const productField of Object.values(CONFIG_TO_PRODUCT_FIELD)) {
      const value = product[productField];

      if (value !== null && value !== undefined) {
        // Handle JSON object format (e.g., frame_thickness)
        if (typeof value === 'object' && value !== null) {
          const id = (value as any).key;
          if (typeof id === 'number') {
            facets[productField].add(id);
          }
        } else if (typeof value === 'number') {
          // Handle direct ID
          facets[productField].add(value);
        }
      }
    }
  }

  return facets;
}

/**
 * Extract current selections for debugging
 */
function extractSelections(config: ProductConfig): Record<string, any> {
  const selections: Record<string, any> = {};

  for (const [configField, productField] of Object.entries(CONFIG_TO_PRODUCT_FIELD)) {
    const value = config[configField as keyof ProductConfig];
    if (value) {
      selections[productField] = value;
    }
  }

  return selections;
}

/**
 * Compute unavailable options by comparing available against all options
 * This is called by the store to build the disabled list
 */
export function computeUnavailableOptions(
  availableOptions: Record<string, number[]>,
  allOptions: Record<string, any[]>
): Record<string, number[]> {
  const unavailable: Record<string, number[]> = {};

  // Map productOptions keys to collection names
  const optionsKeyToCollection: Record<string, string> = {
    mirrorStyles: 'mirror_styles',
    frameThickness: 'frame_thicknesses',
    lightingOptions: 'light_directions',
  };

  for (const [optionsKey, collection] of Object.entries(optionsKeyToCollection)) {
    const options = allOptions[optionsKey];
    if (!Array.isArray(options)) continue;

    const available = new Set(availableOptions[collection] || []);
    const unavailableIds = options
      .map((opt) => opt.id)
      .filter((id) => !available.has(id));

    if (unavailableIds.length > 0) {
      unavailable[collection] = unavailableIds;
    }
  }

  return unavailable;
}