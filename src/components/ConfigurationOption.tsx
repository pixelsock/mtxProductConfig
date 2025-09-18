import React from 'react';
import { Badge } from './ui/badge';

interface ConfigurationOptionProps {
  title: string;
  description?: string;
  type: 'single' | 'grid' | 'colors';
  options: Array<{
    id: string;
    name: string;
    sku: string;
    color?: string;
    value?: string;
    count?: number;
    description?: string;
    sampleSkus?: string[];
  }>;
  selected: string;
  onSelect: (value: string) => void;
  columns?: number;
  debugMode?: boolean;
}

export function ConfigurationOption({
  title,
  description,
  type,
  options,
  selected,
  onSelect,
  columns = 3,
  debugMode = false
}: ConfigurationOptionProps) {
  const getGridCols = () => {
    switch (columns) {
      case 2: return 'grid-cols-2';
      case 3: return 'grid-cols-3';
      case 4: return 'grid-cols-4';
      default: return 'grid-cols-3';
    }
  };

  return (
    <div>
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-gray-600 mb-4">{description}</p>
      )}
      
      {type === 'single' && (
        <div className="space-y-2">
          {options.map((option) => (
            <button
              key={option.id}
              onClick={() => onSelect(option.value || option.id)}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                selected === (option.value || option.id)
                  ? 'border-amber-500 bg-amber-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium">{option.name}</p>
                  {option.description && (
                    <p className="text-sm text-gray-500 mt-1">{option.description}</p>
                  )}
                  {debugMode && option.sampleSkus && option.sampleSkus.length > 0 && (
                    <p className="text-xs text-blue-600 mt-1">
                      Sample SKUs: {option.sampleSkus.slice(0, 2).join(', ')}
                      {option.sampleSkus.length > 2 && ` + ${option.sampleSkus.length - 2} more`}
                    </p>
                  )}
                </div>
                <Badge variant="secondary" className="text-xs ml-4">{option.sku}</Badge>
              </div>
            </button>
          ))}
        </div>
      )}

      {type === 'grid' && (
        <div className={`grid ${getGridCols()} gap-4`}>
          {options.map((option) => (
            <button
              key={option.id}
              onClick={() => onSelect(option.value || option.id)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                selected === (option.value || option.id)
                  ? 'border-amber-500 bg-amber-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <p className="font-medium mb-2">{option.name}</p>
              {option.description && (
                <p className="text-xs text-gray-500 mb-2">{option.description}</p>
              )}
              <Badge variant="secondary" className="text-xs">{option.sku}</Badge>
              {debugMode && option.sampleSkus && option.sampleSkus.length > 0 && (
                <p className="text-xs text-blue-600 mt-2">
                  {option.sampleSkus.slice(0, 1).join('')}
                  {option.sampleSkus.length > 1 && ` +${option.sampleSkus.length - 1}`}
                </p>
              )}
            </button>
          ))}
        </div>
      )}

      {type === 'colors' && (
        <div className={`grid ${getGridCols()} gap-4`}>
          {options.map((option) => (
            <button
              key={option.id}
              onClick={() => onSelect(option.value || option.id)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                selected === (option.value || option.id)
                  ? 'border-amber-500 bg-amber-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-3 mb-2">
                <div 
                  className="w-6 h-6 rounded-full border-2 border-gray-200"
                  style={{ backgroundColor: option.color }}
                />
                <span className="font-medium">{option.name}</span>
              </div>
              {option.description && (
                <p className="text-xs text-gray-500 mb-2">{option.description}</p>
              )}
              <Badge variant="secondary" className="text-xs">{option.sku}</Badge>
              {debugMode && option.sampleSkus && option.sampleSkus.length > 0 && (
                <p className="text-xs text-blue-600 mt-2">
                  {option.sampleSkus.slice(0, 1).join('')}
                  {option.sampleSkus.length > 1 && ` +${option.sampleSkus.length - 1}`}
                </p>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}