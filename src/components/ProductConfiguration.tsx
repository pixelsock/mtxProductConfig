import React, { useState, useMemo } from 'react';
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
import { buildOrderedComponentConfigs, validateComponentMappings } from '../utils/componentMapping';
import type { ConfigurationUI, ProductOptions } from '../store/types';

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
  configurationUI?: ConfigurationUI[];
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
  configurationUI = [],
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

  // Build dynamic component configurations based on configuration_ui data
  const dynamicComponentConfigs = useMemo(() => {
    if (!configurationUI || configurationUI.length === 0) {
      console.warn('⚠️ No configuration_ui data available - using fallback component order');
      return [];
    }

    // Validate configuration_ui data integrity
    const validation = validateComponentMappings(configurationUI);
    if (!validation.isValid) {
      console.error('❌ Configuration UI data inconsistencies detected:', validation.errors);
      if (debugMode) {
        validation.errors.forEach(error => console.error(`   - ${error}`));
      }
    }

    if (!options || Object.values(options).every(opt => !opt || !Array.isArray(opt) || opt.length === 0)) {
      console.warn('⚠️ No product options available - cannot build component configs');
      return [];
    }

    try {
      // Convert legacy options format to ProductOptions format
      const productOptions: ProductOptions = {
        mirrorControls: options.mirrorControls || [],
        frameColors: options.frameColors || [],
        frameThickness: options.frameThickness || [],
        mirrorStyles: options.mirrorStyles || [],
        mountingOptions: options.mountingOptions || [],
        lightingOptions: options.lightingOptions || [],
        colorTemperatures: options.colorTemperatures || [],
        lightOutputs: options.lightOutputs || [],
        drivers: options.drivers || [],
        accessoryOptions: options.accessories || [],
        sizes: options.sizes || [],
      };

      const configs = buildOrderedComponentConfigs(configurationUI, productOptions);

      if (debugMode) {
        console.log('🎛️ Dynamic component configurations built:', configs);
      }

      return configs;
    } catch (error) {
      console.error('❌ Failed to build dynamic component configurations:', error);
      return [];
    }
  }, [configurationUI, options, debugMode]);
  
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
          {/* Dynamic Configuration Options Rendered from Database */}
          {dynamicComponentConfigs.length > 0 ? (
            dynamicComponentConfigs.map((componentConfig) => {
              const optionsData = options[componentConfig.optionsKey];

              if (!optionsData || !Array.isArray(optionsData) || optionsData.length === 0) {
                if (debugMode) {
                  console.warn(`⚠️ No options data for ${componentConfig.collection} (${componentConfig.optionsKey})`);
                }
                return null;
              }

              return (
                <ConfigurationOption
                  key={componentConfig.collection}
                  title={componentConfig.title}
                  description={componentConfig.description}
                  type={componentConfig.type}
                  options={optionsData.map(opt => ({
                    id: opt.id,
                    name: opt.label,
                    sku: `${opt.count || 0} SKUs`,
                    value: opt.value || opt.id,
                    count: opt.count,
                    description: opt.description,
                    sampleSkus: opt.sampleSkus
                  }))}
                  selected={configuration[componentConfig.configKey]}
                  onSelect={(value) => onUpdateConfiguration(componentConfig.configKey, value)}
                  columns={componentConfig.columns}
                  debugMode={debugMode}
                />
              );
            })
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Dynamic Configuration Unavailable</h3>
              <p className="text-gray-600 mb-6">
                Configuration UI data is missing or invalid. Component ordering cannot be determined from the database.
              </p>
              {debugMode && (
                <div className="text-left bg-gray-50 p-4 rounded-lg mb-4">
                  <p className="text-sm text-gray-700 mb-2">Debug Info:</p>
                  <ul className="text-xs text-gray-600 list-disc list-inside space-y-1">
                    <li>Configuration UI records: {configurationUI.length}</li>
                    <li>Product options available: {Object.keys(options).length}</li>
                    <li>Dynamic component configs built: {dynamicComponentConfigs.length}</li>
                  </ul>
                </div>
              )}
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="border-[#F59E0B] text-[#F59E0B] hover:bg-[#F59E0B] hover:text-white"
              >
                Retry Loading
              </Button>
            </div>
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