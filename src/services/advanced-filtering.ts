// Advanced Filtering Service - Rules Engine Integration
import { supabase } from './supabase';
import { safeTableQuery, tableExists } from './schema-introspector';
import { getDynamicRules } from './dynamic-supabase';
import { processRules } from './rules-engine';
import type { GenericOption, DynamicConfigOptions } from './dynamic-supabase';

export interface FilterContext {
  productLineId: number;
  productLineSku?: string;
  currentSelections: Record<string, any>;
  includeHidden?: boolean; // Include options with hide_in_configurator=true
}

export interface FilteredOptions extends DynamicConfigOptions {
  validCombinations: ProductCombination[];
  disabledOptions: Record<string, number[]>; // field -> disabled option IDs
  hiddenOptions: Record<string, number[]>; // field -> hidden option IDs
}

export interface ProductCombination {
  id: number;
  name: string;
  sku: string;
  product_line: number;
  mirror_style?: number;
  light_direction?: number;
  frame_thickness?: number;
  frame_color?: number;
  size?: number;
  mounting?: number;
  driver?: number;
  light_output?: number;
  color_temperature?: number;
  // Add other product fields as needed
}

/**
 * Advanced filtering that combines product line filtering, rules engine, and product validity
 */
export async function getAdvancedFilteredOptions(context: FilterContext): Promise<FilteredOptions> {
  console.log('🔍 Advanced filtering started for:', {
    productLine: context.productLineId,
    sku: context.productLineSku,
    selections: context.currentSelections
  });

  // Step 1: Get all base options
  const baseOptions = await getAllBaseOptions();

  // Find the product line
  const productLine = baseOptions.productLines.find(pl => pl.id === context.productLineId);

  if (!productLine) {
    throw new Error(`Product line with ID ${context.productLineId} not found.`);
  }

  // Step 2: Filter by product line compatibility
  const productLineFiltered = filterByProductLine(baseOptions, productLine);

  // Step 3: Apply configurator visibility rules (hide_in_configurator)
  const visibilityFiltered = applyVisibilityFiltering(productLineFiltered, context.includeHidden);

  // Step 4: Get valid product combinations from products table
  const validCombinations = await getValidProductCombinations(context.productLineId);

  // Step 5: Apply rules engine processing
  const rulesProcessed = await applyRulesFiltering(visibilityFiltered, context, validCombinations);

  // Step 6: Determine disabled options based on valid combinations
  const disabledOptions = calculateDisabledOptions(rulesProcessed, validCombinations, context.currentSelections);

  // Step 7: Extract hidden options for reference
  const hiddenOptions = extractHiddenOptions(baseOptions, context.productLineId);

  console.log('✅ Advanced filtering complete:', {
    totalValidCombinations: validCombinations.length,
    disabledOptionsCount: Object.values(disabledOptions).flat().length,
    hiddenOptionsCount: Object.values(hiddenOptions).flat().length
  });

  return {
    ...rulesProcessed,
    validCombinations,
    disabledOptions,
    hiddenOptions
  };
}

/**
 * Get all base options from available tables
 */
