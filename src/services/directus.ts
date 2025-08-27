// Directus Service Layer - Uses SDK for all API calls
import { readItems } from '@directus/sdk';
import {
  directusClient,
  authenticateIfNeeded,
  // Re-export types from directus-client
  ProductLineImage,
  DefaultOption,
  ProductLine,
  FrameColor,
  Accessory,
  MirrorControl,
  MirrorStyle,
  MountingOption,
  LightDirection,
  ColorTemperature,
  LightOutput,
  Driver,
  FrameThickness,
  Size,
  DecoProduct,
  ConfigImageRule,
  ConfigurationImage,
  Rule
} from './directus-client';

// All data comes from Directus API - no static fallbacks

// Re-export types for backward compatibility
export type {
  ProductLineImage,
  DefaultOption,
  ProductLine,
  FrameColor,
  Accessory,
  MirrorControl,
  MirrorStyle,
  MountingOption,
  LightDirection,
  ColorTemperature,
  LightOutput,
  Driver,
  FrameThickness,
  Size,
  DecoProduct,
  ConfigImageRule,
  ConfigurationImage,
  Rule
};

// Cache for performance
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Database availability flag
let isApiAvailable = true;
let lastApiCheck = 0;
const API_CHECK_INTERVAL = 30 * 1000; // 30 seconds

// Helper function to check if cache is valid
function isCacheValid(key: string): boolean {
  const cached = cache.get(key);
  if (!cached) return false;
  return Date.now() - cached.timestamp < CACHE_DURATION;
}

// Data validation functions
function validateFrameColor(item: any): item is FrameColor {
  return (
    typeof item === 'object' &&
    typeof item.id === 'number' &&
    typeof item.name === 'string' &&
    typeof item.hex_code === 'string' &&
    typeof item.active === 'boolean' &&
    typeof item.sort === 'number' &&
    typeof item.sku_code === 'string'
  );
}

function validateProductLine(item: any): item is ProductLine {
  return (
    typeof item === 'object' &&
    typeof item.id === 'number' &&
    typeof item.name === 'string' &&
    typeof item.sku_code === 'string' &&
    (item.description === null || typeof item.description === 'string')
  );
}

function validateAccessory(item: any): item is Accessory {
  return (
    typeof item === 'object' &&
    typeof item.id === 'number' &&
    typeof item.name === 'string' &&
    typeof item.sku_code === 'string' &&
    typeof item.active === 'boolean' &&
    (typeof item.sort === 'number' || item.sort === null)
  );
}

function validateBasicItem(item: any): boolean {
  return (
    typeof item === 'object' &&
    typeof item.id === 'number' &&
    typeof item.name === 'string' &&
    typeof item.sku_code === 'string' &&
    typeof item.active === 'boolean' &&
    (typeof item.sort === 'number' || item.sort === null || item.sort === undefined)
  );
}

function validateSize(item: any): item is Size {
  return (
    validateBasicItem(item) &&
    typeof item.width === 'string' &&
    typeof item.height === 'string'
  );
}

// Removed unused validateConfigurationImage for noise reduction

// Generic validation function
function validateData<T>(data: any[], validator: (item: any) => boolean, collectionName: string): T[] {
  if (!Array.isArray(data)) {
    console.warn(`⚠️ Expected array for ${collectionName}, got:`, typeof data);
    return [];
  }

  const validItems = data.filter(item => {
    const isValid = validator(item);
    if (!isValid) {
      console.warn(`⚠️ Invalid item in ${collectionName}:`, item);
    }
    return isValid;
  });

  const invalidCount = data.length - validItems.length;
  if (invalidCount > 0) {
    console.warn(`⚠️ ${invalidCount} invalid items filtered from ${collectionName}`);
  }

  console.log(`✓ Validated ${validItems.length} items in ${collectionName}`);
  return validItems as T[];
}

// Helper function to get from cache or fetch
async function getCachedData<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  if (isCacheValid(key)) {
    return cache.get(key)!.data;
  }

  try {
    const data = await fetcher();
    cache.set(key, { data, timestamp: Date.now() });
    return data;
  } catch (error) {
    console.error(`Error fetching ${key}:`, error);
    // Return cached data if available, even if expired
    const cached = cache.get(key);
    if (cached) {
      console.warn(`Using expired cache for ${key}`);
      return cached.data;
    }
    throw error;
  }
}

// Bulk data storage for GraphQL responses
let bulkDataCache: any = null;
let bulkDataTimestamp = 0;

