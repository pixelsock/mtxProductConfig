import React, { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
import type { TextInputProps } from './OptionTypeRegistry';

interface TextOption {
  id: number;
  name: string;
  value?: string;
  sku_code?: string;
  description?: string;
  placeholder?: string;
}

export const TextInput: React.FC<TextInputProps> = ({
  collection,
  label,
  value,
  options,
  onChange,
  disabled = false,
  required = false,
  className,
  placeholder = 'Enter text...',
  multiline = false,
  maxLength,
  minLength,
  pattern,
  inputType = 'text',
  autoComplete = 'off'
}) => {
  const currentValue = Array.isArray(value) ? value[0] : value || '';
  const [localValue, setLocalValue] = useState(currentValue);
  const [isValid, setIsValid] = useState(true);
  const [validationMessage, setValidationMessage] = useState('');

  // Sync with external value changes
  useEffect(() => {
    setLocalValue(currentValue);
  }, [currentValue]);

  const validateInput = (inputValue: string): { isValid: boolean; message: string } => {
    // Required field validation
    if (required && !inputValue.trim()) {
      return { isValid: false, message: 'This field is required' };
    }

    // Length validations
    if (minLength && inputValue.length < minLength) {
      return { isValid: false, message: `Minimum ${minLength} characters required` };
    }

    if (maxLength && inputValue.length > maxLength) {
      return { isValid: false, message: `Maximum ${maxLength} characters allowed` };
    }

    // Pattern validation
    if (pattern && inputValue && !new RegExp(pattern).test(inputValue)) {
      return { isValid: false, message: 'Invalid format' };
    }

    // Email validation
    if (inputType === 'email' && inputValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputValue)) {
      return { isValid: false, message: 'Invalid email format' };
    }

    // URL validation
    if (inputType === 'url' && inputValue) {
      try {
        new URL(inputValue);
      } catch {
        return { isValid: false, message: 'Invalid URL format' };
      }
    }

    return { isValid: true, message: '' };
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);

    // Validate input
    const validation = validateInput(newValue);
    setIsValid(validation.isValid);
    setValidationMessage(validation.message);
  };

  const handleInputBlur = () => {
    if (disabled) return;

    // Final validation and commit
    const validation = validateInput(localValue);
    setIsValid(validation.isValid);
    setValidationMessage(validation.message);

    // Only commit valid values
    if (validation.isValid) {
      onChange(localValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle Enter key submission for single-line inputs
    if (!multiline && e.key === 'Enter') {
      e.preventDefault();
      handleInputBlur();
    }
  };

  // Get placeholder from options or prop
  const effectivePlaceholder = options?.[0]?.placeholder || placeholder;

  const inputClasses = cn(
    'w-full px-3 py-2 border rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500',
    isValid 
      ? 'border-gray-300 focus:border-gray-500' 
      : 'border-red-300 focus:border-red-500 focus:ring-red-500',
    disabled && 'bg-gray-50 cursor-not-allowed opacity-50',
    multiline && 'resize-y min-h-[80px]'
  );

  const InputComponent = multiline ? 'textarea' : 'input';

  return (
    <div className={cn('space-y-2', className)}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
        {maxLength && (
          <span className="text-xs text-gray-500 ml-2">
            ({localValue.length}/{maxLength})
          </span>
        )}
      </label>
      
      <div className="relative">
        <InputComponent
          {...(multiline ? {} : { type: inputType })}
          value={localValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          placeholder={effectivePlaceholder}
          disabled={disabled}
          required={required}
          maxLength={maxLength}
          minLength={minLength}
          pattern={pattern}
          autoComplete={autoComplete}
          className={inputClasses}
          aria-invalid={!isValid}
          aria-describedby={validationMessage ? `${collection}-error` : undefined}
        />
        
        {/* Character counter for textarea */}
        {multiline && maxLength && (
          <div className="absolute bottom-2 right-2 text-xs text-gray-400 bg-white px-1">
            {localValue.length}/{maxLength}
          </div>
        )}
      </div>
      
      {/* Validation message */}
      {validationMessage && (
        <div id={`${collection}-error`} className="text-sm text-red-600">
          {validationMessage}
        </div>
      )}
      
      {/* Input type help text */}
      {inputType === 'email' && !validationMessage && (
        <div className="text-xs text-gray-500">
          Enter a valid email address (e.g., user@example.com)
        </div>
      )}
      
      {inputType === 'url' && !validationMessage && (
        <div className="text-xs text-gray-500">
          Enter a complete URL (e.g., https://example.com)
        </div>
      )}
      
      {inputType === 'tel' && !validationMessage && (
        <div className="text-xs text-gray-500">
          Enter a phone number
        </div>
      )}
      
      {/* Option-based help text */}
      {options?.[0]?.description && !validationMessage && (
        <div className="text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded">
          {options[0].description}
        </div>
      )}
      
      {/* Preset values from options */}
      {options && options.length > 1 && (
        <div className="space-y-2">
          <div className="text-xs font-medium text-gray-700">Quick Options:</div>
          <div className="flex flex-wrap gap-2">
            {options.map((option: TextOption) => {
              if (!option.value) return null;
              
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    if (!disabled) {
                      setLocalValue(option.value || '');
                      onChange(option.value || '');
                    }
                  }}
                  disabled={disabled}
                  className={cn(
                    'px-3 py-1 text-xs border rounded-full transition-colors',
                    localValue === option.value
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400',
                    disabled && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {option.name}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};