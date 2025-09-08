import React from 'react';
import { cn } from '../../lib/utils';
import type { CheckboxGroupProps } from './OptionTypeRegistry';

interface CheckboxOption {
  id: number;
  name: string;
  sku_code?: string;
  description?: string;
  value?: string;
}

export const CheckboxGroupSelector: React.FC<CheckboxGroupProps> = ({
  collection,
  label,
  value,
  options,
  onChange,
  disabled = false,
  required = false,
  className,
  orientation = 'vertical',
  multiple = true,
  max
}) => {
  const currentValues = Array.isArray(value) ? value : (value ? [value] : []);

  const handleOptionToggle = (optionId: string) => {
    if (disabled) return;

    if (multiple) {
      let newValues: string[];
      
      if (currentValues.includes(optionId)) {
        // Remove the option
        newValues = currentValues.filter(id => id !== optionId);
      } else {
        // Add the option (check max limit)
        if (max && currentValues.length >= max) {
          return; // Don't add if at max limit
        }
        newValues = [...currentValues, optionId];
      }
      
      onChange(newValues);
    } else {
      // Single selection mode
      onChange(currentValues.includes(optionId) ? '' : optionId);
    }
  };

  const containerClasses = cn(
    'flex',
    orientation === 'vertical' ? 'flex-col gap-3' : 'flex-row flex-wrap gap-4'
  );

  const isAtMaxLimit = max && currentValues.length >= max;

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        {multiple && max && (
          <span className={cn(
            'text-xs',
            currentValues.length >= max ? 'text-red-500' : 'text-gray-500'
          )}>
            {currentValues.length}/{max} selected
          </span>
        )}
      </div>
      
      <div className={containerClasses} role="group" aria-labelledby={`${collection}-label`}>
        {options.map((option: CheckboxOption) => {
          const isSelected = currentValues.includes(option.id.toString());
          const isDisabledOption = disabled || (isAtMaxLimit && !isSelected);
          const optionId = `${collection}-${option.id}`;
          
          return (
            <label
              key={option.id}
              htmlFor={optionId}
              className={cn(
                'flex items-start gap-3 cursor-pointer group p-3 rounded-lg border transition-all',
                isSelected 
                  ? 'bg-gray-50 border-gray-300 ring-1 ring-gray-300' 
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
                isDisabledOption && 'opacity-50 cursor-not-allowed',
                orientation === 'horizontal' && 'flex-1 min-w-0'
              )}
            >
              <div className="flex items-center h-5">
                <input
                  id={optionId}
                  name={multiple ? `${collection}[]` : collection}
                  type="checkbox"
                  value={option.id.toString()}
                  checked={isSelected}
                  onChange={() => handleOptionToggle(option.id.toString())}
                  disabled={isDisabledOption}
                  className={cn(
                    'w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-500 focus:ring-2',
                    isDisabledOption && 'opacity-50'
                  )}
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className={cn(
                  'text-sm font-medium text-gray-900 group-hover:text-gray-700',
                  isDisabledOption && 'text-gray-500'
                )}>
                  {option.name}
                </div>
                
                {option.description && (
                  <div className={cn(
                    'text-xs text-gray-500 mt-0.5',
                    isDisabledOption && 'text-gray-400'
                  )}>
                    {option.description}
                  </div>
                )}
                
                {option.sku_code && (
                  <div className={cn(
                    'text-xs text-gray-400 mt-0.5 font-mono',
                    isDisabledOption && 'text-gray-300'
                  )}>
                    SKU: {option.sku_code}
                  </div>
                )}

                {option.value && option.value !== option.name && (
                  <div className={cn(
                    'text-xs text-gray-400 mt-0.5',
                    isDisabledOption && 'text-gray-300'
                  )}>
                    Value: {option.value}
                  </div>
                )}
              </div>
            </label>
          );
        })}
      </div>

      {/* Selected items summary */}
      {multiple && currentValues.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs font-medium text-gray-700 mb-2">
            Selected ({currentValues.length}):
          </div>
          <div className="flex flex-wrap gap-1">
            {currentValues.map(valueId => {
              const selectedOption = options.find((opt: CheckboxOption) => 
                opt.id.toString() === valueId
              );
              
              if (!selectedOption) return null;
              
              return (
                <span
                  key={valueId}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-gray-200 rounded text-xs font-medium text-gray-700"
                >
                  {selectedOption.name}
                  <button
                    type="button"
                    onClick={() => handleOptionToggle(valueId)}
                    disabled={disabled}
                    className="hover:text-red-500 transition-colors"
                    title="Remove"
                  >
                    ×
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Max limit warning */}
      {multiple && max && isAtMaxLimit && (
        <div className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded">
          Maximum of {max} selections allowed. Remove an item to select another.
        </div>
      )}
    </div>
  );
};