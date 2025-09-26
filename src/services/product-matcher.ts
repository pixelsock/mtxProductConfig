// Product Matching Logic for Configuration
import { 
  getProducts,
} from './supabase';
import { Database } from '../../supabase';

// Define types based on the new Supabase schema
type DecoProduct = Database['public']['Tables']['products']['Row'];
type ProductLine = Database['public']['Tables']['product_lines']['Row'];
type LightDirection = Database['public']['Tables']['light_directions']['Row'];

export interface ProductMatchCriteria {
  sku?: string;
  productLineId?: number;
  mirrorStyleId?: number;
  mirrorStyleCode?: number; // style SKU code (e.g., 5 for "05")
  lightDirectionId?: number;
  frameThicknessId?: number; // Add frame thickness support
  name?: string;
}

/**
 * Finds products matching the given SKU
 * @param sku The SKU to search for
 * @returns Array of matching products
 */
export async function findProductsBySKU(sku: string): Promise<DecoProduct[]> {
  try {
    const allProducts = await getProducts();
    const skuUpper = (sku || '').toUpperCase();
    return allProducts.filter(p => (p.name || '').toUpperCase() === skuUpper);
  } catch (error) {
    console.error('Failed to find products by SKU:', error);
    return [];
  }
}

/**
 * Finds the best matching product based on multiple criteria
 * @param criteria The criteria to match
 * @returns The best matching product or null
 */
export async function findBestMatchingProduct(criteria: ProductMatchCriteria): Promise<DecoProduct | null> {
  try {
    const allProducts = await getProducts();

    if (import.meta.env.DEV) {
      console.log('🔍 Product Matcher: Starting search with criteria:', criteria);
      console.log('🔍 Product Matcher: Total products available:', allProducts.length);
    }

    // SIMPLIFIED: Find products that match the current selections
    let candidates = allProducts.filter(p => {
      // Must match product line
      if (criteria.productLineId !== undefined && p.product_line !== criteria.productLineId) {
        return false;
      }
      
      // Must match light direction if specified
      if (criteria.lightDirectionId !== undefined && p.light_direction !== criteria.lightDirectionId) {
        return false;
      }
      
      // Must match mirror style if specified  
      if (criteria.mirrorStyleId !== undefined && p.mirror_style !== criteria.mirrorStyleId) {
        return false;
      }
      
      // Must match frame thickness if specified
      if (criteria.frameThicknessId !== undefined) {
        // Handle both direct ID and JSON object format
        const productFrameThickness = typeof p.frame_thickness === 'object' && p.frame_thickness !== null
          ? (p.frame_thickness as any).key
          : p.frame_thickness;
        if (productFrameThickness !== criteria.frameThicknessId) {
          return false;
        }
      }
      
      return true;
    });
    
    if (import.meta.env.DEV) {
      console.log(`🔍 Product Matcher: Found ${candidates.length} matching products`);
    }

    // 5) Return first candidate if any
    const result = candidates[0] || null;
    if (import.meta.env.DEV) {
      if (result) {
        console.log('✅ Product Matcher: Selected product:', {
          name: result.name,
          id: result.id,
          frame_thickness: result.frame_thickness,
          mirror_style: result.mirror_style,
          light_direction: result.light_direction
        });
      } else {
        console.log('❌ Product Matcher: No suitable product found');
      }
    }
    return result;
  } catch (error) {
    console.error('Failed to find best matching product:', error);
    return null;
  }
}

/**
 * Finds products for a specific product line and light direction
 * @param productLine The product line
 * @param lightDirection The light direction
 * @returns Array of matching products
 */
export async function findProductsByLineAndDirection(
  productLine: ProductLine,
  lightDirection: LightDirection
): Promise<DecoProduct[]> {
  try {
    const allProducts = await getProducts();
    
    return allProducts.filter(product => 
      product.product_line === productLine.id &&
      product.light_direction === lightDirection.id
    );
  } catch (error) {
    console.error('Failed to find products by line and direction:', error);
    return [];
  }
}


/**
 * Validates if a product matches the expected criteria
 * @param product The product to validate
 * @param criteria The criteria to check against
 * @returns true if product matches all criteria
 */
export function validateProductMatch(
  product: DecoProduct,
  criteria: ProductMatchCriteria
): boolean {
  // Basic SKU match
  if (criteria.sku && product.name) {
    const expected = criteria.sku.trim().toUpperCase();
    const actual = product.name.trim().toUpperCase();
    if (expected && actual && !actual.includes(expected)) {
      return false;
    }
  }
  
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
  
  // Check frame thickness
  if (criteria.frameThicknessId !== undefined && 
      product.frame_thickness !== criteria.frameThicknessId) {
    return false;
  }
  
  return true;
}

/**
 * Gets product match score for ranking multiple candidates
 * @param product The product to score
 * @param criteria The criteria to score against
 * @returns Score (higher is better match)
 */
export function getProductMatchScore(
  product: DecoProduct,
  criteria: ProductMatchCriteria
): number {
  let score = 0;
  
  // Exact SKU match gets highest score
  if (criteria.sku && product.name) {
    const productName = product.name.toUpperCase();
    if (productName === criteria.sku.toUpperCase()) {
      score += 100;
    } else if (productName.includes(criteria.sku.toUpperCase())) {
      score += 50;
    }
  }
  
  // Matching attributes add to score
  if (criteria.productLineId !== undefined && 
      product.product_line === criteria.productLineId) {
    score += 25;
  }
  
  if (criteria.mirrorStyleId !== undefined && 
      product.mirror_style === criteria.mirrorStyleId) {
    score += 25;
  }
  
  if (criteria.lightDirectionId !== undefined && 
      product.light_direction === criteria.lightDirectionId) {
    score += 25;
  }
  
  if (criteria.frameThicknessId !== undefined && 
      product.frame_thickness === criteria.frameThicknessId) {
    score += 25;
  }
  
  return score;
}
