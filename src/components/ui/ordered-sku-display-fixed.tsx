import React from 'react';
import { ProductLine, DecoProduct } from '../../services/directus';
import { buildOrderedSku, CurrentConfigLike, SimpleOptions } from '../../utils/ordered-sku-builder';

interface OrderedSkuDisplayFixedProps {
  config: CurrentConfigLike | null;
  options: SimpleOptions | null;
  productLine: ProductLine | null;
  product?: DecoProduct | null;
  className?: string;
}

export const OrderedSkuDisplayFixed: React.FC<OrderedSkuDisplayFixedProps> = ({ 
  config, 
  options, 
  productLine, 
  product,
  className = '' 
}) => {
  const [sku, setSku] = React.useState<string>('');
  const [parts, setParts] = React.useState<Record<string, string>>({});
  const [enabledParts, setEnabledParts] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    const buildSku = async () => {
      if (!config || !options || !productLine) {
        if (!cancelled) {
          setSku('—');
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Build the ordered SKU using the sku_code_order collection
        const overrides = product?.sku_code ? { productSkuOverride: product.sku_code } : undefined;
        const result = await buildOrderedSku(config, options, productLine, overrides);
        
        if (!cancelled) {
          setSku(result.sku);
          setParts(result.parts);
          setEnabledParts(result.enabledParts);
        }
      } catch (err) {
        console.error('Failed to build ordered SKU:', err);
        if (!cancelled) {
          setError('Error building SKU');
          setSku('Error');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    buildSku();

    return () => {
      cancelled = true;
    };
  }, [config, options, productLine, product]);

  if (loading) {
    return (
      <div className={`text-center ${className}`}>
        <p className="text-sm text-gray-600 mb-1">Current Selection SKU</p>
        <p className="font-mono text-sm font-medium text-gray-900">Building...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center ${className}`}>
        <p className="text-sm text-gray-600 mb-1">Current Selection SKU</p>
        <p className="font-mono text-sm font-medium text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className={`text-center ${className}`}>
      <p className="text-sm text-gray-600 mb-1">Current Selection SKU</p>
      <p className="font-mono text-sm font-medium text-gray-900 break-all">
        {sku || '—'}
      </p>
      
      {/* Debug info in development */}
      {import.meta.env.DEV && (
        <div className="mt-2 text-xs text-gray-500">
          <div>Enabled Parts: {enabledParts.join(', ')}</div>
          <div>Parts: {JSON.stringify(parts)}</div>
          {product?.sku_code && <div>Product Override: {product.sku_code}</div>}
        </div>
      )}
    </div>
  );
};

export default OrderedSkuDisplayFixed;
