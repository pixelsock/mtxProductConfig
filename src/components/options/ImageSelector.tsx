import React, { useState } from 'react';
import { Check, Eye, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { ImageSelectorProps } from './OptionTypeRegistry';

interface ImageOption {
  id: number;
  name: string;
  image_url?: string;
  thumbnail_url?: string;
  sku_code?: string;
  description?: string;
  alt_text?: string;
}

export const ImageSelector: React.FC<ImageSelectorProps> = ({
  collection,
  label,
  value,
  options,
  onChange,
  disabled = false,
  required = false,
  className,
  variant = 'grid',
  showLabels = true,
  showDescriptions = false,
  columns = 3,
  imageSize = 'medium',
  allowPreview = true
}) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageLoadErrors, setImageLoadErrors] = useState<Set<number>>(new Set());
  
  const currentValue = Array.isArray(value) ? value[0] : value;
  
  const handleImageSelect = (optionId: string) => {
    if (!disabled) {
      onChange(optionId);
    }
  };

  const handleImageError = (optionId: number) => {
    setImageLoadErrors(prev => new Set(prev).add(optionId));
  };

  const handlePreview = (imageUrl: string) => {
    if (allowPreview) {
      setPreviewImage(imageUrl);
    }
  };

  const closePreview = () => {
    setPreviewImage(null);
  };

  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-24 h-24',
    large: 'w-32 h-32',
    xlarge: 'w-40 h-40'
  };

  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6'
  };

  const renderImageOption = (option: ImageOption, index: number) => {
    const isSelected = currentValue === option.id.toString();
    const hasError = imageLoadErrors.has(option.id);
    const imageUrl = option.thumbnail_url || option.image_url;
    const fullImageUrl = option.image_url || option.thumbnail_url;
    
    const baseClasses = cn(
      'group relative cursor-pointer transition-all border-2 rounded-lg overflow-hidden',
      isSelected 
        ? 'border-gray-900 ring-2 ring-gray-900 ring-offset-2' 
        : 'border-gray-200 hover:border-gray-300',
      disabled && 'opacity-50 cursor-not-allowed',
      variant === 'list' && 'flex items-center gap-3 p-3'
    );

    return (
      <div key={option.id} className={baseClasses}>
        <button
          type="button"
          onClick={() => handleImageSelect(option.id.toString())}
          disabled={disabled}
          className={cn(
            'w-full h-full flex flex-col items-center justify-center focus:outline-none',
            variant === 'list' && 'flex-row text-left'
          )}
          aria-label={option.alt_text || option.name}
        >
          {/* Image container */}
          <div className={cn(
            'relative bg-gray-100 flex items-center justify-center overflow-hidden',
            variant === 'grid' ? `${sizeClasses[imageSize]} w-full` : sizeClasses.small,
            variant === 'grid' && 'rounded-t-md',
            variant === 'list' && 'rounded-md flex-shrink-0'
          )}>
            {imageUrl && !hasError ? (
              <>
                <img
                  src={imageUrl}
                  alt={option.alt_text || option.name}
                  className="w-full h-full object-cover"
                  onError={() => handleImageError(option.id)}
                  loading="lazy"
                />
                
                {/* Preview button overlay */}
                {allowPreview && fullImageUrl && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePreview(fullImageUrl);
                    }}
                    className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                    aria-label="Preview image"
                  >
                    <Eye className="w-6 h-6 text-white" />
                  </button>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-400">
                <div className="w-8 h-8 bg-gray-300 rounded-md mb-1" />
                <span className="text-xs">No image</span>
              </div>
            )}
            
            {/* Selection indicator */}
            {isSelected && (
              <div className="absolute top-1 right-1 w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
          
          {/* Labels and descriptions */}
          {(showLabels || showDescriptions) && (
            <div className={cn(
              'p-2 text-center',
              variant === 'list' && 'flex-1 text-left pl-0'
            )}>
              {showLabels && (
                <div className={cn(
                  'font-medium text-gray-900 truncate',
                  variant === 'grid' ? 'text-sm' : 'text-base'
                )}>
                  {option.name}
                </div>
              )}
              
              {showDescriptions && option.description && (
                <div className={cn(
                  'text-gray-500 truncate mt-0.5',
                  variant === 'grid' ? 'text-xs' : 'text-sm'
                )}>
                  {option.description}
                </div>
              )}
              
              {option.sku_code && (
                <div className={cn(
                  'text-gray-400 font-mono mt-0.5',
                  variant === 'grid' ? 'text-xs' : 'text-sm'
                )}>
                  {option.sku_code}
                </div>
              )}
            </div>
          )}
        </button>
      </div>
    );
  };

  return (
    <>
      <div className={cn('space-y-3', className)}>
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        <div className={cn(
          variant === 'grid' 
            ? `grid gap-4 ${gridCols[columns as keyof typeof gridCols] || 'grid-cols-3'}`
            : 'space-y-2'
        )}>
          {options.map((option: ImageOption, index) => renderImageOption(option, index))}
        </div>
        
        {/* Selected item summary */}
        {currentValue && (
          <div className="bg-gray-50 rounded-lg p-3">
            {(() => {
              const selectedOption = options.find((opt: ImageOption) => 
                opt.id.toString() === currentValue
              );
              
              if (!selectedOption) return null;
              
              return (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
                    {selectedOption.thumbnail_url || selectedOption.image_url ? (
                      <img
                        src={selectedOption.thumbnail_url || selectedOption.image_url}
                        alt={selectedOption.alt_text || selectedOption.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <div className="w-4 h-4 bg-gray-300 rounded" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900">
                      Selected: {selectedOption.name}
                    </div>
                    {selectedOption.description && (
                      <div className="text-sm text-gray-600 truncate">
                        {selectedOption.description}
                      </div>
                    )}
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => handleImageSelect('')}
                    disabled={disabled}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                    aria-label="Clear selection"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Image preview modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="relative max-w-4xl max-h-[90vh] p-4">
            <button
              type="button"
              onClick={closePreview}
              className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors"
              aria-label="Close preview"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
            
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
          
          {/* Click outside to close */}
          <div
            className="absolute inset-0 -z-10"
            onClick={closePreview}
          />
        </div>
      )}
    </>
  );
};