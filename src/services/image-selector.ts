// Image Selection System for Product Configuration
import type {
  DecoProduct,
  MountingOption,
  SupabaseFileAsset,
} from '@/store/types';
import { supabase } from './supabase';

type FileReference = string | SupabaseFileAsset | null | undefined;

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, '');
const DEFAULT_STORAGE_BUCKET = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || 'assets';
const STORAGE_BUCKET_ALIASES: Record<string, string> = {
  local: DEFAULT_STORAGE_BUCKET,
  s3: DEFAULT_STORAGE_BUCKET,
};

const assetLookupCache = new Map<string, { bucket: string; path: string }>();

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
  const fileField = orientation === 'vertical' ? 'vertical_image_file' : 'horizontal_image_file';
  const fallbackField = orientation === 'vertical' ? 'vertical_image' : 'horizontal_image';

  const fileRef: FileReference = (product as any)[fileField] ?? (product as any)[fallbackField];
  return constructSupabaseAssetUrl(fileRef);
}

function resolveBucket(storage?: string | null): string {
  if (!storage) return DEFAULT_STORAGE_BUCKET;
  return STORAGE_BUCKET_ALIASES[storage] || storage;
}

function buildPublicUrl(bucket: string, path: string): string | null {
  try {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    if (data?.publicUrl) {
      return data.publicUrl;
    }
  } catch (error) {
    console.warn('[image-selector] Failed to generate Supabase public URL:', error);
  }

  if (!SUPABASE_URL) {
    return null;
  }

  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
}

/**
 * Constructs a Supabase asset URL
 * @param reference File reference object or ID
 * @returns Public URL or null if unavailable
 */
export function constructSupabaseAssetUrl(reference: FileReference): string | null {
  if (!reference) return null;

  if (typeof reference !== 'string' && reference.filename_disk) {
    const bucket = resolveBucket(reference.storage);
    const path = reference.filename_disk;
    const url = buildPublicUrl(bucket, path);

    if (url && reference.id) {
      assetLookupCache.set(reference.id, { bucket, path });
    }

    return url;
  }

  const id = typeof reference === 'string' ? reference : reference.id;
  if (!id) return null;

  const cached = assetLookupCache.get(id);
  if (cached) {
    return buildPublicUrl(cached.bucket, cached.path);
  }

  console.warn(`[image-selector] Asset metadata missing for file id ${id}`);
  return null;
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