async function getAllBaseOptions(): Promise<DynamicConfigOptions> {
  const options: DynamicConfigOptions = {
    productLines: [],
    frameColors: [],
    accessories: [],
    mirrorControls: [],
    mirrorStyles: [],
    mountingOptions: [],
    lightingOptions: [],
    colorTemperatures: [],
    lightOutputs: [],
    drivers: [],
    frameThickness: [],
    sizes: []
  };

  // Define table mappings
  const tableQueries = [
    { key: 'productLines', table: 'product_lines' },
    { key: 'frameColors', table: 'frame_colors' },
    { key: 'accessories', table: 'accessories' },
    { key: 'mirrorControls', table: 'mirror_controls' },
    { key: 'mirrorStyles', table: 'mirror_styles' },
    { key: 'mountingOptions', table: 'mounting_options' },
    { key: 'lightingOptions', table: 'light_directions' },
    { key: 'colorTemperatures', table: 'color_temperatures' },
    { key: 'lightOutputs', table: 'light_outputs' },
    { key: 'drivers', table: 'drivers' },
    { key: 'frameThickness', table: 'frame_thicknesses' },
    { key: 'sizes', table: 'sizes' }
  ];

  // Fetch all options in parallel
  const promises = tableQueries.map(async ({ key, table }) => {
    const data = await safeTableQuery(table, async (tableRef) => {
      return await tableRef
        .select('*')
        .eq('active', true)
        .order('sort', { ascending: true });
    });

    // For now, assume all options are compatible with all product lines
    // This can be enhanced later with proper relationship tables
    const transformedData = data.map(item => ({
      ...item,
      product_lines: [] // Empty array means compatible with all product lines
    }));

    (options as any)[key] = transformedData;
  });

  await Promise.all(promises);

  // Fetch default options for each product line
  if (tableExists('product_lines_default_options')) {
    for (const productLine of options.productLines) {
      const { data: defaultOptions, error } = await supabase
        .from('product_lines_default_options')
        .select('*')
        .eq('product_lines_id', productLine.id);

      if (error) {
        console.error(`Error fetching default options for product line ${productLine.id}:`, error);
        (productLine as any).default_options = [];
      } else {
        (productLine as any).default_options = defaultOptions;
      }
    }
  }

  return options;
}

/**
 * Filter options by product line compatibility
 */
function filterByProductLine(options: DynamicConfigOptions, productLine: GenericOption): DynamicConfigOptions {
  console.log(`🎯 Filtering options for product line ID: ${productLine.id}`);
  console.log('Product Line default_options:', (productLine as any).default_options);

  const filtered: DynamicConfigOptions = {
    productLines: options.productLines.filter(pl => pl.id === productLine.id),
    frameColors: filterOptionsByProductLineDefaults(options.frameColors, productLine, 'frame_colors'),
    accessories: filterOptionsByProductLineDefaults(options.accessories, productLine, 'accessories'),
    mirrorControls: filterOptionsByProductLineDefaults(options.mirrorControls, productLine, 'mirror_controls'),
    mirrorStyles: filterOptionsByProductLineDefaults(options.mirrorStyles, productLine, 'mirror_styles'),
    mountingOptions: filterOptionsByProductLineDefaults(options.mountingOptions, productLine, 'mounting_options'),
    lightingOptions: filterOptionsByProductLineDefaults(options.lightingOptions, productLine, 'light_directions'),
    colorTemperatures: filterOptionsByProductLineDefaults(options.colorTemperatures, productLine, 'color_temperatures'),
    lightOutputs: filterOptionsByProductLineDefaults(options.lightOutputs, productLine, 'light_outputs'),
    drivers: filterOptionsByProductLineDefaults(options.drivers, productLine, 'drivers'),
    frameThickness: filterOptionsByProductLineDefaults(options.frameThickness, productLine, 'frame_thicknesses'),
    sizes: filterOptionsByProductLineDefaults(options.sizes, productLine, 'sizes')
  };

  // Log filtering results
  Object.entries(filtered).forEach(([key, items]) => {
    if (key !== 'productLines') {
      const originalCount = (options as any)[key].length;
      const filteredCount = items.length;
      if (originalCount > 0) {
        console.log(`  ${key}: ${filteredCount}/${originalCount} options available`);
      }
    }
  });

  return filtered;
}

/**
 * Filter individual option array by product line default options
 */
function filterOptionsByProductLineDefaults(options: GenericOption[], productLine: GenericOption, collectionName: string): GenericOption[] {
  const defaultOptions = (productLine as any).default_options;
  console.log(`Filtering ${collectionName} with ${defaultOptions?.length || 0} default options.`);

  if (!defaultOptions || defaultOptions.length === 0) {
    // If no defaults configured, return all options for this product line
    return options;
  }

  // If defaults are objects with collection/item, filter by this collection
  if (typeof defaultOptions[0] === 'object') {
    const relevant = defaultOptions.filter((o: any) => o.collection === collectionName);
    if (relevant.length === 0) return [];
    const allowedIds = relevant.map((o: any) => parseInt(o.item, 10)).filter((n: any) => Number.isFinite(n));
    const filtered = options.filter(o => allowedIds.includes(o.id));
    return filtered;
  }

  // Unknown default_options shape → safest to return all
  return options;
}

