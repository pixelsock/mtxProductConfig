/**
 * Dynamic Configuration Renderer - Ultimate Golden Rule Implementation
 * 
 * Renders all configuration options based entirely on database data
 * Zero hard-coded mappings - everything driven by configuration_ui and actual data
 * 
 * GOLDEN RULE: No hard-coded mappings - all from database relationships
 */

import React, { useMemo } from 'react';
import { useAPIState, useConfigurationState } from '../store';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Check, Zap, Lightbulb, RotateCcw, RotateCw } from 'lucide-react';
import { supabase } from '../services/supabase';

interface ConfigUIItem {
  id: string;
  collection: string;
  ui_type: string;
  sort: number;
}

interface DynamicOption {
  id: number;
  name: string;
  sku_code: string;
  active: boolean;
  sort?: number;
  description?: string;
  hex_code?: string;
  width?: number;
  height?: number;
  [key: string]: any; // Allow any additional fields from database
}

interface DynamicConfigurationRendererProps {
  configurationUI: ConfigUIItem[];
  onConfigChange: (field: string, value: any) => void;
  onSizePresetSelect: (size: any) => void;
  onAccessoryToggle: (accessoryId: string) => void;
  useCustomSize: boolean;
  setCustomSizeEnabled: (enabled: boolean) => void;
  getCurrentSizeId: () => string;
}

/**
 * Dynamic option button component that adapts to any collection
 */
