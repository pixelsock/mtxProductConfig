import {
  APISlice,
  ProductOptions,
  ProductConfig,
  ProductLine,
  ConfigurationUIItem,
  StoreSet,
  StoreGet,
} from '../types';

const emptyProductOptions: ProductOptions = {
  mirrorControls: [],
  frameColors: [],
  frameThickness: [],
  mirrorStyles: [],
  mountingOptions: [],
  hangingTechniques: [],
  lightingOptions: [],
  colorTemperatures: [],
  lightOutputs: [],
  drivers: [],
  accessoryOptions: [],
  sizes: [],
};

export const createAPISlice = (set: StoreSet, get: StoreGet): APISlice => ({
  productOptions: null,
  availableProductLines: [],
  configurationUI: [],
  disabledOptionIds: {},
  ruleImageOverrides: {},
  isLoadingApp: true,
  isLoadingProductLine: false,
  isComputingAvailability: false,
  error: null,

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

  setConfigurationUI: (configUI: ConfigurationUIItem[]) => {
    set((state) => ({
      ...state,
      configurationUI: configUI,
    }));
  },

  setDisabledOptions: (disabled: Record<string, number[]>) => {
    set((state) => ({
      ...state,
      disabledOptionIds: disabled,
    }));
  },

  setRuleImageOverrides: (overrides: { vertical_image?: string; horizontal_image?: string }) => {
    set((state) => ({
      ...state,
      ruleImageOverrides: overrides,
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

  loadProductLineOptions: async (
    productLine: ProductLine,
    _forceProduct?: unknown,
  ) => {
    const {
      setLoadingProductLine,
      setError,
      setProductOptions,
      setDisabledOptions,
    } = get();

    try {
      setLoadingProductLine(true);
      setError(null);

      const { fetchProductOptions } = await import('../../services/product-options');
      const options = await fetchProductOptions(productLine.id);

      setProductOptions(options);
      setDisabledOptions({});

      const { setCurrentProductLine, resetConfiguration, setRuleImageOverrides } = get();
      setRuleImageOverrides({}); // Clear any previous image overrides
      setCurrentProductLine(productLine);
      await resetConfiguration();

      if (import.meta.env.DEV) {
        console.log(`✓ Loaded product options for ${productLine.name}`);
      }
    } catch (error) {
      console.error(`❌ Error loading options for ${productLine.name}:`, error);
      setProductOptions(emptyProductOptions);
      setDisabledOptions({});
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to load product options',
      );
      throw error;
    } finally {
      setLoadingProductLine(false);
    }
  },

  recomputeFiltering: async (
    productLine: ProductLine,
    config: ProductConfig,
  ) => {
    const { setComputingAvailability, setDisabledOptions, updateConfiguration, validateAndAdjustSelections, productOptions } = get();

    try {
      setComputingAvailability(true);

      // Import once at the start
      const { computeProductAvailability, computeUnavailableOptions } = await import(
        '../../services/product-availability'
      );
      const { applyRulesComplete } = await import(
        '../../services/rules-ui-integration'
      );

      // Iterative recomputation: Keep adjusting until config is stable
      // This ensures that when a selection becomes invalid due to dynamic filtering,
      // we auto-adjust it and then recompute with the new value
      const MAX_ITERATIONS = 3;
      let iteration = 0;
      let configStabilized = false;
      let currentConfig = config;

      while (!configStabilized && iteration < MAX_ITERATIONS) {
        iteration++;

        if (import.meta.env.DEV && iteration > 1) {
          console.log(`🔄 Iteration ${iteration}: Recomputing with adjusted config`);
        }

        // Step 1: Compute product availability (dynamic filtering)
        const availability = await computeProductAvailability(productLine.id, currentConfig);

        // Convert available options to disabled options (unavailable = disabled)
        const unavailableFromProducts = productOptions
          ? computeUnavailableOptions(availability.availableOptions, productOptions as any)
          : {};

        if (import.meta.env.DEV) {
          console.log('🔍 Product Availability:', {
            iteration,
            matchingProducts: availability.matchingProductCount,
            unavailable: unavailableFromProducts,
          });
        }

        // Step 2: Apply rules
        const rulesResult = await applyRulesComplete(currentConfig, productLine.id);

        // Step 3: Merge disabled options from both sources
        // Rules take precedence over availability (rules can force values)
        const mergedDisabled: Record<string, number[]> = { ...unavailableFromProducts };

        for (const [collection, disabledIds] of Object.entries(rulesResult.disabledOptions)) {
          if (collection.endsWith('_rule_set')) {
            // Rule-set values override everything
            mergedDisabled[collection] = disabledIds;
          } else {
            // Merge direct disabled lists (union of both sources)
            const existing = mergedDisabled[collection] || [];
            mergedDisabled[collection] = Array.from(
              new Set([...existing, ...disabledIds])
            );
          }
        }

        if (import.meta.env.DEV) {
          console.log('⚙️ Merged Disabled Options:', mergedDisabled);
        }

        // Apply merged disabled options
        setDisabledOptions(mergedDisabled);

        // Step 3.5: Apply rule image overrides
        const { setRuleImageOverrides } = get();
        if (rulesResult.imageOverrides && (rulesResult.imageOverrides.vertical_image || rulesResult.imageOverrides.horizontal_image)) {
          if (import.meta.env.DEV) {
            console.log('⚙️ Applying rule image overrides:', rulesResult.imageOverrides);
          }
          setRuleImageOverrides(rulesResult.imageOverrides);
        } else {
          // Clear image overrides if no rules set them
          setRuleImageOverrides({});
        }

        // Step 4: Apply rule-set values to configuration automatically
        let ruleChangedConfig = false;
        if (rulesResult.setValues && Object.keys(rulesResult.setValues).length > 0) {
          if (import.meta.env.DEV) {
            console.log('⚙️ Applying rule-set values to configuration:', rulesResult.setValues);
          }

          for (const [field, value] of Object.entries(rulesResult.setValues)) {
            updateConfiguration(field as any, value.toString());
          }
          ruleChangedConfig = true;
        }

        // Step 5: Check if any current selections are now disabled and need adjustment
        // This is the key fix: validate WITHIN the loop, not just at the end
        const configBeforeValidation = get().currentConfig;
        await validateAndAdjustSelections();
        const configAfterValidation = get().currentConfig;

        // Check if anything changed (either by rules or by validation)
        const somethingChanged = ruleChangedConfig ||
          JSON.stringify(configBeforeValidation) !== JSON.stringify(configAfterValidation);

        if (somethingChanged) {
          // Config changed, need another iteration with the new config
          currentConfig = get().currentConfig!;
          configStabilized = false;

          if (import.meta.env.DEV) {
            console.log('🔄 Config changed, will iterate again');
          }
        } else {
          // Config is stable, we're done
          configStabilized = true;

          if (import.meta.env.DEV) {
            console.log('✅ Config stabilized after', iteration, 'iteration(s)');
          }
        }
      }

      if (iteration >= MAX_ITERATIONS && !configStabilized) {
        console.warn('⚠️ Max iterations reached without config stabilization');
      }
    } catch (error) {
      console.error('❌ Failed to recompute filtering:', error);
    } finally {
      setComputingAvailability(false);
    }
  },
});

