import { supabase } from "./supabase";
import type { ProductConfig, ProductOptions, DecoProduct } from "@/store/types";

export interface SkuCodeOrderItem {
  id: string;
  order: number;
  sku_code_item: string;
}

// Mapping from ProductConfig fields to database table names
export const CONFIG_FIELD_TO_TABLE: Record<string, string> = {
  frameColor: "frame_colors",
  frameThickness: "frame_thicknesses",
  mirrorStyle: "mirror_styles",
  mounting: "mounting_options",
  hangingTechnique: "hanging_techniques",
  lighting: "light_directions",
  colorTemperature: "color_temperatures",
  lightOutput: "light_outputs",
  driver: "drivers",
  accessories: "accessories",
};

// Mapping from database table names to ProductOptions fields
export const TABLE_TO_OPTIONS_FIELD: Record<string, keyof ProductOptions> = {
  frame_colors: "frameColors",
  frame_thicknesses: "frameThickness",
  mirror_styles: "mirrorStyles",
  mounting_options: "mountingOptions",
  hanging_techniques: "hangingTechniques",
  light_directions: "lightingOptions",
  color_temperatures: "colorTemperatures",
  light_outputs: "lightOutputs",
  drivers: "drivers",
  accessories: "accessoryOptions",
  sizes: "sizes",
};

// Cache for sku_code_order data
let skuOrderCache: SkuCodeOrderItem[] | null = null;
let skuOrderCacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch the SKU code order from the database
 */
export async function fetchSkuCodeOrder(): Promise<SkuCodeOrderItem[]> {
  const now = Date.now();

  // Return cached data if still valid
  if (skuOrderCache && now - skuOrderCacheTimestamp < CACHE_DURATION) {
    return skuOrderCache;
  }

  const { data, error } = await supabase
    .from("sku_code_order")
    .select("id, order, sku_code_item")
    .order("order", { ascending: true });

  if (error) {
    console.error("Failed to fetch sku_code_order:", error);
    throw new Error(`Failed to fetch SKU code order: ${error.message}`);
  }

  const items: SkuCodeOrderItem[] = (data ?? []).map((row) => ({
    id: row.id,
    order: row.order ?? 0,
    sku_code_item: row.sku_code_item ?? "",
  }));

  // Update cache
  skuOrderCache = items;
  skuOrderCacheTimestamp = now;

  return items;
}

/**
 * Find the matching ProductConfig field for a given database table name
 */
export function findConfigFieldForTable(
  tableName: string,
): keyof ProductConfig | null {
  // Reverse lookup: find the config field that maps to this table
  for (const [configField, table] of Object.entries(CONFIG_FIELD_TO_TABLE)) {
    if (table === tableName) {
      return configField as keyof ProductConfig;
    }
  }

  // Special case for sizes - handled differently since it's computed from width/height
  if (tableName === "sizes") {
    return "width"; // Marker to handle size specially
  }

  return null;
}

/**
 * Get the SKU code for a selected option
 */
function getOptionSkuCode(
  tableName: string,
  selectedId: string,
  productOptions: ProductOptions,
  config: ProductConfig,
): string | null {
  // Special handling for sizes
  if (tableName === "sizes") {
    // Find size option that matches current width and height
    const matchingSize = productOptions.sizes.find((size) => {
      return (
        size.width?.toString() === config.width &&
        size.height?.toString() === config.height
      );
    });
    return matchingSize?.sku_code ?? null;
  }

  // Get the appropriate options array
  const optionsField = TABLE_TO_OPTIONS_FIELD[tableName];
  if (!optionsField) {
    console.warn(`No options field mapping for table: ${tableName}`);
    return null;
  }

  const options = productOptions[optionsField];
  if (!options || !Array.isArray(options)) {
    console.warn(
      `Options not found or not an array for field: ${optionsField}`,
    );
    return null;
  }

  // Find the option with matching ID
  const option = options.find((opt) => opt.id.toString() === selectedId);
  return option?.sku_code ?? null;
}

/**
 * Generate SKU code from current configuration
 *
 * Follows CLAUDE.md contract:
 * 1. Start with product.sku_code
 * 2. For each sku_code_order entry (ascending), append option sku_code
 * 3. Skip frame_thicknesses (already encoded in product base)
 * 4. Separate segments with "-"
 */
export async function generateSku(
  product: DecoProduct,
  config: ProductConfig,
  productOptions: ProductOptions,
): Promise<string> {
  if (!product || !config || !productOptions) {
    throw new Error("Missing required parameters for SKU generation");
  }

  // Start with product base SKU code
  let sku = product.sku_code || "";

  if (!sku) {
    console.warn("Product missing sku_code, SKU generation incomplete");
    return "";
  }

  try {
    // Fetch the SKU code order
    const skuOrder = await fetchSkuCodeOrder();

    if (import.meta.env.DEV) {
      console.log("🏷️ Starting SKU generation with base:", sku);
      console.log("📋 SKU order items:", skuOrder);
    }

    // Process each item in order (skip order:0 which is the product itself)
    for (const orderItem of skuOrder) {
      if (orderItem.order === 0) {
        continue; // Skip products entry
      }

      const tableName = orderItem.sku_code_item;
      if (!tableName) continue;

      // IMPORTANT: Skip frame_thicknesses as documented in CLAUDE.md
      if (tableName === "frame_thicknesses") {
        if (import.meta.env.DEV) {
          console.log(
            `⏭️  Skipping ${tableName} (encoded in product base SKU)`,
          );
        }
        continue;
      }

      // Find corresponding config field
      const configField = findConfigFieldForTable(tableName);
      if (!configField) {
        if (import.meta.env.DEV) {
          console.warn(`⚠️  No config field mapping for table: ${tableName}`);
        }
        continue;
      }

      // Get the selected ID from config
      const selectedId = config[configField];
      if (!selectedId || selectedId === "") {
        if (import.meta.env.DEV) {
          console.log(`⏭️  Skipping ${tableName}: no selection`);
        }
        continue;
      }

      // Get the SKU code for this option
      const optionSkuCode = getOptionSkuCode(
        tableName,
        String(selectedId),
        productOptions,
        config,
      );

      if (optionSkuCode) {
        sku += `-${optionSkuCode}`;
        if (import.meta.env.DEV) {
          console.log(`✅ Added ${tableName}: ${optionSkuCode} → ${sku}`);
        }
      } else {
        if (import.meta.env.DEV) {
          console.warn(
            `⚠️  No SKU code found for ${tableName} ID: ${selectedId}`,
          );
        }
      }
    }

    if (import.meta.env.DEV) {
      console.log("🏷️ Final SKU:", sku);
    }

    return sku;
  } catch (error) {
    console.error("Error generating SKU:", error);
    // Return at least the base product SKU if generation fails
    return sku;
  }
}

/**
 * Parse a SKU string into individual segments
 * Useful for displaying SKU with visual separation
 */
export function parseSkuSegments(sku: string): string[] {
  if (!sku) return [];
  return sku.split("-").filter((segment) => segment.length > 0);
}

/**
 * Clear the SKU code order cache
 * Useful for testing or after data updates
 */
export function clearSkuOrderCache(): void {
  skuOrderCache = null;
  skuOrderCacheTimestamp = 0;
}
