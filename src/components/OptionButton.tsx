/**
 * Universal Option Button Component - Golden Rule Implementation
 * 
 * A single, reusable component that handles all option types
 * State is driven entirely by API data, no hard-coded logic
 */

import React from 'react';
import { Badge } from './ui/badge';
import { Check } from 'lucide-react';
import { useOptionState } from '../hooks/useOptionState';

interface OptionButtonProps {
  // Option data (from API)
  option: {
    id: number;
    name: string;
    sku_code: string;
    description?: string;
    hex_code?: string; // For color options
    width?: number; // For size options  
    height?: number; // For size options
  };
  
  // Configuration
  collection: string;
  currentSelection: Record<string, any>;
  onSelect: (optionId: number) => void;
  
  // UI customization (optional)
  variant?: 'default' | 'color' | 'size' | 'accessory';
  icon?: React.ReactNode;
  layout?: 'grid' | 'list';
}

export const OptionButton: React.FC<OptionButtonProps> = ({
  option,
  collection,
  currentSelection,
  onSelect,
  variant = 'default',
  icon,
  layout = 'list'
}) => {
  const optionManager = useOptionState(currentSelection);
  const { isDisabled, isSelected, isAvailable } = optionManager.getOptionState(collection, option.id);

  const handleClick = () => {
    if (!isDisabled) {
      onSelect(option.id);
    }
  };

  // Base classes driven by state, not hard-coded conditions
  const baseClasses = [
    'w-full p-4 rounded-lg border-2 transition-all duration-200 text-left',
    // Selection state (from API)
    isSelected 
      ? 'border-amber-500 bg-amber-50'
      : isDisabled 
        ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
  ].join(' ');

  // Text color classes driven by state
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
          
          {/* Color indicator for color options */}
          {variant === 'color' && option.hex_code && (
            <div
              className="w-6 h-6 rounded-full border border-gray-300 flex-shrink-0"
              style={{
                backgroundColor: option.hex_code,
                borderColor: option.hex_code === "#FFFFFF" ? "#e5e5e5" : option.hex_code
              }}
            />
          )}
          
          {/* Icon for other option types */}
          {icon && variant !== 'color' && (
            <div className={`w-5 h-5 flex-shrink-0 ${isDisabled ? 'text-gray-400' : 'text-gray-600'}`}>
              {icon}
            </div>
          )}
          
          {/* Option content */}
          <div className="flex-1">
            <div className={nameClasses}>
              {option.name}
              {isDisabled && <span className="text-xs ml-2">(Not available)</span>}
            </div>
            
            {/* Description or size info */}
            {option.description && (
              <div className="text-sm text-gray-600">{option.description}</div>
            )}
            
            {/* Size dimensions */}
            {variant === 'size' && option.width && option.height && (
              <div className="text-sm text-gray-600">{option.width}" × {option.height}"</div>
            )}
            
            {/* SKU for non-size options */}
            {variant !== 'size' && !option.description && (
              <div className="text-sm text-gray-600">{option.sku_code}</div>
            )}
          </div>
        </div>
        
        {/* SKU Badge */}
        <Badge variant="outline" className={variant === 'accessory' ? 'mr-3' : ''}>
          {option.sku_code}
        </Badge>
        
        {/* Checkbox for multi-select options (accessories) */}
        {variant === 'accessory' && (
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

/**
 * Option Section Component - wraps a collection of option buttons
 */
interface OptionSectionProps {
  title: string;
  collection: string;
  options: any[];
  currentSelection: Record<string, any>;
  onSelect: (optionId: number) => void;
  variant?: 'default' | 'color' | 'size' | 'accessory';
  layout?: 'grid' | 'list';
  columns?: 1 | 2 | 3 | 4;
  icon?: React.ReactNode | ((option: any) => React.ReactNode);
}

export const OptionSection: React.FC<OptionSectionProps> = ({
  title,
  collection,
  options,
  currentSelection,
  onSelect,
  variant = 'default',
  layout = 'list',
  columns = 1,
  icon
}) => {
  if (!options || options.length === 0) {
    return null;
  }

  const containerClasses = layout === 'grid' 
    ? `grid gap-4 ${columns === 2 ? 'grid-cols-2' : columns === 3 ? 'grid-cols-3' : columns === 4 ? 'grid-cols-4' : 'grid-cols-1'}`
    : 'space-y-3';

  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-900 mb-6">{title}</h3>
      <div className={containerClasses}>
        {options.map((option) => (
          <OptionButton
            key={option.id}
            option={option}
            collection={collection}
            currentSelection={currentSelection}
            onSelect={onSelect}
            variant={variant}
            layout={layout}
            icon={typeof icon === 'function' ? icon(option) : icon}
          />
        ))}
      </div>
    </div>
  );
};