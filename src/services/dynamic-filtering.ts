/**
 * Dynamic Filtering Service - Database-Driven Product Relationships
 *
 * Implements hierarchical filtering using actual database relationships:
 * - product_lines_default_options: defines which options are available for each product line
 * - products_options_overrides: defines specific overrides for individual products
 * - Hierarchy: Product Line → Mirror Styles → Light Direction
 *
 * Only shows options that:
 * 1. Exist in product line defaults or product-specific overrides
 * 2. Are valid for the current selection hierarchy
 * 3. Pass business rules validation
 */

import { supabase } from './supabase';

export interface ProductLineOption {
  id: number;
  product_lines_id: number;
  item: string;
  collection: string;
}

export interface ProductOptionOverride {
  id: number;
  products_id: number;
  item: string;
  collection: string;
}

export interface Product {
  id: number;
  name: string;
  product_line: number;
  mirror_style: number;
  light_direction: number;
  frame_thickness?: { key: number; collection: string };
  active: boolean;
  sku_code?: string;
}

// Cache for performance
let productLineOptionsCache: ProductLineOption[] = [];
let productOverridesCache: ProductOptionOverride[] = [];
let productsCache: Product[] = [];
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Initialize the filtering system by loading all relational data
 */
export async function initializeFiltering(): Promise<void> {
  console.log('🔍 Initializing database-driven filtering...');

  // Check cache
  if (productLineOptionsCache.length > 0 && Date.now() - cacheTimestamp < CACHE_DURATION) {
    console.log('✅ Using cached filtering data');
    return;
  }

  try {
    // Load all the relational data in parallel
    const [productLineOptionsResult, productOverridesResult, productsResult] = await Promise.all([
      supabase
        .from('product_lines_default_options')
        .select('*'),
      supabase
        .from('products_options_overrides')
        .select('*'),
      supabase
        .from('products')
        .select(`
          id,
          name,
          product_line,
          mirror_style,
          light_direction,
          frame_thickness,
          active,
          sku_code
        `)
        .eq('active', true)
    ]);

    if (productLineOptionsResult.error) throw productLineOptionsResult.error;
    if (productOverridesResult.error) throw productOverridesResult.error;
    if (productsResult.error) throw productsResult.error;

    productLineOptionsCache = productLineOptionsResult.data || [];
    productOverridesCache = productOverridesResult.data || [];
    productsCache = productsResult.data || [];
    cacheTimestamp = Date.now();

    console.log(`✅ Filtering initialized with:`);
    console.log(`   - ${productLineOptionsCache.length} product line options`);
    console.log(`   - ${productOverridesCache.length} product overrides`);
    console.log(`   - ${productsCache.length} active products`);

  } catch (error) {
    console.error('❌ Failed to initialize filtering:', error);
    throw error;
  }
}

/**
 * Get available and disabled options using two-level filtering approach:
 * Level 1: Product line only -> show all default options
 * Level 2: Product line + mirror style -> filter actual products, show their options
 */
