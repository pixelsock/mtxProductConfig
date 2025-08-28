import type { ProductLine } from '../services/directus';
import type { SimpleOptions, CurrentConfigLike } from './sku-builder';
import { buildFullSku } from './sku-builder';
import type { ProductLine } from '../services/directus';

export type SkuQuery = {
  pl?: string; // product line
  ms?: string; // mirror style
  ld?: string; // light direction
  sz?: string; // size
  lo?: string; // light output
  ct?: string; // color temperature
  dr?: string; // driver
  mo?: string; // mounting option
  fc?: string; // frame color
  ac?: string; // accessories ("NL+AF" or overrides like "NA"/"AN")
};

const COMPOSITE_ACCESSORY_MAP: Record<string, string[] | null> = {
  // Composite -> component codes; null means explicitly none
  AN: ['NL', 'AF'],
  NA: null,
};

export function encodeSkuToQuery(
  config: CurrentConfigLike,
  options: SimpleOptions,
  productLine: ProductLine,
  overrides?: Parameters<typeof buildFullSku>[3]
): SkuQuery {
  const parts = buildFullSku(config, options, productLine, overrides).parts;
  const q: SkuQuery = {};

  // Derive codes from current selections and overrides
  q.pl = overrides?.productLineSkuOverride || productLine.sku_code || undefined;
  const findSku = (arr: { id: number; sku_code: string }[], idStr?: string) => {
    const id = idStr ? parseInt(idStr, 10) : NaN;
    if (!Number.isFinite(id)) return undefined;
    return arr.find(o => o.id === id)?.sku_code;
  };
  q.ms = overrides?.mirrorStyleSkuOverride || findSku(options.mirrorStyles, config.mirrorStyle);
  q.ld = overrides?.lightDirectionSkuOverride || findSku(options.lightingOptions, config.lighting);
  q.sz = overrides?.sizeSkuOverride || parts.size;
  q.lo = overrides?.lightOutputSkuOverride || findSku(options.lightOutputs, config.lightOutput);
  q.ct = overrides?.colorTemperatureSkuOverride || findSku(options.colorTemperatures, config.colorTemperature);
  q.dr = overrides?.driverSkuOverride || findSku(options.drivers, config.driver);
  q.mo = overrides?.mountingSkuOverride || findSku(options.mountingOptions, config.mounting);
  q.fc = overrides?.frameColorSkuOverride || findSku(options.frameColors, config.frameColor);
  q.ac = overrides?.accessoriesOverride || overrides?.accessoryFallback || parts.accessories;

  // Remove empty keys
  Object.keys(q).forEach(k => { if ((q as any)[k] === undefined || (q as any)[k] === '') delete (q as any)[k]; });
  return q;
}

export function queryToString(q: SkuQuery): string {
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(q)) {
    if (v) usp.set(k, v);
  }
  const s = usp.toString();
  return s ? `?${s}` : '';
}

export function decodeQueryToSelection(qs: string, options: SimpleOptions) {
  const usp = new URLSearchParams(qs.startsWith('?') ? qs.slice(1) : qs);
  const pickId = (arr: { id: number; sku_code: string }[], code?: string) => {
    if (!code) return undefined;
    return arr.find(o => o.sku_code === code)?.id;
  };

  const out: Partial<CurrentConfigLike> & { accessories?: string[] } = {};
  out.mirrorStyle = pickId(options.mirrorStyles, usp.get('ms'))?.toString() || '';
  out.lighting = pickId(options.lightingOptions, usp.get('ld'))?.toString() || '';
  out.frameThickness = '';
  out.driver = pickId(options.drivers, usp.get('dr'))?.toString() || '';
  out.frameColor = pickId(options.frameColors, usp.get('fc'))?.toString() || '';
  out.mounting = pickId(options.mountingOptions, usp.get('mo'))?.toString() || '';
  out.lightOutput = pickId(options.lightOutputs, usp.get('lo'))?.toString() || '';
  out.colorTemperature = pickId(options.colorTemperatures, usp.get('ct'))?.toString() || '';
  // Size: try to map sz to a size option or infer width/height
  const sz = usp.get('sz') || '';
  if (sz) {
    const sizeByCode = options.sizes.find(s => (s.sku_code || '').toUpperCase() === sz.toUpperCase());
    if (sizeByCode) {
      if (sizeByCode.width) out.width = String(sizeByCode.width);
      if (sizeByCode.height) out.height = String(sizeByCode.height);
    } else {
      // Try patterns like 24x36 or 2436
      const m = sz.match(/^(\d{2})[xX]?(\d{2})$/);
      if (m) {
        out.width = String(parseInt(m[1], 10));
        out.height = String(parseInt(m[2], 10));
      }
    }
  }

  const ac = usp.get('ac');
  if (ac) {
    // Expand composite codes first
    let codes = ac.split('+');
    if (codes.length === 1 && COMPOSITE_ACCESSORY_MAP.hasOwnProperty(codes[0])) {
      const mapped = COMPOSITE_ACCESSORY_MAP[codes[0]];
      if (mapped === null) {
        out.accessories = [];
        return out;
      } else if (Array.isArray(mapped)) {
        codes = mapped;
      }
    }
    const ids = codes
      .map(code => options.accessoryOptions.find(a => a.sku_code === code)?.id)
      .filter((id): id is number => typeof id === 'number')
      .map(id => id.toString());
    out.accessories = ids;
  }
  // Size code is not mapped to width/height here; left as future enhancement
  return out;
}

