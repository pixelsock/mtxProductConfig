/**
 * Server-Driven Configurator Component
 * 
 * Fully dynamic configurator that adapts to any database schema
 * using server-side logic and canonical naming conventions.
 */

import React from 'react';
import { useDynamicConfigurator } from '../hooks/useDynamicConfigurator';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Skeleton } from './ui/skeleton';
import { Alert, AlertDescription } from './ui/alert';
import { Check, AlertCircle, Loader2 } from 'lucide-react';

interface ServerDrivenConfiguratorProps {
  productLineId: number;
  onConfigurationComplete?: (selections: Record<string, any>) => void;
}

/**
 * Generic option button that works with any collection
 */
const UniversalOptionButton: React.FC<{
  option: any;
  isSelected: boolean;
  isDisabled: boolean;
  onSelect: () => void;
  variant?: 'default' | 'color' | 'size';
}> = ({ option, isSelected, isDisabled, onSelect, variant = 'default' }) => {
  const baseClasses = [
    'w-full p-4 rounded-lg border-2 transition-all duration-200 text-left',
    isSelected 
      ? 'border-amber-500 bg-amber-50'
      : isDisabled 
        ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
  ].join(' ');

  return (
    <button
      onClick={onSelect}
      disabled={isDisabled}
      className={baseClasses}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1">
          
          {/* Color indicator for color options */}
          {variant === 'color' && option.hexCode && (
            <div
              className="w-6 h-6 rounded-full border border-gray-300 flex-shrink-0"
              style={{
                backgroundColor: option.hexCode,
                borderColor: option.hexCode === "#FFFFFF" ? "#e5e5e5" : option.hexCode
              }}
            />
          )}
          
          <div className="flex-1">
            <div className={`font-medium mb-1 ${isDisabled ? 'text-gray-400' : 'text-gray-900'}`}>
              {option.name}
              {isDisabled && <span className="text-xs ml-2">(Not available)</span>}
            </div>
            
            {option.description && (
              <div className="text-sm text-gray-600">{option.description}</div>
            )}
            
            {variant === 'size' && option.width && option.height && (
              <div className="text-sm text-gray-600">{option.width}" × {option.height}"</div>
            )}
          </div>
        </div>
        
        <Badge variant="outline">
          {option.skuCode}
        </Badge>
      </div>
    </button>
  );
};

/**
 * Dynamic collection renderer that adapts to any UI type
 */
