/**
 * Configuration Slice
 *
 * Manages the core product configuration state including current selections,
 * product details, and configuration validation. This slice maintains the
 * same logic patterns as the original useState implementation.
 */

import {
  ConfigurationSlice,
  ProductConfig,
  ProductOption,
  ProductLine,
  StoreSet,
  StoreGet,
  DecoProduct,
} from '../types';

export const createConfigurationSlice = (
  set: StoreSet,
  get: StoreGet
): ConfigurationSlice => ({
  // State
  currentConfig: null,
  currentProduct: null,
  currentProductLine: null,

  // Actions
  updateConfiguration: (field: keyof ProductConfig, value: any) => {
    set((state) => {
      if (!state.currentConfig) return state;

      return {
        ...state,
        currentConfig: {
          ...state.currentConfig,
          [field]: value,
        },
      };
    });
  },

  setCurrentProduct: (product: DecoProduct | null) => {
    set((state) => ({
      ...state,
      currentProduct: product,
    }));
  },

  setCurrentProductLine: (productLine: ProductLine) => {
    set((state) => ({
      ...state,
      currentProductLine: productLine,
    }));
  },

  resetConfiguration: () => {
    const { currentProductLine, productOptions } = get();

    if (!currentProductLine || !productOptions) return;

    // Create new configuration with defaults (same logic as original)
    const defaultSize = productOptions.sizes[0];

    const initialConfig: ProductConfig = {
      id: `config-${Date.now()}`,
      productLineId: currentProductLine.id,
      productLineName: currentProductLine.name,
      mirrorControls: productOptions.mirrorControls[0]?.id.toString() || "",
      frameColor: productOptions.frameColors[0]?.id.toString() || "",
      frameThickness: productOptions.frameThickness[0]?.id.toString() || "",
      mirrorStyle: productOptions.mirrorStyles[0]?.id.toString() || "",
      width: defaultSize?.width?.toString() || "24",
      height: defaultSize?.height?.toString() || "36",
      mounting: productOptions.mountingOptions[0]?.id.toString() || "",
      lighting: productOptions.lightingOptions[0]?.id.toString() || "",
      colorTemperature: productOptions.colorTemperatures[0]?.id.toString() || "",
      lightOutput: productOptions.lightOutputs[0]?.id.toString() || "",
      driver: productOptions.drivers[0]?.id.toString() || "",
      accessories: [],
      quantity: 1,
    };

    set((state) => ({
      ...state,
      currentConfig: initialConfig,
    }));
  },

  incrementQuantity: () => {
    set((state) => {
      if (!state.currentConfig) return state;

      return {
        ...state,
        currentConfig: {
          ...state.currentConfig,
          quantity: Math.min((state.currentConfig.quantity || 1) + 1, 100),
        },
      };
    });
  },

  decrementQuantity: () => {
    set((state) => {
      if (!state.currentConfig) return state;

      return {
        ...state,
        currentConfig: {
          ...state.currentConfig,
          quantity: Math.max((state.currentConfig.quantity || 1) - 1, 1),
        },
      };
    });
  },

  handleSizePresetSelect: (size: ProductOption) => {
    set((state) => {
      if (!state.currentConfig) return state;

      return {
        ...state,
        currentConfig: {
          ...state.currentConfig,
          width: size.width?.toString() || "",
          height: size.height?.toString() || "",
        },
      };
    });
  },

  handleAccessoryToggle: (accessoryId: string) => {
    set((state) => {
      if (!state.currentConfig) return state;

      const accessories = [...(state.currentConfig.accessories || [])];
      const index = accessories.indexOf(accessoryId);

      if (index > -1) {
        accessories.splice(index, 1);
      } else {
        accessories.push(accessoryId);
      }

      return {
        ...state,
        currentConfig: {
          ...state.currentConfig,
          accessories,
        },
      };
    });
  },

  // Computed functions (accessing current state)
  isConfigurationValid: () => {
    const { currentConfig } = get();
    if (!currentConfig) return false;

    // Basic validation - ensure required fields are present
    return !!(
      currentConfig.frameColor &&
      currentConfig.frameThickness &&
      currentConfig.mirrorStyle &&
      currentConfig.width &&
      currentConfig.height &&
      currentConfig.mounting &&
      currentConfig.lighting
    );
  },

  getGeneratedSKU: () => {
    const { currentConfig, currentProduct } = get();
    if (!currentConfig || !currentProduct) return null;

    // This would integrate with existing SKU generation logic
    // For now, return the product name as a placeholder
    return currentProduct.name || null;
  },

  generateProductName: () => {
    const { currentConfig } = get();
    if (!currentConfig) return `quote-item-${Date.now()}`;

    const { productLineName, frameThickness, mirrorStyle, width, height } = currentConfig;

    // Generate codes for specific options (same logic as original)
    const mirrorStyleCode = mirrorStyle === "Rectangle" ? "R" : "O";
    const lightingCode = currentConfig.lightOutput ? "L" : "";

    return `${productLineName}-${frameThickness}-${mirrorStyleCode}${lightingCode}-${width}x${height}`;
  },
});