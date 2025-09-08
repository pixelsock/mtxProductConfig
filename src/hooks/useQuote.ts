import { useCallback } from 'react';
import { useConfiguration } from '../context/ConfigurationProvider';
import { useAppState } from '../context/AppStateProvider';
import type { ProductConfiguration, ServiceResult } from '../services/types/ServiceTypes';

export interface QuoteData {
  configurations: ProductConfiguration[];
  customerInfo?: {
    name: string;
    email: string;
    company?: string;
    phone?: string;
  };
  totalItems: number;
  createdAt: string;
  id: string;
}

export interface UseQuoteReturn {
  // State
  quoteItems: ProductConfiguration[];
  showQuoteForm: boolean;
  
  // Actions
  addToQuote: () => void;
  removeFromQuote: (configId: string) => void;
  clearQuote: () => void;
  showQuote: () => void;
  hideQuote: () => void;
  exportQuote: (customerInfo?: QuoteData['customerInfo']) => Promise<ServiceResult<QuoteData>>;
  
  // Computed values
  itemCount: number;
  isEmpty: boolean;
  hasItems: boolean;
  canExport: boolean;
}

export const useQuote = (): UseQuoteReturn => {
  const { quoteItems, addToQuote, removeFromQuote, clearQuote } = useConfiguration();
  const { state, showQuoteForm: showForm, hideQuoteForm } = useAppState();

  const showQuote = useCallback(() => {
    showForm();
  }, [showForm]);

  const hideQuote = useCallback(() => {
    hideQuoteForm();
  }, [hideQuoteForm]);

  const exportQuote = useCallback(
    async (customerInfo?: QuoteData['customerInfo']): Promise<ServiceResult<QuoteData>> => {
      if (quoteItems.length === 0) {
        return { success: false, error: 'No items in quote' };
      }

      try {
        const quoteData: QuoteData = {
          configurations: quoteItems,
          customerInfo,
          totalItems: quoteItems.length,
          createdAt: new Date().toISOString(),
          id: `quote-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        };

        // Generate quote export
        const jsonData = JSON.stringify(quoteData, null, 2);
        
        // Create and trigger download
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `quote-${quoteData.id}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        return { success: true, data: quoteData };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to export quote';
        return { success: false, error: errorMessage };
      }
    },
    [quoteItems]
  );

  return {
    // State
    quoteItems,
    showQuoteForm: state.showQuoteForm,
    
    // Actions
    addToQuote,
    removeFromQuote,
    clearQuote,
    showQuote,
    hideQuote,
    exportQuote,
    
    // Computed values
    itemCount: quoteItems.length,
    isEmpty: quoteItems.length === 0,
    hasItems: quoteItems.length > 0,
    canExport: quoteItems.length > 0,
  };
};