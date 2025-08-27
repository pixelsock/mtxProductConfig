// Product Matching Logic for Configuration
import { 
  DecoProduct,
  getAllProducts,
  ProductLine,
  LightDirection
} from './directus';
import { generateSKUVariations } from './sku-generator';

export interface ProductMatchCriteria {
  sku?: string;
  productLineId?: number;
  mirrorStyleId?: number;
  mirrorStyleCode?: number; // style SKU code (e.g., 5 for "05")
  lightDirectionId?: number;
  name?: string;
}

/**
 * Finds products matching the given SKU
 * @param sku The SKU to search for
 * @returns Array of matching products
 */
export async function findProductsBySKU(sku: string): Promise<DecoProduct[]> {
  try {
    const allProducts = await getAllProducts();
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
    const allProducts = await getAllProducts();

    // 1) Exact SKU match (preferable) within product line if provided
    if (criteria.sku) {
      const skuUpper = criteria.sku.toUpperCase();
      const exactAll = allProducts.find(p => (p.name || '').toUpperCase() === skuUpper &&
        (criteria.productLineId === undefined || p.product_line === criteria.productLineId));
      if (exactAll) return exactAll;
    }

    // 2) Filter by product line and light direction
    let candidates = allProducts.filter(p =>
      (criteria.productLineId === undefined || p.product_line === criteria.productLineId) &&
      (criteria.lightDirectionId === undefined || p.light_direction === criteria.lightDirectionId)
    );

    // 3) Apply mirror style if the dataset actually uses it; otherwise, skip
    const hasMirrorStyleData = candidates.some(p => typeof p.mirror_style === 'number');
    if (hasMirrorStyleData && (criteria.mirrorStyleId !== undefined || criteria.mirrorStyleCode !== undefined)) {
      candidates = candidates.filter(p => {
        const msId = criteria.mirrorStyleId;
        const msCode = criteria.mirrorStyleCode;
        return (msId !== undefined && p.mirror_style === msId) || (msCode !== undefined && p.mirror_style === msCode);
      });
    }

    // 4) If a SKU is provided, try to match within candidates
    if (criteria.sku) {
      const skuUpper = criteria.sku.toUpperCase();
      const exact = candidates.find(p => (p.name || '').toUpperCase() === skuUpper);
      if (exact) return exact;
    }

    // 5) Return first candidate if any
    return candidates[0] || null;
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
    const allProducts = await getAllProducts();
    
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
  // Check SKU match
  if (criteria.sku && product.name) {
    const variations = generateSKUVariations(criteria.sku);
    const productName = product.name.toUpperCase();
    const skuMatches = variations.some(v => 
      productName === v || productName.includes(v)
    );
    if (!skuMatches) return false;
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
  
  return score;
}
