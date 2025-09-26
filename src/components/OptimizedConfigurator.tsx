/**
 * Optimized Configurator Component
 * Uses single Zustand store with fast selectors and agnostic actions
 */

import React, { useEffect } from 'react';
import {
  useConfiguration,
  useCollections,
  useConfigurationUI,
  useIsLoading,
  useCurrentProduct,
  useProductImage,
  useConfiguratorActions,
  useQuoteActions,
  useConfiguratorStore,
} from '../store/configurator-store';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Skeleton } from './ui/skeleton';
import { Alert, AlertDescription } from './ui/alert';
import { Check, AlertCircle, Loader2, Plus, Minus } from 'lucide-react';

/**
 * Universal Option Button - works with any collection type
 */
const UniversalOptionButton: React.FC<{
  option: any;
  collectionKey: string;
  onSelect: () => void;
}> = ({ option, collectionKey, onSelect }) => {
  const { getOptionState } = useConfiguratorActions();
  const { isSelected, isDisabled } = getOptionState(collectionKey, option.id);

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
          {option.hex_code && (
            <div
              className="w-6 h-6 rounded-full border border-gray-300 flex-shrink-0"
              style={{
                backgroundColor: option.hex_code,
                borderColor: option.hex_code === "#FFFFFF" ? "#e5e5e5" : option.hex_code
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
            
            {option.width && option.height && (
              <div className="text-sm text-gray-600">{option.width}" × {option.height}"</div>
            )}
            
            {!option.description && !option.width && (
              <div className="text-sm text-gray-600">{option.sku_code}</div>
            )}
          </div>
        </div>
        
        <Badge variant="outline" className={collectionKey === 'accessories' ? 'mr-3' : ''}>
          {option.sku_code}
        </Badge>
        
        {/* Multi-select indicator for accessories */}
        {collectionKey === 'accessories' && (
          <div
            className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ml-3 ${
              isSelected
                ? "bg-amber-500 text-white"
                : "border-2 border-gray-300"
            }`}
          >
            {isSelected && <Check className="w-3 h-3" />}
          </div>
        )}
      </div>
    </button>
  );
};

/**
 * Dynamic Collection Section - renders any collection with appropriate UI
 */
const DynamicCollectionSection: React.FC<{
  collectionKey: string;
  uiType: string;
}> = ({ collectionKey, uiType }) => {
  const { selectOption } = useConfiguratorActions();
  const { getCollectionState } = useConfiguratorActions();
  const { availableOptions } = getCollectionState(collectionKey);

  if (!availableOptions || availableOptions.length === 0) {
    return null;
  }

  // Convert collection key to human-readable title
  const title = collectionKey
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();

  const handleOptionSelect = (optionId: number) => {
    selectOption(collectionKey, optionId);
  };

  // Render based on UI type
  switch (uiType) {
    case 'color_picker':
      return (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          <div className="grid grid-cols-3 gap-4">
            {availableOptions.map((option) => (
              <UniversalOptionButton
                key={option.id}
                option={option}
                collectionKey={collectionKey}
                onSelect={() => handleOptionSelect(option.id)}
              />
            ))}
          </div>
        </div>
      );

    case 'preset_buttons':
      return (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          <div className="grid grid-cols-2 gap-4">
            {availableOptions.map((option) => (
              <UniversalOptionButton
                key={option.id}
                option={option}
                collectionKey={collectionKey}
                onSelect={() => handleOptionSelect(option.id)}
              />
            ))}
          </div>
        </div>
      );

    case 'single':
      return (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          <div className="space-y-3">
            {availableOptions.map((option) => (
              <UniversalOptionButton
                key={option.id}
                option={option}
                collectionKey={collectionKey}
                onSelect={() => handleOptionSelect(option.id)}
              />
            ))}
          </div>
        </div>
      );

    default:
      // Default button grid
      return (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          <div className="grid grid-cols-2 gap-4">
            {availableOptions.map((option) => (
              <UniversalOptionButton
                key={option.id}
                option={option}
                collectionKey={collectionKey}
                onSelect={() => handleOptionSelect(option.id)}
              />
            ))}
          </div>
        </div>
      );
  }
};

/**
 * Product Image Display
 */
const ProductImageDisplay: React.FC = () => {
  const productImage = useProductImage();
  const currentProduct = useCurrentProduct();

  if (!productImage && !currentProduct) {
    return (
      <div className="aspect-square bg-gray-50 rounded-lg flex items-center justify-center">
        <div className="text-center text-gray-500">
          <AlertCircle className="w-12 h-12 mx-auto mb-2" />
          <p className="text-sm">Select options to see product</p>
        </div>
      </div>
    );
  }

  return (
    <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden">
      {productImage ? (
        <img
          src={productImage}
          alt="Product"
          className="w-full h-full object-contain"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      )}
    </div>
  );
};

/**
 * Configuration Summary
 */
const ConfigurationSummary: React.FC = () => {
  const configuration = useConfiguration();
  const collections = useCollections();
  const { addToQuote } = useQuoteActions();
  const { isConfigurationComplete, getGeneratedSKU } = useConfiguratorStore((state) => ({
    isConfigurationComplete: state.isConfigurationComplete,
    getGeneratedSKU: state.getGeneratedSKU,
  }));

  const getOptionName = (collectionKey: string, optionId: string) => {
    const options = collections[collectionKey] || [];
    return options.find(opt => opt.id.toString() === optionId)?.name || 'Unknown';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(configuration).map(([collectionKey, value]) => {
          if (Array.isArray(value)) {
            return (
              <div key={collectionKey} className="flex justify-between">
                <span className="text-sm font-medium capitalize">
                  {collectionKey.replace(/([A-Z])/g, ' $1').trim()}:
                </span>
                <div className="flex flex-wrap gap-1">
                  {value.map((id) => (
                    <Badge key={id} variant="outline" className="text-xs">
                      {getOptionName(collectionKey, id)}
                    </Badge>
                  ))}
                </div>
              </div>
            );
          }

          return (
            <div key={collectionKey} className="flex justify-between">
              <span className="text-sm font-medium capitalize">
                {collectionKey.replace(/([A-Z])/g, ' $1').trim()}:
              </span>
              <span className="text-sm text-gray-600">
                {getOptionName(collectionKey, value as string)}
              </span>
            </div>
          );
        })}

        {isConfigurationComplete() && (
          <div className="pt-4 border-t">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Generated SKU:</span>
              <Badge className="bg-green-500 text-white">
                {getGeneratedSKU()}
              </Badge>
            </div>
            <Button 
              onClick={addToQuote}
              className="w-full mt-4 bg-amber-500 hover:bg-amber-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add to Quote
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

/**
 * Quote Management
 */
const QuoteManagement: React.FC = () => {
  const { showQuoteForm, quoteItems, customerInfo } = useConfiguratorStore((state) => ({
    showQuoteForm: state.showQuoteForm,
    quoteItems: state.quoteItems,
    customerInfo: state.customerInfo,
  }));
  const { toggleQuoteForm, removeFromQuote, updateCustomerInfo, clearQuote } = useQuoteActions();

  if (!showQuoteForm) {
    return (
      <Button
        onClick={toggleQuoteForm}
        disabled={quoteItems.length === 0}
        className="bg-amber-500 hover:bg-amber-600 text-white"
      >
        Request Quote ({quoteItems.length})
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>Quote Request</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Quote Items */}
          <div>
            <h4 className="font-medium mb-4">Items ({quoteItems.length})</h4>
            <div className="space-y-2">
              {quoteItems.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-sm">Configuration {index + 1}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFromQuote(index)}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Info */}
          <div className="space-y-4">
            <h4 className="font-medium">Contact Information</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Name</Label>
                <Input
                  value={customerInfo.name}
                  onChange={(e) => updateCustomerInfo('name', e.target.value)}
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => updateCustomerInfo('email', e.target.value)}
                />
              </div>
              <div>
                <Label>Company</Label>
                <Input
                  value={customerInfo.company}
                  onChange={(e) => updateCustomerInfo('company', e.target.value)}
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={customerInfo.phone}
                  onChange={(e) => updateCustomerInfo('phone', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={toggleQuoteForm}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                // Submit quote logic here
                console.log('Quote submitted:', { quoteItems, customerInfo });
                clearQuote();
                toggleQuoteForm();
              }}
              disabled={!customerInfo.name || !customerInfo.email}
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              Submit Quote
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * Main Optimized Configurator
 */
export const OptimizedConfigurator: React.FC<{
  productLineId: number;
}> = ({ productLineId }) => {
  const isLoading = useIsLoading();
  const configurationUI = useConfigurationUI();
  const { loadProductLine } = useConfiguratorActions();

  // Load product line data on mount
  useEffect(() => {
    if (productLineId) {
      loadProductLine(productLineId);
    }
  }, [productLineId, loadProductLine]);

  if (isLoading) {
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Product Visualization */}
      <div className="space-y-6">
        <ProductImageDisplay />
        <ConfigurationSummary />
      </div>

      {/* Configuration Options */}
      <div className="space-y-8">
        {configurationUI
          .sort((a, b) => a.sort - b.sort)
          .map((uiConfig) => (
            <DynamicCollectionSection
              key={uiConfig.id}
              collectionKey={uiConfig.collection}
              uiType={uiConfig.ui_type}
            />
          ))}
      </div>

      {/* Quote Management */}
      <QuoteManagement />
    </div>
  );
};