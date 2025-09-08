import React from 'react';
import { CurrentConfiguration } from '../ui/current-configuration';
import DynamicOptionsContainer from '../ui/dynamic-options-container';
import type { ProductConfiguration, ProductLine } from '../../services/types/ServiceTypes';

interface ConfigurationOptionsProps {
  currentConfig: ProductConfiguration | null;
  currentProductLine: ProductLine | null;
  productOptions: any;
  availableOptionIds: Record<string, number[]>;
  useCustomSize: boolean;
  setUseCustomSize: (value: boolean) => void;
  handleConfigChange: (key: keyof ProductConfiguration, value: any) => void;
  onQuantityChange: (quantity: number) => void;
  onAddToQuote: () => void;
  // Optional: preloaded dynamic options by collection
  dynamicOptionsByCollection?: Record<string, any[]> | null;
}

export const ConfigurationOptions: React.FC<ConfigurationOptionsProps> = ({
  currentConfig,
  currentProductLine,
  productOptions,
  availableOptionIds,
  useCustomSize,
  setUseCustomSize,
  handleConfigChange,
  onQuantityChange,
  onAddToQuote,
  dynamicOptionsByCollection = null,
}) => {
  if (!currentConfig || !productOptions) {
    return null;
  }

  return (
    <div className="space-y-12 lg:col-span-6">
      {/* Current Configuration Summary */}
      <CurrentConfiguration
        config={currentConfig as any}
        productOptions={productOptions as any}
        onQuantityChange={onQuantityChange}
        onAddToQuote={onAddToQuote}
      />

      {/* Dynamic Options Container */}
      <DynamicOptionsContainer
        productLineDefaults={(currentProductLine?.default_options as any) || []}
        currentConfig={currentConfig}
        availableOptionIds={availableOptionIds}
        customSize={useCustomSize}
        onToggleCustomSize={setUseCustomSize}
        onChange={handleConfigChange}
        preloadedOptionsByCollection={
          import.meta.env.VITE_DYNAMIC_OPTIONS === 'true' ? (dynamicOptionsByCollection || undefined) : undefined
        }
      />
    </div>
  );
};
