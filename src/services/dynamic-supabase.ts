// Dynamic Supabase Service - Adapts to Available Schema
import {
  introspectSchema,
  tableExists,
  safeTableQuery,
  getExistingTables,
  getMissingTables
} from './schema-introspector';

// Generic option interface for dynamic handling
export interface GenericOption {
  id: number;
  name: string;
  sku_code: string;
  active: boolean;
  sort: number;
  description?: string;
  hex_code?: string;
  width?: number;
  height?: number;
  price?: number;
  hide_in_configurator?: boolean;
  product_lines?: number[]; // Related product line IDs
}

// Dynamic configuration options structure
export interface DynamicConfigOptions {
  productLines: GenericOption[];
  frameColors: GenericOption[];
  accessories: GenericOption[];
  mirrorStyles: GenericOption[];
  mountingOptions: GenericOption[];
  lightingOptions: GenericOption[];
  colorTemperatures: GenericOption[];
  lightOutputs: GenericOption[];
  drivers: GenericOption[];
  frameThickness: GenericOption[];
  sizes: GenericOption[];
}

// Table mapping for dynamic queries
const TABLE_MAPPINGS = {
  productLines: 'product_lines',
  frameColors: 'frame_colors',
  accessories: 'accessories',
  mirrorStyles: 'mirror_styles',
  mountingOptions: 'mounting_options',
  lightingOptions: 'light_directions',
  colorTemperatures: 'color_temperatures',
  lightOutputs: 'light_outputs',
  drivers: 'drivers',
  frameThickness: 'frame_thicknesses',
  sizes: 'sizes'
};

/**
 * Initialize the dynamic service by introspecting the schema
 */
export async function initializeDynamicService(): Promise<void> {
  try {
    await introspectSchema();
    const missingTables = getMissingTables();
    
    if (missingTables.length > 0) {
      console.warn(`[Dynamic Supabase] Missing tables: ${missingTables.join(', ')}`);
    }

  } catch (error) {
    console.error('[Dynamic Supabase] Initialization failed:', error);
    throw error;
  }
}

/**
 * Safely fetch data from a table if it exists
 */
async function fetchTableData(tableName: string): Promise<GenericOption[]> {
  return safeTableQuery(tableName, async (table) => {
    return await table
      .select('*')
      .eq('active', true)
      .order('sort', { ascending: true });
  });
}

/**
 * Get all available configuration options dynamically
 */
export async function getDynamicConfigOptions(): Promise<DynamicConfigOptions> {
  const options: DynamicConfigOptions = {
    productLines: [],
    frameColors: [],
    accessories: [],
    mirrorStyles: [],
    mountingOptions: [],
    lightingOptions: [],
    colorTemperatures: [],
    lightOutputs: [],
    drivers: [],
    frameThickness: [],
    sizes: []
  };

  // Fetch data for each option type
  const fetchPromises = Object.entries(TABLE_MAPPINGS).map(async ([optionKey, tableName]) => {
    const data = await fetchTableData(tableName);
    (options as any)[optionKey] = data;

    if (data.length === 0 && tableExists(tableName)) {
      console.warn(`[Dynamic Supabase] Table ${tableName} is empty`);
    }
  });

  await Promise.all(fetchPromises);

  return options;
}

/**
 * Get product lines (required for basic functionality)
 */
export async function getDynamicProductLines(): Promise<GenericOption[]> {
  if (!tableExists('product_lines')) {
    throw new Error('Product lines table is required but does not exist in the database');
  }

  return fetchTableData('product_lines');
}

/**
 * Get filtered options for a specific product line using advanced filtering
 */
export async function getDynamicFilteredOptions(
  productLineSku: string,
  currentSelections?: any
): Promise<DynamicConfigOptions> {
  // Find the product line by SKU
  const productLines = await getDynamicProductLines();
  const productLine = productLines.find(pl => pl.sku_code === productLineSku);

  if (!productLine) {
    throw new Error(`Product line not found: ${productLineSku}`);
  }

  // Import advanced filtering here to avoid circular dependencies
  const { getAdvancedFilteredOptions } = await import('./advanced-filtering');

  // Use advanced filtering
  const filteredOptions = await getAdvancedFilteredOptions({
    productLineId: productLine.id,
    productLineSku: productLineSku,
    currentSelections: currentSelections || {},
    includeHidden: false // Don't include hidden options in configurator
  });

  // Return just the options part (without the additional metadata)
  return {
    productLines: [productLine],
    frameColors: filteredOptions.frameColors,
    accessories: filteredOptions.accessories,
    mirrorStyles: filteredOptions.mirrorStyles,
    mountingOptions: filteredOptions.mountingOptions,
    lightingOptions: filteredOptions.lightingOptions,
    colorTemperatures: filteredOptions.colorTemperatures,
    lightOutputs: filteredOptions.lightOutputs,
    drivers: filteredOptions.drivers,
    frameThickness: filteredOptions.frameThickness,
    sizes: filteredOptions.sizes
  };
}

/**
 * Get available products (if products table exists)
 */
export async function getDynamicProducts(): Promise<GenericOption[]> {
  return fetchTableData('products');
}

/**
 * Get available rules (if rules table exists)
 */
export async function getDynamicRules(): Promise<any[]> {
  return safeTableQuery('rules', async (table) => {
    return await table.select('*');
  });
}

/**
 * Get schema information for debugging
 */
export function getSchemaInfo(): {
  existingTables: string[];
  missingTables: string[];
  availableOptions: string[];
} {
  const existingTables = getExistingTables();
  const missingTables = getMissingTables();

  const availableOptions = Object.entries(TABLE_MAPPINGS)
    .filter(([_, tableName]) => tableExists(tableName))
    .map(([optionKey, _]) => optionKey);

  return {
    existingTables,
    missingTables,
    availableOptions
  };
}