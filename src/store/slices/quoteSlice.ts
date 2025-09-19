/**
 * Quote Slice
 *
 * Manages quote-related state including quote items, customer information,
 * and quote management actions. This slice handles all functionality related
 * to building and managing product quotes.
 */

import { QuoteSlice, ProductConfig, CustomerInfo, StoreSet, StoreGet } from '../types';

export const createQuoteSlice = (set: StoreSet, get: StoreGet): QuoteSlice => ({
  // State
  quoteItems: [],
  customerInfo: {
    name: "",
    email: "",
    company: "",
    phone: "",
  },

  // Actions
  addToQuote: (config: ProductConfig) => {
    const { generateProductName } = get();

    set((state) => ({
      ...state,
      quoteItems: [
        ...state.quoteItems,
        {
          ...config,
          id: generateProductName(),
        },
      ],
    }));
  },

  removeFromQuote: (configId: string) => {
    set((state) => ({
      ...state,
      quoteItems: state.quoteItems.filter((item) => item.id !== configId),
    }));
  },

  clearQuote: () => {
    set((state) => ({
      ...state,
      quoteItems: [],
    }));
  },

  updateCustomerInfo: (field: keyof CustomerInfo, value: string) => {
    set((state) => ({
      ...state,
      customerInfo: {
        ...state.customerInfo,
        [field]: value,
      },
    }));
  },

  setCustomerInfo: (info: CustomerInfo) => {
    set((state) => ({
      ...state,
      customerInfo: info,
    }));
  },

  resetCustomerInfo: () => {
    set((state) => ({
      ...state,
      customerInfo: {
        name: "",
        email: "",
        company: "",
        phone: "",
      },
    }));
  },

  // Computed functions
  getTotalItems: () => {
    const { quoteItems } = get();
    return quoteItems.reduce((total, item) => total + (item.quantity || 1), 0);
  },

  getQuoteDescription: (config: ProductConfig) => {
    const { productOptions } = get();
    if (!productOptions) return "";

    const frameThickness = productOptions.frameThickness.find(
      (c) => c.id.toString() === config.frameThickness
    )?.name;
    const mounting = productOptions.mountingOptions.find(
      (m) => m.id.toString() === config.mounting
    )?.name;

    return `${config.productLineName} ${frameThickness || ""} ${mounting || ""} ${config.width}"×${config.height}"`;
  },
});