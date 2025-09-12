import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "./components/ui/button";
import { Card } from "./components/ui/card";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Separator } from "./components/ui/separator";
import { Badge } from "./components/ui/badge";
import { Skeleton } from "./components/ui/skeleton";
import { Alert, AlertDescription } from "./components/ui/alert";
import { Switch } from "./components/ui/switch";
import {
  Trash2,
  Plus,
  Send,
  Minus,
  Check,
  Monitor,
  Zap,
  ZapOff,
  Lightbulb,
  Loader2,
  AlertCircle,
  ShoppingCart,
  Download,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  RotateCcw,
} from "lucide-react";

// Import Directus service layer
import {
  initializeDirectusService,
  getActiveProductLines,
  getProductLineWithOptions,
  getFilteredOptionsForProductLine,
  getAvailableOptionIdsForSelections,
  getAllProducts,
  getRules,
  ProductLine,
  DecoProduct,
  FrameThickness,
  MirrorStyle,
  LightDirection,
  MountingOption
} from "./services/directus";

// Import rules and product matching services
import { processRules, evaluateRuleConditions, buildRuleConstraints, applyConstraintsToIds } from "./services/rules-engine";
import { findProductsByCriteria, selectBestProduct } from "./services/simple-product-matcher";
import { selectProductImage, constructDirectusAssetUrl } from "./services/image-selector";

// Import API validation and test suite
// Dev-only validators are noisy; omit in production build

// Import components
import { ProductLineSelector } from "./components/ui/product-line-selector";
import { getFeatureFlags } from './utils/environment';
import { CurrentConfiguration } from "./components/ui/current-configuration";
import DynamicOptionsContainer from "./components/ui/dynamic-options-container";
import { EnvironmentIndicator } from "./components/ui/environment-indicator";

interface ProductConfig {
  id: string;
  productLineId: number;
  productLineName: string;
  mirrorControls: string;
  frameColor: string;
  frameThickness: string;
  mirrorStyle: string;
  width: string;
  height: string;
  mounting: string;
  lighting: string;
  colorTemperature: string;
  lightOutput: string;
  driver: string;
  accessories: string[];
  quantity: number;
}

interface ProductOption {
  id: number;
  name: string;
  sku_code: string;
  description?: string;
  hex_code?: string;
  width?: number;
  height?: number;
  value?: string;
}

interface ProductOptions {
  mirrorControls: ProductOption[];
  frameColors: ProductOption[];
  frameThickness: ProductOption[];
  mirrorStyles: ProductOption[];
  mountingOptions: ProductOption[];
  lightingOptions: ProductOption[];
  colorTemperatures: ProductOption[];
  lightOutputs: ProductOption[];
  drivers: ProductOption[];
  accessoryOptions: ProductOption[];
  sizes: ProductOption[];
}

// Icon mapping for different option types
const iconMapping: { [key: string]: any } = {
  direct: Zap,
  indirect: Lightbulb,
  "both direct and indirect": Zap,
  zap: Zap,
  "zap-off": ZapOff,
  lightbulb: Lightbulb,
  monitor: Monitor,
  portrait: RotateCcw,
  landscape: RotateCw,
};

