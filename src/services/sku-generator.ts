// SKU Generation System for Product Configuration
import {
  ProductLine,
  MirrorStyle,
  LightDirection,
  FrameThickness
} from './supabase';
import { getSKUOverride } from './rules-engine';

export interface SKUGenerationConfig {
  productLine: ProductLine;
  frameThickness?: FrameThickness;
  mirrorStyle?: MirrorStyle;
  lightDirection?: LightDirection;
  // Additional fields for rule evaluation
  product_line?: number;
  frame_thickness?: number;
  mirror_style?: number;
  light_direction?: number;
}

/**
 * Generates a product SKU based on configuration and rules
 * @param config The configuration to generate SKU from
 * @returns Generated SKU string
 */
export async function generateProductSKU(config: SKUGenerationConfig): Promise<string> {
  // SIMPLIFIED: We don't generate SKUs, we find products that match the configuration
  // This function is now just used for debugging/logging purposes
  console.log('🔧 Configuration Context:', {
    productLine: `${config.productLine?.name} (ID: ${config.product_line})`,
    frameThickness: `${config.frameThickness?.name} (ID: ${config.frame_thickness})`,
    mirrorStyle: `${config.mirrorStyle?.name} (ID: ${config.mirror_style})`,
    lightDirection: `${config.lightDirection?.name} (ID: ${config.light_direction})`
  });
  
  // Return empty string since we'll find products by matching criteria, not generating SKUs
  return '';
}

/**
 * Appends mirror style code to base SKU
 * @param baseSKU The base SKU to append to
 * @param mirrorStyle The mirror style to encode
 * @returns SKU with style code
 */
function appendStyleCode(baseSKU: string, mirrorStyle?: MirrorStyle): string {
  if (!mirrorStyle || !mirrorStyle.sku_code) return baseSKU;
  
  console.log(`  📐 Mirror style: "${mirrorStyle.name}" with SKU code: "${mirrorStyle.sku_code}"`);
  
  // The SKU codes are already in the correct format (e.g., "01", "04", etc.)
  // Just append them directly
  return baseSKU + mirrorStyle.sku_code;
}

/**
 * Appends light direction suffix to SKU
 * @param sku The SKU to append to
 * @param lightDirection The light direction to encode
 * @returns SKU with light direction suffix
 */
function appendLightDirectionSuffix(sku: string, lightDirection?: LightDirection): string {
  if (!lightDirection) return sku;

  const n = (lightDirection.name || '').trim().toLowerCase();

  // Exact/startsWith checks to avoid 'direct' matching 'indirect'
  if (n === 'both direct and indirect' || n.startsWith('both')) return sku + 'B';
  if (n === 'direct') return sku + 'D';
  if (n === 'indirect') return sku + 'I';

  // Fallback: use first letter of sku_code
  if (lightDirection.sku_code && lightDirection.sku_code.length > 0) {
    return sku + lightDirection.sku_code[0].toUpperCase();
  }
  return sku;
}

/**
 * Parses a product SKU to extract components
 * @param sku The SKU to parse
 * @returns Parsed SKU components
 */
export function parseSKU(sku: string): {
  base: string;
  style?: string;
  lightDirection?: string;
} {
  if (!sku) return { base: '' };
  
  // Common pattern: Base + 2 digits + letter (e.g., T01D, W03B)
  const match = sku.match(/^([A-Z]+)(\d{2})?([A-Z])?$/);
  
  if (match) {
    return {
      base: match[1],
      style: match[2],
      lightDirection: match[3]
    };
  }
  
  // Fallback: treat entire SKU as base
  return { base: sku };
}

/**
 * Validates if a generated SKU matches expected patterns
 * @param sku The SKU to validate
 * @returns true if SKU is valid
 */
export function validateSKU(sku: string): boolean {
  if (!sku || sku.length < 2) return false;
  
  // Valid patterns:
  // - Letter(s) only: T, W, F
  // - Letter(s) + 2 digits: T01, W03
  // - Letter(s) + 2 digits + letter: T01D, W03B
  const validPattern = /^[A-Z]+(\d{2})?([A-Z])?$/;
  
  return validPattern.test(sku);
}

/**
 * Generates variations of a SKU for product matching
 * @param baseSKU The base SKU to generate variations for
 * @param includeDirections Whether to include light direction variations
 * @returns Array of SKU variations
 */
export function generateSKUVariations(baseSKU: string, includeDirections: boolean = true): string[] {
  const variations: string[] = [baseSKU];
  
  if (includeDirections) {
    // Add common light direction suffixes
    const suffixes = ['D', 'I', 'B'];
    for (const suffix of suffixes) {
      if (!baseSKU.endsWith(suffix)) {
        variations.push(baseSKU + suffix);
      }
    }
  }
  
  // Also try without the last character if it looks like a direction suffix
  if (baseSKU.length > 2 && /[DIB]$/.test(baseSKU)) {
    variations.push(baseSKU.slice(0, -1));
  }
  
  return [...new Set(variations)]; // Remove duplicates
}
