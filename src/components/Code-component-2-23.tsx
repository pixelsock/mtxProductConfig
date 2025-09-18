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
  }>;
  selected: string;
  onSelect: (value: string) => void;
  columns?: number;
}

export function ConfigurationOption({
  title,
  description,
  type,
  options,
  selected,
  onSelect,
  columns = 3
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
              onClick={() => onSelect(option.id)}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left flex items-center justify-between ${
                selected === option.id
                  ? 'border-amber-500 bg-amber-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="font-medium">{option.name}</span>
              <Badge variant="secondary" className="text-xs">{option.sku}</Badge>
            </button>
          ))}
        </div>
      )}

      {type === 'grid' && (
        <div className={`grid ${getGridCols()} gap-4`}>
          {options.map((option) => (
            <button
              key={option.id}
              onClick={() => onSelect(option.id)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                selected === option.id
                  ? 'border-amber-500 bg-amber-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <p className="font-medium mb-2">{option.name}</p>
              <Badge variant="secondary" className="text-xs">{option.sku}</Badge>
            </button>
          ))}
        </div>
      )}

      {type === 'colors' && (
        <div className={`grid ${getGridCols()} gap-4`}>
          {options.map((option) => (
            <button
              key={option.id}
              onClick={() => onSelect(option.id)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                selected === option.id
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
              <Badge variant="secondary" className="text-xs">{option.sku}</Badge>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}