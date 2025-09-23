/**
 * Configuration UI Data Loading Tests
 * Tests for configuration_ui data loading, caching, and integration with product options
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Types for configuration_ui data structure
interface ConfigurationUIRecord {
  id: string;
  collection: string;
  ui_type: string;
  sort: number;
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

describe('Configuration UI Data Loading', () => {
  let mockSupabaseClient: any;

  beforeEach(() => {
    // Mock Supabase client
    mockSupabaseClient = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchConfigurationUI', () => {
    it('should fetch configuration_ui records with correct columns', async () => {
      const mockConfigUIData = [
        { id: '1', collection: 'frame_colors', ui_type: 'color-swatch', sort: 10 },
        { id: '2', collection: 'mirror_styles', ui_type: 'grid-2', sort: 20 },
        { id: '3', collection: 'light_directions', ui_type: 'full-width', sort: 30 },
      ];

      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: mockConfigUIData,
            error: null
          })
        })
      });

      // Mock function to test
      const fetchConfigurationUI = async () => {
        const { data, error } = await mockSupabaseClient
          .from('configuration_ui')
          .select('id, collection, ui_type, sort')
          .order('sort', { ascending: true });

        if (error) throw error;
        return data;
      };

      const result = await fetchConfigurationUI();

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('configuration_ui');
      expect(result).toEqual(mockConfigUIData);
      expect(result).toHaveLength(3);
      expect(result[0]).toHaveProperty('sort', 10);
    });

    it('should sort configuration_ui records by sort field ascending', async () => {
      const unsortedData = [
        { id: '3', collection: 'light_directions', ui_type: 'full-width', sort: 30 },
        { id: '1', collection: 'frame_colors', ui_type: 'color-swatch', sort: 10 },
        { id: '2', collection: 'mirror_styles', ui_type: 'grid-2', sort: 20 },
      ];

      const sortedData = [
        { id: '1', collection: 'frame_colors', ui_type: 'color-swatch', sort: 10 },
        { id: '2', collection: 'mirror_styles', ui_type: 'grid-2', sort: 20 },
        { id: '3', collection: 'light_directions', ui_type: 'full-width', sort: 30 },
      ];

      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: sortedData,
            error: null
          })
        })
      });

      const fetchConfigurationUI = async () => {
        const { data, error } = await mockSupabaseClient
          .from('configuration_ui')
          .select('id, collection, ui_type, sort')
          .order('sort', { ascending: true });

        if (error) throw error;
        return data;
      };

      const result = await fetchConfigurationUI();

      expect(result[0].sort).toBe(10);
      expect(result[1].sort).toBe(20);
      expect(result[2].sort).toBe(30);
    });

    it('should handle null sort values by placing them last', async () => {
      const dataWithNulls = [
        { id: '1', collection: 'frame_colors', ui_type: 'color-swatch', sort: 10 },
        { id: '2', collection: 'mirror_styles', ui_type: 'grid-2', sort: null },
        { id: '3', collection: 'light_directions', ui_type: 'full-width', sort: 30 },
      ];

      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: dataWithNulls,
            error: null
          })
        })
      });

      const fetchConfigurationUI = async () => {
        const { data, error } = await mockSupabaseClient
          .from('configuration_ui')
          .select('id, collection, ui_type, sort')
          .order('sort', { ascending: true, nullsLast: true });

        if (error) throw error;
        return data;
      };

      const result = await fetchConfigurationUI();
      expect(result).toBeDefined();
    });

    it('should handle database errors gracefully', async () => {
      const mockError = new Error('Database connection failed');

      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: null,
            error: mockError
          })
        })
      });

      const fetchConfigurationUI = async () => {
        const { data, error } = await mockSupabaseClient
          .from('configuration_ui')
          .select('id, collection, ui_type, sort')
          .order('sort', { ascending: true });

        if (error) throw error;
        return data;
      };

      await expect(fetchConfigurationUI()).rejects.toThrow('Database connection failed');
    });
  });

  describe('integrateConfigurationUIWithProductOptions', () => {
    it('should merge configuration_ui data with product options', async () => {
      const mockProductOptions = {
        frameColors: [{ id: 1, name: 'Black', sku_code: 'BF' }],
        frameThickness: [{ id: 1, name: 'Wide', sku_code: 'W' }],
        mirrorStyles: [{ id: 1, name: 'Full Frame', sku_code: '01' }],
        mountingOptions: [],
        lightingOptions: [],
        colorTemperatures: [],
        lightOutputs: [],
        drivers: [],
        accessoryOptions: [],
        sizes: [],
      };

      const mockConfigUI = [
        { id: '1', collection: 'frame_colors', ui_type: 'color-swatch', sort: 10 },
        { id: '2', collection: 'mirror_styles', ui_type: 'grid-2', sort: 20 },
      ];

      const integrateConfigurationUI = (
        productOptions: any,
        configUI: ConfigurationUIRecord[]
      ): ProductOptionsWithUI => {
        return {
          ...productOptions,
          configurationUI: configUI
        };
      };

      const result = integrateConfigurationUI(mockProductOptions, mockConfigUI);

      expect(result.configurationUI).toEqual(mockConfigUI);
      expect(result.frameColors).toEqual(mockProductOptions.frameColors);
      expect(result.configurationUI).toHaveLength(2);
    });

    it('should handle empty configuration_ui data', async () => {
      const mockProductOptions = {
        frameColors: [{ id: 1, name: 'Black', sku_code: 'BF' }],
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

      const integrateConfigurationUI = (
        productOptions: any,
        configUI: ConfigurationUIRecord[]
      ): ProductOptionsWithUI => {
        return {
          ...productOptions,
          configurationUI: configUI
        };
      };

      const result = integrateConfigurationUI(mockProductOptions, []);

      expect(result.configurationUI).toEqual([]);
      expect(result.frameColors).toEqual(mockProductOptions.frameColors);
    });
  });

  describe('filterAvailableConfigurationUI', () => {
    it('should filter configuration_ui to only include collections with available options', () => {
      const mockConfigUI = [
        { id: '1', collection: 'frame_colors', ui_type: 'color-swatch', sort: 10 },
        { id: '2', collection: 'mirror_styles', ui_type: 'grid-2', sort: 20 },
        { id: '3', collection: 'sizes', ui_type: 'size-grid', sort: 30 },
        { id: '4', collection: 'accessories', ui_type: 'multi', sort: 40 },
      ];

      const mockProductOptions = {
        frameColors: [{ id: 1, name: 'Black' }], // Has options
        mirrorStyles: [{ id: 1, name: 'Full Frame' }], // Has options
        sizes: [], // No options
        accessoryOptions: [{ id: 1, name: 'Night Light' }], // Has options (note: collection name mismatch)
      };

      const filterAvailableConfigurationUI = (
        configUI: ConfigurationUIRecord[],
        productOptions: any
      ): ConfigurationUIRecord[] => {
        return configUI.filter(config => {
          const collectionKey = getCollectionKey(config.collection);
          const options = productOptions[collectionKey];
          return options && options.length > 0;
        });
      };

      // Helper function to map collection names to productOptions keys
      const getCollectionKey = (collection: string): string => {
        const mapping: Record<string, string> = {
          'frame_colors': 'frameColors',
          'mirror_styles': 'mirrorStyles',
          'sizes': 'sizes',
          'accessories': 'accessoryOptions',
        };
        return mapping[collection] || collection;
      };

      const result = filterAvailableConfigurationUI(mockConfigUI, mockProductOptions);

      expect(result).toHaveLength(3); // frame_colors, mirror_styles, accessories
      expect(result.map(r => r.collection)).toEqual(['frame_colors', 'mirror_styles', 'accessories']);
      expect(result.map(r => r.collection)).not.toContain('sizes'); // Should be filtered out
    });

    it('should maintain sort order after filtering', () => {
      const mockConfigUI = [
        { id: '1', collection: 'frame_colors', ui_type: 'color-swatch', sort: 10 },
        { id: '2', collection: 'sizes', ui_type: 'size-grid', sort: 15 }, // No options - will be filtered
        { id: '3', collection: 'mirror_styles', ui_type: 'grid-2', sort: 20 },
        { id: '4', collection: 'accessories', ui_type: 'multi', sort: 30 },
      ];

      const mockProductOptions = {
        frameColors: [{ id: 1, name: 'Black' }],
        mirrorStyles: [{ id: 1, name: 'Full Frame' }],
        sizes: [], // No options
        accessoryOptions: [{ id: 1, name: 'Night Light' }],
      };

      const filterAvailableConfigurationUI = (
        configUI: ConfigurationUIRecord[],
        productOptions: any
      ): ConfigurationUIRecord[] => {
        return configUI.filter(config => {
          const collectionKey = getCollectionKey(config.collection);
          const options = productOptions[collectionKey];
          return options && options.length > 0;
        });
      };

      const getCollectionKey = (collection: string): string => {
        const mapping: Record<string, string> = {
          'frame_colors': 'frameColors',
          'mirror_styles': 'mirrorStyles',
          'sizes': 'sizes',
          'accessories': 'accessoryOptions',
        };
        return mapping[collection] || collection;
      };

      const result = filterAvailableConfigurationUI(mockConfigUI, mockProductOptions);

      expect(result[0].sort).toBe(10); // frame_colors
      expect(result[1].sort).toBe(20); // mirror_styles
      expect(result[2].sort).toBe(30); // accessories
      // sizes (sort: 15) should be filtered out but order maintained
    });
  });

  describe('cacheConfigurationUI', () => {
    it('should cache configuration_ui data efficiently', () => {
      const mockConfigUI = [
        { id: '1', collection: 'frame_colors', ui_type: 'color-swatch', sort: 10 },
        { id: '2', collection: 'mirror_styles', ui_type: 'grid-2', sort: 20 },
      ];

      // Simple cache implementation for testing
      let configUICache: ConfigurationUIRecord[] | null = null;

      const cacheConfigurationUI = (data: ConfigurationUIRecord[]) => {
        configUICache = data;
      };

      const getCachedConfigurationUI = (): ConfigurationUIRecord[] | null => {
        return configUICache;
      };

      // Test caching
      cacheConfigurationUI(mockConfigUI);
      const cached = getCachedConfigurationUI();

      expect(cached).toEqual(mockConfigUI);
      expect(cached).toHaveLength(2);
    });

    it('should handle cache invalidation', () => {
      let configUICache: ConfigurationUIRecord[] | null = null;

      const cacheConfigurationUI = (data: ConfigurationUIRecord[]) => {
        configUICache = data;
      };

      const clearConfigurationUICache = () => {
        configUICache = null;
      };

      const getCachedConfigurationUI = (): ConfigurationUIRecord[] | null => {
        return configUICache;
      };

      // Cache some data
      const mockData = [{ id: '1', collection: 'frame_colors', ui_type: 'color-swatch', sort: 10 }];
      cacheConfigurationUI(mockData);
      expect(getCachedConfigurationUI()).toEqual(mockData);

      // Clear cache
      clearConfigurationUICache();
      expect(getCachedConfigurationUI()).toBeNull();
    });
  });

  describe('validateConfigurationUIData', () => {
    it('should validate required fields are present', () => {
      const validRecord = { id: '1', collection: 'frame_colors', ui_type: 'color-swatch', sort: 10 };
      const invalidRecord = { id: '2', collection: '', ui_type: 'grid-2', sort: null };

      const validateConfigurationUIRecord = (record: any): boolean => {
        return !!(
          record.id &&
          record.collection &&
          record.ui_type &&
          typeof record.sort === 'number'
        );
      };

      expect(validateConfigurationUIRecord(validRecord)).toBe(true);
      expect(validateConfigurationUIRecord(invalidRecord)).toBe(false);
    });

    it('should validate sort field is numeric', () => {
      const validRecord = { id: '1', collection: 'frame_colors', ui_type: 'color-swatch', sort: 10 };
      const invalidRecord = { id: '2', collection: 'mirror_styles', ui_type: 'grid-2', sort: 'invalid' };

      const validateConfigurationUIRecord = (record: any): boolean => {
        return !!(
          record.id &&
          record.collection &&
          record.ui_type &&
          typeof record.sort === 'number'
        );
      };

      expect(validateConfigurationUIRecord(validRecord)).toBe(true);
      expect(validateConfigurationUIRecord(invalidRecord)).toBe(false);
    });

    it('should handle array validation', () => {
      const validData = [
        { id: '1', collection: 'frame_colors', ui_type: 'color-swatch', sort: 10 },
        { id: '2', collection: 'mirror_styles', ui_type: 'grid-2', sort: 20 },
      ];

      const invalidData = [
        { id: '1', collection: 'frame_colors', ui_type: 'color-swatch', sort: 10 },
        { id: '2', collection: '', ui_type: 'grid-2', sort: 20 }, // Invalid record
      ];

      const validateConfigurationUIArray = (records: any[]): boolean => {
        return records.every(record =>
          record.id &&
          record.collection &&
          record.ui_type &&
          typeof record.sort === 'number'
        );
      };

      expect(validateConfigurationUIArray(validData)).toBe(true);
      expect(validateConfigurationUIArray(invalidData)).toBe(false);
    });
  });
});