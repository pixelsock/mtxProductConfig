import React from 'react';
import { DecoProduct } from '../../services/directus';
import { createSimpleSKUDisplay } from '../../services/simple-product-matcher';

interface SimpleSkuDisplayProps {
  product: DecoProduct | null;
  additionalOptions?: {
    size?: string;
    accessories?: string[];
  };
  className?: string;
}

/**
 * Simplified SKU Display Component
 * 
 * This component directly displays the product's sku_code field
 * instead of generating complex SKUs from rules and parts.
 */
export const SimpleSkuDisplay: React.FC<SimpleSkuDisplayProps> = ({ 
  product, 
  additionalOptions,
  className = ''
}) => {
  if (!product) {
    return (
      <div className={`text-center ${className}`}>
        <p className="text-sm text-gray-600 mb-1">Product SKU</p>
        <p className="font-mono text-sm font-medium text-gray-900">—</p>
      </div>
    );
  }

  const { sku, parts } = createSimpleSKUDisplay(product, additionalOptions);

  return (
    <div className={`text-center ${className}`}>
      <p className="text-sm text-gray-600 mb-1">Product SKU</p>
      <p className="font-mono text-sm font-medium text-gray-900 break-all">
        {sku}
      </p>
      
      {/* Debug info in development */}
      {import.meta.env.DEV && (
        <div className="mt-2 text-xs text-gray-500">
          <div>Product: {product.name} (ID: {product.id})</div>
          <div>SKU Code: {product.sku_code}</div>
          <div>Parts: {JSON.stringify(parts)}</div>
        </div>
      )}
    </div>
  );
};

export default SimpleSkuDisplay;
