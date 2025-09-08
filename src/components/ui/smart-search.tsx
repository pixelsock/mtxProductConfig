/**
 * Smart Search Component
 * 
 * Provides intelligent SKU search and configuration testing capabilities
 * using the smart configurator service.
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Search, X, Loader2, AlertCircle, CheckCircle2, Copy, RefreshCw } from 'lucide-react';
import { Button } from './button';
import { Input } from './input';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Separator } from './separator';
import { Alert, AlertDescription } from './alert';
import { useSmartConfigurator, useSkuSearch } from '../../hooks/useSmartConfigurator';
import { type SmartConfig } from '../../services/smart-configurator';

export interface SmartSearchProps {
  /** Callback when a configuration is selected */
  onConfigurationSelect?: (config: SmartConfig, sku: string) => void;
  /** Show expanded view with combination generation */
  showAdvanced?: boolean;
  /** CSS class name */
  className?: string;
}

export function SmartSearch({
  onConfigurationSelect,
  showAdvanced = false,
  className
}: SmartSearchProps) {
  const [activeTab, setActiveTab] = useState<'search' | 'generate'>('search');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [combinationLimit, setCombinationLimit] = useState(50);
  const [generatedCombinations, setGeneratedCombinations] = useState<SmartConfig[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Use search hook
  const { query, results, isSearching, search, clearSearch } = useSkuSearch();
  
  // Use smart configurator for combination generation
  const smartConfig = useSmartConfigurator(
    {},
    { debug: true, autoFilter: false } // Disable auto-filter for search use case
  );

  // Handle search input
  const handleSearch = useCallback((value: string) => {
    if (value.trim()) {
      search(value.trim());
    } else {
      clearSearch();
    }
  }, [search, clearSearch]);

  // Handle search input changes with debouncing
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length >= 2 || value.length === 0) {
      handleSearch(value);
    }
  }, [handleSearch]);

  // Handle configuration selection
  const handleSelectConfiguration = useCallback((config: SmartConfig, sku: string) => {
    onConfigurationSelect?.(config, sku);
  }, [onConfigurationSelect]);

  // Generate combinations for a product
  const handleGenerateCombinations = useCallback(async () => {
    if (!selectedProductId) return;
    
    const productId = parseInt(selectedProductId, 10);
    if (isNaN(productId)) return;

    try {
      const combinations = await smartConfig.generateCombinations(combinationLimit);
      setGeneratedCombinations(combinations);
    } catch (error) {
      console.error('Failed to generate combinations:', error);
    }
  }, [selectedProductId, combinationLimit, smartConfig]);

  // Copy SKU to clipboard
  const handleCopySkU = useCallback(async (sku: string) => {
    try {
      await navigator.clipboard.writeText(sku);
      // Could show toast notification here
      console.log('SKU copied:', sku);
    } catch (error) {
      console.error('Failed to copy SKU:', error);
    }
  }, []);

  // Clear generated combinations
  const clearCombinations = useCallback(() => {
    setGeneratedCombinations([]);
  }, []);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Smart SKU Search & Testing
        </CardTitle>
        {showAdvanced && (
          <div className="flex gap-2">
            <Button
              variant={activeTab === 'search' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('search')}
            >
              Search
            </Button>
            <Button
              variant={activeTab === 'generate' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('generate')}
            >
              Generate
            </Button>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {activeTab === 'search' && (
          <>
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                placeholder="Search SKUs (e.g., D01D, T02I, or partial matches)..."
                className="pl-10 pr-10"
                onChange={handleSearchChange}
                disabled={isSearching}
              />
              {query && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                  onClick={clearSearch}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Loading State */}
            {isSearching && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Searching configurations...</span>
              </div>
            )}

            {/* Search Results */}
            {!isSearching && results.length > 0 && (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Found {results.length} matching configurations
                  </span>
                  <Button variant="ghost" size="sm" onClick={clearSearch}>
                    Clear
                  </Button>
                </div>
                
                {results.map((result, index) => (
                  <SearchResultItem
                    key={`${result.sku}-${index}`}
                    result={result}
                    onSelect={handleSelectConfiguration}
                    onCopy={handleCopySkU}
                  />
                ))}
              </div>
            )}

            {/* No Results */}
            {!isSearching && query && results.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                <p>No configurations found for "{query}"</p>
                <p className="text-xs mt-1">Try a different search term or partial SKU</p>
              </div>
            )}

            {/* Help Text */}
            {!query && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Enter at least 2 characters to search for SKU configurations.
                  You can search for complete SKUs, partial matches, or product codes.
                </AlertDescription>
              </Alert>
            )}
          </>
        )}

        {activeTab === 'generate' && showAdvanced && (
          <>
            {/* Generation Controls */}
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Product ID</label>
                <Input
                  type="number"
                  placeholder="Enter product ID (e.g., 1807)"
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Combination Limit</label>
                <Input
                  type="number"
                  min="10"
                  max="500"
                  placeholder="50"
                  value={combinationLimit}
                  onChange={(e) => setCombinationLimit(parseInt(e.target.value) || 50)}
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={handleGenerateCombinations}
                  disabled={!selectedProductId || smartConfig.loading.search}
                  className="flex-1"
                >
                  {smartConfig.loading.search ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Generating...
                    </>
                  ) : (
                    'Generate Combinations'
                  )}
                </Button>
                
                {generatedCombinations.length > 0 && (
                  <Button variant="outline" onClick={clearCombinations}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Generated Combinations */}
            {generatedCombinations.length > 0 && (
              <div className="space-y-3">
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Generated {generatedCombinations.length} combinations
                  </span>
                  <Badge variant="secondary">{generatedCombinations.length}</Badge>
                </div>
                
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {generatedCombinations.map((config, index) => (
                    <CombinationItem
                      key={`combo-${index}`}
                      config={config}
                      index={index}
                      onSelect={handleSelectConfiguration}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

// Search result item component
function SearchResultItem({
  result,
  onSelect,
  onCopy
}: {
  result: { config: SmartConfig; sku: string; score: number };
  onSelect: (config: SmartConfig, sku: string) => void;
  onCopy: (sku: string) => void;
}) {
  return (
    <div className="border rounded-lg p-3 hover:bg-accent transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="font-mono text-lg font-semibold">{result.sku}</div>
          <div className="text-xs text-muted-foreground mt-1">
            Match score: {result.score}% • Product: {result.config.product_id}
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCopy(result.sku)}
            title="Copy SKU"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSelect(result.config, result.sku)}
          >
            Use Config
          </Button>
        </div>
      </div>
      
      {/* Configuration details */}
      <div className="mt-2 flex flex-wrap gap-1">
        {Object.entries(result.config)
          .filter(([key, value]) => value && key !== 'product_id')
          .map(([key, value]) => (
            <Badge key={key} variant="secondary" className="text-xs">
              {key}: {Array.isArray(value) ? value.join(',') : value}
            </Badge>
          ))}
      </div>
    </div>
  );
}

// Combination item component
function CombinationItem({
  config,
  index,
  onSelect
}: {
  config: SmartConfig;
  index: number;
  onSelect: (config: SmartConfig, sku: string) => void;
}) {
  const [sku, setSku] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Generate SKU for this combination
  useEffect(() => {
    const generateSku = async () => {
      setIsGenerating(true);
      try {
        const { smartConfigurator } = await import('../../services/smart-configurator');
        const result = await smartConfigurator.buildSku(config);
        setSku(result.sku);
      } catch (error) {
        console.error('Failed to build SKU for combination:', error);
        setSku('ERROR');
      } finally {
        setIsGenerating(false);
      }
    };
    
    generateSku();
  }, [config]);
  
  return (
    <div className="border rounded p-2 hover:bg-accent transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="font-mono text-sm">
            {isGenerating ? (
              <div className="flex items-center">
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                Generating...
              </div>
            ) : (
              sku || 'No SKU'
            )}
          </div>
          <div className="text-xs text-muted-foreground">
            Combination #{index + 1}
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onSelect(config, sku)}
          disabled={isGenerating || !sku}
        >
          Use
        </Button>
      </div>
    </div>
  );
}