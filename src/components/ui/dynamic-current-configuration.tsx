import React from 'react';
import { Plus, Minus } from 'lucide-react';
import { Button } from './button';
import { Badge } from './badge';
import { Input } from './input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './card';
import { cn } from '@/lib/utils';
import { ProductLine } from '../../services/directus';
import { getSkuCodeOrder, getEnabledOptionSets } from '../../services/sku-code-order';
import { getConfigKeyForCollection } from '../../services/dynamic-config';

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

interface ProductConfig {
  id: string;
  productLineId: number;
  productLineName: string;
  width: string;
  height: string;
  quantity: number;
  [key: string]: any; // Dynamic configuration properties
}

interface DynamicCurrentConfigurationProps {
  config: ProductConfig;
  productOptions: Record<string, ProductOption[]>; // Dynamic options by collection name
  productLine: ProductLine | null;
  onQuantityChange: (quantity: number) => void;
  onAddToQuote: () => void;
  className?: string;
}

interface ConfigurationDisplay {
  optionSet: string;
  displayName: string;
  value: string;
  skuCode: string;
  configKey: string;
}

export function DynamicCurrentConfiguration({
  config,
  productOptions,
  productLine,
  onQuantityChange,
  onAddToQuote,
  className
}: DynamicCurrentConfigurationProps) {
  const [configurationDisplay, setConfigurationDisplay] = React.useState<ConfigurationDisplay[]>([]);
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
      'frame_thickness': 'Frame Thickness'
    };
    
    return displayNames[optionSet] || optionSet.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Helper function to find option by ID
  const findOptionById = (options: ProductOption[], id: string): ProductOption | undefined => {
    if (!id || !options) return undefined;
    const numId = parseInt(id, 10);
    if (!Number.isFinite(numId)) return undefined;
    return options.find(option => option.id === numId);
  };

  // Helper function to get selected option for an option set
  const getSelectedOption = async (optionSet: string): Promise<{ name: string; sku_code: string } | null> => {
    const configKey = await getConfigKeyForCollection(optionSet);
    if (!configKey) return null;

    const configValue = config[configKey];
    
    // Handle different option set mappings
    let options: ProductOption[] = [];
    switch (optionSet) {
      case 'accessories':
        options = productOptions['accessoryOptions'] || productOptions['accessories'] || [];
        break;
      case 'hanging_techniques':
        options = productOptions['hangingTechniques'] || productOptions['hanging_techniques'] || [];
        break;
      case 'frame_colors':
        options = productOptions['frameColors'] || productOptions['frame_colors'] || [];
        break;
      case 'mirror_styles':
        options = productOptions['mirrorStyles'] || productOptions['mirror_styles'] || [];
        break;
      case 'lighting_options':
        options = productOptions['lightingOptions'] || productOptions['lighting_options'] || [];
        break;
      case 'frame_thickness':
        options = productOptions['frameThickness'] || productOptions['frame_thickness'] || [];
        break;
      case 'mounting_options':
        options = productOptions['mountingOptions'] || productOptions['mounting_options'] || [];
        break;
      case 'color_temperatures':
        options = productOptions['colorTemperatures'] || productOptions['color_temperatures'] || [];
        break;
      case 'light_outputs':
        options = productOptions['lightOutputs'] || productOptions['light_outputs'] || [];
        break;
      default:
        options = productOptions[optionSet] || [];
        break;
    }

    switch (optionSet) {
      case 'product_lines':
        return productLine ? { name: productLine.name, sku_code: productLine.sku_code || '' } : null;
      
      case 'sizes':
        if (config.width && config.height) {
          const size = options.find(s => 
            s.width === Number(config.width) && s.height === Number(config.height)
          );
          if (size) return { name: size.name, sku_code: size.sku_code };
          return { name: `${config.width}" × ${config.height}"`, sku_code: `${config.width}${config.height}` };
        }
        return null;

      case 'accessories':
        if (Array.isArray(configValue) && configValue.length > 0) {
          const selectedAccessories = configValue
            .map(id => findOptionById(options, id))
            .filter(Boolean) as ProductOption[];
          
          if (selectedAccessories.length > 0) {
            return {
              name: selectedAccessories.map(a => a.name).join(', '),
              sku_code: selectedAccessories.map(a => a.sku_code).join('+')
            };
          }
        }
        return null;

      default:
        const option = findOptionById(options, configValue);
        return option ? { name: option.name, sku_code: option.sku_code } : null;
    }
  };

  // Load configuration display
  React.useEffect(() => {
    let cancelled = false;

    const loadConfigurationDisplay = async () => {
      try {
        setLoading(true);
        
        // Get available option sets from product line default_options
        let availableOptionSets: string[] = [];
        
        // Debug logging
        console.log('🔍 DYNAMIC CONFIG DEBUG - Product Line:', productLine?.name);
        console.log('🔍 DYNAMIC CONFIG DEBUG - Default Options:', productLine?.default_options);
        console.log('🔍 DYNAMIC CONFIG DEBUG - Product Options Keys:', Object.keys(productOptions));
        console.log('🔍 DYNAMIC CONFIG DEBUG - Config Keys:', Object.keys(config));
        console.log('🔍 DYNAMIC CONFIG DEBUG - Config hangingTechnique value:', config.hangingTechnique);
        console.log('🔍 DYNAMIC CONFIG DEBUG - Product Options Keys:', Object.keys(productOptions));
        console.log('🔍 DYNAMIC CONFIG DEBUG - Product Options Full Structure:', productOptions);
        console.log('🔍 DYNAMIC CONFIG DEBUG - Specific Collections:', {
          hangingTechniques: productOptions['hangingTechniques'],
          hanging_techniques: productOptions['hanging_techniques'],
          accessoryOptions: productOptions['accessoryOptions'],
          accessories: productOptions['accessories'],
          mountingOptions: productOptions['mountingOptions'],
          mounting_options: productOptions['mounting_options']
        });
        
        if (productLine?.default_options && Array.isArray(productLine.default_options)) {
          // Extract collection names from default_options
          const collections = new Set<string>();
          
          for (const option of productLine.default_options) {
            if (typeof option === 'object' && option.collection) {
              collections.add(option.collection);
              console.log('🔍 Debug - Found collection:', option.collection, 'with item:', option.item);
            }
          }
          
          availableOptionSets = Array.from(collections);
          
          // Always include accessories if they exist in productOptions
          if (productOptions.accessoryOptions && productOptions.accessoryOptions.length > 0) {
            if (!availableOptionSets.includes('accessories')) {
              availableOptionSets.push('accessories');
              console.log('🔍 Debug - Added accessories to available option sets');
            }
          }
          
          console.log('🔍 DYNAMIC CONFIG DEBUG - Available Option Sets:', availableOptionSets);
          
          // Also get sku_code_order to respect ordering preferences
          try {
            const skuCodeOrder = await getSkuCodeOrder();
            const enabledOptionSets = getEnabledOptionSets(skuCodeOrder);
            
            // Sort available option sets by sku_code_order if available
            availableOptionSets.sort((a, b) => {
              const aIndex = enabledOptionSets.indexOf(a);
              const bIndex = enabledOptionSets.indexOf(b);
              
              // If both are in sku_code_order, use that order
              if (aIndex !== -1 && bIndex !== -1) {
                return aIndex - bIndex;
              }
              // If only one is in sku_code_order, prioritize it
              if (aIndex !== -1) return -1;
              if (bIndex !== -1) return 1;
              // If neither is in sku_code_order, use alphabetical
              return a.localeCompare(b);
            });
          } catch (error) {
            console.warn('Could not load sku_code_order for sorting, using default order:', error);
          }
        } else {
          // Fallback to sku_code_order if no product line default_options
          try {
            const skuCodeOrder = await getSkuCodeOrder();
            availableOptionSets = getEnabledOptionSets(skuCodeOrder);
          } catch (error) {
            console.warn('Could not load sku_code_order:', error);
            availableOptionSets = [];
          }
        }
        
        const displayItems: ConfigurationDisplay[] = [];

        for (const optionSet of availableOptionSets) {
          const configKey = await getConfigKeyForCollection(optionSet);
          const selectedOption = await getSelectedOption(optionSet);
          
          console.log(`🔍 DYNAMIC CONFIG - Processing ${optionSet}:`, {
            configKey,
            selectedOption,
            hasProductOptions: !!productOptions[optionSet],
            productOptionsCount: productOptions[optionSet]?.length || 0,
            configValue: config[configKey || ''],
            // Special debug for hanging_techniques
            ...(optionSet === 'hanging_techniques' && {
              hangingTechniquesOptions: productOptions['hangingTechniques'],
              hangingTechniquesAlt: productOptions['hanging_techniques'],
              accessoryOptions: productOptions['accessoryOptions'],
              configHangingTechnique: config['hangingTechnique'],
              configHanging_technique: config['hanging_technique'],
              allProductOptionsKeys: Object.keys(productOptions)
            })
          });
          
          if (selectedOption && configKey) {
            displayItems.push({
              optionSet,
              displayName: getDisplayName(optionSet),
              value: selectedOption.name,
              skuCode: selectedOption.sku_code,
              configKey
            });
          } else {
            console.log(`❌ Debug - Skipping ${optionSet}: selectedOption=${!!selectedOption}, configKey=${configKey}`);
          }
        }
        
        if (!cancelled) {
          setConfigurationDisplay(displayItems);
        }
      } catch (error) {
        console.error('Failed to load configuration display:', error);
        if (!cancelled) {
          setConfigurationDisplay([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadConfigurationDisplay();

    return () => {
      cancelled = true;
    };
  }, [config, productOptions, productLine]);

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
            {configurationDisplay
              .filter((_, index) => index % 2 === 0) // Left column items
              .map((item) => (
                <div key={item.optionSet} className="flex flex-col space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {item.displayName}
                    </span>
                    <Badge variant="outline" className="bg-muted text-muted-foreground border-none rounded px-1.5 py-0.5 text-xs font-mono">
                      {item.skuCode}
                    </Badge>
                  </div>
                  <span className="text-sm font-semibold text-foreground truncate">
                    {item.value}
                  </span>
                </div>
              ))}
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {configurationDisplay
              .filter((_, index) => index % 2 === 1) // Right column items
              .map((item) => (
                <div key={item.optionSet} className="flex flex-col space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {item.displayName}
                    </span>
                    <Badge variant="outline" className="bg-muted text-muted-foreground border-none rounded px-1.5 py-0.5 text-xs font-mono">
                      {item.skuCode}
                    </Badge>
                  </div>
                  <span className="text-sm font-semibold text-foreground truncate">
                    {item.value}
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* Debug info in development */}
        {import.meta.env.DEV && (
          <div className="pt-4 border-t border-border">
            <div className="text-xs text-gray-500">
              <div>Configuration entries: {configurationDisplay.length}</div>
              <div>Enabled option sets: {configurationDisplay.map(item => item.optionSet).join(', ')}</div>
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
