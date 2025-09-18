import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Plus, Minus, Eye } from 'lucide-react';

interface FloatingConfigBarProps {
  show: boolean;
  configuration: any;
  onAddToQuote: () => void;
}

export function FloatingConfigBar({ show, configuration, onAddToQuote }: FloatingConfigBarProps) {
  const [quantity, setQuantity] = useState(1);
  const [showDetails, setShowDetails] = useState(false);

  if (!show) return null;

  const formatConfigValue = (key: string, value: any) => {
    if (key === 'useCustomSize' || key === 'motionSensor') return null;
    if (key === 'size' && configuration.useCustomSize) {
      return `${configuration.customWidth}" × ${configuration.customHeight}"`;
    }
    if (!value || value === '') return 'Not selected';
    return typeof value === 'string' 
      ? value.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      : String(value);
  };

  const getConfigurationSummary = () => {
    const frameColor = configuration.frameColor || 'Not selected';
    const size = configuration.useCustomSize 
      ? `${configuration.customWidth || ''}'' × ${configuration.customHeight || ''}'`
      : (configuration.size ? formatConfigValue('size', configuration.size) : 'Not selected');
    
    return { frameColor, size };
  };

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-40 transition-transform duration-300 ${
      show ? 'translate-y-0' : 'translate-y-full'
    }`}>
      <div className="bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <h4 className="font-semibold text-gray-900">Matrix Mirror Configuration</h4>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {(() => {
                      const { frameColor, size } = getConfigurationSummary();
                      return `${formatConfigValue('frameColor', frameColor)} • ${size}`;
                    })()}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDetails(!showDetails)}
                    className="text-xs"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    View Details
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Qty:</span>
                <div className="flex items-center border border-gray-300 rounded">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="h-8 w-8 p-0"
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <span className="px-3 py-1 text-sm font-medium min-w-8 text-center">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                    className="h-8 w-8 p-0"
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <Button 
                className="bg-[#F59E0B] hover:bg-[#D97706] text-white"
                onClick={onAddToQuote}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add to Quote
              </Button>
            </div>
          </div>

          {showDetails && (
            <Card className="mt-4 p-4 bg-gray-50 border border-gray-200">
              <h5 className="font-medium text-gray-900 mb-3">Configuration Details</h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {Object.entries(configuration).map(([key, value]) => {
                  const formattedValue = formatConfigValue(key, value);
                  if (!formattedValue) return null;
                  
                  return (
                    <div key={key}>
                      <span className="text-gray-600 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').toLowerCase()}:
                      </span>
                      <p className="font-medium text-gray-900">{formattedValue}</p>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}