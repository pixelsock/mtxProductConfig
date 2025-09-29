import React, { useEffect } from "react";
import { createPortal } from "react-dom";

// Import Zustand store hooks
import {
  useConfigurationState,
  useUIState,
  useAPIState,
  useQuoteState,
  useConfigurationActions,
  useUIActions,
  useAPIActions,
  useQuoteActions,
  useComputedValues,
} from "./store";
import type {
  ProductLine,
  ProductConfig,
  ProductOption,
  DecoProduct,
  FrameThickness,
  MirrorStyle,
  LightDirection,
  MountingOption,
  ConfigurationUIItem
} from "./store/types";
import { Button } from "./components/ui/button";
import { Card } from "./components/ui/card";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Separator } from "./components/ui/separator";
import { Badge } from "./components/ui/badge";
import { Spinner } from "./components/ui/spinner";
import { Alert, AlertDescription } from "./components/ui/alert";
import AdjustmentNotificationBar from "./components/AdjustmentNotificationBar";
import {
  Trash2,
  Plus,
  Send,
  Minus,
  Loader2,
  AlertCircle,
  ShoppingCart,
  Download,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// Import Dynamic Supabase service layer
import { fetchProductLines } from "./services/product-options";
import { findBestMatchingProduct } from "./services/product-matcher";
import { selectProductImage, constructProductAssetUrl } from "./services/image-selector";

// Import API validation and test suite
// Dev-only validators are noisy; omit in production build

// Import components
import { ProductLineSelector } from "./components/ui/product-line-selector";
import { CurrentConfiguration } from "./components/ui/current-configuration";
import { EnvironmentIndicator } from "./components/ui/environment-indicator";
import { DynamicConfigurationRenderer } from "./components/DynamicConfigurationRenderer";

const App: React.FC = () => {
  // Zustand store state
  const { currentConfig, currentProduct, currentProductLine } = useConfigurationState();
  const {
    showQuoteForm,
    showFloatingBar,
    isLightboxOpen,
    lightboxIndex,
    useCustomSize,
    canScrollLeft,
    canScrollRight
  } = useUIState();
  const {
    productOptions,
    availableProductLines,
    configurationUI,
    isLoadingApp,
    isLoadingProductLine,
    error
  } = useAPIState();
  const { quoteItems, customerInfo } = useQuoteState();

  // Zustand store actions
  const {
    updateConfiguration,
    setCurrentProduct,
    setCurrentProductLine,
    resetConfiguration,
    incrementQuantity,
    decrementQuantity,
    handleSizePresetSelect,
    handleAccessoryToggle,
  } = useConfigurationActions();

  const {
    setQuoteFormVisible,
    setFloatingBarVisible,
    openLightbox,
    closeLightbox,
    setScrollState,
    setCustomSizeEnabled,
  } = useUIActions();

  const {
    setAvailableProductLines,
    setConfigurationUI,
    setLoadingApp,
    setLoadingProductLine,
    setError,
    loadProductLineOptions,
    recomputeFiltering,
  } = useAPIActions();

  const {
    addToQuote,
    removeFromQuote,
    clearQuote,
    updateCustomerInfo,
    resetCustomerInfo,
  } = useQuoteActions();

  const { generateProductName } = useComputedValues();

  // Keep refs for DOM manipulation
  const thumbnailsRef = React.useRef<HTMLDivElement | null>(null);

  // Initialize app on component mount
  useEffect(() => {
    initializeApp();
  }, []);

  // Update product when configuration changes
  useEffect(() => {
    const updateProduct = async () => {
      if (!currentConfig || !currentProductLine || !productOptions) return;
      // Avoid computing with mismatched product line during transitions
      if (currentConfig.productLineId !== currentProductLine.id) return;
      
      // Get the selected options as proper types
      const frameThickness = productOptions.frameThickness?.find(
        (ft: ProductOption) => ft.id.toString() === currentConfig.frameThickness
      ) as FrameThickness | undefined;
      
      const mirrorStyle = productOptions.mirrorStyles?.find(
        (ms: ProductOption) => ms.id.toString() === currentConfig.mirrorStyle
      ) as MirrorStyle | undefined;
      
      const lightDirection = productOptions.lightingOptions?.find(
        (ld: ProductOption) => ld.id.toString() === currentConfig.lighting
      ) as LightDirection | undefined;
      
      if (!mirrorStyle || !lightDirection) return;
      
      try {
        // SIMPLIFIED: Just log the current configuration for debugging
        if (import.meta.env.DEV) {
          console.log('🔧 Current Configuration:', {
            productLine: currentProductLine.name,
            frameThickness: frameThickness?.name,
            mirrorStyle: mirrorStyle?.name,
            lightDirection: lightDirection?.name
          });
        }
        
        // Find product that matches current configuration
        const product = await findBestMatchingProduct({
          productLineId: currentConfig.productLineId,
          mirrorStyleId: mirrorStyle?.id,
          lightDirectionId: lightDirection.id,
          frameThicknessId: frameThickness?.id
        });
        
        if (import.meta.env.DEV) {
          console.log('🔍 Product Match Debug:', {
            searchCriteria: {
              productLineId: currentConfig.productLineId,
              mirrorStyleId: mirrorStyle?.id,
              frameThicknessId: frameThickness?.id,
              lightDirectionId: lightDirection.id
            },
            foundProduct: !!product,
            productName: product?.name,
            productSKU: product?.name, // The product name IS the SKU
            productId: product?.id,
            hasVerticalImage: !!product?.vertical_image,
            hasHorizontalImage: !!product?.horizontal_image
          });
        }
        
        // Set the product if found
        setCurrentProduct(product);
      } catch (error) {
        console.error('Failed to update product:', error);
        setCurrentProduct(null);
      }
    };
    
    updateProduct();
  }, [currentConfig, currentProductLine, productOptions]);

  // Keyboard controls for lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') openLightbox(lightboxIndex + 1);
      if (e.key === 'ArrowLeft') openLightbox(Math.max(lightboxIndex - 1, 0));
    };
    window.addEventListener('keydown', handler);
    // Disable body scroll while lightbox is open
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = prevOverflow;
    };
  }, [isLightboxOpen, lightboxIndex]);

  // Build thumbnail URLs from additional_images only (excluding primary vertical/horizontal images)
  const getProductThumbnails = (product: DecoProduct | null): string[] => {
    if (!product) return [];
    const urls: string[] = [];
    const pushUnique = (url?: string | null) => {
      if (!url) return;
      if (!urls.includes(url)) urls.push(url);
    };

    // Only include additional images (NOT the primary vertical/horizontal images)
    if (Array.isArray(product.additional_images)) {
      for (const item of product.additional_images) {
        const file = (item as any)?.directus_files_id;
        const url = constructProductAssetUrl(file);
        if (url) pushUnique(url);
      }
    }
    return urls;
  };

  // Update scroll button visibility
  const updateThumbScrollState = () => {
    const el = thumbnailsRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setScrollState(scrollLeft > 0, scrollLeft + clientWidth < scrollWidth - 1);
  };
  useEffect(() => {
    const el = thumbnailsRef.current;
    if (!el) return;
    updateThumbScrollState();
    const onScroll = () => updateThumbScrollState();
    el.addEventListener('scroll', onScroll);
    const onResize = () => updateThumbScrollState();
    window.addEventListener('resize', onResize);
    return () => {
      el.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [currentProduct]);

  const scrollThumbs = (direction: 'left' | 'right') => {
    const el = thumbnailsRef.current;
    if (!el) return;
    const amount = Math.max(200, Math.floor(el.clientWidth * 0.6));
    el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
    // Delay update slightly to account for smooth scrolling
    setTimeout(updateThumbScrollState, 250);
  };

  // Floating bar scroll detection
  useEffect(() => {
    const handleScroll = () => {
      if (currentConfig) {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const showBar = scrollTop > 400;
        setFloatingBarVisible(showBar);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentConfig]);

  const initializeApp = async () => {
    try {
      setLoadingApp(true);
      setError(null);

      console.log('Loading real product data...');

      // Load configuration UI settings
      const { getConfigurationUI } = await import('./services/supabase');
      const configUI = await getConfigurationUI();
      const normalizedConfigUI: ConfigurationUIItem[] = (configUI ?? [])
        .filter((item: any): item is ConfigurationUIItem => !!item && !!item.collection && !!item.ui_type)
        .map((item: any) => ({
          id: item.id,
          collection: item.collection as string,
          ui_type: item.ui_type as string,
          sort: item.sort ?? 0,
          date_updated: item.date_updated ?? undefined
        }));

      setConfigurationUI(normalizedConfigUI);
      console.log('🎨 Configuration UI loaded:', normalizedConfigUI.length, 'items');

      // Show schema information
      // Load all product lines
      const productLines = await fetchProductLines();
      setAvailableProductLines(productLines);

      // Get first product line as default, or look for one named "Deco" if available
      let defaultProductLine = productLines[0];

      // Try to find a product line named "Deco" (case-insensitive)
      const decoProductLine = productLines.find(pl =>
        pl.name.toLowerCase().includes('deco')
      );

      if (decoProductLine) {
        defaultProductLine = decoProductLine;
      }

      if (!defaultProductLine) {
        throw new Error('No product lines available');
      }

      // Set the default product line
      setCurrentProductLine(defaultProductLine);

      // Load filtered options for the default product line
      await loadProductLineOptions(defaultProductLine);

    } catch (err) {
      console.error("Failed to load product data:", err);
      setError(err instanceof Error ? err.message : "Failed to load product data");
    } finally {
      setLoadingApp(false);
    }
  };

  // Handle product line change
  const handleProductLineChange = async (newProductLine: ProductLine) => {
    console.log(`handleProductLineChange called with:`, newProductLine);
    console.log(`Current isLoadingProductLine state:`, isLoadingProductLine);

    if (newProductLine.sku_code === currentProductLine?.sku_code) {
      console.log(`Same product line selected, skipping`);
      return; // No change needed
    }

    console.log(`Setting loading state to true`);
    setLoadingProductLine(true);
    // Clear current product to avoid showing stale image while switching
    setCurrentProduct(null);

    try {
      console.log(`🔄 Switching to product line: ${newProductLine.name}`);

      // Update current product line first to align IDs for downstream effects
      setCurrentProductLine(newProductLine);
      // Then load filtered options for the new product line using store action
      await loadProductLineOptions(newProductLine);

      console.log(`✅ Successfully switched to ${newProductLine.name}`);
    } catch (error) {
      console.error(`❌ Error switching product line:`, error);
      setError(error instanceof Error ? error.message : "Failed to switch product line");
    } finally {
      console.log(`Setting loading state to false`);
      setLoadingProductLine(false);
    }
  };


  const handleConfigChange = async (field: any, value: any) => {
    if (!currentConfig) return;

    updateConfiguration(field, value);

    // Recompute advanced filtering after any relevant change
    if (currentProductLine) {
      const newConfig = { ...currentConfig, [field]: value };
      await recomputeFiltering(currentProductLine, newConfig);
    }
  };

  // computeAvailableOptions function moved to store/slices/apiSlice.ts as recomputeFiltering

  const handleSizePresetSelectLocal = (size: ProductOption) => {
    handleSizePresetSelect(size);
  };

  const handleAccessoryToggleLocal = (accessoryId: string) => {
    handleAccessoryToggle(accessoryId);
  };

  const incrementQuantityLocal = () => {
    incrementQuantity();
  };

  const decrementQuantityLocal = () => {
    decrementQuantity();
  };

  const addToQuoteLocal = () => {
    if (!currentConfig) return;

    // Add to quote using store action
    addToQuote({
      ...currentConfig,
      id: generateProductName(),
    });

    // Reset configuration using store action
    resetConfiguration();

    // Reset custom size using store action
    setCustomSizeEnabled(false);
  };

  const removeFromQuoteLocal = (configId: string) => {
    removeFromQuote(configId);
  };

  const downloadConfiguration = () => {
    if (!productOptions || !currentProductLine) return;

    const configData = {
      productLine: currentProductLine.name,
      configuration: currentConfig,
      quoteItems: quoteItems.map((item) => ({
        ...item,
        description: getConfigDescription(item),
      })),
      totalItems: quoteItems.length,
      totalPrice: quoteItems.reduce((sum, item) => sum + (item.quantity || 1), 0) * 100,
      date: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(configData, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = `mirror-config-${Date.now()}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  const submitQuote = () => {
    // In a real app, this would send the quote to a server
    const quoteData = {
      items: quoteItems,
      customerInfo,
      productLine: currentProductLine?.name,
    };

    // Clear quote and customer info using store actions
    clearQuote();
    resetCustomerInfo();
    setQuoteFormVisible(false);

    console.log("Quote submitted:", quoteData);
    alert("Your quote request has been submitted!");
  };

  const getConfigDescription = (config: ProductConfig) => {
    if (!productOptions) return "";

    const frameThickness = productOptions.frameThickness.find(
      (c) => c.id.toString() === config.frameThickness
    )?.name;
    const mounting = productOptions.mountingOptions.find(
      (m) => m.id.toString() === config.mounting
    )?.name;

    return `${config.productLineName} ${frameThickness || ""} ${mounting || ""} ${config.width}"×${config.height}"`;
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // generateProductName moved to store computed values

  // Loading state for initial app load

  // Loading state for initial app load
  if (isLoadingApp || !productOptions || !currentProductLine) {
    return (
      <div className="min-h-screen bg-white">
        <nav className="border-b border-gray-200 bg-white">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold tracking-tight">
                Product Configurator
              </div>
              <div className="flex items-center space-x-4">
                <Spinner size="md" />
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-6 text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Loading Product Configurator
            </h2>
            <p className="text-gray-600">
              Preparing your custom mirror configuration experience...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Main configurator view
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-2xl font-bold tracking-tight">
                Product Configurator
              </div>
              <div className="ml-6">
                <ProductLineSelector
                  productLines={availableProductLines}
                  selectedProductLine={currentProductLine}
                  onProductLineChange={handleProductLineChange}
                  isLoading={isLoadingProductLine}
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => setQuoteFormVisible(true)}
                disabled={quoteItems.length === 0}
                className={`${
                  quoteItems.length === 0
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed hover:bg-gray-300"
                    : "bg-amber-500 hover:bg-amber-600 text-white"
                }`}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Request Quote <span className="text-gray-700">({quoteItems.length})</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Error Alert */}
      {error && (
        <div className="max-w-7xl mx-auto px-6 pt-6">
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-11 gap-16 mt-[0px] mr-[0px] mb-[80px] ml-[0px]">
          {/* Product Visualization - Sticky on Desktop */}
          <div className="space-y-4 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto lg:col-span-5">
            <div className="relative w-full aspect-square bg-white rounded-xl border shadow-sm overflow-hidden">
              {(() => {
                // Get mounting option for image selection
                const mountingOption = productOptions?.mountingOptions?.find(
                  (mo: ProductOption) => mo.id.toString() === currentConfig?.mounting
                ) as MountingOption | undefined;
                
                // Select appropriate image based on mounting orientation
                const imageSelection = selectProductImage(currentProduct, mountingOption);
                const imageUrl = imageSelection.primaryImage;
                
                console.log('🖼️ Image Selection Debug:', {
                  productName: currentProduct?.name,
                  mountingOrientation: mountingOption?.name,
                  selectedOrientation: imageSelection.orientation,
                  hasVerticalImage: !!currentProduct?.vertical_image,
                  hasHorizontalImage: !!currentProduct?.horizontal_image,
                  hasVerticalImageFile: !!(currentProduct as any)?.vertical_image_file,
                  hasHorizontalImageFile: !!(currentProduct as any)?.horizontal_image_file,
                  verticalImageValue: currentProduct?.vertical_image,
                  horizontalImageValue: currentProduct?.horizontal_image,
                  verticalImageFileValue: (currentProduct as any)?.vertical_image_file,
                  horizontalImageFileValue: (currentProduct as any)?.horizontal_image_file,
                  imageUrl,
                  imageSource: imageSelection.source
                });
                
                if (imageUrl) {
                  return (
                    <>
                      <img
                        src={imageUrl}
                        alt={generateProductName()}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          console.error('🖼️ Image Load Error:', {
                            imageUrl,
                            productName: currentProduct?.name,
                            orientation: imageSelection.orientation,
                            error: e
                          });
                        }}
                        onLoad={() => {
                          console.log('🖼️ Image Loaded Successfully:', {
                            imageUrl,
                            productName: currentProduct?.name,
                            orientation: imageSelection.orientation
                          });
                        }}
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
                        <p className="text-xs mt-1">Orientation: {imageSelection.orientation}</p>
                      </div>
                    </div>
                  );
                } else {
                  return <Spinner className="w-full h-full" size="lg" />;
                }
              })()}
            </div>

            {/* Thumbnails */}
            {currentProduct && (
              <div className="w-full">
                {(() => {
                  const thumbs = getProductThumbnails(currentProduct);
                  console.log('🖼️ Thumbnail Debug:', {
                    productName: currentProduct?.name,
                    thumbnailCount: thumbs.length,
                    thumbnailUrls: thumbs
                  });
                  if (thumbs.length === 0) return null;
                  return (
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
                            {thumbs.map((url, i) => {
                              return (
                                <button
                                  key={url}
                                  type="button"
                                  onClick={() => { openLightbox(i); }}
                                  className="shrink-0 w-20 h-20 rounded-lg bg-white border border-gray-200 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 overflow-hidden"
                                  title="View image"
                                >
                                  <img
                                    src={url}
                                    alt="Thumbnail"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      console.error('🖼️ Thumbnail Load Error:', {
                                        thumbnailUrl: url,
                                        thumbnailIndex: i,
                                        productName: currentProduct?.name,
                                        error: e
                                      });
                                    }}
                                    onLoad={() => {
                                      console.log('🖼️ Thumbnail Loaded Successfully:', {
                                        thumbnailUrl: url,
                                        thumbnailIndex: i,
                                        productName: currentProduct?.name
                                      });
                                    }}
                                  />
                                </button>
                              );
                            })}
                          </div>
                        </div>
                        {/* Edge fades to complement main image card */}
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
                  );
                })()}
              </div>
            )}

            {/* Lightbox / Carousel Modal */}
            {isLightboxOpen && currentProduct && createPortal(
              (() => {
                const imgs = getProductThumbnails(currentProduct);
                const count = imgs.length;
                const safeIndex = ((lightboxIndex % count) + count) % count;
                const currentUrl = imgs[safeIndex];
                const goPrev = () => openLightbox(Math.max(lightboxIndex - 1, 0));
                const goNext = () => openLightbox(lightboxIndex + 1);
                return (
                  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-3" role="dialog" aria-modal="true" onClick={() => closeLightbox()}>
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
                    <div className="relative max-w-5xl w-[92vw] md:w-[90vw] max-h-[84vh] bg-black/20 rounded-xl overflow-hidden flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                      {/* Lightbox edge fades */}
                      <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-black/40 to-transparent"></div>
                      <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-black/40 to-transparent"></div>
                      {currentUrl && (
                        <img
                          src={currentUrl}
                          alt="Gallery image"
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            console.error('🖼️ Lightbox Image Load Error:', {
                              lightboxUrl: currentUrl,
                              lightboxIndex,
                              productName: currentProduct?.name,
                              error: e
                            });
                          }}
                          onLoad={() => {
                            console.log('🖼️ Lightbox Image Loaded Successfully:', {
                              lightboxUrl: currentUrl,
                              lightboxIndex,
                              productName: currentProduct?.name
                            });
                          }}
                        />
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
                  </div>
                );
              })(),
              document.body
            )}

            {/* Current Product Info */}
            {currentProduct && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Current Product</p>
                  <p className="font-medium text-gray-900">{generateProductName()}</p>
                  <p className="text-xs text-gray-500 mt-1">SKU: {currentProduct.name}</p>
                  {(() => {
                    const mountingOption = productOptions?.mountingOptions?.find(
                      (mo: ProductOption) => mo.id.toString() === currentConfig?.mounting
                    ) as MountingOption | undefined;
                    const imageSelection = selectProductImage(currentProduct, mountingOption);
                    
                    return (
                      <>
                        {imageSelection.primaryImage && (
                          <p className="text-xs text-green-600 mt-1">
                            ✓ {imageSelection.orientation} image loaded ({imageSelection.source})
                          </p>
                        )}
                        {!imageSelection.primaryImage && (
                          <p className="text-xs text-gray-500 mt-1">
                            No image available
                          </p>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* Quote Summary */}
            {quoteItems.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Current Quote ({quoteItems.length} items)
                </h4>
                <div className="space-y-3">
                  {quoteItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 bg-white rounded border"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {getConfigDescription(item)}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                          <span>Qty: {item.quantity}</span>
                          {item.accessories.length > 0 && (
                            <span>+{item.accessories.length} accessories</span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromQuoteLocal(item.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-4"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Action buttons */}
                <div className="flex justify-end space-x-3 mt-4 pt-4 border-t border-gray-200">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadConfiguration}
                    className="flex items-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Config</span>
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setQuoteFormVisible(true)}
                    className="bg-amber-500 hover:bg-amber-600 text-white flex items-center space-x-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Request Quote</span>
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Product Information & Configuration */}
          <div className="space-y-12 lg:col-span-6">
            {/* Product Header */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {currentProductLine.name} Mirror Collection
                </h1>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Premium illuminated mirrors with customizable lighting, controls, and finishes.
                  Configure your perfect mirror with professional-grade options and accessories.
                </p>
              </div>

              {/* No Configuration Available Message */}
              {!currentConfig && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="w-6 h-6 text-yellow-600" />
                    <div>
                      <h3 className="text-lg font-semibold text-yellow-800">
                        No Configuration Options Available
                      </h3>
                      <p className="text-yellow-700 mt-1">
                        The selected product line "{currentProductLine.name}" does not have any configuration options defined.
                        Please select a different product line or contact support to configure options for this product line.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Current Configuration Summary */}
              {currentConfig && productOptions && (
                <CurrentConfiguration
                  config={currentConfig}
                  productOptions={productOptions}
                  onQuantityChange={(quantity) => handleConfigChange("quantity", quantity)}
                  onAddToQuote={addToQuoteLocal}
                />
              )}
            </div>

            {/* ULTIMATE GOLDEN RULE: 100% DYNAMIC CONFIGURATION FROM DATABASE */}
            {currentConfig && configurationUI.length > 0 && (
              <DynamicConfigurationRenderer
                configurationUI={configurationUI}
                onConfigChange={handleConfigChange}
                onSizePresetSelect={handleSizePresetSelectLocal}
                onAccessoryToggle={handleAccessoryToggleLocal}
                useCustomSize={useCustomSize}
                setCustomSizeEnabled={setCustomSizeEnabled}
              />
            )}
          </div>
        </div>
      </div>

      {/* Floating Configuration Bar */}
      {showFloatingBar && currentConfig && (
        <div
          className={`fixed bottom-0 left-0 right-0 z-50 transform transition-all duration-500 ease-out ${
            showFloatingBar ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
          }`}
        >
          <div className="bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-2xl">
            <div className="max-w-7xl mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                {/* Left side - Configuration summary */}
                <div className="flex items-center space-x-6">
                  <button
                    onClick={scrollToTop}
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <ChevronUp className="w-4 h-4" />
                    <span className="text-sm font-medium">View Details</span>
                  </button>

                  <div className="hidden sm:flex items-center space-x-4 text-sm">
                    <span className="font-medium text-gray-900">
                      {currentConfig.width}" × {currentConfig.height}"
                    </span>
                    <span className="text-gray-600">
                      {productOptions.frameColors.find(
                        (c) => c.id.toString() === currentConfig.frameColor
                      )?.name}
                    </span>
                    <span className="text-gray-600">
                      {productOptions.lightingOptions.find(
                        (l) => l.id.toString() === currentConfig.lighting
                      )?.name}
                    </span>
                  </div>
                </div>

                {/* Right side - Quantity and Add to Quote */}
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={decrementQuantityLocal}
                      disabled={currentConfig.quantity <= 1}
                      className="h-8 w-8 p-0"
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="text-sm font-medium min-w-[3rem] text-center">
                      Qty: {currentConfig.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={incrementQuantityLocal}
                      disabled={currentConfig.quantity >= 100}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>

                  <Button
                    onClick={addToQuoteLocal}
                    className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 h-10"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add to Quote
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quote Request Modal */}
      {showQuoteForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Request Quote</h2>

              {quoteItems.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 mb-6">
                    No items in quote. Please add some configurations first.
                  </p>
                  <Button onClick={() => setQuoteFormVisible(false)} variant="outline">
                    Close
                  </Button>
                </div>
              ) : (
                <>
                  {/* Quote Summary */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quote Summary</h3>
                    <div className="space-y-3">
                      {quoteItems.map((item, index) => (
                        <div
                          key={item.id}
                          className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <span className="font-medium text-gray-900">
                              {getConfigDescription(item)}
                            </span>
                            <span className="text-gray-600 ml-2">(x{item.quantity})</span>
                          </div>
                          <Badge variant="secondary">Item {index + 1}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator className="my-8" />

                  {/* Customer Information */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="customerName" className="text-gray-700">
                          Name *
                        </Label>
                        <Input
                          id="customerName"
                          value={customerInfo.name}
                          onChange={(e) =>
                            updateCustomerInfo('name', e.target.value)
                          }
                          className="bg-gray-50 border-gray-200"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="customerEmail" className="text-gray-700">
                          Email *
                        </Label>
                        <Input
                          id="customerEmail"
                          type="email"
                          value={customerInfo.email}
                          onChange={(e) =>
                            updateCustomerInfo('email', e.target.value)
                          }
                          className="bg-gray-50 border-gray-200"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="customerCompany" className="text-gray-700">
                          Company
                        </Label>
                        <Input
                          id="customerCompany"
                          value={customerInfo.company}
                          onChange={(e) =>
                            updateCustomerInfo('company', e.target.value)
                          }
                          className="bg-gray-50 border-gray-200"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="customerPhone" className="text-gray-700">
                          Phone
                        </Label>
                        <Input
                          id="customerPhone"
                          value={customerInfo.phone}
                          onChange={(e) =>
                            updateCustomerInfo('phone', e.target.value)
                          }
                          className="bg-gray-50 border-gray-200"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4 mt-8">
                    <Button variant="outline" onClick={() => setQuoteFormVisible(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={submitQuote}
                      disabled={!customerInfo.name || !customerInfo.email}
                      className="bg-amber-500 hover:bg-amber-600 text-white"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Submit Quote Request
                    </Button>
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Environment Indicator */}
      <EnvironmentIndicator />

      {/* Adjustment Notifications */}
      <AdjustmentNotificationBar />
    </div>
  );
}

export default App;
