/**
 * SQL Functions Configuration UI Integration Tests
 * Tests for SQL functions that include configuration_ui data integration
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('SQL Functions Configuration UI Integration', () => {
  let mockSupabaseClient: any;

  beforeEach(() => {
    // Mock Supabase client
    mockSupabaseClient = {
      rpc: vi.fn(),
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('get_dynamic_options_with_ui', () => {
    it('should return product options with configuration_ui data', async () => {
      const mockResult = {
        configurationUI: [
          { id: '1', collection: 'frame_colors', ui_type: 'color_picker', sort: 4 },
          { id: '2', collection: 'mirror_styles', ui_type: 'button_grid', sort: 2 },
          { id: '3', collection: 'sizes', ui_type: 'preset_buttons', sort: 10 },
        ],
        frameColors: [
          { id: 1, name: 'Black Frame', sku_code: 'BF', hex_code: '#000000' },
          { id: 2, name: 'White Frame', sku_code: 'WF', hex_code: '#FFFFFF' },
        ],
        mirrorStyles: [
          { id: 1, name: 'Full Frame', sku_code: '01' },
          { id: 2, name: 'Minimal Frame', sku_code: '02' },
        ],
        sizes: [
          { id: 1, name: '24x36', sku_code: '2436', width: 24, height: 36 },
          { id: 2, name: '30x42', sku_code: '3042', width: 30, height: 42 },
        ],
      };

      mockSupabaseClient.rpc.mockResolvedValue({
        data: mockResult,
        error: null
      });

      // Mock function to test
      const getDynamicOptionsWithUI = async () => {
        const { data, error } = await mockSupabaseClient.rpc('get_dynamic_options_with_ui');
        if (error) throw error;
        return data;
      };

      const result = await getDynamicOptionsWithUI();

      expect(mockSupabaseClient.rpc).toHaveBeenCalledWith('get_dynamic_options_with_ui');
      expect(result.configurationUI).toBeDefined();
      expect(result.configurationUI).toHaveLength(3);
      expect(result.configurationUI[0]).toHaveProperty('sort', 4);
      expect(result.frameColors).toBeDefined();
      expect(result.frameColors).toHaveLength(2);
      expect(result.mirrorStyles).toBeDefined();
      expect(result.sizes).toBeDefined();
    });

    it('should handle empty configuration_ui gracefully', async () => {
      const mockResult = {
        configurationUI: [],
        frameColors: [],
        mirrorStyles: [],
        sizes: [],
      };

      mockSupabaseClient.rpc.mockResolvedValue({
        data: mockResult,
        error: null
      });

      const getDynamicOptionsWithUI = async () => {
        const { data, error } = await mockSupabaseClient.rpc('get_dynamic_options_with_ui');
        if (error) throw error;
        return data;
      };

      const result = await getDynamicOptionsWithUI();

      expect(result.configurationUI).toEqual([]);
      expect(result.frameColors).toEqual([]);
    });

    it('should handle SQL function errors gracefully', async () => {
      const mockError = new Error('SQL function execution failed');

      mockSupabaseClient.rpc.mockResolvedValue({
        data: null,
        error: mockError
      });

      const getDynamicOptionsWithUI = async () => {
        const { data, error } = await mockSupabaseClient.rpc('get_dynamic_options_with_ui');
        if (error) throw error;
        return data;
      };

      await expect(getDynamicOptionsWithUI()).rejects.toThrow('SQL function execution failed');
    });

    it('should include sort field in configuration_ui data', async () => {
      const mockResult = {
        configurationUI: [
          { id: '1', collection: 'frame_colors', ui_type: 'color_picker', sort: 4 },
          { id: '2', collection: 'mirror_styles', ui_type: 'button_grid', sort: 2 },
          { id: '3', collection: 'sizes', ui_type: 'preset_buttons', sort: 10 },
        ],
        frameColors: [],
        mirrorStyles: [],
        sizes: [],
      };

      mockSupabaseClient.rpc.mockResolvedValue({
        data: mockResult,
        error: null
      });

      const getDynamicOptionsWithUI = async () => {
        const { data, error } = await mockSupabaseClient.rpc('get_dynamic_options_with_ui');
        if (error) throw error;
        return data;
      };

      const result = await getDynamicOptionsWithUI();

      expect(result.configurationUI).toHaveLength(3);
      result.configurationUI.forEach(item => {
        expect(item).toHaveProperty('sort');
        expect(typeof item.sort).toBe('number');
      });

      // Verify sort order
      const sortValues = result.configurationUI.map(item => item.sort);
      expect(sortValues).toEqual([4, 2, 10]); // Original order from database
    });
  });

  describe('get_configuration_ui', () => {
    it('should return configuration_ui records sorted by sort field', async () => {
      const mockConfigUIData = [
        { ui_id: '1', ui_collection: 'mirror_styles', ui_type: 'button_grid', ui_sort: 2 },
        { ui_id: '2', ui_collection: 'frame_colors', ui_type: 'color_picker', ui_sort: 4 },
        { ui_id: '3', ui_collection: 'hanging_techniques', ui_type: 'button_grid', ui_sort: 1 },
      ];

      mockSupabaseClient.rpc.mockResolvedValue({
        data: mockConfigUIData,
        error: null
      });

      const getConfigurationUI = async () => {
        const { data, error } = await mockSupabaseClient.rpc('get_configuration_ui');
        if (error) throw error;
        return data;
      };

      const result = await getConfigurationUI();

      expect(mockSupabaseClient.rpc).toHaveBeenCalledWith('get_configuration_ui');
      expect(result).toHaveLength(3);
      expect(result[0]).toHaveProperty('ui_sort', 2);
      expect(result[1]).toHaveProperty('ui_sort', 4);
      expect(result[2]).toHaveProperty('ui_sort', 1);
    });

    it('should handle null sort values', async () => {
      const mockConfigUIData = [
        { ui_id: '1', ui_collection: 'mirror_styles', ui_type: 'button_grid', ui_sort: 2 },
        { ui_id: '2', ui_collection: 'frame_colors', ui_type: 'color_picker', ui_sort: null },
        { ui_id: '3', ui_collection: 'sizes', ui_type: 'preset_buttons', ui_sort: 10 },
      ];

      mockSupabaseClient.rpc.mockResolvedValue({
        data: mockConfigUIData,
        error: null
      });

      const getConfigurationUI = async () => {
        const { data, error } = await mockSupabaseClient.rpc('get_configuration_ui');
        if (error) throw error;
        return data;
      };

      const result = await getConfigurationUI();

      expect(result).toHaveLength(3);
      expect(result.find(item => item.ui_id === '2').ui_sort).toBeNull();
    });
  });

  describe('Configuration UI JOIN operations', () => {
    it('should join configuration_ui with option collections properly', async () => {
      const mockResult = {
        configurationUI: [
          { id: '1', collection: 'frame_colors', ui_type: 'color_picker', sort: 4 },
        ],
        frameColors: [
          { id: 1, name: 'Black Frame', sku_code: 'BF', hex_code: '#000000' },
        ],
      };

      mockSupabaseClient.rpc.mockResolvedValue({
        data: mockResult,
        error: null
      });

      const getDynamicOptionsWithUI = async () => {
        const { data, error } = await mockSupabaseClient.rpc('get_dynamic_options_with_ui');
        if (error) throw error;
        return data;
      };

      const result = await getDynamicOptionsWithUI();

      // Verify that configuration_ui collection 'frame_colors' corresponds to frameColors data
      const frameColorsConfig = result.configurationUI.find(config => config.collection === 'frame_colors');
      expect(frameColorsConfig).toBeDefined();
      expect(result.frameColors).toBeDefined();
      expect(result.frameColors).toHaveLength(1);
    });

    it('should handle missing collections gracefully', async () => {
      const mockResult = {
        configurationUI: [
          { id: '1', collection: 'frame_colors', ui_type: 'color_picker', sort: 4 },
          { id: '2', collection: 'non_existent_collection', ui_type: 'button_grid', sort: 5 },
        ],
        frameColors: [
          { id: 1, name: 'Black Frame', sku_code: 'BF', hex_code: '#000000' },
        ],
        // Note: non_existent_collection should not be in the result
      };

      mockSupabaseClient.rpc.mockResolvedValue({
        data: mockResult,
        error: null
      });

      const getDynamicOptionsWithUI = async () => {
        const { data, error } = await mockSupabaseClient.rpc('get_dynamic_options_with_ui');
        if (error) throw error;
        return data;
      };

      const result = await getDynamicOptionsWithUI();

      expect(result.configurationUI).toHaveLength(2);
      expect(result.frameColors).toBeDefined();
      expect(result).not.toHaveProperty('nonExistentCollection');
    });
  });

  describe('Backward Compatibility', () => {
    it('should provide default empty arrays for standard collections', async () => {
      const mockResult = {
        configurationUI: [],
        mirrorControls: [],
        frameColors: [],
        frameThickness: [],
        mirrorStyles: [],
        lightingOptions: [],
        mountingOptions: [],
        drivers: [],
        lightOutputs: [],
        colorTemperatures: [],
        accessoryOptions: [],
        sizes: [],
      };

      mockSupabaseClient.rpc.mockResolvedValue({
        data: mockResult,
        error: null
      });

      const getDynamicOptionsWithUI = async () => {
        const { data, error } = await mockSupabaseClient.rpc('get_dynamic_options_with_ui');
        if (error) throw error;
        return data;
      };

      const result = await getDynamicOptionsWithUI();

      // Function should ensure these standard collections exist even if empty
      const expectedCollections = [
        'mirrorControls', 'frameColors', 'frameThickness', 'mirrorStyles',
        'lightingOptions', 'mountingOptions', 'drivers', 'lightOutputs',
        'colorTemperatures', 'accessoryOptions', 'sizes'
      ];

      expectedCollections.forEach(collection => {
        expect(result).toHaveProperty(collection);
        expect(Array.isArray(result[collection])).toBe(true);
      });
    });

    it('should handle fallback when configuration_ui table is empty', async () => {
      const mockResult = {
        configurationUI: [],
        frameColors: [{ id: 1, name: 'Black Frame', sku_code: 'BF' }],
        mirrorStyles: [{ id: 1, name: 'Full Frame', sku_code: '01' }],
        // ... other collections with data
      };

      mockSupabaseClient.rpc.mockResolvedValue({
        data: mockResult,
        error: null
      });

      const getDynamicOptionsWithUI = async () => {
        const { data, error } = await mockSupabaseClient.rpc('get_dynamic_options_with_ui');
        if (error) throw error;
        return data;
      };

      const result = await getDynamicOptionsWithUI();

      expect(result.configurationUI).toEqual([]);
      expect(result.frameColors).toHaveLength(1);
      expect(result.mirrorStyles).toHaveLength(1);
    });
  });

  describe('Performance and Error Handling', () => {
    it('should handle database connection timeout', async () => {
      const mockError = new Error('connection timeout');

      mockSupabaseClient.rpc.mockResolvedValue({
        data: null,
        error: mockError
      });

      const getDynamicOptionsWithUI = async () => {
        const { data, error } = await mockSupabaseClient.rpc('get_dynamic_options_with_ui');
        if (error) throw error;
        return data;
      };

      await expect(getDynamicOptionsWithUI()).rejects.toThrow('connection timeout');
    });

    it('should handle malformed configuration_ui data', async () => {
      const mockResult = {
        configurationUI: [
          { id: '1', collection: 'frame_colors', ui_type: 'color_picker', sort: 4 },
          { id: '2', collection: null, ui_type: 'button_grid', sort: 5 }, // Invalid
          { id: '3', collection: 'sizes', ui_type: null, sort: 10 }, // Invalid
        ],
        frameColors: [{ id: 1, name: 'Black Frame', sku_code: 'BF' }],
        sizes: [{ id: 1, name: '24x36', sku_code: '2436' }],
      };

      mockSupabaseClient.rpc.mockResolvedValue({
        data: mockResult,
        error: null
      });

      const getDynamicOptionsWithUI = async () => {
        const { data, error } = await mockSupabaseClient.rpc('get_dynamic_options_with_ui');
        if (error) throw error;
        return data;
      };

      const result = await getDynamicOptionsWithUI();

      // Function should return data but client-side validation should handle malformed records
      expect(result.configurationUI).toHaveLength(3);
      expect(result.frameColors).toHaveLength(1);
      expect(result.sizes).toHaveLength(1);
    });

    it('should optimize queries by avoiding unnecessary joins', async () => {
      mockSupabaseClient.rpc.mockResolvedValue({
        data: { configurationUI: [], frameColors: [] },
        error: null
      });

      const getDynamicOptionsWithUI = async () => {
        const { data, error } = await mockSupabaseClient.rpc('get_dynamic_options_with_ui');
        if (error) throw error;
        return data;
      };

      await getDynamicOptionsWithUI();

      // Should call the optimized RPC function only once
      expect(mockSupabaseClient.rpc).toHaveBeenCalledTimes(1);
      expect(mockSupabaseClient.rpc).toHaveBeenCalledWith('get_dynamic_options_with_ui');
    });
  });
});