// Parse a full SKU string like PLMSLD-SZ-LO-CT-DR-MO-FC-AC into query parts
export function parseFullSkuToQuery(fullSku: string, productLineCode: string, options: SimpleOptions): SkuQuery | null {
  if (!fullSku) return null;
  const [core, sz, lo, ct, dr, mo, fc, ac] = fullSku.split('-');
  if (!core || !core.startsWith(productLineCode)) return null;
  const coreRest = core.slice(productLineCode.length);

  // Try to split coreRest into ms + ld using available codes
  const ldCodes = options.lightingOptions.map(o => o.sku_code).filter(Boolean);
  const msCodes = options.mirrorStyles.map(o => o.sku_code).filter(Boolean);
  let ms: string | undefined;
  let ld: string | undefined;
  for (const msCode of msCodes) {
    if (coreRest.startsWith(msCode)) {
      const maybeLd = coreRest.slice(msCode.length);
      if (ldCodes.includes(maybeLd)) {
        ms = msCode; ld = maybeLd; break;
      }
    }
  }
  if (!ms || !ld) return null;

  const q: SkuQuery = { pl: productLineCode, ms, ld };
  if (sz) q.sz = sz;
  if (lo) q.lo = lo;
  if (ct) q.ct = ct;
  if (dr) q.dr = dr;
  if (mo) q.mo = mo;
  if (fc) q.fc = fc;
  if (ac) q.ac = ac;
  return q;
}

