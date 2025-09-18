// Image Selection System for Product Configuration
import { 
  DecoProduct,
  MountingOption
} from './directus';

export interface ImageSelectionResult {
  primaryImage: string | null;
  orientation: 'vertical' | 'horizontal';
  source: 'product' | 'configuration';
}

/**
 * Selects the appropriate product image based on mounting orientation
 * @param product The product to get image for
 * @param mountingOption The selected mounting option
 * @returns Image selection result
 */
export function selectProductImage(
  product: DecoProduct | null,
  mountingOption?: MountingOption
): ImageSelectionResult {
  if (!product) {
    return {
      primaryImage: null,
      orientation: 'vertical',
      source: 'product'
    };
  }

  // Determine orientation from mounting option
  const orientation = getMountingOrientation(mountingOption);
  
  // Try to get product-specific images
  const productImage = getProductOrientationImage(product, orientation);
  if (productImage) {
    return {
      primaryImage: productImage,
      orientation,
      source: 'product'
    };
  }
  
  // Try opposite orientation if preferred not available
  const oppositeImage = getProductOrientationImage(product, getOppositeOrientation(orientation));
  if (oppositeImage) {
    return {
      primaryImage: oppositeImage,
      orientation: getOppositeOrientation(orientation),
      source: 'product'
    };
  }
  
  // Use application image if available
  return {
    primaryImage: product.applicationImage || null,
    orientation,
    source: 'product'
  };
}

/**
 * Gets the mounting orientation from a mounting option
 * @param mountingOption The mounting option
 * @returns 'vertical' or 'horizontal'
 */
function getMountingOrientation(mountingOption?: MountingOption): 'vertical' | 'horizontal' {
  if (!mountingOption) return 'vertical';
  
  const name = mountingOption.name?.toLowerCase() || '';
  
  if (name.includes('landscape') || name.includes('horizontal')) {
    return 'horizontal';
  }
  
  return 'vertical';
}

/**
 * Gets the opposite orientation
 * @param orientation Current orientation
 * @returns Opposite orientation
 */
function getOppositeOrientation(orientation: 'vertical' | 'horizontal'): 'vertical' | 'horizontal' {
  return orientation === 'vertical' ? 'horizontal' : 'vertical';
}

/**
 * Gets product image for specific orientation
 * @param product The product
 * @param orientation The desired orientation
 * @returns Image URL or null
 */
function getProductOrientationImage(
  product: DecoProduct,
  orientation: 'vertical' | 'horizontal'
): string | null {
  // Check for vertical_image and horizontal_image fields
  const orientationField = orientation === 'vertical' ? 'vertical_image' : 'horizontal_image';
  const imageId = (product as any)[orientationField];
  
  if (imageId) {
    return constructDirectusAssetUrl(imageId);
  }
  
  return null;
}

/**
 * Constructs a Directus asset URL
 * @param assetId The asset ID
 * @returns Full URL to the asset
 */
export function constructDirectusAssetUrl(assetId: string): string {
  const DIRECTUS_URL = import.meta.env.VITE_DIRECTUS_URL || 'https://pim.dude.digital';
  return `${DIRECTUS_URL}/assets/${assetId}`;
}



/**
 * Generates a composite product image name
 * @param config The product configuration
 * @returns Generated image name
 */
export function generateProductImageName(config: any): string {
  const parts: string[] = [];
  
  // Add product line name
  if (config.productLine?.name) {
    parts.push(config.productLine.name);
  }
  
  // Add frame thickness
  if (config.frameThickness?.name) {
    parts.push(config.frameThickness.name);
  }
  
  // Add mirror style
  if (config.mirrorStyle?.name) {
    parts.push(config.mirrorStyle.name);
  }
  
  // Add light direction
  if (config.lightDirection?.name) {
    parts.push(config.lightDirection.name);
  }
  
  return parts.join(' - ') || 'Product Image';
}

/**
 * Validates if an image URL is accessible
 * @param url The image URL to validate
 * @returns true if image is accessible
 */
export async function validateImageUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}