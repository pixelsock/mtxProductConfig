import React from 'react';
import { Badge } from './badge';
import { Input } from './input';
import { Label } from './label';
import { Switch } from './switch';
import { getMappingForCollection, DynamicMapping } from '../../services/dynamic-config';

type Option = { 
  id: any; 
  name?: string; 
  sku_code?: string; 
  hex_code?: string; 
  width?: number; 
  height?: number; 
  description?: string;
  [key: string]: any; // Allow dynamic field access
};

export interface DynamicOptionsProps {
  productLineDefaults: { collection: string; item: string }[] | undefined;
  optionsByCollection: Record<string, Option[]>;
  uiByCollection: Record<string, string>;
  uiSortByCollection?: Record<string, number>;
  // Bridge to legacy config for now
  currentConfig: any;
  onChange: (key: string, value: string | string[]) => void;
  availableOptionIds?: Record<string, number[]>;
  customSize?: boolean;
  onToggleCustomSize?: (v: boolean) => void;
}

export const DynamicOptions: React.FC<DynamicOptionsProps> = ({ productLineDefaults, optionsByCollection, uiByCollection, uiSortByCollection = {}, currentConfig, onChange, availableOptionIds = {}, customSize = false, onToggleCustomSize }) => {
  // State for dynamic mappings
  const [mappings, setMappings] = React.useState<Record<string, DynamicMapping>>({});

  // Load dynamic mappings for all collections
  React.useEffect(() => {
    const loadMappings = async () => {
      const defs = Array.isArray(productLineDefaults) ? productLineDefaults : [];
      const collections = Array.from(new Set(defs.map(d => d.collection).filter(Boolean)));
      
      const newMappings: Record<string, DynamicMapping> = {};
      for (const collection of collections) {
        const mapping = await getMappingForCollection(collection);
        if (mapping) {
          newMappings[collection] = mapping;
        }
      }
      setMappings(newMappings);
    };
    
    loadMappings();
  }, [productLineDefaults]);

  const collections = React.useMemo(() => {
    const defs = Array.isArray(productLineDefaults) ? productLineDefaults : [];
    const uniq = Array.from(new Set(defs.map(d => d.collection).filter(Boolean)));
    const filtered = uniq.filter(c => (optionsByCollection[c] || []).length > 0);
    
    // Sort by dynamic mapping sort order
    filtered.sort((a, b) => {
      const sortA = mappings[a]?.sort ?? uiSortByCollection[a] ?? Number.MAX_SAFE_INTEGER;
      const sortB = mappings[b]?.sort ?? uiSortByCollection[b] ?? Number.MAX_SAFE_INTEGER;
      return sortA - sortB;
    });
    
    return filtered;
  }, [productLineDefaults, optionsByCollection, uiSortByCollection, mappings]);

  // Identify collections present in defaults but with zero visible options (likely permissions / missing items)
  const missingCollections = React.useMemo(() => {
    const defs = Array.isArray(productLineDefaults) ? productLineDefaults : [];
    const referenced = Array.from(new Set(defs.map(d => d.collection).filter(Boolean)));
    return referenced.filter((coll) => !((optionsByCollection[coll] || []).length > 0));
  }, [productLineDefaults, optionsByCollection]);

  const renderBlock = (coll: string, opts: Option[]) => {
    const mapping = mappings[coll];
    const ui = mapping?.uiType || uiByCollection[coll] || (coll === 'frame_colors' ? 'color-swatch' : (coll === 'sizes' ? 'size-grid' : 'grid-2'));
    const isMulti = mapping?.isMultiple || ui === 'multi' || coll === 'accessories';
    
    const value = ((): string | string[] => {
      if (!mapping) return '';
      
      // Handle sizes specially - they use width/height instead of a single config key
      if (coll === 'sizes') {
        const sz = opts.find(s => s.width?.toString() === (currentConfig?.width || '') && s.height?.toString() === (currentConfig?.height || ''));
        return sz ? String(sz[mapping.valueField] || sz.id) : '';
      }
      
      // Use dynamic mapping to get the config key
      const configKey = mapping.configKey;
      return currentConfig?.[configKey] || (isMulti ? [] : '');
    })();
    // Map collection -> availability key used by availableOptionIds (product field names)
    const availabilityKeyForCollection = (collection: string): string => {
      const special: Record<string, string> = {
        // Common plural-to-field mappings
        mirror_styles: 'mirror_style',
        light_directions: 'light_direction',
        frame_thicknesses: 'frame_thickness',
        mounting_options: 'mounting',
        color_temperatures: 'color_temperature',
        light_outputs: 'light_output',
        frame_colors: 'frame_color',
        mirror_controls: 'mirror_control',
        drivers: 'driver',
        hanging_techniques: 'hanging_technique',
        accessories: 'accessory',
      };
      if (special[collection]) return special[collection];
      if (collection.endsWith('ies')) return collection.slice(0, -3) + 'y';
      if (collection.endsWith('s')) return collection.slice(0, -1);
      return collection;
    };
    const availKey = availabilityKeyForCollection(coll);
    const hasKey = Object.prototype.hasOwnProperty.call(availableOptionIds, availKey);
    const allowed = hasKey ? (availableOptionIds[availKey] as any) : undefined;
    const isDisabled = (id: any) => {
      // Mirror styles must remain selectable; they control other availability
      if (coll === 'mirror_styles') return false;
      if (!allowed || (Array.isArray(allowed) && allowed.length === 0)) return !!(Array.isArray(allowed) && allowed.length === 0);
      const idStr = String(id);
      const list: any[] = Array.isArray(allowed) ? allowed : [];
      // Support both numeric and string ids
      const ok = list.some(v => String(v) === idStr);
      return !ok;
    };

    const isColor = coll === 'frame_colors' || opts.some(o => !!o.hex_code);
    const isSizeGrid = coll === 'sizes' || ui === 'size-grid';
    const heading = coll.replace(/_/g,' ').replace(/\w/g, c => c.toUpperCase());

    const handleSelect = (id: string) => {
      if (!mapping) return;
      
      const configKey = mapping.configKey;
      
      // Handle multi-select (like accessories)
      if (isMulti) {
        const curr = Array.isArray(currentConfig?.[configKey]) ? [...currentConfig[configKey]] : [];
        const idx = curr.indexOf(id);
        if (idx >= 0) curr.splice(idx, 1); else curr.push(id);
        onChange(configKey, curr);
        return;
      }
      
      // Handle sizes specially - they update width/height
      if (coll === 'sizes') {
        const opt = opts.find(o => String(o[mapping.valueField] || o.id) === id);
        if (opt) {
          onChange('width', String(opt.width ?? ''));
          onChange('height', String(opt.height ?? ''));
        }
        return;
      }
      
      // Standard single-select
      onChange(configKey, id);
    };

    // Custom size mode is explicitly driven by parent state
    const customOn = isSizeGrid ? !!customSize : false;

    return (
      <div key={coll}>
        <h3 className="text-xl font-semibold text-gray-900 mb-6">{heading}</h3>
        {isSizeGrid ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-base font-medium text-gray-900">Size</h4>
              <div className="flex items-center gap-2">
                <Label htmlFor={`custom-size-${coll}`} className="text-sm text-gray-700">Custom Size</Label>
                <Switch id={`custom-size-${coll}`} checked={customOn} onCheckedChange={(checked) => {
                  if (onToggleCustomSize) onToggleCustomSize(checked);
                  if (!checked) {
                    // Return to presets; ensure we select a preset if none matches
                    const match = opts.find(o => String(o.width ?? '') === String(currentConfig?.width || '') && String(o.height ?? '') === String(currentConfig?.height || ''));
                    const first = match || opts[0];
                    if (first) handleSelect(String(first.id));
                  }
                }} />
              </div>
            </div>
            {customOn ? (
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-gray-700">Width (inches)</Label>
                  <div className="relative">
                    <Input type="number" step="0.25" value={currentConfig?.width || ''} onChange={(e) => { if (onToggleCustomSize) onToggleCustomSize(true); onChange('width', e.target.value); }} min="12" max="120" className="text-center text-lg font-medium h-12 bg-gray-50 border-gray-200" />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">in</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700">Height (inches)</Label>
                  <div className="relative">
                    <Input type="number" step="0.25" value={currentConfig?.height || ''} onChange={(e) => { if (onToggleCustomSize) onToggleCustomSize(true); onChange('height', e.target.value); }} min="12" max="120" className="text-center text-lg font-medium h-12 bg-gray-50 border-gray-200" />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">in</div>
                  </div>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-600">Tip: You can specify sizes to the quarter inch (e.g., 54.25).</p>
                </div>
              </div>
            ) : (
              <div className={'grid grid-cols-2 gap-4'}>
                {opts.map(o => {
                  const id = String(o.id);
                  const disabled = isDisabled(id);
                  const selected = String(value || '') === String(o[mapping?.valueField || 'id'] || o.id);
                  const imgField = mapping?.imageField as string | undefined;
                  const rawImg = imgField ? (o as any)[imgField] : undefined;
                  const imgId = typeof rawImg === 'string' ? rawImg : (rawImg && typeof rawImg === 'object' && rawImg.id ? rawImg.id : undefined);
                  const imgUrl = imgId ? `${(import.meta as any).env?.VITE_DIRECTUS_URL || 'https://pim.dude.digital'}/assets/${imgId}` : undefined;
                  return (
                    <button key={id} onClick={() => { if (disabled) return; if (onToggleCustomSize) onToggleCustomSize(false); handleSelect(String(o[mapping?.valueField || 'id'] || o.id)); }} disabled={disabled}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${selected ? 'border-amber-500 bg-amber-50' : disabled ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {imgUrl && (
                            <img src={imgUrl} alt={o.name || o.sku_code || 'option'} className="w-12 h-12 rounded object-cover border border-gray-200" />
                          )}
                          <div className="font-medium text-gray-900 mb-1">{o[mapping?.displayField || 'name'] || o.name}</div>
                          {o.width && o.height && (
                            <div className="text-sm text-gray-600">{o.width}" × {o.height}"</div>
                          )}
                          {o.description && (
                            <div className="text-sm text-gray-600 mt-1 line-clamp-2">{o.description}</div>
                          )}
                        </div>
                        <Badge variant="outline">{o.sku_code}</Badge>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className={ui === 'grid-2' || isColor ? 'grid grid-cols-2 gap-4' : 'space-y-3'}>
            {opts.map(o => {
              const id = String(o.id);
              const disabled = isDisabled(id);
              const itemValue = String(o[mapping?.valueField || 'id'] || o.id);
              const selected = isMulti
                ? (Array.isArray(value) && value.includes(itemValue))
                : (String(value || '') === itemValue);
              const imgField = mapping?.imageField as string | undefined;
              const rawImg = imgField ? (o as any)[imgField] : undefined;
              const imgId = typeof rawImg === 'string' ? rawImg : (rawImg && typeof rawImg === 'object' && rawImg.id ? rawImg.id : undefined);
              const imgUrl = imgId ? `${(import.meta as any).env?.VITE_DIRECTUS_URL || 'https://pim.dude.digital'}/assets/${imgId}` : undefined;
              return (
                <button key={id}
                  onClick={() => !disabled && handleSelect(itemValue)}
                  disabled={disabled}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${selected ? 'border-amber-500 bg-amber-50' : disabled ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {imgUrl ? (
                        <img src={imgUrl} alt={o.name || o.sku_code || 'option'} className="w-12 h-12 rounded object-cover border border-gray-200" />
                      ) : isColor ? (
                        <div className="w-6 h-6 rounded-full border border-gray-300 flex-shrink-0" style={{ backgroundColor: o.hex_code || '#000000' }} />
                      ) : null}
                      <div>
                        <div className="font-medium text-gray-900 mb-0.5">{o[mapping?.displayField || 'name'] || o.name || o.sku_code}</div>
                        {o.description && (
                          <div className="text-sm text-gray-600 mt-1 line-clamp-2">{o.description}</div>
                        )}
                      </div>
                    </div>
                    <Badge variant="outline">{o.sku_code}</Badge>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-10">
      {collections.map(coll => renderBlock(coll, optionsByCollection[coll] || []))}
      {missingCollections.length > 0 && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
          Some option sets aren’t visible: {missingCollections.join(', ')}. Ensure your role can read these collections and that the referenced items exist.
        </div>
      )}
    </div>
  );
};

export default DynamicOptions;
