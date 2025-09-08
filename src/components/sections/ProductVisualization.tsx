import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Skeleton } from '../ui/skeleton';
import { SkuDisplay } from '../ui/sku-display';
import { AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useImages } from '../../hooks/useImages';
import { useConfiguration } from '../../hooks/useConfiguration';
import { useProductLine } from '../../hooks/useProductLine';
import { useAppState } from '../../context/AppStateProvider';
import type { Product, ProductConfiguration, ProductLine } from '../../services/types/ServiceTypes';

interface ProductVisualizationProps {
  currentProduct: Product | null;
  currentConfig: ProductConfiguration | null;
  currentProductLine: ProductLine | null;
  productOptions: any;
  generateProductName: () => string;
  getProductThumbnails: (product: Product) => string[];
}

export const ProductVisualization: React.FC<ProductVisualizationProps> = ({
  currentProduct,
  currentConfig,
  currentProductLine,
  productOptions,
  generateProductName,
  getProductThumbnails
}) => {
  const thumbnailsRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const { 
    imageSet, 
    isLoadingImages, 
    isLightboxOpen, 
    lightboxIndex,
    openLightbox,
    closeLightbox 
  } = useImages(currentProduct);
  
  const { state } = useAppState();

  // Scroll thumbnail functionality
  const checkScrollButtons = () => {
    if (thumbnailsRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = thumbnailsRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  const scrollThumbs = (direction: 'left' | 'right') => {
    if (thumbnailsRef.current) {
      const scrollAmount = 200;
      const newScrollLeft = direction === 'left' 
        ? thumbnailsRef.current.scrollLeft - scrollAmount
        : thumbnailsRef.current.scrollLeft + scrollAmount;
      
      thumbnailsRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    const thumbnailEl = thumbnailsRef.current;
    if (thumbnailEl) {
      checkScrollButtons();
      thumbnailEl.addEventListener('scroll', checkScrollButtons);
      return () => thumbnailEl.removeEventListener('scroll', checkScrollButtons);
    }
  }, [currentProduct]);

  // Set lightbox index
  const setLightboxIndex = (index: number) => {
    const thumbnails = currentProduct ? getProductThumbnails(currentProduct) : [];
    const safeIndex = ((index % thumbnails.length) + thumbnails.length) % thumbnails.length;
    openLightbox(safeIndex);
  };

  const renderProductImage = () => {
    if (isLoadingImages) {
      return <Skeleton className="w-full h-full" />;
    }

    if (imageSet?.primary) {
      return (
        <>
          <img
            src={imageSet.primary}
            alt={generateProductName()}
            className="w-full h-full object-contain"
          />
          <div className="absolute inset-x-0 bottom-0 pointer-events-none bg-gradient-to-t from-white/60 to-transparent h-10"></div>
        </>
      );
    } else if (currentConfig) {
      return (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center text-gray-500">
            <AlertCircle className="w-12 h-12 mx-auto mb-2" />
            <p className="text-sm">No product image available</p>
            <p className="text-xs mt-1">SKU: {currentProduct?.name || 'Not found'}</p>
            <p className="text-xs mt-1">Orientation: {imageSet?.metadata?.orientation || 'Unknown'}</p>
          </div>
        </div>
      );
    } else {
      return <Skeleton className="w-full h-full" />;
    }
  };

  const renderThumbnails = () => {
    if (!currentProduct) return null;

    const thumbs = getProductThumbnails(currentProduct);
    if (thumbs.length === 0) return null;

    return (
      <div className="w-full">
        <div className="relative flex items-center gap-3 w-full max-w-full min-w-0">
          {/* Left button */}
          <button
            type="button"
            aria-label="Scroll thumbnails left"
            onClick={() => scrollThumbs('left')}
            disabled={!canScrollLeft}
            className={`h-9 w-9 rounded-full border bg-white shadow flex items-center justify-center ${canScrollLeft ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Scroller with fades */}
          <div className="relative flex-1 min-w-0 max-w-full">
            <div ref={thumbnailsRef} className="overflow-x-auto no-scrollbar w-full">
              <div className="flex gap-2 items-center min-w-0 px-2 py-1">
                {thumbs.map((url, i) => (
                  <button
                    key={url}
                    type="button"
                    onClick={() => setLightboxIndex(i)}
                    className="shrink-0 w-20 h-20 rounded-lg bg-white border border-gray-200 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 overflow-hidden"
                    title="View image"
                  >
                    <img src={url} alt="Thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
            {/* Edge fades */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-white to-transparent"></div>
            <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-white to-transparent"></div>
          </div>

          {/* Right button */}
          <button
            type="button"
            aria-label="Scroll thumbnails right"
            onClick={() => scrollThumbs('right')}
            disabled={!canScrollRight}
            className={`h-9 w-9 rounded-full border bg-white shadow flex items-center justify-center ${canScrollRight ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  const renderLightbox = () => {
    if (!isLightboxOpen || !currentProduct) return null;

    const imgs = getProductThumbnails(currentProduct);
    const count = imgs.length;
    const safeIndex = ((lightboxIndex % count) + count) % count;
    const currentUrl = imgs[safeIndex];
    
    const goPrev = () => setLightboxIndex(lightboxIndex - 1);
    const goNext = () => setLightboxIndex(lightboxIndex + 1);

    return createPortal(
      <div 
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-3" 
        role="dialog" 
        aria-modal="true" 
        onClick={() => closeLightbox()}
      >
        <button
          aria-label="Close gallery"
          className="absolute top-4 right-4 text-white/90 hover:text-white"
          onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
        >
          ✕
        </button>
        
        {count > 1 && (
          <button
            aria-label="Previous image"
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            className="absolute left-6 md:left-10 text-white/90 hover:text-white"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
        )}
        
        <div 
          className="relative max-w-5xl w-[92vw] md:w-[90vw] max-h-[84vh] bg-black/20 rounded-xl overflow-hidden flex items-center justify-center" 
          onClick={(e) => e.stopPropagation()}
        >
          {/* Lightbox edge fades */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-black/40 to-transparent"></div>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-black/40 to-transparent"></div>
          {currentUrl && (
            <img src={currentUrl} alt="Gallery image" className="w-full h-full object-contain" />
          )}
        </div>
        
        {count > 1 && (
          <button
            aria-label="Next image"
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            className="absolute right-6 md:right-10 text-white/90 hover:text-white"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        )}
      </div>,
      document.body
    );
  };

  return (
    <div className="space-y-4 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto lg:col-span-5">
      {/* Product Image */}
      <div className="relative w-full aspect-square bg-white rounded-xl border shadow-sm overflow-hidden">
        {renderProductImage()}
      </div>

      {/* Thumbnails */}
      {renderThumbnails()}

      {/* Lightbox */}
      {renderLightbox()}

      {/* Current Selection SKU */}
      {currentConfig && productOptions && currentProductLine && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <SkuDisplay 
            config={currentConfig as any} 
            options={productOptions as any} 
            productLine={currentProductLine} 
            product={currentProduct} 
          />
        </div>
      )}
    </div>
  );
};