import { supabase } from "./supabase";
import type { SkuSuggestion } from "@/store/types";

const DEFAULT_SUGGESTION_LIMIT = 8;

function escapeForIlike(term: string): string {
  return term.replace(/[\\%_]/g, (character) => `\\${character}`);
}

export async function getSkuSuggestions(
  query: string,
  limit = DEFAULT_SUGGESTION_LIMIT,
): Promise<SkuSuggestion[]> {
  const trimmed = query.trim();
  if (!trimmed) {
    return [];
  }

  const pattern = `${escapeForIlike(trimmed)}%`;

  const { data, error } = await supabase
    .from("products")
    .select("id, name, sku_code, product_line, active")
    .ilike("sku_code", pattern)
    .order("sku_code", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("Failed to fetch SKU suggestions from Supabase:", error);
    throw new Error(`Unable to fetch SKU suggestions: ${error.message}`);
  }

  return (data ?? [])
    .filter((row) => row && row.sku_code && row.active !== false)
    .map((row) => ({
      id: `suggestion-${row.id}`,
      productId: row.id,
      productSku: row.sku_code ?? "",
      productName: row.name ?? null,
      productLineId: row.product_line ?? null,
    }));
}
