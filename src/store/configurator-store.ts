/**
 * Optimized Zustand Store for Dynamic Configurator
 * Single source of truth with fast selectors and agnostic actions
 */

import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { supabase } from '../services/supabase';

// Core types
export interface ConfigurationState {
  [collectionKey: string]: string | string[] | number;
}

export interface OptionData {
  id: number;
  name: string;
  sku_code: string;
  active: boolean;
  sort?: number;
  description?: string;
  hex_code?: string;
  width?: number;
  height?: number;
  [key: string]: any;
}

export interface CollectionData {
  [collectionKey: string]: OptionData[];
}

export interface DisabledState {
  [collectionKey: string]: number[];
}

export interface ConfiguratorStore {
  // Core state
  productLineId: number | null;
  configuration: ConfigurationState;
  collections: CollectionData;
  disabledOptions: DisabledState;
  configurationUI: Array<{
    id: string;
    collection: string;
    ui_type: string;
    sort: number;
  }>;

  // Loading states
  isLoading: boolean;
  isLoadingOptions: boolean;
  error: string | null;

  // Product data
  currentProduct: any | null;
  productImage: string | null;

  // UI state
  showQuoteForm: boolean;
  quoteItems: ConfigurationState[];
  customerInfo: {
    name: string;
    email: string;
    company: string;
    phone: string;
  };

  // Actions - agnostic of option type
  selectOption: (collectionKey: string, optionId: number | string) => void;
  selectMultipleOptions: (collectionKey: string, optionIds: (number | string)[]) => void;
  clearSelection: (collectionKey: string) => void;
  resetConfiguration: () => void;

  // State queries - agnostic of option type
  getOptionState: (collectionKey: string, optionId: number) => {
    isSelected: boolean;
    isDisabled: boolean;
    isAvailable: boolean;
  };
  getCollectionState: (collectionKey: string) => {
    selectedValue: string | string[] | null;
    availableOptions: OptionData[];
    disabledIds: number[];
    hasSelection: boolean;
  };

  // Data loading
  loadProductLine: (productLineId: number) => Promise<void>;
  refreshOptions: () => Promise<void>;

  // Quote management
  addToQuote: () => void;
  removeFromQuote: (index: number) => void;
  clearQuote: () => void;
  updateCustomerInfo: (field: string, value: string) => void;
  toggleQuoteForm: () => void;

  // Computed values
  isConfigurationComplete: () => boolean;
  getGeneratedSKU: () => string | null;
  getTotalQuoteItems: () => number;
}

