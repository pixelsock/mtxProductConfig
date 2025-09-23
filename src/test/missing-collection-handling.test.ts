/**
 * Missing Collection Handling and Edge Cases Tests
 * Tests for graceful handling of missing collections, malformed data, and edge cases
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  buildOrderedComponentConfigs,
  filterAvailableCollections,
  sortConfigurationUIBySortField,
  validateComponentMappings,
  mapConfigurationUIToComponent,
} from '../utils/componentMapping';
import type { ConfigurationUI, ProductOptions } from '../store/types';

describe('Missing Collection Handling and Edge Cases', () => {
  let mockProductOptions: ProductOptions;
  let mockConfigurationUI: ConfigurationUI[];

  beforeEach(() => {
    // Mock standard product options
    mockProductOptions = {
      mirrorControls: [],
      frameColors: [{ id: 1, name: 'Black', sku_code: 'BF' }],
      frameThickness: [{ id: 1, name: 'Wide', sku_code: 'W' }],
      mirrorStyles: [{ id: 1, name: 'Full Frame', sku_code: '01' }],
      mountingOptions: [{ id: 1, name: 'Wall Mount', sku_code: 'WM' }],
      lightingOptions: [{ id: 1, name: 'Direct', sku_code: 'D' }],
      colorTemperatures: [{ id: 1, name: '2700K', sku_code: '27' }],
      lightOutputs: [{ id: 1, name: 'Standard', sku_code: 'S' }],
      drivers: [{ id: 1, name: 'Voltage', sku_code: 'V' }],
      accessoryOptions: [{ id: 1, name: 'Night Light', sku_code: 'NL' }],
      sizes: [{ id: 1, name: '24x36', sku_code: '2436' }],
    };

    // Mock configuration_ui with some missing collections
    mockConfigurationUI = [
      { id: '1', collection: 'frame_colors', ui_type: 'color_picker', sort: 4 },
      { id: '2', collection: 'mirror_styles', ui_type: 'button_grid', sort: 2 },
      { id: '3', collection: 'non_existent_collection', ui_type: 'button_grid', sort: 1 },
      { id: '4', collection: 'sizes', ui_type: 'preset_buttons', sort: 10 },
      { id: '5', collection: 'another_missing_collection', ui_type: 'single', sort: 5 },
    ];
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Missing Collection Detection', () => {
    it('should filter out non-existent collections gracefully', () => {
      const result = filterAvailableCollections(mockConfigurationUI, mockProductOptions);

      // Should only include collections that exist in ProductOptions
      expect(result).toHaveLength(3);
      expect(result.map(r => r.collection)).toEqual([
        'frame_colors',
        'mirror_styles',
        'sizes'
      ]);
      expect(result.map(r => r.collection)).not.toContain('non_existent_collection');
      expect(result.map(r => r.collection)).not.toContain('another_missing_collection');
    });

    it('should maintain sort order even with missing collections', () => {
      const result = filterAvailableCollections(mockConfigurationUI, mockProductOptions);

      // filterAvailableCollections returns items in input order (frame_colors, mirror_styles, sizes)
      // It doesn't sort - that's done by sortConfigurationUIBySortField separately
      expect(result[0].sort).toBe(4); // frame_colors (first in input order)
      expect(result[1].sort).toBe(2); // mirror_styles (second in input order)
      expect(result[2].sort).toBe(10); // sizes (third in input order)
    });

    it('should handle empty collections gracefully', () => {
      const emptyProductOptions: ProductOptions = {
        mirrorControls: [],
        frameColors: [],
        frameThickness: [],
        mirrorStyles: [],
        mountingOptions: [],
        lightingOptions: [],
        colorTemperatures: [],
        lightOutputs: [],
        drivers: [],
        accessoryOptions: [],
        sizes: [],
      };

      const result = filterAvailableCollections(mockConfigurationUI, emptyProductOptions);
      expect(result).toEqual([]);
    });

    it('should handle collections with zero length arrays', () => {
      const partialProductOptions: ProductOptions = {
        ...mockProductOptions,
        frameColors: [], // Empty but exists
        mirrorStyles: [{ id: 1, name: 'Test', sku_code: '01' }], // Has data
      };

      const result = filterAvailableCollections(mockConfigurationUI, partialProductOptions);

      // Only mirror_styles and sizes should remain (frame_colors is empty)
      expect(result).toHaveLength(2);
      expect(result.map(r => r.collection)).toEqual(['mirror_styles', 'sizes']);
    });
  });

  describe('Malformed Sort Values', () => {
    it('should handle null sort values', () => {
      const configUIWithNulls: ConfigurationUI[] = [
        { id: '1', collection: 'frame_colors', ui_type: 'color_picker', sort: 4 },
        { id: '2', collection: 'mirror_styles', ui_type: 'button_grid', sort: null as any },
        { id: '3', collection: 'sizes', ui_type: 'preset_buttons', sort: 10 },
      ];

      const sorted = sortConfigurationUIBySortField(configUIWithNulls);

      // null sort should be handled gracefully (JavaScript sort behavior)
      expect(sorted).toHaveLength(3);
      expect(sorted.map(s => s.collection)).toContain('frame_colors');
      expect(sorted.map(s => s.collection)).toContain('mirror_styles');
      expect(sorted.map(s => s.collection)).toContain('sizes');
    });

    it('should handle undefined sort values', () => {
      const configUIWithUndefined: ConfigurationUI[] = [
        { id: '1', collection: 'frame_colors', ui_type: 'color_picker', sort: 4 },
        { id: '2', collection: 'mirror_styles', ui_type: 'button_grid', sort: undefined as any },
        { id: '3', collection: 'sizes', ui_type: 'preset_buttons', sort: 10 },
      ];

      const sorted = sortConfigurationUIBySortField(configUIWithUndefined);

      expect(sorted).toHaveLength(3);
      // Should not crash and should return all items
      expect(sorted.map(s => s.collection)).toContain('frame_colors');
      expect(sorted.map(s => s.collection)).toContain('mirror_styles');
      expect(sorted.map(s => s.collection)).toContain('sizes');
    });

    it('should handle NaN sort values', () => {
      const configUIWithNaN: ConfigurationUI[] = [
        { id: '1', collection: 'frame_colors', ui_type: 'color_picker', sort: 4 },
        { id: '2', collection: 'mirror_styles', ui_type: 'button_grid', sort: NaN },
        { id: '3', collection: 'sizes', ui_type: 'preset_buttons', sort: 10 },
      ];

      const sorted = sortConfigurationUIBySortField(configUIWithNaN);

      expect(sorted).toHaveLength(3);
      // NaN should be handled gracefully by JavaScript sort
      expect(sorted.find(s => s.collection === 'mirror_styles')?.sort).toBeNaN();
    });

    it('should handle extremely large sort values', () => {
      const configUIWithLargeValues: ConfigurationUI[] = [
        { id: '1', collection: 'frame_colors', ui_type: 'color_picker', sort: Number.MAX_SAFE_INTEGER },
        { id: '2', collection: 'mirror_styles', ui_type: 'button_grid', sort: 2 },
        { id: '3', collection: 'sizes', ui_type: 'preset_buttons', sort: Number.MIN_SAFE_INTEGER },
      ];

      const sorted = sortConfigurationUIBySortField(configUIWithLargeValues);

      expect(sorted[0].sort).toBe(Number.MIN_SAFE_INTEGER);
      expect(sorted[1].sort).toBe(2);
      expect(sorted[2].sort).toBe(Number.MAX_SAFE_INTEGER);
    });
  });

  describe('Null and Empty Collection Names', () => {
    it('should filter out null collection names', () => {
      const configUIWithNulls: ConfigurationUI[] = [
        { id: '1', collection: 'frame_colors', ui_type: 'color_picker', sort: 4 },
        { id: '2', collection: null as any, ui_type: 'button_grid', sort: 2 },
        { id: '3', collection: 'sizes', ui_type: 'preset_buttons', sort: 10 },
      ];

      const result = filterAvailableCollections(configUIWithNulls, mockProductOptions);

      expect(result).toHaveLength(2);
      expect(result.map(r => r.collection)).toEqual(['frame_colors', 'sizes']);
    });

    it('should filter out empty collection names', () => {
      const configUIWithEmpty: ConfigurationUI[] = [
        { id: '1', collection: 'frame_colors', ui_type: 'color_picker', sort: 4 },
        { id: '2', collection: '', ui_type: 'button_grid', sort: 2 },
        { id: '3', collection: 'sizes', ui_type: 'preset_buttons', sort: 10 },
      ];

      const result = filterAvailableCollections(configUIWithEmpty, mockProductOptions);

      expect(result).toHaveLength(2);
      expect(result.map(r => r.collection)).toEqual(['frame_colors', 'sizes']);
    });

    it('should handle whitespace-only collection names', () => {
      const configUIWithWhitespace: ConfigurationUI[] = [
        { id: '1', collection: 'frame_colors', ui_type: 'color_picker', sort: 4 },
        { id: '2', collection: '   ', ui_type: 'button_grid', sort: 2 },
        { id: '3', collection: 'sizes', ui_type: 'preset_buttons', sort: 10 },
      ];

      const result = filterAvailableCollections(configUIWithWhitespace, mockProductOptions);

      expect(result).toHaveLength(2);
      expect(result.map(r => r.collection)).toEqual(['frame_colors', 'sizes']);
    });
  });

  describe('Invalid UI Types', () => {
    it('should validate and report unsupported UI types', () => {
      const configUIWithInvalidTypes: ConfigurationUI[] = [
        { id: '1', collection: 'frame_colors', ui_type: 'color_picker', sort: 4 },
        { id: '2', collection: 'mirror_styles', ui_type: 'invalid_ui_type' as any, sort: 2 },
        { id: '3', collection: 'sizes', ui_type: 'another_invalid_type' as any, sort: 10 },
      ];

      const validation = validateComponentMappings(configUIWithInvalidTypes);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Unsupported UI type: invalid_ui_type for collection: mirror_styles');
      expect(validation.errors).toContain('Unsupported UI type: another_invalid_type for collection: sizes');
    });

    it('should handle null ui_type values', () => {
      const configUIWithNullTypes: ConfigurationUI[] = [
        { id: '1', collection: 'frame_colors', ui_type: 'color_picker', sort: 4 },
        { id: '2', collection: 'mirror_styles', ui_type: null as any, sort: 2 },
      ];

      const validation = validateComponentMappings(configUIWithNullTypes);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Invalid ui_type for collection "mirror_styles": "null"');
    });

    it('should handle empty ui_type values', () => {
      const configUIWithEmptyTypes: ConfigurationUI[] = [
        { id: '1', collection: 'frame_colors', ui_type: 'color_picker', sort: 4 },
        { id: '2', collection: 'mirror_styles', ui_type: '', sort: 2 },
      ];

      const validation = validateComponentMappings(configUIWithEmptyTypes);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Invalid ui_type for collection "mirror_styles": ""');
    });
  });

  describe('Component Mapping Edge Cases', () => {
    it('should throw error for unmapped collections when building component configs', () => {
      const invalidConfigUI: ConfigurationUI = {
        id: '99',
        collection: 'completely_unknown_collection',
        ui_type: 'button_grid',
        sort: 1,
      };

      expect(() =>
        mapConfigurationUIToComponent(invalidConfigUI, mockProductOptions)
      ).toThrow('No options key mapping found for collection: completely_unknown_collection');
    });

    it('should handle collections with missing option mappings', () => {
      const validation = validateComponentMappings([
        { id: '1', collection: 'unknown_collection_1', ui_type: 'button_grid', sort: 1 },
        { id: '2', collection: 'unknown_collection_2', ui_type: 'single', sort: 2 },
      ]);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Missing options key mapping for collection: unknown_collection_1');
      expect(validation.errors).toContain('Missing config key mapping for collection: unknown_collection_1');
      expect(validation.errors).toContain('Missing title mapping for collection: unknown_collection_1');
    });
  });

  describe('Fallback Component Ordering', () => {
    it('should handle completely missing configuration_ui data', () => {
      const result = buildOrderedComponentConfigs([], mockProductOptions);
      expect(result).toEqual([]);
    });

    it('should handle configuration_ui with all missing collections', () => {
      const allMissingConfigUI: ConfigurationUI[] = [
        { id: '1', collection: 'missing_1', ui_type: 'button_grid', sort: 1 },
        { id: '2', collection: 'missing_2', ui_type: 'single', sort: 2 },
        { id: '3', collection: 'missing_3', ui_type: 'grid', sort: 3 },
      ];

      const result = buildOrderedComponentConfigs(allMissingConfigUI, mockProductOptions);
      expect(result).toEqual([]);
    });

    it('should gracefully handle mixed valid and invalid collections', () => {
      const mixedConfigUI: ConfigurationUI[] = [
        { id: '1', collection: 'frame_colors', ui_type: 'color_picker', sort: 4 },
        { id: '2', collection: 'invalid_collection', ui_type: 'button_grid', sort: 2 },
        { id: '3', collection: 'sizes', ui_type: 'preset_buttons', sort: 10 },
        { id: '4', collection: 'another_invalid', ui_type: 'single', sort: 6 },
      ];

      const result = buildOrderedComponentConfigs(mixedConfigUI, mockProductOptions);

      expect(result).toHaveLength(2);
      expect(result[0].collection).toBe('frame_colors');
      expect(result[1].collection).toBe('sizes');
      // ComponentConfig doesn't have sort field - order is determined by the sorting step
      // frame_colors(4) comes before sizes(10) after sorting
    });
  });

  describe('Data Consistency Validation', () => {
    it('should detect duplicate sort values', () => {
      const configUIWithDuplicates: ConfigurationUI[] = [
        { id: '1', collection: 'frame_colors', ui_type: 'color_picker', sort: 5 },
        { id: '2', collection: 'mirror_styles', ui_type: 'button_grid', sort: 5 }, // Duplicate sort
        { id: '3', collection: 'sizes', ui_type: 'preset_buttons', sort: 10 },
        { id: '4', collection: 'drivers', ui_type: 'button_grid', sort: 10 }, // Duplicate sort
      ];

      // Our sort function should handle duplicates by using ID as tiebreaker
      const sorted = sortConfigurationUIBySortField(configUIWithDuplicates);

      expect(sorted).toHaveLength(4);
      // Items with sort=5 should be ordered by ID
      const sortFiveItems = sorted.filter(item => item.sort === 5);
      expect(sortFiveItems).toHaveLength(2);
      expect(sortFiveItems[0].id < sortFiveItems[1].id).toBe(true);
    });

    it('should handle missing required fields gracefully', () => {
      const incompleteConfigUI = [
        { id: '1', collection: 'frame_colors', sort: 4 }, // Missing ui_type
        { collection: 'mirror_styles', ui_type: 'button_grid', sort: 2 }, // Missing id
        { id: '3', ui_type: 'preset_buttons', sort: 10 }, // Missing collection
      ] as ConfigurationUI[];

      // Functions should not crash with incomplete data
      expect(() => sortConfigurationUIBySortField(incompleteConfigUI)).not.toThrow();
      expect(() => filterAvailableCollections(incompleteConfigUI, mockProductOptions)).not.toThrow();
    });
  });

  describe('Performance Edge Cases', () => {
    it('should handle large configuration_ui datasets efficiently', () => {
      const largeConfigUI: ConfigurationUI[] = Array.from({ length: 1000 }, (_, i) => ({
        id: `id-${i}`,
        collection: `collection_${i % 10}`, // 10 different collections repeated
        ui_type: 'button_grid',
        sort: Math.floor(Math.random() * 1000),
      }));

      const startTime = performance.now();
      const sorted = sortConfigurationUIBySortField(largeConfigUI);
      const endTime = performance.now();

      expect(sorted).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(100); // Should complete in under 100ms
    });

    it('should handle empty arrays without errors', () => {
      expect(() => sortConfigurationUIBySortField([])).not.toThrow();
      expect(() => filterAvailableCollections([], mockProductOptions)).not.toThrow();
      expect(() => buildOrderedComponentConfigs([], mockProductOptions)).not.toThrow();
      expect(() => validateComponentMappings([])).not.toThrow();

      expect(sortConfigurationUIBySortField([])).toEqual([]);
      expect(filterAvailableCollections([], mockProductOptions)).toEqual([]);
      expect(buildOrderedComponentConfigs([], mockProductOptions)).toEqual([]);
      expect(validateComponentMappings([]).isValid).toBe(true);
    });
  });
});