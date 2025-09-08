import React from 'react';
import { Plus, Minus } from 'lucide-react';
import { Button } from './button';
import { Badge } from './badge';
import { Input } from './input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './card';
import { cn } from '@/lib/utils';
import { ProductLine } from '../../services/directus';
import { getSkuCodeOrder, OPTION_SET_CONFIG_MAP, OPTION_SET_OPTIONS_MAP } from '../../services/sku-code-order';
import { getCurrentConfigurationDisplay, CurrentConfigLike, SimpleOptions } from '../../utils/ordered-sku-builder';

interface ProductOption {
  id: number;
  name: string;
  sku_code: string;
  description?: string;
  hex_code?: string;
  width?: number;
  height?: number;
  value?: string;
}

interface ProductOptions {
  frameColors: ProductOption[];
  frameThickness: ProductOption[];
  mirrorStyles: ProductOption[];
  lightingOptions: ProductOption[];
  colorTemperatures: ProductOption[];
  lightOutputs: ProductOption[];
  drivers: ProductOption[];
  mountingOptions: ProductOption[];
  mirrorControls: ProductOption[];
  accessoryOptions: ProductOption[];
  sizes: ProductOption[];
}

interface ProductConfig {
  id: string;
  productLineId: number;
  productLineName: string;
  mirrorControls: string;
  frameColor: string;
  frameThickness: string;
  mirrorStyle: string;
  width: string;
  height: string;
  mounting: string;
  lighting: string;
  colorTemperature: string;
  lightOutput: string;
  driver: string;
  accessories: string[];
  quantity: number;
}

interface OrderedCurrentConfigurationProps {
  config: ProductConfig;
  productOptions: ProductOptions;
  productLine: ProductLine | null;
  onQuantityChange: (quantity: number) => void;
  onAddToQuote: () => void;
  className?: string;
}

