import { supabase } from './supabase';
import type { ProductLine, ProductOption, ProductOptions } from '@/store/types';

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

function normalizeOption(row: Record<string, any>): ProductOption {
  const option: ProductOption = {
    id: Number(row.id),
    name: row.name ?? row.code ?? String(row.id),
    sku_code: row.sku_code ?? row.code ?? String(row.id),
  };

  if (row.description !== undefined && row.description !== null) {
    option.description = String(row.description);
  }

  if (row.hex_code) {
    option.hex_code = row.hex_code;
  }

  if (row.width !== undefined && row.width !== null) {
    const width = Number(row.width);
    if (!Number.isNaN(width)) option.width = width;
  }

  if (row.height !== undefined && row.height !== null) {
    const height = Number(row.height);
    if (!Number.isNaN(height)) option.height = height;
  }

  return option;
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
  productId?: number | null
): Promise<ProductOptions> {
  const options = createEmptyProductOptions();

  // Check if product has specific overrides
  let productOverrides: Map<string, number[]> | null = null;
  if (productId) {
    console.log(`📦 Checking for product overrides for product ID: ${productId}`);
    const { data: overrideData, error: overrideError } = await supabase
      .from('products_options_overrides')
      .select('collection, item')
      .eq('products_id', productId);

    if (!overrideError && overrideData && overrideData.length > 0) {
      productOverrides = new Map<string, number[]>();
      overrideData.forEach((record) => {
        if (!record.collection || record.item === null || record.item === undefined) {
          return;
        }

        const collection = normalizeCollectionName(String(record.collection));
        const id = Number(record.item);

        if (Number.isNaN(id)) {
          return;
        }

        if (!productOverrides!.has(collection)) {
          productOverrides!.set(collection, []);
        }

        productOverrides!.get(collection)!.push(id);
      });
      console.log(`✅ Product overrides found for ${productOverrides.size} collections`);
    } else {
      console.log('ℹ️  No product overrides found');
    }
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

    if (!grouped.has(collection)) {
      grouped.set(collection, []);
    }

    grouped.get(collection)!.push(id);
  });

  // Apply product overrides: replace defaults for collections with overrides
  if (productOverrides) {
    productOverrides.forEach((overrideIds, collection) => {
      console.log(`🔄 Applying override for ${collection}: replacing defaults with ${overrideIds.length} items`);
      grouped.set(collection, overrideIds);
    });
  }

  await Promise.all(
    Array.from(grouped.entries()).map(async ([collection, ids]) => {
      if (ids.length === 0) return;

      const tableName = COLLECTION_TO_TABLE[collection];
      if (!tableName) {
        return;
      }

      const { data: tableRows, error: tableError} = await (supabase as any)
        .from(tableName)
        .select('*')
        .in('id', ids)
        .order('sort', { ascending: true });

      if (tableError) {
        console.warn(`Failed to load ${collection} options:`, tableError.message);
        return;
      }

      const field = COLLECTION_TO_FIELD[collection];
      if (!field) {
        return;
      }

      const normalizedRows = ((tableRows ?? []) as Record<string, any>[])
        .map((row) => normalizeOption(row));

      // Preserve database sort order from query (line 151)
      (options[field] as ProductOption[]) = normalizedRows;
    })
  );

  return options;
}
