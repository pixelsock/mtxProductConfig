import { ProductLine } from '../services/directus';

// Minimal shape we need from App's types
export interface SimpleOption { id: number; name: string; sku_code: string; width?: number; height?: number }
export interface SimpleOptions {
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
}

export interface BuildSkuResult {
  sku: string;
  parts: Record<string, string>;
}

export interface SkuOverrides {
  productLineSkuOverride?: string;
  accessoryFallback?: string; // used when no accessories selected
  // Core overrides
  mirrorStyleSkuOverride?: string;
  lightDirectionSkuOverride?: string;
  // Segment overrides
  sizeSkuOverride?: string;
  lightOutputSkuOverride?: string;
  colorTemperatureSkuOverride?: string;
  driverSkuOverride?: string;
  mountingSkuOverride?: string; // mounting_option
  frameColorSkuOverride?: string;
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

// Builds the full, human-readable SKU string per template
// {product_line}{mirror_style}{light_direction}-{size}-{light_output}-{color_temperature}-{driver}-{mounting_option}-{hanging_teqnique}-{frame_color}-{accessories}
// Unknown/unavailable sets are omitted.
export function buildFullSku(
  config: CurrentConfigLike,
  options: SimpleOptions,
  productLine: ProductLine | null,
  overrides?: SkuOverrides
): BuildSkuResult {
  const parts: Record<string, string> = {};

  // product line + core
  const pl = overrides?.productLineSkuOverride || productLine?.sku_code || '';
  const mirrorStyle = overrides?.mirrorStyleSkuOverride || findById(options.mirrorStyles, config.mirrorStyle)?.sku_code || '';
  const lightDir = overrides?.lightDirectionSkuOverride || findById(options.lightingOptions, config.lighting)?.sku_code || '';
  const core = [pl, mirrorStyle, lightDir].join('');
  if (core) parts.core = core;

  // size from preset if available
  const sizeCode = overrides?.sizeSkuOverride || getSizeSkuCode(options.sizes, config.width, config.height);
  if (sizeCode) parts.size = sizeCode;

  const lightOutput = overrides?.lightOutputSkuOverride || findById(options.lightOutputs, config.lightOutput)?.sku_code;
  if (lightOutput) parts.light_output = lightOutput;

  const colorTemp = overrides?.colorTemperatureSkuOverride || findById(options.colorTemperatures, config.colorTemperature)?.sku_code;
  if (colorTemp) parts.color_temperature = colorTemp;

  const driver = overrides?.driverSkuOverride || findById(options.drivers, config.driver)?.sku_code;
  if (driver) parts.driver = driver;

  const mounting = overrides?.mountingSkuOverride || findById(options.mountingOptions, config.mounting)?.sku_code;
  if (mounting) parts.mounting_option = mounting;

  // No dedicated hanging technique collection in current schema; omit unless later added
  // const hanging = ...

  const frameColor = overrides?.frameColorSkuOverride || findById(options.frameColors, config.frameColor)?.sku_code;
  if (frameColor) parts.frame_color = frameColor;

  // accessories: join multiple by '+' inside the segment, but omit segment entirely if none
  if (Array.isArray(config.accessories) && config.accessories.length > 0) {
    const codes: string[] = [];
    for (const idStr of config.accessories) {
      const id = parseInt(idStr, 10);
      const found = options.accessoryOptions.find(a => a.id === id)?.sku_code;
      if (found) codes.push(found);
    }
    if (codes.length > 0) parts.accessories = codes.join('+');
  } else if (overrides?.accessoryFallback) {
    parts.accessories = overrides.accessoryFallback;
  }

  // Assemble with '-' between optional segments, but only include present ones
  const ordered: Array<keyof typeof parts> = [
    'core',
    'size',
    'light_output',
    'color_temperature',
    'driver',
    'mounting_option',
    // 'hanging_teqnique', // reserved
    'frame_color',
    'accessories',
  ];

  const sku = ordered
    .map(k => parts[k])
    .filter(Boolean)
    .join('-');

  return { sku, parts };
}
