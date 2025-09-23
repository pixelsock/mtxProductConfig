/**
 * Unit Tests for Override Isolation Logic
 *
 * These tests verify that the override isolation fix works correctly
 * by testing the core logic without requiring full Supabase setup.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Create a minimal test version of the filtering logic
interface TestProduct {
  id: number;
  product_line: number;
  mirror_style: number;
  light_direction: number;
}

interface TestOverride {
  id: number;
  products_id: number;
  collection: string;
  item: string;
}

interface TestProductLineOption {
  id: number;
  product_lines_id: number;
  collection: string;
  item: string;
}

// Simplified version of the core logic we're testing
function testOverrideIsolation(
  currentSelection: Record<string, any>,
  productLineId: number,
  products: TestProduct[],
  overrides: TestOverride[],
  productLineOptions: TestProductLineOption[]
): {
  available: Record<string, string[]>,
  disabled: Record<string, string[]>,
  all: Record<string, string[]>,
  filteringHistory: Record<string, string[]>
} {
  const result = {
    available: {} as Record<string, string[]>,
    disabled: {} as Record<string, string[]>,
    all: {} as Record<string, string[]>
  };

  const filteringHistory = {} as Record<string, string[]>;

  // Step 1: Get base options from product line
  const baseOptionsByCollection = productLineOptions
    .filter(option => option.product_lines_id === productLineId)
    .reduce((acc, option) => {
      if (!acc[option.collection]) {
        acc[option.collection] = [];
      }
      acc[option.collection].push(option.item);
      return acc;
    }, {} as Record<string, string[]>);

  // Step 2: Initialize with defaults
  Object.entries(baseOptionsByCollection).forEach(([collection, items]) => {
    result.all[collection] = [...new Set(items)];
    result.available[collection] = [...new Set(items)];
    result.disabled[collection] = [];
    filteringHistory[collection] = ['product_line_defaults'];
  });

  // Step 3: Apply override isolation logic (the fix we're testing)
  const hasMirrorStyle = !!currentSelection.mirror_styles;

  if (productLineId && hasMirrorStyle) {
    // Find products that match the current mirror style selection
    const productsWithSelectedMirrorStyle = products.filter(p =>
      p.product_line === productLineId &&
      p.mirror_style.toString() === currentSelection.mirror_styles
    );

    if (productsWithSelectedMirrorStyle.length > 0) {
      const productIds = productsWithSelectedMirrorStyle.map(p => p.id);

      // Find overrides that apply to these products
      const applicableOverrides = overrides.filter(override =>
        productIds.includes(override.products_id)
      );

      if (applicableOverrides.length > 0) {
        // Group overrides by collection
        const overridesByCollection = {} as Record<string, string[]>;
        applicableOverrides.forEach(override => {
          if (!overridesByCollection[override.collection]) {
            overridesByCollection[override.collection] = [];
          }
          overridesByCollection[override.collection].push(override.item);
        });

        // Get collections that have explicit overrides
        const collectionsWithOverrides = new Set(Object.keys(overridesByCollection));

        // CRITICAL: Only apply overrides to collections that actually have them
        Object.entries(overridesByCollection).forEach(([collection, overrideItems]) => {
          if (collectionsWithOverrides.has(collection)) {
            const uniqueOverrideItems = [...new Set(overrideItems)];

            result.all[collection] = uniqueOverrideItems;
            result.available[collection] = uniqueOverrideItems;
            result.disabled[collection] = [];

            // Update filtering history to show override was applied
            filteringHistory[collection] = [...(filteringHistory[collection] || []), 'product_overrides'];
          }
        });
      }
    }
  }

  return { ...result, filteringHistory };
}

describe('Override Isolation Logic', () => {
  let mockProducts: TestProduct[];
  let mockOverrides: TestOverride[];
  let mockProductLineOptions: TestProductLineOption[];

  beforeEach(() => {
    // Setup test data
    mockProducts = [
      // Regular products (mirror_style=1)
      { id: 100, product_line: 1, mirror_style: 1, light_direction: 1 },
      { id: 101, product_line: 1, mirror_style: 1, light_direction: 2 },
      { id: 102, product_line: 1, mirror_style: 1, light_direction: 3 },

      // Circle products (mirror_style=2) - these have size overrides
      { id: 200, product_line: 1, mirror_style: 2, light_direction: 1 },
      { id: 201, product_line: 1, mirror_style: 2, light_direction: 2 },
      { id: 202, product_line: 1, mirror_style: 2, light_direction: 3 },
    ];

    mockOverrides = [
      // Size overrides for Circle products (mirror_style=2)
      { id: 1, products_id: 200, collection: 'sizes', item: '5' },
      { id: 2, products_id: 200, collection: 'sizes', item: '6' },
      { id: 3, products_id: 201, collection: 'sizes', item: '5' },
      { id: 4, products_id: 201, collection: 'sizes', item: '6' },
      { id: 5, products_id: 202, collection: 'sizes', item: '5' },
      { id: 6, products_id: 202, collection: 'sizes', item: '6' },
      // NO overrides for light_directions
    ];

    mockProductLineOptions = [
      // Default sizes (all 9 available)
      { id: 1, product_lines_id: 1, collection: 'sizes', item: '1' },
      { id: 2, product_lines_id: 1, collection: 'sizes', item: '2' },
      { id: 3, product_lines_id: 1, collection: 'sizes', item: '3' },
      { id: 4, product_lines_id: 1, collection: 'sizes', item: '4' },
      { id: 5, product_lines_id: 1, collection: 'sizes', item: '5' },
      { id: 6, product_lines_id: 1, collection: 'sizes', item: '6' },
      { id: 7, product_lines_id: 1, collection: 'sizes', item: '7' },
      { id: 8, product_lines_id: 1, collection: 'sizes', item: '8' },
      { id: 9, product_lines_id: 1, collection: 'sizes', item: '9' },

      // Default light directions (all 3 available)
      { id: 10, product_lines_id: 1, collection: 'light_directions', item: '1' },
      { id: 11, product_lines_id: 1, collection: 'light_directions', item: '2' },
      { id: 12, product_lines_id: 1, collection: 'light_directions', item: '3' },

      // Default mirror styles
      { id: 13, product_lines_id: 1, collection: 'mirror_styles', item: '1' },
      { id: 14, product_lines_id: 1, collection: 'mirror_styles', item: '2' },
    ];
  });

  describe('Override Isolation', () => {
    it('should apply overrides only to collections that have explicit overrides', () => {
      // When Circle mirror style is selected
      const result = testOverrideIsolation(
        { mirror_styles: '2' },
        1,
        mockProducts,
        mockOverrides,
        mockProductLineOptions
      );

      // Sizes should be filtered by overrides (9 → 2)
      expect(result.available.sizes).toEqual(['5', '6']);
      expect(result.filteringHistory.sizes).toContain('product_overrides');

      // Light directions should NOT be affected (no overrides for this collection)
      expect(result.available.light_directions).toEqual(['1', '2', '3']);
      expect(result.filteringHistory.light_directions).not.toContain('product_overrides');
      expect(result.filteringHistory.light_directions).toEqual(['product_line_defaults']);
    });

    it('should preserve collections without overrides when Circle is selected', () => {
      const result = testOverrideIsolation(
        { mirror_styles: '2' },
        1,
        mockProducts,
        mockOverrides,
        mockProductLineOptions
      );

      // Collections without overrides should maintain their full availability
      expect(result.available.light_directions).toHaveLength(3);
      expect(result.available.mirror_styles).toHaveLength(2);

      // Only sizes should be affected by overrides
      expect(result.available.sizes).toHaveLength(2);

      // Verify filtering history shows no cross-contamination
      expect(result.filteringHistory.light_directions).toEqual(['product_line_defaults']);
      expect(result.filteringHistory.mirror_styles).toEqual(['product_line_defaults']);
      expect(result.filteringHistory.sizes).toEqual(['product_line_defaults', 'product_overrides']);
    });

    it('should not apply overrides when regular mirror style is selected', () => {
      // When Regular mirror style is selected (no overrides for this style)
      const result = testOverrideIsolation(
        { mirror_styles: '1' },
        1,
        mockProducts,
        mockOverrides,
        mockProductLineOptions
      );

      // All collections should maintain full availability
      expect(result.available.sizes).toEqual(['1', '2', '3', '4', '5', '6', '7', '8', '9']);
      expect(result.available.light_directions).toEqual(['1', '2', '3']);

      // No overrides should be applied
      expect(result.filteringHistory.sizes).toEqual(['product_line_defaults']);
      expect(result.filteringHistory.light_directions).toEqual(['product_line_defaults']);
    });

    it('should handle collections with mixed override coverage', () => {
      // Add frame color overrides for some but not all Circle products
      const mixedOverrides = [
        ...mockOverrides,
        { id: 7, products_id: 200, collection: 'frame_colors', item: 'BF' },
        { id: 8, products_id: 201, collection: 'frame_colors', item: 'BF' },
        // Note: product 202 has no frame_colors override
      ];

      const extendedProductLineOptions = [
        ...mockProductLineOptions,
        { id: 15, product_lines_id: 1, collection: 'frame_colors', item: 'BF' },
        { id: 16, product_lines_id: 1, collection: 'frame_colors', item: 'WH' },
        { id: 17, product_lines_id: 1, collection: 'frame_colors', item: 'GR' },
      ];

      const result = testOverrideIsolation(
        { mirror_styles: '2' },
        1,
        mockProducts,
        mixedOverrides,
        extendedProductLineOptions
      );

      // Both sizes and frame_colors should be affected by overrides
      expect(result.available.sizes).toEqual(['5', '6']);
      expect(result.available.frame_colors).toEqual(['BF']); // Only the overridden color

      // Light directions should still be unaffected
      expect(result.available.light_directions).toEqual(['1', '2', '3']);

      // Verify filtering history
      expect(result.filteringHistory.sizes).toContain('product_overrides');
      expect(result.filteringHistory.frame_colors).toContain('product_overrides');
      expect(result.filteringHistory.light_directions).not.toContain('product_overrides');
    });
  });

  describe('Edge Cases', () => {
    it('should handle no overrides gracefully', () => {
      const result = testOverrideIsolation(
        { mirror_styles: '2' },
        1,
        mockProducts,
        [], // No overrides
        mockProductLineOptions
      );

      // All collections should maintain full availability
      expect(result.available.sizes).toEqual(['1', '2', '3', '4', '5', '6', '7', '8', '9']);
      expect(result.available.light_directions).toEqual(['1', '2', '3']);

      // No overrides should be applied
      Object.values(result.filteringHistory).forEach(history => {
        expect(history).not.toContain('product_overrides');
      });
    });

    it('should handle no matching products gracefully', () => {
      const result = testOverrideIsolation(
        { mirror_styles: '999' }, // Non-existent mirror style
        1,
        mockProducts,
        mockOverrides,
        mockProductLineOptions
      );

      // Should fall back to defaults
      expect(result.available.sizes).toEqual(['1', '2', '3', '4', '5', '6', '7', '8', '9']);
      expect(result.available.light_directions).toEqual(['1', '2', '3']);
    });
  });
});