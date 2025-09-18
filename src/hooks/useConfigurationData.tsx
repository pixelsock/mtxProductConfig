import { useState, useEffect } from 'react';
import { supabaseClient } from '../utils/supabase/client';
import { simplifiedDirectSupabaseClient } from '../utils/supabase/directClientSimplified';
import { toast } from 'sonner';
import { 
  ConfiguratorProductLine, 
  ConfiguratorOption, 
  ConfigurationState,
  ConfigurationUIItem,
  ProcessedRule 
} from '../types/database';

// Legacy interface for backward compatibility
interface LegacyConfigurationOption {
  id: string;
  label: string;
  value: string;
  count: number;
  sampleSkus: string[];
  skuDetails?: any[];
  displayName?: string;
  description?: string;
}

interface LegacyConfigurationOptions {
  frameColors: LegacyConfigurationOption[];
  sizes: LegacyConfigurationOption[];
  lightOutputs: LegacyConfigurationOption[];
  colorTemperatures: LegacyConfigurationOption[];
  accessories: LegacyConfigurationOption[];
  drivers: LegacyConfigurationOption[];
  mountingOptions: LegacyConfigurationOption[];
  hangingTechniques: LegacyConfigurationOption[];
  mirrorStyles: LegacyConfigurationOption[];
  products: LegacyConfigurationOption[];
}

interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

interface UseConfigurationDataReturn {
  options: LegacyConfigurationOptions | null;
  productLines: ConfiguratorProductLine[];
  loading: boolean;
  productLinesLoading: boolean;
  error: string | null;
  totalSkus: number;
  selectedProductLine: string | null;
  pagination: PaginationState;
  configurationUI: ConfigurationUIItem[];
  rules: ProcessedRule[];
  defaultOptions: Record<string, ConfiguratorOption[]>;
  remainingSkuCount: number;
  refreshOptions: () => Promise<void>;
  refreshProductLines: () => Promise<void>;
  setSelectedProductLine: (productLine: string | null) => void;
  loadOptionsForProductLine: (productLine: string | null, selections?: ConfigurationState) => Promise<void>;
  findMatchingSKUs: (configuration: ConfigurationState) => Promise<any[]>;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  clearCache: () => void;
  getCacheStats: () => any;
}