/**
 * Apply visibility filtering (hide_in_configurator)
 */
function applyVisibilityFiltering(options: DynamicConfigOptions, includeHidden = false): DynamicConfigOptions {
  if (includeHidden) {
    return options; // Return all options if hidden should be included
  }

  console.log('👁️ Applying visibility filtering (hiding options with hide_in_configurator=true)');

  const filtered: DynamicConfigOptions = {
    productLines: options.productLines, // Product lines are always visible
    frameColors: options.frameColors.filter(opt => !opt.hide_in_configurator),
    accessories: options.accessories.filter(opt => !opt.hide_in_configurator),
    mirrorControls: options.mirrorControls.filter(opt => !opt.hide_in_configurator),
    mirrorStyles: options.mirrorStyles.filter(opt => !opt.hide_in_configurator),
    mountingOptions: options.mountingOptions.filter(opt => !opt.hide_in_configurator),
    lightingOptions: options.lightingOptions.filter(opt => !opt.hide_in_configurator),
    colorTemperatures: options.colorTemperatures.filter(opt => !opt.hide_in_configurator),
    lightOutputs: options.lightOutputs.filter(opt => !opt.hide_in_configurator),
    drivers: options.drivers.filter(opt => !opt.hide_in_configurator),
    frameThickness: options.frameThickness.filter(opt => !opt.hide_in_configurator),
    sizes: options.sizes.filter(opt => !opt.hide_in_configurator)
  };

  return filtered;
}

/**
 * Get valid product combinations from products table
 */
async function getValidProductCombinations(productLineId: number): Promise<ProductCombination[]> {
  if (!tableExists('products')) {
    console.log('⚠️ Products table not available, skipping combination validation');
    return [];
  }

  console.log(`📦 Loading valid product combinations for product line ${productLineId}`);

  const combinations = await safeTableQuery('products', async (table) => {
    return await table
      .select('*')
      .eq('product_line', productLineId)
      .eq('active', true);
  });

  console.log(`✅ Found ${combinations.length} valid product combinations`);
  return combinations;
}

/**
 * Apply rules engine filtering
 */
async function applyRulesFiltering(
  options: DynamicConfigOptions,
  context: FilterContext,
  validCombinations: ProductCombination[]
): Promise<DynamicConfigOptions> {
  console.log('⚙️ Applying rules engine filtering');

  try {
    // Build rules context
    const rulesContext = {
      product_line: context.productLineId,
      ...context.currentSelections
    };

    // Process rules
    const processedRules = await processRules(rulesContext);

    // Apply rule constraints to options
    // For now, return options as-is but in a real implementation
    // you would apply the processed rules to filter/modify options

    console.log('✅ Rules engine processing complete');
    return options;
  } catch (error) {
    console.warn('⚠️ Rules engine filtering failed, proceeding without rules:', error);
    return options;
  }
}

/**
 * Calculate which options should be disabled based on valid combinations
 */
