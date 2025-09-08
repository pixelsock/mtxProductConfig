import React, { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
import type { SliderProps } from './OptionTypeRegistry';

interface SliderOption {
  id: number;
  name: string;
  value: number;
  sku_code?: string;
  description?: string;
}

export const SliderInput: React.FC<SliderProps> = ({
  collection,
  label,
  value,
  options,
  onChange,
  disabled = false,
  required = false,
  className,
  min,
  max,
  step = 1,
  showValue = true,
  showTicks = false,
  unit = '',
  orientation = 'horizontal'
}) => {
  const currentValue = Array.isArray(value) ? parseFloat(value[0]) : parseFloat(value) || min || 0;
  const [localValue, setLocalValue] = useState(currentValue);

  // Sync with external value changes
  useEffect(() => {
    setLocalValue(currentValue);
  }, [currentValue]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    const newValue = parseFloat(e.target.value);
    setLocalValue(newValue);
  };

  const handleSliderCommit = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    const newValue = parseFloat(e.target.value);
    
    // Find the closest option if options are provided
    if (options && options.length > 0) {
      const closestOption = options.reduce((closest, option) => {
        const optionValue = typeof option === 'object' && 'value' in option ? option.value : parseFloat(option.toString());
        const currentDistance = Math.abs(optionValue - newValue);
        const closestDistance = Math.abs((typeof closest === 'object' && 'value' in closest ? closest.value : parseFloat(closest.toString())) - newValue);
        return currentDistance < closestDistance ? option : closest;
      });
      
      const optionId = typeof closestOption === 'object' && 'id' in closestOption ? closestOption.id.toString() : closestOption.toString();
      onChange(optionId);
    } else {
      onChange(newValue.toString());
    }
  };

  // Calculate min/max from options if not provided
  const effectiveMin = min ?? (options?.length ? Math.min(...options.map(opt => typeof opt === 'object' && 'value' in opt ? opt.value : parseFloat(opt.toString()))) : 0);
  const effectiveMax = max ?? (options?.length ? Math.max(...options.map(opt => typeof opt === 'object' && 'value' in opt ? opt.value : parseFloat(opt.toString()))) : 100);

  // Generate tick marks if enabled
  const generateTicks = () => {
    if (!showTicks) return null;
    
    const tickCount = Math.min(10, Math.floor((effectiveMax - effectiveMin) / step) + 1);
    const tickStep = (effectiveMax - effectiveMin) / (tickCount - 1);
    
    return Array.from({ length: tickCount }, (_, i) => {
      const tickValue = effectiveMin + (tickStep * i);
      const position = ((tickValue - effectiveMin) / (effectiveMax - effectiveMin)) * 100;
      
      return (
        <div
          key={i}
          className="absolute w-0.5 h-2 bg-gray-300"
          style={{ left: `${position}%`, transform: 'translateX(-50%)', top: '100%', marginTop: '2px' }}
        />
      );
    });
  };

  const containerClasses = cn(
    'space-y-3',
    orientation === 'vertical' && 'flex flex-col items-center h-48',
    className
  );

  return (
    <div className={containerClasses}>
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        {showValue && (
          <span className="text-sm font-mono text-gray-600">
            {localValue.toFixed(step < 1 ? 1 : 0)}{unit}
          </span>
        )}
      </div>
      
      <div className={cn(
        'relative',
        orientation === 'horizontal' ? 'w-full' : 'h-full flex items-center justify-center'
      )}>
        <input
          type="range"
          min={effectiveMin}
          max={effectiveMax}
          step={step}
          value={localValue}
          onChange={handleSliderChange}
          onMouseUp={handleSliderCommit}
          onTouchEnd={handleSliderCommit}
          disabled={disabled}
          className={cn(
            'w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-500',
            orientation === 'vertical' && 'transform -rotate-90 w-32',
            disabled && 'opacity-50 cursor-not-allowed',
            // Custom slider thumb styles
            '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5',
            '[&::-webkit-slider-thumb]:bg-gray-900 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer',
            '[&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-all',
            '[&::-webkit-slider-thumb]:hover:bg-gray-700 [&::-webkit-slider-thumb]:hover:scale-110',
            // Firefox styles
            '[&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:bg-gray-900',
            '[&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:cursor-pointer'
          )}
        />
        
        {orientation === 'horizontal' && generateTicks()}
      </div>
      
      {/* Option labels for discrete values */}
      {options && options.length > 0 && options.length <= 5 && orientation === 'horizontal' && (
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          {options.map((option: SliderOption) => {
            const optionValue = typeof option === 'object' && 'value' in option ? option.value : parseFloat(option.toString());
            const optionName = typeof option === 'object' && 'name' in option ? option.name : option.toString();
            const position = ((optionValue - effectiveMin) / (effectiveMax - effectiveMin)) * 100;
            
            return (
              <div
                key={typeof option === 'object' && 'id' in option ? option.id : option}
                className="flex flex-col items-center"
                style={{ position: 'absolute', left: `${position}%`, transform: 'translateX(-50%)' }}
              >
                <span>{optionName}</span>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Value range display */}
      <div className="flex justify-between text-xs text-gray-400">
        <span>{effectiveMin}{unit}</span>
        <span>{effectiveMax}{unit}</span>
      </div>
      
      {/* Selected option details */}
      {options && (() => {
        const selectedOption = options.find((opt: SliderOption) => {
          const optionValue = typeof opt === 'object' && 'value' in opt ? opt.value : parseFloat(opt.toString());
          return Math.abs(optionValue - localValue) < step / 2;
        });
        
        if (selectedOption && typeof selectedOption === 'object' && 'description' in selectedOption && selectedOption.description) {
          return (
            <div className="text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded">
              <strong>{selectedOption.name}:</strong> {selectedOption.description}
            </div>
          );
        }
        return null;
      })()}
    </div>
  );
};