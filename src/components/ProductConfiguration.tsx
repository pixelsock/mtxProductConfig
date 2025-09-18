import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ConfigurationOption } from './ConfigurationOption';
import { Alert, AlertDescription } from './ui/alert';
import { Skeleton } from './ui/skeleton';
import { PaginationControls } from './ui/pagination-controls';
import { Plus, Loader2, Database, AlertCircle, Trash2, BarChart3 } from 'lucide-react';
import { emptyConfigurationOptions } from '../hooks/useConfigurationData';

interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

interface ProductConfigurationProps {
  selectedProduct: string;
  configuration: any;
  onUpdateConfiguration: (key: string, value: any) => void;
  onAddToQuote: () => void;
  configurationOptions?: any;
  matchingSKUs?: any[];
  isLoadingOptions?: boolean;
  optionsError?: string | null;
  totalSkus?: number;
  debugMode?: boolean;
  pagination?: PaginationState;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onClearCache?: () => void;
  onGetCacheStats?: () => any;
  // Enhanced dynamic data
  enhancedState?: any;
  enhancedActions?: any;
}

export function ProductConfiguration({
  selectedProduct,
  configuration,
  onUpdateConfiguration,
  onAddToQuote,
  configurationOptions,
  matchingSKUs = [],
  isLoadingOptions = false,
  optionsError = null,
  totalSkus = 0,
  debugMode = false,
  pagination,
  onPageChange,
  onPageSizeChange,
  onClearCache,
  onGetCacheStats,
  enhancedState,
  enhancedActions
}: ProductConfigurationProps) {
  const [showCacheStats, setShowCacheStats] = useState(false);
  // Use only dynamic options from database - no fallback data
  const options = configurationOptions || emptyConfigurationOptions;
  
  const getSelectedOptionLabel = (fieldName: string, value: string) => {
    if (!value || !options) return 'Not selected';
    
    const fieldOptions = options[fieldName] || [];
    const selectedOption = fieldOptions.find(opt => opt.value === value || opt.id === value);
    return selectedOption ? selectedOption.label : value;
  };

  return (
    <div className="space-y-12 pb-24 mb-40" style={{ marginBottom: '10rem' }}>
      {/* Product Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Matrix Mirror Product Configurator
        </h1>
        <p className="text-gray-600 leading-relaxed mb-6">
          Configure your perfect mirror using our comprehensive SKU database. 
          Select from available options to build your ideal lighting solution.
        </p>

        {/* Database Status */}
        {isLoadingOptions && (
          <Alert className="mb-6">
            <Loader2 className="w-4 h-4 animate-spin" />
            <AlertDescription>
              Loading configuration options from database...
            </AlertDescription>
          </Alert>
        )}

        {optionsError && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <AlertDescription className="text-red-700">
              {optionsError} - Configuration options unavailable. Please check database connection.
            </AlertDescription>
          </Alert>
        )}

        {!isLoadingOptions && configurationOptions && totalSkus > 0 && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <Database className="w-4 h-4 text-green-600" />
            <AlertDescription className="text-green-700">
              Loaded {totalSkus} products from database. {matchingSKUs.length} products match your current configuration.
            </AlertDescription>
          </Alert>
        )}

        {!isLoadingOptions && configurationOptions && totalSkus === 0 && (
          <Alert className="mb-6 border-yellow-200 bg-yellow-50">
            <AlertCircle className="w-4 h-4 text-yellow-600" />
            <AlertDescription className="text-yellow-700">
              Database connected but no products found. Please check your product catalog.
            </AlertDescription>
          </Alert>
        )}

        {/* Current Configuration Summary */}
        <Card className="bg-gray-50 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Current Configuration</h3>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <span className="text-sm text-gray-600">Frame Color:</span>
              <p className="font-medium">{getSelectedOptionLabel('frameColors', configuration.frameColor)}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Size:</span>
              <p className="font-medium">{configuration.useCustomSize ? `${configuration.customWidth}" × ${configuration.customHeight}"` : getSelectedOptionLabel('sizes', configuration.size)}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Light Output:</span>
              <p className="font-medium">{getSelectedOptionLabel('lightOutputs', configuration.lightOutput)}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Color Temperature:</span>
              <p className="font-medium">{getSelectedOptionLabel('colorTemperatures', configuration.colorTemperature)}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Mounting:</span>
              <p className="font-medium">{getSelectedOptionLabel('mountingOptions', configuration.mounting)}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Matching SKUs:</span>
              <p className="font-medium text-[#F59E0B]">{matchingSKUs.length} available</p>
            </div>
          </div>
          
          {debugMode && matchingSKUs.length > 0 && (
            <div className="mb-4 p-3 bg-blue-50 rounded border">
              <p className="text-sm font-medium text-blue-900 mb-2">Sample Matching SKUs:</p>
              <div className="text-xs text-blue-700 space-y-1">
                {matchingSKUs.slice(0, 3).map((sku, index) => (
                  <div key={index}>{sku.sku_code}</div>
                ))}
                {matchingSKUs.length > 3 && <div>... and {matchingSKUs.length - 3} more</div>}
              </div>
            </div>
          )}
          
          <Button 
            className="w-full bg-[#F59E0B] hover:bg-[#D97706] text-white"
            onClick={onAddToQuote}
            disabled={matchingSKUs.length === 0}
          >
            <Plus className="w-4 h-4 mr-2" />
            {matchingSKUs.length > 0 ? `Add to Quote - ${matchingSKUs.length} SKU${matchingSKUs.length > 1 ? 's' : ''} Available` : 'No Matching SKUs Available'}
          </Button>
        </Card>
      </div>

      {/* Dynamic Configuration Options */}
      {isLoadingOptions ? (
        <div className="space-y-12">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
              </div>
            </div>
          ))}
        </div>
      ) : !options || Object.values(options).every(opt => !opt || !Array.isArray(opt) || opt.length === 0) ? (
        <div className="text-center py-12">
          <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Configuration Options Available</h3>
          <p className="text-gray-600 mb-6">
            Please check your database connection or contact your administrator to load product configuration options.
          </p>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            className="border-[#F59E0B] text-[#F59E0B] hover:bg-[#F59E0B] hover:text-white"
          >
            Retry Connection
          </Button>
        </div>
      ) : (
        <>
          {/* Frame Colors */}
          {options.frameColors && options.frameColors.length > 0 && (
            <ConfigurationOption
              title="Frame Color"
              description={`Choose from ${options.frameColors.length} available frame colors`}
              type="grid"
              options={options.frameColors.map(opt => ({
                id: opt.id,
                name: opt.label,
                sku: `${opt.count} SKUs`,
                value: opt.value || opt.id,
                count: opt.count,
                description: opt.description,
                sampleSkus: opt.sampleSkus
              }))}
              selected={configuration.frameColor}
              onSelect={(value) => onUpdateConfiguration('frameColor', value)}
              columns={2}
              debugMode={debugMode}
            />
          )}

          {/* Sizes */}
          {options.sizes && options.sizes.length > 0 && (
            <ConfigurationOption
              title="Size"
              description={`Choose from ${options.sizes.length} available sizes`}
              type="grid"
              options={options.sizes.map(opt => ({
                id: opt.id,
                name: opt.label,
                sku: `${opt.count} SKUs`,
                value: opt.value || opt.id,
                count: opt.count,
                description: opt.description,
                sampleSkus: opt.sampleSkus
              }))}
              selected={configuration.size}
              onSelect={(value) => onUpdateConfiguration('size', value)}
              columns={2}
              debugMode={debugMode}
            />
          )}

          {/* Light Outputs */}
          {options.lightOutputs && options.lightOutputs.length > 0 && (
            <ConfigurationOption
              title="Light Output"
              description={`Choose from ${options.lightOutputs.length} available light output options`}
              type="single"
              options={options.lightOutputs.map(opt => ({
                id: opt.id,
                name: opt.label,
                sku: `${opt.count} SKUs`,
                value: opt.value
              }))}
              selected={configuration.lightOutput}
              onSelect={(value) => onUpdateConfiguration('lightOutput', value)}
            />
          )}

          {/* Color Temperatures */}
          {options.colorTemperatures && options.colorTemperatures.length > 0 && (
            <ConfigurationOption
              title="Color Temperature"
              description={`Choose from ${options.colorTemperatures.length} available color temperatures`}
              type="single"
              options={options.colorTemperatures.map(opt => ({
                id: opt.id,
                name: opt.label,
                sku: `${opt.count} SKUs`,
                value: opt.value
              }))}
              selected={configuration.colorTemperature}
              onSelect={(value) => onUpdateConfiguration('colorTemperature', value)}
            />
          )}

          {/* Mounting Options */}
          {options.mountingOptions && options.mountingOptions.length > 0 && (
            <ConfigurationOption
              title="Mounting Options"
              description={`Choose from ${options.mountingOptions.length} available mounting options`}
              type="single"
              options={options.mountingOptions.map(opt => ({
                id: opt.id,
                name: opt.label,
                sku: `${opt.count} SKUs`,
                value: opt.value
              }))}
              selected={configuration.mounting}
              onSelect={(value) => onUpdateConfiguration('mounting', value)}
            />
          )}

          {/* Accessories */}
          {options.accessories && options.accessories.length > 0 && (
            <ConfigurationOption
              title="Accessories"
              description={`Choose from ${options.accessories.length} available accessories`}
              type="single"
              options={options.accessories.map(opt => ({
                id: opt.id,
                name: opt.label,
                sku: `${opt.count} SKUs`,
                value: opt.value
              }))}
              selected={configuration.accessory}
              onSelect={(value) => onUpdateConfiguration('accessory', value)}
            />
          )}

          {/* Drivers */}
          {options.drivers && options.drivers.length > 0 && (
            <ConfigurationOption
              title="Drivers"
              description={`Choose from ${options.drivers.length} available drivers`}
              type="single"
              options={options.drivers.map(opt => ({
                id: opt.id,
                name: opt.label,
                sku: `${opt.count} SKUs`,
                value: opt.value
              }))}
              selected={configuration.driver}
              onSelect={(value) => onUpdateConfiguration('driver', value)}
            />
          )}

          {/* Mirror Styles */}
          {options.mirrorStyles && options.mirrorStyles.length > 0 && (
            <ConfigurationOption
              title="Mirror Styles"
              description={`Choose from ${options.mirrorStyles.length} available mirror styles`}
              type="single"
              options={options.mirrorStyles.map(opt => ({
                id: opt.id,
                name: opt.label,
                sku: `${opt.count} SKUs`,
                value: opt.value
              }))}
              selected={configuration.mirrorStyle}
              onSelect={(value) => onUpdateConfiguration('mirrorStyle', value)}
            />
          )}
        </>
      )}

      {/* Custom Size Option */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-2">Custom Dimensions</h3>
        <p className="text-gray-600 mb-4">Specify custom dimensions if needed</p>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-2 py-2">
            <Switch
              checked={configuration.useCustomSize}
              onCheckedChange={(checked) => onUpdateConfiguration('useCustomSize', checked)}
            />
            <Label>Use custom size</Label>
          </div>

          {configuration.useCustomSize && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <Label htmlFor="customWidth">Width (inches)</Label>
                <Input
                  id="customWidth"
                  type="number"
                  placeholder="24"
                  value={configuration.customWidth}
                  onChange={(e) => onUpdateConfiguration('customWidth', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="customHeight">Height (inches)</Label>
                <Input
                  id="customHeight"
                  type="number"
                  placeholder="32"
                  value={configuration.customHeight}
                  onChange={(e) => onUpdateConfiguration('customHeight', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cache Management (Debug Mode Only) */}
      {debugMode && (onClearCache || onGetCacheStats) && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Cache Management</h3>
            <div className="flex items-center space-x-2">
              {onClearCache && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClearCache}
                  className="flex items-center space-x-1"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear Cache</span>
                </Button>
              )}
              {onGetCacheStats && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCacheStats(!showCacheStats)}
                  className="flex items-center space-x-1"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Cache Stats</span>
                </Button>
              )}
            </div>
          </div>
          
          {showCacheStats && onGetCacheStats && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Cache Statistics</h4>
              <pre className="text-xs text-gray-600 overflow-auto">
                {JSON.stringify(onGetCacheStats(), null, 2)}
              </pre>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}