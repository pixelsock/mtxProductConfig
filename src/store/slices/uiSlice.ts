/**
 * UI Slice
 *
 * Manages user interface state including modal visibility, loading indicators,
 * and UI control states. This slice handles all the visual state that doesn't
 * directly affect the product configuration logic.
 */

import { UISlice, StoreSet, StoreGet } from '../types';

export const createUISlice = (set: StoreSet, _get: StoreGet): UISlice => ({
  // State
  showQuoteForm: false,
  showFloatingBar: false,
  isLightboxOpen: false,
  lightboxIndex: 0,
  useCustomSize: false,
  canScrollLeft: false,
  canScrollRight: false,

  // Actions
  toggleQuoteForm: () => {
    set((state) => ({
      ...state,
      showQuoteForm: !state.showQuoteForm,
    }));
  },

  setQuoteFormVisible: (visible: boolean) => {
    set((state) => ({
      ...state,
      showQuoteForm: visible,
    }));
  },

  setFloatingBarVisible: (visible: boolean) => {
    set((state) => ({
      ...state,
      showFloatingBar: visible,
    }));
  },

  openLightbox: (index: number) => {
    set((state) => ({
      ...state,
      isLightboxOpen: true,
      lightboxIndex: index,
    }));
  },

  closeLightbox: () => {
    set((state) => ({
      ...state,
      isLightboxOpen: false,
      lightboxIndex: 0,
    }));
  },

  setScrollState: (left: boolean, right: boolean) => {
    set((state) => ({
      ...state,
      canScrollLeft: left,
      canScrollRight: right,
    }));
  },

  toggleCustomSize: () => {
    set((state) => ({
      ...state,
      useCustomSize: !state.useCustomSize,
    }));
  },

  setCustomSizeEnabled: (enabled: boolean) => {
    set((state) => ({
      ...state,
      useCustomSize: enabled,
    }));
  },
});