function calculateDisabledOptions(
  options: DynamicConfigOptions,
  validCombinations: ProductCombination[],
  currentSelections: Record<string, any>
): Record<string, number[]> {
  console.log('🚫 Calculating disabled options based on valid combinations');

  const disabled: Record<string, number[]> = {};

  // Field mappings for combination checking
  const fieldMappings = {
    mirrorStyles: 'mirror_style',
    lightingOptions: 'light_direction',
    frameThickness: 'frame_thickness',
    frameColors: 'frame_color',
    sizes: 'size',
    mountingOptions: 'mounting',
    drivers: 'driver',
    lightOutputs: 'light_output',
    colorTemperatures: 'color_temperature'
  };

  // For each option type, check which options have no valid combinations
  Object.entries(fieldMappings).forEach(([optionKey, fieldKey]) => {
    const optionsArray = (options as any)[optionKey] as GenericOption[];
    const disabledIds: number[] = [];

    optionsArray.forEach(option => {
      // Check if this option appears in any valid combination
      // considering current selections
      const hasValidCombination = validCombinations.some(combo => {
        // Check if this option value matches
        if ((combo as any)[fieldKey] !== option.id) {
          return false;
        }

        // Check if other current selections are compatible
        return Object.entries(currentSelections).every(([selectionField, selectionValue]) => {
          if (!selectionValue || selectionField === optionKey) {
            return true; // Skip empty selections or current field
          }

          const comboField = fieldMappings[selectionField as keyof typeof fieldMappings];
          if (!comboField) {
            return true; // Skip unknown fields
          }

          return (combo as any)[comboField] === selectionValue;
        });
      });

      if (!hasValidCombination && validCombinations.length > 0) {
        disabledIds.push(option.id);
      }
    });

    if (disabledIds.length > 0) {
      disabled[optionKey] = disabledIds;
      console.log(`  ${optionKey}: ${disabledIds.length} options disabled`);
    }
  });

  return disabled;
}

/**
 * Extract hidden options for reference
 */
function extractHiddenOptions(options: DynamicConfigOptions, productLineId: number): Record<string, number[]> {
  const hidden: Record<string, number[]> = {};

  Object.entries(options).forEach(([key, optionsArray]) => {
    if (key === 'productLines') return;

    const hiddenIds = (optionsArray as GenericOption[])
      .filter(opt =>
        opt.hide_in_configurator &&
        (!opt.product_lines || opt.product_lines.length === 0 || opt.product_lines.includes(productLineId))
      )
      .map(opt => opt.id);

    if (hiddenIds.length > 0) {
      hidden[key] = hiddenIds;
    }
  });

  return hidden;
}

/**
 * Check if a specific combination is valid
 */
export function isValidCombination(
  selections: Record<string, any>,
  validCombinations: ProductCombination[]
): boolean {
  return validCombinations.some(combo => {
    return Object.entries(selections).every(([field, value]) => {
      if (!value) return true; // Skip empty selections

      const fieldMappings: Record<string, string> = {
        mirrorStyle: 'mirror_style',
        lighting: 'light_direction',
        frameThickness: 'frame_thickness',
        frameColor: 'frame_color',
        size: 'size',
        mounting: 'mounting',
        driver: 'driver',
        lightOutput: 'light_output',
        colorTemperature: 'color_temperature'
      };

      const comboField = fieldMappings[field];
      if (!comboField) return true;

      return (combo as any)[comboField] === parseInt(value);
    });
  });
}

/**
 * Get available options for next selection based on current state
 */
export function getAvailableOptionsForSelection(
  field: string,
  currentSelections: Record<string, any>,
  validCombinations: ProductCombination[],
  allOptions: GenericOption[]
): GenericOption[] {
  const fieldMappings: Record<string, string> = {
    mirrorStyles: 'mirror_style',
    lightingOptions: 'light_direction',
    frameThickness: 'frame_thickness',
    frameColors: 'frame_color',
    sizes: 'size',
    mountingOptions: 'mounting',
    drivers: 'driver',
    lightOutputs: 'light_output',
    colorTemperatures: 'color_temperature'
  };

  const comboField = fieldMappings[field];
  if (!comboField) return allOptions;

  // Get option IDs that appear in valid combinations given current selections
  const availableIds = new Set<number>();

  validCombinations.forEach(combo => {
    // Check if this combination matches current selections
    const matches = Object.entries(currentSelections).every(([selField, selValue]) => {
      if (!selValue || selField === field) return true;

      const selComboField = fieldMappings[selField];
      if (!selComboField) return true;

      return (combo as any)[selComboField] === parseInt(selValue);
    });

    if (matches) {
      const optionId = (combo as any)[comboField];
      if (optionId) {
        availableIds.add(optionId);
      }
    }
  });

  return allOptions.filter(option => availableIds.has(option.id));
}