/**
 * Main Zustand Store
 *
 * Combines all slices with middleware for the MTX Product Configurator.
 * This store maintains the same functionality as the original useState patterns
 * while providing centralized state management and performance optimizations.
 */

import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { useMemo } from 'react';

import { ConfiguratorStore } from './types';
import { createConfigurationSlice } from './slices/configurationSlice';
import { createUISlice } from './slices/uiSlice';
import { createAPISlice } from './slices/apiSlice';
import { createQuoteSlice } from './slices/quoteSlice';

// Create the main store with all middleware
export const useConfiguratorStore = create<ConfiguratorStore>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // Combine all slices
      ...createConfigurationSlice(set, get),
      ...createUISlice(set, get),
      ...createAPISlice(set, get),
      ...createQuoteSlice(set, get),
    })),
    {
      name: 'MTX Product Configurator', // DevTools name
      enabled: import.meta.env.DEV, // Only enable in development
    }
  )
);

// Individual selector hooks to avoid infinite loops
export const useCurrentConfig = () => useConfiguratorStore((state) => state.currentConfig);
export const useCurrentProduct = () => useConfiguratorStore((state) => state.currentProduct);
export const useCurrentProductLine = () => useConfiguratorStore((state) => state.currentProductLine);

// Grouped selectors with memoization
export const useConfigurationState = () => {
  const currentConfig = useCurrentConfig();
  const currentProduct = useCurrentProduct();
  const currentProductLine = useCurrentProductLine();

  return useMemo(() => ({
    currentConfig,
    currentProduct,
    currentProductLine,
  }), [currentConfig, currentProduct, currentProductLine]);
};

export const useShowQuoteForm = () => useConfiguratorStore((state) => state.showQuoteForm);
export const useShowFloatingBar = () => useConfiguratorStore((state) => state.showFloatingBar);
export const useIsLightboxOpen = () => useConfiguratorStore((state) => state.isLightboxOpen);
export const useLightboxIndex = () => useConfiguratorStore((state) => state.lightboxIndex);
export const useUseCustomSize = () => useConfiguratorStore((state) => state.useCustomSize);
export const useCanScrollLeft = () => useConfiguratorStore((state) => state.canScrollLeft);
export const useCanScrollRight = () => useConfiguratorStore((state) => state.canScrollRight);

export const useUIState = () => {
  const showQuoteForm = useShowQuoteForm();
  const showFloatingBar = useShowFloatingBar();
  const isLightboxOpen = useIsLightboxOpen();
  const lightboxIndex = useLightboxIndex();
  const useCustomSize = useUseCustomSize();
  const canScrollLeft = useCanScrollLeft();
  const canScrollRight = useCanScrollRight();

  return useMemo(() => ({
    showQuoteForm,
    showFloatingBar,
    isLightboxOpen,
    lightboxIndex,
    useCustomSize,
    canScrollLeft,
    canScrollRight,
  }), [showQuoteForm, showFloatingBar, isLightboxOpen, lightboxIndex, useCustomSize, canScrollLeft, canScrollRight]);
};

export const useProductOptions = () => useConfiguratorStore((state) => state.productOptions);
export const useAvailableProductLines = () => useConfiguratorStore((state) => state.availableProductLines);
export const useConfigurationUI = () => useConfiguratorStore((state) => state.configurationUI);
export const useDisabledOptionIds = () => useConfiguratorStore((state) => state.disabledOptionIds);
export const useIsLoadingApp = () => useConfiguratorStore((state) => state.isLoadingApp);
export const useIsLoadingProductLine = () => useConfiguratorStore((state) => state.isLoadingProductLine);
export const useIsComputingAvailability = () => useConfiguratorStore((state) => state.isComputingAvailability);
export const useError = () => useConfiguratorStore((state) => state.error);

export const useAPIState = () => {
  const productOptions = useProductOptions();
  const availableProductLines = useAvailableProductLines();
  const configurationUI = useConfigurationUI();
  const disabledOptionIds = useDisabledOptionIds();
  const isLoadingApp = useIsLoadingApp();
  const isLoadingProductLine = useIsLoadingProductLine();
  const isComputingAvailability = useIsComputingAvailability();
  const error = useError();

  return useMemo(() => ({
    productOptions,
    availableProductLines,
    configurationUI,
    disabledOptionIds,
    isLoadingApp,
    isLoadingProductLine,
    isComputingAvailability,
    error,
  }), [productOptions, availableProductLines, configurationUI, disabledOptionIds, isLoadingApp, isLoadingProductLine, isComputingAvailability, error]);
};

export const useQuoteItems = () => useConfiguratorStore((state) => state.quoteItems);
export const useCustomerInfo = () => useConfiguratorStore((state) => state.customerInfo);

export const useQuoteState = () => {
  const quoteItems = useQuoteItems();
  const customerInfo = useCustomerInfo();

  return useMemo(() => ({
    quoteItems,
    customerInfo,
  }), [quoteItems, customerInfo]);
};

