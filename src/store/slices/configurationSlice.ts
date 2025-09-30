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
  AdjustmentNotification,
} from "../types";
import { generateSku } from "@/services/sku-generator";

export const createConfigurationSlice = (
  set: StoreSet,
  get: StoreGet,
): ConfigurationSlice => ({
  // State
  currentConfig: null,
  currentProduct: null,
  currentProductLine: null,
  isAdjustingSelections: false,
  isProcessingProductUpdate: false,
  adjustmentNotifications: [],

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

  setCurrentProduct: async (product: DecoProduct | null) => {
    const currentState = get();

    // Prevent unnecessary updates if the product hasn't actually changed
    if (currentState.currentProduct?.id === product?.id) {
      return;
    }

    set((state) => ({
      ...state,
      currentProduct: product,
    }));

    // When a specific product is selected, reload options with product-specific overrides
    // BUT avoid triggering during selection adjustments or repeated calls to prevent infinite loops
    const { isAdjustingSelections, isProcessingProductUpdate } = get();
    if (product && !isAdjustingSelections && !isProcessingProductUpdate) {
      const { recomputeFiltering, currentProductLine, currentConfig, setProductOptions } = get();
      if (currentProductLine && currentConfig) {
        console.log(
          `🔄 Product selected (${product.id}), reloading options with overrides...`,
        );

        // Set flag to prevent re-entry
        set((state) => ({ ...state, isProcessingProductUpdate: true }));

        try {
          // Reload product options with product-specific overrides
          const { fetchProductOptions } = await import('../../services/product-options');
          const options = await fetchProductOptions(currentProductLine.id, product.id);
          setProductOptions(options);

          // Then recompute filtering with the new options
          await recomputeFiltering(currentProductLine, currentConfig);
          console.log("✅ Product-specific overrides applied");
        } catch (error) {
          console.error(
            "❌ Failed to apply product-specific overrides:",
            error,
          );
        } finally {
          // Clear the flag
          set((state) => ({ ...state, isProcessingProductUpdate: false }));
        }
      }
    }
  },

  setCurrentProductLine: (productLine: ProductLine) => {
    set((state) => ({
      ...state,
      currentProductLine: productLine,
    }));
  },

  resetConfiguration: async () => {
    const { currentProductLine, productOptions, recomputeFiltering } = get();

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
      hangingTechnique: productOptions.hangingTechniques[0]?.id.toString() || "",
      lighting: productOptions.lightingOptions[0]?.id.toString() || "",
      colorTemperature:
        productOptions.colorTemperatures[0]?.id.toString() || "",
      lightOutput: productOptions.lightOutputs[0]?.id.toString() || "",
      driver: productOptions.drivers[0]?.id.toString() || "",
      accessories: productOptions.accessoryOptions[0]?.id.toString() || "",
      quantity: 1,
    };

    // Set the initial configuration
    set((state) => ({
      ...state,
      currentConfig: initialConfig,
    }));

    console.log(
      "🔄 Initial configuration set, applying dynamic filtering and validation...",
    );

    // Apply dynamic filtering based on the initial configuration
    try {
      await recomputeFiltering(currentProductLine, initialConfig);
      console.log(
        "✅ Initial configuration dynamic filtering and validation complete",
      );

      // Set initial product after configuration is fully initialized
      const finalConfig = get().currentConfig;
      if (finalConfig && productOptions) {
        try {
          const { findBestMatchingProduct } = await import('../../services/product-matcher');

          const frameThickness = productOptions.frameThickness?.find(
            (ft: any) => ft.id.toString() === finalConfig.frameThickness
          );

          const mirrorStyle = productOptions.mirrorStyles?.find(
            (ms: any) => ms.id.toString() === finalConfig.mirrorStyle
          );

          const lightDirection = productOptions.lightingOptions?.find(
            (ld: any) => ld.id.toString() === finalConfig.lighting
          );

          if (mirrorStyle && lightDirection) {
            const product = await findBestMatchingProduct({
              productLineId: finalConfig.productLineId,
              mirrorStyleId: mirrorStyle.id,
              lightDirectionId: lightDirection.id,
              frameThicknessId: frameThickness?.id
            });

            if (product) {
              const { setCurrentProduct } = get();
              setCurrentProduct(product);
              console.log('✅ Initial product set:', product.name);
            }
          }
        } catch (productError) {
          console.error('❌ Failed to set initial product:', productError);
        }
      }
    } catch (error) {
      console.error("❌ Failed to apply initial dynamic filtering:", error);
    }
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

  // Removed handleAccessoryToggle - accessories is now single-select using updateConfiguration

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

  getGeneratedSKU: async () => {
    const { currentConfig, currentProduct, productOptions } = get();
    if (!currentConfig || !currentProduct || !productOptions) return null;

    try {
      const sku = await generateSku(currentProduct, currentConfig, productOptions);
      return sku || null;
    } catch (error) {
      console.error('Error in getGeneratedSKU:', error);
      // Fallback to product name if SKU generation fails
      return currentProduct.name || null;
    }
  },

  generateProductName: () => {
    const { currentConfig } = get();
    if (!currentConfig) return `quote-item-${Date.now()}`;

    const { productLineName, frameThickness, mirrorStyle, width, height } =
      currentConfig;

    // Generate codes for specific options (same logic as original)
    const mirrorStyleCode = mirrorStyle === "Rectangle" ? "R" : "O";
    const lightingCode = currentConfig.lightOutput ? "L" : "";

    return `${productLineName}-${frameThickness}-${mirrorStyleCode}${lightingCode}-${width}x${height}`;
  },

  validateAndAdjustSelections: async () => {
    const {
      currentConfig,
      currentProductLine,
      disabledOptionIds,
      isAdjustingSelections,
      addAdjustmentNotification,
    } = get();

    // Prevent cascading adjustments
    if (isAdjustingSelections || !currentConfig || !currentProductLine) {
      return false;
    }

    try {
      // Set adjustment in progress
      set((state) => ({
        ...state,
        isAdjustingSelections: true,
      }));

      // Import validation service
      const { validateCurrentSelections } = await import(
        "../../services/selection-validator"
      );

      // Validate current selections
      const validationResult = await validateCurrentSelections(
        currentConfig,
        currentProductLine,
        disabledOptionIds,
      );

      // If adjustments needed, apply them
      if (!validationResult.isValid && validationResult.adjustedConfig) {
        const adjustments = validationResult.invalidSelections;

        // Apply the adjusted configuration
        set((state) => {
          console.log(
            "🔄 Applying adjusted configuration:",
            validationResult.adjustedConfig,
          );
          console.log("🔄 Previous config:", state.currentConfig);
          return {
            ...state,
            currentConfig: validationResult.adjustedConfig,
          };
        });

        // Add notifications for each adjustment
        adjustments.forEach((adjustment) => {
          if (adjustment.suggestedValue) {
            // Get display names for the values
            const { productOptions } = get();
            const getDisplayName = (
              field: keyof ProductConfig,
              value: string,
            ): string => {
              if (!productOptions) return value;

              switch (field) {
                case "mirrorStyle":
                  return (
                    productOptions.mirrorStyles.find(
                      (opt) => opt.id.toString() === value,
                    )?.name || value
                  );
                case "lighting":
                  return (
                    productOptions.lightingOptions.find(
                      (opt) => opt.id.toString() === value,
                    )?.name || value
                  );
                case "frameColor":
                  return (
                    productOptions.frameColors.find(
                      (opt) => opt.id.toString() === value,
                    )?.name || value
                  );
                case "frameThickness":
                  return (
                    productOptions.frameThickness.find(
                      (opt) => opt.id.toString() === value,
                    )?.name || value
                  );
                case "mounting":
                  return (
                    productOptions.mountingOptions.find(
                      (opt) => opt.id.toString() === value,
                    )?.name || value
                  );
                case "colorTemperature":
                  return (
                    productOptions.colorTemperatures.find(
                      (opt) => opt.id.toString() === value,
                    )?.name || value
                  );
                case "lightOutput":
                  return (
                    productOptions.lightOutputs.find(
                      (opt) => opt.id.toString() === value,
                    )?.name || value
                  );
                case "driver":
                  return (
                    productOptions.drivers.find(
                      (opt) => opt.id.toString() === value,
                    )?.name || value
                  );
                default:
                  return value;
              }
            };

            const oldDisplayName = getDisplayName(
              adjustment.field,
              adjustment.currentValue,
            );
            const newDisplayName = getDisplayName(
              adjustment.field,
              adjustment.suggestedValue,
            );

            addAdjustmentNotification({
              field: adjustment.field,
              oldValue: oldDisplayName,
              newValue: newDisplayName,
              reason: `Selection became ${adjustment.reason} due to dynamic filtering`,
              timestamp: Date.now(),
            });
          }
        });

        if (import.meta.env.DEV) {
          console.log("🔄 Auto-adjusted selections:", {
            adjustments: adjustments.length,
            fields: adjustments.map((a) => a.field),
          });
        }

        return true; // Adjustments were made
      }

      return false; // No adjustments needed
    } catch (error) {
      console.error("❌ Failed to validate and adjust selections:", error);
      return false;
    } finally {
      // Clear adjustment flag
      set((state) => ({
        ...state,
        isAdjustingSelections: false,
      }));
    }
  },

  addAdjustmentNotification: (notification: AdjustmentNotification) => {
    set((state) => {
      // Check for duplicate notifications (same field and values within last 1 second)
      const recentDuplicate = state.adjustmentNotifications.find(
        (existing) =>
          existing.field === notification.field &&
          existing.oldValue === notification.oldValue &&
          existing.newValue === notification.newValue &&
          notification.timestamp - existing.timestamp < 1000, // Within 1 second
      );

      // If duplicate found, don't add the notification
      if (recentDuplicate) {
        return state;
      }

      return {
        ...state,
        adjustmentNotifications: [
          ...state.adjustmentNotifications,
          notification,
        ].slice(-5), // Keep only last 5 notifications
      };
    });
  },

  clearAdjustmentNotifications: () => {
    set((state) => ({
      ...state,
      adjustmentNotifications: [],
    }));
  },
});
