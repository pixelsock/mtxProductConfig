/**
 * Ordered SKU Builder
 * 
 * This builder uses the sku_code_order collection to determine
 * the order and inclusion of different option sets in the final SKU.
 */

import { ProductLine } from '../services/directus';
import { SkuCodeOrder, getSkuCodeOrder, shouldIncludeInSku, getEnabledOptionSets, OPTION_SET_CONFIG_MAP, OPTION_SET_OPTIONS_MAP } from '../services/sku-code-order';

// Minimal shape we need from App's types
export interface SimpleOption { 
  id: number; 
  name: string; 
  sku_code: string; 
  width?: number; 
  height?: number 
}

export interface SimpleOptions {
  productLines: SimpleOption[];
  mirrorControls: SimpleOption[];
  frameColors: SimpleOption[];
  frameThickness: SimpleOption[];
  mirrorStyles: SimpleOption[];
  mountingOptions: SimpleOption[];
  lightingOptions: SimpleOption[];
  colorTemperatures: SimpleOption[];
  lightOutputs: SimpleOption[];
  drivers: SimpleOption[];
  accessoryOptions: SimpleOption[];
  sizes: SimpleOption[];
  hangingTechniques: SimpleOption[];
}

export interface CurrentConfigLike {
  productLineId: number;
  mirrorControls: string;
  frameColor: string;
  frameThickness: string;
  mirrorStyle: string;
  width: string;
  height: string;
  mounting: string;
  lighting: string;
  colorTemperature: string;
  lightOutput: string;
  driver: string;
  accessories: string[];
  hangingTechnique?: string;
}

export interface BuildSkuResult {
  sku: string;
  parts: Record<string, string>;
  enabledParts: string[];
}

export interface SkuOverrides {
  productSkuOverride?: string; // preferred core (products.sku_code)
  productLineSkuOverride?: string;
  includeAccessories?: boolean;
  accessoryFallback?: string;
  accessoriesOverride?: string;
  // Core overrides
  mirrorStyleSkuOverride?: string;
  lightDirectionSkuOverride?: string;
  // Segment overrides
  sizeSkuOverride?: string;
  lightOutputSkuOverride?: string;
  colorTemperatureSkuOverride?: string;
  driverSkuOverride?: string;
  mountingSkuOverride?: string;
  frameColorSkuOverride?: string;
  hangingTechniqueSkuOverride?: string;
}

function findById(options: SimpleOption[], idStr?: string): SimpleOption | undefined {
  if (!idStr) return undefined;
  const id = parseInt(idStr, 10);
  if (!Number.isFinite(id)) return undefined;
  return options.find(o => o.id === id);
}

function getSizeSkuCode(opts: SimpleOption[], width: string, height: string): string | undefined {
  if (!width || !height) return undefined;
  const w = Number(width), h = Number(height);
  if (!Number.isFinite(w) || !Number.isFinite(h)) return undefined;
  const preset = opts.find(s => (s.width ? Number(s.width) : NaN) === w && (s.height ? Number(s.height) : NaN) === h);
  return preset?.sku_code || undefined;
}

function formatDimension(value: string): string | undefined {
  if (!value) return undefined;
  const n = Number(value);
  if (!Number.isFinite(n)) return undefined;
  // Keep up to 2 decimals, strip trailing zeros
  const fixed = n.toFixed(2).replace(/\.00$/, '').replace(/(\.\d*[1-9])0$/, '$1');
  return fixed;
}

function formatIntegerDimension(value: string): string | undefined {
  if (!value) return undefined;
  const n = Number(value);
  if (!Number.isFinite(n)) return undefined;
  // Use integer inches for height in custom code (per "33.533" example)
  return String(Math.round(n));
}

/**
 * Builds the full SKU string using the sku_code_order collection
 * This ensures the correct order and inclusion of option sets
 */
