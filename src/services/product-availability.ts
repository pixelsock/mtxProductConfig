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
  // Note: mirror_styles explicitly excluded - they should NEVER be disabled by dynamic filtering
  // Per CLAUDE.md: "Mirror Styles should not be disabled by dynamic filtering"
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

    // 2-4. For each field we want to compute availability for,
    // filter by OTHER selections (not the field itself) and compute facets
    const availableOptions: Record<string, number[]> = {};
    const unavailableOptions: Record<string, number[]> = {};

    for (const [configField, collection] of Object.entries(CONFIG_TO_COLLECTION)) {
      const productField = CONFIG_TO_PRODUCT_FIELD[configField];
      if (!productField) continue;

      // Filter by all OTHER selections (exclude the field we're computing for)
      const scopeForField = filterProductsBySelections(scope, currentConfig, configField);

      if (import.meta.env.DEV) {
        console.log(`🔍 Dynamic Filtering: Computing ${collection}`, {
          field: configField,
          matchingProducts: scopeForField.length,
        });
      }

      // Compute facets for this specific field
      const facets = computeFacets(scopeForField);

      if (facets[productField]) {
        const availableIds = Array.from(facets[productField]);
        availableOptions[collection] = availableIds;

        if (import.meta.env.DEV) {
          console.log(`✅ ${collection} available IDs:`, availableIds);
        }
      }
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
 *
 * @param products - Array of products to filter
 * @param config - Current configuration selections
 * @param excludeField - Optional field to exclude from filtering (used when computing availability for that field)
 *
 * IMPORTANT: When computing availability for a field, we exclude that field from filtering
 * to avoid catch-22 where filtering by a field prevents discovering what values are available for that field
 */
function filterProductsBySelections(
  products: any[],
  config: ProductConfig,
  excludeField?: string
): any[] {
  let filtered = products;

  // Apply each selection as a filter
  for (const [configField, productField] of Object.entries(CONFIG_TO_PRODUCT_FIELD)) {
    // Skip the field we're computing availability for
    if (excludeField && configField === excludeField) {
      if (import.meta.env.DEV) {
        console.log(`⏭️  Skipping filter for ${configField} (computing availability for it)`);
      }
      continue;
    }

    const value = config[configField as keyof ProductConfig];
    if (!value) continue; // Skip unset fields

    const valueId = parseInt(value as string);

    if (import.meta.env.DEV) {
      console.log(`🔍 Filtering by ${configField} = ${valueId}`);
    }

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
 * Compute unavailable options by comparing available against all options
 * This is called by the store to build the disabled list
 *
 * IMPORTANT: mirror_styles are explicitly excluded from dynamic filtering
 * per CLAUDE.md specification. They can only be disabled by rules or hidden by overrides.
 */
export function computeUnavailableOptions(
  availableOptions: Record<string, number[]>,
  allOptions: Record<string, any[]>
): Record<string, number[]> {
  const unavailable: Record<string, number[]> = {};

  // Map productOptions keys to collection names
  // Note: mirror_styles explicitly excluded - they should NEVER be disabled by dynamic filtering
  const optionsKeyToCollection: Record<string, string> = {
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