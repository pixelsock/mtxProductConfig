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
} from '../types';

export const createConfigurationSlice = (
  set: StoreSet,
  get: StoreGet
): ConfigurationSlice => ({
  // State
  currentConfig: null,
  currentProduct: null,
  currentProductLine: null,
  isAdjustingSelections: false,
  adjustmentNotifications: [],

  // Actions
  updateConfiguration: (field: keyof ProductConfig, value: any) => {
    set((state) => {
      if (!state.currentConfig) return state;

      // Handle dynamic collection fields that aren't in the ProductConfig interface
      const updatedConfig = {
        ...state.currentConfig,
        [field]: value,
      };

      // For any field not in the original interface, store it as a dynamic property
      if (!(field in state.currentConfig)) {
        (updatedConfig as any)[field] = value;
      }

      return {
        ...state,
        currentConfig: updatedConfig,
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

  resetConfiguration: async () => {
    const { currentProductLine, recomputeFiltering } = get();

    if (!currentProductLine) return;

    console.log('🔄 Resetting configuration for product line:', currentProductLine.name);

    // Create basic configuration structure
    const baseConfig: ProductConfig = {
      id: `config-${Date.now()}`,
      productLineId: currentProductLine.id,
      productLineName: currentProductLine.name,
      // Legacy fields for backward compatibility
      mirrorControls: "",
      frameColor: "",
      frameThickness: "",
      mirrorStyle: "",
      width: "24",
      height: "36",
      mounting: "",
      lighting: "",
      colorTemperature: "",
      lightOutput: "",
      driver: "",
      accessories: [],
      quantity: 1,
    };

    // Set the base configuration first
    set((state) => ({
      ...state,
      currentConfig: baseConfig,
    }));

    // Now load default options from the database and populate the configuration
    try {
      const { data: configUI, error: configError } = await supabase
        .from('configuration_ui')
        .select('*')
        .order('sort', { ascending: true });

      if (configError) {
        console.error('Failed to load configuration UI:', configError);
        return;
      }

      if (!configUI || configUI.length === 0) {
        console.warn('No configuration UI found - using base configuration');
        return;
      }

      console.log(`🔧 Loading default options for ${configUI.length} collections...`);

      // Load default options for each collection in the configuration UI
      for (const configItem of configUI) {
        try {
          // Get default options for this collection from product line
          const { data: defaultOptions, error: defaultError } = await supabase
            .from('product_lines_default_options')
            .select('*')
            .eq('product_lines_id', currentProductLine.id)
            .eq('collection', configItem.collection);

          if (defaultError || !defaultOptions || defaultOptions.length === 0) {
            console.log(`No default options for ${configItem.collection} in product line ${currentProductLine.id}`);
            continue;
          }

          // Get the allowed item IDs
          const allowedIds = defaultOptions.map(opt => parseInt(opt.item)).filter(id => !isNaN(id));
          if (allowedIds.length === 0) continue;

          // Load the first option from this collection
          const { data: collectionData, error: collectionError } = await supabase
            .from(configItem.collection)
            .select('*')
            .in('id', allowedIds)
            .order('sort', { ascending: true })
            .limit(1);

          if (collectionError) {
            // Try without active filter if column doesn't exist
            const { data: retryData, error: retryError } = await supabase
              .from(configItem.collection)
              .select('*')
              .in('id', allowedIds)
              .order('sort', { ascending: true })
              .limit(1);

            if (retryError) {
              console.warn(`Failed to load default option for ${configItem.collection}:`, retryError);
              continue;
            }

            if (retryData && retryData.length > 0) {
              const defaultOption = retryData[0];
              console.log(`✓ Setting default ${configItem.collection}: ${defaultOption.name} (ID: ${defaultOption.id})`);
              
              // Update configuration with this default selection
              set((state) => ({
                ...state,
                currentConfig: state.currentConfig ? {
                  ...state.currentConfig,
                  [configItem.collection]: defaultOption.id.toString(),
                  // Handle special cases for legacy field names
                  ...(configItem.collection === 'sizes' && defaultOption.width && defaultOption.height ? {
                    width: defaultOption.width.toString(),
                    height: defaultOption.height.toString()
                  } : {}),
                  ...(configItem.collection === 'light_directions' ? {
                    lighting: defaultOption.id.toString()
                  } : {}),
                  ...(configItem.collection === 'mounting_options' ? {
                    mounting: defaultOption.id.toString()
                  } : {})
                } : state.currentConfig
              }));
            }
          } else if (collectionData && collectionData.length > 0) {
            const defaultOption = collectionData[0];
            console.log(`✓ Setting default ${configItem.collection}: ${defaultOption.name} (ID: ${defaultOption.id})`);
            
            // Update configuration with this default selection
            set((state) => ({
              ...state,
              currentConfig: state.currentConfig ? {
                ...state.currentConfig,
                [configItem.collection]: defaultOption.id.toString(),
                // Handle special cases for legacy field names
                ...(configItem.collection === 'sizes' && defaultOption.width && defaultOption.height ? {
                  width: defaultOption.width.toString(),
                  height: defaultOption.height.toString()
                } : {}),
                ...(configItem.collection === 'light_directions' ? {
                  lighting: defaultOption.id.toString()
                } : {}),
                ...(configItem.collection === 'mounting_options' ? {
                  mounting: defaultOption.id.toString()
                } : {})
              } : state.currentConfig
            }));
          }
        } catch (error) {
          console.warn(`Failed to load default option for ${configItem.collection}:`, error);
        }
      }

      console.log('✅ Configuration initialized with database-driven defaults');

      // Apply dynamic filtering based on the populated configuration
      const { currentConfig } = get();
      if (currentConfig) {
        try {
          await recomputeFiltering(currentProductLine, currentConfig);
          console.log('✅ Dynamic filtering applied to initialized configuration');
        } catch (error) {
          console.error('❌ Failed to apply dynamic filtering:', error);
        }
      }
    } catch (error) {
      console.error('❌ Failed to initialize configuration from database:', error);
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

  validateAndAdjustSelections: async () => {
    const {
      currentConfig,
      currentProductLine,
      disabledOptionIds,
      isAdjustingSelections,
      addAdjustmentNotification
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
      const { validateCurrentSelections } = await import('../../services/selection-validator');

      // Validate current selections
      const validationResult = await validateCurrentSelections(
        currentConfig,
        currentProductLine,
        disabledOptionIds
      );

      // If adjustments needed, apply them
      if (!validationResult.isValid && validationResult.adjustedConfig) {
        const adjustments = validationResult.invalidSelections;

        // Apply the adjusted configuration
        set((state) => {
          console.log('🔄 Applying adjusted configuration:', validationResult.adjustedConfig);
          console.log('🔄 Previous config:', state.currentConfig);
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
            const getDisplayName = (field: keyof ProductConfig, value: string): string => {
              if (!productOptions) return value;

              switch (field) {
                case 'mirrorStyle':
                  return productOptions.mirrorStyles.find(opt => opt.id.toString() === value)?.name || value;
                case 'lighting':
                  return productOptions.lightingOptions.find(opt => opt.id.toString() === value)?.name || value;
                case 'frameColor':
                  return productOptions.frameColors.find(opt => opt.id.toString() === value)?.name || value;
                case 'frameThickness':
                  return productOptions.frameThickness.find(opt => opt.id.toString() === value)?.name || value;
                case 'mounting':
                  return productOptions.mountingOptions.find(opt => opt.id.toString() === value)?.name || value;
                case 'colorTemperature':
                  return productOptions.colorTemperatures.find(opt => opt.id.toString() === value)?.name || value;
                case 'lightOutput':
                  return productOptions.lightOutputs.find(opt => opt.id.toString() === value)?.name || value;
                case 'driver':
                  return productOptions.drivers.find(opt => opt.id.toString() === value)?.name || value;
                default:
                  return value;
              }
            };

            const oldDisplayName = getDisplayName(adjustment.field, adjustment.currentValue);
            const newDisplayName = getDisplayName(adjustment.field, adjustment.suggestedValue);

            addAdjustmentNotification({
              field: adjustment.field,
              oldValue: oldDisplayName,
              newValue: newDisplayName,
              reason: `Selection became ${adjustment.reason} due to dynamic filtering`,
              timestamp: Date.now()
            });
          }
        });

        if (import.meta.env.DEV) {
          console.log('🔄 Auto-adjusted selections:', {
            adjustments: adjustments.length,
            fields: adjustments.map((a) => a.field),
          });
        }

        return true; // Adjustments were made
      }

      return false; // No adjustments needed

    } catch (error) {
      console.error('❌ Failed to validate and adjust selections:', error);
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
      const recentDuplicate = state.adjustmentNotifications.find(existing =>
        existing.field === notification.field &&
        existing.oldValue === notification.oldValue &&
        existing.newValue === notification.newValue &&
        (notification.timestamp - existing.timestamp) < 1000 // Within 1 second
      );

      // If duplicate found, don't add the notification
      if (recentDuplicate) {
        return state;
      }

      return {
        ...state,
        adjustmentNotifications: [
          ...state.adjustmentNotifications,
          notification
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