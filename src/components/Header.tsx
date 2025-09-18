import React from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { ShoppingCart, BarChart3 } from 'lucide-react';

interface ProductLine {
  id: string;
  label: string;
  value: string;
  count: number;
  description: string;
}

interface HeaderProps {
  selectedProduct: string;
  setSelectedProduct: (product: string) => void;
  debugMode: boolean;
  setDebugMode: (debug: boolean) => void;
  quoteItems: any[];
  onShowQuote: () => void;
  onShowAnalytics?: () => void;
  onShowProductLineDebugger?: () => void;
  onShowConfiguratorTest?: () => void;
  onShowDynamicConfiguratorV2?: () => void;
  onShowDynamicConfiguratorV3?: () => void;
  connectionStatus?: string;
  productLines?: ProductLine[];
  productLinesLoading?: boolean;
  currentPage?: string;
  onNavigateHome?: () => void;
}

export function Header({
  selectedProduct,
  setSelectedProduct,
  debugMode,
  setDebugMode,
  quoteItems,
  onShowQuote,
  onShowAnalytics,
  onShowProductLineDebugger,
  onShowConfiguratorTest,
  onShowDynamicConfiguratorV2,
  onShowDynamicConfiguratorV3,
  connectionStatus = 'disconnected',
  productLines = [],
  productLinesLoading = false,
  currentPage = 'configurator',
  onNavigateHome
}: HeaderProps) {
  // Use only dynamic product lines from database - no fallback data
  const displayProductLines = productLines;

  return (
    <header className="sticky top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-4">
            {onNavigateHome && currentPage !== 'configurator' && (
              <button
                onClick={onNavigateHome}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← Back
              </button>
            )}
            <h1 className="text-xl font-semibold text-gray-900">
              {currentPage === 'dynamic-v2'
                ? '🚀 Dynamic Configurator V2'
                : currentPage === 'dynamic-v3'
                  ? '⚡ Dynamic Configurator V3'
                  : 'Product Configurator'}
            </h1>
          </div>

          {currentPage === 'configurator' && (
            <>
              <Select
                value={selectedProduct}
                onValueChange={setSelectedProduct}
                disabled={productLinesLoading || displayProductLines.length === 0}
              >
                <SelectTrigger className="w-64">
                  <SelectValue placeholder={
                    productLinesLoading
                      ? "Loading product lines..."
                      : displayProductLines.length === 0
                        ? "No product lines available"
                        : "Select product line"
                  }>
                    {selectedProduct && displayProductLines.length > 0 && (
                      <span className="font-medium">
                        {displayProductLines.find(option => (option.value || option.id) === selectedProduct)?.label || selectedProduct}
                      </span>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent
                  className="!w-80 !min-w-80 !max-w-80"
                  style={{ width: '320px', minWidth: '320px', maxWidth: '320px' }}
                >
                  {displayProductLines.length === 0 ? (
                    <div className="px-2 py-1.5 text-sm text-gray-500">
                      {productLinesLoading ? "Loading..." : "No product lines available"}
                    </div>
                  ) : (
                    displayProductLines.map(option => (
                      <SelectItem key={option.value || option.id} value={option.value || option.id}>
                        <div className="flex flex-col w-full">
                          <span className="font-medium">{option.label}</span>
                          {option.description && (
                            <span className="text-xs text-gray-500 whitespace-normal leading-relaxed mt-1">
                              {option.description}
                            </span>
                          )}
                          {option.count > 0 && (
                            <span className="text-xs text-[#F59E0B] mt-1">{option.count} SKUs available</span>
                          )}
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>

              {connectionStatus === 'connected' && productLines.length > 0 && (
                <div className="text-xs text-gray-500">
                  {productLines.length} product lines loaded
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Debug</span>
            <Switch checked={debugMode} onCheckedChange={setDebugMode} />
          </div>

          {connectionStatus === 'connected' && onShowAnalytics && (
            <Button 
              variant="outline" 
              onClick={onShowAnalytics}
              size="sm"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </Button>
          )}

          {connectionStatus === 'connected' && onShowConfiguratorTest && (
            <Button 
              variant="outline" 
              onClick={onShowConfiguratorTest}
              size="sm"
              className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
            >
              🧪 API Test
            </Button>
          )}

          {connectionStatus === 'connected' && onShowDynamicConfiguratorV2 && (
            <Button
              variant="outline"
              onClick={onShowDynamicConfiguratorV2}
              size="sm"
              className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
            >
              🚀 Dynamic V2
            </Button>
          )}

          {connectionStatus === 'connected' && onShowDynamicConfiguratorV3 && (
            <Button
              variant="outline"
              onClick={onShowDynamicConfiguratorV3}
              size="sm"
              className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
            >
              ⚡ Dynamic V3
            </Button>
          )}

          <Button 
            variant="outline" 
            onClick={onShowQuote}
            className="relative"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Quote
            {quoteItems.length > 0 && (
              <Badge className="fixed -top-2 -right-2 bg-[#F59E0B] text-white min-w-5 h-5 flex items-center justify-center text-xs">
                {quoteItems.length}
              </Badge>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
