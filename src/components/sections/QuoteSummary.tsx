import React from 'react';
import { Button } from '../ui/button';
import { Trash2, Download, Send } from 'lucide-react';
import { useQuote } from '../../hooks/useQuote';
import type { ProductConfiguration } from '../../services/types/ServiceTypes';

interface QuoteSummaryProps {
  getConfigDescription: (config: ProductConfiguration) => string;
  downloadConfiguration: () => void;
}

export const QuoteSummary: React.FC<QuoteSummaryProps> = ({
  getConfigDescription,
  downloadConfiguration
}) => {
  const { 
    quoteItems, 
    removeFromQuote, 
    showQuote, 
    hasItems 
  } = useQuote();

  if (!hasItems) {
    return null;
  }

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <h4 className="text-lg font-semibold text-gray-900 mb-4">
        Current Quote ({quoteItems.length} items)
      </h4>
      
      <div className="space-y-3">
        {quoteItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-4 bg-white rounded border"
          >
            <div className="flex-1">
              <p className="font-medium text-gray-900">
                {getConfigDescription(item)}
              </p>
              <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                <span>Qty: {item.quantity}</span>
                {item.accessories && item.accessories.length > 0 && (
                  <span>+{item.accessories.length} accessories</span>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeFromQuote(item.id)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-4"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex justify-end space-x-3 mt-4 pt-4 border-t border-gray-200">
        <Button
          variant="outline"
          size="sm"
          onClick={downloadConfiguration}
          className="flex items-center space-x-2"
        >
          <Download className="w-4 h-4" />
          <span>Download Config</span>
        </Button>
        <Button
          size="sm"
          onClick={showQuote}
          className="bg-amber-500 hover:bg-amber-600 text-white flex items-center space-x-2"
        >
          <Send className="w-4 h-4" />
          <span>Request Quote</span>
        </Button>
      </div>
    </div>
  );
};