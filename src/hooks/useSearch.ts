import { useCallback, useState } from 'react';
import { useAppState } from '../context/AppStateProvider';
import type { 
  Product, 
  ProductLine, 
  ServiceResult,
  ProductMatchCriteria,
  ProductMatchResult,
  ProductSearchOptions
} from '../services/types/ServiceTypes';

export interface UseSearchReturn {
  // State
  searchResults: Product[];
  isSearching: boolean;
  searchError: string | null;
  matchedProduct: Product | null;
  matchResult: ProductMatchResult | null;
  
  // Actions
  searchProducts: (query: string, options?: ProductSearchOptions) => Promise<ServiceResult<Product[]>>;
  findProduct: (criteria: ProductMatchCriteria) => Promise<ServiceResult<ProductMatchResult>>;
  getProductSuggestions: (query: string, productLine?: ProductLine, limit?: number) => Promise<ServiceResult<Array<{product: Product; relevance: number}>>>;
  clearSearch: () => void;
  
  // Product Access
  getProductById: (id: number) => Product | null;
  getProductBySkuCode: (skuCode: string) => Product | null;
  getProductsByLine: (productLineId: number) => Product[];
  
  // Computed values
  hasResults: boolean;
  resultCount: number;
  hasMatch: boolean;
  matchConfidence: number;
}

export const useSearch = (): UseSearchReturn => {
  const { state } = useAppState();
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [matchResult, setMatchResult] = useState<ProductMatchResult | null>(null);

  const searchProducts = useCallback(
    async (query: string, options?: ProductSearchOptions) => {
      setIsSearching(true);
      setSearchError(null);
      
      try {
        const result = await state.services.products.searchProducts(query, options);
        
        if (result.success) {
          setSearchResults(result.data || []);
        } else {
          setSearchError(result.error || 'Search failed');
          setSearchResults([]);
        }
        
        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Search failed';
        setSearchError(errorMessage);
        setSearchResults([]);
        return { success: false, error: errorMessage };
      } finally {
        setIsSearching(false);
      }
    },
    [state.services.products]
  );

  const findProduct = useCallback(
    async (criteria: ProductMatchCriteria) => {
      setIsSearching(true);
      setSearchError(null);
      
      try {
        const result = await state.services.products.findProduct(criteria);
        
        if (result.success) {
          setMatchResult(result.data || null);
        } else {
          setSearchError(result.error || 'Product search failed');
          setMatchResult(null);
        }
        
        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Product search failed';
        setSearchError(errorMessage);
        setMatchResult(null);
        return { success: false, error: errorMessage };
      } finally {
        setIsSearching(false);
      }
    },
    [state.services.products]
  );

  const getProductSuggestions = useCallback(
    async (query: string, productLine?: ProductLine, limit: number = 10) => {
      return state.services.products.getProductSuggestions(query, productLine, limit);
    },
    [state.services.products]
  );

  const clearSearch = useCallback(() => {
    setSearchResults([]);
    setSearchError(null);
    setMatchResult(null);
  }, []);

  const getProductById = useCallback(
    (id: number) => {
      return state.services.products.getProductById(id);
    },
    [state.services.products]
  );

  const getProductBySkuCode = useCallback(
    (skuCode: string) => {
      return state.services.products.getProductBySkuCode(skuCode);
    },
    [state.services.products]
  );

  const getProductsByLine = useCallback(
    (productLineId: number) => {
      return state.services.products.getProductsByLine(productLineId);
    },
    [state.services.products]
  );

  return {
    // State
    searchResults,
    isSearching,
    searchError,
    matchedProduct: matchResult?.product || null,
    matchResult,
    
    // Actions
    searchProducts,
    findProduct,
    getProductSuggestions,
    clearSearch,
    
    // Product Access
    getProductById,
    getProductBySkuCode,
    getProductsByLine,
    
    // Computed values
    hasResults: searchResults.length > 0,
    resultCount: searchResults.length,
    hasMatch: matchResult !== null,
    matchConfidence: matchResult?.confidence || 0,
  };
};