export async function buildOrderedSku(
  config: CurrentConfigLike,
  options: SimpleOptions,
  productLine: ProductLine | null,
  overrides?: SkuOverrides
): Promise<BuildSkuResult> {
  try {
    // Get the SKU code order configuration
    const skuCodeOrder = await getSkuCodeOrder();
    const enabledOptionSets = getEnabledOptionSets(skuCodeOrder);
    
    console.log('🔧 Building ordered SKU:', {
      enabledOptionSets,
      config: {
        productLineId: config.productLineId,
        mirrorStyle: config.mirrorStyle,
        lighting: config.lighting,
        frameThickness: config.frameThickness
      }
    });

    const parts: Record<string, string> = {};
    const enabledParts: string[] = [];

    // Process each enabled option set in order
    for (const optionSetName of enabledOptionSets) {
      const partValue = await buildSkuPart(
        optionSetName,
        config,
        options,
        productLine,
        overrides,
        skuCodeOrder
      );

      if (partValue) {
        parts[optionSetName] = partValue;
        enabledParts.push(optionSetName);
        console.log(`  ✓ ${optionSetName}: ${partValue}`);
      } else {
        console.log(`  - ${optionSetName}: (not selected)`);
      }
    }

    // Build final SKU by joining enabled parts
    const sku = enabledParts
      .map(partName => parts[partName])
      .filter(Boolean)
      .join('-');

    console.log(`✅ Final ordered SKU: ${sku}`);

    return { sku, parts, enabledParts };
  } catch (error) {
    console.error('Failed to build ordered SKU:', error);
    return { sku: '', parts: {}, enabledParts: [] };
  }
}

/**
 * Builds a specific SKU part based on the option set
 */
async function buildSkuPart(
  optionSetName: string,
  config: CurrentConfigLike,
  options: SimpleOptions,
  productLine: ProductLine | null,
  overrides: SkuOverrides | undefined,
  skuCodeOrder: SkuCodeOrder
): Promise<string | null> {
  // Check if this option set should be included
  if (!shouldIncludeInSku(skuCodeOrder, optionSetName)) {
    return null;
  }

  switch (optionSetName) {
    case 'product_lines': {
      // Use product SKU override if available, otherwise use product line SKU
      const coreOverride = overrides?.productSkuOverride || overrides?.productLineSkuOverride;
      if (coreOverride) {
        return coreOverride;
      }
      
      // Build core from product line + mirror style + light direction
      const pl = productLine?.sku_code || '';
      const mirrorStyle = overrides?.mirrorStyleSkuOverride || findById(options.mirrorStyles, config.mirrorStyle)?.sku_code || '';
      const lightDir = overrides?.lightDirectionSkuOverride || findById(options.lightingOptions, config.lighting)?.sku_code || '';
      
      const core = [pl, mirrorStyle, lightDir].join('');
      return core || null;
    }

    case 'sizes': {
      const sizeCode = overrides?.sizeSkuOverride || getSizeSkuCode(options.sizes, config.width, config.height);
      if (sizeCode) {
        return sizeCode;
      } else if (config.width && config.height) {
        const w = formatDimension(config.width);
        const h = formatIntegerDimension(config.height);
        if (w && h) return `${w}${h}`; // no 'x' separator (e.g., 33.533)
      }
      return null;
    }

    case 'light_outputs': {
      const lightOutput = overrides?.lightOutputSkuOverride || findById(options.lightOutputs, config.lightOutput)?.sku_code;
      return lightOutput || null;
    }

    case 'color_temperatures': {
      const colorTemp = overrides?.colorTemperatureSkuOverride || findById(options.colorTemperatures, config.colorTemperature)?.sku_code;
      return colorTemp || null;
    }

    case 'drivers': {
      const driver = overrides?.driverSkuOverride || findById(options.drivers, config.driver)?.sku_code;
      return driver || null;
    }

    case 'mounting_options': {
      const mounting = overrides?.mountingSkuOverride || findById(options.mountingOptions, config.mounting)?.sku_code;
      return mounting || null;
    }

    case 'hanging_techniques': {
      const hanging = overrides?.hangingTechniqueSkuOverride || findById(options.hangingTechniques, config.hangingTechnique)?.sku_code;
      return hanging || null;
    }

    case 'accessories': {
      if (overrides?.includeAccessories === false) {
        return null;
      }
      
      if (overrides?.accessoriesOverride) {
        return overrides.accessoriesOverride;
      } else if (Array.isArray(config.accessories) && config.accessories.length > 0) {
        const codes: string[] = [];
        for (const idStr of config.accessories) {
          const id = parseInt(idStr, 10);
          const found = options.accessoryOptions.find(a => a.id === id)?.sku_code;
          if (found) codes.push(found);
        }
        if (codes.length > 0) return codes.join('+');
      } else if (overrides?.accessoryFallback) {
        return overrides.accessoryFallback;
      }
      return null;
    }

    case 'frame_colors': {
      const frameColor = overrides?.frameColorSkuOverride || findById(options.frameColors, config.frameColor)?.sku_code;
      return frameColor || null;
    }

    default:
      console.warn(`Unknown option set: ${optionSetName}`);
      return null;
  }
}