// Test connection to Directus
let connectionTested = false;
async function testConnection(): Promise<void> {
  // Only check API periodically when it's known to be down
  if (!isApiAvailable && Date.now() - lastApiCheck < API_CHECK_INTERVAL) {
    throw new Error('API is currently unavailable');
  }
  
  if (connectionTested && isApiAvailable) return;
  
  try {
    console.log(`Testing connection to Directus...`);
    // Authenticate if needed
    await authenticateIfNeeded();
    
    // Test connection by fetching a small dataset using SDK
    await directusClient.request(
      readItems('frame_colors' as any, {
        limit: 1
      })
    );
    console.log('✓ Directus connection successful');
    connectionTested = true;
    isApiAvailable = true;
  } catch (error) {
    console.error('❌ Directus connection failed:', error);
    isApiAvailable = false;
    lastApiCheck = Date.now();
    connectionTested = false;
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error connecting to Directus.');
    }
    if (error instanceof Error && error.message.includes('401')) {
      throw new Error('Authentication error connecting to Directus.');
    }
    throw new Error(`Cannot connect to Directus: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Direct API call function using SDK
async function getDirectusItems<T = any>(collection: string, query?: any): Promise<T[]> {
  // Test connection on first call
  await testConnection();
  
  if (import.meta.env.DEV) {
    console.log(`Fetching ${collection} from Directus...`);
  }
  
  try {
    const mergedQuery = { limit: -1, ...(query || {}) };
    const result = await directusClient.request<T[]>(
      readItems(collection as any, mergedQuery as any)
    );
    if (import.meta.env.DEV) console.log(`✓ Successfully fetched ${result.length} items from ${collection}`);
    
    // Debug first item
    // No noisy per-item debug logging
    
    return result;
  } catch (error) {
    console.error(`❌ Error fetching ${collection}:`, error);
    
    // Handle API errors
    if (error instanceof Error) {
      if (error.message.includes('401') || error.message.includes('403')) {
        console.warn(`⚠️ Collection ${collection} requires authentication. Returning empty array.`);
        return [];
      }
      
      if (error.message.includes('404')) {
        throw new Error(`Collection not found: ${collection}`);
      }
    }
    
    throw new Error(`Error fetching ${collection}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Bulk fetch all collections using GraphQL
async function fetchBulkData(): Promise<any> {
  try {
    // Check cache first
    if (bulkDataCache && (Date.now() - bulkDataTimestamp < CACHE_DURATION)) {
      console.log('✓ Using cached bulk data');
      return bulkDataCache;
    }

    console.log('⚠️ GraphQL bulk data fetch disabled due to schema issues');
    console.log('⚠️ Using individual REST API calls instead');
    
    // Return null to trigger individual REST API calls
    return null;
  } catch (error) {
    console.error('❌ Error in bulk data function:', error);
    return null;
  }
}

// Frame Colors
export async function getActiveFrameColors(): Promise<FrameColor[]> {
  return getCachedData('frame_colors', async () => {
    try {
      // Try to get from bulk data first
      const bulkData = await fetchBulkData();
      if (bulkData?.frame_colors) {
        return validateData<FrameColor>(bulkData.frame_colors, validateFrameColor, 'frame_colors');
      }
    } catch (error) {
      console.warn('Failed to get frame_colors from bulk data, fetching individually');
    }
    
    try {
      // Get from individual API call if not in bulk data
      const items = await getDirectusItems<FrameColor>('frame_colors', {
        filter: { active: { _eq: true } },
        sort: ['sort']
      });
      return validateData<FrameColor>(items, validateFrameColor, 'frame_colors');
    } catch (error) {
      console.error('Failed to fetch frame_colors from API:', error);
      throw error;
    }
  });
}

export async function getFrameColorById(id: number): Promise<FrameColor | undefined> {
  const colors = await getActiveFrameColors();
  return colors.find(color => color.id === id);
}

export async function getFrameColorBySku(sku: string): Promise<FrameColor | undefined> {
  const colors = await getActiveFrameColors();
  return colors.find(color => color.sku_code === sku);
}

// Product Lines
export async function getActiveProductLines(): Promise<ProductLine[]> {
  return getCachedData('product_lines', async () => {
    try {
      // Try to get from bulk data first
      const bulkData = await fetchBulkData();
      if (bulkData?.product_lines) {
        return validateData<ProductLine>(bulkData.product_lines, validateProductLine, 'product_lines');
      }
    } catch (error) {
      console.warn('Failed to get product_lines from bulk data, fetching individually');
    }
    
    try {
      // Get from individual API call if not in bulk data
      const items = await getDirectusItems<ProductLine>('product_lines', {
        filter: { active: { _eq: true } },
        sort: ['sort']
      });
      return validateData<ProductLine>(items, validateProductLine, 'product_lines');
    } catch (error) {
      console.error('Failed to fetch product_lines from API:', error);
      throw error;
    }
  });
}

export async function getProductLineById(id: number): Promise<ProductLine | undefined> {
  const lines = await getActiveProductLines();
  return lines.find(line => line.id === id);
}

export async function getProductLineBySku(sku: string): Promise<ProductLine | undefined> {
  const lines = await getActiveProductLines();
  return lines.find(line => line.sku_code === sku);
}

// Get product line with expanded default options
export async function getProductLineWithOptions(sku: string): Promise<ProductLine | undefined> {
  try {
    if (import.meta.env.DEV) console.log(`Fetching product line ${sku} with default options...`);
    
    // Ensure we're authenticated before trying to fetch relations
    await authenticateIfNeeded();
    
    const items = await getDirectusItems<ProductLine>('product_lines', {
      filter: { sku_code: { _eq: sku } },
      fields: ['*', 'default_options.*']
    });

    if (items.length === 0) {
      console.warn(`Product line with SKU ${sku} not found`);
      return undefined;
    }

    const productLine = items[0];
    if (import.meta.env.DEV) console.log(`✓ Found product line ${productLine.name} with ${productLine.default_options?.length || 0} default options`);
    
    // Debug: Log the structure of default_options
    if (productLine.default_options && productLine.default_options.length > 0) {
      if (import.meta.env.DEV) console.log('📋 Default options structure:', {
        count: productLine.default_options.length,
        firstItem: productLine.default_options[0],
        type: typeof productLine.default_options[0],
        isArray: Array.isArray(productLine.default_options)
      });
      
      // Log sample of default options by collection
      const optionsByCollection = (productLine.default_options as any[]).reduce((acc, opt) => {
        const collection = opt.collection || 'unknown';
        if (!acc[collection]) acc[collection] = [];
        acc[collection].push(opt.item);
        return acc;
      }, {} as Record<string, any[]>);
      
      if (import.meta.env.DEV) console.log('📊 Default options by collection:', optionsByCollection);
    } else {
      if (import.meta.env.DEV) {
        console.log('ℹ️ No default_options configured for this product line.');
        console.log('   The app will show ALL available options.');
        console.log('   To restrict options, configure default_options in Directus.');
      }
    }
    
    return productLine;
  } catch (error) {
    console.error(`❌ Error fetching product line ${sku}:`, error);
    return undefined;
  }
}

// Helper function to get collection from bulk data or API
async function getBulkDataCollection<T>(
  collectionName: string, 
  validator: (item: any) => boolean,
  query?: any
): Promise<T[]> {
  try {
    // Try to get from bulk data first
    const bulkData = await fetchBulkData();
    if (bulkData?.[collectionName]) {
      return validateData<T>(bulkData[collectionName], validator, collectionName);
    }
  } catch (error) {
    console.warn(`Failed to get ${collectionName} from bulk data, fetching individually`);
  }
  
  // Get from individual API call if not in bulk data
  const items = await getDirectusItems<T>(collectionName, query || {
    filter: { active: { _eq: true } },
    sort: ['sort']
  });
  return validateData<T>(items, validator, collectionName);
}

// Accessories
export async function getActiveAccessories(): Promise<Accessory[]> {
  return getCachedData('accessories', async () => {
    try {
      return await getBulkDataCollection<Accessory>('accessories', validateAccessory);
    } catch (error) {
      console.error('Failed to fetch accessories from API:', error);
      throw error;
    }
  });
}

// Mirror Controls
export async function getActiveMirrorControls(): Promise<MirrorControl[]> {
  return getCachedData('mirror_controls', async () => {
    try {
      return await getBulkDataCollection<MirrorControl>('mirror_controls', validateBasicItem);
    } catch (error) {
      console.error('Failed to fetch mirror_controls from API:', error);
      throw error;
    }
  });
}

// Mirror Styles
export async function getActiveMirrorStyles(): Promise<MirrorStyle[]> {
  return getCachedData('mirror_styles', async () => {
    try {
      return await getBulkDataCollection<MirrorStyle>('mirror_styles', validateBasicItem);
    } catch (error) {
      console.error('Failed to fetch mirror_styles from API:', error);
      throw error;
    }
  });
}

// Mounting Options
export async function getActiveMountingOptions(): Promise<MountingOption[]> {
  return getCachedData('mounting_options', async () => {
    try {
      return await getBulkDataCollection<MountingOption>('mounting_options', validateBasicItem);
    } catch (error) {
      console.error('Failed to fetch mounting_options from API:', error);
      throw error;
    }
  });
}

// Light Directions
export async function getActiveLightDirections(): Promise<LightDirection[]> {
  return getCachedData('light_directions', async () => {
    try {
      return await getBulkDataCollection<LightDirection>('light_directions', validateBasicItem);
    } catch (error) {
      console.error('Failed to fetch light_directions from API:', error);
      throw error;
    }
  });
}

// Color Temperatures
export async function getActiveColorTemperatures(): Promise<ColorTemperature[]> {
  return getCachedData('color_temperatures', async () => {
    try {
      return await getBulkDataCollection<ColorTemperature>('color_temperatures', validateBasicItem);
    } catch (error) {
      console.error('Failed to fetch color_temperatures from API:', error);
      throw error;
    }
  });
}

// Light Outputs
export async function getActiveLightOutputs(): Promise<LightOutput[]> {
  return getCachedData('light_outputs', async () => {
    try {
      return await getBulkDataCollection<LightOutput>('light_outputs', validateBasicItem);
    } catch (error) {
      console.error('Failed to fetch light_outputs from API:', error);
      throw error;
    }
  });
}

// Drivers
export async function getActiveDrivers(): Promise<Driver[]> {
  return getCachedData('drivers', async () => {
    try {
      return await getBulkDataCollection<Driver>('drivers', validateBasicItem);
    } catch (error) {
      console.error('Failed to fetch drivers from API:', error);
      throw error;
    }
  });
}

// Frame Thickness
export async function getActiveFrameThicknesses(): Promise<FrameThickness[]> {
  return getCachedData('frame_thicknesses', async () => {
    try {
      return await getBulkDataCollection<FrameThickness>('frame_thicknesses', validateBasicItem);
    } catch (error) {
      console.error('Failed to fetch frame_thicknesses from API:', error);
      throw error;
    }
  });
}

// Sizes
export async function getActiveSizes(): Promise<Size[]> {
  return getCachedData('sizes', async () => {
    try {
      return await getBulkDataCollection<Size>('sizes', validateSize);
    } catch (error) {
      console.error('Failed to fetch sizes from API:', error);
      throw error;
    }
  });
}

export function getNumericDimensions(size: Size): { width: number; height: number } {
  return {
    width: parseInt(size.width),
    height: parseInt(size.height)
  };
}

// Configuration Images - DEPRECATED: Now using vertical_image and horizontal_image from products
export async function getActiveConfigurationImages(): Promise<ConfigurationImage[]> {
  console.log('ℹ️ Configuration images collection is deprecated - using product vertical_image and horizontal_image instead');
  return [];
}

// Configuration Images - DEPRECATED: Now using vertical_image and horizontal_image from products
export async function getAllConfigurationImages(): Promise<ConfigurationImage[]> {
  console.log('ℹ️ Configuration images collection is deprecated - using product vertical_image and horizontal_image instead');
  return [];
}

// Rules - Fetch rules for SKU generation and overrides
export async function getRules(): Promise<Rule[]> {
  return getCachedData('rules', async () => {
    try {
      console.log('Fetching rules from Directus...');
      const rules = await directusClient.request(readItems('rules'));
      console.log(`✓ Fetched ${rules.length} rules`);
      
      // Sort by priority (handle null priorities as lowest)
      return rules.sort((a, b) => {
        const priorityA = a.priority ?? Number.MAX_SAFE_INTEGER;
        const priorityB = b.priority ?? Number.MAX_SAFE_INTEGER;
        return priorityA - priorityB;
      });
    } catch (error) {
      console.error('Failed to fetch rules:', error);
      // Return empty array - rules are optional enhancement
      return [];
    }
  });
}

// Get all products
export async function getAllProducts(): Promise<DecoProduct[]> {
  return getCachedData('products', async () => {
    try {
      await authenticateIfNeeded();
      const limit = 200;
      let offset = 0;
      let all: any[] = [];
      while (true) {
        const page = await directusClient.request<any[]>(
          readItems('products' as any, {
            fields: ['id','name','product_line','mirror_style','light_direction','vertical_image','horizontal_image','active'],
            limit,
            offset,
            sort: ['id']
          } as any)
        );
        all = all.concat(page || []);
        if (!page || page.length < limit) break;
        offset += limit;
      }
      const activeItems = all.filter((p: any) => p.active !== false);
      if (import.meta.env.DEV) console.log(`✓ Loaded ${activeItems.length} active products via SDK`);
      return activeItems;
    } catch (error) {
      console.error('Failed to fetch products via SDK:', error);
      return [];
    }
  });
}

// Legacy function for compatibility - redirects to getAllProducts
export async function getActiveDecoProducts(): Promise<DecoProduct[]> {
  const allProducts = await getAllProducts();
  // Filter for Deco products if needed
  return allProducts.filter(p => p.name?.startsWith('D') || p.name?.startsWith('T') || p.name?.startsWith('W'));
}

export async function getDecoProductByName(name: string): Promise<DecoProduct | undefined> {
  const products = await getAllProducts();
  return products.find(product => product.name === name);
}

// Get product by SKU code based on configuration
export async function getProductBySKU(
  productLineSKU: string,
  frameThicknessSKU?: string,
  mirrorStyleSKU?: string,
  lightDirectionSKU?: string
): Promise<DecoProduct | undefined> {
  const products = await getAllProducts();
  
  let targetSKU = '';
  
  if (productLineSKU === 'D') {
    // DECO product line: [frameThickness][mirrorStyle][lightDirection]
    // Example: W01D (Wide, mirror style 01, Direct light)
    if (!frameThicknessSKU || !mirrorStyleSKU || !lightDirectionSKU) {
      console.warn('Missing required SKUs for DECO product line');
      return undefined;
    }
    targetSKU = `${frameThicknessSKU}${mirrorStyleSKU}${lightDirectionSKU}`;
  } else {
    // Other product lines: [productLineSKU][mirrorStyle][lightDirection]
    // Example: L01D (Classic, mirror style 01, Direct light)
    if (!mirrorStyleSKU || !lightDirectionSKU) {
      console.warn('Missing required SKUs for product line', productLineSKU);
      return undefined;
    }
    targetSKU = `${productLineSKU}${mirrorStyleSKU}${lightDirectionSKU}`;
  }
  
  console.log(`🔍 Looking for product with SKU: ${targetSKU}`);
  const product = products.find(p => p.name === targetSKU);
  
  if (product) {
    console.log(`✓ Found product: ${product.name} (ID: ${product.id})`);
  } else {
    console.warn(`⚠️ No product found for SKU: ${targetSKU}`);
  }
  
  return product;
}

// Filter options based on product line default options
export function filterOptionsByProductLine<T extends { id: number }>(
  allOptions: T[],
  productLine: ProductLine,
  collectionName: string
): T[] {
  if (import.meta.env.DEV) console.log(`🔍 Filtering ${collectionName} for ${productLine.name} (SKU: ${productLine.sku_code})`);

  // If no defaults configured, this product line has no option sets
  if (!productLine.default_options || productLine.default_options.length === 0) {
    return [];
  }

  // If defaults are objects with collection/item, filter by this collection
  if (typeof productLine.default_options[0] === 'object') {
    const relevant = (productLine.default_options as any[]).filter(o => o.collection === collectionName);
    if (relevant.length === 0) return [];
    const allowedIds = relevant.map(o => parseInt(o.item)).filter(n => Number.isFinite(n));
    const filtered = allOptions.filter(o => allowedIds.includes(o.id));
    return filtered;
  }

  // Unknown default_options shape → safest to return none
  return [];
}

// Get filtered options for a specific product line
export async function getFilteredOptionsForProductLine(productLine: ProductLine) {
  if (import.meta.env.DEV) console.log(`🔧 Loading filtered options for ${productLine.name}...`);

  // Use bulk data fetch for better performance
  let allOptions: any = {};
  
  try {
    // Try to get all data from bulk GraphQL query first
    const bulkData = await fetchBulkData();
    
    // Check if bulk data is available and has the expected structure
    if (bulkData && typeof bulkData === 'object') {
      allOptions = {
        allMirrorControls: validateData<MirrorControl>(bulkData.mirror_controls || [], validateBasicItem, 'mirror_controls'),
        allFrameColors: validateData<FrameColor>(bulkData.frame_colors || [], validateFrameColor, 'frame_colors'),
        allFrameThicknesses: validateData<FrameThickness>(bulkData.frame_thicknesses || [], validateBasicItem, 'frame_thicknesses'),
        allMirrorStyles: validateData<MirrorStyle>(bulkData.mirror_styles || [], validateBasicItem, 'mirror_styles'),
        allMountingOptions: validateData<MountingOption>(bulkData.mounting_options || [], validateBasicItem, 'mounting_options'),
        allLightDirections: validateData<LightDirection>(bulkData.light_directions || [], validateBasicItem, 'light_directions'),
        allColorTemperatures: validateData<ColorTemperature>(bulkData.color_temperatures || [], validateBasicItem, 'color_temperatures'),
        allLightOutputs: validateData<LightOutput>(bulkData.light_outputs || [], validateBasicItem, 'light_outputs'),
        allDrivers: validateData<Driver>(bulkData.drivers || [], validateBasicItem, 'drivers'),
        allAccessories: validateData<Accessory>(bulkData.accessories || [], validateAccessory, 'accessories'),
        allSizes: validateData<Size>(bulkData.sizes || [], validateSize, 'sizes')
      };
      
      if (import.meta.env.DEV) console.log('✓ Using bulk data for filtered options');
    } else {
      throw new Error('Bulk data is null or invalid, falling back to individual calls');
    }
  } catch (error) {
    if (import.meta.env.DEV) console.warn('Bulk data fetch failed, will use individual calls:', error);
    
    // Use individual API calls
    const [
      allMirrorControls,
      allFrameColors,
      allFrameThicknesses,
      allMirrorStyles,
      allMountingOptions,
      allLightDirections,
      allColorTemperatures,
      allLightOutputs,
      allDrivers,
      allAccessories,
      allSizes
    ] = await Promise.all([
      getActiveMirrorControls(),
      getActiveFrameColors(),
      getActiveFrameThicknesses(),
      getActiveMirrorStyles(),
      getActiveMountingOptions(),
      getActiveLightDirections(),
      getActiveColorTemperatures(),
      getActiveLightOutputs(),
      getActiveDrivers(),
      getActiveAccessories(),
      getActiveSizes()
    ]);
    
    allOptions = {
      allMirrorControls,
      allFrameColors,
      allFrameThicknesses,
      allMirrorStyles,
      allMountingOptions,
      allLightDirections,
      allColorTemperatures,
      allLightOutputs,
      allDrivers,
      allAccessories,
      allSizes
    };
  }


  // Filter based on product line default options
  const filteredOptions = {
    mirrorControls: filterOptionsByProductLine<MirrorControl>(allOptions.allMirrorControls, productLine, 'mirror_controls'),
    frameColors: filterOptionsByProductLine<FrameColor>(allOptions.allFrameColors, productLine, 'frame_colors'),
    frameThickness: filterOptionsByProductLine<FrameThickness>(allOptions.allFrameThicknesses, productLine, 'frame_thicknesses'),
    mirrorStyles: filterOptionsByProductLine<MirrorStyle>(allOptions.allMirrorStyles, productLine, 'mirror_styles'),
    mountingOptions: filterOptionsByProductLine<MountingOption>(allOptions.allMountingOptions, productLine, 'mounting_options'),
    lightingOptions: filterOptionsByProductLine<LightDirection>(allOptions.allLightDirections, productLine, 'light_directions'),
    colorTemperatures: filterOptionsByProductLine<ColorTemperature>(allOptions.allColorTemperatures, productLine, 'color_temperatures'),
    lightOutputs: filterOptionsByProductLine<LightOutput>(allOptions.allLightOutputs, productLine, 'light_outputs'),
    drivers: filterOptionsByProductLine<Driver>(allOptions.allDrivers, productLine, 'drivers'),
    accessories: filterOptionsByProductLine<Accessory>(allOptions.allAccessories, productLine, 'accessories'),
    sizes: filterOptionsByProductLine<Size>(allOptions.allSizes, productLine, 'sizes')
  };

  if (import.meta.env.DEV) console.log(`✓ Filtered options for ${productLine.name}:`, {
    mirrorControls: filteredOptions.mirrorControls.length,
    frameColors: filteredOptions.frameColors.length,
    frameThickness: filteredOptions.frameThickness.length,
    mirrorStyles: filteredOptions.mirrorStyles.length,
    mountingOptions: filteredOptions.mountingOptions.length,
    lightingOptions: filteredOptions.lightingOptions.length,
    colorTemperatures: filteredOptions.colorTemperatures.length,
    lightOutputs: filteredOptions.lightOutputs.length,
    drivers: filteredOptions.drivers.length,
    accessories: filteredOptions.accessories.length,
    sizes: filteredOptions.sizes.length
  });

  return filteredOptions;
}

// Enhanced relationship mapping functions
export async function getAccessoriesByType(type: 'nightlight' | 'anti-fog' | 'all'): Promise<Accessory[]> {
  const accessories = await getActiveAccessories();
  
  if (type === 'all') return accessories;
  
  return accessories.filter(item => {
    const name = item.name.toLowerCase();
    switch (type) {
      case 'nightlight':
        return name.includes('nightlight') || name.includes('night light');
      case 'anti-fog':
        return name.includes('anti-fog') || name.includes('antifog');
      default:
        return false;
    }
  });
}

export async function getProductLineWithDefaults(sku: string): Promise<{ line: ProductLine | undefined; defaults: any }> {
  const line = await getProductLineBySku(sku);
  if (!line) return { line: undefined, defaults: {} };
  
  // In future versions, this could fetch actual default_options relationships
  // For now, return the line with empty defaults
  return { 
    line, 
    defaults: {
      frameColor: null,
      mirrorStyle: null,
      size: null
    }
  };
}

export async function validateProductConfiguration(config: any): Promise<{ isValid: boolean; errors: string[] }> {
  const errors: string[] = [];
  
  try {
    // Validate product line exists
    if (config.productLineId) {
      const productLine = await getProductLineById(config.productLineId);
      if (!productLine) {
        errors.push(`Product line with ID ${config.productLineId} not found`);
      }
    }
    
    // Validate frame color exists
    if (config.frameColor) {
      const frameColor = await getFrameColorById(parseInt(config.frameColor));
      if (!frameColor) {
        errors.push(`Frame color with ID ${config.frameColor} not found`);
      }
    }
    
    // Validate accessories exist
    if (config.accessories && Array.isArray(config.accessories)) {
      const allAccessories = await getActiveAccessories();
      const accessoryIds = allAccessories.map(a => a.id.toString());
      
      for (const accessoryId of config.accessories) {
        if (!accessoryIds.includes(accessoryId)) {
          errors.push(`Accessory with ID ${accessoryId} not found`);
        }
      }
    }
    
  } catch (error) {
    errors.push(`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Data consistency checker
export async function checkDataConsistency(): Promise<{ isValid: boolean; report: string[] }> {
  if (import.meta.env.DEV) console.log('🔍 Running data consistency check...');
  const report: string[] = [];
  let isValid = true;
  const counts: Record<string, number> = {};
  const warnings: string[] = [];
  
  try {
    // Check all collections have data
    const collections = [
      { name: 'product_lines', fn: getActiveProductLines },
      { name: 'frame_colors', fn: getActiveFrameColors },
      { name: 'mirror_controls', fn: getActiveMirrorControls },
      { name: 'mirror_styles', fn: getActiveMirrorStyles },
      { name: 'mounting_options', fn: getActiveMountingOptions },
      { name: 'light_directions', fn: getActiveLightDirections },
      { name: 'color_temperatures', fn: getActiveColorTemperatures },
      { name: 'light_outputs', fn: getActiveLightOutputs },
      { name: 'drivers', fn: getActiveDrivers },
      { name: 'frame_thicknesses', fn: getActiveFrameThicknesses },
      { name: 'sizes', fn: getActiveSizes },
      { name: 'accessories', fn: getActiveAccessories }
    ];
    
    for (const collection of collections) {
      try {
        const data = await collection.fn();
        if (data.length === 0) {
          report.push(`⚠️ ${collection.name}: No active items found`);
          isValid = false;
        } else {
          report.push(`✓ ${collection.name}: ${data.length} items`);
          counts[collection.name] = data.length;
        }
      } catch (error) {
        report.push(`❌ ${collection.name}: Failed to load - ${error instanceof Error ? error.message : 'Unknown error'}`);
        isValid = false;
      }
    }
    
    // Check for product lines - look for one with "Deco" in the name
    try {
      const productLines = await getActiveProductLines();
      const decoLine = productLines.find(pl => 
        pl.name.toLowerCase().includes('deco')
      );
      
      if (decoLine) {
        report.push(`✓ Deco product line found: ${decoLine.name} (SKU: ${decoLine.sku_code})`);
      } else if (productLines.length > 0) {
        report.push(`✓ ${productLines.length} product lines available (using ${productLines[0].name} as default)`);
      } else {
        report.push(`❌ No product lines found`);
        isValid = false;
      }
    } catch (error) {
      report.push(`❌ Failed to check product lines: ${error instanceof Error ? error.message : 'Unknown error'}`);
      isValid = false;
    }
    
    // Check data relationships
    try {
      const frameColors = await getActiveFrameColors();
      const hasValidColors = frameColors.every(color => 
        color.hex_code.startsWith('#') && color.hex_code.length === 7
      );
      if (hasValidColors) {
        report.push(`✓ All frame colors have valid hex codes`);
      } else {
        report.push(`⚠️ Some frame colors have invalid hex codes`);
      }
    } catch (error) {
      report.push(`❌ Failed to validate frame colors: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    // Check sizes have valid dimensions
    try {
      const sizes = await getActiveSizes();
      const invalidSizes = sizes.filter(size => {
        const w = parseFloat(size.width);
        const h = parseFloat(size.height);
        return !Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0;
      });
      if (invalidSizes.length === 0) {
        report.push(`✓ All sizes have valid dimensions`);
      } else {
        const sample = invalidSizes.slice(0, 5).map(s => `${s.id}:${s.sku_code || s.name}`).join(', ');
        report.push(`⚠️ Some sizes have invalid dimensions (${invalidSizes.length}) e.g., ${sample}`);
        warnings.push('sizes');
      }
    } catch (error) {
      report.push(`❌ Failed to validate sizes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    // Configuration images deprecated; skipped from consistency checks
    
  } catch (error) {
    report.push(`❌ Data consistency check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    isValid = false;
  }
  
  const status = isValid ? '✅' : '❌';
  if (import.meta.env.DEV) {
    console.log(`${status} Data consistency check ${isValid ? 'passed' : 'failed'}`);
    report.forEach(line => console.log(line));
    const countsLine = Object.entries(counts).map(([k,v]) => `${k}=${v}`).join(', ');
    const warnLine = warnings.length ? `; warnings: ${warnings.join(',')}` : '';
    console.log(`Data OK: ${countsLine}${warnLine}`);
  }
  
  return { isValid, report };
}

// Utility functions for clearing cache
export function clearCache(): void {
  cache.clear();
}

// Helper function to clear cache for a specific key
// Removed unused clearCacheKey for noise reduction

export function clearCacheForCollection(collection: string): void {
  cache.delete(collection);
}

// Initialize function to warm up cache
export async function initializeDirectusService(): Promise<void> {
  console.log('🚀 Initializing Directus service...');
  
  try {
    // Test connection and authenticate first
    await testConnection();
    
    // Warm up cache using bulk GraphQL query for better performance
    const startTime = Date.now();
    console.log('Loading collections with bulk GraphQL query...');
    
    try {
      // Try to load all data with single GraphQL query
      await fetchBulkData();
      console.log('✓ Bulk data loaded successfully');
    } catch (error) {
      console.warn('Bulk data loading failed, using individual calls:', error);
      
      // Fallback to individual calls
      await Promise.all([
        getActiveProductLines(),
        getActiveFrameColors(),
        getActiveMirrorControls(),
        getActiveMirrorStyles(),
        getActiveMountingOptions(),
        getActiveLightDirections(),
        getActiveColorTemperatures(),
        getActiveLightOutputs(),
        getActiveDrivers(),
        getActiveFrameThicknesses(),
        getActiveSizes(),
        getActiveAccessories()
      ]);
    }
    
    const duration = Date.now() - startTime;
    console.log(`✅ Directus service initialized successfully in ${duration}ms`);
    
    // Run data consistency check
    const consistencyCheck = await checkDataConsistency();
    if (!consistencyCheck.isValid) {
      console.warn('⚠️ Data consistency issues detected - see report above');
    }
  } catch (error) {
    console.error('❌ Failed to initialize Directus service:', error);
    throw error;
  }
}

// Debug function to test default options loading
export async function debugDefaultOptions(): Promise<void> {
  console.group('🔍 DEBUG: Default Options Analysis');
  
  try {
    // First, let's try to query the junction table directly
    console.log('📋 Attempting to query product_lines_default_options junction table...');
    try {
      await authenticateIfNeeded();
      const junctionData = await getDirectusItems('product_lines_default_options', {
        filter: { product_lines_id: { _eq: 19 } }, // Deco's ID is 19
        limit: -1
      });
      console.log(`✅ Junction table query result: ${junctionData.length} items`, junctionData);
    } catch (junctionError) {
      console.error('❌ Could not query junction table:', junctionError);
    }
    
    // Test fetching product line with default options
    const decoLine = await getProductLineWithOptions('D');
    
    if (!decoLine) {
      console.error('❌ Could not fetch Deco product line');
      return;
    }
    
    console.log('✅ Fetched Deco product line');
    console.log('Product Line:', {
      id: decoLine.id,
      name: decoLine.name,
      sku_code: decoLine.sku_code,
      has_default_options: !!decoLine.default_options,
      default_options_count: decoLine.default_options?.length || 0
    });
    
    // For now, let's show all options since default_options aren't loading
    console.log('\n📌 Since default_options are not configured, showing ALL available options:');
    const allOptions = await getFilteredOptionsForProductLine(decoLine);
    console.log('📊 All available options:', {
      mirrorControls: allOptions.mirrorControls.length,
      frameColors: allOptions.frameColors.length,
      frameThickness: allOptions.frameThickness.length,
      mirrorStyles: allOptions.mirrorStyles.length,
      mountingOptions: allOptions.mountingOptions.length,
      lightingOptions: allOptions.lightingOptions.length,
      colorTemperatures: allOptions.colorTemperatures.length,
      lightOutputs: allOptions.lightOutputs.length,
      drivers: allOptions.drivers.length,
      accessories: allOptions.accessories.length,
      sizes: allOptions.sizes.length
    });
  } catch (error) {
    console.error('❌ Debug failed:', error);
  } finally {
    console.groupEnd();
  }
}

// Export for browser console testing
if (typeof window !== 'undefined') {
  (window as any).debugDefaultOptions = debugDefaultOptions;
  console.log('💡 You can run debugDefaultOptions() in the console to test default options');
  (window as any).clearDirectusCache = clearCache;
  console.log('💡 You can run clearDirectusCache() to refresh cached data');
}

// Get available light directions for a specific mirror style and product line
export async function getAvailableLightDirectionsForMirrorStyle(
  productLineId: number,
  mirrorStyleId: number
): Promise<LightDirection[]> {
  try {
    console.log(`🔍 Getting available light directions for product line ${productLineId}, mirror style ${mirrorStyleId}`);
    
    const allProducts = await getAllProducts();
    
    // Find all products that match the product line and mirror style
    const matchingProducts = allProducts.filter(product => 
      product.product_line === productLineId && 
      product.mirror_style === mirrorStyleId &&
      product.active !== false
    );
    
    console.log(`📊 Found ${matchingProducts.length} products matching criteria`);
    
    // Extract unique light direction IDs
    const lightDirectionIds = [...new Set(matchingProducts.map(p => p.light_direction))];
    
    console.log(`💡 Available light direction IDs: ${lightDirectionIds.join(', ')}`);
    
    // Get the light direction objects
    const lightDirections = await getCachedData('light_directions', async () => {
      const isDev = import.meta.env.DEV;
      const API_KEY = import.meta.env.VITE_DIRECTUS_API_KEY || 'SatmtC2cTo-k-V17usWeYpBcc6hbtXjC';
      const baseUrl = isDev ? '/api/directus/items/light_directions' : `${import.meta.env.VITE_DIRECTUS_URL || 'https://pim.dude.digital'}/items/light_directions`;
      const headers: HeadersInit = isDev ? {} : { 'Authorization': `Bearer ${API_KEY}` };
      const limit = 200;
      let offset = 0;
      let all: any[] = [];
      while (true) {
        const url = `${baseUrl}?limit=${limit}&offset=${offset}`;
        const resp = await fetch(url, { headers });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const json = await resp.json();
        const page = json.data || [];
        all = all.concat(page);
        if (page.length < limit) break;
        offset += limit;
      }
      return all;
    });
    
    // Filter to only include available light directions
    const availableLightDirections = lightDirections.filter((ld: any) => 
      lightDirectionIds.includes(ld.id)
    );
    
    console.log(`✅ Available light directions: ${availableLightDirections.map(ld => ld.name).join(', ')}`);
    
    return availableLightDirections;
  } catch (error) {
    console.error('Failed to get available light directions:', error);
    return [];
  }
}

// Generic: compute available option IDs for any fields present on products
export async function getAvailableOptionIdsForSelections(
  productLineId: number,
  selections: Record<string, string | number | undefined | null>
): Promise<Record<string, number[]>> {
  try {
    // Fetch only products for the given product line with pagination
    const API_KEY = import.meta.env.VITE_DIRECTUS_API_KEY || 'SatmtC2cTo-k-V17usWeYpBcc6hbtXjC';
    const baseUrl = import.meta.env.DEV
      ? '/api/directus/items/products'
      : `${import.meta.env.VITE_DIRECTUS_URL || 'https://pim.dude.digital'}/items/products`;
    const headers: HeadersInit = API_KEY ? { 'Authorization': `Bearer ${API_KEY}` } : {};
    const limit = 200;
    let offset = 0;
    let productsForLine: any[] = [];
    while (true) {
      const page = await directusClient.request<any[]>(
        readItems('products' as any, {
          filter: { product_line: { _eq: productLineId }, active: { _neq: false } },
          fields: ['id','name','product_line','mirror_style','light_direction','vertical_image','horizontal_image','active'],
          limit,
          offset,
          sort: ['id']
        } as any)
      );
      const cleaned = (page || []).filter((p: any) => p.active !== false);
      productsForLine = productsForLine.concat(cleaned);
      if (!page || page.length < limit) break;
      offset += limit;
    }

    // snake_case helper (mirrorStyle -> mirror_style)
    const toSnake = (k: string) => k
      .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
      .toLowerCase();

    // Normalize selections into numeric and string buckets; keep snake_case keys
    const numericSel: Record<string, number> = {};
    const stringSel: Record<string, string> = {};
    for (const [key, raw] of Object.entries(selections || {})) {
      if (raw === undefined || raw === null || raw === '') continue;
      const k = toSnake(key);
      if (typeof raw === 'number') {
        if (Number.isFinite(raw)) numericSel[k] = raw;
      } else if (typeof raw === 'string') {
        // Preserve string values for *_sku_code, *_code, and exact matches like 'L51'
        if (/_sku_code$|_code$/.test(k)) stringSel[k] = raw;
        const parsed = parseInt(raw, 10);
        if (Number.isFinite(parsed)) numericSel[k] = parsed;
      }
    }

    // Filter products by product line and current selections (only fields that actually exist on product objects)
    if (productsForLine.length === 0) return {};

    // Determine candidate numeric FK fields (dynamic)
    const sample = productsForLine[0] as any;
    const blocked = new Set(['id', 'product_line', 'active', 'name', 'vertical_image', 'horizontal_image']);
    const candidateFields = Object.keys(sample).filter(k => typeof (sample as any)[k] === 'number' && !blocked.has(k));

    // For each candidate field, compute availability by applying all other selection constraints except that field
    const result: Record<string, number[]> = {};
    for (const field of candidateFields) {
      const selectionKeys = Array.from(new Set([
        ...Object.keys(numericSel),
        ...Object.keys(stringSel),
      ]));
      const otherKeys = selectionKeys.filter(k => (k in sample || k === 'mirror_style_code' || k === 'mirror_style_sku_code') && k !== field);

      // Special-case for light_direction: only constrain by mirror_style (and product_line already applied)
      if (field === 'light_direction') {
        const msId = numericSel['mirror_style'];
        const filtered = productsForLine.filter((p: any) => {
          if (msId !== undefined) return p.mirror_style === msId;
          // If no mirror style selected, do not constrain
          return true;
        });
        const ids = new Set<number>();
        for (const p of filtered) {
          const val = (p as any)[field];
          if (typeof val === 'number') ids.add(val);
        }
        result[field] = Array.from(ids.values());
        continue;
      }

      const filtered = productsForLine.filter((p: any) => {
        return otherKeys.every(k => {
          // Special handling for mirror_style with possible numeric ID or string code
          if (k === 'mirror_style' || k === 'mirror_style_code' || k === 'mirror_style_sku_code') {
            const msId = numericSel['mirror_style'];
            const msCodeStr = stringSel['mirror_style_sku_code'] ?? stringSel['mirror_style_code'];
            // If nothing selected for mirror_style, don't constrain
            if (msId === undefined && msCodeStr === undefined) return true;
            const val = (p as any).mirror_style;
            if (typeof val === 'number') {
              if (msId !== undefined && val === msId) return true;
              return false;
            }
            if (typeof val === 'string') {
              if (msCodeStr !== undefined && val === msCodeStr) return true;
              return false;
            }
            return false;
          }

          // Generic equality for other numeric or string filters
          if (numericSel[k] !== undefined) {
            return (p as any)[k] === numericSel[k];
          }
          if (stringSel[k] !== undefined) {
            return (p as any)[k] === stringSel[k];
          }
          return true;
        });
      });
      const ids = new Set<number>();
      for (const p of filtered) {
        const val = (p as any)[field];
        if (typeof val === 'number') ids.add(val);
      }
      result[field] = Array.from(ids.values());
    }
    return result;
  } catch (err) {
    console.error('Failed to compute available option IDs:', err);
    return {};
  }
}