const DynamicCollectionSection: React.FC<{
  collectionKey: string;
  options: any[];
  uiType: string;
  currentSelections: Record<string, any>;
  disabledOptions: number[];
  onSelectionChange: (collection: string, value: any) => void;
}> = ({ 
  collectionKey, 
  options, 
  uiType, 
  currentSelections, 
  disabledOptions,
  onSelectionChange 
}) => {
  if (!options || options.length === 0) return null;

  // Convert camelCase collection key to human-readable title
  const title = collectionKey
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();

  const currentValue = currentSelections[collectionKey];

  // Determine variant based on collection type
  const getVariant = () => {
    if (collectionKey.toLowerCase().includes('color')) return 'color';
    if (collectionKey.toLowerCase().includes('size')) return 'size';
    return 'default';
  };

  const variant = getVariant();

  // Render based on UI type
  switch (uiType) {
    case 'button_grid':
      return (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          <div className="grid grid-cols-2 gap-4">
            {options.map((option) => {
              const isSelected = currentValue === option.id.toString();
              const isDisabled = disabledOptions.includes(option.id);
              
              return (
                <UniversalOptionButton
                  key={option.id}
                  option={option}
                  isSelected={isSelected}
                  isDisabled={isDisabled}
                  onSelect={() => !isDisabled && onSelectionChange(collectionKey, option.id.toString())}
                  variant={variant}
                />
              );
            })}
          </div>
        </div>
      );

    case 'color_picker':
      return (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          <div className="grid grid-cols-3 gap-4">
            {options.map((option) => {
              const isSelected = currentValue === option.id.toString();
              const isDisabled = disabledOptions.includes(option.id);
              
              return (
                <UniversalOptionButton
                  key={option.id}
                  option={option}
                  isSelected={isSelected}
                  isDisabled={isDisabled}
                  onSelect={() => !isDisabled && onSelectionChange(collectionKey, option.id.toString())}
                  variant="color"
                />
              );
            })}
          </div>
        </div>
      );

    case 'single':
      return (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          <div className="space-y-3">
            {options.map((option) => {
              const isSelected = Array.isArray(currentValue) 
                ? currentValue.includes(option.id.toString())
                : currentValue === option.id.toString();
              const isDisabled = disabledOptions.includes(option.id);
              
              return (
                <div key={option.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                        isSelected
                          ? "bg-amber-500 text-white"
                          : "border-2 border-gray-300"
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>
                    <div>
                      <div className={`font-medium ${isDisabled ? 'text-gray-400' : 'text-gray-900'}`}>
                        {option.name}
                      </div>
                      {option.description && (
                        <div className="text-sm text-gray-600">{option.description}</div>
                      )}
                    </div>
                  </div>
                  <Badge variant="outline">{option.skuCode}</Badge>
                </div>
              );
            })}
          </div>
        </div>
      );

    default:
      // Fallback to button grid for unknown UI types
      return (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          <div className="grid grid-cols-1 gap-4">
            {options.map((option) => {
              const isSelected = currentValue === option.id.toString();
              const isDisabled = disabledOptions.includes(option.id);
              
              return (
                <UniversalOptionButton
                  key={option.id}
                  option={option}
                  isSelected={isSelected}
                  isDisabled={isDisabled}
                  onSelect={() => !isDisabled && onSelectionChange(collectionKey, option.id.toString())}
                  variant={variant}
                />
              );
            })}
          </div>
        </div>
      );
  }
};

export const ServerDrivenConfigurator: React.FC<ServerDrivenConfiguratorProps> = ({
  productLineId,
  onConfigurationComplete
}) => {
  const {
    schema,
    filteredOptions,
    productImage,
    isLoading,
    error,
    currentSelections,
    isConfigurationComplete,
    availableCollections,
    totalDisabledOptions,
    updateSelection,
    clearSelection,
    resetConfiguration,
    refreshData
  } = useDynamicConfigurator(productLineId);

  // Notify parent when configuration is complete
  useEffect(() => {
    if (isConfigurationComplete && onConfigurationComplete) {
      onConfigurationComplete(currentSelections);
    }
  }, [isConfigurationComplete, currentSelections, onConfigurationComplete]);

  if (isLoading && !schema) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshData}
            className="ml-4"
          >
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // Get configuration UI settings from filtered options
  const configurationUI = filteredOptions?.options?.configurationUi || [];

  return (
    <div className="space-y-8">
      {/* Configuration Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Configuration Status
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Collections:</span>
              <span className="ml-2 font-medium">{availableCollections.length}</span>
            </div>
            <div>
              <span className="text-gray-600">Disabled Options:</span>
              <span className="ml-2 font-medium">{totalDisabledOptions}</span>
            </div>
            <div>
              <span className="text-gray-600">Selections Made:</span>
              <span className="ml-2 font-medium">{Object.keys(currentSelections).length}</span>
            </div>
            <div>
              <span className="text-gray-600">Complete:</span>
              <span className={`ml-2 font-medium ${isConfigurationComplete ? 'text-green-600' : 'text-gray-400'}`}>
                {isConfigurationComplete ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
          
          {filteredOptions?.appliedRules && filteredOptions.appliedRules.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <div className="text-sm text-gray-600">Applied Rules:</div>
              <div className="flex flex-wrap gap-2 mt-2">
                {filteredOptions.appliedRules.map((rule) => (
                  <Badge key={rule.id} variant="outline" className="text-xs">
                    {rule.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Product Image */}
      {productImage && (
        <Card>
          <CardContent className="p-6">
            <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden">
              {productImage.verticalImage || productImage.horizontalImage ? (
                <img
                  src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/images/${
                    productImage.recommendedOrientation === 'horizontal' 
                      ? productImage.horizontalImage 
                      : productImage.verticalImage
                  }`}
                  alt={productImage.productName}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <AlertCircle className="w-12 h-12" />
                  <span className="ml-2">No image available</span>
                </div>
              )}
            </div>
            <div className="mt-4 text-center">
              <div className="font-medium">{productImage.productName}</div>
              <div className="text-sm text-gray-600">
                {productImage.recommendedOrientation} orientation
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dynamic Configuration Options */}
      <div className="space-y-8">
        {configurationUI
          .sort((a: any, b: any) => a.sort - b.sort)
          .map((uiConfig: any) => {
            const collectionKey = uiConfig.collection;
            const options = schema[collectionKey] || [];
            const disabledOptions = filteredOptions?.disabledOptions?.[collectionKey] || [];

            if (options.length === 0) return null;

            return (
              <DynamicCollectionSection
                key={uiConfig.id}
                collectionKey={collectionKey}
                options={options}
                uiType={uiConfig.uiType}
                currentSelections={currentSelections}
                disabledOptions={disabledOptions}
                onSelectionChange={updateSelection}
              />
            );
          })}
      </div>

      {/* Configuration Actions */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-x-4">
              <Button variant="outline" onClick={resetConfiguration}>
                Reset Configuration
              </Button>
              <Button variant="outline" onClick={refreshData}>
                Refresh Data
              </Button>
            </div>
            
            {isConfigurationComplete && (
              <Badge className="bg-green-500 text-white">
                Configuration Complete
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * Dynamic collection section component
 */
const DynamicCollectionSection: React.FC<{
  collectionKey: string;
  options: any[];
  uiType: string;
  currentSelections: Record<string, any>;
  disabledOptions: number[];
  onSelectionChange: (collection: string, value: any) => void;
}> = ({ 
  collectionKey, 
  options, 
  uiType, 
  currentSelections, 
  disabledOptions,
  onSelectionChange 
}) => {
  // Convert camelCase to human-readable title
  const title = collectionKey
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();

  const currentValue = currentSelections[collectionKey];

  // Determine variant based on collection
  const variant = collectionKey.toLowerCase().includes('color') ? 'color' :
                 collectionKey.toLowerCase().includes('size') ? 'size' : 'default';

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
      
      {uiType === 'color_picker' ? (
        <div className="grid grid-cols-3 gap-4">
          {options.map((option) => {
            const isSelected = currentValue === option.id.toString();
            const isDisabled = disabledOptions.includes(option.id);
            
            return (
              <UniversalOptionButton
                key={option.id}
                option={option}
                isSelected={isSelected}
                isDisabled={isDisabled}
                onSelect={() => onSelectionChange(collectionKey, option.id.toString())}
                variant="color"
              />
            );
          })}
        </div>
      ) : uiType === 'single' ? (
        <div className="space-y-3">
          {options.map((option) => {
            const isSelected = Array.isArray(currentValue) 
              ? currentValue.includes(option.id.toString())
              : currentValue === option.id.toString();
            const isDisabled = disabledOptions.includes(option.id);
            
            return (
              <div key={option.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                      isSelected
                        ? "bg-amber-500 text-white"
                        : "border-2 border-gray-300"
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                  </div>
                  <div>
                    <div className={`font-medium ${isDisabled ? 'text-gray-400' : 'text-gray-900'}`}>
                      {option.name}
                    </div>
                    {option.description && (
                      <div className="text-sm text-gray-600">{option.description}</div>
                    )}
                  </div>
                </div>
                <Badge variant="outline">{option.skuCode}</Badge>
              </div>
            );
          })}
        </div>
      ) : (
        // Default button grid
        <div className="grid grid-cols-2 gap-4">
          {options.map((option) => {
            const isSelected = currentValue === option.id.toString();
            const isDisabled = disabledOptions.includes(option.id);
            
            return (
              <UniversalOptionButton
                key={option.id}
                option={option}
                isSelected={isSelected}
                isDisabled={isDisabled}
                onSelect={() => onSelectionChange(collectionKey, option.id.toString())}
                variant={variant}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};