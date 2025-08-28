import React from 'react';
import { Plus, Minus } from 'lucide-react';
import { Button } from './button';
import { Badge } from './badge';
import { Input } from './input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './card';
import { cn } from '@/lib/utils';

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

interface CurrentConfigurationProps {
  config: ProductConfig;
  productOptions: ProductOptions;
  onQuantityChange: (quantity: number) => void;
  onAddToQuote: () => void;
  className?: string;
}

export function CurrentConfiguration({
  config,
  productOptions,
  onQuantityChange,
  onAddToQuote,
  className
}: CurrentConfigurationProps) {
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

  // Helper function to find option name by ID
  const getOptionName = (options: ProductOption[], id: string) => {
    return options.find(option => option.id.toString() === id)?.name || 'N/A';
  };

  // Helper function to get SKU code
  const getOptionSku = (options: ProductOption[], id: string) => {
    return options.find(option => option.id.toString() === id)?.sku_code || '';
  };

  // Helper function to check if an option should be displayed
  const shouldDisplayOption = (options: ProductOption[], id: string) => {
    return options.length > 0 && options.find(option => option.id.toString() === id);
  };

  // Helper function to check if an option category has available options
  const hasAvailableOptions = (options: ProductOption[]) => {
    return options && options.length > 0;
  };

  // Rule-aware combined accessories label + SKU
  const [accessoriesSku, setAccessoriesSku] = React.useState<string>("");
  const [accessoriesLabel, setAccessoriesLabel] = React.useState<string>("");
  React.useEffect(() => {
    const selected = (config.accessories || [])
      .map(id => productOptions.accessoryOptions.find(a => a.id.toString() === id))
      .filter(Boolean) as ProductOption[];
    const names = selected.map(a => a.name).filter(Boolean) as string[];
    const codes = selected.map(a => a.sku_code).filter(Boolean) as string[];

    const baseLabel = names.length > 0 ? names.join(" + ") : "";
    const baseSku = codes.length > 0 ? codes.join("+") : "";

    // Build a minimal numeric rules context
    const toNum = (v?: string) => (v ? parseInt(v, 10) : undefined);
    const rulesContext: any = {
      product_line: config.productLineId,
      mirror_style: toNum(config.mirrorStyle),
      light_direction: toNum(config.lighting),
      frame_thickness: toNum(config.frameThickness),
      mirror_control: toNum(config.mirrorControls),
      frame_color: toNum(config.frameColor),
      mounting: toNum(config.mounting),
      driver: toNum(config.driver),
      accessories: (config.accessories || []).map(a => parseInt(a, 10)).filter(n => Number.isFinite(n)),
    };

    let cancelled = false;
    (async () => {
      try {
        const { processRules } = await import("../../services/rules-engine");
        const processed = await processRules(rulesContext);
        const override = (processed as any).accessories_sku_code || (processed as any).accessory_sku_code;
        const fallback = (processed as any).accessory_sku_code || (processed as any).accessories_sku_code;
        const finalSku = override || (baseSku || undefined) || fallback || "";
        const finalLabel = names.length > 0 ? baseLabel : (fallback ? "None" : "");
        if (!cancelled) {
          setAccessoriesSku(finalSku);
          setAccessoriesLabel(finalLabel);
        }
      } catch {
        if (!cancelled) {
          setAccessoriesSku(baseSku);
          setAccessoriesLabel(baseLabel);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [config, productOptions.accessoryOptions]);

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
            {/* Dimensions - Always show */}
            <div className="flex flex-col space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Dimensions</span>
                <Badge variant="outline" className="bg-muted text-muted-foreground border-none rounded px-1.5 py-0.5 text-xs font-mono">
                  {getOptionSku(productOptions.sizes,
                    productOptions.sizes.find(s =>
                      s.width?.toString() === config.width &&
                      s.height?.toString() === config.height
                    )?.id.toString() || ''
                  )}
                </Badge>
              </div>
              <span className="text-sm font-semibold text-foreground">{config.width}" × {config.height}"</span>
            </div>

            {/* Frame Color - Only show if available */}
            {shouldDisplayOption(productOptions.frameColors, config.frameColor) && (
              <div className="flex flex-col space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Frame Color</span>
                  <Badge variant="outline" className="bg-muted text-muted-foreground border-none rounded px-1.5 py-0.5 text-xs font-mono">
                    {getOptionSku(productOptions.frameColors, config.frameColor)}
                  </Badge>
                </div>
                <span className="text-sm font-semibold text-foreground truncate">
                  {getOptionName(productOptions.frameColors, config.frameColor)}
                </span>
              </div>
            )}

            {/* Frame Thickness - Only show if available */}
            {shouldDisplayOption(productOptions.frameThickness, config.frameThickness) && (
              <div className="flex flex-col space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Frame</span>
                  <Badge variant="outline" className="bg-muted text-muted-foreground border-none rounded px-1.5 py-0.5 text-xs font-mono">
                    {getOptionSku(productOptions.frameThickness, config.frameThickness)}
                  </Badge>
                </div>
                <span className="text-sm font-semibold text-foreground truncate">
                  {getOptionName(productOptions.frameThickness, config.frameThickness)}
                </span>
              </div>
            )}

            {/* Mounting/Orientation - Only show if available */}
            {shouldDisplayOption(productOptions.mountingOptions, config.mounting) && (
              <div className="flex flex-col space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Mounting</span>
                  <Badge variant="outline" className="bg-muted text-muted-foreground border-none rounded px-1.5 py-0.5 text-xs font-mono">
                    {getOptionSku(productOptions.mountingOptions, config.mounting)}
                  </Badge>
                </div>
                <span className="text-sm font-semibold text-foreground truncate">
                  {getOptionName(productOptions.mountingOptions, config.mounting)}
                </span>
              </div>
            )}

            {/* Color Temperature - Only show if available */}
            {shouldDisplayOption(productOptions.colorTemperatures, config.colorTemperature) && (
              <div className="flex flex-col space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Color Temp</span>
                  <Badge variant="outline" className="bg-muted text-muted-foreground border-none rounded px-1.5 py-0.5 text-xs font-mono">
                    {getOptionSku(productOptions.colorTemperatures, config.colorTemperature)}
                  </Badge>
                </div>
                <span className="text-sm font-semibold text-foreground truncate">
                  {getOptionName(productOptions.colorTemperatures, config.colorTemperature)}
                </span>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Mirror Style - Only show if available */}
            {shouldDisplayOption(productOptions.mirrorStyles, config.mirrorStyle) && (
              <div className="flex flex-col space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Mirror Style</span>
                  <Badge variant="outline" className="bg-muted text-muted-foreground border-none rounded px-1.5 py-0.5 text-xs font-mono">
                    {getOptionSku(productOptions.mirrorStyles, config.mirrorStyle)}
                  </Badge>
                </div>
                <span className="text-sm font-semibold text-foreground truncate">
                  {getOptionName(productOptions.mirrorStyles, config.mirrorStyle)}
                </span>
              </div>
            )}

            {/* Lighting - Only show if available */}
            {shouldDisplayOption(productOptions.lightingOptions, config.lighting) && (
              <div className="flex flex-col space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Lighting</span>
                  <Badge variant="outline" className="bg-muted text-muted-foreground border-none rounded px-1.5 py-0.5 text-xs font-mono">
                    {getOptionSku(productOptions.lightingOptions, config.lighting)}
                  </Badge>
                </div>
                <span className="text-sm font-semibold text-foreground truncate">
                  {getOptionName(productOptions.lightingOptions, config.lighting)}
                </span>
              </div>
            )}

            {/* Mirror Controls - Only show if available */}
            {shouldDisplayOption(productOptions.mirrorControls, config.mirrorControls) && (
              <div className="flex flex-col space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Controls</span>
                  <Badge variant="outline" className="bg-muted text-muted-foreground border-none rounded px-1.5 py-0.5 text-xs font-mono">
                    {getOptionSku(productOptions.mirrorControls, config.mirrorControls)}
                  </Badge>
                </div>
                <span className="text-sm font-semibold text-foreground truncate">
                  {getOptionName(productOptions.mirrorControls, config.mirrorControls)}
                </span>
              </div>
            )}

            {/* Light Output - Only show if available */}
            {shouldDisplayOption(productOptions.lightOutputs, config.lightOutput) && (
              <div className="flex flex-col space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Light Output</span>
                  <Badge variant="outline" className="bg-muted text-muted-foreground border-none rounded px-1.5 py-0.5 text-xs font-mono">
                    {getOptionSku(productOptions.lightOutputs, config.lightOutput)}
                  </Badge>
                </div>
                <span className="text-sm font-semibold text-foreground truncate">
                  {getOptionName(productOptions.lightOutputs, config.lightOutput)}
                </span>
              </div>
            )}

            {/* Driver - Only show if available */}
            {shouldDisplayOption(productOptions.drivers, config.driver) && (
              <div className="flex flex-col space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Driver</span>
                  <Badge variant="outline" className="bg-muted text-muted-foreground border-none rounded px-1.5 py-0.5 text-xs font-mono">
                    {getOptionSku(productOptions.drivers, config.driver)}
                  </Badge>
                </div>
                <span className="text-sm font-semibold text-foreground truncate">
                  {getOptionName(productOptions.drivers, config.driver)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Accessories - Combined label and SKU (rule-aware). Show when selected or NA rule applies */}
        {(!!accessoriesLabel || !!accessoriesSku) && hasAvailableOptions(productOptions.accessoryOptions) && (
          <div className="pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Accessories</span>
                <span className="text-sm font-semibold text-foreground truncate">
                  {accessoriesLabel || "None"}
                </span>
              </div>
              {accessoriesSku && (
                <Badge variant="outline" className="bg-muted text-muted-foreground border-none rounded px-1.5 py-0.5 text-xs font-mono">
                  {accessoriesSku}
                </Badge>
              )}
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