const App: React.FC = () => {
  // App state
  const [productOptions, setProductOptions] = useState<ProductOptions | null>(null);
  const [dynamicOptionsByCollection, setDynamicOptionsByCollection] = useState<Record<string, any[]> | null>(null);
  const [currentProduct, setCurrentProduct] = useState<DecoProduct | null>(null);
  const [currentProductLine, setCurrentProductLine] = useState<ProductLine | null>(null);
  const [availableProductLines, setAvailableProductLines] = useState<ProductLine[]>([]);
  
  // Generic availability state (option-agnostic)
  const [availableOptionIds, setAvailableOptionIds] = useState<Record<string, number[]>>({});
  const [isComputingAvailability, setIsComputingAvailability] = useState(false);
  const DEBUG_AVAIL = getFeatureFlags().debugLogging || (import.meta as any).env?.VITE_DEBUG_AVAILABILITY === 'true';

  // Loading states
  const [isLoadingApp, setIsLoadingApp] = useState(true);
  const [isLoadingProductLine, setIsLoadingProductLine] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentConfig, setCurrentConfig] = useState<ProductConfig | null>(null);
  const [quoteItems, setQuoteItems] = useState<ProductConfig[]>([]);
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
  });

  const [showQuoteForm, setShowQuoteForm] = useState(false);

  // Debug helper: expose availability and current config after state exists
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).printAvailability = () => {
        console.log('Available Option IDs:', availableOptionIds);
        console.log('Current Config:', currentConfig);
      };
    }
  }, [availableOptionIds, currentConfig]);

  // Custom size toggle state
  const [useCustomSize, setUseCustomSize] = useState(false);

  // Floating configuration bar state
  const [showFloatingBar, setShowFloatingBar] = useState(false);
  // Lightbox / gallery state
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const thumbnailsRef = React.useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

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

      // If current selections are invalid per computed availability, wait for auto-correction
      try {
        const ldIds = availableOptionIds?.['light_direction'];
        if (Array.isArray(ldIds) && ldIds.length > 0) {
          const selLd = parseInt(currentConfig.lighting || '0', 10);
          if (selLd && !ldIds.includes(selLd)) {
            if (import.meta.env.DEV) console.log('⏳ Waiting for auto-correct of light_direction based on availability');
            return;
          }
        }
        const ftIds = availableOptionIds?.['frame_thickness'];
        if (Array.isArray(ftIds) && ftIds.length > 0) {
          const selFt = parseInt(currentConfig.frameThickness || '0', 10);
          if (selFt && !ftIds.includes(selFt)) {
            if (import.meta.env.DEV) console.log('⏳ Waiting for auto-correct of frame_thickness based on availability');
            return;
          }
        }
      } catch {}
      
      try {
        // Build configuration context for rules (ensure all values are primitives, not objects)
        const configContext = {
          product_line: currentConfig.productLineId,
          frame_thickness: frameThickness?.id,
          mirror_style: mirrorStyle.id,
          light_direction: lightDirection.id,
          // Add other relevant fields as numbers
          frame_color: parseInt(currentConfig.frameColor),
          mounting: parseInt(currentConfig.mounting),
          driver: currentConfig.driver ? parseInt(currentConfig.driver) : undefined
        };

        // Process rules to get any overrides (currently not altering product selection)
        await processRules(configContext);

        // Strictly use products: match by attributes instead of building SKU
        const candidates = await findProductsByCriteria({
          productLineId: currentConfig.productLineId,
          mirrorStyleId: mirrorStyle.id,
          lightDirectionId: lightDirection.id,
          frameThicknessId: frameThickness?.id
        });

        const product = selectBestProduct(candidates);

        if (!product) {
          const details = {
            productLineId: currentConfig.productLineId,
            mirrorStyleId: mirrorStyle.id,
            lightDirectionId: lightDirection.id,
            frameThicknessId: frameThickness?.id,
          };
          console.error('❌ No products matched strict criteria. Verify products and permissions:', details);
          setError('No products matched the selected options. Ensure products have mirror_style, light_direction, and (for this line) frame_thickness set and readable via API.');
        }

        if (import.meta.env.DEV) console.log('🔍 Product Match (attributes):', {
          foundProduct: !!product,
          count: candidates.length,
          productName: product?.name,
          productSku: (product as any)?.sku_code || undefined,
          productId: product?.id,
          hasVerticalImage: !!product?.vertical_image,
          hasHorizontalImage: !!product?.horizontal_image
        });

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
      if (e.key === 'Escape') setIsLightboxOpen(false);
      if (e.key === 'ArrowRight') setLightboxIndex(prev => prev + 1);
      if (e.key === 'ArrowLeft') setLightboxIndex(prev => Math.max(prev - 1, 0));
    };
    window.addEventListener('keydown', handler);
    // Disable body scroll while lightbox is open
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = prevOverflow;
    };
  }, [isLightboxOpen]);

  // Build thumbnail URLs from product images + additional_images
  const getProductThumbnails = (product: DecoProduct | null): string[] => {
    if (!product) return [];
    const urls: string[] = [];
    const pushUnique = (url?: string | null) => {
      if (!url) return;
      if (!urls.includes(url)) urls.push(url);
    };
    // Additional images only (exclude vertical/horizontal primary images)
    if (Array.isArray(product.additional_images)) {
      for (const item of product.additional_images) {
        const file = (item as any)?.directus_files_id;
        const id = typeof file === 'string' ? file : file?.id;
        if (id) pushUnique(constructDirectusAssetUrl(id));
      }
    }
    return urls;
  };

  // Update scroll button visibility
  const updateThumbScrollState = () => {
    const el = thumbnailsRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
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
        setShowFloatingBar(showBar);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentConfig]);

  const initializeApp = async () => {
    try {
      setIsLoadingApp(true);
      setError(null);

      console.log('Loading real product data...');
      
      // Clear cache only if needed for debugging
      // clearCache();
      // console.log('✓ Cache cleared for fresh data');

      // Initialize Directus service first
      await initializeDirectusService();

      // Load all product lines
      const productLines = await getActiveProductLines();
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

      // Get the product line with its options
      const productLineWithOptions = await getProductLineWithOptions(defaultProductLine.sku_code);
      if (!productLineWithOptions) {
        throw new Error(`Failed to load product line: ${defaultProductLine.name}`);
      }

      setCurrentProductLine(productLineWithOptions);

      // Load filtered options for the default product line
      await loadProductLineOptions(productLineWithOptions);

    } catch (err) {
      console.error("Failed to load product data:", err);
      setError(err instanceof Error ? err.message : "Failed to load product data");
    } finally {
      setIsLoadingApp(false);
    }
  };

  // Load options for a specific product line
  const loadProductLineOptions = async (productLine: ProductLine) => {
    try {
      if (import.meta.env.DEV) console.log(`🔄 Loading options for ${productLine.name}...`);

      // Get filtered options for this product line
      const filteredOptions = await getFilteredOptionsForProductLine(productLine);
      // Capture dynamic option sets if present
      if ((filteredOptions as any)?.dynamicSets && typeof (filteredOptions as any).dynamicSets === 'object') {
        setDynamicOptionsByCollection((filteredOptions as any).dynamicSets as Record<string, any[]>);
      } else {
        setDynamicOptionsByCollection(null);
      }

      const options: ProductOptions = {
        mirrorControls: filteredOptions.mirrorControls.map(item => ({
          id: item.id,
          name: item.name,
          sku_code: item.sku_code,
          description: item.description
        })),
        frameColors: filteredOptions.frameColors.map(item => ({
          id: item.id,
          name: item.name,
          sku_code: item.sku_code,
          hex_code: item.hex_code
        })),
        frameThickness: filteredOptions.frameThickness.map(item => ({
          id: item.id,
          name: item.name,
          sku_code: item.sku_code
        })),
        mirrorStyles: filteredOptions.mirrorStyles
          .map(item => ({
            id: item.id,
            name: item.name,
            sku_code: item.sku_code,
            description: item.description
          }))
          .sort((a, b) => {
            const aa = a.sku_code ? parseInt(a.sku_code, 10) : Number.MAX_SAFE_INTEGER;
            const bb = b.sku_code ? parseInt(b.sku_code, 10) : Number.MAX_SAFE_INTEGER;
            if (Number.isNaN(aa) && Number.isNaN(bb)) return (a.sku_code || '').localeCompare(b.sku_code || '');
            if (Number.isNaN(aa)) return 1;
            if (Number.isNaN(bb)) return -1;
            return aa - bb;
          }),
        mountingOptions: filteredOptions.mountingOptions.map(item => ({
          id: item.id,
          name: item.name,
          sku_code: item.sku_code,
          description: item.description
        })),
        lightingOptions: filteredOptions.lightingOptions.map(item => ({
          id: item.id,
          name: item.name,
          sku_code: item.sku_code,
          description: item.description
        })),
        colorTemperatures: filteredOptions.colorTemperatures.map(item => ({
          id: item.id,
          name: item.name,
          sku_code: item.sku_code
        })),
        lightOutputs: filteredOptions.lightOutputs.map(item => ({
          id: item.id,
          name: item.name,
          sku_code: item.sku_code
        })),
        drivers: filteredOptions.drivers.map(item => ({
          id: item.id,
          name: item.name,
          sku_code: item.sku_code,
          description: item.description
        })),
        // Use filtered accessories (already filtered by product line)
        accessoryOptions: filteredOptions.accessories.map(item => ({
          id: item.id,
          name: item.name,
          sku_code: item.sku_code,
          description: item.description || undefined
        })),
        sizes: filteredOptions.sizes.map(item => {
          // Extract dimensions directly instead of using the removed getNumericDimensions function
          const dimensions = {
            width: item.width ? Number(item.width) : undefined,
            height: item.height ? Number(item.height) : undefined
          };
          return {
            id: item.id,
            name: item.name,
            sku_code: item.sku_code,
            width: dimensions.width,
            height: dimensions.height
          };
        }),
      };

      setProductOptions(options);

      // Initialize current configuration with first available options and default size
      const defaultSize = options.sizes[0]; // First size preset

      // Only set configuration if we have at least some options available
      if (options.mirrorControls.length > 0 || options.frameColors.length > 0 || options.sizes.length > 0) {
        const initialConfig: ProductConfig = {
          id: `config-${Date.now()}`,
          productLineId: productLine.id,
          productLineName: productLine.name,
          mirrorControls: options.mirrorControls[0]?.id.toString() || "",
          frameColor: options.frameColors[0]?.id.toString() || "",
          frameThickness: options.frameThickness[0]?.id.toString() || "",
          mirrorStyle: options.mirrorStyles[0]?.id.toString() || "",
          width: defaultSize?.width?.toString() || "24",
          height: defaultSize?.height?.toString() || "36",
          mounting: options.mountingOptions[0]?.id.toString() || "",
          lighting: options.lightingOptions[0]?.id.toString() || "",
          colorTemperature: options.colorTemperatures[0]?.id.toString() || "",
          lightOutput: options.lightOutputs[0]?.id.toString() || "",
          driver: options.drivers[0]?.id.toString() || "",
          accessories: [],
          quantity: 1,
        };
        setCurrentConfig(initialConfig);

        // Compute initial availability based on defaults using freshly loaded options
        await computeAvailableOptions(productLine.id, initialConfig, options);
      } else {
        console.log(`⚠️ No options available for ${productLine.name}, configuration not initialized`);
        setCurrentConfig(null);
      }

      if (import.meta.env.DEV) {
        console.log("✓ Real product data loaded successfully");
        console.log(`✓ Loaded ${options.mirrorControls.length} mirror controls`);
        console.log(`✓ Loaded ${options.frameColors.length} frame colors`);
        console.log(`✓ Loaded ${options.mirrorStyles.length} mirror styles`);
        console.log(`✓ Loaded ${options.sizes.length} size options`);
        console.log(`✓ Loaded ${options.mountingOptions.length} mounting orientations`);
        console.log(`✓ Loaded ${options.accessoryOptions.length} filtered accessories (Nightlight & Anti-Fog only)`);
      }
      
    } catch (error) {
      console.error(`❌ Error loading options for ${productLine.name}:`, error);
      throw error;
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
    setIsLoadingProductLine(true);
    // Clear current product to avoid showing stale image while switching
    setCurrentProduct(null);
    
    try {
      console.log(`🔄 Switching to product line: ${newProductLine.name}`);

      // Get product line with expanded default options
      const productLineWithOptions = await getProductLineWithOptions(newProductLine.sku_code);
      if (!productLineWithOptions) {
        throw new Error(`Failed to load product line ${newProductLine.name}`);
      }

      // Update current product line first to align IDs for downstream effects
      setCurrentProductLine(productLineWithOptions);
      // Then load filtered options for the new product line
      await loadProductLineOptions(productLineWithOptions);

      console.log(`✅ Successfully switched to ${newProductLine.name}`);
    } catch (error) {
      console.error(`❌ Error switching product line:`, error);
      setError(error instanceof Error ? error.message : "Failed to switch product line");
    } finally {
      console.log(`Setting loading state to false`);
      setIsLoadingProductLine(false);
      // Force an immediate check of the state
      setTimeout(() => {
        console.log(`After setIsLoadingProductLine(false), state is now:`, isLoadingProductLine);
      }, 0);
    }
  };


  const handleConfigChange = async (field: keyof ProductConfig, value: any) => {
    if (!currentConfig) return;

    const newConfig = { ...currentConfig, [field]: value };
    if (DEBUG_AVAIL) console.log('📝 Config change:', field, '->', value);
    setCurrentConfig(newConfig);

    // Recompute generic availability after any relevant change
    if (currentProductLine) {
      await computeAvailableOptions(currentProductLine.id, newConfig);
    }
  };

  // Compute generic available options (IDs per product field) from Products
  const computeAvailableOptions = async (productLineId: number, config: ProductConfig, optionsOverride?: ProductOptions) => {
    try {
      setIsComputingAvailability(true);
      // Build rules context with numeric IDs and flattened sku_code fields
      const opts = optionsOverride || productOptions;
      const selectedMirrorStyle = opts?.mirrorStyles?.find(ms => ms.id.toString() === config.mirrorStyle);
      const selectedLightDirection = opts?.lightingOptions?.find(ld => ld.id.toString() === config.lighting);
      const selectedFrameThickness = opts?.frameThickness?.find(ft => ft.id.toString() === config.frameThickness);
      const context = {
        product_line: productLineId,
        mirror_style: selectedMirrorStyle ? selectedMirrorStyle.id : undefined,
        mirror_style_code: selectedMirrorStyle?.sku_code ? parseInt(selectedMirrorStyle.sku_code, 10) : undefined,
        light_direction: parseInt(config.lighting || '0', 10) || undefined,
        frame_thickness: parseInt(config.frameThickness || '0', 10) || undefined,
        frame_color: parseInt(config.frameColor || '0', 10) || undefined,
        mounting: parseInt(config.mounting || '0', 10) || undefined,
        driver: parseInt(config.driver || '0', 10) || undefined,
        light_output: parseInt(config.lightOutput || '0', 10) || undefined,
        color_temperature: parseInt(config.colorTemperature || '0', 10) || undefined,
        // flattened keys for nested rule comparisons like product_line.sku_code, mirror_style.sku_code
        product_line_sku_code: currentProductLine?.sku_code,
        mirror_style_sku_code: selectedMirrorStyle?.sku_code,
        light_direction_sku_code: selectedLightDirection?.sku_code,
        frame_thickness_sku_code: selectedFrameThickness?.sku_code,
      } as any;

      // Apply rules before product-based filtering
      const processed = await processRules(context);

      // Use the explicit current selections for availability (mirror_style must be present)
      const availabilitySelections: Record<string, any> = {
        product_line: productLineId,
        mirror_style: selectedMirrorStyle ? selectedMirrorStyle.id : undefined,
        mirror_style_sku_code: selectedMirrorStyle?.sku_code,
        light_direction: parseInt(config.lighting || '0', 10) || undefined,
      };
      let ids = await getAvailableOptionIdsForSelections(productLineId, availabilitySelections);

      // Apply post-rule pruning: intersect availability with rule-imposed constraints
      try {
        const rules = await getRules();
        const constraints = buildRuleConstraints(rules, processed);
        if (import.meta.env.DEV) {
          const debugConstraints: any = {};
          for (const [k, v] of Object.entries(constraints)) {
            debugConstraints[k] = {
              allow: (v as any).allow ? Array.from((v as any).allow as any) : undefined,
              deny: (v as any).deny ? Array.from((v as any).deny as any) : undefined
            };
          }
          console.log('🧩 Rule constraints:', debugConstraints);
        }
        const getAllIdsForField = (field: string): number[] => {
          switch (field) {
            case 'mirror_style':
              return (opts?.mirrorStyles || []).map(o => o.id);
            case 'light_direction':
              return (opts?.lightingOptions || []).map(o => o.id);
            case 'frame_thickness':
              return (opts?.frameThickness || []).map(o => o.id);
            case 'frame_color':
              return (opts?.frameColors || []).map(o => o.id);
            case 'mounting':
              return (opts?.mountingOptions || []).map(o => o.id);
            case 'driver':
              return (opts?.drivers || []).map(o => o.id);
            case 'light_output':
              return (opts?.lightOutputs || []).map(o => o.id);
            case 'color_temperature':
              return (opts?.colorTemperatures || []).map(o => o.id);
            default:
              return [];
          }
        };
        ids = applyConstraintsToIds(ids, constraints, getAllIdsForField);
      } catch (e) {
        if (import.meta.env.DEV) console.warn('Post-rule pruning skipped:', e);
      }
      setAvailableOptionIds(ids);

      if (DEBUG_AVAIL) {
        console.groupCollapsed(
          `🔎 Availability for PL ${productLineId}`,
          `MS ${context.mirror_style ?? '-'} LD ${context.light_direction ?? '-'} FT ${context.frame_thickness ?? '-'}`
        );
        const pick = (k: string) => (Array.isArray(ids[k]) ? [...ids[k]].sort((a,b)=>a-b) : ids[k]);
        console.log('mirror_style:', pick('mirror_style'));
        console.log('light_direction:', pick('light_direction'));
        console.log('frame_thickness:', pick('frame_thickness'));
        console.groupEnd();
      }

      // Enforce defaults for any invalid selections across constrained sets
      if (opts) {
        let updated: Partial<ProductConfig> = {};
        const ensureValid = (
          fieldKey: string,
          configKey: keyof ProductConfig,
          options: ProductOption[]
        ) => {
          const idList = ids[fieldKey];
          if (!Array.isArray(idList)) return;
          // If there are zero valid IDs for this field, clear the selection to avoid stale/invalid values
          if (idList.length === 0) {
            const currentVal = (config as any)[configKey] as string | undefined;
            if (currentVal) (updated as any)[configKey] = '';
            return;
          }
          const currentVal = (config as any)[configKey] as string | undefined;
          const currentNum = currentVal ? parseInt(currentVal, 10) : NaN;
          if (!currentVal || !idList.includes(currentNum)) {
            const first = options.find(o => idList.includes(o.id));
            if (first) (updated as any)[configKey] = first.id.toString();
          }
        };

        // Enforce for light direction, mounting (circle styles), and rule-constrained outputs
        // Ensure light direction respects current mirror style + (optional) frame thickness
        ensureValid('light_direction', 'lighting', opts.lightingOptions);
        // Ensure frame thickness respects current mirror style + light direction
        ensureValid('frame_thickness', 'frameThickness', opts.frameThickness);
        // Mounting: also derive from available images for this style/line
        ensureValid('mounting', 'mounting', opts.mountingOptions);
        ensureValid('light_output', 'lightOutput', opts.lightOutputs);
        ensureValid('color_temperature', 'colorTemperature', opts.colorTemperatures);

        const hasUpdates = Object.keys(updated).length > 0;
        if (hasUpdates) setCurrentConfig(prev => prev ? { ...prev, ...updated } : null);
      }

      // Derive mounting availability from product images (vertical/horizontal)
      try {
        if (opts) {
          const all = await getAllProducts();
          const selStyle = opts.mirrorStyles.find(ms => ms.id.toString() === (config.mirrorStyle || ''));
          const styleId = selStyle?.id;
          const styleCode = selStyle?.sku_code ? parseInt(selStyle.sku_code, 10) : undefined;
          const ld = parseInt(config.lighting || '0', 10) || undefined;
          const candidates = all.filter(p =>
            p.product_line === productLineId &&
            (styleId === undefined && styleCode === undefined ? true : ((p.mirror_style === styleId) || (p.mirror_style === styleCode))) &&
            (ld === undefined ? true : p.light_direction === ld)
          );
          const allowV = candidates.some(p => !!p.vertical_image);
          const allowH = candidates.some(p => !!p.horizontal_image);
          const verticalOpt = opts.mountingOptions.find(o => o.name.toLowerCase().includes('vertical'));
          const horizontalOpt = opts.mountingOptions.find(o => o.name.toLowerCase().includes('horizontal'));
          const mountIds: number[] = [];
          if (allowV && verticalOpt) mountIds.push(verticalOpt.id);
          if (allowH && horizontalOpt) mountIds.push(horizontalOpt.id);
          if (mountIds.length > 0) {
            setAvailableOptionIds(prev => ({ ...prev, mounting: mountIds }));
            const currentMount = parseInt(config.mounting || '0', 10);
            if (!mountIds.includes(currentMount)) {
              const first = mountIds[0].toString();
              setCurrentConfig(prev => prev ? { ...prev, mounting: first } : null);
            }
          }
        }
      } catch (e) {
        if (import.meta.env.DEV) console.warn('Mounting derivation skipped:', e);
      }
    } catch (e) {
      console.error('Failed to compute available options:', e);
    } finally {
      setIsComputingAvailability(false);
    }
  };

  const handleSizePresetSelect = (size: ProductOption) => {
    if (!currentConfig) return;

    setCurrentConfig((prev) => prev ? {
      ...prev,
      width: size.width?.toString() || "",
      height: size.height?.toString() || "",
    } : null);
  };

  const getCurrentSizeId = () => {
    if (!currentConfig || !productOptions) return "";

    const matchingSize = productOptions.sizes.find(
      (size) =>
        size.width?.toString() === currentConfig.width &&
        size.height?.toString() === currentConfig.height
    );

    return matchingSize ? (matchingSize.sku_code || matchingSize.id.toString()) : "";
  };

  const handleAccessoryToggle = (accessoryId: string) => {
    if (!currentConfig) return;

    setCurrentConfig((prev) => {
      if (!prev) return null;
      
      const accessories = [...(prev.accessories || [])];
      const index = accessories.indexOf(accessoryId);

      if (index > -1) {
        accessories.splice(index, 1);
      } else {
        accessories.push(accessoryId);
      }

      return {
        ...prev,
        accessories,
      };
    });
  };

  const incrementQuantity = () => {
    if (!currentConfig) return;
    setCurrentConfig((prev) => {
      if (!prev) return null;
      
      return {
        ...prev,
        quantity: (prev.quantity || 1) + 1,
      };
    });
  };

  const decrementQuantity = () => {
    if (!currentConfig) return;

    setCurrentConfig((prev) => {
      if (!prev) return null;
      
      return {
        ...prev,
        quantity: Math.max(1, (prev.quantity || 1) - 1),
      };
    });
  };

  const addToQuote = () => {
    if (!currentConfig || !productOptions || !currentProductLine) return;

    setQuoteItems((prev) => [
      ...prev,
      {
        ...currentConfig,
        id: generateProductName(),
      },
    ]);

    // Reset configuration to default for this product line
    setCurrentConfig({
      id: `config-${Date.now()}`,
      productLineId: currentProductLine.id,
      productLineName: currentProductLine.name,
      frameThickness: productOptions.frameThickness[0]?.id.toString() || "",
      frameColor: productOptions.frameColors[0]?.id.toString() || "",
      mirrorControls: productOptions.mirrorControls[0]?.id.toString() || "",
      mirrorStyle: productOptions.mirrorStyles[0]?.id.toString() || "",
      mounting: productOptions.mountingOptions[0]?.id.toString() || "",
      width: productOptions.sizes[0]?.width?.toString() || "",
      height: productOptions.sizes[0]?.height?.toString() || "",
      lighting: productOptions.lightingOptions[0]?.id.toString() || "",
      colorTemperature: productOptions.colorTemperatures[0]?.id.toString() || "",
      lightOutput: productOptions.lightOutputs[0]?.id.toString() || "",
      driver: productOptions.drivers[0]?.id.toString() || "",
      accessories: [],
      quantity: 1,
    });

    setUseCustomSize(false);
  };

  const removeFromQuote = (configId: string) => {
    setQuoteItems((prev) => prev.filter((item) => item.id !== configId));
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

    setQuoteItems([]);
    setCustomerInfo({
      name: "",
      email: "",
      company: "",
      phone: "",
    });
    setShowQuoteForm(false);

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

  const generateProductName = (): string => {
    if (!currentConfig) return `quote-item-${Date.now()}`;

    const { productLineName, frameThickness, mirrorStyle, width, height } = currentConfig;

    // Generate codes for specific options
    const mirrorStyleCode = mirrorStyle === "Rectangle" ? "R" : "O";
    const lightingCode = currentConfig.lightOutput ? "L" : "";

    return `${productLineName}-${frameThickness}-${mirrorStyleCode}${lightingCode}-${width}x${height}`;
  };

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
                <Skeleton className="h-10 w-32" />
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
                onClick={() => setShowQuoteForm(true)}
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
                  hasVerticalImage: !!currentProduct?.vertical_image,
                  hasHorizontalImage: !!currentProduct?.horizontal_image,
                  imageUrl
                });
                
                if (imageUrl) {
                  return (
                    <>
                      <img
                        src={imageUrl}
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
                        <p className="text-xs mt-1">Orientation: {imageSelection.orientation}</p>
                      </div>
                    </div>
                  );
                } else {
                  return <Skeleton className="w-full h-full" />;
                }
              })()}
            </div>

            {/* Thumbnails */}
            {currentProduct && (
              <div className="w-full">
                {(() => {
                  const thumbs = getProductThumbnails(currentProduct);
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
                                  onClick={() => { setIsLightboxOpen(true); setLightboxIndex(i); }}
                                  className="shrink-0 w-20 h-20 rounded-lg bg-white border border-gray-200 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 overflow-hidden"
                                  title="View image"
                                >
                                  <img src={url} alt="Thumbnail" className="w-full h-full object-cover" />
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
                const goPrev = () => setLightboxIndex(i => i - 1);
                const goNext = () => setLightboxIndex(i => i + 1);
                return (
                  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-3" role="dialog" aria-modal="true" onClick={() => setIsLightboxOpen(false)}>
                    <button
                      aria-label="Close gallery"
                      className="absolute top-4 right-4 text-white/90 hover:text-white"
                      onClick={(e) => { e.stopPropagation(); setIsLightboxOpen(false); }}
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
                        onClick={() => removeFromQuote(item.id)}
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
                    onClick={() => setShowQuoteForm(true)}
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
                  onAddToQuote={addToQuote}
                />
              )}
            </div>

            {/* Configuration Options - Feature flag for dynamic renderer */}
            {currentConfig && import.meta.env.VITE_DYNAMIC_OPTIONS === 'true' && (
              <div className="space-y-10">
                <DynamicOptionsContainer
                  productLineDefaults={(currentProductLine?.default_options as any) || []}
                  currentConfig={currentConfig}
                  availableOptionIds={availableOptionIds}
                  customSize={useCustomSize}
                  onToggleCustomSize={setUseCustomSize}
                  onChange={(key, value) => handleConfigChange(key as any, value)}
                  preloadedOptionsByCollection={dynamicOptionsByCollection || undefined}
                />
              </div>
            )}

            {/* Legacy hardcoded options rendering (default path) */}
            {currentConfig && import.meta.env.VITE_DYNAMIC_OPTIONS !== 'true' && (
            <div className="space-y-10">
              {/* 1. Mirror Controls */}
              {productOptions.mirrorControls.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Mirror Controls</h3>
                <div className="space-y-3">
                  {productOptions.mirrorControls.map((control) => (
                    <button
                      key={control.id}
                      onClick={() => handleConfigChange("mirrorControls", control.id.toString())}
                      className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                        currentConfig.mirrorControls === control.id.toString()
                          ? "border-amber-500 bg-amber-50"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900 mb-1">{control.name}</div>
                          <div className="text-sm text-gray-600">{control.description}</div>
                        </div>
                        <Badge variant="outline">{control.sku_code}</Badge>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              )}

              {/* 2. Frame Color */}
              {productOptions.frameColors.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Frame Color</h3>
                <div className="grid grid-cols-2 gap-4">
                  {productOptions.frameColors.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => handleConfigChange("frameColor", color.id.toString())}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                        currentConfig.frameColor === color.id.toString()
                          ? "border-amber-500 bg-amber-50"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-6 h-6 rounded-full border border-gray-300 flex-shrink-0"
                          style={{
                            backgroundColor: color.hex_code || "#000000",
                            borderColor: color.hex_code === "#FFFFFF" ? "#e5e5e5" : color.hex_code || "#000000",
                          }}
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{color.name}</div>
                          <div className="text-sm text-gray-600">{color.sku_code}</div>
                        </div>
                        <Badge variant="outline">{color.sku_code}</Badge>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              )}

              {/* 3. Frame Thickness */}
              {productOptions.frameThickness.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Frame Thickness</h3>
                <div className="space-y-3">
                  {productOptions.frameThickness.map((thickness) => (
                    <button
                      key={thickness.id}
                      onClick={() => handleConfigChange("frameThickness", thickness.id.toString())}
                      className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                        currentConfig.frameThickness === thickness.id.toString()
                          ? "border-amber-500 bg-amber-50"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900 mb-1">{thickness.name}</div>
                          {thickness.description && (
                            <div className="text-sm text-gray-600">{thickness.description}</div>
                          )}
                        </div>
                        <Badge variant="outline">{thickness.sku_code}</Badge>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              )}

              {/* 4. Mirror Style */}
              {productOptions.mirrorStyles.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Mirror Style</h3>
                <div className="grid grid-cols-2 gap-4">
                  {productOptions.mirrorStyles.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => handleConfigChange("mirrorStyle", style.id.toString())}
                      className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                        currentConfig.mirrorStyle === style.id.toString()
                          ? "border-amber-500 bg-amber-50"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900 mb-1">{style.name}</div>
                          <div className="text-sm text-gray-600">{style.description}</div>
                        </div>
                        <Badge variant="outline">{style.sku_code}</Badge>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              )}

              {/* 5. Light Direction (mirror style compatibility) */}
              {productOptions.lightingOptions.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Light Direction</h3>
                <div className="space-y-3">
                  {productOptions.lightingOptions.map((option) => {
                    const Icon = iconMapping[option.name.toLowerCase()] || Zap;
                    const ids = availableOptionIds["light_direction"];
                    const noAvailability = Array.isArray(ids) && ids.length === 0 && !!currentConfig.mirrorStyle;
                    const isDisabled = (Array.isArray(ids) && ids.length > 0 && !ids.includes(option.id)) || noAvailability;
                    return (
                      <button
                        key={option.id}
                        onClick={() => !isDisabled && handleConfigChange("lighting", option.id.toString())}
                        disabled={isDisabled}
                        className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                          currentConfig.lighting === option.id.toString()
                            ? "border-amber-500 bg-amber-50"
                            : isDisabled
                              ? "border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed"
                              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className="w-5 h-5 text-gray-600 flex-shrink-0" />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 mb-1">{option.name}</div>
                            <div className="text-sm text-gray-600">{option.description}</div>
                          </div>
                          <Badge variant="outline">{option.sku_code}</Badge>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
              )}

              {/* 6. Orientation (Mounting Options) */}
              {productOptions.mountingOptions.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Orientation</h3>
                <div className="space-y-3">
                  {productOptions.mountingOptions.map((option) => {
                    const Icon = iconMapping[option.name.toLowerCase()] || RotateCcw;
                    const ids = availableOptionIds["mounting"];
                    const isDisabled = Array.isArray(ids) && ids.length > 0 && !ids.includes(option.id);
                    return (
                      <button
                        key={option.id}
                        onClick={() => !isDisabled && handleConfigChange("mounting", option.id.toString())}
                        disabled={isDisabled}
                        className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                          currentConfig.mounting === option.id.toString()
                            ? "border-amber-500 bg-amber-50"
                            : isDisabled
                              ? "border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed"
                              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className="w-5 h-5 text-gray-600 flex-shrink-0" />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 mb-1">{option.name}</div>
                            <div className="text-sm text-gray-600">{option.description}</div>
                          </div>
                          <Badge variant="outline">{option.sku_code}</Badge>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
              )}

              {/* 7. Size */}
              {(productOptions.sizes.length > 0 || useCustomSize) && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Size</h3>
                  <div className="flex items-center space-x-3">
                    <Label htmlFor="custom-size-toggle" className="text-sm text-gray-700">
                      Custom Size
                    </Label>
                    <Switch
                      id="custom-size-toggle"
                      checked={useCustomSize}
                      onCheckedChange={setUseCustomSize}
                    />
                  </div>
                </div>

                {useCustomSize ? (
                  // Custom size inputs
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-gray-700">Width (inches)</Label>
                      <div className="relative">
                        <Input
                          type="number"
                          value={currentConfig.width}
                          onChange={(e) => handleConfigChange("width", e.target.value)}
                          min="12"
                          max="120"
                          className="text-center text-lg font-medium h-12 bg-gray-50 border-gray-200"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                          in
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-700">Height (inches)</Label>
                      <div className="relative">
                        <Input
                          type="number"
                          value={currentConfig.height}
                          onChange={(e) => handleConfigChange("height", e.target.value)}
                          min="12"
                          max="120"
                          className="text-center text-lg font-medium h-12 bg-gray-50 border-gray-200"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                          in
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Default size presets
                  <div className="grid grid-cols-2 gap-4">
                    {productOptions.sizes.map((size) => (
                      <button
                        key={size.id}
                        onClick={() => handleSizePresetSelect(size)}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                          getCurrentSizeId() === size.sku_code
                            ? "border-amber-500 bg-amber-50"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900 mb-1">{size.name}</div>
                            <div className="text-sm text-gray-600">{size.width}" × {size.height}"</div>
                          </div>
                          <Badge variant="outline">{size.sku_code}</Badge>
                        </div>
                        {/* Active state is expressed via border/background; no check icon */}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              )}

              {/* 8. Accessories */}
              {productOptions.accessoryOptions.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Accessories</h3>
                <div className="space-y-3">
                  {productOptions.accessoryOptions.map((accessory) => {
                      const isSelected = currentConfig.accessories.includes(accessory.id.toString());
                      return (
                        <button
                          key={accessory.id}
                          onClick={() => handleAccessoryToggle(accessory.id.toString())}
                          className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                            isSelected
                              ? "border-amber-500 bg-amber-50"
                              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 mb-1">{accessory.name}</div>
                              <div className="text-sm text-gray-600">{accessory.description || `SKU: ${accessory.sku_code}`}</div>
                            </div>
                            <Badge variant="outline" className="mr-3">{accessory.sku_code}</Badge>
                            <div
                              className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                                isSelected
                                  ? "bg-amber-500 text-white"
                                  : "border-2 border-gray-300"
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3" />}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 9. Color Temperature */}
              {productOptions.colorTemperatures.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Color Temperature</h3>
                <div className="space-y-3">
                  {productOptions.colorTemperatures.map((temp) => {
                    const ids = availableOptionIds["color_temperature"];
                    const isDisabled = Array.isArray(ids) && ids.length > 0 && !ids.includes(temp.id);
                    return (
                      <button
                        key={temp.id}
                        onClick={() => !isDisabled && handleConfigChange("colorTemperature", temp.id.toString())}
                        disabled={isDisabled}
                        className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                          currentConfig.colorTemperature === temp.id.toString()
                            ? "border-amber-500 bg-amber-50"
                            : isDisabled
                              ? "border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed"
                              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900 mb-1">{temp.name}</div>
                            {temp.description && (
                              <div className="text-sm text-gray-600">{temp.description}</div>
                            )}
                          </div>
                          <Badge variant="outline">{temp.sku_code}</Badge>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
              )}

              {/* 10. Light Output */}
              {productOptions.lightOutputs.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Light Output</h3>
                <div className="space-y-3">
                  {productOptions.lightOutputs.map((output) => {
                    const ids = availableOptionIds["light_output"];
                    const isDisabled = Array.isArray(ids) && ids.length > 0 && !ids.includes(output.id);
                    return (
                      <button
                        key={output.id}
                        onClick={() => !isDisabled && handleConfigChange("lightOutput", output.id.toString())}
                        disabled={isDisabled}
                        className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                          currentConfig.lightOutput === output.id.toString()
                            ? "border-amber-500 bg-amber-50"
                            : isDisabled
                              ? "border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed"
                              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900 mb-1">{output.name}</div>
                            {output.description && (
                              <div className="text-sm text-gray-600">{output.description}</div>
                            )}
                          </div>
                          <Badge variant="outline">{output.sku_code}</Badge>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
              )}

              {/* 11. Driver Options */}
              {productOptions.drivers.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Driver Options</h3>
                <div className="space-y-3">
                  {productOptions.drivers.map((driver) => (
                    <button
                      key={driver.id}
                      onClick={() => handleConfigChange("driver", driver.id.toString())}
                      className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                        currentConfig.driver === driver.id.toString()
                          ? "border-amber-500 bg-amber-50"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900 mb-1">{driver.name}</div>
                          <div className="text-sm text-gray-600">{driver.description}</div>
                        </div>
                        <Badge variant="outline">{driver.sku_code}</Badge>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              )}


            </div>
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
                      onClick={decrementQuantity}
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
                      onClick={incrementQuantity}
                      disabled={currentConfig.quantity >= 100}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>

                  <Button
                    onClick={addToQuote}
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
                  <Button onClick={() => setShowQuoteForm(false)} variant="outline">
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
                            setCustomerInfo((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
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
                            setCustomerInfo((prev) => ({
                              ...prev,
                              email: e.target.value,
                            }))
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
                            setCustomerInfo((prev) => ({
                              ...prev,
                              company: e.target.value,
                            }))
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
                            setCustomerInfo((prev) => ({
                              ...prev,
                              phone: e.target.value,
                            }))
                          }
                          className="bg-gray-50 border-gray-200"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4 mt-8">
                    <Button variant="outline" onClick={() => setShowQuoteForm(false)}>
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
    </div>
  );
}

export default App;