export function getFilteredOptions(
  currentSelection: Record<string, any>,
  productLineId: number
): {
  available: Record<string, string[]>,
  disabled: Record<string, string[]>,
  all: Record<string, string[]>
} {
  const result = {
    available: {} as Record<string, string[]>,
    disabled: {} as Record<string, string[]>,
    all: {} as Record<string, string[]>
  };

  if (!productLineId) {
    return result;
  }

  console.log(`🔍 Two-level filtering for product line ${productLineId}`, currentSelection);

  // Get product line default options (defines what fields should appear)
  const productLineOptions = productLineOptionsCache.filter(
    option => option.product_lines_id === productLineId
  );

  // Group by collection - this defines the base UI fields
  const baseOptionsByCollection = productLineOptions.reduce((acc, option) => {
    if (!acc[option.collection]) {
      acc[option.collection] = [];
    }
    acc[option.collection].push(option.item);
    return acc;
  }, {} as Record<string, string[]>);

  console.log(`📋 Product line ${productLineId} defines these collections:`, Object.keys(baseOptionsByCollection));

  // Determine filtering level based on selections
  const hasProductLine = !!productLineId;
  const hasMirrorStyle = !!currentSelection.mirror_styles;

  console.log(`🎯 Filtering level: Product Line=${hasProductLine}, Mirror Style=${hasMirrorStyle}`);

  if (hasProductLine && !hasMirrorStyle) {
    // LEVEL 1: Product line only - show ALL default options
    console.log(`📋 Level 1: Showing all default options for product line ${productLineId}`);

    Object.entries(baseOptionsByCollection).forEach(([collection, items]) => {
      result.all[collection] = [...new Set(items)];
      result.available[collection] = [...new Set(items)]; // Show everything at level 1
      result.disabled[collection] = []; // Nothing disabled at level 1

      console.log(`✅ ${collection}: ${result.available[collection].length} options available (Level 1)`);
    });

  } else if (hasProductLine && hasMirrorStyle) {
    // LEVEL 2: Product line + mirror style - filter actual products
    console.log(`🎯 Level 2: Filtering products by product_line=${productLineId} AND mirror_style=${currentSelection.mirror_styles}`);

    // Filter products to exact matches
    const filteredProducts = productsCache.filter(p =>
      p.product_line === productLineId &&
      p.mirror_style === parseInt(currentSelection.mirror_styles)
    );

    console.log(`🎯 Found ${filteredProducts.length} products matching both criteria`);

    // Extract available options from these specific products
    const availableFromProducts = {} as Record<string, string[]>;

    if (filteredProducts.length > 0) {
      // Direct product fields
      availableFromProducts.mirror_styles = [...new Set(filteredProducts
        .map(p => p.mirror_style?.toString())
        .filter(Boolean)
      )];
      availableFromProducts.light_directions = [...new Set(filteredProducts
        .map(p => p.light_direction?.toString())
        .filter(Boolean)
      )];

      // Frame thickness from JSON field
      const frameThicknesses = filteredProducts
        .map(p => p.frame_thickness?.key?.toString())
        .filter(Boolean);
      if (frameThicknesses.length > 0) {
        availableFromProducts.frame_thicknesses = [...new Set(frameThicknesses)];
      }

      console.log(`🎯 Options from filtered products:`, availableFromProducts);
    }

    // Build result based on actual products
    Object.entries(baseOptionsByCollection).forEach(([collection, items]) => {
      result.all[collection] = [...new Set(items)];

      // CRITICAL: Never disable options within the same collection being selected
      const isCurrentlySelectingThisCollection = Object.keys(currentSelection).some(key =>
        key === collection || key === `${collection}s` || key.replace(/s$/, '') === collection
      );

      if (isCurrentlySelectingThisCollection) {
        // User is selecting from THIS collection - show ALL options, never disable within same collection
        result.available[collection] = [...items];
        result.disabled[collection] = [];
        console.log(`🔄 ${collection}: Showing ALL ${result.available[collection].length} options (same collection rule)`);
      } else {
        // Different collection - apply cross-collection filtering based on products
        if (collection in availableFromProducts && availableFromProducts[collection].length > 0) {
          // Filter based on actual products that match current selection
          result.available[collection] = [...availableFromProducts[collection]];
          result.disabled[collection] = items.filter(item => !availableFromProducts[collection].includes(item));
          console.log(`🎯 ${collection}: ${result.available[collection].length} available, ${result.disabled[collection].length} disabled by product filtering`);
        } else {
          // No product-specific filtering for this collection
          result.available[collection] = [...items];
          result.disabled[collection] = [];
          console.log(`📋 ${collection}: ${result.available[collection].length} default options (no product constraints)`);
        }
      }
    });

  } else {
    // Fallback: show everything
    Object.entries(baseOptionsByCollection).forEach(([collection, items]) => {
      result.all[collection] = [...new Set(items)];
      result.available[collection] = [...new Set(items)];
      result.disabled[collection] = [];
    });
  }

  // Add product-specific overrides
  const applicableOverrides = productOverridesCache.filter(override => {
    if (hasProductLine && hasMirrorStyle) {
      // Level 2: check overrides for filtered products
      const filteredProducts = productsCache.filter(p =>
        p.product_line === productLineId &&
        p.mirror_style === parseInt(currentSelection.mirror_styles)
      );
      return filteredProducts.some(p => p.id === override.products_id);
    } else {
      // Level 1: check overrides for all products in product line
      const productLineProducts = productsCache.filter(p => p.product_line === productLineId);
      return productLineProducts.some(p => p.id === override.products_id);
    }
  });

  console.log(`🔧 Found ${applicableOverrides.length} applicable overrides`);

  // Apply overrides - these REPLACE the default options for affected collections
  const overridesByCollection = {} as Record<string, string[]>;
  applicableOverrides.forEach(override => {
    if (!overridesByCollection[override.collection]) {
      overridesByCollection[override.collection] = [];
    }
    overridesByCollection[override.collection].push(override.item);
  });

  // Replace default options with overrides where they exist
  Object.entries(overridesByCollection).forEach(([collection, overrideItems]) => {
    console.log(`🔧 OVERRIDING ${collection}: replacing defaults with [${overrideItems.join(', ')}]`);

    // OVERRIDE means REPLACE, not ADD
    result.all[collection] = [...new Set(overrideItems)];
    result.available[collection] = [...new Set(overrideItems)];
    result.disabled[collection] = []; // No disabled options when using overrides
  });

  // Final summary
  Object.entries(result.available).forEach(([collection, availableItems]) => {
    const allItems = result.all[collection] || [];
    const disabledItems = result.disabled[collection] || [];
    console.log(`📊 ${collection}: ${availableItems.length}/${allItems.length} available, ${disabledItems.length} disabled`);
  });

  return result;
}