// Parse partial or full SKU, returning any confidently matched parts.
// Accepts inputs like:
// - Core only: "PLMSLD", "PLMS", "PL"
// - With segments: "PLMSLD-SZ", "PLMSLD-SZ-LO" (segments must match exactly to be set)
// - Tolerates lowercase, spaces; dashes separate segments
export function parsePartialSkuToQuery(input: string, productLineCode: string, options: SimpleOptions): SkuQuery | null {
  if (!input) return null;
  const text = input.trim().toUpperCase();
  if (!text) return null;

  const segs = text.split('-');
  const core = segs[0] || '';
  if (!core) return null;

  const q: SkuQuery = {};

  // Core: must begin with product line. If missing, bail.
  if (!core.startsWith(productLineCode)) return null;
  q.pl = productLineCode;
  const coreRest = core.slice(productLineCode.length);

  // Determine ms and ld from coreRest, allowing partials but only committing exact matches.
  const ldCodes = options.lightingOptions.map(o => o.sku_code).filter(Boolean) as string[];
  const msCodes = options.mirrorStyles.map(o => o.sku_code).filter(Boolean) as string[];

  let msMatch: string | undefined;
  let ldMatch: string | undefined;

  // Find longest mirror-style code that is a prefix of coreRest
  for (const ms of msCodes.sort((a, b) => b.length - a.length)) {
    if (coreRest.startsWith(ms)) {
      // Only set if exact match to a known code
      msMatch = ms;
      const remainder = coreRest.slice(ms.length);
      // If remainder exactly equals an ld code, commit it; if it's a prefix, leave ld unset
      if (ldCodes.includes(remainder)) {
        ldMatch = remainder;
      }
      break;
    }
  }
  if (msMatch) q.ms = msMatch;
  if (ldMatch) q.ld = ldMatch;

  // Subsequent segments: only set if exact code matches a known option
  const tryMatch = (arr: { sku_code: string }[], seg?: string) => {
    if (!seg) return undefined;
    const code = seg.toUpperCase();
    return arr.find(o => (o.sku_code || '').toUpperCase() === code)?.sku_code;
  };

  // sz can be a size code or dimension pattern like 24x36 or 2436
  const seg_sz = segs[1];
  if (seg_sz) {
    const byCode = tryMatch(options.sizes, seg_sz);
    if (byCode) {
      q.sz = byCode;
    } else {
      const m = seg_sz.match(/^(\d{2})[xX]?(\d{2})$/);
      if (m) q.sz = `${m[1]}x${m[2]}`.toUpperCase();
    }
  }

  const seg_lo = segs[2];
  const lo = tryMatch(options.lightOutputs, seg_lo);
  if (lo) q.lo = lo;

  const seg_ct = segs[3];
  const ct = tryMatch(options.colorTemperatures, seg_ct);
  if (ct) q.ct = ct;

  const seg_dr = segs[4];
  const dr = tryMatch(options.drivers, seg_dr);
  if (dr) q.dr = dr;

  const seg_mo = segs[5];
  const mo = tryMatch(options.mountingOptions, seg_mo);
  if (mo) q.mo = mo;

  const seg_fc = segs[6];
  const fc = tryMatch(options.frameColors, seg_fc);
  if (fc) q.fc = fc;

  const seg_ac = segs[7];
  if (seg_ac) {
    // Normalize accessories: expand composites if present, but keep original token in q.ac
    const token = seg_ac.toUpperCase();
    if (COMPOSITE_ACCESSORY_MAP.hasOwnProperty(token)) {
      q.ac = token;
    } else {
      // Ensure each subcode is known or leave as-is if plus-separated
      const parts = token.split('+');
      const allKnown = parts.every(p => !!tryMatch(options.accessoryOptions, p));
      if (allKnown) q.ac = token;
    }
  }

  // If we matched nothing beyond pl, provide at least pl in q to signal partial ok
  return Object.keys(q).length > 0 ? q : null;
}

// Build a single search param string from current config (rule-aware)
export function buildSearchParam(
  config: CurrentConfigLike,
  options: SimpleOptions,
  productLine: ProductLine,
  overrides?: Parameters<typeof buildFullSku>[3]
): string {
  const full = buildFullSku(config, options, productLine, overrides);
  return full.sku;
}

// Parse a search param SKU (unknown product line) by matching core to products
export function parseSearchParam(
  searchSku: string,
  allProducts: { name?: string | null; product_line?: number | null }[],
  productLines: ProductLine[],
  options: SimpleOptions
): { productLine: ProductLine; selection: ReturnType<typeof decodeQueryToSelection> } | null {
  if (!searchSku) return null;
  const text = searchSku.trim().toUpperCase();
  if (!text) return null;
  const core = (text.split('-')[0] || '').toUpperCase();
  if (!core) return null;
  // 1) Try exact product core match
  const prod = allProducts.find(p => (p.name || '').toUpperCase() === core);
  let pl: ProductLine | undefined;
  if (prod && prod.product_line) {
    pl = productLines.find(pl => pl.id === prod!.product_line);
  }
  // 2) Fallback: infer by product_line.sku_code prefix
  if (!pl) {
    const candidates = productLines.filter(x => core.startsWith((x.sku_code || '').toUpperCase()));
    if (candidates.length > 0) {
      // Choose the longest matching sku_code to be safe
      pl = candidates.sort((a, b) => (b.sku_code || '').length - (a.sku_code || '').length)[0];
    }
  }
  if (!pl || !pl.sku_code) return null;
  const q = parsePartialSkuToQuery(text, pl.sku_code, options);
  const selection = q ? decodeQueryToSelection(queryToString(q), options) : ({} as any);
  return { productLine: pl, selection };
}
