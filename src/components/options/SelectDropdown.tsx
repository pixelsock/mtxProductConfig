import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { SelectProps } from './OptionTypeRegistry';

interface SelectOption {
  id: number;
  name: string;
  sku_code?: string;
  description?: string;
  value?: string;
}

export const SelectDropdown: React.FC<SelectProps> = ({
  collection,
  label,
  value,
  options,
  onChange,
  disabled = false,
  required = false,
  className,
  placeholder = 'Select an option...',
  searchable = false,
  clearable = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const currentValue = Array.isArray(value) ? value[0] : value;
  const selectedOption = options.find((opt: SelectOption) => 
    opt.id.toString() === currentValue
  );

  // Filter options based on search query
  const filteredOptions = searchable && searchQuery 
    ? options.filter((option: SelectOption) =>
        option.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (option.description && option.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : options;

  const handleOptionSelect = (optionId: string) => {
    if (!disabled) {
      onChange(optionId);
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!disabled && clearable) {
      onChange('');
      setSearchQuery('');
    }
  };

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen && searchable) {
        // Focus search input when opening
        setTimeout(() => searchInputRef.current?.focus(), 0);
      }
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className={cn('space-y-2', className)}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={handleToggle}
          disabled={disabled}
          className={cn(
            'relative w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors',
            disabled && 'bg-gray-50 cursor-not-allowed opacity-50',
            isOpen && 'ring-2 ring-gray-500 border-gray-500'
          )}
        >
          <div className="flex items-center justify-between">
            <span className={cn(
              'block truncate',
              selectedOption ? 'text-gray-900' : 'text-gray-500'
            )}>
              {selectedOption ? selectedOption.name : placeholder}
            </span>
            
            <div className="flex items-center gap-1">
              {clearable && selectedOption && !disabled && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <X className="w-3 h-3 text-gray-400" />
                </button>
              )}
              <ChevronDown className={cn(
                'w-4 h-4 text-gray-400 transition-transform',
                isOpen && 'rotate-180'
              )} />
            </div>
          </div>
        </button>

        {isOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md border border-gray-200 overflow-hidden">
            {searchable && (
              <div className="p-2 border-b border-gray-100">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search options..."
                  className="w-full px-3 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
                />
              </div>
            )}
            
            <div className="max-h-48 overflow-auto">
              {filteredOptions.length === 0 ? (
                <div className="py-2 px-3 text-sm text-gray-500">
                  {searchQuery ? 'No matching options found' : 'No options available'}
                </div>
              ) : (
                filteredOptions.map((option: SelectOption) => {
                  const isSelected = currentValue === option.id.toString();
                  
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handleOptionSelect(option.id.toString())}
                      className={cn(
                        'w-full text-left px-3 py-2 hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors',
                        isSelected && 'bg-gray-100'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {option.name}
                          </div>
                          {option.description && (
                            <div className="text-xs text-gray-500 truncate">
                              {option.description}
                            </div>
                          )}
                          {option.sku_code && (
                            <div className="text-xs text-gray-400 font-mono">
                              SKU: {option.sku_code}
                            </div>
                          )}
                        </div>
                        {isSelected && (
                          <Check className="w-4 h-4 text-gray-900 ml-2" />
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Show selected option details */}
      {selectedOption?.description && (
        <div className="text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded">
          {selectedOption.description}
        </div>
      )}
    </div>
  );
};