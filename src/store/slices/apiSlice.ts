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

      const { setCurrentProductLine, resetConfiguration } = get();
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
    const { setComputingAvailability, setDisabledOptions } = get();

    try {
      setComputingAvailability(true);

      const { applyRulesComplete } = await import(
        '../../services/rules-ui-integration'
      );

      const result = await applyRulesComplete(config, productLine.id);
      setDisabledOptions(result.disabledOptions || {});
    } catch (error) {
      console.error('❌ Failed to recompute filtering:', error);
    } finally {
      setComputingAvailability(false);
    }
  },
});

