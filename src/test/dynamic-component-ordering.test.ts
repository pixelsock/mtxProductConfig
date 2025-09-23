/**
 * Dynamic Component Ordering Tests
 * Tests for component ordering based on configuration_ui.sort field with no fallback logic
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Types for dynamic component ordering
interface ConfigurationUIRecord {
  id: string;
  collection: string;
  ui_type: string;
  sort: number;
}

interface ComponentOrderingResult {
  orderedCollections: string[];
  componentMappings: Array<{
    collection: string;
    ui_type: string;
    sort: number;
  }>;
}

interface ProductOptionsWithUI {
  frameColors: any[];
  frameThickness: any[];
  mirrorStyles: any[];
  mountingOptions: any[];
  lightingOptions: any[];
  colorTemperatures: any[];
  lightOutputs: any[];
  drivers: any[];
  accessoryOptions: any[];
  sizes: any[];
  configurationUI?: ConfigurationUIRecord[];
}

describe('Dynamic Component Ordering', () => {
  let mockConfigurationUI: ConfigurationUIRecord[];
  let mockProductOptions: ProductOptionsWithUI;

  beforeEach(() => {
    // Mock configuration_ui data based on current database structure
    mockConfigurationUI = [
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

    // Mock product options with some collections having data, others empty
    mockProductOptions = {
      frameColors: [{ id: 1, name: 'Black' }],
      frameThickness: [{ id: 1, name: 'Wide' }],
      mirrorStyles: [{ id: 1, name: 'Full Frame' }],
      mountingOptions: [{ id: 1, name: 'Wall Mount' }],
      lightingOptions: [{ id: 1, name: 'Direct' }],
      colorTemperatures: [{ id: 1, name: '2700K' }],
      lightOutputs: [{ id: 1, name: 'Standard' }],
      drivers: [{ id: 1, name: 'Voltage' }],
      accessoryOptions: [{ id: 1, name: 'Night Light' }],
      sizes: [{ id: 1, name: '24x36' }],
      configurationUI: mockConfigurationUI,
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('sortConfigurationUIBySortField', () => {
    it('should sort configuration_ui records by sort field ascending', () => {
      const unsortedData = [
        { id: '3', collection: 'frame_thicknesses', ui_type: 'button_grid', sort: 3 },
        { id: '1', collection: 'hanging_techniques', ui_type: 'button_grid', sort: 1 },
        { id: '11', collection: 'accessories', ui_type: 'single', sort: 11 },
        { id: '2', collection: 'mirror_styles', ui_type: 'button_grid', sort: 2 },
      ];

      const sortConfigurationUIBySortField = (records: ConfigurationUIRecord[]): ConfigurationUIRecord[] => {
        return [...records].sort((a, b) => {
          if (a.sort !== b.sort) {
            return a.sort - b.sort;
          }
          return a.id.localeCompare(b.id);
        });
      };

      const result = sortConfigurationUIBySortField(unsortedData);

      expect(result[0].sort).toBe(1);
      expect(result[1].sort).toBe(2);
      expect(result[2].sort).toBe(3);
      expect(result[3].sort).toBe(11);
      expect(result.map(r => r.collection)).toEqual([
        'hanging_techniques',
        'mirror_styles',
        'frame_thicknesses',
        'accessories'
      ]);
    });

    it('should use id as tiebreaker when sort values are equal', () => {
      const dataWithEqualSorts = [
        { id: 'z', collection: 'collection_z', ui_type: 'button_grid', sort: 5 },
        { id: 'a', collection: 'collection_a', ui_type: 'button_grid', sort: 5 },
        { id: 'm', collection: 'collection_m', ui_type: 'button_grid', sort: 5 },
      ];

      const sortConfigurationUIBySortField = (records: ConfigurationUIRecord[]): ConfigurationUIRecord[] => {
        return [...records].sort((a, b) => {
          if (a.sort !== b.sort) {
            return a.sort - b.sort;
          }
          return a.id.localeCompare(b.id);
        });
      };

      const result = sortConfigurationUIBySortField(dataWithEqualSorts);

      expect(result[0].id).toBe('a');
      expect(result[1].id).toBe('m');
      expect(result[2].id).toBe('z');
    });

    it('should preserve original array and return new sorted array', () => {
      const originalData = [
        { id: '3', collection: 'frame_thicknesses', ui_type: 'button_grid', sort: 3 },
        { id: '1', collection: 'hanging_techniques', ui_type: 'button_grid', sort: 1 },
      ];

      const sortConfigurationUIBySortField = (records: ConfigurationUIRecord[]): ConfigurationUIRecord[] => {
        return [...records].sort((a, b) => {
          if (a.sort !== b.sort) {
            return a.sort - b.sort;
          }
          return a.id.localeCompare(b.id);
        });
      };

      const result = sortConfigurationUIBySortField(originalData);

      // Original array should be unchanged
      expect(originalData[0].sort).toBe(3);
      expect(originalData[1].sort).toBe(1);

      // Result should be sorted
      expect(result[0].sort).toBe(1);
      expect(result[1].sort).toBe(3);

      // Should be different arrays
      expect(result).not.toBe(originalData);
    });
  });

  describe('filterAvailableCollections', () => {
    it('should filter to only collections that have available options', () => {
      const productOptionsWithSomeEmpty = {
        frameColors: [{ id: 1, name: 'Black' }], // Has options
        frameThickness: [{ id: 1, name: 'Wide' }], // Has options
        mirrorStyles: [], // No options
        mountingOptions: [{ id: 1, name: 'Wall Mount' }], // Has options
        lightingOptions: [], // No options
        colorTemperatures: [],
        lightOutputs: [],
        drivers: [],
        accessoryOptions: [{ id: 1, name: 'Night Light' }], // Has options
        sizes: [],
      };

      const collectionMapping: Record<string, keyof typeof productOptionsWithSomeEmpty> = {
        'frame_colors': 'frameColors',
        'frame_thicknesses': 'frameThickness',
        'mirror_styles': 'mirrorStyles',
        'mounting_options': 'mountingOptions',
        'light_directions': 'lightingOptions',
        'accessories': 'accessoryOptions',
      };

      const filterAvailableCollections = (
        configUI: ConfigurationUIRecord[],
        productOptions: any
      ): ConfigurationUIRecord[] => {
        return configUI.filter(config => {
          const optionKey = collectionMapping[config.collection];
          const options = optionKey ? productOptions[optionKey] : null;
          return options && Array.isArray(options) && options.length > 0;
        });
      };

      const testConfigUI = [
        { id: '1', collection: 'frame_colors', ui_type: 'color_picker', sort: 4 },
        { id: '2', collection: 'frame_thicknesses', ui_type: 'button_grid', sort: 3 },
        { id: '3', collection: 'mirror_styles', ui_type: 'button_grid', sort: 2 },
        { id: '4', collection: 'mounting_options', ui_type: 'button_grid', sort: 6 },
        { id: '5', collection: 'light_directions', ui_type: 'button_grid', sort: 8 },
        { id: '6', collection: 'accessories', ui_type: 'single', sort: 11 },
      ];

      const result = filterAvailableCollections(testConfigUI, productOptionsWithSomeEmpty);

      expect(result).toHaveLength(4);
      expect(result.map(r => r.collection)).toEqual([
        'frame_colors',
        'frame_thicknesses',
        'mounting_options',
        'accessories'
      ]);
      expect(result.map(r => r.collection)).not.toContain('mirror_styles');
      expect(result.map(r => r.collection)).not.toContain('light_directions');
    });

    it('should maintain sort order after filtering', () => {
      const productOptionsPartial = {
        frameColors: [{ id: 1, name: 'Black' }],
        frameThickness: [],
        mirrorStyles: [{ id: 1, name: 'Full Frame' }],
        mountingOptions: [],
        lightingOptions: [],
        colorTemperatures: [],
        lightOutputs: [],
        drivers: [{ id: 1, name: 'Voltage' }],
        accessoryOptions: [],
        sizes: [],
      };

      const collectionMapping: Record<string, keyof typeof productOptionsPartial> = {
        'frame_colors': 'frameColors',
        'frame_thicknesses': 'frameThickness',
        'mirror_styles': 'mirrorStyles',
        'mounting_options': 'mountingOptions',
        'drivers': 'drivers',
      };

      const filterAvailableCollections = (
        configUI: ConfigurationUIRecord[],
        productOptions: any
      ): ConfigurationUIRecord[] => {
        return configUI.filter(config => {
          const optionKey = collectionMapping[config.collection];
          const options = optionKey ? productOptions[optionKey] : null;
          return options && Array.isArray(options) && options.length > 0;
        });
      };

      const testConfigUI = [
        { id: '2', collection: 'mirror_styles', ui_type: 'button_grid', sort: 2 },
        { id: '3', collection: 'frame_thicknesses', ui_type: 'button_grid', sort: 3 }, // Will be filtered
        { id: '4', collection: 'frame_colors', ui_type: 'color_picker', sort: 4 },
        { id: '5', collection: 'drivers', ui_type: 'button_grid', sort: 5 },
        { id: '6', collection: 'mounting_options', ui_type: 'button_grid', sort: 6 }, // Will be filtered
      ];

      const result = filterAvailableCollections(testConfigUI, productOptionsPartial);

      // Should maintain original sort order: 2, 4, 5
      expect(result[0].sort).toBe(2); // mirror_styles
      expect(result[1].sort).toBe(4); // frame_colors
      expect(result[2].sort).toBe(5); // drivers
      expect(result.map(r => r.collection)).toEqual(['mirror_styles', 'frame_colors', 'drivers']);
    });

    it('should return empty array when no collections have options', () => {
      const emptyProductOptions = {
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

      const collectionMapping: Record<string, keyof typeof emptyProductOptions> = {
        'frame_colors': 'frameColors',
        'frame_thicknesses': 'frameThickness',
        'mirror_styles': 'mirrorStyles',
      };

      const filterAvailableCollections = (
        configUI: ConfigurationUIRecord[],
        productOptions: any
      ): ConfigurationUIRecord[] => {
        return configUI.filter(config => {
          const optionKey = collectionMapping[config.collection];
          const options = optionKey ? productOptions[optionKey] : null;
          return options && Array.isArray(options) && options.length > 0;
        });
      };

      const testConfigUI = [
        { id: '1', collection: 'frame_colors', ui_type: 'color_picker', sort: 4 },
        { id: '2', collection: 'frame_thicknesses', ui_type: 'button_grid', sort: 3 },
        { id: '3', collection: 'mirror_styles', ui_type: 'button_grid', sort: 2 },
      ];

      const result = filterAvailableCollections(testConfigUI, emptyProductOptions);

      expect(result).toEqual([]);
    });
  });

  describe('buildComponentOrderingResult', () => {
    it('should create properly ordered component mapping from configuration_ui data', () => {
      const buildComponentOrderingResult = (
        configUI: ConfigurationUIRecord[],
        productOptions: any
      ): ComponentOrderingResult => {
        const collectionMapping: Record<string, string> = {
          'frame_colors': 'frameColors',
          'frame_thicknesses': 'frameThickness',
          'mirror_styles': 'mirrorStyles',
          'mounting_options': 'mountingOptions',
          'light_directions': 'lightingOptions',
          'color_temperatures': 'colorTemperatures',
          'light_outputs': 'lightOutputs',
          'drivers': 'drivers',
          'accessories': 'accessoryOptions',
          'sizes': 'sizes',
        };

        // Sort by sort field
        const sortedConfigUI = [...configUI].sort((a, b) => {
          if (a.sort !== b.sort) {
            return a.sort - b.sort;
          }
          return a.id.localeCompare(b.id);
        });

        // Filter to only available collections
        const availableConfigUI = sortedConfigUI.filter(config => {
          const optionKey = collectionMapping[config.collection];
          const options = optionKey ? productOptions[optionKey] : null;
          return options && Array.isArray(options) && options.length > 0;
        });

        return {
          orderedCollections: availableConfigUI.map(config => config.collection),
          componentMappings: availableConfigUI.map(config => ({
            collection: config.collection,
            ui_type: config.ui_type,
            sort: config.sort,
          })),
        };
      };

      const testConfigUI = [
        { id: '5', collection: 'drivers', ui_type: 'button_grid', sort: 5 },
        { id: '2', collection: 'mirror_styles', ui_type: 'button_grid', sort: 2 },
        { id: '4', collection: 'frame_colors', ui_type: 'color_picker', sort: 4 },
        { id: '1', collection: 'hanging_techniques', ui_type: 'button_grid', sort: 1 },
      ];

      const testProductOptions = {
        frameColors: [{ id: 1, name: 'Black' }],
        frameThickness: [],
        mirrorStyles: [{ id: 1, name: 'Full Frame' }],
        mountingOptions: [],
        lightingOptions: [],
        colorTemperatures: [],
        lightOutputs: [],
        drivers: [{ id: 1, name: 'Voltage' }],
        accessoryOptions: [],
        sizes: [],
      };

      const result = buildComponentOrderingResult(testConfigUI, testProductOptions);

      expect(result.orderedCollections).toEqual([
        'mirror_styles',
        'frame_colors',
        'drivers'
      ]);

      expect(result.componentMappings).toEqual([
        { collection: 'mirror_styles', ui_type: 'button_grid', sort: 2 },
        { collection: 'frame_colors', ui_type: 'color_picker', sort: 4 },
        { collection: 'drivers', ui_type: 'button_grid', sort: 5 },
      ]);
    });

    it('should handle empty configuration_ui gracefully', () => {
      const buildComponentOrderingResult = (
        configUI: ConfigurationUIRecord[],
        productOptions: any
      ): ComponentOrderingResult => {
        return {
          orderedCollections: [],
          componentMappings: [],
        };
      };

      const result = buildComponentOrderingResult([], mockProductOptions);

      expect(result.orderedCollections).toEqual([]);
      expect(result.componentMappings).toEqual([]);
    });
  });

  describe('validateComponentOrderingIntegrity', () => {
    it('should validate that all UI types are supported', () => {
      const supportedUITypes = [
        'button_grid',
        'color_picker',
        'preset_buttons',
        'single',
      ];

      const validateComponentOrderingIntegrity = (
        configUI: ConfigurationUIRecord[],
        supportedUITypes: string[]
      ): { isValid: boolean; unsupportedTypes: string[] } => {
        const unsupportedTypes = configUI
          .map(config => config.ui_type)
          .filter(uiType => !supportedUITypes.includes(uiType));

        return {
          isValid: unsupportedTypes.length === 0,
          unsupportedTypes: [...new Set(unsupportedTypes)],
        };
      };

      const validConfigUI = [
        { id: '1', collection: 'frame_colors', ui_type: 'color_picker', sort: 4 },
        { id: '2', collection: 'mirror_styles', ui_type: 'button_grid', sort: 2 },
        { id: '3', collection: 'sizes', ui_type: 'preset_buttons', sort: 10 },
        { id: '4', collection: 'accessories', ui_type: 'single', sort: 11 },
      ];

      const invalidConfigUI = [
        { id: '1', collection: 'frame_colors', ui_type: 'color_picker', sort: 4 },
        { id: '2', collection: 'mirror_styles', ui_type: 'unknown_type', sort: 2 },
        { id: '3', collection: 'drivers', ui_type: 'unsupported_widget', sort: 5 },
      ];

      const validResult = validateComponentOrderingIntegrity(validConfigUI, supportedUITypes);
      expect(validResult.isValid).toBe(true);
      expect(validResult.unsupportedTypes).toEqual([]);

      const invalidResult = validateComponentOrderingIntegrity(invalidConfigUI, supportedUITypes);
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.unsupportedTypes).toEqual(['unknown_type', 'unsupported_widget']);
    });

    it('should detect duplicate sort values', () => {
      const validateSortUniqueness = (
        configUI: ConfigurationUIRecord[]
      ): { isValid: boolean; duplicateSorts: number[] } => {
        const sortCounts = new Map<number, number>();

        configUI.forEach(config => {
          sortCounts.set(config.sort, (sortCounts.get(config.sort) || 0) + 1);
        });

        const duplicateSorts = Array.from(sortCounts.entries())
          .filter(([sort, count]) => count > 1)
          .map(([sort]) => sort);

        return {
          isValid: duplicateSorts.length === 0,
          duplicateSorts,
        };
      };

      const uniqueSortsConfigUI = [
        { id: '1', collection: 'frame_colors', ui_type: 'color_picker', sort: 4 },
        { id: '2', collection: 'mirror_styles', ui_type: 'button_grid', sort: 2 },
        { id: '3', collection: 'sizes', ui_type: 'preset_buttons', sort: 10 },
      ];

      const duplicateSortsConfigUI = [
        { id: '1', collection: 'frame_colors', ui_type: 'color_picker', sort: 4 },
        { id: '2', collection: 'mirror_styles', ui_type: 'button_grid', sort: 4 },
        { id: '3', collection: 'sizes', ui_type: 'preset_buttons', sort: 10 },
        { id: '4', collection: 'drivers', ui_type: 'button_grid', sort: 10 },
      ];

      const uniqueResult = validateSortUniqueness(uniqueSortsConfigUI);
      expect(uniqueResult.isValid).toBe(true);
      expect(uniqueResult.duplicateSorts).toEqual([]);

      const duplicateResult = validateSortUniqueness(duplicateSortsConfigUI);
      expect(duplicateResult.isValid).toBe(false);
      expect(duplicateResult.duplicateSorts).toEqual([4, 10]);
    });
  });
});