/**
 * Gets the current configuration display for enabled option sets
 */
export async function getCurrentConfigurationDisplay(
  config: CurrentConfigLike,
  options: SimpleOptions,
  productLine: ProductLine | null
): Promise<Record<string, { name: string; sku_code: string } | null>> {
  try {
    const skuCodeOrder = await getSkuCodeOrder();
    const enabledOptionSets = getEnabledOptionSets(skuCodeOrder);
    
    const display: Record<string, { name: string; sku_code: string } | null> = {};

    for (const optionSetName of enabledOptionSets) {
      const option = getSelectedOption(optionSetName, config, options, productLine);
      display[optionSetName] = option;
    }

    return display;
  } catch (error) {
    console.error('Failed to get current configuration display:', error);
    return {};
  }
}

/**
 * Gets the selected option for a specific option set
 */
function getSelectedOption(
  optionSetName: string,
  config: CurrentConfigLike,
  options: SimpleOptions,
  productLine: ProductLine | null
): { name: string; sku_code: string } | null {
  switch (optionSetName) {
    case 'product_lines':
      return productLine ? { name: productLine.name, sku_code: productLine.sku_code || '' } : null;
    
    case 'sizes':
      if (config.width && config.height) {
        const size = options.sizes.find(s => 
          s.width === Number(config.width) && s.height === Number(config.height)
        );
        if (size) return { name: size.name, sku_code: size.sku_code };
        return { name: `${config.width}" x ${config.height}"`, sku_code: `${config.width}${config.height}` };
      }
      return null;

    case 'light_outputs':
      return findById(options.lightOutputs, config.lightOutput) || null;

    case 'color_temperatures':
      return findById(options.colorTemperatures, config.colorTemperature) || null;

    case 'drivers':
      return findById(options.drivers, config.driver) || null;

    case 'mounting_options':
      return findById(options.mountingOptions, config.mounting) || null;

    case 'hanging_techniques':
      return findById(options.hangingTechniques, config.hangingTechnique) || null;

    case 'accessories':
      if (Array.isArray(config.accessories) && config.accessories.length > 0) {
        const selectedAccessories = config.accessories
          .map(id => options.accessoryOptions.find(a => a.id === parseInt(id, 10)))
          .filter(Boolean) as SimpleOption[];
        
        if (selectedAccessories.length > 0) {
          return {
            name: selectedAccessories.map(a => a.name).join(', '),
            sku_code: selectedAccessories.map(a => a.sku_code).join('+')
          };
        }
      }
      return null;

    case 'frame_colors':
      return findById(options.frameColors, config.frameColor) || null;

    default:
      return null;
  }
}
