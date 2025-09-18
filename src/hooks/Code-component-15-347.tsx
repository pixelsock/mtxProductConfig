import { useState, useEffect } from 'react';
import { supabaseClient } from '../utils/supabase/client';
import { toast } from 'sonner@2.0.3';

interface ConfigurationOption {
  id: string;
  label: string;
  value: string;
  count: number;
  sampleSkus: string[];
}

interface ConfigurationOptions {
  frameColors: ConfigurationOption[];
  sizes: ConfigurationOption[];
  lightOutputs: ConfigurationOption[];
  colorTemperatures: ConfigurationOption[];
  accessories: ConfigurationOption[];
  drivers: ConfigurationOption[];
  mountingOptions: ConfigurationOption[];
  hangingTechniques: ConfigurationOption[];
  mirrorStyles: ConfigurationOption[];
  products: ConfigurationOption[];
}

interface UseConfigurationDataReturn {
  options: ConfigurationOptions | null;
  loading: boolean;
  error: string | null;
  totalSkus: number;
  refreshOptions: () => Promise<void>;
  findMatchingSKUs: (configuration: any) => Promise<any[]>;
}

export function useConfigurationData(): UseConfigurationDataReturn {
  const [options, setOptions] = useState<ConfigurationOptions | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalSkus, setTotalSkus] = useState(0);

  const loadConfigurationOptions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Loading configuration options from sku_index...');
      const response = await supabaseClient.getConfigurationOptions();
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      setOptions(response.options);
      setTotalSkus(response.totalSkus || 0);
      
      console.log('Loaded configuration options:', {
        totalSkus: response.totalSkus,
        frameColors: response.options.frameColors?.length,
        sizes: response.options.sizes?.length,
        lightOutputs: response.options.lightOutputs?.length
      });
      
    } catch (err) {
      console.error('Failed to load configuration options:', err);
      setError(err instanceof Error ? err.message : 'Failed to load configuration options');
      toast.error('Failed to load product configuration options');
    } finally {
      setLoading(false);
    }
  };

  const findMatchingSKUs = async (configuration: any): Promise<any[]> => {
    try {
      console.log('Finding matching SKUs for configuration:', configuration);
      const response = await supabaseClient.findMatchingSKUs(configuration);
      
      if (response.error) {
        console.error('Error finding matching SKUs:', response.error);
        return [];
      }
      
      console.log(`Found ${response.skus?.length || 0} matching SKUs`);
      return response.skus || [];
    } catch (err) {
      console.error('Failed to find matching SKUs:', err);
      return [];
    }
  };

  const refreshOptions = async () => {
    await loadConfigurationOptions();
  };

  // Load options on mount
  useEffect(() => {
    loadConfigurationOptions();
  }, []);

  return {
    options,
    loading,
    error,
    totalSkus,
    refreshOptions,
    findMatchingSKUs
  };
}

// Default/fallback options for when database is not available
export const defaultConfigurationOptions: ConfigurationOptions = {
  frameColors: [
    { id: 'black', label: 'Black Frame', value: 'black', count: 0, sampleSkus: [] },
    { id: 'white', label: 'White Frame', value: 'white', count: 0, sampleSkus: [] },
    { id: 'silver', label: 'Silver Frame', value: 'silver', count: 0, sampleSkus: [] }
  ],
  sizes: [
    { id: '24x32', label: '24" x 32"', value: '24x32', count: 0, sampleSkus: [] },
    { id: '30x40', label: '30" x 40"', value: '30x40', count: 0, sampleSkus: [] },
    { id: 'custom', label: 'Custom Size', value: 'custom', count: 0, sampleSkus: [] }
  ],
  lightOutputs: [
    { id: 'standard', label: 'Standard Output', value: 'standard', count: 0, sampleSkus: [] },
    { id: 'high', label: 'High Output', value: 'high', count: 0, sampleSkus: [] }
  ],
  colorTemperatures: [
    { id: 'warm', label: 'Warm White (3000K)', value: 'warm', count: 0, sampleSkus: [] },
    { id: 'cool', label: 'Cool White (6000K)', value: 'cool', count: 0, sampleSkus: [] }
  ],
  accessories: [],
  drivers: [],
  mountingOptions: [
    { id: 'wall', label: 'Wall Mount', value: 'wall', count: 0, sampleSkus: [] },
    { id: 'ceiling', label: 'Ceiling Mount', value: 'ceiling', count: 0, sampleSkus: [] }
  ],
  hangingTechniques: [],
  mirrorStyles: [],
  products: []
};