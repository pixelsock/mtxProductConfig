import React from 'react';
import { ProductLine } from '../../services/directus';
import { buildOrderedSku, getCurrentConfigurationDisplay, CurrentConfigLike, SimpleOptions } from '../../utils/ordered-sku-builder';

interface OrderedSkuDisplayProps {
  config: CurrentConfigLike;
  options: SimpleOptions;
  productLine: ProductLine | null;
  productSkuOverride?: string;
  className?: string;
  showConfiguration?: boolean;
}

/**
 * Ordered SKU Display Component
 * 
 * This component uses the sku_code_order collection to determine
 * the order and inclusion of different option sets in the final SKU.
 */
export const OrderedSkuDisplay: React.FC<OrderedSkuDisplayProps> = ({ 
  config,
  options,
  productLine,
  productSkuOverride,
  className = '',
  showConfiguration = false
}) => {
  const [sku, setSku] = React.useState<string>('');
  const [parts, setParts] = React.useState<Record<string, string>>({});
  const [enabledParts, setEnabledParts] = React.useState<string[]>([]);
  const [configuration, setConfiguration] = React.useState<Record<string, { name: string; sku_code: string } | null>>({});
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;

    const buildSku = async () => {
      try {
        setLoading(true);

        // Build the ordered SKU
        const overrides = productSkuOverride ? { productSkuOverride } : undefined;
        const result = await buildOrderedSku(config, options, productLine, overrides);
        
        if (!cancelled) {
          setSku(result.sku);
          setParts(result.parts);
          setEnabledParts(result.enabledParts);
        }

        // Get current configuration display if requested
        if (showConfiguration) {
          const configDisplay = await getCurrentConfigurationDisplay(config, options, productLine);
          if (!cancelled) {
            setConfiguration(configDisplay);
          }
        }
      } catch (error) {
        console.error('Failed to build ordered SKU:', error);
        if (!cancelled) {
          setSku('Error building SKU');
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
  }, [config, options, productLine, productSkuOverride, showConfiguration]);

  if (loading) {
    return (
      <div className={`text-center ${className}`}>
        <p className="text-sm text-gray-600 mb-1">Building SKU...</p>
        <p className="font-mono text-sm font-medium text-gray-900">—</p>
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
          {productSkuOverride && <div>Product Override: {productSkuOverride}</div>}
        </div>
      )}

      {/* Current Configuration Display */}
      {showConfiguration && (
        <div className="mt-4 text-left">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Current Configuration</h4>
          <div className="space-y-1">
            {Object.entries(configuration).map(([optionSet, option]) => (
              <div key={optionSet} className="flex justify-between text-xs">
                <span className="text-gray-600 capitalize">
                  {optionSet.replace('_', ' ')}:
                </span>
                <span className="font-mono text-gray-900">
                  {option ? `${option.name} (${option.sku_code})` : '—'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderedSkuDisplay;
