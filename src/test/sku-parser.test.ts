import { describe, it, expect, vi } from "vitest";

vi.mock("@/services/supabase", () => ({
  supabase: {
    from: () => ({
      select: () => ({
        ilike: () => ({
          limit: () => Promise.resolve({ data: [], error: null }),
        }),
      }),
    }),
  },
}));

vi.mock("@/services/sku-generator", () => ({
  fetchSkuCodeOrder: vi.fn(async () => []),
  findConfigFieldForTable: vi.fn(() => null),
}));

const { splitSkuInput, computeConfidence } = await import("@/services/sku-parser");
import type { SkuSegmentMatch, SkuSegmentStatus } from "@/store/types";

function createSegment(status: SkuSegmentStatus): SkuSegmentMatch {
  return {
    order: 0,
    tableName: "products",
    status,
    segment: null,
    options: [],
  };
}

describe("SKU parser helpers", () => {
  it("splits SKU input by hyphen and trims whitespace", () => {
    expect(splitSkuInput("T23i-2436-S-27")).toEqual(["T23i", "2436", "S", "27"]);
    expect(splitSkuInput(" T23i -2436 - S ")).toEqual(["T23i", "2436", "S"]);
    expect(splitSkuInput("T23i-2436-")).toEqual(["T23i", "2436", ""]);
  });

  it("computes confidence across mixed segment statuses", () => {
    expect(computeConfidence([createSegment("exact"), createSegment("exact")])).toBe("exact");
    expect(
      computeConfidence([createSegment("exact"), createSegment("partial")])
    ).toBe("partial");
    expect(
      computeConfidence([createSegment("exact"), createSegment("ambiguous")])
    ).toBe("ambiguous");
    expect(
      computeConfidence([createSegment("exact"), createSegment("not_found")])
    ).toBe("invalid");
  });
});
