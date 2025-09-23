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

// Extended interface to match database schema
export interface Product {
  id: number;
  name: string;
  product_line: number;
  mirror_style: number | null;
  light_direction: number | null;
  frame_thickness?: { key: number; collection: string } | null;
  active: boolean;
  sku_code?: string | null;
  [key: string]: any; // Allow additional properties from the database
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
  // Check cache
  if (productLineOptionsCache.length > 0 && Date.now() - cacheTimestamp < CACHE_DURATION) {
    if (import.meta.env.DEV) {
      console.log('🔄 Dynamic filtering using cached data:', {
        productLineOptions: productLineOptionsCache.length,
        products: productsCache.length,
        overrides: productOverridesCache.length
      });
    }
    return;
  }

  try {
    // Load all the relational data in parallel
    const [
      { data: productLineOptions, error: productLineError },
      { data: productOverrides, error: overridesError },
      { data: products, error: productsError }
    ] = await Promise.all([
      supabase
        .from('product_lines_default_options')
        .select('*'),
      supabase
        .from('products_options_overrides')
        .select('*'),
      supabase
        .from('products')
        .select('*')
        .eq('active', true)
    ]);

    if (productLineError) throw productLineError;
    if (overridesError) throw overridesError;
    if (productsError) throw productsError;

    // Update caches with proper type assertions and data transformation
    productLineOptionsCache = (productLineOptions as unknown as ProductLineOption[]) || [];
    productOverridesCache = (productOverrides as unknown as ProductOptionOverride[]) || [];
    
    // Transform products to match our interface
    productsCache = ((products || []) as unknown as any[]).map(p => ({
      id: p.id,
      name: p.name || '',
      product_line: p.product_line,
      mirror_style: p.mirror_style,
      light_direction: p.light_direction,
      frame_thickness: p.frame_thickness,
      active: p.active === true,
      sku_code: p.sku_code || undefined,
      ...p // Include all other properties
    }));
    
    cacheTimestamp = Date.now();
    
    if (import.meta.env.DEV) {
      console.log('✅ Dynamic filtering initialized successfully:', {
        productLineOptions: productLineOptionsCache.length,
        products: productsCache.length,
        overrides: productOverridesCache.length,
        productLinesFound: [...new Set(productLineOptionsCache.map(p => p.product_lines_id))].length
      });
    }
  } catch (error) {
    console.error('[Filtering] Initialization failed:', error);
    throw error;
  }
}

