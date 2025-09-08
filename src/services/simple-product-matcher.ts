/**
 * Simplified Product Matching Service
 * 
 * This service directly uses the product's existing sku_code field
 * instead of generating complex SKUs from rules and parts.
 */

import { DecoProduct, ProductLine } from './directus';

export interface SimpleProductMatchCriteria {
  productLineId?: number;
  mirrorStyleId?: number;
  lightDirectionId?: number;
  frameThicknessId?: number;
}

/**
 * Finds a product by its exact sku_code
 * This is the primary method - products already have complete SKUs
 */
export async function findProductByExactSKU(sku: string): Promise<DecoProduct | null> {
  try {
    // Import here to avoid circular dependencies
    const { getAllProducts } = await import('./directus');
    const products = await getAllProducts();
    
    const product = products.find(p => 
      p.sku_code?.toUpperCase() === sku.toUpperCase()
    );
    
    if (product) {
      console.log(`✅ Found product by exact SKU: ${product.sku_code} (${product.name})`);
    } else {
      console.log(`❌ No product found with SKU: ${sku}`);
    }
    
    return product || null;
  } catch (error) {
    console.error('Error finding product by SKU:', error);
    return null;
  }
}

/**
 * Finds products matching specific criteria within a product line
 * Used when we need to find products by attributes rather than exact SKU
 */
export async function findProductsByCriteria(
  criteria: SimpleProductMatchCriteria
): Promise<DecoProduct[]> {
  try {
    const { getAllProducts } = await import('./directus');
    const products = await getAllProducts();
    
  return products.filter(product => {
    // Filter by product line
    if (criteria.productLineId !== undefined && 
        product.product_line !== criteria.productLineId) {
      return false;
    }
    
    // Filter by mirror style
    if (criteria.mirrorStyleId !== undefined && 
        product.mirror_style !== criteria.mirrorStyleId) {
      return false;
    }
    
    // Filter by light direction
    if (criteria.lightDirectionId !== undefined && 
        product.light_direction !== criteria.lightDirectionId) {
      return false;
    }
    
    // Filter by frame thickness (only when product explicitly has this field set)
    if (criteria.frameThicknessId !== undefined) {
      const pt = (product as any).frame_thickness;
      if (pt !== undefined && pt !== null && pt !== criteria.frameThicknessId) {
        return false;
      }
    }
    
    return true;
  });
  } catch (error) {
    console.error('Error finding products by criteria:', error);
    return [];
  }
}

/**
 * Picks the best product among candidates by preferring ones with images.
 */
export function selectBestProduct(candidates: DecoProduct[]): DecoProduct | null {
  if (!Array.isArray(candidates) || candidates.length === 0) return null;

  const score = (p: DecoProduct): number => {
    let s = 0;
    // Prefer presence of orientation images
    if ((p as any).vertical_image) s += 2;
    if ((p as any).horizontal_image) s += 2;
    // Prefer having any additional images
    if (Array.isArray((p as any).additional_images) && (p as any).additional_images.length > 0) s += 1;
    return s;
  };

  const sorted = [...candidates].sort((a, b) => {
    const sa = score(a);
    const sb = score(b);
    if (sb !== sa) return sb - sa;
    // Tie-breaker: smallest id first (stable)
    const aId = typeof a.id === 'number' ? a.id : parseInt(String(a.id), 10) || 0;
    const bId = typeof b.id === 'number' ? b.id : parseInt(String(b.id), 10) || 0;
    return aId - bId;
  });

  return sorted[0] || null;
}

/**
 * Gets the display SKU for a product
 * Simply returns the product's sku_code field
 */
export function getProductDisplaySKU(product: DecoProduct): string {
  return product.sku_code || product.name || 'Unknown';
}

/**
 * Validates that a product matches the expected configuration
 * This is used to ensure the selected product actually matches user selections
 */
export function validateProductConfiguration(
  product: DecoProduct,
  criteria: SimpleProductMatchCriteria
): boolean {
  // Check product line
  if (criteria.productLineId !== undefined && 
      product.product_line !== criteria.productLineId) {
    return false;
  }
  
  // Check mirror style
  if (criteria.mirrorStyleId !== undefined && 
      product.mirror_style !== criteria.mirrorStyleId) {
    return false;
  }
  
  // Check light direction
  if (criteria.lightDirectionId !== undefined && 
      product.light_direction !== criteria.lightDirectionId) {
    return false;
  }
  
  // Check frame thickness (only enforce when product has this field set)
  if (criteria.frameThicknessId !== undefined) {
    const pt = (product as any).frame_thickness;
    if (pt !== undefined && pt !== null && pt !== criteria.frameThicknessId) {
      return false;
    }
  }
  
  return true;
}

/**
 * Creates a simple SKU display component data
 * This replaces the complex buildFullSku logic
 */
export function createSimpleSKUDisplay(
  product: DecoProduct,
  additionalOptions?: {
    size?: string;
    accessories?: string[];
  }
): {
  sku: string;
  parts: Record<string, string>;
} {
  const parts: Record<string, string> = {};
  
  // Core SKU from product
  if (product.sku_code) {
    parts.core = product.sku_code;
  }
  
  // Add size if provided
  if (additionalOptions?.size) {
    parts.size = additionalOptions.size;
  }
  
  // Add accessories if provided
  if (additionalOptions?.accessories && additionalOptions.accessories.length > 0) {
    parts.accessories = additionalOptions.accessories.join('+');
  }
  
  // Build final SKU
  const sku = Object.values(parts).filter(Boolean).join('-');
  
  return { sku, parts };
}
