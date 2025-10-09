import { supabase } from './supabase';
import type { ProductLine, ProductOption, ProductOptions } from '@/store/types';
import type { Database } from '../../supabase';

type SupabaseProduct = Database['public']['Tables']['products']['Row'] & Record<string, unknown>;

const COLLECTION_TO_TABLE: Record<string, string> = {
  frame_colors: 'frame_colors',
  frame_thicknesses: 'frame_thicknesses',
  mirror_styles: 'mirror_styles',
  mounting_options: 'mounting_options',
  light_directions: 'light_directions',
  light_outputs: 'light_outputs',
  color_temperatures: 'color_temperatures',
  drivers: 'drivers',
  sizes: 'sizes',
  accessories: 'accessories',
  hanging_techniques: 'hanging_techniques',
};

const COLLECTION_TO_FIELD: Record<string, keyof ProductOptions> = {
  frame_colors: 'frameColors',
  frame_thicknesses: 'frameThickness',
  mirror_styles: 'mirrorStyles',
  mounting_options: 'mountingOptions',
  hanging_techniques: 'hangingTechniques',
  light_directions: 'lightingOptions',
  light_outputs: 'lightOutputs',
  color_temperatures: 'colorTemperatures',
  drivers: 'drivers',
  sizes: 'sizes',
  accessories: 'accessoryOptions',
  mirror_controls: 'mirrorControls',
};

function createEmptyProductOptions(): ProductOptions {
  return {
    mirrorControls: [],
    frameColors: [],
    frameThickness: [],
    mirrorStyles: [],
    mountingOptions: [],
    hangingTechniques: [],
    lightingOptions: [],
    colorTemperatures: [],
    lightOutputs: [],
    drivers: [],
    accessoryOptions: [],
    sizes: [],
  };
}

function normalizeCollectionName(collection: string): string {
  const normalized = collection.toLowerCase();
  if (normalized === 'hanging_techiques') {
    return 'hanging_techniques';
  }
  return normalized;
}

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  const num = Number(value);
  return Number.isNaN(num) ? null : num;
}

function normalizeOption(row: Record<string, any>): ProductOption {
  const option: ProductOption = {
    id: Number(row.id),
    name:
      row.name ??
      row.label ??
      row.display_name ??
      row.code ??
      (typeof row?.option === 'object' && row.option !== null
        ? (row.option.name ?? row.option.label ?? row.option.code ?? String(row.option.id))
        : undefined) ??
      String(row.id),
    sku_code:
      row.sku_code ??
      row.skuCode ??
      row.code ??
      (typeof row?.option === 'object' && row.option !== null
        ? row.option.sku_code ?? row.option.skuCode ?? row.option.code
        : undefined) ??
      String(row.id),
  };

  if (row.description !== undefined && row.description !== null) {
    option.description = String(row.description);
  }

  if (row.hex_code) {
    option.hex_code = row.hex_code;
  }

  if (row.width !== undefined && row.width !== null) {
    const width = toNumber(row.width);
    if (width !== null) option.width = width;
  }

  if (row.height !== undefined && row.height !== null) {
    const height = toNumber(row.height);
    if (height !== null) option.height = height;
  }

  return option;
}

interface OverrideSpec {
  ids?: number[];
  options?: ProductOption[];
}

function ensureUniqueNumbers(values: number[]): number[] {
  return Array.from(new Set(values.filter((value) => !Number.isNaN(value))));
}

function coerceToProductOption(value: unknown): ProductOption | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const record = value as Record<string, any>;

  if (record.option && typeof record.option === 'object') {
    return normalizeOption(record.option as Record<string, any>);
  }

  if (record.id === undefined || record.id === null) {
    return null;
  }

  return normalizeOption(record);
}

