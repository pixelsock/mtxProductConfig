import { supabase } from "./supabase";
import {
  fetchSkuCodeOrder,
  findConfigFieldForTable,
  TABLE_TO_OPTIONS_FIELD,
  type SkuCodeOrderItem,
} from "./sku-generator";
import { fetchProductOptions } from "./product-options";
import type {
  ProductConfig,
  ProductOption,
  ProductOptions,
  SkuParseResponse,
  SkuSearchOptions,
  SkuSearchResult,
  SkuSegmentMatch,
  SkuSegmentOption,
  SkuSearchConfidence,
  SkuSegmentStatus,
} from "@/store/types";

const DEFAULT_RESULT_LIMIT = 10;

interface ProductRow {
  id: number;
  name: string | null;
  sku_code: string | null;
  product_line: number | null;
  frame_thickness: unknown;
  mirror_style: number | null;
  light_direction: number | null;
}

interface InternalSegmentOption extends SkuSegmentOption {
  raw: ProductOption;
}

const productOptionsCache = new Map<string, ProductOptions>();

function makeProductOptionsCacheKey(
  productLineId: number,
  productId?: number | null,
): string {
  return `${productLineId}:${productId ?? "*"}`;
}

async function getProductOptionsForProduct(
  productLineId: number | null,
  productId?: number | null,
): Promise<ProductOptions | null> {
  if (productLineId === null || productLineId === undefined) {
    return null;
  }

  const cacheKey = makeProductOptionsCacheKey(productLineId, productId ?? null);
  if (productOptionsCache.has(cacheKey)) {
    return productOptionsCache.get(cacheKey)!;
  }

  const options = await fetchProductOptions(
    productLineId,
    productId ?? undefined,
  );
  productOptionsCache.set(cacheKey, options);
  return options;
}

function mapOptionsToInternal(
  options: ProductOption[] | undefined | null,
): InternalSegmentOption[] {
  if (!options || options.length === 0) {
    return [];
  }

  return options.map((option) => ({
    id: String(option.id),
    name: option.name ?? option.sku_code ?? null,
    skuCode: option.sku_code ?? "",
    raw: option,
  }));
}

function getAvailableOptionsForTable(
  productOptions: ProductOptions | null,
  tableName: string,
): InternalSegmentOption[] {
  if (!productOptions) {
    return [];
  }

  const field = TABLE_TO_OPTIONS_FIELD[tableName];
  if (!field) {
    return [];
  }

  const options = productOptions[field];
  return mapOptionsToInternal(options as ProductOption[]);
}

