// Image Selection System for Product Configuration
import type {
  DecoProduct,
  MountingOption,
  SupabaseFileAsset,
} from '@/store/types';

type FileReference = string | SupabaseFileAsset | null | undefined;

// Hybrid asset loading: Try Supabase Storage first, fall back to Directus
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://akwhptzlqgtlcpzvcnjl.supabase.co';
const storageBucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'directus-uploads';
const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://pim.dude.digital';

const supabaseAssetBase =
  process.env.NEXT_PUBLIC_ASSET_BASE_URL ||
  `${supabaseUrl.replace(/\/$/, '')}/storage/v1/object/public/${storageBucket}`;

const directusAssetBase = `${directusUrl.replace(/\/$/, '')}/assets`;

// Log the asset base URLs in development
if (process.env.NODE_ENV !== 'production') {
  console.log('🖼️ Asset Base URLs configured:', {
    supabaseAssetBase,
    directusAssetBase,
    supabaseUrl,
    storageBucket,
    directusUrl,
    envAssetBaseUrl: process.env.NEXT_PUBLIC_ASSET_BASE_URL,
    envSupabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    envStorageBucket: process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET,
    envDirectusUrl: process.env.NEXT_PUBLIC_DIRECTUS_URL
  });
}

export interface ImageSelectionResult {
  primaryImage: string | null;
  orientation: 'vertical' | 'horizontal';
  source: 'product' | 'configuration';
}

/**
 * Selects the appropriate product image based on mounting orientation
 * @param product The product to get image for
 * @param mountingOption The selected mounting option
 * @param ruleImageOverrides Optional image overrides from rules (vertical_image and horizontal_image UUIDs)
 * @returns Image selection result
 */
export function selectProductImage(
  product: DecoProduct | null,
  mountingOption?: MountingOption,
  ruleImageOverrides?: { vertical_image?: string; horizontal_image?: string }
): ImageSelectionResult {
  // Apply rule image overrides to product (temporarily)
  if (process.env.NODE_ENV !== 'production') {
    console.log('🎨 selectProductImage called with:', {
      hasProduct: !!product,
      productName: product?.name,
      ruleImageOverrides,
      hasOverrides: !!(ruleImageOverrides && (ruleImageOverrides.vertical_image || ruleImageOverrides.horizontal_image))
    });
  }

  // If no product but we have rule image overrides, create a synthetic product with those images
  if (!product && ruleImageOverrides && (ruleImageOverrides.vertical_image || ruleImageOverrides.horizontal_image)) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('🎨 No product but rule overrides exist - creating synthetic product for image display');
    }
    product = {
      id: 0,
      name: 'Rule-Based Product',
      sku_code: '',
      active: true,
      product_line: 0,
      vertical_image: ruleImageOverrides.vertical_image || null,
      horizontal_image: ruleImageOverrides.horizontal_image || null,
    } as DecoProduct;
  }

  // If still no product, return null
  if (!product) {
    return {
      primaryImage: null,
      orientation: 'vertical',
      source: 'product'
    };
  }

  let effectiveProduct = product;
  if (ruleImageOverrides && (ruleImageOverrides.vertical_image || ruleImageOverrides.horizontal_image)) {
    effectiveProduct = {
      ...product,
      vertical_image: ruleImageOverrides.vertical_image || product.vertical_image,
      horizontal_image: ruleImageOverrides.horizontal_image || product.horizontal_image,
    };
    if (process.env.NODE_ENV !== 'production') {
      console.log('🎨 Applying rule image overrides:', {
        original_vertical: product.vertical_image,
        original_horizontal: product.horizontal_image,
        override_vertical: ruleImageOverrides.vertical_image,
        override_horizontal: ruleImageOverrides.horizontal_image,
        effective_vertical: effectiveProduct.vertical_image,
        effective_horizontal: effectiveProduct.horizontal_image,
      });
    }
  }

  // Determine orientation from mounting option
  const orientation = getMountingOrientation(mountingOption);

  // Try to get product-specific images (using effective product with overrides)
  const productImage = getProductOrientationImage(effectiveProduct, orientation);
  if (productImage) {
    return {
      primaryImage: productImage,
      orientation,
      source: 'product'
    };
  }
  
  // Try opposite orientation if preferred not available
  const oppositeImage = getProductOrientationImage(effectiveProduct, getOppositeOrientation(orientation));
  if (oppositeImage) {
    return {
      primaryImage: oppositeImage,
      orientation: getOppositeOrientation(orientation),
      source: 'product'
    };
  }

  // Use application image if available
  return {
    primaryImage: effectiveProduct.applicationImage || null,
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
  const fileField = orientation === 'vertical' ? 'vertical_image_file' : 'horizontal_image_file';
  const fallbackField = orientation === 'vertical' ? 'vertical_image' : 'horizontal_image';

  // Try to get the file metadata first (joined from directus_files)
  let fileRef: FileReference = (product as any)[fileField];

  // If no file metadata, fall back to the UUID field
  if (!fileRef) {
    fileRef = (product as any)[fallbackField];
  }

  if (process.env.NODE_ENV !== 'production') {
    console.log('🖼️ Image field access:', {
      productName: product.name,
      orientation,
      fileField,
      fallbackField,
      fileFieldValue: (product as any)[fileField],
      fallbackFieldValue: (product as any)[fallbackField],
      finalFileRef: fileRef
    });
  }

  return constructProductAssetUrl(fileRef);
}

/**
 * Constructs an asset URL for Supabase Storage
 * Files are stored as {uuid}.{extension} in Supabase Storage
 * @param reference File reference object or ID
 * @returns Public URL or null if unavailable
 */
export function constructProductAssetUrl(reference: FileReference): string | null {
  if (!reference) return null;

  let id: string;
  let extension = '';

  // Extract ID and determine file extension
  if (typeof reference === 'object' && reference !== null) {
    id = reference.id;

    // Try to get extension from filename_disk if available
    const filenameDisk = (reference as any).filename_disk;
    if (filenameDisk && typeof filenameDisk === 'string') {
      const match = filenameDisk.match(/\.([^.]+)$/);
      if (match) {
        extension = `.${match[1]}`;
      }
    }

    // If no extension from filename_disk, try to infer from type field
    if (!extension && 'type' in reference) {
      const type = (reference as any).type;
      if (type === 'image/webp') extension = '.webp';
      else if (type === 'image/jpeg' || type === 'image/jpg') extension = '.jpg';
      else if (type === 'image/png') extension = '.png';
      else if (type === 'image/avif') extension = '.avif';
    }
  } else if (typeof reference === 'string') {
    id = reference;
  } else {
    id = '';
  }

  if (!id) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('🖼️ constructProductAssetUrl: No ID found in reference:', {
        reference,
        referenceType: typeof reference
      });
    }
    return null;
  }

  // Files in Supabase Storage are stored as {uuid}.{extension}
  const filename = `${id}${extension}`;
  const url = `${supabaseAssetBase}/${filename}`;

  if (process.env.NODE_ENV !== 'production') {
    console.log('🖼️ constructProductAssetUrl: Built URL:', {
      id,
      extension,
      filename,
      url,
      baseUrl: supabaseAssetBase,
      isObject: typeof reference === 'object',
      hasType: typeof reference === 'object' && reference !== null && 'type' in reference
    });
  }

  return url;
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
