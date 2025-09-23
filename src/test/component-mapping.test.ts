/**
 * Component Mapping System Tests
 * Tests for dynamic component rendering based on configuration_ui data
 */

import { describe, it, expect } from 'vitest';
import {
  mapConfigurationUIToComponent,
  sortConfigurationUIBySortField,
  filterAvailableCollections,
  buildOrderedComponentConfigs,
  validateComponentMappings,
  getSupportedUITypes,
  getMappedCollections,
  type ComponentConfig,
  type UIType,
} from '../utils/componentMapping';
import type { ConfigurationUI, ProductOptions } from '../store/types';

describe('Component Mapping System', () => {
  const mockConfigurationUI: ConfigurationUI[] = [
    { id: '1', collection: 'hanging_techniques', ui_type: 'button_grid', sort: 1 },
    { id: '2', collection: 'mirror_styles', ui_type: 'button_grid', sort: 2 },
    { id: '3', collection: 'frame_thicknesses', ui_type: 'button_grid', sort: 3 },
    { id: '4', collection: 'frame_colors', ui_type: 'color_picker', sort: 4 },
    { id: '5', collection: 'drivers', ui_type: 'button_grid', sort: 5 },
    { id: '6', collection: 'mounting_options', ui_type: 'button_grid', sort: 6 },
    { id: '7', collection: 'color_temperatures', ui_type: 'button_grid', sort: 7 },
    { id: '8', collection: 'light_directions', ui_type: 'button_grid', sort: 8 },
    { id: '9', collection: 'light_outputs', ui_type: 'button_grid', sort: 9 },
    { id: '10', collection: 'sizes', ui_type: 'preset_buttons', sort: 10 },
    { id: '11', collection: 'accessories', ui_type: 'single', sort: 11 },
  ];

  const mockProductOptions: ProductOptions = {
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
    configurationUI: mockConfigurationUI,
  };

  describe('mapConfigurationUIToComponent', () => {
    it('should map frame_colors collection to correct component config', () => {
      const configUI: ConfigurationUI = {
        id: '4',
        collection: 'frame_colors',
        ui_type: 'color_picker',
        sort: 4,
      };

      const result = mapConfigurationUIToComponent(configUI, mockProductOptions);

      expect(result).toEqual({
        collection: 'frame_colors',
        title: 'Frame Color',
        description: 'Choose from 1 available frame color options',
        type: 'grid',
        columns: 2,
        configKey: 'frameColor',
        optionsKey: 'frameColors',
      });
    });

    it('should map mirror_styles collection to correct component config', () => {
      const configUI: ConfigurationUI = {
        id: '2',
        collection: 'mirror_styles',
        ui_type: 'button_grid',
        sort: 2,
      };

      const result = mapConfigurationUIToComponent(configUI, mockProductOptions);

      expect(result).toEqual({
        collection: 'mirror_styles',
        title: 'Mirror Style',
        description: 'Choose from 1 available mirror style options',
        type: 'grid',
        columns: undefined,
        configKey: 'mirrorStyle',
        optionsKey: 'mirrorStyles',
      });
    });

    it('should map accessories collection to single type component', () => {
      const configUI: ConfigurationUI = {
        id: '11',
        collection: 'accessories',
        ui_type: 'single',
        sort: 11,
      };

      const result = mapConfigurationUIToComponent(configUI, mockProductOptions);

      expect(result).toEqual({
        collection: 'accessories',
        title: 'Accessories',
        description: 'Choose from 1 available accessories options',
        type: 'single',
        columns: undefined,
        configKey: 'accessories',
        optionsKey: 'accessoryOptions',
      });
    });

    it('should map sizes collection with preset_buttons UI type', () => {
      const configUI: ConfigurationUI = {
        id: '10',
        collection: 'sizes',
        ui_type: 'preset_buttons',
        sort: 10,
      };

      const result = mapConfigurationUIToComponent(configUI, mockProductOptions);

      expect(result).toEqual({
        collection: 'sizes',
        title: 'Size',
        description: 'Choose from 1 available size options',
        type: 'grid',
        columns: 2,
        configKey: 'width',
        optionsKey: 'sizes',
      });
    });

    it('should throw error for unsupported UI type', () => {
      const configUI: ConfigurationUI = {
        id: '99',
        collection: 'frame_colors',
        ui_type: 'unsupported_type' as any,
        sort: 1,
      };

      expect(() => mapConfigurationUIToComponent(configUI, mockProductOptions))
        .toThrow('Unsupported UI type: unsupported_type for collection: frame_colors');
    });

    it('should throw error for unmapped collection in options key', () => {
      const configUI: ConfigurationUI = {
        id: '99',
        collection: 'unknown_collection',
        ui_type: 'button_grid',
        sort: 1,
      };

      expect(() => mapConfigurationUIToComponent(configUI, mockProductOptions))
        .toThrow('No options key mapping found for collection: unknown_collection');
    });

    it('should throw error for unmapped collection in config key', () => {
      // This would happen if we had options mapping but no config mapping
      const configUI: ConfigurationUI = {
        id: '99',
        collection: 'unknown_collection',
        ui_type: 'button_grid',
        sort: 1,
      };

      expect(() => mapConfigurationUIToComponent(configUI, mockProductOptions))
        .toThrow('No options key mapping found for collection: unknown_collection');
    });

    it('should throw error for unmapped collection title', () => {
      // This would happen if we had other mappings but no title
      const configUI: ConfigurationUI = {
        id: '99',
        collection: 'unknown_collection',
        ui_type: 'button_grid',
        sort: 1,
      };

      expect(() => mapConfigurationUIToComponent(configUI, mockProductOptions))
        .toThrow('No options key mapping found for collection: unknown_collection');
    });
  });

  describe('sortConfigurationUIBySortField', () => {
    it('should sort configuration_ui records by sort field ascending', () => {
      const unsortedData = [
        { id: '5', collection: 'drivers', ui_type: 'button_grid', sort: 5 },
        { id: '1', collection: 'hanging_techniques', ui_type: 'button_grid', sort: 1 },
        { id: '11', collection: 'accessories', ui_type: 'single', sort: 11 },
        { id: '2', collection: 'mirror_styles', ui_type: 'button_grid', sort: 2 },
      ];

      const result = sortConfigurationUIBySortField(unsortedData);

      expect(result[0].sort).toBe(1);
      expect(result[1].sort).toBe(2);
      expect(result[2].sort).toBe(5);
      expect(result[3].sort).toBe(11);
      expect(result.map(r => r.collection)).toEqual([
        'hanging_techniques',
        'mirror_styles',
        'drivers',
        'accessories'
      ]);
    });

    it('should use id as tiebreaker when sort values are equal', () => {
      const dataWithEqualSorts = [
        { id: 'z', collection: 'collection_z', ui_type: 'button_grid', sort: 5 },
        { id: 'a', collection: 'collection_a', ui_type: 'button_grid', sort: 5 },
        { id: 'm', collection: 'collection_m', ui_type: 'button_grid', sort: 5 },
      ];

      const result = sortConfigurationUIBySortField(dataWithEqualSorts);

      expect(result[0].id).toBe('a');
      expect(result[1].id).toBe('m');
      expect(result[2].id).toBe('z');
    });
  });

  describe('filterAvailableCollections', () => {
    it('should filter to only collections with available options', () => {
      const productOptionsPartial: ProductOptions = {
        mirrorControls: [],
        frameColors: [{ id: 1, name: 'Black', sku_code: 'BF' }], // Has options
        frameThickness: [], // No options
        mirrorStyles: [{ id: 1, name: 'Full Frame', sku_code: '01' }], // Has options
        mountingOptions: [], // No options
        lightingOptions: [{ id: 1, name: 'Direct', sku_code: 'D' }], // Has options
        colorTemperatures: [],
        lightOutputs: [],
        drivers: [],
        accessoryOptions: [],
        sizes: [],
      };

      const testConfigUI = [
        { id: '4', collection: 'frame_colors', ui_type: 'color_picker', sort: 4 },
        { id: '3', collection: 'frame_thicknesses', ui_type: 'button_grid', sort: 3 },
        { id: '2', collection: 'mirror_styles', ui_type: 'button_grid', sort: 2 },
        { id: '6', collection: 'mounting_options', ui_type: 'button_grid', sort: 6 },
        { id: '1', collection: 'hanging_techniques', ui_type: 'button_grid', sort: 1 },
      ];

      const result = filterAvailableCollections(testConfigUI, productOptionsPartial);

      expect(result).toHaveLength(3);
      expect(result.map(r => r.collection)).toEqual([
        'frame_colors',
        'mirror_styles',
        'hanging_techniques'
      ]);
      expect(result.map(r => r.collection)).not.toContain('frame_thicknesses');
      expect(result.map(r => r.collection)).not.toContain('mounting_options');
    });

    it('should maintain original order when filtering', () => {
      const productOptionsPartial: ProductOptions = {
        mirrorControls: [],
        frameColors: [{ id: 1, name: 'Black', sku_code: 'BF' }],
        frameThickness: [],
        mirrorStyles: [{ id: 1, name: 'Full Frame', sku_code: '01' }],
        mountingOptions: [],
        lightingOptions: [],
        colorTemperatures: [],
        lightOutputs: [],
        drivers: [{ id: 1, name: 'Voltage', sku_code: 'V' }],
        accessoryOptions: [],
        sizes: [],
      };

      const testConfigUI = [
        { id: '2', collection: 'mirror_styles', ui_type: 'button_grid', sort: 2 },
        { id: '3', collection: 'frame_thicknesses', ui_type: 'button_grid', sort: 3 }, // Will be filtered
        { id: '4', collection: 'frame_colors', ui_type: 'color_picker', sort: 4 },
        { id: '5', collection: 'drivers', ui_type: 'button_grid', sort: 5 },
        { id: '6', collection: 'mounting_options', ui_type: 'button_grid', sort: 6 }, // Will be filtered
      ];

      const result = filterAvailableCollections(testConfigUI, productOptionsPartial);

      // Should maintain order: mirror_styles, frame_colors, drivers
      expect(result.map(r => r.collection)).toEqual(['mirror_styles', 'frame_colors', 'drivers']);
      expect(result[0].sort).toBe(2);
      expect(result[1].sort).toBe(4);
      expect(result[2].sort).toBe(5);
    });

    it('should return empty array when no collections have options', () => {
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
  });

  describe('buildOrderedComponentConfigs', () => {
    it('should build ordered component configurations', () => {
      const testConfigUI = [
        { id: '5', collection: 'drivers', ui_type: 'button_grid', sort: 5 },
        { id: '2', collection: 'mirror_styles', ui_type: 'button_grid', sort: 2 },
        { id: '4', collection: 'frame_colors', ui_type: 'color_picker', sort: 4 },
        { id: '11', collection: 'accessories', ui_type: 'single', sort: 11 },
      ];

      const result = buildOrderedComponentConfigs(testConfigUI, mockProductOptions);

      expect(result).toHaveLength(4);
      expect(result[0].collection).toBe('mirror_styles');
      expect(result[1].collection).toBe('frame_colors');
      expect(result[2].collection).toBe('drivers');
      expect(result[3].collection).toBe('accessories');

      // Verify each component config has correct properties
      expect(result[0].title).toBe('Mirror Style');
      expect(result[1].title).toBe('Frame Color');
      expect(result[2].title).toBe('Drivers');
      expect(result[3].title).toBe('Accessories');
    });

    it('should filter out collections without options and maintain order', () => {
      const partialProductOptions: ProductOptions = {
        mirrorControls: [],
        frameColors: [{ id: 1, name: 'Black', sku_code: 'BF' }],
        frameThickness: [],
        mirrorStyles: [{ id: 1, name: 'Full Frame', sku_code: '01' }],
        mountingOptions: [],
        lightingOptions: [],
        colorTemperatures: [],
        lightOutputs: [],
        drivers: [],
        accessoryOptions: [],
        sizes: [],
      };

      const testConfigUI = [
        { id: '5', collection: 'drivers', ui_type: 'button_grid', sort: 5 }, // Will be filtered
        { id: '2', collection: 'mirror_styles', ui_type: 'button_grid', sort: 2 },
        { id: '4', collection: 'frame_colors', ui_type: 'color_picker', sort: 4 },
        { id: '11', collection: 'accessories', ui_type: 'single', sort: 11 }, // Will be filtered
      ];

      const result = buildOrderedComponentConfigs(testConfigUI, partialProductOptions);

      expect(result).toHaveLength(2);
      expect(result[0].collection).toBe('mirror_styles');
      expect(result[1].collection).toBe('frame_colors');
    });
  });

  describe('validateComponentMappings', () => {
    it('should validate correct configuration_ui mappings', () => {
      const validConfigUI = [
        { id: '2', collection: 'mirror_styles', ui_type: 'button_grid', sort: 2 },
        { id: '4', collection: 'frame_colors', ui_type: 'color_picker', sort: 4 },
        { id: '11', collection: 'accessories', ui_type: 'single', sort: 11 },
      ];

      const result = validateComponentMappings(validConfigUI);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should detect unsupported UI types', () => {
      const invalidUITypeConfigUI = [
        { id: '1', collection: 'frame_colors', ui_type: 'unknown_type', sort: 1 },
        { id: '2', collection: 'mirror_styles', ui_type: 'another_unknown', sort: 2 },
      ];

      const result = validateComponentMappings(invalidUITypeConfigUI);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Unsupported UI type: unknown_type for collection: frame_colors');
      expect(result.errors).toContain('Unsupported UI type: another_unknown for collection: mirror_styles');
    });

    it('should detect missing collection mappings', () => {
      const unmappedCollectionConfigUI = [
        { id: '1', collection: 'unknown_collection_1', ui_type: 'button_grid', sort: 1 },
        { id: '2', collection: 'unknown_collection_2', ui_type: 'single', sort: 2 },
      ];

      const result = validateComponentMappings(unmappedCollectionConfigUI);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Missing options key mapping for collection: unknown_collection_1');
      expect(result.errors).toContain('Missing config key mapping for collection: unknown_collection_1');
      expect(result.errors).toContain('Missing title mapping for collection: unknown_collection_1');
      expect(result.errors).toContain('Missing options key mapping for collection: unknown_collection_2');
      expect(result.errors).toContain('Missing config key mapping for collection: unknown_collection_2');
      expect(result.errors).toContain('Missing title mapping for collection: unknown_collection_2');
    });
  });

  describe('getSupportedUITypes', () => {
    it('should return all supported UI types', () => {
      const supportedTypes = getSupportedUITypes();

      expect(supportedTypes).toEqual(['button_grid', 'color_picker', 'preset_buttons', 'single']);
      expect(supportedTypes).toHaveLength(4);
    });
  });

  describe('getMappedCollections', () => {
    it('should return all mapped collections', () => {
      const mappedCollections = getMappedCollections();

      expect(mappedCollections).toContain('hanging_techniques');
      expect(mappedCollections).toContain('mirror_styles');
      expect(mappedCollections).toContain('frame_thicknesses');
      expect(mappedCollections).toContain('frame_colors');
      expect(mappedCollections).toContain('drivers');
      expect(mappedCollections).toContain('mounting_options');
      expect(mappedCollections).toContain('color_temperatures');
      expect(mappedCollections).toContain('light_directions');
      expect(mappedCollections).toContain('light_outputs');
      expect(mappedCollections).toContain('sizes');
      expect(mappedCollections).toContain('accessories');
      expect(mappedCollections).toHaveLength(11);
    });
  });
});