function extractOverrideSpec(raw: unknown): OverrideSpec | null {
  if (!raw) {
    return null;
  }

  const ids: number[] = [];
  const options: ProductOption[] = [];

  const processValue = (value: unknown) => {
    if (value === null || value === undefined) {
      return;
    }

    if (typeof value === 'number' || typeof value === 'string') {
      const parsed = toNumber(value);
      if (parsed !== null) {
        ids.push(parsed);
      }
      return;
    }

    const option = coerceToProductOption(value);
    if (option) {
      options.push(option);
      if (option.id !== undefined) {
        ids.push(option.id);
      }
      return;
    }

    if (typeof value === 'object') {
      const candidate = value as Record<string, unknown>;
      for (const key of ['allow', 'ids', 'items', 'options', 'values']) {
        if (Array.isArray(candidate[key])) {
          (candidate[key] as unknown[]).forEach(processValue);
          return;
        }
      }

      if ('id' in candidate) {
        const optionFromObject = coerceToProductOption(candidate);
        if (optionFromObject) {
          options.push(optionFromObject);
          if (optionFromObject.id !== undefined) {
            ids.push(optionFromObject.id);
          }
        }
      }
    }
  };

  if (Array.isArray(raw)) {
    raw.forEach(processValue);
  } else if (typeof raw === 'object') {
    const record = raw as Record<string, unknown>;

    // Some APIs wrap overrides like { allow: [...] }
    let consumed = false;
    for (const key of ['allow', 'ids', 'items', 'options', 'values']) {
      if (Array.isArray(record[key])) {
        (record[key] as unknown[]).forEach(processValue);
        consumed = true;
      }
    }

    if (!consumed) {
      processValue(raw);
    }
  } else {
    processValue(raw);
  }

  const uniqueIds = ensureUniqueNumbers(ids);
  const uniqueOptions = options.length
    ? Array.from(
        new Map(options.map((option) => [option.id, option])).values(),
      )
    : [];

  if (uniqueIds.length === 0 && uniqueOptions.length === 0) {
    return null;
  }

  const spec: OverrideSpec = {};
  if (uniqueIds.length > 0) {
    spec.ids = uniqueIds;
  }
  if (uniqueOptions.length > 0) {
    spec.options = uniqueOptions;
  }

  return spec;
}

function extractOverridesFromProduct(product?: SupabaseProduct | null): Map<string, OverrideSpec> {
  const overrides = new Map<string, OverrideSpec>();
  if (!product) {
    return overrides;
  }

  for (const collection of Object.keys(COLLECTION_TO_TABLE)) {
    const fieldName = COLLECTION_TO_FIELD[collection];
    const rawValue = product[collection] ?? product[fieldName];

    const spec = extractOverrideSpec(rawValue);
    if (spec) {
      overrides.set(collection, spec);
    }
  }

  return overrides;
}

function extractOverridesFromTable(rows: { collection: unknown; item: unknown }[]): Map<string, OverrideSpec> {
  const overrides = new Map<string, OverrideSpec>();

  rows.forEach((record) => {
    if (!record.collection) {
      return;
    }

    const collection = normalizeCollectionName(String(record.collection));
    const id = toNumber(record.item);
    if (id === null) {
      return;
    }

    const existing = overrides.get(collection) ?? { ids: [] };
    overrides.set(collection, {
      ...existing,
      ids: ensureUniqueNumbers([...(existing.ids ?? []), id]),
    });
  });

  return overrides;
}

export async function fetchProductLines(): Promise<ProductLine[]> {
  const { data, error } = await supabase
    .from('product_lines')
    .select('id, name, sku_code, active')
    .order('sort', { ascending: true });

  if (error) {
    throw new Error(`Failed to load product lines: ${error.message}`);
  }

  return (data ?? []).map((line) => ({
    id: line.id,
    name: line.name ?? '',
    sku_code: line.sku_code ?? '',
    active: line.active ?? true,
    default_options: [],
  }));
}

