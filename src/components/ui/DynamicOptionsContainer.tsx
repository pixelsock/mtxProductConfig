import React, { useMemo, useCallback } from 'react';
import { cn } from '../../lib/utils';
import { OptionTypeRegistry } from '../options/OptionTypeRegistry';
import { initializeOptionRegistry } from '../options/OptionRegistryInitializer';
import type { BaseOptionProps } from '../options/OptionTypeRegistry';

interface ConfigurationUIItem {
  id: number;
  collection: string;
  ui_type: string;
  label?: string;
  required?: boolean;
  sort_order?: number;
  ui_options?: Record<string, any>;
  conditions?: Record<string, any>;
}

interface DynamicOptionsContainerProps {
  configurationUI: ConfigurationUIItem[];
  currentConfiguration: Record<string, any>;
  availableOptions: Record<string, any[]>;
  onConfigurationChange: (field: string, value: any) => void;
  className?: string;
  disabled?: boolean;
}

export const DynamicOptionsContainer: React.FC<DynamicOptionsContainerProps> = ({
  configurationUI,
  currentConfiguration,
  availableOptions,
  onConfigurationChange,
  className,
  disabled = false
}) => {
  // Initialize the registry once
  const registry = useMemo(() => initializeOptionRegistry(), []);

  // Sort configuration UI items by sort_order
  const sortedConfigurationUI = useMemo(() => {
    return [...configurationUI].sort((a, b) => {
      const aOrder = a.sort_order ?? 999;
      const bOrder = b.sort_order ?? 999;
      return aOrder - bOrder;
    });
  }, [configurationUI]);

  // Check if a configuration UI item should be shown based on conditions
  const shouldShowItem = useCallback((item: ConfigurationUIItem): boolean => {
    if (!item.conditions) return true;

    // Example condition evaluation - can be extended for complex logic
    for (const [field, condition] of Object.entries(item.conditions)) {
      const currentValue = currentConfiguration[field];
      
      if (typeof condition === 'object') {
        // Handle complex conditions like { equals: "value", not_equals: "value", in: ["val1", "val2"] }
        if (condition.equals && currentValue !== condition.equals) {
          return false;
        }
        if (condition.not_equals && currentValue === condition.not_equals) {
          return false;
        }
        if (condition.in && Array.isArray(condition.in) && !condition.in.includes(currentValue)) {
          return false;
        }
        if (condition.not_in && Array.isArray(condition.not_in) && condition.not_in.includes(currentValue)) {
          return false;
        }
      } else {
        // Simple equality condition
        if (currentValue !== condition) {
          return false;
        }
      }
    }
    
    return true;
  }, [currentConfiguration]);

  // Get options for a specific collection
  const getOptionsForCollection = useCallback((collection: string): any[] => {
    return availableOptions[collection] || [];
  }, [availableOptions]);

  // Handle option change with validation
  const handleOptionChange = useCallback((collection: string, value: any) => {
    onConfigurationChange(collection, value);
  }, [onConfigurationChange]);

  // Build props for option component
  const buildOptionProps = useCallback((item: ConfigurationUIItem): BaseOptionProps => {
    const options = getOptionsForCollection(item.collection);
    const currentValue = currentConfiguration[item.collection];
    
    const baseProps: BaseOptionProps = {
      collection: item.collection,
      label: item.label || item.collection.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: currentValue,
      options: options,
      onChange: (value: any) => handleOptionChange(item.collection, value),
      disabled: disabled,
      required: item.required || false,
    };

    // Merge in any UI-specific options from the configuration_ui record
    if (item.ui_options) {
      Object.assign(baseProps, item.ui_options);
    }

    return baseProps;
  }, [currentConfiguration, getOptionsForCollection, handleOptionChange, disabled]);

  // Render a single configuration UI item
  const renderConfigurationItem = useCallback((item: ConfigurationUIItem) => {
    if (!shouldShowItem(item)) {
      return null;
    }

    const options = getOptionsForCollection(item.collection);
    
    // Skip if no options available (unless it's a text input type)
    const textInputTypes = ['text', 'text_input', 'textarea', 'email', 'url', 'tel', 'password', 'number'];
    if (options.length === 0 && !textInputTypes.includes(item.ui_type)) {
      return null;
    }

    const props = buildOptionProps(item);
    
    try {
      const component = registry.renderComponent(item.ui_type, props);
      
      if (!component) {
        console.warn(`No component registered for ui_type: ${item.ui_type}`);
        return (
          <div key={item.id} className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="text-sm text-yellow-800">
              <strong>Unknown UI Type:</strong> {item.ui_type}
            </div>
            <div className="text-xs text-yellow-600 mt-1">
              Collection: {item.collection}
            </div>
          </div>
        );
      }
      
      return (
        <div key={item.id} className="configuration-option">
          {component}
        </div>
      );
    } catch (error) {
      console.error(`Error rendering component for ${item.ui_type}:`, error);
      
      return (
        <div key={item.id} className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-sm text-red-800">
            <strong>Render Error:</strong> {item.ui_type}
          </div>
          <div className="text-xs text-red-600 mt-1">
            {error instanceof Error ? error.message : 'Unknown error'}
          </div>
        </div>
      );
    }
  }, [shouldShowItem, getOptionsForCollection, buildOptionProps, registry]);

  // Show message if no configuration items are available
  if (sortedConfigurationUI.length === 0) {
    return (
      <div className={cn('text-center py-8 text-gray-500', className)}>
        <div className="text-lg font-medium">No configuration options available</div>
        <div className="text-sm mt-1">
          Configure the configuration_ui collection to display options here.
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {sortedConfigurationUI.map(renderConfigurationItem)}
      
      {/* Debug information in development */}
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-8">
          <summary className="text-xs text-gray-500 cursor-pointer">
            Debug: Configuration UI ({sortedConfigurationUI.length} items)
          </summary>
          <div className="mt-2 p-3 bg-gray-50 rounded text-xs">
            <div className="space-y-2">
              {sortedConfigurationUI.map(item => (
                <div key={item.id} className="flex justify-between items-center">
                  <span>
                    {item.collection} ({item.ui_type})
                  </span>
                  <span className={cn(
                    'px-2 py-1 rounded text-xs',
                    shouldShowItem(item) 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  )}>
                    {shouldShowItem(item) ? 'Visible' : 'Hidden'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </details>
      )}
    </div>
  );
};