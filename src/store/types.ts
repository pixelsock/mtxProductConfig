/**
 * Zustand Store Types
 *
 * This file defines all TypeScript interfaces for the Zustand store slices
 * maintaining compatibility with existing types from the Supabase integration.
 */

import type { Database } from "../../supabase";

// ProductLine type fetched from Supabase product_lines table
export interface ProductLine {
  id: number;
  name: string;
  sku_code: string;
  active: boolean;
  default_options?: any;
}

// Re-export existing types from App.tsx to maintain compatibility
export interface ProductConfig {
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
  hangingTechnique: string;
  lighting: string;
  colorTemperature: string;
  lightOutput: string;
  driver: string;
  accessories: string;
  quantity: number;
}

export interface ProductOption {
  id: number;
  name: string;
  sku_code: string;
  description?: string;
  hex_code?: string;
  width?: number;
  height?: number;
  value?: string;
}

export interface ProductOptions {
  mirrorControls: ProductOption[];
  frameColors: ProductOption[];
  frameThickness: ProductOption[];
  mirrorStyles: ProductOption[];
  mountingOptions: ProductOption[];
  hangingTechniques: ProductOption[];
  lightingOptions: ProductOption[];
  colorTemperatures: ProductOption[];
  lightOutputs: ProductOption[];
  drivers: ProductOption[];
  accessoryOptions: ProductOption[];
  sizes: ProductOption[];
}

export interface CustomerInfo {
  name: string;
  email: string;
  company: string;
  phone: string;
}

// Configuration UI Type
export interface ConfigurationUIItem {
  id: string;
  collection: string;
  ui_type: string;
  sort: number;
  date_updated?: string;
}

// Supabase type aliases
export interface SupabaseFileAsset {
  id: string;
  filename_disk?: string | null;
  storage?: string | null;
}

export type DecoProduct = Database["public"]["Tables"]["products"]["Row"] & {
  vertical_image_file?: SupabaseFileAsset | null;
  horizontal_image_file?: SupabaseFileAsset | null;
  additional_images?: Array<{
    id: number;
    directus_files_id?: SupabaseFileAsset | null;
  }> | null;
  vertical_image?: string | null;
  horizontal_image?: string | null;
  applicationImage?: string | null;
};
export type FrameThickness =
  Database["public"]["Tables"]["frame_thicknesses"]["Row"];
export type MirrorStyle = Database["public"]["Tables"]["mirror_styles"]["Row"];
export type LightDirection =
  Database["public"]["Tables"]["light_directions"]["Row"];
export type MountingOption =
  Database["public"]["Tables"]["mounting_options"]["Row"];

// Selection Adjustment Types
export interface AdjustmentNotification {
  field: keyof ProductConfig;
  oldValue: string;
  newValue: string;
  reason: string;
  timestamp: number;
}

// Configuration Slice Types
export interface ConfigurationSlice {
  // State
  currentConfig: ProductConfig | null;
  currentProduct: DecoProduct | null;
  currentProductLine: ProductLine | null;
  isAdjustingSelections: boolean;
  isProcessingProductUpdate: boolean;
  adjustmentNotifications: AdjustmentNotification[];

  // Actions
  updateConfiguration: (field: keyof ProductConfig, value: any) => void;
  setCurrentProduct: (product: DecoProduct | null) => Promise<void>;
  setCurrentProductLine: (productLine: ProductLine) => void;
  resetConfiguration: () => Promise<void>;
  incrementQuantity: () => void;
  decrementQuantity: () => void;
  handleSizePresetSelect: (size: ProductOption) => void;
  validateAndAdjustSelections: () => Promise<boolean>;
  addAdjustmentNotification: (notification: AdjustmentNotification) => void;
  clearAdjustmentNotifications: () => void;

  // Computed (implemented as functions that can access get())
  isConfigurationValid: () => boolean;
  getGeneratedSKU: () => Promise<string | null>;
  generateProductName: () => string;
}

// UI Slice Types
export interface UISlice {
  // Modal States
  showQuoteForm: boolean;
  showFloatingBar: boolean;
  isLightboxOpen: boolean;
  lightboxIndex: number;

  // UI Controls
  useCustomSize: boolean;
  canScrollLeft: boolean;
  canScrollRight: boolean;

  // Actions
  toggleQuoteForm: () => void;
  setQuoteFormVisible: (visible: boolean) => void;
  setFloatingBarVisible: (visible: boolean) => void;
  openLightbox: (index: number) => void;
  closeLightbox: () => void;
  setScrollState: (left: boolean, right: boolean) => void;
  toggleCustomSize: () => void;
  setCustomSizeEnabled: (enabled: boolean) => void;
}

// API Slice Types
export interface APISlice {
  // Data
  productOptions: ProductOptions | null;
  availableProductLines: ProductLine[];
  configurationUI: ConfigurationUIItem[];
  disabledOptionIds: Record<string, number[]>;
  ruleImageOverrides: { vertical_image?: string; horizontal_image?: string };

  // Loading States
  isLoadingApp: boolean;
  isLoadingProductLine: boolean;
  isComputingAvailability: boolean;

  // Error Handling
  error: string | null;

  // Actions
  setProductOptions: (options: ProductOptions) => void;
  setAvailableProductLines: (lines: ProductLine[]) => void;
  setConfigurationUI: (configUI: ConfigurationUIItem[]) => void;
  setDisabledOptions: (disabled: Record<string, number[]>) => void;
  setRuleImageOverrides: (overrides: { vertical_image?: string; horizontal_image?: string }) => void;
  setLoadingApp: (loading: boolean) => void;
  setLoadingProductLine: (loading: boolean) => void;
  setComputingAvailability: (computing: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;

  // Async Actions (will call existing service layer)
  loadProductLineOptions: (
    productLine: ProductLine,
    forceProduct?: DecoProduct | null,
  ) => Promise<void>;
  recomputeFiltering: (
    productLine: ProductLine,
    config: ProductConfig,
  ) => Promise<void>;
}

// Quote Slice Types
export interface QuoteSlice {
  // State
  quoteItems: ProductConfig[];
  customerInfo: CustomerInfo;

  // Actions
  addToQuote: (config: ProductConfig) => void;
  removeFromQuote: (configId: string) => void;
  clearQuote: () => void;
  updateCustomerInfo: (field: keyof CustomerInfo, value: string) => void;
  setCustomerInfo: (info: CustomerInfo) => void;
  resetCustomerInfo: () => void;

  // Computed
  getTotalItems: () => number;
  getQuoteDescription: (config: ProductConfig) => string;
}

// Combined Store Type
export interface ConfiguratorStore
  extends ConfigurationSlice,
    UISlice,
    APISlice,
    QuoteSlice {}

// Store Action Parameters
export type StoreSet = (
  partial:
    | ConfiguratorStore
    | Partial<ConfiguratorStore>
    | ((
        state: ConfiguratorStore,
      ) => ConfiguratorStore | Partial<ConfiguratorStore>),
  replace?: false | undefined,
) => void;

export type StoreGet = () => ConfiguratorStore;
