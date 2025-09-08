import React from 'react';
import { cn } from '../../lib/utils';
import type { RadioGroupProps } from './OptionTypeRegistry';

interface RadioOption {
  id: number;
  name: string;
  sku_code?: string;
  description?: string;
  value?: string;
}

export const RadioGroupSelector: React.FC<RadioGroupProps> = ({
  collection,
  label,
  value,
  options,
  onChange,
  disabled = false,
  required = false,
  className,
  orientation = 'vertical',
  spacing = 'normal'
}) => {
  const currentValue = Array.isArray(value) ? value[0] : value;

  const handleOptionSelect = (optionId: string) => {
    if (!disabled) {
      onChange(optionId);
    }
  };

  const spacingClasses = {
    compact: orientation === 'vertical' ? 'gap-2' : 'gap-3',
    normal: orientation === 'vertical' ? 'gap-3' : 'gap-4',
    loose: orientation === 'vertical' ? 'gap-4' : 'gap-6'
  };

  const containerClasses = cn(
    'flex',
    orientation === 'vertical' ? 'flex-col' : 'flex-row flex-wrap',
    spacingClasses[spacing]
  );

  return (
    <div className={cn('space-y-3', className)}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className={containerClasses} role="radiogroup" aria-labelledby={`${collection}-label`}>
        {options.map((option: RadioOption) => {
          const isSelected = currentValue === option.id.toString();
          const optionId = `${collection}-${option.id}`;
          
          return (
            <label
              key={option.id}
              htmlFor={optionId}
              className={cn(
                'flex items-start gap-3 cursor-pointer group',
                disabled && 'opacity-50 cursor-not-allowed',
                orientation === 'horizontal' && 'flex-1 min-w-0'
              )}
            >
              <div className="flex items-center h-5">
                <input
                  id={optionId}
                  name={collection}
                  type="radio"
                  value={option.id.toString()}
                  checked={isSelected}
                  onChange={() => handleOptionSelect(option.id.toString())}
                  disabled={disabled}
                  className={cn(
                    'w-4 h-4 text-gray-900 border-gray-300 focus:ring-gray-500 focus:ring-2',
                    disabled && 'opacity-50'
                  )}
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className={cn(
                  'text-sm font-medium text-gray-900 group-hover:text-gray-700',
                  disabled && 'text-gray-500'
                )}>
                  {option.name}
                </div>
                
                {option.description && (
                  <div className={cn(
                    'text-xs text-gray-500 mt-0.5',
                    disabled && 'text-gray-400'
                  )}>
                    {option.description}
                  </div>
                )}
                
                {option.sku_code && (
                  <div className={cn(
                    'text-xs text-gray-400 mt-0.5 font-mono',
                    disabled && 'text-gray-300'
                  )}>
                    SKU: {option.sku_code}
                  </div>
                )}
              </div>
            </label>
          );
        })}
      </div>

      {/* Additional context for selected option */}
      {currentValue && (
        <div className="mt-2">
          {(() => {
            const selectedOption = options.find((opt: RadioOption) => 
              opt.id.toString() === currentValue
            );
            
            if (selectedOption?.value && selectedOption.value !== selectedOption.name) {
              return (
                <div className="text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded">
                  <strong>Selected:</strong> {selectedOption.name} ({selectedOption.value})
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