// Action hooks for cleaner component usage
export const useConfigurationActions = () => {
  const updateConfiguration = useConfiguratorStore((state) => state.updateConfiguration);
  const setCurrentProduct = useConfiguratorStore((state) => state.setCurrentProduct);
  const setCurrentProductLine = useConfiguratorStore((state) => state.setCurrentProductLine);
  const resetConfiguration = useConfiguratorStore((state) => state.resetConfiguration);
  const incrementQuantity = useConfiguratorStore((state) => state.incrementQuantity);
  const decrementQuantity = useConfiguratorStore((state) => state.decrementQuantity);
  const handleSizePresetSelect = useConfiguratorStore((state) => state.handleSizePresetSelect);
  const handleAccessoryToggle = useConfiguratorStore((state) => state.handleAccessoryToggle);

  return useMemo(() => ({
    updateConfiguration,
    setCurrentProduct,
    setCurrentProductLine,
    resetConfiguration,
    incrementQuantity,
    decrementQuantity,
    handleSizePresetSelect,
    handleAccessoryToggle,
  }), [updateConfiguration, setCurrentProduct, setCurrentProductLine, resetConfiguration, incrementQuantity, decrementQuantity, handleSizePresetSelect, handleAccessoryToggle]);
};

export const useUIActions = () => {
  const toggleQuoteForm = useConfiguratorStore((state) => state.toggleQuoteForm);
  const setQuoteFormVisible = useConfiguratorStore((state) => state.setQuoteFormVisible);
  const setFloatingBarVisible = useConfiguratorStore((state) => state.setFloatingBarVisible);
  const openLightbox = useConfiguratorStore((state) => state.openLightbox);
  const closeLightbox = useConfiguratorStore((state) => state.closeLightbox);
  const setScrollState = useConfiguratorStore((state) => state.setScrollState);
  const toggleCustomSize = useConfiguratorStore((state) => state.toggleCustomSize);
  const setCustomSizeEnabled = useConfiguratorStore((state) => state.setCustomSizeEnabled);

  return useMemo(() => ({
    toggleQuoteForm,
    setQuoteFormVisible,
    setFloatingBarVisible,
    openLightbox,
    closeLightbox,
    setScrollState,
    toggleCustomSize,
    setCustomSizeEnabled,
  }), [toggleQuoteForm, setQuoteFormVisible, setFloatingBarVisible, openLightbox, closeLightbox, setScrollState, toggleCustomSize, setCustomSizeEnabled]);
};

export const useAPIActions = () => {
  const setProductOptions = useConfiguratorStore((state) => state.setProductOptions);
  const setAvailableProductLines = useConfiguratorStore((state) => state.setAvailableProductLines);
  const setConfigurationUI = useConfiguratorStore((state) => state.setConfigurationUI);
  const setDisabledOptions = useConfiguratorStore((state) => state.setDisabledOptions);
  const setLoadingApp = useConfiguratorStore((state) => state.setLoadingApp);
  const setLoadingProductLine = useConfiguratorStore((state) => state.setLoadingProductLine);
  const setComputingAvailability = useConfiguratorStore((state) => state.setComputingAvailability);
  const setError = useConfiguratorStore((state) => state.setError);
  const clearError = useConfiguratorStore((state) => state.clearError);
  const loadProductLineOptions = useConfiguratorStore((state) => state.loadProductLineOptions);
  const recomputeFiltering = useConfiguratorStore((state) => state.recomputeFiltering);

  return useMemo(() => ({
    setProductOptions,
    setAvailableProductLines,
    setConfigurationUI,
    setDisabledOptions,
    setLoadingApp,
    setLoadingProductLine,
    setComputingAvailability,
    setError,
    clearError,
    loadProductLineOptions,
    recomputeFiltering,
  }), [setProductOptions, setAvailableProductLines, setConfigurationUI, setDisabledOptions, setLoadingApp, setLoadingProductLine, setComputingAvailability, setError, clearError, loadProductLineOptions, recomputeFiltering]);
};

export const useQuoteActions = () => {
  const addToQuote = useConfiguratorStore((state) => state.addToQuote);
  const removeFromQuote = useConfiguratorStore((state) => state.removeFromQuote);
  const clearQuote = useConfiguratorStore((state) => state.clearQuote);
  const updateCustomerInfo = useConfiguratorStore((state) => state.updateCustomerInfo);
  const setCustomerInfo = useConfiguratorStore((state) => state.setCustomerInfo);
  const resetCustomerInfo = useConfiguratorStore((state) => state.resetCustomerInfo);

  return useMemo(() => ({
    addToQuote,
    removeFromQuote,
    clearQuote,
    updateCustomerInfo,
    setCustomerInfo,
    resetCustomerInfo,
  }), [addToQuote, removeFromQuote, clearQuote, updateCustomerInfo, setCustomerInfo, resetCustomerInfo]);
};

// Individual computed value hooks
export const useIsConfigurationValid = () => useConfiguratorStore((state) => state.isConfigurationValid);
export const useGetGeneratedSKU = () => useConfiguratorStore((state) => state.getGeneratedSKU);
export const useGenerateProductName = () => useConfiguratorStore((state) => state.generateProductName);
export const useGetTotalItems = () => useConfiguratorStore((state) => state.getTotalItems);
export const useGetQuoteDescription = () => useConfiguratorStore((state) => state.getQuoteDescription);

// Computed value hooks with memoization
export const useComputedValues = () => {
  const isConfigurationValid = useIsConfigurationValid();
  const getGeneratedSKU = useGetGeneratedSKU();
  const generateProductName = useGenerateProductName();
  const getTotalItems = useGetTotalItems();
  const getQuoteDescription = useGetQuoteDescription();

  return useMemo(() => ({
    isConfigurationValid,
    getGeneratedSKU,
    generateProductName,
    getTotalItems,
    getQuoteDescription,
  }), [isConfigurationValid, getGeneratedSKU, generateProductName, getTotalItems, getQuoteDescription]);
};

// Export the main store for direct access when needed
export { type ConfiguratorStore } from './types';