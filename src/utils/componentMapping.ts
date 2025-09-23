/**
 * Component Mapping System
 * Maps collection names from configuration_ui to React component configurations
 * NO FALLBACK LOGIC - all mappings must be explicitly defined in database
 */

import type { ConfigurationUI, ProductOptions, ProductConfig } from '../store/types';

// UI Type mappings from configuration_ui.ui_type
export type UIType = 'button_grid' | 'color_picker' | 'preset_buttons' | 'single';

// Component configuration for dynamic rendering
export interface ComponentConfig {
  collection: string;
  title: string;
  description: string;
  type: string; // Maps to ConfigurationOption type prop
  columns?: number;
  configKey: keyof ProductConfig;
  optionsKey: keyof ProductOptions;
}

/**
 * Collection to ProductOptions key mapping
 * Maps database collection names to ProductOptions interface keys
 */
const COLLECTION_TO_OPTIONS_KEY: Record<string, keyof ProductOptions> = {
  'hanging_techniques': 'mountingOptions', // hanging_techniques maps to mountingOptions for now
  'mirror_styles': 'mirrorStyles',
  'frame_thicknesses': 'frameThickness',
  'frame_colors': 'frameColors',
  'drivers': 'drivers',
  'mounting_options': 'mountingOptions',
  'color_temperatures': 'colorTemperatures',
  'light_directions': 'lightingOptions',
  'light_outputs': 'lightOutputs',
  'sizes': 'sizes',
  'accessories': 'accessoryOptions',
};

/**
 * Collection to ProductConfig key mapping
 * Maps database collection names to ProductConfig interface keys
 */
const COLLECTION_TO_CONFIG_KEY: Record<string, keyof ProductConfig> = {
  'hanging_techniques': 'mounting', // hanging_techniques maps to mounting for now
  'mirror_styles': 'mirrorStyle',
  'frame_thicknesses': 'frameThickness',
  'frame_colors': 'frameColor',
  'drivers': 'driver',
  'mounting_options': 'mounting',
  'color_temperatures': 'colorTemperature',
  'light_directions': 'lighting',
  'light_outputs': 'lightOutput',
  'sizes': 'width', // sizes maps to width field (height is derived)
  'accessories': 'accessories',
};

/**
 * UI Type to ConfigurationOption type mapping
 * Maps configuration_ui.ui_type to ConfigurationOption component type prop
 */
const UI_TYPE_TO_COMPONENT_TYPE: Record<UIType, string> = {
  'button_grid': 'grid',
  'color_picker': 'grid', // color_picker renders as grid but with special color handling
  'preset_buttons': 'grid',
  'single': 'single',
};

/**
 * Collection titles for display
 * Maps database collection names to user-friendly titles
 */
const COLLECTION_TITLES: Record<string, string> = {
  'hanging_techniques': 'Hanging Techniques',
  'mirror_styles': 'Mirror Style',
  'frame_thicknesses': 'Frame Thickness',
  'frame_colors': 'Frame Color',
  'drivers': 'Drivers',
  'mounting_options': 'Mounting Options',
  'color_temperatures': 'Color Temperature',
  'light_directions': 'Light Direction',
  'light_outputs': 'Light Output',
  'sizes': 'Size',
  'accessories': 'Accessories',
};

/**
 * Get component columns based on UI type and collection
 */
function getComponentColumns(uiType: UIType, collection: string): number | undefined {
  // Color picker and preset buttons use 2 columns by default
  if (uiType === 'color_picker' || uiType === 'preset_buttons') {
    return 2;
  }

  // Button grid uses 2 columns for frame colors, 1 for others
  if (uiType === 'button_grid') {
    return collection === 'frame_colors' ? 2 : undefined;
  }

  // Single type doesn't use columns
  return undefined;
}

/**
 * Generate description for component based on options count
 */
function generateDescription(collection: string, optionsCount: number): string {
  const title = COLLECTION_TITLES[collection] || collection;
  return `Choose from ${optionsCount} available ${title.toLowerCase()} options`;
}

/**
 * Convert configuration_ui record to ComponentConfig
 * NO FALLBACK LOGIC - throws error if mapping not found
 */
export function mapConfigurationUIToComponent(
  configUI: ConfigurationUI,
  productOptions: ProductOptions
): ComponentConfig {
  const { collection, ui_type } = configUI;

  // Validate UI type is supported
  if (!UI_TYPE_TO_COMPONENT_TYPE[ui_type as UIType]) {
    throw new Error(`Unsupported UI type: ${ui_type} for collection: ${collection}`);
  }

  // Get mapping keys - throw error if not found (NO FALLBACK)
  const optionsKey = COLLECTION_TO_OPTIONS_KEY[collection];
  if (!optionsKey) {
    throw new Error(`No options key mapping found for collection: ${collection}`);
  }

  const configKey = COLLECTION_TO_CONFIG_KEY[collection];
  if (!configKey) {
    throw new Error(`No config key mapping found for collection: ${collection}`);
  }

  // Get title - throw error if not found (NO FALLBACK)
  const title = COLLECTION_TITLES[collection];
  if (!title) {
    throw new Error(`No title mapping found for collection: ${collection}`);
  }

  // Get options count for description
  const options = productOptions[optionsKey];
  const optionsCount = Array.isArray(options) ? options.length : 0;

  return {
    collection,
    title,
    description: generateDescription(collection, optionsCount),
    type: UI_TYPE_TO_COMPONENT_TYPE[ui_type as UIType],
    columns: getComponentColumns(ui_type as UIType, collection),
    configKey,
    optionsKey,
  };
}

/**
 * Sort configuration_ui records by sort field ascending
 * Handles malformed sort values defensively
 */
