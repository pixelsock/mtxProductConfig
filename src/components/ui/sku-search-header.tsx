import React from 'react';
import { Input } from './input';
import { Button } from './button';
import { Badge } from './badge';
import { Check, AlertCircle, Search } from 'lucide-react';
import type { ProductLine, DecoProduct } from '../../services/directus';
import type { SimpleOptions, CurrentConfigLike } from '../../utils/sku-builder';
import { encodeSkuToQuery, queryToString, parseFullSkuToQuery, parsePartialSkuToQuery } from '../../utils/sku-url';

interface Props {
  productLine: ProductLine;
  options: SimpleOptions;
  config: CurrentConfigLike;
  computeOverrides: (cfg: CurrentConfigLike) => Promise<any | undefined>;
  onApply: (sku: string) => void;
  products?: Pick<DecoProduct, 'id' | 'name'>[];
  availableIds?: Record<string, number[]>; // rules + product aware availability
  initialValue?: string;
  className?: string;
}

type Suggestion = { sku: string; label: string };

export const SkuSearchHeader: React.FC<Props> = ({ productLine, options, config, computeOverrides, onApply, products = [], availableIds = {}, initialValue = '', className }) => {
  const [value, setValue] = React.useState(initialValue);
  const [isValid, setIsValid] = React.useState<boolean | null>(null);
  const [suggestions, setSuggestions] = React.useState<Suggestion[]>([]);
  const [open, setOpen] = React.useState(false);

  // Build a default full SKU (rule-aware) from the current config
  const buildCurrentFullSku = React.useCallback(async () => {
    const overrides = await computeOverrides(config);
    const q = encodeSkuToQuery(config, options, productLine, overrides);
    // Build full SKU string from codes, omitting missing segments
    const parts: string[] = [];
    const core = `${q.pl || productLine.sku_code || ''}${q.ms || ''}${q.ld || ''}`;
    if (core) parts.push(core);
    if (q.sz) parts.push(q.sz);
    if (q.lo) parts.push(q.lo);
    if (q.ct) parts.push(q.ct);
    if (q.dr) parts.push(q.dr);
    if (q.mo) parts.push(q.mo);
    if (q.fc) parts.push(q.fc);
    if (q.ac) parts.push(q.ac);
    return parts.join('-');
  }, [computeOverrides, config, options, productLine]);

  // Validate input: treat as valid if we can parse any meaningful part
  const validate = React.useCallback((text: string) => {
    const t = (text || '').trim();
    if (!t) return null;
    const upper = t.toUpperCase();
    const pl = productLine.sku_code || '';
    // Quick product-based validation for core-only typing
    if (!upper.includes('-') && products && products.length > 0) {
      const cores = products.map(p => (p.name || '').toUpperCase());
      if (cores.some(c => c.startsWith(upper))) return true;
    }
    // Prefer full parse, fall back to partial
    const full = parseFullSkuToQuery(upper, pl, options);
    if (full) return true;
    const partial = parsePartialSkuToQuery(upper, pl, options);
    return !!partial;
  }, [options, productLine, products]);

  // Build suggestions based on typed text
  const rebuildSuggestions = React.useCallback(async (text: string) => {
    const t = (text || '').trim().toUpperCase();
    const baseFull = await buildCurrentFullSku();
    const list: Suggestion[] = [];
    const pl = productLine.sku_code || '';

    // Always include the current selection as a quick action
    if (baseFull) list.push({ sku: baseFull, label: 'Current selection' });

    // Product-driven core suggestions (fast, intuitive):
    if (!t.includes('-')) {
      const cores = (products || [])
        .map(p => (p?.name || '').toUpperCase())
        .filter(Boolean);
      const starts = cores.filter(c => c.startsWith(t)).slice(0, 20);
      const subs = t ? cores.filter(c => c.includes(t) && !starts.includes(c)).slice(0, Math.max(0, 20 - starts.length)) : [];
      for (const c of [...starts, ...subs]) {
        list.push({ sku: c, label: 'Product' });
      }
      // If we suggested product cores, keep the list focused
      if (list.length > 0) { setSuggestions(list.slice(0, 20)); return; }
    }

    const msCodes = options.mirrorStyles
      .filter(o => !availableIds.mirror_style || availableIds.mirror_style.length === 0 || availableIds.mirror_style.includes(o.id))
      .map(o => o.sku_code)
      .filter(Boolean) as string[];
    const ldCodes = options.lightingOptions
      .filter(o => !availableIds.light_direction || availableIds.light_direction.length === 0 || availableIds.light_direction.includes(o.id))
      .map(o => o.sku_code)
      .filter(Boolean) as string[];
    const sizeCodes = options.sizes
      .filter(o => !availableIds.size || availableIds.size.length === 0 || availableIds.size.includes(o.id))
      .map(o => o.sku_code)
      .filter(Boolean) as string[];
    const loCodes = options.lightOutputs
      .filter(o => !availableIds.light_output || availableIds.light_output.length === 0 || availableIds.light_output.includes(o.id))
      .map(o => o.sku_code)
      .filter(Boolean) as string[];
    const ctCodes = options.colorTemperatures
      .filter(o => !availableIds.color_temperature || availableIds.color_temperature.length === 0 || availableIds.color_temperature.includes(o.id))
      .map(o => o.sku_code)
      .filter(Boolean) as string[];
    const drCodes = options.drivers
      .filter(o => !availableIds.driver || availableIds.driver.length === 0 || availableIds.driver.includes(o.id))
      .map(o => o.sku_code)
      .filter(Boolean) as string[];
    const moCodes = options.mountingOptions
      .filter(o => !availableIds.mounting || availableIds.mounting.length === 0 || availableIds.mounting.includes(o.id))
      .map(o => o.sku_code)
      .filter(Boolean) as string[];
    const fcCodes = options.frameColors
      .filter(o => !availableIds.frame_color || availableIds.frame_color.length === 0 || availableIds.frame_color.includes(o.id))
      .map(o => o.sku_code)
      .filter(Boolean) as string[];
    const acCodes = options.accessoryOptions
      .filter(o => !availableIds.accessories || availableIds.accessories.length === 0 || availableIds.accessories.includes(o.id))
      .map(o => o.sku_code)
      .filter(Boolean) as string[];

    // Decide which segment to suggest next
    const segs = t.split('-');
    const core = segs[0] || '';
    const after = segs.slice(1);

    // Helper to push a batch of segment suggestions
    const pushSeg = (prefix: string, codes: string[], label: string, filterPrefix?: string) => {
      const filtered = filterPrefix ? codes.filter(c => c.startsWith(filterPrefix)) : codes;
      for (const c of filtered) {
        list.push({ sku: `${prefix}-${c}`, label });
        if (list.length > 50) break;
      }
    };

    // 1) Core suggestions (options-based fallback if products not provided)
    const coreRest = core.startsWith(pl) ? core.slice(pl.length) : '';
    const msMatch = msCodes.find(ms => coreRest.startsWith(ms));
    const ldRemainder = msMatch ? coreRest.slice(msMatch.length) : '';
    const ldExact = ldCodes.includes(ldRemainder) ? ldRemainder : '';

    if (!core || !core.startsWith(pl)) {
      // No or wrong prefix: propose all cores for this product line
      const firstChar = core.slice(0, 1);
      if (!firstChar || firstChar === pl) {
        for (const ms of msCodes) {
          for (const ld of ldCodes) {
            const coreCode = `${pl}${ms}${ld}`;
            list.push({ sku: coreCode, label: 'Core' });
            if (list.length > 50) break;
          }
          if (list.length > 50) break;
        }
      }
    } else if (msMatch && !ldExact) {
      // Mirror style complete, suggest finishing LD
      const base = `${pl}${msMatch}`;
      const filter = ldRemainder || undefined;
      const ldList = filter ? ldCodes.filter(code => code.startsWith(filter)) : ldCodes;
      for (const ld of ldList) {
        list.push({ sku: `${base}${ld}`, label: 'Complete core' });
        if (list.length > 50) break;
      }
    } else if (msMatch && ldExact) {
      // Core complete, move to next segment suggestions progressively
      const coreDone = `${pl}${msMatch}${ldExact}`;
      if (segs.length === 1) {
        pushSeg(coreDone, sizeCodes, 'Size');
      } else if (segs.length >= 2) {
        const szPartial = after[0] || '';
        const szExact = sizeCodes.includes(szPartial) || /^(\d{2})[xX]?(\d{2})$/.test(szPartial);
        if (!szExact) {
          pushSeg(coreDone, sizeCodes, 'Size', szPartial || undefined);
        } else {
          const prefix2 = `${coreDone}-${szPartial}`;
          if (segs.length === 2) {
            pushSeg(prefix2, loCodes, 'Light Output');
          } else {
            const loPartial = after[1] || '';
            const loExact = loCodes.includes(loPartial);
            if (!loExact) {
              pushSeg(prefix2, loCodes, 'Light Output', loPartial || undefined);
            } else {
              const p3 = `${prefix2}-${loPartial}`;
              if (segs.length === 3) {
                pushSeg(p3, ctCodes, 'Color Temp');
              } else {
                const ctPartial = after[2] || '';
                const ctExact = ctCodes.includes(ctPartial);
                if (!ctExact) {
                  pushSeg(p3, ctCodes, 'Color Temp', ctPartial || undefined);
                } else {
                  const p4 = `${p3}-${ctPartial}`;
                  if (segs.length === 4) {
                    pushSeg(p4, drCodes, 'Driver');
                  } else {
                    const drPartial = after[3] || '';
                    const drExact = drCodes.includes(drPartial);
                    if (!drExact) {
                      pushSeg(p4, drCodes, 'Driver', drPartial || undefined);
                    } else {
                      const p5 = `${p4}-${drPartial}`;
                      if (segs.length === 5) {
                        pushSeg(p5, moCodes, 'Mounting');
                      } else {
                        const moPartial = after[4] || '';
                        const moExact = moCodes.includes(moPartial);
                        if (!moExact) {
                          pushSeg(p5, moCodes, 'Mounting', moPartial || undefined);
                        } else {
                          const p6 = `${p5}-${moPartial}`;
                          if (segs.length === 6) {
                            pushSeg(p6, fcCodes, 'Frame Color');
                          } else {
                            const fcPartial = after[5] || '';
                            const fcExact = fcCodes.includes(fcPartial);
                            if (!fcExact) {
                              pushSeg(p6, fcCodes, 'Frame Color', fcPartial || undefined);
                            } else {
                              const p7 = `${p6}-${fcPartial}`;
                              // Accessories: include composite tokens + known combos
                              const acc = ['AN', 'NA', ...acCodes];
                              const acPartial = after[6] || '';
                              const acList = acPartial ? acc.filter(a => a.startsWith(acPartial)) : acc;
                              for (const a of acList) {
                                list.push({ sku: `${p7}-${a}`, label: 'Accessories' });
                                if (list.length > 50) break;
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    } else {
      // Mirror style not complete: propose ms codes that start with the typed remainder
      const typed = coreRest || '';
      const matches = msCodes.filter(m => !typed || m.startsWith(typed));
      for (const m of matches) {
        // Suggest both possible light directions for each ms
        for (const d of ldCodes) {
          const c = `${pl}${m}${d}`;
          list.push({ sku: c, label: 'Core' });
          if (list.length > 50) break;
        }
        if (list.length > 50) break;
      }
    }

    // Final filter: if user typed something, prefer suggestions that include it
    const filtered = t ? list.filter(s => s.sku.toUpperCase().includes(t)) : list;
    setSuggestions(filtered.slice(0, 20));
  }, [buildCurrentFullSku, options, productLine]);

  // Effects: validate and suggest on input change
  React.useEffect(() => {
    const v = validate(value);
    setIsValid(v);
    rebuildSuggestions(value);
    setOpen(!!value);
  }, [value, validate, rebuildSuggestions]);

  return (
    <div className={className}>
      <div className="relative">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={`Search or paste SKU for ${productLine.name}`}
              className="pl-8 pr-10"
              onFocus={() => rebuildSuggestions(value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (value) onApply(value.toUpperCase());
                }
              }}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              {isValid === true && <Check className="w-4 h-4 text-green-600" />}
              {isValid === false && <AlertCircle className="w-4 h-4 text-red-500" />}
            </div>
          </div>
          <Button size="sm" onClick={() => value && onApply(value.toUpperCase())}>Apply</Button>
        </div>
        {open && suggestions.length > 0 && (
          <div className="absolute z-50 mt-2 w-full rounded-md border bg-white shadow-md">
            <ul className="max-h-64 overflow-auto py-1">
              {suggestions.map((s, idx) => (
                <li key={idx}>
                  <button
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center justify-between"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => { setValue(s.sku); setOpen(false); onApply(s.sku); }}
                  >
                    <span className="font-mono text-sm text-gray-900">{s.sku}</span>
                    <Badge variant="outline" className="text-xs text-muted-foreground border-none">{s.label}</Badge>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default SkuSearchHeader;
