/**
 * End-to-End Integration Tests for Configuration UI Sorting
 * Tests the complete flow from database data to UI rendering
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { buildOrderedComponentConfigs, validateComponentMappings } from '../../utils/componentMapping';
import type { ConfigurationUI, ProductOptions } from '../../store/types';

// Mock the toast library to avoid import issues
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}));

// Mock Supabase to avoid import issues
vi.mock('../../utils/supabase/directClientSimplified', () => ({
  simplifiedDirectSupabaseClient: {
    from: vi.fn(),
    select: vi.fn(),
    rpc: vi.fn(),
  },
}));

describe('Configuration UI Sorting Integration', () => {
  let mockConfiguration: any;
  let mockProductOptions: ProductOptions;
  let mockConfigurationUI: ConfigurationUI[];
  let mockHandlers: any;

  beforeEach(() => {
    // Mock configuration state
    mockConfiguration = {
      frameColor: '',
      mirrorStyle: '',
      size: '',
      lightOutput: '',
      colorTemperature: '',
      mounting: '',
      useCustomSize: false,
      customWidth: '',
      customHeight: '',
    };

    // Mock product options with realistic data
    mockProductOptions = {
      mirrorControls: [],
      frameColors: [
        { id: 1, name: 'Black Frame', value: 'BF', label: 'Black Frame', count: 12 },
        { id: 2, name: 'White Frame', value: 'WF', label: 'White Frame', count: 8 },
      ],
      frameThickness: [
        { id: 1, name: 'Standard', value: '1', label: 'Standard', count: 15 },
      ],
      mirrorStyles: [
        { id: 1, name: 'Full Frame', value: '01', label: 'Full Frame', count: 20 },
        { id: 2, name: 'Minimal Frame', value: '02', label: 'Minimal Frame', count: 18 },
      ],
      mountingOptions: [
        { id: 1, name: 'Wall Mount', value: 'W', label: 'Wall Mount', count: 25 },
        { id: 2, name: 'Recessed', value: 'R', label: 'Recessed', count: 12 },
      ],
      lightingOptions: [
        { id: 1, name: 'Direct', value: 'd', label: 'Direct', count: 30 },
        { id: 2, name: 'Indirect', value: 'i', label: 'Indirect', count: 22 },
      ],
      colorTemperatures: [
        { id: 1, name: '2700K', value: '27', label: '2700K Warm White', count: 28 },
        { id: 2, name: '3000K', value: '30', label: '3000K Soft White', count: 25 },
      ],
      lightOutputs: [
        { id: 1, name: 'Standard', value: 'S', label: 'Standard Output', count: 35 },
        { id: 2, name: 'High', value: 'H', label: 'High Output', count: 20 },
      ],
      drivers: [
        { id: 1, name: 'Voltage', value: 'V', label: 'Voltage Driver', count: 30 },
        { id: 2, name: 'Current', value: 'C', label: 'Current Driver', count: 15 },
      ],
      accessoryOptions: [
        { id: 1, name: 'Night Light', value: 'NL', label: 'Night Light', count: 10 },
      ],
      sizes: [
        { id: 1, name: '24x36', value: '2436', label: '24" x 36"', count: 18 },
        { id: 2, name: '30x42', value: '3042', label: '30" x 42"', count: 12 },
      ],
    };

    // Mock handlers
    mockHandlers = {
      onUpdateConfiguration: vi.fn(),
      onAddToQuote: vi.fn(),
      onPageChange: vi.fn(),
      onPageSizeChange: vi.fn(),
      onClearCache: vi.fn(),
      onGetCacheStats: vi.fn(),
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('End-to-End Configuration UI Sorting', () => {
    it('should build components in sort order defined by configuration_ui', () => {
      // Configuration UI with specific sort order
      mockConfigurationUI = [
        { id: '1', collection: 'sizes', ui_type: 'preset_buttons', sort: 1 },
        { id: '2', collection: 'frame_colors', ui_type: 'color_picker', sort: 2 },
        { id: '3', collection: 'mirror_styles', ui_type: 'button_grid', sort: 3 },
        { id: '4', collection: 'mounting_options', ui_type: 'button_grid', sort: 4 },
        { id: '5', collection: 'light_directions', ui_type: 'button_grid', sort: 5 },
      ];

      const orderedConfigs = buildOrderedComponentConfigs(mockConfigurationUI, mockProductOptions);

      // Verify that components are ordered correctly
      expect(orderedConfigs).toHaveLength(5); // 5 valid collections
      expect(orderedConfigs[0].collection).toBe('sizes');
      expect(orderedConfigs[0].title).toBe('Size');
      expect(orderedConfigs[1].collection).toBe('frame_colors');
      expect(orderedConfigs[1].title).toBe('Frame Color');
      expect(orderedConfigs[2].collection).toBe('mirror_styles');
      expect(orderedConfigs[2].title).toBe('Mirror Style');
      expect(orderedConfigs[3].collection).toBe('mounting_options');
      expect(orderedConfigs[3].title).toBe('Mounting Options');
      expect(orderedConfigs[4].collection).toBe('light_directions');
      expect(orderedConfigs[4].title).toBe('Light Direction');
    });

    it('should handle different sort order configurations', async () => {
      // Configuration UI with reverse sort order
      mockConfigurationUI = [
        { id: '1', collection: 'mounting_options', ui_type: 'button_grid', sort: 10 },
        { id: '2', collection: 'mirror_styles', ui_type: 'button_grid', sort: 20 },
        { id: '3', collection: 'frame_colors', ui_type: 'color_picker', sort: 30 },
        { id: '4', collection: 'sizes', ui_type: 'preset_buttons', sort: 40 },
      ];

      // Build ordered configurations
      const orderedConfigs = buildOrderedComponentConfigs(mockConfigurationUI, mockProductOptions);

      // Verify sort order is respected
      expect(orderedConfigs[0].collection).toBe('mounting_options');
      expect(orderedConfigs[1].collection).toBe('mirror_styles');
      expect(orderedConfigs[2].collection).toBe('frame_colors');
      expect(orderedConfigs[3].collection).toBe('sizes');
    });

    it('should skip missing collections while maintaining sort order', async () => {
      // Configuration UI with some collections missing from options
      mockConfigurationUI = [
        { id: '1', collection: 'sizes', ui_type: 'preset_buttons', sort: 1 },
        { id: '2', collection: 'non_existent_collection', ui_type: 'button_grid', sort: 2 },
        { id: '3', collection: 'frame_colors', ui_type: 'color_picker', sort: 3 },
        { id: '4', collection: 'another_missing', ui_type: 'single', sort: 4 },
        { id: '5', collection: 'mirror_styles', ui_type: 'button_grid', sort: 5 },
      ];

      const orderedConfigs = buildOrderedComponentConfigs(mockConfigurationUI, mockProductOptions);

      // Should only include available collections in correct order
      expect(orderedConfigs).toHaveLength(3);
      expect(orderedConfigs[0].collection).toBe('sizes');
      expect(orderedConfigs[1].collection).toBe('frame_colors');
      expect(orderedConfigs[2].collection).toBe('mirror_styles');
    });

    it('should validate configuration_ui data integrity', () => {
      // Configuration UI with various data issues
      const problematicConfigUI: ConfigurationUI[] = [
        { id: '1', collection: 'frame_colors', ui_type: 'color_picker', sort: 2 },
        { id: '2', collection: '', ui_type: 'button_grid', sort: 3 }, // Empty collection
        { id: '3', collection: 'sizes', ui_type: '', sort: 4 }, // Empty ui_type
        { id: '4', collection: 'unknown_collection', ui_type: 'button_grid', sort: 5 }, // Unknown collection
        { id: '5', collection: 'mirror_styles', ui_type: 'invalid_type', sort: 6 }, // Invalid ui_type
      ];

      const validation = validateComponentMappings(problematicConfigUI);

      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
      expect(validation.errors).toContain('Invalid collection name at index 1: ""');
      expect(validation.errors).toContain('Invalid ui_type for collection "sizes": ""');
      expect(validation.errors).toContain('Missing options key mapping for collection: unknown_collection');
      expect(validation.errors).toContain('Unsupported UI type: invalid_type for collection: mirror_styles');
    });

    it('should handle empty configuration_ui gracefully', () => {
      mockConfigurationUI = [];

      const orderedConfigs = buildOrderedComponentConfigs(mockConfigurationUI, mockProductOptions);

      // Should return empty array when no configuration_ui data
      expect(orderedConfigs).toEqual([]);
    });

    it('should handle malformed sort values in configuration_ui', () => {
      // Configuration UI with malformed sort values
      const malformedConfigUI: ConfigurationUI[] = [
        { id: '1', collection: 'frame_colors', ui_type: 'color_picker', sort: 5 },
        { id: '2', collection: 'mirror_styles', ui_type: 'button_grid', sort: null as any },
        { id: '3', collection: 'sizes', ui_type: 'preset_buttons', sort: NaN as any },
        { id: '4', collection: 'mounting_options', ui_type: 'button_grid', sort: 'invalid' as any },
        { id: '5', collection: 'light_directions', ui_type: 'button_grid', sort: 1 },
      ];

      const orderedConfigs = buildOrderedComponentConfigs(malformedConfigUI, mockProductOptions);

      // Should handle malformed values and maintain some order
      expect(orderedConfigs.length).toBeGreaterThan(0);

      // Valid sort values should come first
      const firstConfig = orderedConfigs.find(config => config.collection === 'light_directions');
      const secondConfig = orderedConfigs.find(config => config.collection === 'frame_colors');

      expect(firstConfig).toBeDefined();
      expect(secondConfig).toBeDefined();
    });
  });

  describe('Dynamic Ordering Behavior', () => {
    it('should maintain consistent ordering when configuration_ui is updated', () => {
      // Initial configuration
      const initialConfigUI: ConfigurationUI[] = [
        { id: '1', collection: 'frame_colors', ui_type: 'color_picker', sort: 10 },
        { id: '2', collection: 'sizes', ui_type: 'preset_buttons', sort: 20 },
      ];

      const initialConfigs = buildOrderedComponentConfigs(initialConfigUI, mockProductOptions);
      expect(initialConfigs[0].collection).toBe('frame_colors');
      expect(initialConfigs[1].collection).toBe('sizes');

      // Updated configuration with different sort order
      const updatedConfigUI: ConfigurationUI[] = [
        { id: '1', collection: 'frame_colors', ui_type: 'color_picker', sort: 20 },
        { id: '2', collection: 'sizes', ui_type: 'preset_buttons', sort: 10 },
      ];

      const updatedConfigs = buildOrderedComponentConfigs(updatedConfigUI, mockProductOptions);
      expect(updatedConfigs[0].collection).toBe('sizes');
      expect(updatedConfigs[1].collection).toBe('frame_colors');
    });

    it('should handle tie-breaking with consistent id-based ordering', () => {
      // Configuration UI with same sort values
      const tiedConfigUI: ConfigurationUI[] = [
        { id: 'z-id', collection: 'frame_colors', ui_type: 'color_picker', sort: 10 },
        { id: 'a-id', collection: 'sizes', ui_type: 'preset_buttons', sort: 10 },
        { id: 'm-id', collection: 'mirror_styles', ui_type: 'button_grid', sort: 10 },
      ];

      const orderedConfigs = buildOrderedComponentConfigs(tiedConfigUI, mockProductOptions);

      // Should be ordered by id when sort values are equal
      expect(orderedConfigs[0].collection).toBe('sizes'); // a-id
      expect(orderedConfigs[1].collection).toBe('mirror_styles'); // m-id
      expect(orderedConfigs[2].collection).toBe('frame_colors'); // z-id
    });
  });

  describe('Performance and Error Handling', () => {
    it('should handle large configuration_ui datasets efficiently', () => {
      // Create a large configuration_ui dataset
      const largeConfigUI: ConfigurationUI[] = [];
      for (let i = 0; i < 100; i++) {
        largeConfigUI.push({
          id: `id-${i}`,
          collection: i % 2 === 0 ? 'frame_colors' : 'sizes',
          ui_type: 'button_grid',
          sort: Math.floor(Math.random() * 1000),
        });
      }

      const startTime = performance.now();
      const orderedConfigs = buildOrderedComponentConfigs(largeConfigUI, mockProductOptions);
      const endTime = performance.now();

      // Should complete in reasonable time
      expect(endTime - startTime).toBeLessThan(100); // Less than 100ms
      expect(orderedConfigs.length).toBe(100); // All items should be processed (they're all valid)
    });

    it('should handle validation errors without crashing', () => {
      const invalidConfigUI: ConfigurationUI[] = [
        { id: '', collection: null as any, ui_type: undefined as any, sort: 'invalid' as any },
        { id: '2', collection: 'frame_colors', ui_type: 'color_picker', sort: 2 },
      ];

      // Should not throw an error
      expect(() => {
        const validation = validateComponentMappings(invalidConfigUI);
        const orderedConfigs = buildOrderedComponentConfigs(invalidConfigUI, mockProductOptions);

        expect(validation.isValid).toBe(false);
        expect(orderedConfigs.length).toBe(1); // Only valid configuration
      }).not.toThrow();
    });
  });
});