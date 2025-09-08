import React from 'react';
import { Button } from '../ui/button';
import { ChevronUp, Minus, Plus } from 'lucide-react';
import { useConfiguration } from '../../hooks/useConfiguration';
import { useAppState } from '../../context/AppStateProvider';
import type { ProductConfiguration } from '../../services/types/ServiceTypes';

interface FloatingConfigurationBarProps {
  currentConfig: ProductConfiguration | null;
  productOptions: any;
  scrollToTop: () => void;
  incrementQuantity: () => void;
  decrementQuantity: () => void;
  addToQuote: () => void;
}

export const FloatingConfigurationBar: React.FC<FloatingConfigurationBarProps> = ({
  currentConfig,
  productOptions,
  scrollToTop,
  incrementQuantity,
  decrementQuantity,
  addToQuote
}) => {
  const { state } = useAppState();
  const showFloatingBar = state.showFloatingBar;

  if (!showFloatingBar || !currentConfig) {
    return null;
  }

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 transform transition-all duration-500 ease-out ${
        showFloatingBar ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
      }`}
    >
      <div className="bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left side - Configuration summary */}
            <div className="flex items-center space-x-6">
              <button
                onClick={scrollToTop}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ChevronUp className="w-4 h-4" />
                <span className="text-sm font-medium">View Details</span>
              </button>

              <div className="hidden sm:flex items-center space-x-4 text-sm">
                <span className="font-medium text-gray-900">
                  {currentConfig.width}" × {currentConfig.height}"
                </span>
                <span className="text-gray-600">
                  {productOptions?.frameColors?.find(
                    (c: any) => c.id.toString() === currentConfig.frameColor
                  )?.name}
                </span>
                <span className="text-gray-600">
                  {productOptions?.lightingOptions?.find(
                    (l: any) => l.id.toString() === currentConfig.lighting
                  )?.name}
                </span>
              </div>
            </div>

            {/* Right side - Quantity and Add to Quote */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={decrementQuantity}
                  disabled={currentConfig.quantity <= 1}
                  className="h-8 w-8 p-0"
                >
                  <Minus className="w-3 h-3" />
                </Button>
                <span className="text-sm font-medium min-w-[3rem] text-center">
                  Qty: {currentConfig.quantity}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={incrementQuantity}
                  disabled={currentConfig.quantity >= 100}
                  className="h-8 w-8 p-0"
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>

              <Button
                onClick={addToQuote}
                className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 h-10"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add to Quote
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};