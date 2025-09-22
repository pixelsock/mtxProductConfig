/**
 * API Slice
 *
 * Manages API data, loading states, and error handling. This slice maintains
 * the existing Supabase integration patterns and service layer calls while
 * providing centralized state management for API-related data.
 */

import { APISlice, ProductOptions, ProductConfig, ProductLine, StoreSet, StoreGet } from '../types';

export const createAPISlice = (set: StoreSet, get: StoreGet): APISlice => ({
  // State
  productOptions: null,
  availableProductLines: [],
  disabledOptionIds: {},
  isLoadingApp: true,
  isLoadingProductLine: false,
  isComputingAvailability: false,
  error: null,

  // Actions
  setProductOptions: (options: ProductOptions) => {
    set((state) => ({
      ...state,
      productOptions: options,
    }));
  },

  setAvailableProductLines: (lines: ProductLine[]) => {
    set((state) => ({
      ...state,
      availableProductLines: lines,
    }));
  },

  setDisabledOptions: (disabled: Record<string, number[]>) => {
    set((state) => ({
      ...state,
      disabledOptionIds: disabled,
    }));
  },

  setLoadingApp: (loading: boolean) => {
    set((state) => ({
      ...state,
      isLoadingApp: loading,
    }));
  },

  setLoadingProductLine: (loading: boolean) => {
    set((state) => ({
      ...state,
      isLoadingProductLine: loading,
    }));
  },

  setComputingAvailability: (computing: boolean) => {
    set((state) => ({
      ...state,
      isComputingAvailability: computing,
    }));
  },

  setError: (error: string | null) => {
    set((state) => ({
      ...state,
      error,
    }));
  },

  clearError: () => {
    set((state) => ({
      ...state,
      error: null,
    }));
  },

  // Async Actions - These will call existing service layer functions
  loadProductLineOptions: async (productLine: ProductLine) => {
    const { setLoadingProductLine, setError, setProductOptions, setDisabledOptions } = get();

    try {
      setLoadingProductLine(true);
      setError(null);

      // Import and use existing service layer functions
      const { getFilteredOptions } = await import('../../services/dynamic-filtering');
      const { supabase } = await import('../../services/supabase');

      if (import.meta.env.DEV) {
        console.log(`🔄 Loading options for ${productLine.name} using database-driven filtering...`);
      }

      // Get the properly filtered options using existing two-level approach
      const initialFilteringResult = getFilteredOptions({}, productLine.id);

      // Load option data from Supabase (same logic as original)
      const loadOptionsForCollection = async (collectionName: string, availableIds: string[]) => {
        if (availableIds.length === 0) return [];

        try {
          const { data, error } = await supabase
            .from(collectionName as any)
            .select('*')
            .in('id', availableIds.map(id => parseInt(id)))
            .eq('active', true);

          if (error) {
            console.warn(`⚠️ Failed to load ${collectionName}:`, error);
            return [];
          }

          return data || [];
        } catch (error) {
          console.warn(`⚠️ Error loading ${collectionName}:`, error);
          return [];
        }
      };

      // Load all collections in parallel (same as original)
      const [
        frameColorsData,
        frameThicknessData,
        mirrorStylesData,
        mountingOptionsData,
        lightingOptionsData,
        colorTemperaturesData,
        lightOutputsData,
        driversData,
        sizesData,
        accessoriesData
      ] = await Promise.all([
        loadOptionsForCollection('frame_colors', initialFilteringResult.available.frame_colors || []),
        loadOptionsForCollection('frame_thicknesses', initialFilteringResult.available.frame_thicknesses || []),
        loadOptionsForCollection('mirror_styles', initialFilteringResult.available.mirror_styles || []),
        loadOptionsForCollection('mounting_options', initialFilteringResult.available.mounting_options || []),
        loadOptionsForCollection('light_directions', initialFilteringResult.available.light_directions || []),
        loadOptionsForCollection('color_temperatures', initialFilteringResult.available.color_temperatures || []),
        loadOptionsForCollection('light_outputs', initialFilteringResult.available.light_outputs || []),
        loadOptionsForCollection('drivers', initialFilteringResult.available.drivers || []),
        loadOptionsForCollection('sizes', initialFilteringResult.available.sizes || []),
        loadOptionsForCollection('accessories', initialFilteringResult.available.accessories || [])
      ]);

      // Initialize disabled state (Level 1 = no disabled options)
      const initialDisabledOptions = {
        mirror_styles: [],
        light_directions: [],
        frame_thicknesses: [],
        frame_colors: [],
        mounting_options: [],
        drivers: [],
        color_temperatures: [],
        light_outputs: [],
        sizes: [],
        accessories: []
      };

      setDisabledOptions(initialDisabledOptions);

      // Transform data to ProductOptions format (same logic as original)
      const options: ProductOptions = {
        mirrorControls: [], // Table doesn't exist in database
        frameColors: frameColorsData.map(item => ({
          id: item.id as number,
          name: item.name as string,
          sku_code: item.sku_code as string,
          hex_code: (item.hex_code || "#000000") as string
        })),
        frameThickness: frameThicknessData.map(item => ({
          id: item.id as number,
          name: item.name as string,
          sku_code: item.sku_code as string
        })),
        mirrorStyles: mirrorStylesData
          .map(item => ({
            id: item.id as number,
            name: item.name as string,
            sku_code: item.sku_code as string,
            description: item.description as string
          }))
          .sort((a, b) => {
            const aa = a.sku_code ? parseInt(a.sku_code, 10) : Number.MAX_SAFE_INTEGER;
            const bb = b.sku_code ? parseInt(b.sku_code, 10) : Number.MAX_SAFE_INTEGER;
            if (Number.isNaN(aa) && Number.isNaN(bb)) return (a.sku_code || '').localeCompare(b.sku_code || '');
            if (Number.isNaN(aa)) return 1;
            if (Number.isNaN(bb)) return -1;
            return aa - bb;
          }),
        mountingOptions: mountingOptionsData.map(item => ({
          id: item.id as number,
          name: item.name as string,
          sku_code: item.sku_code as string,
          description: item.description as string
        })),
        lightingOptions: lightingOptionsData.map(item => ({
          id: item.id as number,
          name: item.name as string,
          sku_code: item.sku_code as string,
          description: item.description as string
        })),
        colorTemperatures: colorTemperaturesData.map(item => ({
          id: item.id as number,
          name: item.name as string,
          sku_code: item.sku_code as string
        })),
        lightOutputs: lightOutputsData.map(item => ({
          id: item.id as number,
          name: item.name as string,
          sku_code: item.sku_code as string
        })),
        drivers: driversData.map(item => ({
          id: item.id as number,
          name: item.name as string,
          sku_code: item.sku_code as string,
          description: item.description as string
        })),
        accessoryOptions: accessoriesData.map(item => ({
          id: item.id as number,
          name: item.name as string,
          sku_code: item.sku_code as string,
          description: (item.description || undefined) as string | undefined
        })),
        sizes: sizesData.map(item => {
          const dimensions = {
            width: item.width ? Number(item.width) : undefined,
            height: item.height ? Number(item.height) : undefined
          };
          return {
            id: item.id as number,
            name: item.name as string,
            sku_code: item.sku_code as string,
            width: dimensions.width,
            height: dimensions.height
          };
        }),
      };

      setProductOptions(options);

      // Initialize configuration with default values from loaded options
      const { resetConfiguration } = get();
      resetConfiguration();

      if (import.meta.env.DEV) {
        console.log("✓ Real product data loaded successfully");
        console.log(`✓ Loaded ${options.frameColors.length} frame colors`);
        console.log(`✓ Loaded ${options.mirrorStyles.length} mirror styles`);
        console.log(`✓ Loaded ${options.sizes.length} size options`);
        console.log("✓ Configuration initialized with default values");
      }

    } catch (error) {
      console.error(`❌ Error loading options for ${productLine.name}:`, error);
      setError(error instanceof Error ? error.message : 'Failed to load product options');
      throw error;
    } finally {
      setLoadingProductLine(false);
    }
  },

  recomputeFiltering: async (productLine: ProductLine, config: ProductConfig) => {
    const { setComputingAvailability, setDisabledOptions } = get();

    try {
      setComputingAvailability(true);

      // Import existing filtering logic
      const { getFilteredOptions } = await import('../../services/dynamic-filtering');

      // Build current selections for two-level filtering (same logic as original)
      const currentSelection: Record<string, any> = {};

      if (config.mirrorStyle) {
        currentSelection.mirror_styles = config.mirrorStyle;
      }

      console.log('🔄 Recomputing two-level filtering with selection:', currentSelection);

      // Get filtered options using existing two-level approach
      const filteringResult = getFilteredOptions(currentSelection, productLine.id);

      // Convert filtering result to expected format
      const disabledOptions = {
        mirror_styles: filteringResult.disabled.mirror_styles?.map(id => parseInt(id)) || [],
        light_directions: filteringResult.disabled.light_directions?.map(id => parseInt(id)) || [],
        frame_thicknesses: filteringResult.disabled.frame_thicknesses?.map(id => parseInt(id)) || [],
        frame_colors: filteringResult.disabled.frame_colors?.map(id => parseInt(id)) || [],
        mounting_options: filteringResult.disabled.mounting_options?.map(id => parseInt(id)) || [],
        drivers: filteringResult.disabled.drivers?.map(id => parseInt(id)) || [],
        color_temperatures: filteringResult.disabled.color_temperatures?.map(id => parseInt(id)) || [],
        light_outputs: filteringResult.disabled.light_outputs?.map(id => parseInt(id)) || [],
        sizes: filteringResult.disabled.sizes?.map(id => parseInt(id)) || [],
        accessories: filteringResult.disabled.accessories?.map(id => parseInt(id)) || []
      };

      setDisabledOptions(disabledOptions);

      console.log('✅ Two-level filtering updated:', {
        available: filteringResult.available,
        disabled: filteringResult.disabled,
        level: config.mirrorStyle ? 2 : 1
      });

      // After updating filtering, check if selections need adjustment
      const { validateAndAdjustSelections } = get();
      try {
        const adjustmentsMade = await validateAndAdjustSelections();
        if (adjustmentsMade) {
          console.log('✅ Automatic selection adjustments applied');
        }
      } catch (error) {
        console.warn('⚠️ Selection validation failed:', error);
      }

    } catch (error) {
      console.error('❌ Failed to recompute two-level filtering:', error);
    } finally {
      setComputingAvailability(false);
    }
  },
});