function normalizeSegment(segment: string | null | undefined): string | null {
  if (segment === undefined || segment === null) {
    return null;
  }

  const trimmed = segment.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function splitSkuInput(input: string): string[] {
  if (!input) {
    return [];
  }

  return input.split("-").map((segment) => segment.trim());
}

export function computeConfidence(
  matches: SkuSegmentMatch[],
): SkuSearchConfidence {
  if (matches.some((match) => match.status === "not_found")) {
    return "invalid";
  }

  if (matches.some((match) => match.status === "ambiguous")) {
    return "ambiguous";
  }

  if (
    matches.some(
      (match) => match.status === "partial" || match.status === "missing",
    )
  ) {
    return "partial";
  }

  return "exact";
}

function extractFrameThicknessId(frameValue: unknown): number | null {
  if (frameValue === null || frameValue === undefined) {
    return null;
  }

  if (typeof frameValue === "number") {
    return frameValue;
  }

  if (typeof frameValue === "object") {
    const candidate = frameValue as Record<string, unknown>;
    const key = candidate.key;
    if (typeof key === "number") {
      return key;
    }
    if (typeof key === "string") {
      const parsed = Number.parseInt(key, 10);
      return Number.isNaN(parsed) ? null : parsed;
    }
  }

  return null;
}

function buildBaseConfiguration(product: ProductRow): Partial<ProductConfig> {
  const config: Partial<ProductConfig> = {};

  if (product.product_line !== null && product.product_line !== undefined) {
    config.productLineId = product.product_line;
  }

  if (product.mirror_style !== null && product.mirror_style !== undefined) {
    config.mirrorStyle = String(product.mirror_style);
  }

  if (
    product.light_direction !== null &&
    product.light_direction !== undefined
  ) {
    config.lighting = String(product.light_direction);
  }

  const frameThicknessId = extractFrameThicknessId(product.frame_thickness);
  if (frameThicknessId !== null) {
    config.frameThickness = String(frameThicknessId);
  }

  return config;
}

async function fetchProductMatches(
  segment: string,
  limit: number,
  options?: SkuSearchOptions,
): Promise<ProductRow[]> {
  const query = supabase
    .from("products")
    .select(
      "id, name, sku_code, product_line, frame_thickness, mirror_style, light_direction",
    )
    .ilike("sku_code", `${segment}%`)
    .limit(limit);

  if (options?.productLineId !== undefined) {
    query.eq("product_line", options.productLineId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to search products for SKU segment:", error);
    throw new Error(`Failed to match product segment: ${error.message}`);
  }

  return (data ?? [])
    .filter((row) => row && row.sku_code)
    .map((row) => ({
      id: row.id as number,
      name: (row.name ?? null) as string | null,
      sku_code: (row.sku_code ?? null) as string | null,
      product_line: (row.product_line ?? null) as number | null,
      frame_thickness: row.frame_thickness as unknown,
      mirror_style: (row.mirror_style ?? null) as number | null,
      light_direction: (row.light_direction ?? null) as number | null,
    }));
}

function applyOptionToConfiguration(
  config: Partial<ProductConfig>,
  tableName: string,
  option: InternalSegmentOption,
): void {
  if (tableName === "sizes") {
    const width = option.raw.width;
    const height = option.raw.height;

    if (width !== undefined && width !== null) {
      config.width = String(width);
    }

    if (height !== undefined && height !== null) {
      config.height = String(height);
    }

    return;
  }

  const field = findConfigFieldForTable(tableName);
  if (!field) {
    return;
  }

  (config as Record<string, unknown>)[field] = option.id;
}

function buildSegmentMatch(
  orderItem: SkuCodeOrderItem,
  segment: string | null,
  status: SkuSegmentStatus,
  options: InternalSegmentOption[],
  message?: string,
): SkuSegmentMatch {
  const field =
    orderItem.order === 0
      ? "productBase"
      : findConfigFieldForTable(orderItem.sku_code_item || "");

  return {
    order: orderItem.order ?? 0,
    tableName: orderItem.sku_code_item || "products",
    field: field ?? undefined,
    segment,
    status,
    options: options.map((option) => ({
      id: option.id,
      name: option.name,
      skuCode: option.skuCode,
    })),
    message,
  };
}

function describeTable(tableName: string): string {
  return tableName.replace(/_/g, " ");
}

export async function parseSkuToConfiguration(
  query: string,
  options?: SkuSearchOptions,
): Promise<SkuParseResponse> {
  const trimmed = query.trim();
  const response: SkuParseResponse = {
    query: trimmed,
    segments: [],
    results: [],
    warnings: [],
    errors: [],
  };

  if (!trimmed) {
    return response;
  }

  const segments = splitSkuInput(trimmed);
  response.segments = segments;

  const skuOrder = await fetchSkuCodeOrder();
  if (!skuOrder.length) {
    response.errors.push("SKU code order data is empty.");
    return response;
  }

  const baseSegment = normalizeSegment(segments[0]);
  if (!baseSegment) {
    response.errors.push("SKU must include a product base segment.");
    return response;
  }

  const baseOrderItem = skuOrder.find((item) => item.order === 0) ?? {
    id: "products",
    order: 0,
    sku_code_item: "products",
  };

  const limit = options?.limit ?? DEFAULT_RESULT_LIMIT;
  const productMatches = await fetchProductMatches(baseSegment, limit, options);

  if (productMatches.length === 0) {
    response.errors.push(
      `No products found matching base segment "${baseSegment}".`,
    );
    return response;
  }

  const normalizedBase = baseSegment.toLowerCase();
  const exactBaseMatches = productMatches.filter(
    (product) => (product.sku_code ?? "").toLowerCase() === normalizedBase,
  );

  if (productMatches.length >= limit) {
    response.warnings.push(
      `Search returned ${productMatches.length} products. Results truncated to ${limit}.`,
    );
  }

  const baseStatus: SkuSegmentStatus = (() => {
    if (exactBaseMatches.length === 1 && productMatches.length === 1) {
      return "exact";
    }

    if (exactBaseMatches.length === 1 && productMatches.length > 1) {
      return "exact";
    }

    if (exactBaseMatches.length > 1) {
      return "ambiguous";
    }

    if (productMatches.length === 1) {
      return "partial";
    }

    return "ambiguous";
  })();

  const baseOptions: InternalSegmentOption[] = productMatches.map(
    (product) => ({
      id: String(product.id),
      name: product.name ?? product.sku_code ?? null,
      skuCode: product.sku_code ?? "",
      raw: {
        id: product.id,
        name: product.name ?? product.sku_code ?? "",
        sku_code: product.sku_code ?? "",
      },
    }),
  );

  const productCandidates = (
    exactBaseMatches.length > 0 ? exactBaseMatches : productMatches
  ).map((product) => ({
    product,
    segments: [
      buildSegmentMatch(
        baseOrderItem,
        baseSegment,
        baseStatus,
        baseOptions,
        baseStatus === "partial"
          ? "Product base matched partially; additional characters recommended."
          : baseStatus === "ambiguous"
            ? "Multiple products match this base code."
            : undefined,
      ),
    ] as SkuSegmentMatch[],
    config: buildBaseConfiguration(product),
    issues:
      baseStatus === "ambiguous"
        ? [`Multiple products match base code "${baseSegment}".`]
        : [],
  }));

  for (const candidate of productCandidates) {
    const productOptions = await getProductOptionsForProduct(
      candidate.product.product_line,
      candidate.product.id,
    );
    let segmentIndex = 1; // base consumed
    let noMoreSegments = false;

    for (const orderItem of skuOrder) {
      if (orderItem.order === 0) {
        continue;
      }

      const tableName = orderItem.sku_code_item || "";

      if (tableName === "frame_thicknesses") {
        candidate.segments.push(
          buildSegmentMatch(
            orderItem,
            null,
            "skipped",
            [],
            "Frame thickness encoded in product base segment.",
          ),
        );
        continue;
      }

      if (noMoreSegments) {
        candidate.segments.push(
          buildSegmentMatch(
            orderItem,
            null,
            "missing",
            [],
            "Segment not provided in SKU input.",
          ),
        );
        continue;
      }

      const rawSegment = segments[segmentIndex];
      if (rawSegment === undefined) {
        candidate.segments.push(
          buildSegmentMatch(
            orderItem,
            null,
            "missing",
            [],
            "Segment not provided in SKU input.",
          ),
        );
        noMoreSegments = true;
        continue;
      }

      const normalized = normalizeSegment(rawSegment);
      if (!normalized) {
        candidate.segments.push(
          buildSegmentMatch(
            orderItem,
            null,
            "missing",
            [],
            "Segment was empty; unable to map to data.",
          ),
        );
        noMoreSegments = true;
        segmentIndex += 1;
        continue;
      }

      const availableOptions = getAvailableOptionsForTable(
        productOptions,
        tableName,
      );

      if (!availableOptions.length) {
        candidate.segments.push(
          buildSegmentMatch(
            orderItem,
            null,
            "skipped",
            [],
            "Segment not available for this product line.",
          ),
        );
        continue;
      }

      const lowerNormalized = normalized.toLowerCase();
      const optionsForSegment = availableOptions.filter((option) =>
        option.skuCode.toLowerCase().startsWith(lowerNormalized),
      );
      const exactMatches = optionsForSegment.filter(
        (option) => option.skuCode.toLowerCase() === lowerNormalized,
      );

      let status: SkuSegmentStatus;
      let message: string | undefined;
      let selected: InternalSegmentOption | null = null;

      if (optionsForSegment.length === 0) {
        status = "not_found";
        message = `No ${describeTable(tableName)} option matches "${normalized}".`;
        candidate.issues.push(message);
      } else if (exactMatches.length === 1) {
        status = "exact";
        selected = exactMatches[0];
      } else if (exactMatches.length > 1) {
        status = "ambiguous";
        message = `Multiple ${describeTable(tableName)} options share code "${normalized}".`;
        candidate.issues.push(message);
      } else if (optionsForSegment.length === 1) {
        status = "partial";
        selected = optionsForSegment[0];
        message = "Segment matched partially; full SKU code recommended.";
      } else {
        status = "ambiguous";
        message = `Multiple ${describeTable(tableName)} options start with "${normalized}".`;
        candidate.issues.push(message);
      }

      candidate.segments.push(
        buildSegmentMatch(
          orderItem,
          normalized,
          status,
          optionsForSegment,
          message,
        ),
      );

      if (status === "exact" && selected) {
        applyOptionToConfiguration(candidate.config, tableName, selected);
      }

      segmentIndex += 1;
    }

    if (segmentIndex < segments.length) {
      candidate.issues.push("Input contains more segments than expected.");
    }

    const confidence = computeConfidence(candidate.segments);

    const result: SkuSearchResult = {
      id: `product-${candidate.product.id}`,
      productId: candidate.product.id,
      productLineId: candidate.product.product_line,
      productSku: candidate.product.sku_code ?? undefined,
      productName: candidate.product.name ?? undefined,
      configuration: candidate.config,
      segments: candidate.segments,
      issues: candidate.issues,
      confidence,
    };

    response.results.push(result);
  }

  return response;
}
