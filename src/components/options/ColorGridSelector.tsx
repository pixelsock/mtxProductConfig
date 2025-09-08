import React from 'react';
import { cn } from '../../lib/utils';
import type { ColorGridProps } from './OptionTypeRegistry';

interface ColorOption {
  id: number;
  name: string;
  sku_code?: string;
  hex_code?: string;
  description?: string;
}

export const ColorGridSelector: React.FC<ColorGridProps> = ({
  collection,
  label,
  value,
  options,
  onChange,
  disabled = false,
  required = false,
  className,
  variant = 'grid',
  showHex = true,
  columns = 4,
  size = 'medium'
}) => {
  const currentValue = Array.isArray(value) ? value[0] : value;

  const handleColorSelect = (optionId: string) => {
    if (!disabled) {
      onChange(optionId);
    }
  };

  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16'
  };

  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6'
  };

  if (variant === 'list') {
    return (
      <div className={cn('space-y-3', className)}>
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        <div className="space-y-2">
          {options.map((option: ColorOption) => {
            const isSelected = currentValue === option.id.toString();
            
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleColorSelect(option.id.toString())}
                disabled={disabled}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-lg border transition-all',
                  isSelected 
                    ? 'border-gray-900 bg-gray-50 ring-2 ring-gray-900' 
                    : 'border-gray-200 hover:border-gray-300',
                  disabled && 'opacity-50 cursor-not-allowed'
                )}
              >
                <div 
                  className={cn('rounded-full border-2', sizeClasses[size])}
                  style={{ 
                    backgroundColor: option.hex_code || '#000',
                    borderColor: isSelected ? '#000' : '#d1d5db'
                  }}
                />
                
                <div className="flex-1 text-left">
                  <div className="font-medium text-gray-900">
                    {option.name}
                  </div>
                  {showHex && option.hex_code && (
                    <div className="text-sm text-gray-500">
                      {option.hex_code.toUpperCase()}
                    </div>
                  )}
                  {option.description && (
                    <div className="text-sm text-gray-400">
                      {option.description}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className={cn(
        'grid gap-3',
        gridCols[columns as keyof typeof gridCols] || 'grid-cols-4'
      )}>
        {options.map((option: ColorOption) => {
          const isSelected = currentValue === option.id.toString();
          
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => handleColorSelect(option.id.toString())}
              disabled={disabled}
              className={cn(
                'group relative flex flex-col items-center gap-2 p-3 rounded-lg border transition-all',
                isSelected 
                  ? 'border-gray-900 bg-gray-50' 
                  : 'border-gray-200 hover:border-gray-300',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
              title={`${option.name}${showHex && option.hex_code ? ` (${option.hex_code})` : ''}`}
            >
              <div 
                className={cn(
                  'rounded-full border-2 transition-all',
                  sizeClasses[size],
                  isSelected ? 'ring-2 ring-gray-900 ring-offset-2' : 'group-hover:ring-1 group-hover:ring-gray-400'
                )}
                style={{ 
                  backgroundColor: option.hex_code || '#000',
                  borderColor: isSelected ? '#000' : '#d1d5db'
                }}
              />
              
              <div className="text-center">
                <div className="text-xs font-medium text-gray-900 truncate w-full">
                  {option.name}
                </div>
                {showHex && option.hex_code && (
                  <div className="text-xs text-gray-500">
                    {option.hex_code.toUpperCase()}
                  </div>
                )}
              </div>
              
              {isSelected && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gray-900 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};