const DynamicOptionButton: React.FC<{
  option: DynamicOption;
  collection: string;
  currentConfig: any;
  onSelect: (id: number) => void;
  isSelected: boolean;
  isDisabled: boolean;
}> = ({ option, collection, currentConfig, onSelect, isSelected, isDisabled }) => {
  const handleClick = () => {
    if (!isDisabled) {
      onSelect(option.id);
    }
  };

  // Base classes driven by state, not hard-coded conditions
  const baseClasses = [
    'w-full p-4 rounded-lg border-2 transition-all duration-200 text-left',
    isSelected 
      ? 'border-amber-500 bg-amber-50'
      : isDisabled 
        ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
  ].join(' ');

  const textClasses = isDisabled ? 'text-gray-400' : 'text-gray-900';
  const nameClasses = `font-medium mb-1 ${textClasses}`;

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      className={baseClasses}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1">
          
          {/* Color indicator for options with hex_code */}
          {option.hex_code && (
            <div
              className="w-6 h-6 rounded-full border border-gray-300 flex-shrink-0"
              style={{
                backgroundColor: option.hex_code,
                borderColor: option.hex_code === "#FFFFFF" ? "#e5e5e5" : option.hex_code
              }}
            />
          )}
          
          {/* Option content */}
          <div className="flex-1">
            <div className={nameClasses}>
              {option.name}
              {isDisabled && <span className="text-xs ml-2">(Not available)</span>}
            </div>
            
            {/* Description */}
            {option.description && (
              <div className="text-sm text-gray-600">{option.description}</div>
            )}
            
            {/* Size dimensions */}
            {option.width && option.height && (
              <div className="text-sm text-gray-600">{option.width}" × {option.height}"</div>
            )}
            
            {/* SKU for other options */}
            {!option.description && !option.width && (
              <div className="text-sm text-gray-600">{option.sku_code}</div>
            )}
          </div>
        </div>
        
        {/* SKU Badge */}
        <Badge variant="outline" className={collection === 'accessories' ? 'mr-3' : ''}>
          {option.sku_code}
        </Badge>
        
        {/* Checkbox for multi-select options (accessories) */}
        {collection === 'accessories' && (
          <div
            className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ml-3 ${
              isSelected
                ? "bg-amber-500 text-white"
                : "border-2 border-gray-300"
            }`}
          >
            {isSelected && <Check className="w-3 h-3" />}
          </div>
        )}
      </div>
    </button>
  );
};

// UI Type rendering components
const UITypeRenderers = {
  button_grid: ({ 
    collection, 
    options, 
    currentConfig, 
    onSelect, 
    title,
    disabledOptionIds,
    columns = 2 
  }: any) => (
    <div>
      <h3 className="text-xl font-semibold text-gray-900 mb-6">{title}</h3>
      <div className={`grid gap-4 ${columns === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {options.map((option: DynamicOption) => {
          const isSelected = currentConfig[collection] === option.id.toString();
          const isDisabled = disabledOptionIds[collection]?.includes(option.id) || false;
          
          return (
          <DynamicOptionButton
            key={option.id}
            option={option}
            collection={collection}
            currentConfig={currentConfig}
            onSelect={onSelect}
            isSelected={isSelected}
            isDisabled={isDisabled}
          />
        )})}
      </div>
    </div>
  ),

  color_picker: ({ 
    collection, 
    options, 
    currentConfig, 
    onSelect, 
    title,
    disabledOptionIds
  }: any) => (
    <div>
      <h3 className="text-xl font-semibold text-gray-900 mb-6">{title}</h3>
      <div className="grid grid-cols-2 gap-4">
        {options.map((option: DynamicOption) => {
          const isSelected = currentConfig[collection] === option.id.toString();
          const isDisabled = disabledOptionIds[collection]?.includes(option.id) || false;
          
          return (
          <DynamicOptionButton
            key={option.id}
            option={option}
            collection={collection}
            currentConfig={currentConfig}
            onSelect={onSelect}
            isSelected={isSelected}
            isDisabled={isDisabled}
          />
        )})}
      </div>
    </div>
  ),

  preset_buttons: ({ 
    collection, 
    options, 
    currentConfig, 
    onSelect, 
    title,
    disabledOptionIds,
    useCustomSize,
    setCustomSizeEnabled,
    getCurrentSizeId,
    onSizePresetSelect,
    onConfigChange
  }: any) => (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
        <div className="flex items-center space-x-3">
          <Label htmlFor="custom-size-toggle" className="text-sm text-gray-700">
            Custom Size
          </Label>
          <Switch
            id="custom-size-toggle"
            checked={useCustomSize}
            onCheckedChange={setCustomSizeEnabled}
          />
        </div>
      </div>

      {useCustomSize ? (
        // Custom size inputs
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-gray-700">Width (inches)</Label>
            <div className="relative">
              <Input
                type="number"
                value={currentConfig.width}
                onChange={(e) => onConfigChange("width", e.target.value)}
                min="12"
                max="120"
                className="text-center text-lg font-medium h-12 bg-gray-50 border-gray-200"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                in
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-gray-700">Height (inches)</Label>
            <div className="relative">
              <Input
                type="number"
                value={currentConfig.height}
                onChange={(e) => onConfigChange("height", e.target.value)}
                min="12"
                max="120"
                className="text-center text-lg font-medium h-12 bg-gray-50 border-gray-200"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                in
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Size presets using dynamic option buttons
        <div className="grid grid-cols-2 gap-4">
          {options.map((option: DynamicOption) => {
            const isSelected = currentConfig.width === option.width?.toString() && 
                              currentConfig.height === option.height?.toString();
            const isDisabled = disabledOptionIds[collection]?.includes(option.id) || false;
            
            return (
            <DynamicOptionButton
              key={option.id}
              option={option}
              collection={collection}
              currentConfig={currentConfig}
              onSelect={(id) => {
                const size = options.find((s: DynamicOption) => s.id === id);
                if (size) onSizePresetSelect(size);
              }}
              isSelected={isSelected}
              isDisabled={isDisabled}
            />
          )})}
        </div>
      )}
    </div>
  ),

  single: ({ 
    collection, 
    options, 
    currentConfig, 
    onSelect, 
    title,
    disabledOptionIds,
    onAccessoryToggle 
  }: any) => (
    <div>
      <h3 className="text-xl font-semibold text-gray-900 mb-6">{title}</h3>
      <div className="space-y-3">
        {options.map((option: DynamicOption) => {
          const isSelected = Array.isArray(currentConfig.accessories) && 
                            currentConfig.accessories.includes(option.id.toString());
          const isDisabled = disabledOptionIds[collection]?.includes(option.id) || false;
          
          return (
          <DynamicOptionButton
            key={option.id}
            option={option}
            collection={collection}
            currentConfig={currentConfig}
            onSelect={(id) => onAccessoryToggle(id.toString())}
            isSelected={isSelected}
            isDisabled={isDisabled}
          />
        )})}
      </div>
    </div>
  ),
};

/**
 * Get human-readable title from collection name (dynamic)
 */
const getCollectionTitle = (collection: string): string => {
  // Convert snake_case to Title Case dynamically
  return collection
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Hook to dynamically load options for any collection
 */
const useDynamicOptions = (collection: string, productLineId: number) => {
  const [options, setOptions] = React.useState<DynamicOption[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadOptions = async () => {
      if (!collection || !productLineId) return;

      setLoading(true);
      setError(null);

      try {
        // First, get the product line default options to see what's available
        const { data: defaultOptions, error: defaultError } = await supabase
          .from('product_lines_default_options')
          .select('*')
          .eq('product_lines_id', productLineId)
          .eq('collection', collection);

        if (defaultError) {
          console.warn(`No default options found for ${collection} in product line ${productLineId}`);
          setOptions([]);
          return;
        }

        if (!defaultOptions || defaultOptions.length === 0) {
          setOptions([]);
          return;
        }

        // Get the allowed item IDs
        const allowedIds = defaultOptions.map(opt => parseInt(opt.item)).filter(id => !isNaN(id));

        if (allowedIds.length === 0) {
          setOptions([]);
          return;
        }

        // Load the actual options from the collection
        const { data: collectionData, error: collectionError } = await supabase
          .from(collection)
          .select('*')
          .in('id', allowedIds)
          .order('sort', { ascending: true });

        // If the first query fails, try without the active filter
        let finalData = collectionData;
        let finalError = collectionError;

        if (collectionError && collectionError.code === '42703') {
          // Column doesn't exist, retry without active filter
          const { data: retryData, error: retryError } = await supabase
            .from(collection)
            .select('*')
            .in('id', allowedIds)
            .order('sort', { ascending: true });
          
          finalData = retryData;
          finalError = retryError;
        }

        if (finalError) {
          throw finalError;
        }

        setOptions(finalData || []);

      } catch (err) {
        console.error(`Failed to load options for ${collection}:`, err);
        setError(err instanceof Error ? err.message : 'Failed to load options');
        setOptions([]);
      } finally {
        setLoading(false);
      }
    };

    loadOptions();
  }, [collection, productLineId]);

  return { options, loading, error };
};

export const DynamicConfigurationRenderer: React.FC<DynamicConfigurationRendererProps> = ({
  configurationUI,
  onConfigChange,
  onSizePresetSelect,
  onAccessoryToggle,
  useCustomSize,
  setCustomSizeEnabled,
  getCurrentSizeId
}) => {
  const { disabledOptionIds } = useAPIState();
  const { currentConfig, currentProductLine } = useConfigurationState();

  // Sort configuration UI by sort order from database
  const sortedConfigUI = useMemo(() => {
    return [...configurationUI].sort((a, b) => a.sort - b.sort);
  }, [configurationUI]);

  if (!currentConfig || !currentProductLine) {
    return null;
  }

  return (
    <div className="space-y-10">
      {sortedConfigUI.map((configItem) => {
        const { collection, ui_type } = configItem;
        
        return (
          <DynamicCollectionRenderer
            key={configItem.id}
            collection={collection}
            uiType={ui_type}
            productLineId={currentProductLine.id}
            currentConfig={currentConfig}
            disabledOptionIds={disabledOptionIds}
            onConfigChange={onConfigChange}
            onSizePresetSelect={onSizePresetSelect}
            onAccessoryToggle={onAccessoryToggle}
            useCustomSize={useCustomSize}
            setCustomSizeEnabled={setCustomSizeEnabled}
            getCurrentSizeId={getCurrentSizeId}
          />
        );
      })}
    </div>
  );
};

/**
 * Dynamic collection renderer that loads options from any collection
 */
const DynamicCollectionRenderer: React.FC<{
  collection: string;
  uiType: string;
  productLineId: number;
  currentConfig: any;
  disabledOptionIds: Record<string, number[]>;
  onConfigChange: (field: string, value: any) => void;
  onSizePresetSelect: (size: any) => void;
  onAccessoryToggle: (accessoryId: string) => void;
  useCustomSize: boolean;
  setCustomSizeEnabled: (enabled: boolean) => void;
  getCurrentSizeId: () => string;
}> = ({
  collection,
  uiType,
  productLineId,
  currentConfig,
  disabledOptionIds,
  onConfigChange,
  onSizePresetSelect,
  onAccessoryToggle,
  useCustomSize,
  setCustomSizeEnabled,
  getCurrentSizeId
}) => {
  const { options, loading, error } = useDynamicOptions(collection, productLineId);

  if (loading) {
    return (
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-6">
          {getCollectionTitle(collection)}
        </h3>
        <div className="text-gray-500">Loading options...</div>
      </div>
    );
  }

  if (error) {
    console.warn(`Error loading ${collection}:`, error);
    return null;
  }

  if (!options || options.length === 0) {
    if (import.meta.env.DEV) {
      console.log(`No options available for collection: ${collection}`);
    }
    return null;
  }

  // Get the UI renderer for this UI type
  const UIRenderer = UITypeRenderers[uiType as keyof typeof UITypeRenderers];
  if (!UIRenderer) {
    console.warn(`No UI renderer found for ui_type: ${uiType}`);
    return null;
  }

  // Get human-readable title
  const title = getCollectionTitle(collection);

  // Render the UI component
  return (
    <div>
      <UIRenderer
        collection={collection}
        options={options}
        currentConfig={currentConfig}
        disabledOptionIds={disabledOptionIds}
        onSelect={(id: number) => {
          // Use collection name as the config field
          onConfigChange(collection, id.toString());
        }}
        title={title}
        useCustomSize={useCustomSize}
        setCustomSizeEnabled={setCustomSizeEnabled}
        getCurrentSizeId={getCurrentSizeId}
        onSizePresetSelect={onSizePresetSelect}
        onAccessoryToggle={onAccessoryToggle}
        onConfigChange={onConfigChange}
        columns={collection === 'mirror_styles' ? 2 : 1}
      />
    </div>
  );
};