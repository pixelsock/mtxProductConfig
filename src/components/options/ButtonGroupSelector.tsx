import React from 'react';
import { cn } from '../../lib/utils';
import type { ButtonGroupProps } from './OptionTypeRegistry';

interface ButtonOption {
  id: number;
  name: string;
  sku_code?: string;
  description?: string;
  value?: string;
}

export const ButtonGroupSelector: React.FC<ButtonGroupProps> = ({
  collection,
  label,
  value,
  options,
  onChange,
  disabled = false,
  required = false,
  className,
  variant = 'outline',
  orientation = 'horizontal',
  size = 'default'
}) => {
  const currentValue = Array.isArray(value) ? value[0] : value;

  const handleOptionSelect = (optionId: string) => {
    if (!disabled) {
      onChange(optionId);
    }
  };

  const sizeClasses = {
    small: 'px-3 py-1.5 text-xs',
    default: 'px-4 py-2 text-sm',
    large: 'px-6 py-3 text-base'
  };

  const getButtonClasses = (option: ButtonOption, isSelected: boolean) => {
    const baseClasses = cn(
      'font-medium transition-all focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1',
      sizeClasses[size],
      disabled && 'opacity-50 cursor-not-allowed'
    );

    if (variant === 'filled') {
      return cn(
        baseClasses,
        'border',
        isSelected 
          ? 'bg-gray-900 text-white border-gray-900' 
          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
      );
    }

    // Default outline variant
    return cn(
      baseClasses,
      'border',
      isSelected 
        ? 'bg-gray-900 text-white border-gray-900' 
        : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400 hover:bg-gray-50'
    );
  };

  const containerClasses = cn(
    'flex',
    orientation === 'vertical' ? 'flex-col' : 'flex-row flex-wrap',
    orientation === 'horizontal' ? 'gap-2' : 'gap-1'
  );

  const buttonWrapperClasses = orientation === 'horizontal' 
    ? 'flex-1 min-w-0' 
    : 'w-full';

  return (
    <div className={cn('space-y-3', className)}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className={containerClasses}>
        {options.map((option: ButtonOption, index) => {
          const isSelected = currentValue === option.id.toString();
          
          return (
            <div key={option.id} className={buttonWrapperClasses}>
              <button
                type="button"
                onClick={() => handleOptionSelect(option.id.toString())}
                disabled={disabled}
                className={cn(
                  getButtonClasses(option, isSelected),
                  'w-full text-center',
                  // Handle border radius for connected buttons
                  orientation === 'horizontal' && options.length > 1 && (
                    index === 0 
                      ? 'rounded-l-lg rounded-r-none border-r-0' 
                      : index === options.length - 1 
                      ? 'rounded-r-lg rounded-l-none' 
                      : 'rounded-none border-r-0'
                  ),
                  orientation === 'vertical' && options.length > 1 && (
                    index === 0 
                      ? 'rounded-t-lg rounded-b-none border-b-0' 
                      : index === options.length - 1 
                      ? 'rounded-b-lg rounded-t-none' 
                      : 'rounded-none border-b-0'
                  ),
                  // Single button or spaced buttons
                  (options.length === 1 || (orientation === 'horizontal' && options.length <= 3)) && 'rounded-lg border'
                )}
                title={option.description || option.name}
              >
                <div className="flex flex-col items-center justify-center min-h-0">
                  <span className="font-medium truncate w-full">
                    {option.name}
                  </span>
                  {option.description && (
                    <span className="text-xs opacity-75 truncate w-full mt-0.5">
                      {option.description}
                    </span>
                  )}
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {/* Display selected option details if available */}
      {currentValue && (
        <div className="text-sm text-gray-600">
          {(() => {
            const selectedOption = options.find((opt: ButtonOption) => 
              opt.id.toString() === currentValue
            );
            
            if (selectedOption?.description) {
              return (
                <div className="p-2 bg-gray-50 rounded text-xs">
                  <strong>{selectedOption.name}:</strong> {selectedOption.description}
                </div>
              );
            }
            return null;
          })()}
        </div>
      )}
    </div>
  );
};