/**
 * Get available and disabled options using simple product-driven filtering:
 * 1. Start with product line default options
 * 2. Filter by actual products that exist for current selections
 * 3. Show only options that exist in matching products
 * Rules are applied separately to disable alternatives, not filter availability
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

  // Determine filtering level based on selections
  const hasProductLine = !!productLineId;
  const hasMirrorStyle = !!currentSelection.mirror_styles;

  if (hasProductLine && !hasMirrorStyle) {
    // LEVEL 1: Product line only - show ALL default options
    Object.entries(baseOptionsByCollection).forEach(([collection, items]) => {
      const uniqueItems = [...new Set(items)];
      result.all[collection] = uniqueItems;
      result.available[collection] = uniqueItems; // Show everything at level 1
      result.disabled[collection] = []; // Nothing disabled at level 1
    });

  } else if (hasProductLine && hasMirrorStyle) {
    // LEVEL 2: Product line + mirror style - filter actual products
    const filteredProducts = productsCache.filter(p => 
      p.product_line === productLineId &&
      p.mirror_style?.toString() === currentSelection.mirror_styles
    );

    // Extract available options from these specific products
    const availableFromProducts = {} as Record<string, string[]>;

    if (filteredProducts.length > 0) {
      // Direct product fields with proper type safety
      availableFromProducts.mirror_styles = Array.from(
        new Set(
          filteredProducts
            .map(p => p.mirror_style?.toString())
            .filter((item): item is string => Boolean(item))
        )
      );

      availableFromProducts.light_directions = Array.from(
        new Set(
          filteredProducts
            .map(p => p.light_direction?.toString())
            .filter((item): item is string => Boolean(item))
        )
      );

      // Frame thickness from JSON field with proper type safety
      const frameThicknesses = filteredProducts
        .map(p => p.frame_thickness?.key?.toString())
        .filter((item): item is string => Boolean(item));
      // ALWAYS set the array, even if empty - this is critical for proper filtering
      availableFromProducts.frame_thicknesses = Array.from(new Set(frameThicknesses));

      // Add other product-related collections that need dynamic filtering
      // These would be expanded as more collections are moved to product-based filtering
      
    } else {
      // No products match current selection - all dependent collections should be empty
      availableFromProducts.mirror_styles = [];
      availableFromProducts.light_directions = [];
      availableFromProducts.frame_thicknesses = [];
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
      } else {
        // Different collection - apply cross-collection filtering based on products
        if (collection in availableFromProducts) {
          // Collection has product-specific filtering defined
          const availableItems = availableFromProducts[collection];
          result.available[collection] = [...availableItems];
          result.disabled[collection] = items.filter(item => !availableItems.includes(item));
          console.log(`🔒 ${collection}: ${availableItems.length} available from products, ${result.disabled[collection].length} disabled`);
        } else {
          // No product-specific filtering for this collection - keep all defaults available
          result.available[collection] = [...items];
          result.disabled[collection] = [];
          console.log(`📖 ${collection}: ${items.length} available from defaults (no product filtering)`);
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

  // CRITICAL FIX: Only apply product overrides when we've narrowed down to a SPECIFIC product
  // Not when we just have mirror style selected - that's too broad
  
  // Check if we have enough selections to identify a specific product
  const hasEnoughSelectionsForSpecificProduct = hasProductLine && hasMirrorStyle && 
    (currentSelection.light_directions || currentSelection.frame_thicknesses);
    
  if (hasEnoughSelectionsForSpecificProduct) {
    // Find the specific products that match ALL current selections
    const matchingProducts = productsCache.filter(p => {
      if (p.product_line !== productLineId) return false;
      if (currentSelection.mirror_styles && p.mirror_style !== parseInt(currentSelection.mirror_styles)) return false;
      if (currentSelection.light_directions && p.light_direction !== parseInt(currentSelection.light_directions)) return false;
      if (currentSelection.frame_thicknesses) {
        const productFrameThickness = typeof p.frame_thickness === 'object' && p.frame_thickness !== null
          ? (p.frame_thickness as any).key
          : p.frame_thickness;
        if (productFrameThickness !== parseInt(currentSelection.frame_thicknesses)) return false;
      }
      return true;
    });
    
    // Only apply overrides if we have a single specific product (or very few)
    if (matchingProducts.length <= 2) {
      const applicableOverrides = productOverridesCache.filter(override =>
        matchingProducts.some(p => p.id === override.products_id)
      );
      
      if (applicableOverrides.length > 0) {
        if (import.meta.env.DEV) {
          console.log(`🎯 Applying ${applicableOverrides.length} product-specific overrides for ${matchingProducts.length} products`);
        }
        
        // Apply overrides - these REPLACE the default options for affected collections
        const overridesByCollection = {} as Record<string, string[]>;
        applicableOverrides.forEach(override => {
          if (!overridesByCollection[override.collection]) {
            overridesByCollection[override.collection] = [];
          }
          overridesByCollection[override.collection].push(override.item);
        });

        // Replace options with overrides where they exist
        Object.entries(overridesByCollection).forEach(([collection, overrideItems]) => {
          result.all[collection] = [...new Set(overrideItems)];
          result.available[collection] = [...new Set(overrideItems)];
          result.disabled[collection] = [];
          if (import.meta.env.DEV) {
            console.log(`🎯 Override applied to ${collection}: ${overrideItems.length} options`);
          }
        });
      }
    }
  }

  // Final summary for debugging
  if (import.meta.env.DEV) {
    console.group('🔍 Dynamic Filtering Result');
    console.log('Current selection:', currentSelection);
    console.log('Product line:', productLineId);
    Object.entries(result.available).forEach(([collection, availableItems]) => {
      const allItems = result.all[collection] || [];
      const disabledItems = result.disabled[collection] || [];
      console.log(`📄 ${collection}: ${availableItems.length}/${allItems.length} available, ${disabledItems.length} disabled`);
      if (disabledItems.length > 0) {
        console.log(`   → Disabled: [${disabledItems.join(', ')}]`);
      }
    });
    console.groupEnd();
  }

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