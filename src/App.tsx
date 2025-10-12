'use client';

import React, { useEffect, useState } from "react";
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
  useConfiguratorStore,
} from "./store";
import { useSkuUrlSync } from "./hooks/useSkuUrlSync";
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
import { Skeleton } from "./components/ui/skeleton";
import { Alert, AlertDescription } from "./components/ui/alert";
import { Textarea } from "./components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./components/ui/dialog";
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
  Search,
  FileText,
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
import { SkuSearchInput } from "./components/ui/sku-search-input";
import { Sheet, SheetContent, SheetTitle } from "./components/ui/sheet";
import { generateQuotePdf } from "./utils/quote-pdf";
import { submitQuoteRequest } from "../app/actions/quote-actions";
import { getLogoColorUrl } from "../app/actions/settings-actions";

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
    error,
    ruleImageOverrides
  } = useAPIState();
  const { quoteItems, customerInfo } = useQuoteState();

  // Local component state
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [generatedSku, setGeneratedSku] = useState<string | null>(null);
  const [isSkuSearchOpen, setIsSkuSearchOpen] = useState(false);
  const [hasAppliedInitialSku, setHasAppliedInitialSku] = useState(false);
  const [isGeneratingQuotePdf, setIsGeneratingQuotePdf] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [quotePdfUrl, setQuotePdfUrl] = useState<string | null>(null);
  const [showMobileProductPanel, setShowMobileProductPanel] = useState(false);
  const [mobileImageIndex, setMobileImageIndex] = useState(0);

  // Get SKU generator from store
  const getGeneratedSKU = useConfiguratorStore((state) => state.getGeneratedSKU);
  const searchBySku = useConfiguratorStore((state) => state.searchBySku);
  const applySkuResult = useConfiguratorStore((state) => state.applySkuResult);

  // URL synchronization using nuqs
  const { skuParam, updateSkuInUrl, getInitialSku, hasInitialSku } = useSkuUrlSync();

  // Zustand store actions
  const {
    updateConfiguration,
    setCurrentProduct,
    setCurrentProductLine,
    resetConfiguration,
    incrementQuantity,
    decrementQuantity,
    handleSizePresetSelect,
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
    updateQuoteItemQuantity,
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

  // Apply SKU from URL on initial load (after app is initialized)
  // CRITICAL: Only run this ONCE when app first loads with a SKU parameter
  useEffect(() => {
    const applySku = async () => {
      const initialSku = getInitialSku();

      // Only apply if:
      // 1. We have an initial SKU from URL
      // 2. Product line and options are loaded
      // 3. We haven't already applied it (MOST IMPORTANT - prevents re-applying on every change)
      if (!initialSku || !currentProductLine || !productOptions || hasAppliedInitialSku) {
        return;
      }

      console.log('🔗 Applying SKU from URL (ONE TIME ONLY):', initialSku);
      setHasAppliedInitialSku(true); // Mark as applied immediately to prevent re-runs

      try {
        const results = await searchBySku(initialSku);
        if (results.length > 0) {
          // Apply the best matching result
          const bestResult = results.find(r => r.confidence === 'exact') || results[0];
          await applySkuResult(bestResult);
          console.log('✅ Applied SKU from URL successfully');
        } else {
          console.warn('⚠️ No results found for URL SKU:', initialSku);
        }
      } catch (error) {
        console.error('❌ Failed to apply SKU from URL:', error);
      }
    };

    applySku();
  }, [currentProductLine, productOptions, hasAppliedInitialSku]); // Include hasAppliedInitialSku in deps

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
        if (process.env.NODE_ENV !== 'production') {
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

        if (process.env.NODE_ENV !== 'production') {
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

  // Reset image loading state when product or mounting changes
  useEffect(() => {
    setIsImageLoading(true);
  }, [currentProduct?.id, currentConfig?.mounting]);

  // Generate SKU when configuration or product changes
  useEffect(() => {
    let mounted = true;
    const generateSku = async () => {
      try {
        const sku = await getGeneratedSKU();
        if (mounted) {
          setGeneratedSku(sku);
          // Update URL with the new SKU
          // nuqs handles throttling automatically via throttleMs option
          if (sku) {
            updateSkuInUrl(sku);
          }
        }
      } catch (error) {
        console.error('Error generating SKU:', error);
        if (mounted) setGeneratedSku(null);
      }
    };
    generateSku();
    return () => { mounted = false; };
  }, [currentConfig, currentProduct, getGeneratedSKU, updateSkuInUrl]);

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
        try {
          const file = (item as any)?.directus_files_id;

          // Skip if no file reference
          if (!file) {
            if (process.env.NODE_ENV !== 'production') {
              console.log('🖼️ Skipping additional_image item - no file reference:', { item });
            }
            continue;
          }

          // Validate file has an ID
          const fileId = typeof file === 'string' ? file : file?.id;
          if (!fileId) {
            if (process.env.NODE_ENV !== 'production') {
              console.warn('🖼️ Skipping additional_image - file reference has no ID:', {
                file,
                fileType: typeof file,
                hasId: 'id' in (file as object)
              });
            }
            continue;
          }

          // Debug log in development
          if (process.env.NODE_ENV !== 'production') {
            console.log('🖼️ Processing additional_image item:', {
              fileId,
              fileType: typeof file,
              isString: typeof file === 'string'
            });
          }

          const url = constructProductAssetUrl(file);
          if (url) {
            pushUnique(url);
          } else {
            if (process.env.NODE_ENV !== 'production') {
              console.warn('🖼️ Failed to construct URL from valid file reference:', { file, fileId });
            }
          }
        } catch (error) {
          console.error('🖼️ Error processing additional_image item:', { item, error });
        }
      }
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log('🖼️ getProductThumbnails result:', {
        productName: product.name,
        additionalImagesCount: product.additional_images?.length || 0,
        thumbnailsFound: urls.length,
        thumbnailUrls: urls
      });
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

  const incrementQuantityLocal = () => {
    incrementQuantity();
  };

  const decrementQuantityLocal = () => {
    decrementQuantity();
  };

  const addToQuoteLocal = async () => {
    if (!currentConfig || !currentProduct || !productOptions) {
      console.error('[App.addToQuoteLocal] Missing required data');
      return;
    }

    // Generate SKU directly using the service function
    let sku: string;
    try {
      const { generateSku } = await import('./services/sku-generator');
      sku = await generateSku(currentProduct, currentConfig, productOptions);

      // If SKU generation returns empty string, use fallback
      if (!sku) {
        sku = generateProductName();
      }
    } catch (error) {
      console.error('[App.addToQuoteLocal] SKU generation error:', error);
      sku = generateProductName();
    }

    // Add to quote using store action with the generated SKU as ID
    addToQuote({
      ...currentConfig,
      id: sku,
    });

    // Reset configuration using store action
    resetConfiguration();

    // Reset custom size using store action
    setCustomSizeEnabled(false);
  };

  const removeFromQuoteLocal = (configId: string) => {
    removeFromQuote(configId);
  };

  const downloadConfiguration = async () => {
    if (!productOptions || quoteItems.length === 0) {
      return;
    }

    setIsGeneratingQuotePdf(true);
    await new Promise((resolve) => setTimeout(resolve, 0));

    const getOptionName = (options: ProductOption[], id: string | null | undefined) => {
      if (!options || !id) return null;
      return options.find((option) => option.id.toString() === id)?.name ?? null;
    };

    const buildDetails = (config: ProductConfig) => {
      const details: string[] = [];
      const lighting = getOptionName(productOptions.lightingOptions, config.lighting);
      if (lighting) {
        details.push(`Lighting: ${lighting}`);
      }
      const controls = getOptionName(productOptions.mirrorControls, config.mirrorControls);
      if (controls) {
        details.push(`Controls: ${controls}`);
      }
      const mounting = getOptionName(productOptions.mountingOptions, config.mounting);
      if (mounting) {
        details.push(`Mounting: ${mounting}`);
      }
      const accessories = getOptionName(productOptions.accessoryOptions, config.accessories);
      if (accessories) {
        details.push(`Accessories: ${accessories}`);
      }
      return details;
    };

    const quoteNumber = (() => {
      const now = new Date();
      const datePart = now.toISOString().slice(0, 10).replace(/-/g, "");
      const countPart = String(quoteItems.length).padStart(2, "0");
      return `Q-${datePart}-${countPart}`;
    })();

    let pdfResult: Awaited<ReturnType<typeof generateQuotePdf>> | null = null;

    try {
      // Fetch logo from global settings
      let logoUrl: string | undefined = undefined;
      try {
        const logoResult = await getLogoColorUrl();
        logoUrl = logoResult.success && logoResult.logoUrl ? logoResult.logoUrl : undefined;
      } catch (logoError) {
        console.warn("Failed to fetch logo, continuing without it:", logoError);
      }

      pdfResult = await generateQuotePdf({
        items: quoteItems.map((config) => ({
          sku: config.id,
          description: getConfigDescription(config),
          quantity: config.quantity ?? 1,
          details: buildDetails(config),
        })),
        quoteNumber,
        projectName: currentProductLine?.name ?? "Mirror Configurator",
        logoUrl,
      });

      // Open PDF in a new tab
      window.open(pdfResult.objectUrl, "_blank");
    } catch (error) {
      console.error("Failed to generate quote PDF:", error);
    } finally {
      if (pdfResult) {
        setTimeout(() => {
          try {
            pdfResult?.cleanup();
          } catch (cleanupError) {
            console.warn("Failed to release PDF object URL:", cleanupError);
          }
        }, 60_000);
      }
      setIsGeneratingQuotePdf(false);
    }
  };

  const submitQuote = async () => {
    try {
      // Set submitting state
      const submitButton = document.querySelector('[data-submitting]');
      if (submitButton) {
        submitButton.setAttribute('disabled', 'true');
      }

      // Fetch logo from global settings
      let logoUrl: string | undefined = undefined;
      try {
        const logoResult = await getLogoColorUrl();
        logoUrl = logoResult.success && logoResult.logoUrl ? logoResult.logoUrl : undefined;
      } catch (logoError) {
        console.warn("Failed to fetch logo, continuing without it:", logoError);
      }

      // Generate PDF for the quote
      const quoteNumber = `QT-${Date.now()}`;
      const pdfResult = await generateQuotePdf({
        items: quoteItems.map((item) => ({
          sku: item.id || "",
          description: getConfigDescription(item),
          quantity: item.quantity || 1,
        })),
        quoteNumber,
        projectName: customerInfo.projectName || "Quote Request",
        specifierInfo: customerInfo.specifier || "N/A",
        preparedFor: customerInfo.name,
        generatedAt: new Date(),
        logoUrl,
      });

      // Convert blob URL to base64 for server upload
      const blobResponse = await fetch(pdfResult.objectUrl);
      const blob = await blobResponse.blob();
      const reader = new FileReader();

      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      const base64Pdf = await base64Promise;
      const filename = `quote-${quoteNumber}.pdf`;

      // Submit quote request to Supabase (uploads PDF and saves to DB)
      const result = await submitQuoteRequest({
        quoteItems,
        customerInfo,
        pdfBlob: base64Pdf,
        filename,
      });

      if (result.success) {
        // Store the Supabase storage URL (not blob URL) for download
        setQuotePdfUrl(result.pdfUrl || pdfResult.objectUrl);
        setShowSuccessDialog(true);

        // Clear quote and customer info using store actions
        clearQuote();
        resetCustomerInfo();
        setQuoteFormVisible(false);

        // Cleanup blob URL immediately since we have the storage URL
        pdfResult.cleanup();
      } else {
        console.error("Error submitting quote:", result.error);
        alert(`Error submitting quote request: ${result.error}`);

        // Cleanup PDF blob URL on error
        pdfResult.cleanup();
      }
    } catch (error) {
      console.error("Unexpected error submitting quote:", error);
      alert("An unexpected error occurred while submitting your quote request.");
    } finally {
      // Re-enable submit button
      const submitButton = document.querySelector('[data-submitting]');
      if (submitButton) {
        submitButton.removeAttribute('disabled');
      }
    }
  };

  const getConfigDescription = (config: ProductConfig) => {
    if (!productOptions) return "";

    const mirrorStyle = productOptions.mirrorStyles.find(
      (ms) => ms.id.toString() === config.mirrorStyle
    )?.name;

    return `${config.productLineName} ${mirrorStyle || ""} ${config.width}"×${config.height}"`;
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDownloadQuote = () => {
    if (quotePdfUrl) {
      window.open(quotePdfUrl, "_blank");
    }
  };

  const handleCloseSuccessDialog = () => {
    setShowSuccessDialog(false);
    // Cleanup PDF blob URL after dialog is closed
    if (quotePdfUrl) {
      URL.revokeObjectURL(quotePdfUrl);
      setQuotePdfUrl(null);
    }
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
      <Sheet open={isSkuSearchOpen} onOpenChange={setIsSkuSearchOpen}>
        <SheetContent
          side="right"
          hideDefaultClose
          className="flex w-full flex-col border-l border-slate-200 bg-white p-0 sm:max-w-xl md:max-w-2xl lg:max-w-3xl"
        >
          <SheetTitle className="sr-only">SKU Search Assistant</SheetTitle>
          <SkuSearchInput
            onApplied={() => setIsSkuSearchOpen(false)}
            onClose={() => setIsSkuSearchOpen(false)}
            isOpen={isSkuSearchOpen}
          />
        </SheetContent>
      </Sheet>

      <nav className="border-b border-gray-200 bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          {/* Mobile Layout */}
          <div className="lg:hidden">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <ProductLineSelector
                  productLines={availableProductLines}
                  selectedProductLine={currentProductLine}
                  onProductLineChange={handleProductLineChange}
                  isLoading={isLoadingProductLine}
                />
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {quoteItems.length > 0 && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={downloadConfiguration}
                    disabled={isGeneratingQuotePdf}
                    className="border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                    title="Download Config"
                  >
                    {isGeneratingQuotePdf ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                  </Button>
                )}
                <Button
                  onClick={() => setQuoteFormVisible(true)}
                  disabled={quoteItems.length === 0}
                  size="icon"
                  className={`${
                    quoteItems.length === 0
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed hover:bg-gray-300"
                      : "bg-amber-500 hover:bg-amber-600 text-white"
                  }`}
                  title={`Request Quote (${quoteItems.length})`}
                >
                  <FileText className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsSkuSearchOpen(true)}
                  className="border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                  title="Search by SKU"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:flex items-center justify-between">
            <ProductLineSelector
              productLines={availableProductLines}
              selectedProductLine={currentProductLine}
              onProductLineChange={handleProductLineChange}
              isLoading={isLoadingProductLine}
            />
            <div className="flex items-center space-x-4">
              {/* Show Download Config button when items are in quote */}
              {quoteItems.length > 0 && (
                <Button
                  variant="outline"
                  onClick={downloadConfiguration}
                  disabled={isGeneratingQuotePdf}
                  className="flex items-center gap-2 border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                >
                  {isGeneratingQuotePdf ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      Download Config
                    </>
                  )}
                </Button>
              )}
              
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
              
              {/* Search icon button on far right */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsSkuSearchOpen(true)}
                className="border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                title="Search by SKU"
              >
                <Search className="h-4 w-4" />
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-11 gap-6 lg:gap-16 mt-[0px] mr-[0px] mb-[80px] ml-[0px]">
          {/* Product Visualization - Hidden below 1024px, Sticky on Desktop */}
          <div className="hidden lg:block space-y-3 sm:space-y-4 lg:sticky lg:top-24 lg:self-start lg:col-span-4">
            <div className="relative w-full aspect-square bg-white rounded-lg sm:rounded-xl shadow-sm overflow-hidden">
              {(() => {
                // Get mounting option for image selection
                const mountingOption = productOptions?.mountingOptions?.find(
                  (mo: ProductOption) => mo.id.toString() === currentConfig?.mounting
                ) as MountingOption | undefined;
                
                // Select appropriate image based on mounting orientation
                const imageSelection = selectProductImage(currentProduct, mountingOption, ruleImageOverrides);
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
                    <div className="relative w-full h-full">
                      {isImageLoading && (
                        <div className="absolute inset-0 w-full h-full flex flex-col justify-center space-y-4">
                          <Skeleton className="flex-1 w-full" />
                          <div className="space-y-2 px-4 pb-4">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                          </div>
                        </div>
                      )}
                      <img
                        src={imageUrl}
                        alt={generateProductName()}
                        className={`w-full h-full object-contain transition-opacity duration-300 ${
                          isImageLoading ? 'opacity-0' : 'opacity-100'
                        }`}
                        onError={(e) => {
                          setIsImageLoading(false);
                          const target = e.target as HTMLImageElement;
                          console.error('🖼️ Image Load Error:', {
                            imageUrl,
                            actualSrc: target.src,
                            productName: currentProduct?.name,
                            orientation: imageSelection.orientation,
                            imageSelection,
                            currentProduct,
                            error: e.type
                          });
                          // Try to fetch the URL to see what the actual error is
                          if (imageUrl) {
                            fetch(imageUrl, { method: 'HEAD' })
                              .then(res => console.log('🖼️ Main image fetch test:', { imageUrl, status: res.status, ok: res.ok, headers: Object.fromEntries(res.headers.entries()) }))
                              .catch(err => console.error('🖼️ Main image fetch failed:', { imageUrl, error: err.message }));
                          }
                        }}
                        onLoad={() => {
                          setIsImageLoading(false);
                          console.log('🖼️ Image Loaded Successfully:', {
                            imageUrl,
                            productName: currentProduct?.name,
                            orientation: imageSelection.orientation
                          });
                        }}
                      />
                      {!isImageLoading && (
                        <div className="absolute inset-x-0 bottom-0 pointer-events-none bg-gradient-to-t from-white/60 to-transparent h-10"></div>
                      )}
                    </div>
                  );
                } else {
                  // Show skeleton card while waiting for image URL or initial load
                  return (
                    <div className="w-full h-full flex flex-col justify-center space-y-4">
                      <Skeleton className="flex-1 w-full" />
                      <div className="space-y-2 px-4 pb-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    </div>
                  );
                }
              })()}
            </div>

            {/* Thumbnails - Hidden on mobile, visible on tablet+ */}
            {currentProduct && (
              <div className="w-full hidden sm:block">
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
                                  className="shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-white border border-gray-200 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 overflow-hidden"
                                  title="View image"
                                >
                                  <img
                                    src={url}
                                    alt="Thumbnail"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      console.error('🖼️ Thumbnail Load Error:', {
                                        thumbnailUrl: url,
                                        thumbnailIndex: i,
                                        productName: currentProduct?.name,
                                        actualSrc: target.src,
                                        naturalWidth: target.naturalWidth,
                                        naturalHeight: target.naturalHeight,
                                        error: e.type
                                      });
                                      // Try to fetch the URL to see what the actual error is
                                      fetch(url, { method: 'HEAD' })
                                        .then(res => console.log('🖼️ Fetch test result:', { url, status: res.status, ok: res.ok }))
                                        .catch(err => console.error('🖼️ Fetch test failed:', { url, error: err.message }));
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
                      className="p-4 bg-white rounded border"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          {/* SKU - First line */}
                          <div className="font-mono text-sm font-semibold text-gray-900">
                            SKU: {item.id}
                          </div>
                          {/* Description - Second line */}
                          <p className="text-sm text-gray-600">
                            {getConfigDescription(item)}
                          </p>
                          {/* Quantity - Editable */}
                          <div className="flex items-center space-x-3 pt-1">
                            <Label htmlFor={`qty-${item.id}`} className="text-xs font-medium text-gray-600">
                              Quantity:
                            </Label>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                  const newQuantity = Math.max((item.quantity || 1) - 1, 1);
                                  updateQuoteItemQuantity(item.id, newQuantity);
                                }}
                                disabled={(item.quantity || 1) <= 1}
                                className="h-7 w-7"
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <Input
                                id={`qty-${item.id}`}
                                type="number"
                                value={item.quantity || 1}
                                onChange={(e) => {
                                  const newQuantity = Math.max(1, Math.min(999, parseInt(e.target.value) || 1));
                                  updateQuoteItemQuantity(item.id, newQuantity);
                                }}
                                min="1"
                                max="999"
                                className="w-16 text-center text-sm h-7"
                              />
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                  const newQuantity = Math.min((item.quantity || 1) + 1, 999);
                                  updateQuoteItemQuantity(item.id, newQuantity);
                                }}
                                disabled={(item.quantity || 1) >= 999}
                                className="h-7 w-7"
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromQuoteLocal(item.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action buttons */}
                <div className="flex justify-end space-x-3 mt-4 pt-4 border-t border-gray-200">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadConfiguration}
                    disabled={isGeneratingQuotePdf || quoteItems.length === 0}
                    className="flex items-center space-x-2"
                  >
                    {isGeneratingQuotePdf ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Generating PDF...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>Download Config</span>
                      </>
                    )}
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
          <div className="space-y-12 lg:col-span-7">
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

              {/* Current Configuration Summary - Hidden below 1024px */}
              {currentConfig && productOptions && (
                <div className="hidden lg:block">
                  <CurrentConfiguration
                    config={currentConfig}
                    productOptions={productOptions}
                    onQuantityChange={(quantity) => handleConfigChange("quantity", quantity)}
                    onAddToQuote={addToQuoteLocal}
                  />
                </div>
              )}
            </div>

            {/* ULTIMATE GOLDEN RULE: 100% DYNAMIC CONFIGURATION FROM DATABASE */}
            {currentConfig && configurationUI.length > 0 && (
              <DynamicConfigurationRenderer
                configurationUI={configurationUI}
                onConfigChange={handleConfigChange}
                onSizePresetSelect={handleSizePresetSelectLocal}
                useCustomSize={useCustomSize}
                setCustomSizeEnabled={setCustomSizeEnabled}
              />
            )}
          </div>
        </div>
      </div>

      {/* Floating Configuration Bar with Product Preview */}
      {showFloatingBar && currentConfig && (
        <div
          className={`fixed bottom-0 left-0 right-0 z-50 transform transition-all duration-500 ease-out ${
            showFloatingBar ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
          }`}
        >
          <div className="bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-2xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
              <div className="flex items-center justify-between gap-4">
                {/* Left side - Product preview and summary */}
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  {/* Product thumbnail preview - Mobile only */}
                  {(() => {
                    const mountingOption = productOptions?.mountingOptions?.find(
                      (mo: ProductOption) => mo.id.toString() === currentConfig?.mounting
                    ) as MountingOption | undefined;
                    const imageSelection = selectProductImage(currentProduct, mountingOption, ruleImageOverrides);
                    const imageUrl = imageSelection.primaryImage;
                    
                    return imageUrl ? (
                      <button
                        onClick={() => setShowMobileProductPanel(true)}
                        className="lg:hidden shrink-0 w-12 h-12 rounded-lg bg-white border border-gray-200 overflow-hidden hover:border-gray-400 transition-colors"
                        title="View product details"
                      >
                        <img
                          src={imageUrl}
                          alt="Product preview"
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ) : null;
                  })()}
                  
                  <button
                    onClick={scrollToTop}
                    className="hidden lg:flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors shrink-0"
                  >
                    <ChevronUp className="w-4 h-4" />
                    <span className="text-sm font-medium">View Details</span>
                  </button>

                  <div className="flex items-center gap-2 sm:gap-4 text-sm min-w-0">
                    {generatedSku && (
                      <span className="font-mono text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded truncate">
                        {generatedSku}
                      </span>
                    )}
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

      {/* Mobile Product Panel - Slides up from bottom */}
      {showMobileProductPanel && (
        <div
          className="fixed inset-0 bg-black/50 z-50 lg:hidden"
          onClick={() => setShowMobileProductPanel(false)}
        >
          <div 
            className="fixed inset-x-0 bottom-0 bg-white rounded-t-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle bar */}
            <div className="sticky top-0 bg-white pt-3 pb-2 px-4 border-b border-gray-200 z-10">
              <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-3"></div>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Product Details</h3>
                <button
                  onClick={() => setShowMobileProductPanel(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <ChevronUp className="w-5 h-5 rotate-180" />
                </button>
              </div>
            </div>

            {/* Swipeable Image Gallery */}
            <div className="p-4">
              {(() => {
                const mountingOption = productOptions?.mountingOptions?.find(
                  (mo: ProductOption) => mo.id.toString() === currentConfig?.mounting
                ) as MountingOption | undefined;
                const imageSelection = selectProductImage(currentProduct, mountingOption, ruleImageOverrides);
                const primaryImage = imageSelection.primaryImage;
                const additionalImages = getProductThumbnails(currentProduct);
                
                // Combine primary image with additional images
                const allImages = primaryImage ? [primaryImage, ...additionalImages] : additionalImages;
                
                if (allImages.length === 0) return null;

                const currentImage = allImages[mobileImageIndex] || allImages[0];
                
                return (
                  <div className="space-y-3">
                    {/* Main Image with swipe */}
                    <div className="relative w-full aspect-square bg-white rounded-xl shadow-sm overflow-hidden">
                      <img
                        src={currentImage}
                        alt={`Product image ${mobileImageIndex + 1}`}
                        className="w-full h-full object-contain"
                      />
                      
                      {/* Navigation arrows */}
                      {allImages.length > 1 && (
                        <>
                          <button
                            onClick={() => setMobileImageIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1))}
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:bg-white transition-colors"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => setMobileImageIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0))}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:bg-white transition-colors"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </>
                      )}
                      
                      {/* Image counter */}
                      {allImages.length > 1 && (
                        <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                          {mobileImageIndex + 1} / {allImages.length}
                        </div>
                      )}
                    </div>

                    {/* Thumbnail dots */}
                    {allImages.length > 1 && (
                      <div className="flex justify-center gap-2">
                        {allImages.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setMobileImageIndex(index)}
                            className={`w-2 h-2 rounded-full transition-all ${
                              index === mobileImageIndex ? 'bg-gray-900 w-6' : 'bg-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Current Configuration Card */}
              {currentConfig && productOptions && (
                <div className="mt-6">
                  <CurrentConfiguration
                    config={currentConfig}
                    productOptions={productOptions}
                    onQuantityChange={(quantity) => handleConfigChange("quantity", quantity)}
                    onAddToQuote={addToQuoteLocal}
                  />
                </div>
              )}

              {/* Current Quote Section */}
              {quoteItems.length > 0 && (
                <div className="mt-6 bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    Current Quote ({quoteItems.length} items)
                  </h4>
                  <div className="space-y-3">
                    {quoteItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 bg-white rounded border"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 space-y-2">
                            {/* SKU - First line */}
                            <div className="font-mono text-xs font-semibold text-gray-900">
                              SKU: {item.id}
                            </div>
                            {/* Description - Second line */}
                            <p className="text-sm text-gray-600">
                              {getConfigDescription(item)}
                            </p>
                            {/* Quantity - Editable */}
                            <div className="flex items-center space-x-2 pt-1">
                              <Label htmlFor={`mobile-qty-${item.id}`} className="text-xs font-medium text-gray-600">
                                Qty:
                              </Label>
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => {
                                    const newQuantity = Math.max((item.quantity || 1) - 1, 1);
                                    updateQuoteItemQuantity(item.id, newQuantity);
                                  }}
                                  disabled={(item.quantity || 1) <= 1}
                                  className="h-7 w-7"
                                >
                                  <Minus className="w-3 h-3" />
                                </Button>
                                <Input
                                  id={`mobile-qty-${item.id}`}
                                  type="number"
                                  value={item.quantity || 1}
                                  onChange={(e) => {
                                    const newQuantity = Math.max(1, Math.min(999, parseInt(e.target.value) || 1));
                                    updateQuoteItemQuantity(item.id, newQuantity);
                                  }}
                                  min="1"
                                  max="999"
                                  className="w-14 text-center text-xs h-7"
                                />
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => {
                                    const newQuantity = Math.min((item.quantity || 1) + 1, 999);
                                    updateQuoteItemQuantity(item.id, newQuantity);
                                  }}
                                  disabled={(item.quantity || 1) >= 999}
                                  className="h-7 w-7"
                                >
                                  <Plus className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromQuoteLocal(item.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-gray-200">
                    <Button
                      variant="outline"
                      onClick={downloadConfiguration}
                      disabled={isGeneratingQuotePdf || quoteItems.length === 0}
                      className="w-full flex items-center justify-center space-x-2"
                    >
                      {isGeneratingQuotePdf ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Generating PDF...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          <span>Download Config</span>
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => {
                        setShowMobileProductPanel(false);
                        setQuoteFormVisible(true);
                      }}
                      className="w-full bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center space-x-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>Request Quote</span>
                    </Button>
                  </div>
                </div>
              )}
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
                      <div className="space-y-2">
                        <Label htmlFor="projectLocation" className="text-gray-700">
                          Project Location
                        </Label>
                        <Input
                          id="projectLocation"
                          placeholder="State, ZIP (ex: NC, 28021)"
                          value={customerInfo.projectLocation}
                          onChange={(e) =>
                            updateCustomerInfo('projectLocation', e.target.value)
                          }
                          className="bg-gray-50 border-gray-200"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="projectName" className="text-gray-700">
                          Project Name
                        </Label>
                        <Input
                          id="projectName"
                          value={customerInfo.projectName}
                          onChange={(e) =>
                            updateCustomerInfo('projectName', e.target.value)
                          }
                          className="bg-gray-50 border-gray-200"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="desiredDeliveryDate" className="text-gray-700">
                          Desired Delivery Date
                        </Label>
                        <Input
                          id="desiredDeliveryDate"
                          value={customerInfo.desiredDeliveryDate}
                          onChange={(e) =>
                            updateCustomerInfo('desiredDeliveryDate', e.target.value)
                          }
                          className="bg-gray-50 border-gray-200"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="specifier" className="text-gray-700">
                          Specifier
                        </Label>
                        <Input
                          id="specifier"
                          value={customerInfo.specifier}
                          onChange={(e) =>
                            updateCustomerInfo('specifier', e.target.value)
                          }
                          className="bg-gray-50 border-gray-200"
                        />
                      </div>
                    </div>

                    {/* Project Notes - Full Width */}
                    <div className="space-y-2 mt-6">
                      <Label htmlFor="projectNotes" className="text-gray-700">
                        Project Notes
                      </Label>
                      <Textarea
                        id="projectNotes"
                        value={customerInfo.projectNotes}
                        onChange={(e) =>
                          updateCustomerInfo('projectNotes', e.target.value)
                        }
                        className="bg-gray-50 border-gray-200 min-h-[100px]"
                        placeholder="Enter any additional project details..."
                      />
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
                      data-submitting
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

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={handleCloseSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Quote Request Submitted!</DialogTitle>
            <DialogDescription>
              Your quote request has been successfully submitted. Download your configuration PDF below.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseSuccessDialog}
            >
              Close
            </Button>
            <Button
              type="button"
              onClick={handleDownloadQuote}
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              Download Configuration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}

export default App;
