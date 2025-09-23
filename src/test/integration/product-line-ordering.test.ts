/**
 * Product Line Dynamic Ordering Tests
 * Tests for subtask 5.2: Test dynamic ordering behavior across different product lines
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { buildOrderedComponentConfigs, filterAvailableCollections } from '../../utils/componentMapping';
import type { ConfigurationUI, ProductOptions } from '../../store/types';

describe('Product Line Dynamic Ordering', () => {
  let mockProductOptions: ProductOptions;
  let mockConfigurationUI: ConfigurationUI[];

  beforeEach(() => {
    // Mock product options
    mockProductOptions = {
      mirrorControls: [],
      frameColors: [{ id: 1, name: 'Black', value: 'BF', label: 'Black Frame', count: 10 }],
      frameThickness: [{ id: 1, name: 'Standard', value: '1', label: 'Standard', count: 5 }],
      mirrorStyles: [{ id: 1, name: 'Full Frame', value: '01', label: 'Full Frame', count: 15 }],
      mountingOptions: [{ id: 1, name: 'Wall Mount', value: 'W', label: 'Wall Mount', count: 8 }],
      lightingOptions: [{ id: 1, name: 'Direct', value: 'd', label: 'Direct', count: 12 }],
      colorTemperatures: [{ id: 1, name: '2700K', value: '27', label: '2700K', count: 6 }],
      lightOutputs: [{ id: 1, name: 'Standard', value: 'S', label: 'Standard', count: 14 }],
      drivers: [{ id: 1, name: 'Voltage', value: 'V', label: 'Voltage', count: 9 }],
      accessoryOptions: [{ id: 1, name: 'Night Light', value: 'NL', label: 'Night Light', count: 3 }],
      sizes: [{ id: 1, name: '24x36', value: '2436', label: '24x36', count: 7 }],
    };

    // Standard configuration UI
    mockConfigurationUI = [
      { id: '1', collection: 'frame_colors', ui_type: 'color_picker', sort: 10 },
      { id: '2', collection: 'mirror_styles', ui_type: 'button_grid', sort: 20 },
      { id: '3', collection: 'sizes', ui_type: 'preset_buttons', sort: 30 },
      { id: '4', collection: 'mounting_options', ui_type: 'button_grid', sort: 40 },
      { id: '5', collection: 'light_directions', ui_type: 'button_grid', sort: 50 },
    ];
  });

  it('should render all collections when no product line is specified', () => {
    const availableConfigs = filterAvailableCollections(mockConfigurationUI, mockProductOptions);
    const orderedConfigs = buildOrderedComponentConfigs(mockConfigurationUI, mockProductOptions);

    // All valid collections should be available
    expect(availableConfigs).toHaveLength(5);
    expect(orderedConfigs).toHaveLength(5);

    // Should be in sort order
    expect(orderedConfigs[0].collection).toBe('frame_colors');
    expect(orderedConfigs[1].collection).toBe('mirror_styles');
    expect(orderedConfigs[2].collection).toBe('sizes');
    expect(orderedConfigs[3].collection).toBe('mounting_options');
    expect(orderedConfigs[4].collection).toBe('light_directions');
  });

  it('should filter collections based on product line defaults', () => {
    const mockProductLine = {
      id: 1,
      name: 'Test Product Line',
      default_options: [
        { collection: 'frame_colors', item: 'BF' },
        { collection: 'sizes', item: '2436' },
        { collection: 'light_directions', item: 'd' },
        // Note: mirror_styles and mounting_options not in defaults
      ],
    };

    const availableConfigs = filterAvailableCollections(mockConfigurationUI, mockProductOptions, mockProductLine);
    const orderedConfigs = buildOrderedComponentConfigs(mockConfigurationUI, mockProductOptions, mockProductLine);

    // Should only include collections in product line defaults
    expect(availableConfigs).toHaveLength(3);
    expect(orderedConfigs).toHaveLength(3);

    // Should maintain sort order for available collections
    expect(orderedConfigs[0].collection).toBe('frame_colors'); // sort: 10
    expect(orderedConfigs[1].collection).toBe('sizes'); // sort: 30
    expect(orderedConfigs[2].collection).toBe('light_directions'); // sort: 50
  });

  it('should handle product line with empty defaults gracefully', () => {
    const mockProductLineEmpty = {
      id: 2,
      name: 'Empty Product Line',
      default_options: [],
    };

    const availableConfigs = filterAvailableCollections(mockConfigurationUI, mockProductOptions, mockProductLineEmpty);
    const orderedConfigs = buildOrderedComponentConfigs(mockConfigurationUI, mockProductOptions, mockProductLineEmpty);

    // Should show all collections when no defaults (fallback behavior)
    expect(availableConfigs).toHaveLength(5);
    expect(orderedConfigs).toHaveLength(5);
  });

  it('should handle product line with null/undefined defaults', () => {
    const mockProductLineNull = {
      id: 3,
      name: 'Null Defaults Product Line',
      default_options: null,
    };

    const availableConfigs = filterAvailableCollections(mockConfigurationUI, mockProductOptions, mockProductLineNull);
    const orderedConfigs = buildOrderedComponentConfigs(mockConfigurationUI, mockProductOptions, mockProductLineNull);

    // Should show all collections when defaults are null (fallback behavior)
    expect(availableConfigs).toHaveLength(5);
    expect(orderedConfigs).toHaveLength(5);
  });

  it('should maintain consistent ordering across different product lines', () => {
    const productLine1 = {
      id: 1,
      name: 'Product Line 1',
      default_options: [
        { collection: 'frame_colors', item: 'BF' },
        { collection: 'sizes', item: '2436' },
      ],
    };

    const productLine2 = {
      id: 2,
      name: 'Product Line 2',
      default_options: [
        { collection: 'sizes', item: '2436' },
        { collection: 'frame_colors', item: 'WF' },
        { collection: 'mounting_options', item: 'W' },
      ],
    };

    const configs1 = buildOrderedComponentConfigs(mockConfigurationUI, mockProductOptions, productLine1);
    const configs2 = buildOrderedComponentConfigs(mockConfigurationUI, mockProductOptions, productLine2);

    // Both should maintain sort order regardless of default_options order
    expect(configs1[0].collection).toBe('frame_colors'); // sort: 10
    expect(configs1[1].collection).toBe('sizes'); // sort: 30

    expect(configs2[0].collection).toBe('frame_colors'); // sort: 10
    expect(configs2[1].collection).toBe('sizes'); // sort: 30
    expect(configs2[2].collection).toBe('mounting_options'); // sort: 40
  });

  it('should handle configuration_ui updates dynamically', () => {
    // Initial configuration
    const initialConfigUI: ConfigurationUI[] = [
      { id: '1', collection: 'frame_colors', ui_type: 'color_picker', sort: 30 },
      { id: '2', collection: 'sizes', ui_type: 'preset_buttons', sort: 10 },
    ];

    const initialConfigs = buildOrderedComponentConfigs(initialConfigUI, mockProductOptions);
    expect(initialConfigs[0].collection).toBe('sizes'); // sort: 10
    expect(initialConfigs[1].collection).toBe('frame_colors'); // sort: 30

    // Updated configuration with different sort order
    const updatedConfigUI: ConfigurationUI[] = [
      { id: '1', collection: 'frame_colors', ui_type: 'color_picker', sort: 10 },
      { id: '2', collection: 'sizes', ui_type: 'preset_buttons', sort: 30 },
    ];

    const updatedConfigs = buildOrderedComponentConfigs(updatedConfigUI, mockProductOptions);
    expect(updatedConfigs[0].collection).toBe('frame_colors'); // sort: 10
    expect(updatedConfigs[1].collection).toBe('sizes'); // sort: 30
  });

  it('should handle product line changes without breaking sort order', () => {
    const productLineA = {
      id: 1,
      name: 'Product Line A',
      default_options: [
        { collection: 'frame_colors', item: 'BF' },
        { collection: 'mirror_styles', item: '01' },
        { collection: 'sizes', item: '2436' },
      ],
    };

    const productLineB = {
      id: 2,
      name: 'Product Line B',
      default_options: [
        { collection: 'mounting_options', item: 'W' },
        { collection: 'light_directions', item: 'd' },
      ],
    };

    const configsA = buildOrderedComponentConfigs(mockConfigurationUI, mockProductOptions, productLineA);
    const configsB = buildOrderedComponentConfigs(mockConfigurationUI, mockProductOptions, productLineB);

    // Product Line A should show frame_colors, mirror_styles, sizes in sort order
    expect(configsA.map(c => c.collection)).toEqual(['frame_colors', 'mirror_styles', 'sizes']);

    // Product Line B should show mounting_options, light_directions in sort order
    expect(configsB.map(c => c.collection)).toEqual(['mounting_options', 'light_directions']);
  });
});