export async function fetchProductOptions(
  productLineId: number,
  productOrId?: number | SupabaseProduct | null
): Promise<ProductOptions> {
  const options = createEmptyProductOptions();

  let product: SupabaseProduct | null = null;
  let productId: number | null = null;

  if (typeof productOrId === 'number') {
    productId = productOrId;
  } else if (productOrId && typeof productOrId === 'object') {
    product = productOrId as SupabaseProduct;
    productId = typeof product.id === 'number' ? product.id : toNumber(product.id);
  }

  const overridesFromProduct = extractOverridesFromProduct(product);

  let overridesFromTable = new Map<string, OverrideSpec>();
  if (productId) {
    console.log(`📦 Checking for product overrides for product ID: ${productId}`);
    const { data: overrideData, error: overrideError } = await supabase
      .from('products_options_overrides')
      .select('collection, item')
      .eq('products_id', productId);

    if (!overrideError && overrideData && overrideData.length > 0) {
      overridesFromTable = extractOverridesFromTable(overrideData);
      console.log(
        `✅ Product overrides found for ${overridesFromTable.size} collections via products_options_overrides`
      );
    } else {
      console.log('ℹ️  No product overrides found in products_options_overrides');
    }
  }

  const combinedOverrides = new Map<string, OverrideSpec>(overridesFromTable);
  overridesFromProduct.forEach((spec, collection) => {
    const existing = combinedOverrides.get(collection);
    combinedOverrides.set(collection, {
      ids: spec.ids ?? existing?.ids,
      options: spec.options && spec.options.length > 0 ? spec.options : existing?.options,
    });
  });

  if (combinedOverrides.size > 0) {
    console.log(
      `✅ Effective product overrides ready for ${combinedOverrides.size} collections`
    );
  }

  // Load product line defaults
  const { data, error } = await supabase
    .from('product_lines_default_options')
    .select('collection, item')
    .eq('product_lines_id', productLineId);

  if (error) {
    throw new Error(`Failed to load product line defaults: ${error.message}`);
  }

  const grouped = new Map<string, number[]>();

  (data ?? []).forEach((record) => {
    if (!record.collection || record.item === null || record.item === undefined) {
      return;
    }

    const collection = normalizeCollectionName(String(record.collection));
    const id = Number(record.item);

    if (Number.isNaN(id)) {
      return;
    }

    const existing = grouped.get(collection) ?? [];
    grouped.set(collection, [...existing, id]);
  });

  const collectionsToLoad = new Map<string, { ids: number[]; directOptions?: ProductOption[] }>();

  grouped.forEach((ids, collection) => {
    collectionsToLoad.set(collection, { ids });
  });

  combinedOverrides.forEach((spec, collection) => {
    const overrideIds = spec.ids ?? [];
    const directOptions = spec.options && spec.options.length > 0 ? spec.options : undefined;

    if (directOptions) {
      console.log(
        `🔄 Applying inline override for ${collection}: ${directOptions.length} options provided`
      );
      collectionsToLoad.set(collection, { ids: [], directOptions });
    } else {
      console.log(
        `🔄 Applying ID-based override for ${collection}: ${overrideIds.length} override item(s)`
      );
      collectionsToLoad.set(collection, { ids: overrideIds });
    }
  });

  await Promise.all(
    Array.from(collectionsToLoad.entries()).map(async ([collection, spec]) => {
      const directOptions = spec.directOptions;
      const ids = spec.ids ?? [];

      const tableName = COLLECTION_TO_TABLE[collection];
      if (!tableName) {
        return;
      }

      const field = COLLECTION_TO_FIELD[collection];
      if (!field) {
        return;
      }

      if (directOptions && directOptions.length > 0) {
        (options[field] as ProductOption[]) = directOptions.map((option) => ({ ...option }));
        return;
      }

      const uniqueIds = ensureUniqueNumbers(ids);
      if (uniqueIds.length === 0) {
        (options[field] as ProductOption[]) = [];
        return;
      }

      const { data: tableRows, error: tableError } = await (supabase as any)
        .from(tableName)
        .select('*')
        .in('id', uniqueIds)
        .order('sort', { ascending: true });

      if (tableError) {
        console.warn(`Failed to load ${collection} options:`, tableError.message);
        return;
      }

      const normalizedRows = ((tableRows ?? []) as Record<string, any>[]).map((row) =>
        normalizeOption(row)
      );

      (options[field] as ProductOption[]) = normalizedRows;
    })
  );

  return options;
}
