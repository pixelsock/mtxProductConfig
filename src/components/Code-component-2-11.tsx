import React from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { ShoppingCart } from 'lucide-react';

interface HeaderProps {
  selectedProduct: string;
  setSelectedProduct: (product: string) => void;
  debugMode: boolean;
  setDebugMode: (debug: boolean) => void;
  quoteItems: any[];
  onShowQuote: () => void;
}

export function Header({ 
  selectedProduct, 
  setSelectedProduct, 
  debugMode, 
  setDebugMode, 
  quoteItems, 
  onShowQuote 
}: HeaderProps) {
  const productOptions = [
    { value: 'future-dots-mirror', label: 'Future Dots Mirror Collection' },
    { value: 'classic-mirror', label: 'Classic Mirror Collection' },
    { value: 'premium-mirror', label: 'Premium Mirror Collection' }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <h1 className="text-xl font-semibold text-gray-900">Product Configurator</h1>
          
          <Select value={selectedProduct} onValueChange={setSelectedProduct}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select product line" />
            </SelectTrigger>
            <SelectContent>
              {productOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Debug</span>
            <Switch checked={debugMode} onCheckedChange={setDebugMode} />
          </div>
          
          <Button 
            variant="outline" 
            onClick={onShowQuote}
            className="relative"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Quote
            {quoteItems.length > 0 && (
              <Badge className="absolute -top-2 -right-2 bg-amber-500 text-white min-w-5 h-5 flex items-center justify-center text-xs">
                {quoteItems.length}
              </Badge>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}