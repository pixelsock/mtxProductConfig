/**
 * Smart Configurator Integration Hook
 * 
 * Replaces the existing configuration management system with smart configurator
 * while maintaining compatibility with existing ProductConfig interface.
 */

import { useState, useEffect, useCallback } from 'react';
import { useSmartConfigurator } from './useSmartConfigurator';
import { smartConfigurator, type SmartConfig, type AvailableOptions } from '../services/smart-configurator';
import type { ProductLine, DecoProduct } from '../services/directus';

// Legacy interfaces for compatibility
export interface ProductConfig {
  id: string;
  productLineId: number;
  productLineName: string;
  mirrorControls: string;
  frameColor: string;
  frameThickness: string;
  mirrorStyle: string;
  width: string;
  height: string;
  mounting: string;
  lighting: string;
  colorTemperature: string;
  lightOutput: string;
  driver: string;
  accessories: string[];
  quantity: number;
}

export interface ProductOption {
  id: number;
  name: string;
  sku_code: string;
  description?: string;
  hex_code?: string;
  width?: number;
  height?: number;
  value?: string;
}

export interface ProductOptions {
  mirrorControls: ProductOption[];
  frameColors: ProductOption[];
  frameThickness: ProductOption[];
  mirrorStyles: ProductOption[];
  mountingOptions: ProductOption[];
  lightingOptions: ProductOption[];
  colorTemperatures: ProductOption[];
  lightOutputs: ProductOption[];
  drivers: ProductOption[];
  accessoryOptions: ProductOption[];
  sizes: ProductOption[];
}

export interface UseSmartConfiguratorIntegrationOptions {
  initialProductLine?: ProductLine;
  initialProduct?: DecoProduct;
  onConfigChange?: (config: ProductConfig) => void;
  onProductLineChange?: (productLine: ProductLine) => void;
  enableDebug?: boolean;
}