/**
 * Get all available options for a product line (initial state)
 */
export function getInitialOptions(productLineId: number): {
  available: Record<string, string[]>,
  disabled: Record<string, string[]>,
  all: Record<string, string[]>
} {
  return getFilteredOptions({}, productLineId);
}

/**
 * Check if a specific option is valid for current selection
 */
export function isOptionValid(
  collection: string,
  optionId: string,
  currentSelection: Record<string, any>,
  productLineId: number
): boolean {
  const filtered = getFilteredOptions(currentSelection, productLineId);
  return filtered.available[collection]?.includes(optionId) || false;
}

/**
 * Check if a specific option is disabled for current selection
 */
export function isOptionDisabled(
  collection: string,
  optionId: string,
  currentSelection: Record<string, any>,
  productLineId: number
): boolean {
  const filtered = getFilteredOptions(currentSelection, productLineId);
  return filtered.disabled[collection]?.includes(optionId) || false;
}

/**
 * Get disabled options (options that exist but aren't valid for current selection)
 */
export function getDisabledOptions(
  collection: string,
  currentSelection: Record<string, any>,
  productLineId: number
): string[] {
  const filtered = getFilteredOptions(currentSelection, productLineId);
  return filtered.disabled[collection] || [];
}

/**
 * Get all options for a collection (available + disabled)
 */
export function getAllOptions(
  collection: string,
  currentSelection: Record<string, any>,
  productLineId: number
): string[] {
  const filtered = getFilteredOptions(currentSelection, productLineId);
  return filtered.all[collection] || [];
}

/**
 * Apply hierarchical filtering rules
 * Product Line → Mirror Styles → Light Direction
 */
export function applyHierarchicalFiltering(
  configuration: Record<string, any>,
  productLineId: number
): {
  available: Record<string, string[]>,
  disabled: Record<string, string[]>,
  all: Record<string, string[]>
} {
  console.log('🔄 Applying hierarchical filtering', { configuration, productLineId });

  // The hierarchy is built into getFilteredOptions
  return getFilteredOptions(configuration, productLineId);
}

/**
 * Debug function to analyze filtering
 */
export function debugFiltering(
  configuration: Record<string, any>,
  productLineId: number
): void {
  console.group('🔍 Filtering Analysis');
  console.log('Current configuration:', configuration);
  console.log('Product line:', productLineId);

  // Show product line options
  const productLineOptions = productLineOptionsCache.filter(
    option => option.product_lines_id === productLineId
  );
  console.log(`Product line has ${productLineOptions.length} default options`);

  // Show applicable overrides
  const applicableOverrides = productOverridesCache.filter(override => {
    const matchingProducts = productsCache.filter(p => {
      if (p.product_line !== productLineId) return false;
      if (configuration.mirror_styles && p.mirror_style !== parseInt(configuration.mirror_styles)) return false;
      if (configuration.light_directions && p.light_direction !== parseInt(configuration.light_directions)) return false;
      return true;
    });
    return matchingProducts.some(p => p.id === override.products_id);
  });
  console.log(`${applicableOverrides.length} product-specific overrides apply`);

  const filtered = getFilteredOptions(configuration, productLineId);

  Object.entries(filtered.available).forEach(([collection, options]) => {
    const disabled = filtered.disabled[collection] || [];
    const all = filtered.all[collection] || [];
    console.log(`${collection}: ${options.length}/${all.length} available, ${disabled.length} disabled`);
    if (options.length <= 10) {
      console.log(`  → Available: [${options.join(', ')}]`);
    }
    if (disabled.length <= 10 && disabled.length > 0) {
      console.log(`  → Disabled: [${disabled.join(', ')}]`);
    }
  });

  console.groupEnd();
}

/**
 * Clear filtering cache
 */
export function clearFilteringCache(): void {
  productLineOptionsCache = [];
  productOverridesCache = [];
  productsCache = [];
  cacheTimestamp = 0;
  console.log('🗑️ Filtering cache cleared');
}