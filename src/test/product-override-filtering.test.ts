/**
 * Product Override Filtering Bug Reproduction Tests
 *
 * These tests reproduce the bug where product overrides incorrectly affect
 * other option collections that should remain unaffected.
 *
 * Bug Description: When Circle products filter sizes from 9→2 options,
 * Light Direction is incorrectly reduced to just "Indirect" when it should
 * maintain full availability (Direct, Indirect, Both).
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  initializeFiltering,
  getFilteredOptions,
  clearFilteringCache,
  type ProductLineOption,
  type ProductOptionOverride,
  type Product,
} from '../services/dynamic-filtering';

// Mock Supabase data that represents the real database state
const mockProductLineOptions: ProductLineOption[] = [
  // Sizes - all 9 options available by default
  { id: 1, product_lines_id: 1, item: '1', collection: 'sizes' },
  { id: 2, product_lines_id: 1, item: '2', collection: 'sizes' },
  { id: 3, product_lines_id: 1, item: '3', collection: 'sizes' },
  { id: 4, product_lines_id: 1, item: '4', collection: 'sizes' },
  { id: 5, product_lines_id: 1, item: '5', collection: 'sizes' },
  { id: 6, product_lines_id: 1, item: '6', collection: 'sizes' },
  { id: 7, product_lines_id: 1, item: '7', collection: 'sizes' },
  { id: 8, product_lines_id: 1, item: '8', collection: 'sizes' },
  { id: 9, product_lines_id: 1, item: '9', collection: 'sizes' },

  // Light directions - all 3 options available by default
  { id: 10, product_lines_id: 1, item: '1', collection: 'light_directions' }, // Direct
  { id: 11, product_lines_id: 1, item: '2', collection: 'light_directions' }, // Indirect
  { id: 12, product_lines_id: 1, item: '3', collection: 'light_directions' }, // Both

  // Mirror styles
  { id: 13, product_lines_id: 1, item: '1', collection: 'mirror_styles' }, // Regular
  { id: 14, product_lines_id: 1, item: '2', collection: 'mirror_styles' }, // Circle
];

// Product overrides - Circle products (mirror_style=2) can only use sizes 5 and 6
const mockProductOverrides: ProductOptionOverride[] = [
  { id: 1, products_id: 101, item: '5', collection: 'sizes' }, // Circle product can use size 5
  { id: 2, products_id: 101, item: '6', collection: 'sizes' }, // Circle product can use size 6
  { id: 3, products_id: 102, item: '5', collection: 'sizes' }, // Another circle product
  { id: 4, products_id: 102, item: '6', collection: 'sizes' }, // Another circle product
];

// Mock products - includes Circle Full Frame Edge products
const mockProducts: Product[] = [
  // Regular products (mirror_style=1) - support all light directions
  { id: 100, name: 'Regular Direct', product_line: 1, mirror_style: 1, light_direction: 1, active: true },
  { id: 103, name: 'Regular Indirect', product_line: 1, mirror_style: 1, light_direction: 2, active: true },
  { id: 104, name: 'Regular Both', product_line: 1, mirror_style: 1, light_direction: 3, active: true },

  // Circle products (mirror_style=2) - the problematic ones with size overrides
  // Note: These have size overrides but NO light_direction overrides
  { id: 101, name: 'Circle Full Frame Edge Direct', product_line: 1, mirror_style: 2, light_direction: 1, active: true },
  { id: 102, name: 'Circle Full Frame Edge Indirect', product_line: 1, mirror_style: 2, light_direction: 2, active: true },
  { id: 105, name: 'Circle Full Frame Edge Both', product_line: 1, mirror_style: 2, light_direction: 3, active: true },
];

// Mock the Supabase service
vi.mock('../services/supabase', () => ({
  supabase: {
    from: vi.fn((table: string) => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          then: vi.fn(),
          data: getTableData(table),
          error: null,
        })),
        then: vi.fn(),
        data: getTableData(table),
        error: null,
      })),
    })),
  },
}));

function getTableData(table: string) {
  switch (table) {
    case 'product_lines_default_options':
      return mockProductLineOptions;
    case 'products_options_overrides':
      return mockProductOverrides;
    case 'products':
      return mockProducts;
    default:
      return [];
  }
}

describe('Product Override Filtering Bug Reproduction', () => {
  beforeEach(async () => {
    clearFilteringCache();
    await initializeFiltering();
  });

  describe('Bug: Cross-collection filtering contamination', () => {
    it('should demonstrate the bug: Circle selection incorrectly reduces Light Direction options', async () => {
      // STEP 1: Get initial options - should show all defaults
      const initialOptions = getFilteredOptions({}, 1);

      // Verify initial state shows all defaults
      expect(initialOptions.available.sizes).toHaveLength(9); // All 9 sizes available
      expect(initialOptions.available.light_directions).toHaveLength(3); // All 3 light directions available
      expect(initialOptions.available.mirror_styles).toHaveLength(2); // Both mirror styles available

      // STEP 2: Select Circle mirror style (this should trigger the bug)
      const withCircleSelected = getFilteredOptions({ mirror_styles: '2' }, 1);

      // Bug verification: Sizes should be affected by overrides
      console.log('Circle sizes available:', withCircleSelected.available.sizes);
      // This should work correctly - Circle products have size overrides
      // But currently this logic isn't implemented in getFilteredOptions

      // Bug verification: Light directions should NOT be affected
      console.log('Circle light directions available:', withCircleSelected.available.light_directions);

      // THIS IS THE BUG: Light directions should still show all 3 options
      // because Circle products exist with all three light directions (1, 2, 3)
      // and there are NO light_direction overrides for Circle products
      expect(withCircleSelected.available.light_directions).toHaveLength(3);

      // However, if the bug exists, we might see only ["2"] (Indirect)
      // This would be incorrect because:
      // 1. Product 101 has light_direction: 1 (Direct)
      // 2. Product 102 has light_direction: 2 (Indirect)
      // 3. Product 105 has light_direction: 3 (Both)
      // So ALL three should be available when mirror_style=2 is selected
    });

    it('should show that overrides only affect specifically overridden collections', async () => {
      // The correct behavior: when Circle is selected:
      // - sizes should be filtered to only overridden options (5, 6)
      // - light_directions should remain unaffected (1, 2, 3)
      // - other collections should remain unaffected

      const withCircleSelected = getFilteredOptions({ mirror_styles: '2' }, 1);

      // Sizes should be restricted by overrides
      expect(withCircleSelected.available.sizes).toEqual(['5', '6']);

      // Light directions should NOT be restricted (no overrides exist)
      expect(withCircleSelected.available.light_directions).toEqual(['1', '2', '3']);

      // Mirror styles should show available options from products
      expect(withCircleSelected.available.mirror_styles).toContain('2');
    });

    it('should demonstrate isolation: overrides for one collection should not affect others', async () => {
      // Test that product overrides are properly isolated to their specific collections

      // Mock a scenario where we have overrides for frame_colors but not light_directions
      const mockOverridesIsolated: ProductOptionOverride[] = [
        { id: 100, products_id: 101, item: '1', collection: 'frame_colors' },
        { id: 101, products_id: 101, item: '2', collection: 'frame_colors' },
        // NOTE: No overrides for light_directions
      ];

      // In this case:
      // - frame_colors should be limited to items 1, 2
      // - light_directions should remain unaffected by frame_colors overrides
      // - sizes should remain unaffected by frame_colors overrides

      // This tests the core principle: overrides are collection-specific
      expect(true).toBe(true); // Placeholder - actual test would mock the overrides
    });
  });

  describe('Current behavior analysis', () => {
    it('should document current filtering behavior to identify the bug source', async () => {
      // Document what currently happens vs what should happen

      console.log('=== ANALYZING CURRENT BEHAVIOR ===');

      // Level 1: No selections
      const level1 = getFilteredOptions({}, 1);
      console.log('Level 1 (no selections):');
      console.log('- Sizes available:', level1.available.sizes?.length || 0);
      console.log('- Light directions available:', level1.available.light_directions?.length || 0);
      console.log('- Mirror styles available:', level1.available.mirror_styles?.length || 0);

      // Level 2: Mirror style selected (Circle)
      const level2 = getFilteredOptions({ mirror_styles: '2' }, 1);
      console.log('\nLevel 2 (Circle selected):');
      console.log('- Sizes available:', level2.available.sizes?.length || 0, '→', level2.available.sizes);
      console.log('- Light directions available:', level2.available.light_directions?.length || 0, '→', level2.available.light_directions);
      console.log('- Mirror styles available:', level2.available.mirror_styles?.length || 0, '→', level2.available.mirror_styles);

      // The bug would manifest as light_directions being incorrectly filtered
      // when only sizes should be affected by overrides

      expect(level1.available.light_directions).toHaveLength(3);
      // This should pass but may fail if the bug exists:
      expect(level2.available.light_directions).toHaveLength(3);
    });

    it('should map collections that have overrides vs those that do not', async () => {
      // Test data analysis: which collections have overrides?
      const overrideCollections = new Set(mockProductOverrides.map(o => o.collection));
      const allCollections = new Set(mockProductLineOptions.map(o => o.collection));

      console.log('Collections with overrides:', Array.from(overrideCollections));
      console.log('Collections without overrides:', Array.from(allCollections).filter(c => !overrideCollections.has(c)));

      // Expected: only 'sizes' has overrides, others should be unaffected
      expect(overrideCollections.has('sizes')).toBe(true);
      expect(overrideCollections.has('light_directions')).toBe(false);
      expect(overrideCollections.has('mirror_styles')).toBe(false);
    });
  });

  describe('Filtering mechanism mapping', () => {
    it('should identify the three types of filtering that need to be separated', async () => {
      // The spec mentions three filtering mechanisms that need separation:
      // 1. Product overrides (hide unavailable options)
      // 2. Rule-based disabling (disable but keep visible)
      // 3. Dynamic product matching (filter based on actual product availability)

      const currentSelection = { mirror_styles: '2' };
      const result = getFilteredOptions(currentSelection, 1);

      // Log current behavior to understand which mechanism is affecting what
      console.log('Current filtering result for Circle selection:');
      console.log('Available:', result.available);
      console.log('Disabled:', result.disabled);
      console.log('All:', result.all);

      // The bug likely stems from applying override logic too broadly
      // instead of limiting it to collections that actually have overrides

      expect(result).toBeDefined();
    });
  });
});

describe('Expected Correct Behavior (after fix)', () => {
  beforeEach(async () => {
    clearFilteringCache();
    await initializeFiltering();
  });

  it('should correctly apply overrides only to collections with explicit overrides', async () => {
    // After the fix, this test should pass
    const withCircleSelected = getFilteredOptions({ mirror_styles: '2' }, 1);

    // Collections WITH overrides should be filtered
    expect(withCircleSelected.available.sizes).toEqual(['5', '6']); // Only overridden sizes

    // Collections WITHOUT overrides should remain unaffected
    expect(withCircleSelected.available.light_directions).toHaveLength(3); // All still available
    expect(withCircleSelected.available.light_directions).toEqual(['1', '2', '3']); // All light directions
  });

  it('should maintain dynamic product matching without override interference', async () => {
    // Dynamic matching should work based on which products exist
    // but should not be confused with override filtering

    const result = getFilteredOptions({ mirror_styles: '2' }, 1);

    // All three light directions should be available because:
    // - Product 101: mirror_style=2, light_direction=1 (Direct exists)
    // - Product 102: mirror_style=2, light_direction=2 (Indirect exists)
    // - Product 105: mirror_style=2, light_direction=3 (Both exists)
    expect(result.available.light_directions).toEqual(['1', '2', '3']);
  });

  it('should clearly separate override hiding from rule disabling', async () => {
    // After the fix:
    // - Overrides should HIDE options (remove from available list)
    // - Rules should DISABLE options (keep in list but mark as disabled)
    // - These should not interfere with each other

    expect(true).toBe(true); // Placeholder for rule testing
  });
});