export function OrderedCurrentConfiguration({
  config,
  productOptions,
  productLine,
  onQuantityChange,
  onAddToQuote,
  className
}: OrderedCurrentConfigurationProps) {
  const [configuration, setConfiguration] = React.useState<Record<string, { name: string; sku_code: string } | null>>({});
  const [loading, setLoading] = React.useState(true);

  const incrementQuantity = () => {
    onQuantityChange(Math.min(config.quantity + 1, 100));
  };

  const decrementQuantity = () => {
    onQuantityChange(Math.max(config.quantity - 1, 1));
  };

  const handleQuantityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(1, Math.min(100, parseInt(e.target.value) || 1));
    onQuantityChange(value);
  };

  // Convert ProductOptions to SimpleOptions format
  const simpleOptions: SimpleOptions = {
    productLines: [],
    mirrorStyles: productOptions.mirrorStyles,
    lightingOptions: productOptions.lightingOptions,
    frameThickness: productOptions.frameThickness,
    sizes: productOptions.sizes,
    lightOutputs: productOptions.lightOutputs,
    colorTemperatures: productOptions.colorTemperatures,
    drivers: productOptions.drivers,
    mountingOptions: productOptions.mountingOptions,
    hangingTechniques: [],
    accessories: productOptions.accessoryOptions,
    frameColors: productOptions.frameColors,
    mirrorControls: productOptions.mirrorControls
  };

  // Convert ProductConfig to CurrentConfigLike format
  const currentConfig: CurrentConfigLike = {
    productLineId: config.productLineId,
    mirrorStyle: config.mirrorStyle,
    lighting: config.lighting,
    frameThickness: config.frameThickness,
    width: config.width,
    height: config.height,
    mounting: config.mounting,
    lightOutput: config.lightOutput,
    colorTemperature: config.colorTemperature,
    driver: config.driver,
    accessories: config.accessories,
    hangingTechnique: '',
    frameColor: config.frameColor,
    mirrorControls: config.mirrorControls
  };

  React.useEffect(() => {
    let cancelled = false;

    const loadConfiguration = async () => {
      try {
        setLoading(true);
        
        // Get current configuration display using the ordered SKU system
        const configDisplay = await getCurrentConfigurationDisplay(currentConfig, simpleOptions, productLine);
        
        if (!cancelled) {
          setConfiguration(configDisplay);
        }
      } catch (error) {
        console.error('Failed to load configuration display:', error);
        if (!cancelled) {
          setConfiguration({});
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadConfiguration();

    return () => {
      cancelled = true;
    };
  }, [currentConfig, simpleOptions, productLine]);

  // Helper function to get display name for option set
  const getDisplayName = (optionSet: string): string => {
    const displayNames: Record<string, string> = {
      'product_lines': 'Product Line',
      'sizes': 'Dimensions',
      'light_outputs': 'Light Output',
      'color_temperatures': 'Color Temperature',
      'drivers': 'Driver',
      'mounting_options': 'Mounting',
      'hanging_techniques': 'Hanging Technique',
      'accessories': 'Accessories',
      'frame_colors': 'Frame Color',
      'mirror_styles': 'Mirror Style',
      'lighting_options': 'Lighting',
      'frame_thickness': 'Frame Thickness',
      'mirror_controls': 'Mirror Controls'
    };
    
    return displayNames[optionSet] || optionSet.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Helper function to format dimensions display
  const formatDimensions = (option: { name: string; sku_code: string } | null): string => {
    if (!option) return `${config.width}" × ${config.height}"`;
    
    // If the option has width/height, use those
    const sizeOption = productOptions.sizes.find(s => s.id.toString() === config.width && s.height?.toString() === config.height);
    if (sizeOption) {
      return `${sizeOption.width}" × ${sizeOption.height}"`;
    }
    
    return `${config.width}" × ${config.height}"`;
  };

  if (loading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Current Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-sm text-gray-600">Loading configuration...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Current Configuration</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Configuration Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            {Object.entries(configuration)
              .filter(([_, option], index) => index % 2 === 0) // Left column items
              .map(([optionSet, option]) => (
                <div key={optionSet} className="flex flex-col space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {getDisplayName(optionSet)}
                    </span>
                    {option && (
                      <Badge variant="outline" className="bg-muted text-muted-foreground border-none rounded px-1.5 py-0.5 text-xs font-mono">
                        {option.sku_code}
                      </Badge>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-foreground truncate">
                    {optionSet === 'sizes' ? formatDimensions(option) : (option?.name || '—')}
                  </span>
                </div>
              ))}
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {Object.entries(configuration)
              .filter(([_, option], index) => index % 2 === 1) // Right column items
              .map(([optionSet, option]) => (
                <div key={optionSet} className="flex flex-col space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {getDisplayName(optionSet)}
                    </span>
                    {option && (
                      <Badge variant="outline" className="bg-muted text-muted-foreground border-none rounded px-1.5 py-0.5 text-xs font-mono">
                        {option.sku_code}
                      </Badge>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-foreground truncate">
                    {optionSet === 'sizes' ? formatDimensions(option) : (option?.name || '—')}
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* Debug info in development */}
        {import.meta.env.DEV && (
          <div className="pt-4 border-t border-border">
            <div className="text-xs text-gray-500">
              <div>Configuration entries: {Object.keys(configuration).length}</div>
              <div>Enabled option sets: {Object.entries(configuration).filter(([_, option]) => option).length}</div>
              <div>Debug: {JSON.stringify(configuration, null, 2)}</div>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex items-center justify-between pt-6 border-t border-border">
        {/* Quantity Controls */}
        <div className="flex items-center space-x-4">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Quantity</span>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={decrementQuantity}
              disabled={config.quantity <= 1}
              className="h-8 w-8 border-border hover:bg-muted/80 transition-colors"
            >
              <Minus className="w-3 h-3" />
            </Button>
            <Input
              type="number"
              value={config.quantity}
              onChange={handleQuantityInputChange}
              min="1"
              max="100"
              className="w-14 text-center text-sm font-semibold h-8 bg-muted/50 border-border focus:bg-background transition-colors"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={incrementQuantity}
              disabled={config.quantity >= 100}
              className="h-8 w-8 border-border hover:bg-muted/80 transition-colors"
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Add to Quote Button */}
        <Button
          onClick={onAddToQuote}
          className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2.5 h-10 font-medium shadow-sm transition-all hover:shadow-md"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add to Quote
        </Button>
      </CardFooter>
    </Card>
  );
}
