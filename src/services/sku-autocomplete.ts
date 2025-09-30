import type {
  ProductOptions,
  ProductOption,
  SkuSuggestion,
} from "@/store/types";
import type { SkuCodeOrderItem } from "./sku-generator";
import { fetchSkuCodeOrder, TABLE_TO_OPTIONS_FIELD } from "./sku-generator";
import { fetchProductOptions } from "./product-options";
import { getSkuSuggestions } from "./sku-suggestions";

const MAX_SEGMENT_SUGGESTIONS = 20;

interface ProductOptionsCacheKey {
  productLineId: number;
  productId?: number;
}

function createCacheKey(key: ProductOptionsCacheKey): string {
  return `${key.productLineId}:${key.productId ?? "*"}`;
}

const productOptionsCache = new Map<string, ProductOptions>();

async function loadProductOptions(
  productLineId: number,
  productId?: number,
): Promise<ProductOptions> {
  const cacheKey = createCacheKey({ productLineId, productId });
  if (productOptionsCache.has(cacheKey)) {
    return productOptionsCache.get(cacheKey)!;
  }

  const options = await fetchProductOptions(productLineId, productId);
  productOptionsCache.set(cacheKey, options);
  return options;
}

export interface BaseSkuSuggestion extends SkuSuggestion {}

export interface SkuAutocompleteContext {
  base: BaseSkuSuggestion;
  segmentOrder: SkuCodeOrderItem[];
  productOptions: ProductOptions;
}

export interface SegmentSuggestion {
  id: string;
  skuCode: string;
  label: string;
  description?: string | null;
  tableName: string;
  order: number;
}

export async function fetchBaseSkuSuggestions(
  query: string,
  limit?: number,
): Promise<BaseSkuSuggestion[]> {
  return getSkuSuggestions(query, limit);
}

export async function createSkuAutocompleteContext(
  base: BaseSkuSuggestion,
): Promise<SkuAutocompleteContext> {
  if (base.productLineId === null || base.productLineId === undefined) {
    throw new Error("Selected product is missing a product line association.");
  }

  const [skuOrder, productOptions] = await Promise.all([
    fetchSkuCodeOrder(),
    loadProductOptions(base.productLineId, base.productId),
  ]);

  const segmentOrder = skuOrder
    .filter((item) => item.order !== 0)
    .filter(
      (item) =>
        item.sku_code_item && item.sku_code_item !== "frame_thicknesses",
    )
    .filter((item) => {
      const tableName = item.sku_code_item ?? "";
      const field = TABLE_TO_OPTIONS_FIELD[tableName];
      if (!field) {
        return true;
      }
      const options = productOptions[field];
      return Array.isArray(options) && options.length > 0;
    });

  return {
    base,
    segmentOrder,
    productOptions,
  };
}

export function getSegmentOrderItem(
  context: SkuAutocompleteContext | null,
  segmentIndex: number,
): SkuCodeOrderItem | null {
  if (!context) return null;
  return context.segmentOrder[segmentIndex] ?? null;
}

function getOptionsForTable(
  productOptions: ProductOptions,
  tableName: string,
): ProductOption[] | null {
  const field = TABLE_TO_OPTIONS_FIELD[tableName];
  if (!field) {
    return null;
  }

  const options = productOptions[field];
  if (!options || !Array.isArray(options) || options.length === 0) {
    return null;
  }

  return options;
}

function buildLabel(tableName: string, option: ProductOption): string {
  const skuCode = option.sku_code ?? String(option.id);

  if (tableName === "sizes") {
    const width = option.width ? `${option.width}\"` : null;
    const height = option.height ? `${option.height}\"` : null;
    if (width && height) {
      return `${skuCode} · ${width} × ${height}`;
    }
  }

  return skuCode;
}

function buildDescription(
  tableName: string,
  option: ProductOption,
): string | null {
  if (tableName === "sizes") {
    const width = option.width ? `${option.width}\"` : null;
    const height = option.height ? `${option.height}\"` : null;
    if (width && height) {
      return `${width} × ${height}`;
    }
  }

  if (option.name && option.name !== option.sku_code) {
    return option.name;
  }

  return option.description ?? null;
}

export function getSegmentSuggestionsForContext(
  context: SkuAutocompleteContext,
  segmentIndex: number,
  query: string,
  limit = MAX_SEGMENT_SUGGESTIONS,
): SegmentSuggestion[] {
  const orderItem = context.segmentOrder[segmentIndex];
  if (!orderItem || !orderItem.sku_code_item) {
    return [];
  }

  const tableName = orderItem.sku_code_item;
  const options = getOptionsForTable(context.productOptions, tableName);
  if (!options) {
    return [];
  }

  const normalized = query.trim().toLowerCase();

  return options
    .filter((option) => {
      const code = option.sku_code ?? "";
      if (!code) return false;
      if (!normalized) return true;
      return code.toLowerCase().startsWith(normalized);
    })
    .slice(0, limit)
    .map((option) => ({
      id: `${tableName}-${option.id}`,
      skuCode: option.sku_code ?? String(option.id),
      label: buildLabel(tableName, option),
      description: buildDescription(tableName, option),
      tableName,
      order: orderItem.order ?? segmentIndex + 1,
    }));
}

export function resetProductOptionsCache(): void {
  productOptionsCache.clear();
}
