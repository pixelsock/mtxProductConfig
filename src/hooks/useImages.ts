import { useCallback, useState, useEffect } from 'react';
import { useAppState } from '../context/AppStateProvider';
import { useConfiguration } from './useConfiguration';
import { useRules } from './useRules';
import type { 
  Product, 
  ProductConfiguration, 
  ServiceResult,
  RuleOverrides
} from '../services/types/ServiceTypes';
import type { 
  ImageSet, 
  ImageDisplayOptions, 
  ImageLoadResult 
} from '../services/data/ImageService';

export interface UseImagesReturn {
  // State
  imageSet: ImageSet | null;
  isLoadingImages: boolean;
  imageError: string | null;
  
  // Actions
  selectProductImages: (
    product: Product | null,
    configuration?: ProductConfiguration,
    ruleOverrides?: RuleOverrides,
    options?: ImageDisplayOptions
  ) => ServiceResult<ImageSet>;
  preloadImage: (url: string) => Promise<ServiceResult<ImageLoadResult>>;
  preloadImageSet: (imageSet: ImageSet) => Promise<ServiceResult<Record<string, ImageLoadResult>>>;
  getOptimizedImageUrl: (url: string, options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpg' | 'png';
  }) => string;
  clearImageCache: () => void;
  
  // Lightbox Management
  isLightboxOpen: boolean;
  lightboxIndex: number;
  openLightbox: (index?: number) => void;
  closeLightbox: () => void;
  
  // Computed values
  hasPrimaryImage: boolean;
  thumbnailCount: number;
  totalImages: number;
  imageLoadStatus: (url: string) => 'loading' | 'loaded' | 'error' | 'not-started';
}

export const useImages = (product?: Product | null): UseImagesReturn => {
  const { state, openLightbox, closeLightbox } = useAppState();
  const { configuration } = useConfiguration();
  const { computeRuleOverrides } = useRules();
  
  const [imageSet, setImageSet] = useState<ImageSet | null>(null);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  const selectProductImages = useCallback(
    (
      targetProduct: Product | null,
      config?: ProductConfiguration,
      ruleOverrides?: RuleOverrides,
      options?: ImageDisplayOptions
    ) => {
      const result = state.services.images.selectProductImages(
        targetProduct,
        config || configuration,
        ruleOverrides,
        options
      );

      if (result.success) {
        setImageSet(result.data || null);
        setImageError(null);
      } else {
        setImageError(result.error || 'Failed to select images');
        setImageSet(null);
      }

      return result;
    },
    [state.services.images, configuration]
  );

  const preloadImage = useCallback(
    async (url: string) => {
      return state.services.images.preloadImage(url);
    },
    [state.services.images]
  );

  const preloadImageSet = useCallback(
    async (targetImageSet: ImageSet) => {
      return state.services.images.preloadImageSet(targetImageSet);
    },
    [state.services.images]
  );

  const getOptimizedImageUrl = useCallback(
    (url: string, options?: {
      width?: number;
      height?: number;
      quality?: number;
      format?: 'webp' | 'jpg' | 'png';
    }) => {
      return state.services.images.getOptimizedImageUrl(url, options);
    },
    [state.services.images]
  );

  const clearImageCache = useCallback(() => {
    state.services.images.clearImageCache();
  }, [state.services.images]);

  const imageLoadStatus = useCallback(
    (url: string) => {
      return state.services.images.getImageLoadStatus(url);
    },
    [state.services.images]
  );

  // Auto-update images when product or configuration changes
  useEffect(() => {
    if (product && configuration) {
      setIsLoadingImages(true);
      
      // Get rule overrides for dynamic image selection
      computeRuleOverrides(configuration).then((overridesResult) => {
        const overrides = overridesResult.success ? overridesResult.data : undefined;
        
        const result = selectProductImages(product, configuration, overrides, {
          includeAdditional: true,
          fallbackEnabled: true
        });
        
        setIsLoadingImages(false);
        
        if (result.success && result.data) {
          // Preload the image set
          preloadImageSet(result.data);
        }
      }).catch(() => {
        setIsLoadingImages(false);
      });
    }
  }, [product, configuration, selectProductImages, preloadImageSet, computeRuleOverrides]);

  return {
    // State
    imageSet,
    isLoadingImages,
    imageError,
    
    // Actions
    selectProductImages,
    preloadImage,
    preloadImageSet,
    getOptimizedImageUrl,
    clearImageCache,
    
    // Lightbox Management
    isLightboxOpen: state.isLightboxOpen,
    lightboxIndex: state.lightboxIndex,
    openLightbox,
    closeLightbox,
    
    // Computed values
    hasPrimaryImage: imageSet?.primary ? true : false,
    thumbnailCount: imageSet?.thumbnails?.length || 0,
    totalImages: imageSet?.metadata?.totalImages || 0,
    imageLoadStatus,
  };
};