export const useConfiguratorStore = create<ConfiguratorStore>()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
        // Initial state
        productLineId: null,
        configuration: {},
        collections: {},
        disabledOptions: {},
        configurationUI: [],
        isLoading: false,
        isLoadingOptions: false,
        error: null,
        currentProduct: null,
        productImage: null,
        showQuoteForm: false,
        quoteItems: [],
        customerInfo: {
          name: '',
          email: '',
          company: '',
          phone: '',
        },

        // Agnostic actions
        selectOption: (collectionKey: string, optionId: number | string) => {
          set((state) => {
            const id = typeof optionId === 'string' ? optionId : optionId.toString();
            
            // Handle multi-select collections (like accessories)
            if (collectionKey === 'accessories') {
              const current = Array.isArray(state.configuration[collectionKey]) 
                ? state.configuration[collectionKey] as string[]
                : [];
              
              if (current.includes(id)) {
                // Remove if already selected
                state.configuration[collectionKey] = current.filter(item => item !== id);
              } else {
                // Add to selection
                state.configuration[collectionKey] = [...current, id];
              }
            } else {
              // Single select
              state.configuration[collectionKey] = id;
            }
          });

          // Trigger server-side filtering update
          get().refreshOptions();
        },

        selectMultipleOptions: (collectionKey: string, optionIds: (number | string)[]) => {
          set((state) => {
            state.configuration[collectionKey] = optionIds.map(id => 
              typeof id === 'string' ? id : id.toString()
            );
          });

          get().refreshOptions();
        },

        clearSelection: (collectionKey: string) => {
          set((state) => {
            delete state.configuration[collectionKey];
          });

          get().refreshOptions();
        },

        resetConfiguration: () => {
          set((state) => {
            state.configuration = {};
            state.disabledOptions = {};
            state.currentProduct = null;
            state.productImage = null;
          });

          get().refreshOptions();
        },

        // State queries
        getOptionState: (collectionKey: string, optionId: number) => {
          const state = get();
          const config = state.configuration[collectionKey];
          const disabledIds = state.disabledOptions[collectionKey] || [];

          let isSelected = false;
          if (Array.isArray(config)) {
            isSelected = config.includes(optionId.toString());
          } else {
            isSelected = config === optionId.toString();
          }

          return {
            isSelected,
            isDisabled: disabledIds.includes(optionId),
            isAvailable: !disabledIds.includes(optionId),
          };
        },

        getCollectionState: (collectionKey: string) => {
          const state = get();
          const selectedValue = state.configuration[collectionKey] || null;
          const availableOptions = state.collections[collectionKey] || [];
          const disabledIds = state.disabledOptions[collectionKey] || [];

          return {
            selectedValue,
            availableOptions,
            disabledIds,
            hasSelection: selectedValue !== null && selectedValue !== undefined,
          };
        },

        // Data loading
        loadProductLine: async (productLineId: number) => {
          set((state) => {
            state.isLoading = true;
            state.error = null;
            state.productLineId = productLineId;
          });

          try {
            // Call server-side function to get all data
            const { data, error } = await supabase.rpc('get_configurator_data', {
              p_product_line_id: productLineId
            });

            if (error) throw error;

            set((state) => {
              state.collections = data.collections || {};
              state.configurationUI = data.configurationUI || [];
              state.disabledOptions = data.disabledOptions || {};
              state.isLoading = false;
            });

            // Initialize with default selections
            get().initializeDefaults();

          } catch (error) {
            console.error('Failed to load product line:', error);
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Failed to load data';
              state.isLoading = false;
            });
          }
        },

        refreshOptions: async () => {
          const state = get();
          if (!state.productLineId) return;

          set((state) => {
            state.isLoadingOptions = true;
          });

          try {
            // Get filtered options based on current configuration
            const { data, error } = await supabase.rpc('get_filtered_options', {
              p_product_line_id: state.productLineId,
              p_current_selections: state.configuration
            });

            if (error) throw error;

            set((state) => {
              state.collections = data.collections || state.collections;
              state.disabledOptions = data.disabledOptions || {};
              state.currentProduct = data.currentProduct || null;
              state.productImage = data.productImage || null;
              state.isLoadingOptions = false;
            });

          } catch (error) {
            console.error('Failed to refresh options:', error);
            set((state) => {
              state.isLoadingOptions = false;
            });
          }
        },

        // Initialize with first available option for each collection
        initializeDefaults: () => {
          const state = get();
          const newConfig: ConfigurationState = {};

          Object.entries(state.collections).forEach(([collectionKey, options]) => {
            if (options.length > 0) {
              // Select first available option
              newConfig[collectionKey] = options[0].id.toString();
            }
          });

          set((state) => {
            state.configuration = newConfig;
          });

          get().refreshOptions();
        },

        // Quote management
        addToQuote: () => {
          const state = get();
          if (!state.configuration || Object.keys(state.configuration).length === 0) return;

          set((state) => {
            state.quoteItems = [...state.quoteItems, { ...state.configuration }];
          });
        },

        removeFromQuote: (index: number) => {
          set((state) => {
            state.quoteItems = state.quoteItems.filter((_, i) => i !== index);
          });
        },

        clearQuote: () => {
          set((state) => {
            state.quoteItems = [];
          });
        },

        updateCustomerInfo: (field: string, value: string) => {
          set((state) => {
            (state.customerInfo as any)[field] = value;
          });
        },

        toggleQuoteForm: () => {
          set((state) => {
            state.showQuoteForm = !state.showQuoteForm;
          });
        },

        // Computed values
        isConfigurationComplete: () => {
          const state = get();
          const requiredCollections = Object.keys(state.collections).filter(
            key => state.collections[key].length > 1 // Only require selection if multiple options
          );

          return requiredCollections.every(
            key => state.configuration[key] !== undefined
          );
        },

        getGeneratedSKU: () => {
          const state = get();
          if (!state.currentProduct) return null;
          return state.currentProduct.name || null;
        },

        getTotalQuoteItems: () => {
          return get().quoteItems.length;
        },
      }))
    ),
    {
      name: 'configurator-store',
      enabled: import.meta.env.DEV,
    }
  )
);

// Optimized selectors to prevent unnecessary re-renders
export const useConfiguration = () => useConfiguratorStore((state) => state.configuration);
export const useCollections = () => useConfiguratorStore((state) => state.collections);
export const useDisabledOptions = () => useConfiguratorStore((state) => state.disabledOptions);
export const useConfigurationUI = () => useConfiguratorStore((state) => state.configurationUI);
export const useIsLoading = () => useConfiguratorStore((state) => state.isLoading);
export const useCurrentProduct = () => useConfiguratorStore((state) => state.currentProduct);
export const useProductImage = () => useConfiguratorStore((state) => state.productImage);

// Action selectors
export const useConfiguratorActions = () => useConfiguratorStore((state) => ({
  selectOption: state.selectOption,
  clearSelection: state.clearSelection,
  resetConfiguration: state.resetConfiguration,
  loadProductLine: state.loadProductLine,
  refreshOptions: state.refreshOptions,
  getOptionState: state.getOptionState,
  getCollectionState: state.getCollectionState,
}));

export const useQuoteActions = () => useConfiguratorStore((state) => ({
  addToQuote: state.addToQuote,
  removeFromQuote: state.removeFromQuote,
  clearQuote: state.clearQuote,
  updateCustomerInfo: state.updateCustomerInfo,
  toggleQuoteForm: state.toggleQuoteForm,
}));