export function sortConfigurationUIBySortField(configUI: ConfigurationUI[]): ConfigurationUI[] {
  return [...configUI].sort((a, b) => {
    // Handle malformed or missing sort values
    const sortA = (typeof a.sort === 'number' && !isNaN(a.sort)) ? a.sort : 999999;
    const sortB = (typeof b.sort === 'number' && !isNaN(b.sort)) ? b.sort : 999999;

    if (sortA !== sortB) {
      return sortA - sortB;
    }

    // Use id as tiebreaker for consistent ordering
    return a.id.localeCompare(b.id);
  });
}

/**
 * Filter configuration_ui to only include collections that exist in product line default options
 */
export function filterAvailableCollections(
  configUI: ConfigurationUI[],
  productOptions: ProductOptions,
  currentProductLine?: any
): ConfigurationUI[] {
  return configUI.filter(config => {
    // Defensive programming: handle null/empty collection names
    if (!config.collection || config.collection.trim() === '') {
      console.warn(`⚠️ Invalid collection name: "${config.collection}"`);
      return false;
    }

    const optionsKey = COLLECTION_TO_OPTIONS_KEY[config.collection];
    if (!optionsKey) {
      console.warn(`⚠️ No options key mapping for collection: ${config.collection}`);
      return false;
    }

    // Check if options exist and have items
    const options = productOptions[optionsKey];
    if (!options || !Array.isArray(options) || options.length === 0) {
      return false;
    }

    // If no product line selected, show all available collections
    if (!currentProductLine) {
      console.log(`📋 No product line selected, showing collection '${config.collection}'`);
      return true;
    }

    console.log(`🔍 Checking collection '${config.collection}' for product line '${currentProductLine.name}'`);
    console.log(`🔍 Product line default_options:`, currentProductLine.default_options);

    // Check if this collection exists in the product line's default options
    const defaultOptions = currentProductLine.default_options;
    if (!defaultOptions || !Array.isArray(defaultOptions) || defaultOptions.length === 0) {
      console.warn(`⚠️ Product line ${currentProductLine.name} has no default options configured - showing all collections`);
      return true; // If no defaults configured, show all collections (fallback)
    }

    // Look for this collection in the default options
    const hasCollectionInDefaults = defaultOptions.some((defaultOption: any) => {
      console.log(`🔍 Checking default option:`, defaultOption, `against collection '${config.collection}'`);
      return defaultOption.collection === config.collection;
    });

    if (!hasCollectionInDefaults) {
      console.log(`📋 Collection '${config.collection}' not in product line '${currentProductLine.name}' defaults - hiding from UI`);
      return false;
    }

    console.log(`✅ Collection '${config.collection}' found in product line '${currentProductLine.name}' defaults - showing in UI`);
    return true;
  });
}

/**
 * Build ordered component configurations from configuration_ui data
 * NO FALLBACK LOGIC - all components must be defined in database
 */
export function buildOrderedComponentConfigs(
  configUI: ConfigurationUI[],
  productOptions: ProductOptions,
  currentProductLine?: any
): ComponentConfig[] {
  // Sort by sort field
  const sortedConfigUI = sortConfigurationUIBySortField(configUI);

  // Filter to only collections that exist in product line default options
  const availableConfigUI = filterAvailableCollections(sortedConfigUI, productOptions, currentProductLine);

  // Map to component configurations
  return availableConfigUI.map(config =>
    mapConfigurationUIToComponent(config, productOptions)
  );
}

/**
 * Validate component mapping integrity
 * Checks that all required mappings exist for given configuration_ui data
 */
export function validateComponentMappings(configUI: ConfigurationUI[]): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  configUI.forEach((config, index) => {
    const { collection, ui_type, sort } = config;

    // Check for null or empty collection names
    if (!collection || collection.trim() === '') {
      errors.push(`Invalid collection name at index ${index}: "${collection}"`);
      return; // Skip further validation for this item
    }

    // Check for malformed sort values
    if (sort !== null && sort !== undefined) {
      if (typeof sort !== 'number' || isNaN(sort)) {
        errors.push(`Invalid sort value for collection "${collection}": ${sort} (expected number)`);
      }
      if (sort < 0) {
        errors.push(`Negative sort value for collection "${collection}": ${sort} (should be >= 0)`);
      }
      if (sort > 999999) {
        errors.push(`Extremely large sort value for collection "${collection}": ${sort} (should be reasonable)`);
      }
    }

    // Check for null or empty UI type
    if (!ui_type || ui_type.trim() === '') {
      errors.push(`Invalid ui_type for collection "${collection}": "${ui_type}"`);
      return; // Skip UI type validation if empty
    }

    // Check UI type is supported
    if (!UI_TYPE_TO_COMPONENT_TYPE[ui_type as UIType]) {
      errors.push(`Unsupported UI type: ${ui_type} for collection: ${collection}`);
    }

    // Check options key mapping exists
    if (!COLLECTION_TO_OPTIONS_KEY[collection]) {
      errors.push(`Missing options key mapping for collection: ${collection}`);
    }

    // Check config key mapping exists
    if (!COLLECTION_TO_CONFIG_KEY[collection]) {
      errors.push(`Missing config key mapping for collection: ${collection}`);
    }

    // Check title mapping exists
    if (!COLLECTION_TITLES[collection]) {
      errors.push(`Missing title mapping for collection: ${collection}`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Get supported UI types
 */
export function getSupportedUITypes(): UIType[] {
  return Object.keys(UI_TYPE_TO_COMPONENT_TYPE) as UIType[];
}

/**
 * Get mapped collections (collections that have complete mappings)
 */
export function getMappedCollections(): string[] {
  return Object.keys(COLLECTION_TO_OPTIONS_KEY);
}