export function useConfigurationData(): UseConfigurationDataReturn {
  const [options, setOptions] = useState<LegacyConfigurationOptions | null>(null);
  const [productLines, setProductLines] = useState<ConfiguratorProductLine[]>([]);
  const [loading, setLoading] = useState(false);
  const [productLinesLoading, setProductLinesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalSkus, setTotalSkus] = useState(0);
  const [selectedProductLine, setSelectedProductLine] = useState<string | null>(null);
  const [configurationUI, setConfigurationUI] = useState<ConfigurationUIItem[]>([]);
  const [rules, setRules] = useState<ProcessedRule[]>([]);
  const [defaultOptions, setDefaultOptions] = useState<Record<string, ConfiguratorOption[]>>({});
  const [remainingSkuCount, setRemainingSkuCount] = useState(0);
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    pageSize: 50,
    totalItems: 0,
    totalPages: 0
  });

  const loadProductLines = async () => {
    setProductLinesLoading(true);
    setError(null);
    
    try {
      console.log('Hook: Loading ALL product lines from database...');
      const response = await simplifiedDirectSupabaseClient.getProductLines();
      
      console.log('Hook: Product lines response:', response);
      
      setProductLines(response.productLines || []);
      
      const productLinesCount = response.productLines?.length || 0;
      const totalSkus = response.totalSkus || 0;
      
      console.log('Hook: Successfully loaded ALL product lines:', {
        totalProductLines: productLinesCount,
        totalSkus: totalSkus
      });
      
      if (productLinesCount === 0) {
        console.warn('Hook: No product lines found in database');
        toast.warning('No product lines found in database. Database may be empty.');
      } else {
        console.log('Hook: Product lines loaded successfully');
        if (totalSkus === 0) {
          toast.warning(`Found ${productLinesCount} product lines but no SKUs. Check SKU data.`);
        }
      }
      
    } catch (err) {
      console.error('Hook: Failed to load product lines:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load product lines';
      setError(errorMessage);
      toast.error(`Failed to load product lines: ${errorMessage}`);
    } finally {
      setProductLinesLoading(false);
    }
  };

  const loadOptionsForProductLine = async (productLine: string | null, selections: Record<string, any> = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      if (!productLine) {
        console.log('No product line selected, clearing options...');
        setOptions(null);
        setTotalSkus(0);
        setConfigurationUI([]);
        setRules([]);
        setDefaultOptions({});
        setRemainingSkuCount(0);
        toast.info('Please select a product line to view configuration options.');
        return;
      }

      console.log(`Loading dynamic configuration options for product line: ${productLine}...`, { selections });
      const response = await simplifiedDirectSupabaseClient.getDynamicConfigurationOptions(productLine, selections);
      
      setOptions(response.options);
      setTotalSkus(response.totalSkus || 0);
      setConfigurationUI(response.configurationUI || []);
      setRules(response.rules || []);
      setDefaultOptions(response.defaultOptions || {});
      const remainingSkus = response.remainingSkuCount ?? response.remainingSkus ?? response.totalSkus ?? 0;
      setRemainingSkuCount(remainingSkus);
      
      const options = response.options as Record<string, any[]> || {};
      console.log('Loaded dynamic configuration options:', {
        productLine: productLine,
        totalSkus: response.totalSkus,
        uniqueProducts: response.totalProducts,
        availableProducts: response.availableProducts?.length || 0,
        configurationUIItems: response.configurationUI?.length || 0,
        rulesCount: response.rules?.length || 0,
        defaultOptionsCount: Object.keys(response.defaultOptions || {}).length,
        frameColors: Array.isArray(options.frame_colors) ? options.frame_colors.length : 0,
        sizes: Array.isArray(options.sizes) ? options.sizes.length : 0,
        lightOutputs: Array.isArray(options.light_outputs) ? options.light_outputs.length : 0,
        colorTemperatures: Array.isArray(options.color_temperatures) ? options.color_temperatures.length : 0,
        accessories: Array.isArray(options.accessories) ? options.accessories.length : 0,
        drivers: Array.isArray(options.drivers) ? options.drivers.length : 0,
        mountingOptions: Array.isArray(options.mounting_options) ? options.mounting_options.length : 0,
        hangingTechniques: Array.isArray(options.hanging_techniques) ? options.hanging_techniques.length : 0,
        mirrorStyles: Array.isArray(options.mirror_styles) ? options.mirror_styles.length : 0
      });
      
      if ((response.totalSkus || 0) > 0) {
        const selectionInfo = Object.keys(selections).length > 0 
          ? ` (${response.remainingSkuCount ?? response.remainingSkus ?? response.totalSkus} matching SKUs)`
          : '';
        toast.success(`Loaded ${response.totalSkus || 0} SKUs across ${response.totalProducts || 0} products for line ${productLine}${selectionInfo}`);
      } else {
        toast.warning(`Product line ${productLine} has no products available`);
      }
      
    } catch (err) {
      console.error('Failed to load configuration options:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load configuration options';
      setError(errorMessage);
      
      if (productLine) {
        toast.error(`Failed to load options for product line "${productLine}". Check if this product line has SKUs in the database.`);
      } else {
        toast.error('Failed to load product configuration options');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadConfigurationOptions = async () => {
    await loadOptionsForProductLine(selectedProductLine);
  };

  const findMatchingSKUs = async (configuration: any): Promise<any[]> => {
    try {
      console.log('Finding matching SKUs for configuration (simplified):', configuration);
      // Simplified approach - return empty array for now
      // TODO: Implement SKU matching based on products collection
      console.log('SKU matching not yet implemented in simplified client');
      return [];
    } catch (err) {
      console.error('Failed to find matching SKUs:', err);
      return [];
    }
  };

  const refreshOptions = async () => {
    await loadConfigurationOptions();
  };

  const refreshProductLines = async () => {
    await loadProductLines();
  };

  const handleSetSelectedProductLine = (productLine: string | null) => {
    console.log(`useConfigurationData: Setting product line to ${productLine}`);
    setSelectedProductLine(productLine);
    // Reset pagination when changing product line
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    // Load options for the new product line immediately
    loadOptionsForProductLine(productLine);
  };

  const setPage = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const setPageSize = (pageSize: number) => {
    setPagination(prev => ({
      ...prev,
      pageSize,
      currentPage: 1, // Reset to first page when changing page size
      totalPages: Math.ceil(prev.totalItems / pageSize)
    }));
  };

  const clearCache = () => {
    // No cache in simplified client
    console.log('Cache clearing not applicable in simplified client');
    toast.success('No cache to clear (simplified mode)');
  };

  const getCacheStats = () => {
    // No cache in simplified client
    console.log('Cache stats not applicable in simplified client');
    return { message: 'No cache in simplified mode' };
  };

  // Load product lines on mount
  useEffect(() => {
    loadProductLines();
  }, []);

  // Load configuration options when selectedProductLine changes
  useEffect(() => {
    if (productLines.length > 0) {
      loadOptionsForProductLine(selectedProductLine);
    }
  }, [selectedProductLine, productLines.length]);

  return {
    options,
    productLines,
    loading,
    productLinesLoading,
    error,
    totalSkus,
    selectedProductLine,
    pagination,
    configurationUI,
    rules,
    defaultOptions,
    remainingSkuCount,
    refreshOptions,
    refreshProductLines,
    setSelectedProductLine: handleSetSelectedProductLine,
    loadOptionsForProductLine,
    findMatchingSKUs,
    setPage,
    setPageSize,
    clearCache,
    getCacheStats
  };
}

// Empty configuration structure - no fallback data as per requirements
export const emptyConfigurationOptions: LegacyConfigurationOptions = {
  frameColors: [],
  sizes: [],
  lightOutputs: [],
  colorTemperatures: [],
  accessories: [],
  drivers: [],
  mountingOptions: [],
  hangingTechniques: [],
  mirrorStyles: [],
  products: []
};
