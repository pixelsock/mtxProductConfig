/**
 * Dynamic Configuration Renderer - Ultimate Golden Rule Implementation
 * 
 * Renders all configuration options based entirely on the configuration_ui table
 * Zero hard-coded sections or UI types - everything driven by database
 * 
 * GOLDEN RULE: No hard-coded UI sections - all from configuration_ui API
 */

import React, { useMemo } from 'react';
import { useAPIState, useConfigurationState } from '../store';
import { OptionButton } from './OptionButton';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Check, Zap, Lightbulb, RotateCcw, RotateCw } from 'lucide-react';

interface ConfigUIItem {
  id: string;
  collection: string;
  ui_type: string;
  sort: number;
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

// Icon mapping for different option types
const iconMapping: { [key: string]: any } = {
  direct: Zap,
  indirect: Lightbulb,
  "both direct and indirect": Zap,
  zap: Zap,
  lightbulb: Lightbulb,
  portrait: RotateCcw,
  landscape: RotateCw,
};

// Collection to product options mapping
const COLLECTION_MAPPINGS = {
  mirror_styles: 'mirrorStyles',
  frame_colors: 'frameColors', 
  frame_thicknesses: 'frameThickness',
  light_directions: 'lightingOptions',
  mounting_options: 'mountingOptions',
  drivers: 'drivers',
  color_temperatures: 'colorTemperatures',
  light_outputs: 'lightOutputs',
  sizes: 'sizes',
  accessories: 'accessoryOptions',
  hanging_techniques: 'mountingOptions', // Map hanging techniques to mounting options
} as const;

// Collection to configuration field mapping
const CONFIG_FIELD_MAPPINGS = {
  mirror_styles: 'mirrorStyle',
  frame_colors: 'frameColor',
  frame_thicknesses: 'frameThickness', 
  light_directions: 'lighting',
  mounting_options: 'mounting',
  drivers: 'driver',
  color_temperatures: 'colorTemperature',
  light_outputs: 'lightOutput',
  sizes: 'size', // Special handling
  accessories: 'accessories', // Special handling
  hanging_techniques: 'mounting',
} as const;

// UI Type rendering components
const UITypeRenderers = {
  button_grid: ({ 
    collection, 
    options, 
    currentConfig, 
    onSelect, 
    title,
    columns = 2 
  }: any) => (
    <div>
      <h3 className="text-xl font-semibold text-gray-900 mb-6">{title}</h3>
      <div className={`grid gap-4 ${columns === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {options.map((option: any) => (
          <OptionButton
            key={option.id}
            option={option}
            collection={collection}
            currentSelection={currentConfig}
            onSelect={onSelect}
            variant="default"
            layout="grid"
            icon={collection === 'light_directions' ? (() => {
              const Icon = iconMapping[option.name?.toLowerCase()] || Zap;
              return <Icon />;
            })() : collection === 'mounting_options' || collection === 'hanging_techniques' ? (() => {
              const Icon = iconMapping[option.name?.toLowerCase()] || RotateCcw;
              return <Icon />;
            })() : undefined}
          />
        ))}
      </div>
    </div>
  ),

  color_picker: ({ 
    collection, 
    options, 
    currentConfig, 
    onSelect, 
    title 
  }: any) => (
    <div>
      <h3 className="text-xl font-semibold text-gray-900 mb-6">{title}</h3>
      <div className="grid grid-cols-2 gap-4">
        {options.map((option: any) => (
          <OptionButton
            key={option.id}
            option={option}
            collection={collection}
            currentSelection={currentConfig}
            onSelect={onSelect}
            variant="color"
            layout="grid"
          />
        ))}
      </div>
    </div>
  ),

  preset_buttons: ({ 
    collection, 
    options, 
    currentConfig, 
    onSelect, 
    title,
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
        // Size presets using OptionButton with size variant
        <div className="grid grid-cols-2 gap-4">
          {options.map((option: any) => (
            <OptionButton
              key={option.id}
              option={option}
              collection={collection}
              currentSelection={currentConfig}
              onSelect={(id) => {
                const size = options.find((s: any) => s.id === id);
                if (size) onSizePresetSelect(size);
              }}
              variant="size"
              layout="grid"
            />
          ))}
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
    onAccessoryToggle 
  }: any) => (
    <div>
      <h3 className="text-xl font-semibold text-gray-900 mb-6">{title}</h3>
      <div className="space-y-3">
        {options.map((option: any) => (
          <OptionButton
            key={option.id}
            option={option}
            collection={collection}
            currentSelection={currentConfig}
            onSelect={(id) => onAccessoryToggle(id.toString())}
            variant="accessory"
            layout="list"
          />
        ))}
      </div>
    </div>
  ),
};

// Helper function to get human-readable title from collection name
const getCollectionTitle = (collection: string): string => {
  const titleMappings = {
    mirror_styles: 'Mirror Style',
    frame_colors: 'Frame Color',
    frame_thicknesses: 'Frame Thickness',
    light_directions: 'Light Direction',
    mounting_options: 'Orientation',
    drivers: 'Driver Options',
    color_temperatures: 'Color Temperature',
    light_outputs: 'Light Output',
    sizes: 'Size',
    accessories: 'Accessories',
    hanging_techniques: 'Hanging Technique',
  };
  
  return titleMappings[collection as keyof typeof titleMappings] || 
         collection.split('_').map(word => 
           word.charAt(0).toUpperCase() + word.slice(1)
         ).join(' ');
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
  const { productOptions } = useAPIState();
  const { currentConfig } = useConfigurationState();

  // Sort configuration UI by sort order from database
  const sortedConfigUI = useMemo(() => {
    return [...configurationUI].sort((a, b) => a.sort - b.sort);
  }, [configurationUI]);

  if (!currentConfig || !productOptions) {
    return null;
  }

  return (
    <div className="space-y-10">
      {sortedConfigUI.map((configItem) => {
        const { collection, ui_type } = configItem;
        
        // Get the corresponding options from productOptions
        const productOptionsKey = COLLECTION_MAPPINGS[collection as keyof typeof COLLECTION_MAPPINGS];
        if (!productOptionsKey) {
          console.warn(`No mapping found for collection: ${collection}`);
          return null;
        }

        const options = productOptions[productOptionsKey as keyof typeof productOptions];
        if (!options || !Array.isArray(options) || options.length === 0) {
          // Collection has no options, skip rendering
          return null;
        }

        // Get the UI renderer for this UI type
        const UIRenderer = UITypeRenderers[ui_type as keyof typeof UITypeRenderers];
        if (!UIRenderer) {
          console.warn(`No UI renderer found for ui_type: ${ui_type}`);
          return null;
        }

        // Get the configuration field for onChange handlers
        const configField = CONFIG_FIELD_MAPPINGS[collection as keyof typeof CONFIG_FIELD_MAPPINGS];
        
        // Get human-readable title
        const title = getCollectionTitle(collection);

        // Render the UI component
        return (
          <div key={configItem.id}>
            <UIRenderer
              collection={productOptionsKey}
              options={options}
              currentConfig={currentConfig}
              onSelect={(id: number) => {
                if (configField) {
                  onConfigChange(configField, id.toString());
                }
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
      })}
    </div>
  );
};