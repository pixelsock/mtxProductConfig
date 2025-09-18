import React from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Trash2, Download, FileText } from 'lucide-react';
import exampleImage from 'figma:asset/3811cf9e6dffea9532f2055aa8fe4180f68e739c.png';

interface ProductVisualizationProps {
  selectedProduct: string;
  configuration: any;
  quoteItems: any[];
  onRemoveFromQuote: (id: number) => void;
  onDownloadConfig: () => void;
  onRequestQuote: () => void;
}

export function ProductVisualization({
  selectedProduct,
  configuration,
  quoteItems,
  onRemoveFromQuote,
  onDownloadConfig,
  onRequestQuote
}: ProductVisualizationProps) {
  return (
    <div className="lg:sticky lg:top-24 space-y-6">
      {/* Product Image Gallery */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="aspect-square bg-gray-50 flex items-center justify-center">
          <img 
            src={exampleImage} 
            alt="Matrix Mirror"
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        </div>
      </div>

      {/* Quote Summary */}
      {quoteItems.length > 0 && (
        <Card className="bg-gray-50 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Quote Summary</h3>
          
          <div className="space-y-3 mb-6">
            {quoteItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between bg-white p-3 rounded border">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {item.product.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </p>
                  <p className="text-sm text-gray-600">
                    {item.configuration.size} • {item.configuration.frameStyle.replace('-', ' ')}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="font-semibold text-gray-900">${item.price}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveFromQuote(item.id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={onDownloadConfig}
            >
              <Download className="w-4 h-4 mr-2" />
              Download Config
            </Button>
            <Button 
              className="flex-1 bg-amber-500 hover:bg-amber-600"
              onClick={onRequestQuote}
            >
              <FileText className="w-4 h-4 mr-2" />
              Request Quote
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}