export function useSmartConfiguratorIntegration({
  initialProductLine,
  initialProduct,
  onConfigChange,
  onProductLineChange,
  enableDebug = false
}: UseSmartConfiguratorIntegrationOptions = {}) {
  
  // Current product line and product
  const [currentProductLine, setCurrentProductLine] = useState<ProductLine | null>(initialProductLine || null);
  const [currentProduct, setCurrentProduct] = useState<DecoProduct | null>(initialProduct || null);
  
  // Legacy ProductConfig state for compatibility
  const [productConfig, setProductConfig] = useState<ProductConfig | null>(null);
  const [productOptions, setProductOptions] = useState<ProductOptions | null>(null);
  
  // Available option IDs for the current configuration (for backward compatibility)
  const [availableOptionIds, setAvailableOptionIds] = useState<Record<string, number[]>>({});

  // Initialize smart configurator with product line context
  const initialSmartConfig: SmartConfig = currentProductLine ? {
    product_line: currentProductLine.id,
    ...(initialProduct ? { product_id: initialProduct.id } : {})
  } : {};

  const {
    config: smartConfig,
    availableOptions,
    skuResult,
    loading,
    errors,
    updateConfig: updateSmartConfig,
    setConfig: setSmartConfig,
    refreshCache
  } = useSmartConfigurator(initialSmartConfig, {
    debug: enableDebug,
    autoFilter: true,
    debounceMs: 300
  });

  // Convert SmartConfig to legacy ProductConfig
  const convertToLegacyConfig = useCallback((
    smart: SmartConfig, 
    productLine: ProductLine,
    options?: AvailableOptions
  ): ProductConfig => {
    return {
      id: `smart-${Date.now()}`,
      productLineId: productLine.id,
      productLineName: productLine.name,
      frameThickness: smart.frame_thickness?.toString() || '',
      frameColor: smart.frame_color?.toString() || '',
      mirrorControls: '', // This field seems unused in current system
      mirrorStyle: smart.mirror_style?.toString() || '',
      mounting: smart.mounting_option?.toString() || '',
      width: '', // Will be set from size selection
      height: '', // Will be set from size selection
      lighting: smart.light_direction?.toString() || '',
      colorTemperature: smart.color_temperature?.toString() || '',
      lightOutput: smart.light_output?.toString() || '',
      driver: smart.driver?.toString() || '',
      accessories: Array.isArray(smart.accessory) ? smart.accessory.map(id => id.toString()) : [],
      quantity: 1,
    };
  }, []);

  // Convert AvailableOptions to legacy ProductOptions
  const convertToLegacyOptions = useCallback((options: AvailableOptions): ProductOptions => {
    return {
      mirrorControls: [], // Not used in smart configurator
      frameColors: (options.frameColors || []).map(item => ({
        id: item.id,
        name: item.name,
        sku_code: item.sku_code,
        hex_code: item.hex_code
      })),
      frameThickness: (options.frameThicknesses || []).map(item => ({
        id: item.id,
        name: item.name,
        sku_code: item.sku_code,
        description: item.description
      })),
      mirrorStyles: (options.mirrorStyles || []).map(item => ({
        id: item.id,
        name: item.name,
        sku_code: item.sku_code,
        description: item.description
      })),
      mountingOptions: (options.mountingOptions || []).map(item => ({
        id: item.id,
        name: item.name,
        sku_code: item.sku_code,
        description: item.description
      })),
      lightingOptions: (options.lightDirections || []).map(item => ({
        id: item.id,
        name: item.name,
        sku_code: item.sku_code,
        description: item.description
      })),
      colorTemperatures: (options.colorTemperatures || []).map(item => ({
        id: item.id,
        name: item.name,
        sku_code: item.sku_code
      })),
      lightOutputs: (options.lightOutputs || []).map(item => ({
        id: item.id,
        name: item.name,
        sku_code: item.sku_code
      })),
      drivers: (options.drivers || []).map(item => ({
        id: item.id,
        name: item.name,
        sku_code: item.sku_code,
        description: item.description
      })),
      accessoryOptions: (options.accessories || []).map(item => ({
        id: item.id,
        name: item.name,
        sku_code: item.sku_code,
        description: item.description
      })),
      sizes: (options.sizes || []).map(item => ({
        id: item.id,
        name: item.name,
        sku_code: item.sku_code,
        width: item.width,
        height: item.height
      }))
    };
  }, []);

  // Handle product line changes
  const handleProductLineChange = useCallback(async (newProductLine: ProductLine) => {
    setCurrentProductLine(newProductLine);
    
    // Update smart config with new product line
    await setSmartConfig({
      product_line: newProductLine.id,
      // Reset other selections when changing product lines
    });
    
    onProductLineChange?.(newProductLine);
  }, [setSmartConfig, onProductLineChange]);

  // Handle legacy config field changes
  const handleConfigChange = useCallback((field: keyof ProductConfig, value: any) => {
    if (!currentProductLine) return;

    // Map legacy field names to smart config fields
    const fieldMapping: Record<string, string> = {
      frameThickness: 'frame_thickness',
      frameColor: 'frame_color',
      mirrorStyle: 'mirror_style',
      mounting: 'mounting_option',
      lighting: 'light_direction',
      colorTemperature: 'color_temperature',
      lightOutput: 'light_output',
      driver: 'driver'
    };

    const smartField = fieldMapping[field];
    if (smartField) {
      const numericValue = typeof value === 'string' ? parseInt(value, 10) : value;
      updateSmartConfig({ [smartField]: numericValue });
    } else if (field === 'accessories') {
      // Handle accessories array
      const accessoryIds = Array.isArray(value) ? value.map(id => parseInt(id, 10)) : [];
      updateSmartConfig({ accessory: accessoryIds });
    }
  }, [updateSmartConfig, currentProductLine]);

  // Update legacy states when smart config changes
  useEffect(() => {
    if (!currentProductLine) return;

    const legacyConfig = convertToLegacyConfig(smartConfig, currentProductLine, availableOptions);
    setProductConfig(legacyConfig);
    onConfigChange?.(legacyConfig);
  }, [smartConfig, currentProductLine, availableOptions, convertToLegacyConfig, onConfigChange]);

  // Update legacy options when available options change
  useEffect(() => {
    if (availableOptions) {
      const legacyOptions = convertToLegacyOptions(availableOptions);
      setProductOptions(legacyOptions);

      // Update available option IDs for backward compatibility
      const optionIds: Record<string, number[]> = {
        frame_color: (availableOptions.frameColors || []).map(item => item.id),
        mounting: (availableOptions.mountingOptions || []).map(item => item.id),
        light_direction: (availableOptions.lightDirections || []).map(item => item.id),
        color_temperature: (availableOptions.colorTemperatures || []).map(item => item.id),
        light_output: (availableOptions.lightOutputs || []).map(item => item.id),
        driver: (availableOptions.drivers || []).map(item => item.id),
        accessories: (availableOptions.accessories || []).map(item => item.id),
        frame_thickness: (availableOptions.frameThicknesses || []).map(item => item.id),
        mirror_style: (availableOptions.mirrorStyles || []).map(item => item.id)
      };
      
      setAvailableOptionIds(optionIds);
    }
  }, [availableOptions, convertToLegacyOptions]);

  // Initialize with default values when product line is set
  useEffect(() => {
    if (currentProductLine && availableOptions && !productConfig) {
      // Set initial values from first available options
      const initialConfig: Partial<SmartConfig> = {
        product_line: currentProductLine.id,
      };

      // Set first available option for each field
      if (availableOptions.frameColors.length > 0) {
        initialConfig.frame_color = availableOptions.frameColors[0].id;
      }
      if (availableOptions.mountingOptions.length > 0) {
        initialConfig.mounting_option = availableOptions.mountingOptions[0].id;
      }
      if (availableOptions.colorTemperatures.length > 0) {
        initialConfig.color_temperature = availableOptions.colorTemperatures[0].id;
      }
      if (availableOptions.lightOutputs.length > 0) {
        initialConfig.light_output = availableOptions.lightOutputs[0].id;
      }
      if (availableOptions.drivers.length > 0) {
        initialConfig.driver = availableOptions.drivers[0].id;
      }

      updateSmartConfig(initialConfig);
    }
  }, [currentProductLine, availableOptions, productConfig, updateSmartConfig]);

  return {
    // Legacy compatibility
    productConfig,
    productOptions,
    availableOptionIds,
    currentProductLine,
    currentProduct,
    
    // Smart configurator state
    smartConfig,
    availableOptions,
    skuResult,
    loading,
    errors,
    
    // Actions
    handleConfigChange,
    handleProductLineChange,
    updateSmartConfig,
    refreshCache,
    
    // Utilities
    setCurrentProduct,
    generateSKU: () => skuResult?.sku || '',
    isValidConfiguration: () => skuResult?.isValid || false
  };
}