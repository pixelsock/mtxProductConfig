import React from 'react';
import { ProductLine } from '../../services/supabase';
import { buildFullSku, CurrentConfigLike, SimpleOptions } from '../../utils/sku-builder';
import { processRules } from '../../services/rules-engine';

interface SkuDisplayProps {
  config: CurrentConfigLike | null;
  options: SimpleOptions | null;
  productLine: ProductLine | null;
}

export const SkuDisplay: React.FC<SkuDisplayProps> = ({ config, options, productLine }) => {
  if (!config || !options || !productLine) return null;

  // Build a minimal numeric context for rule evaluation
  const toNum = (v?: string) => (v ? parseInt(v, 10) : undefined);
  const mirrorStyleId = toNum(config.mirrorStyle);
  const lightDirectionId = toNum(config.lighting);
  const frameThicknessId = toNum(config.frameThickness);
  const driverId = toNum(config.driver);
  const frameColorId = toNum(config.frameColor);
  const mountingId = toNum(config.mounting);
  const accessoriesIds = Array.isArray(config.accessories) ? config.accessories.map(a => parseInt(a, 10)).filter(n => Number.isFinite(n)) : [];

  const rulesContext: any = {
    product_line: config.productLineId,
    mirror_style: mirrorStyleId,
    light_direction: lightDirectionId,
    frame_thickness: frameThicknessId,
    mirror_control: toNum(config.mirrorControls),
    frame_color: frameColorId,
    mounting: mountingId,
    driver: driverId,
    accessories: accessoriesIds,
  };

  // Evaluate rules to get overrides like product_line_sku_code or accessory_sku_code
  // Note: processRules is async; for simplicity in this small component, we render once without overrides and then update on resolve
  const [computedSku, setComputedSku] = React.useState<string>('');
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const processed = await processRules(rulesContext);

        // Build effective config by applying ID overrides from processed rules
        const mapNum = (v: any) => (typeof v === 'number' && Number.isFinite(v) ? String(v) : undefined);
        const effective = { ...config } as any;
        const idMap: Array<[string, string]> = [
          ['mirror_style', 'mirrorStyle'],
          ['light_direction', 'lighting'],
          ['frame_thickness', 'frameThickness'],
          ['driver', 'driver'],
          ['frame_color', 'frameColor'],
          ['mounting', 'mounting'],
          ['mounting_option', 'mounting'], // support rules using mounting_option
          ['light_output', 'lightOutput'],
          ['color_temperature', 'colorTemperature'],
        ];
        for (const [ruleKey, cfgKey] of idMap) {
          const ov = mapNum((processed as any)[ruleKey]);
          if (ov) effective[cfgKey] = ov;
        }

        const overrides = {
          productLineSkuOverride: (processed as any).product_line_sku_code || undefined,
          accessoryFallback: (processed as any).accessory_sku_code || (processed as any).accessories_sku_code || undefined,
          // core
          mirrorStyleSkuOverride: (processed as any).mirror_style_sku_code || undefined,
          lightDirectionSkuOverride: (processed as any).light_direction_sku_code || undefined,
          // segments
          sizeSkuOverride: (processed as any).size_sku_code || undefined,
          lightOutputSkuOverride: (processed as any).light_output_sku_code || undefined,
          colorTemperatureSkuOverride: (processed as any).color_temperature_sku_code || undefined,
          driverSkuOverride: (processed as any).driver_sku_code || undefined,
          mountingSkuOverride: (processed as any).mounting_option_sku_code || (processed as any).mounting_sku_code || undefined,
          frameColorSkuOverride: (processed as any).frame_color_sku_code || undefined,
        } as const;
        const out = buildFullSku(effective, options, productLine, overrides);
        if (!cancelled) setComputedSku(out.sku);
      } catch {
        const out = buildFullSku(config, options, productLine);
        if (!cancelled) setComputedSku(out.sku);
      }
    })();
    return () => { cancelled = true; };
  }, [config, options, productLine]);

  return (
    <div className="text-center">
      <p className="text-sm text-gray-600 mb-1">Current Selection SKU</p>
      <p className="font-mono text-sm font-medium text-gray-900 break-all">{computedSku || '—'}</p>
    </div>
  );
};

export default SkuDisplay;
