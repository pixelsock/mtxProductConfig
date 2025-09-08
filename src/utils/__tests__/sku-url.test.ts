/**
 * Comprehensive test suite for SKU ↔ URL synchronization functions
 * Tests all functions in sku-url.ts for correct bidirectional conversion
 */

import { describe, it, expect } from 'vitest';
import {
  encodeSkuToQuery,
  queryToString,
  decodeQueryToSelection,
  parseFullSkuToQuery,
  parsePartialSkuToQuery,
  buildSearchParam,
  parseSearchParam,
  type SkuQuery
} from '../sku-url';
import type { SimpleOptions, CurrentConfigLike } from '../sku-builder';
import type { ProductLine } from '../../services/directus';

// Test data setup
const mockProductLine: ProductLine = {
  id: 1,
  name: 'Eclipse',
  sku_code: 'ECLIPSE',
  active: true
};

const mockOptions: SimpleOptions = {
  mirrorControls: [
    { id: 1, name: 'Standard', sku_code: 'STD' }
  ],
  frameColors: [
    { id: 1, name: 'Powder Black Bronze', sku_code: 'PBB' },
    { id: 2, name: 'Matte Black Bronze', sku_code: 'MBB' }
  ],
  frameThickness: [
    { id: 1, name: 'Standard', sku_code: 'STD' }
  ],
  mirrorStyles: [
    { id: 1, name: 'Rectangle', sku_code: '1' },
    { id: 2, name: 'Round', sku_code: '2' },
    { id: 3, name: 'Eclipse', sku_code: '3' }
  ],
  mountingOptions: [
    { id: 1, name: 'Portrait', sku_code: 'P' },
    { id: 2, name: 'Landscape', sku_code: 'L' }
  ],
  lightingOptions: [
    { id: 1, name: 'L12', sku_code: 'L12' },
    { id: 2, name: 'L24', sku_code: 'L24' },
    { id: 3, name: 'L36', sku_code: 'L36' }
  ],
  colorTemperatures: [
    { id: 1, name: '3000K', sku_code: '3K' },
    { id: 2, name: '4000K', sku_code: '4K' }
  ],
  lightOutputs: [
    { id: 1, name: '300 lm/ft', sku_code: '300' },
    { id: 2, name: '450 lm/ft', sku_code: '450' }
  ],
  drivers: [
    { id: 1, name: 'Forward/External/Magnetic', sku_code: 'FEM' },
    { id: 2, name: 'DALI', sku_code: 'DALI' }
  ],
  accessoryOptions: [
    { id: 1, name: 'Nightlight', sku_code: 'NL' },
    { id: 2, name: 'Anti-fog', sku_code: 'AF' }
  ],
  sizes: [
    { id: 1, name: '24×36', sku_code: 'STD24', width: 24, height: 36 },
    { id: 2, name: '30×48', sku_code: 'STD30', width: 30, height: 48 }
  ]
};

const mockConfig: CurrentConfigLike = {
  productLineId: 1,
  mirrorControls: '1',
  frameColor: '1',
  frameThickness: '1',
  mirrorStyle: '3',
  width: '24',
  height: '36',
  mounting: '1',
  lighting: '2',
  colorTemperature: '1',
  lightOutput: '1',
  driver: '1',
  accessories: ['1', '2']
};

describe('SKU URL Functions', () => {
  describe('encodeSkuToQuery', () => {
    it('should encode complete configuration to query parameters', () => {
      const result = encodeSkuToQuery(mockConfig, mockOptions, mockProductLine);
      
      expect(result).toEqual({
        pl: 'ECLIPSE',
        ms: '3',
        ld: 'L24',
        sz: 'STD24',
        lo: '300',
        ct: '3K',
        dr: 'FEM',
        mo: 'P',
        fc: 'PBB',
        ac: 'NL+AF'
      });
    });

    it('should handle overrides correctly', () => {
      const overrides = {
        productSkuOverride: 'CUSTOM001',
        accessoriesOverride: 'AN'
      };
      
      const result = encodeSkuToQuery(mockConfig, mockOptions, mockProductLine, overrides);
      
      expect(result.pl).toBe('CUSTOM001');
      expect(result.ac).toBe('AN');
    });

    it('should omit empty or undefined values', () => {
      const minimalConfig = {
        ...mockConfig,
        lightOutput: '',
        colorTemperature: '',
        accessories: []
      };
      
      const result = encodeSkuToQuery(minimalConfig, mockOptions, mockProductLine);
      
      expect(result).not.toHaveProperty('lo');
      expect(result).not.toHaveProperty('ct');
      expect(result).not.toHaveProperty('ac');
    });

    it('should handle custom dimensions when no size preset matches', () => {
      const customConfig = {
        ...mockConfig,
        width: '33.5',
        height: '48'
      };
      
      const result = encodeSkuToQuery(customConfig, mockOptions, mockProductLine);
      
      expect(result.sz).toBe('33.548');
    });
  });

  describe('queryToString', () => {
    it('should convert query object to URL search string', () => {
      const query: SkuQuery = {
        pl: 'ECLIPSE',
        ms: '3',
        ld: 'L24',
        sz: '24X36'
      };
      
      const result = queryToString(query);
      
      expect(result).toBe('?pl=ECLIPSE&ms=3&ld=L24&sz=24X36');
    });

    it('should return empty string for empty query', () => {
      const result = queryToString({});
      
      expect(result).toBe('');
    });

    it('should skip undefined and empty values', () => {
      const query: SkuQuery = {
        pl: 'ECLIPSE',
        ms: undefined,
        ld: '',
        sz: '24X36'
      };
      
      const result = queryToString(query);
      
      expect(result).toBe('?pl=ECLIPSE&sz=24X36');
    });
  });

  describe('decodeQueryToSelection', () => {
    it('should decode query string back to selection configuration', () => {
      const queryString = '?ms=3&ld=L24&sz=STD24&lo=300&ct=3K&dr=FEM&mo=P&fc=PBB&ac=NL+AF';
      
      const result = decodeQueryToSelection(queryString, mockOptions);
      
      expect(result).toEqual({
        mirrorStyle: '3',
        lighting: '2',
        frameThickness: '',
        driver: '1',
        frameColor: '1',
        mounting: '1',
        lightOutput: '1',
        colorTemperature: '1',
        width: '24',
        height: '36',
        accessories: ['1', '2']
      });
    });

    it('should handle custom dimensions with x separator', () => {
      const queryString = '?sz=24.5x48';
      
      const result = decodeQueryToSelection(queryString, mockOptions);
      
      expect(result.width).toBe('24.5');
      expect(result.height).toBe('48');
    });

    it('should handle no-separator dimension format', () => {
      const queryString = '?sz=33.533';
      
      const result = decodeQueryToSelection(queryString, mockOptions);
      
      expect(result.width).toBe('33.5');
      expect(result.height).toBe('33');
    });

    it('should handle legacy compact dimension format', () => {
      const queryString = '?sz=2436';
      
      const result = decodeQueryToSelection(queryString, mockOptions);
      
      expect(result.width).toBe('24');
      expect(result.height).toBe('36');
    });

    it('should expand composite accessory codes', () => {
      const queryString = '?ac=AN';
      
      const result = decodeQueryToSelection(queryString, mockOptions);
      
      expect(result.accessories).toEqual(['1', '2']); // NL + AF
    });

    it('should handle explicit no accessories code', () => {
      const queryString = '?ac=NA';
      
      const result = decodeQueryToSelection(queryString, mockOptions);
      
      expect(result.accessories).toEqual([]);
    });

    it('should handle query string without leading question mark', () => {
      const queryString = 'ms=3&ld=L24';
      
      const result = decodeQueryToSelection(queryString, mockOptions);
      
      expect(result.mirrorStyle).toBe('3');
      expect(result.lighting).toBe('2');
    });
  });

  describe('parseFullSkuToQuery', () => {
    it('should parse complete SKU string to query parameters', () => {
      const fullSku = 'ECLIPSE3L24-STD24-300-3K-FEM-P-PBB-NL+AF';
      
      const result = parseFullSkuToQuery(fullSku, 'ECLIPSE', mockOptions);
      
      expect(result).toEqual({
        pl: 'ECLIPSE',
        ms: '3',
        ld: 'L24',
        sz: 'STD24',
        lo: '300',
        ct: '3K',
        dr: 'FEM',
        mo: 'P',
        fc: 'PBB',
        ac: 'NL+AF'
      });
    });

    it('should return null for invalid SKU format', () => {
      const result = parseFullSkuToQuery('INVALID', 'ECLIPSE', mockOptions);
      
      expect(result).toBeNull();
    });

    it('should return null when core doesn\'t start with product line code', () => {
      const result = parseFullSkuToQuery('OTHER3L24-STD24', 'ECLIPSE', mockOptions);
      
      expect(result).toBeNull();
    });

    it('should parse minimal SKU with just core', () => {
      const result = parseFullSkuToQuery('ECLIPSE3L24', 'ECLIPSE', mockOptions);
      
      expect(result).toEqual({
        pl: 'ECLIPSE',
        ms: '3',
        ld: 'L24'
      });
    });
  });

  describe('parsePartialSkuToQuery', () => {
    it('should parse partial SKU with core only', () => {
      const result = parsePartialSkuToQuery('ECLIPSE3', 'ECLIPSE', mockOptions);
      
      expect(result).toEqual({
        pl: 'ECLIPSE',
        ms: '3'
      });
    });

    it('should parse complete partial SKU', () => {
      const result = parsePartialSkuToQuery('ECLIPSE3L24-24x36-300', 'ECLIPSE', mockOptions);
      
      expect(result).toEqual({
        pl: 'ECLIPSE',
        ms: '3',
        ld: 'L24',
        sz: '24X36',
        lo: '300'
      });
    });

    it('should handle case insensitive input', () => {
      const result = parsePartialSkuToQuery('eclipse3l24', 'ECLIPSE', mockOptions);
      
      expect(result).toEqual({
        pl: 'ECLIPSE',
        ms: '3',
        ld: 'L24'
      });
    });

    it('should return null for empty input', () => {
      const result = parsePartialSkuToQuery('', 'ECLIPSE', mockOptions);
      
      expect(result).toBeNull();
    });

    it('should return null when core doesn\'t start with product line', () => {
      const result = parsePartialSkuToQuery('OTHER3L24', 'ECLIPSE', mockOptions);
      
      expect(result).toBeNull();
    });

    it('should handle segments that don\'t match known codes', () => {
      const result = parsePartialSkuToQuery('ECLIPSE3L24-UNKNOWN-999', 'ECLIPSE', mockOptions);
      
      expect(result).toEqual({
        pl: 'ECLIPSE',
        ms: '3',
        ld: 'L24'
        // unknown segments should be omitted
      });
    });
  });

  describe('buildSearchParam', () => {
    it('should build complete search parameter string', () => {
      const result = buildSearchParam(mockConfig, mockOptions, mockProductLine);
      
      expect(result).toBe('ECLIPSE3L24-STD24-300-3K-FEM-P-PBB-NL+AF');
    });

    it('should handle overrides in search param', () => {
      const overrides = {
        productSkuOverride: 'CUSTOM001',
        accessoriesOverride: 'AN'
      };
      
      const result = buildSearchParam(mockConfig, mockOptions, mockProductLine, overrides);
      
      expect(result).toBe('CUSTOM001-STD24-300-3K-FEM-P-PBB-AN');
    });
  });

  describe('parseSearchParam', () => {
    const mockProducts = [
      { name: 'ECLIPSE3L24', product_line: 1 },
      { name: 'CUSTOM001', product_line: 2 }
    ];

    const mockProductLines = [
      mockProductLine,
      { id: 2, name: 'Custom', sku_code: 'CUSTOM', active: true }
    ];

    it('should parse search param with exact product match', () => {
      const result = parseSearchParam(
        'ECLIPSE3L24-STD24-300',
        mockProducts,
        mockProductLines,
        mockOptions
      );
      
      expect(result?.productLine.id).toBe(1);
      expect(result?.selection.mirrorStyle).toBe('3');
      expect(result?.selection.lighting).toBe('2');
    });

    it('should parse search param with product line prefix fallback', () => {
      const result = parseSearchParam(
        'ECLIPSE2L12-30X48',
        mockProducts,
        mockProductLines,
        mockOptions
      );
      
      expect(result?.productLine.id).toBe(1); // Eclipse product line
      expect(result?.selection.mirrorStyle).toBe('2');
      expect(result?.selection.lighting).toBe('1');
    });

    it('should return null for invalid search param', () => {
      const result = parseSearchParam(
        'INVALID123',
        mockProducts,
        mockProductLines,
        mockOptions
      );
      
      expect(result).toBeNull();
    });

    it('should return null for empty search param', () => {
      const result = parseSearchParam(
        '',
        mockProducts,
        mockProductLines,
        mockOptions
      );
      
      expect(result).toBeNull();
    });
  });

  describe('Round-trip Consistency', () => {
    it('should maintain consistency through encode → decode cycle', () => {
      const query = encodeSkuToQuery(mockConfig, mockOptions, mockProductLine);
      const queryString = queryToString(query);
      const decoded = decodeQueryToSelection(queryString, mockOptions);
      
      // Compare relevant fields that should round-trip
      expect(decoded.mirrorStyle).toBe(mockConfig.mirrorStyle);
      expect(decoded.lighting).toBe(mockConfig.lighting);
      expect(decoded.frameColor).toBe(mockConfig.frameColor);
      expect(decoded.mounting).toBe(mockConfig.mounting);
      expect(decoded.driver).toBe(mockConfig.driver);
      expect(decoded.lightOutput).toBe(mockConfig.lightOutput);
      expect(decoded.colorTemperature).toBe(mockConfig.colorTemperature);
      expect(decoded.accessories).toEqual(mockConfig.accessories);
    });

    it('should maintain consistency through build → parse cycle', () => {
      const searchParam = buildSearchParam(mockConfig, mockOptions, mockProductLine);
      const parsed = parsePartialSkuToQuery(searchParam, mockProductLine.sku_code!, mockOptions);
      const decoded = decodeQueryToSelection(queryToString(parsed!), mockOptions);
      
      // Verify core fields round-trip correctly
      expect(decoded.mirrorStyle).toBe(mockConfig.mirrorStyle);
      expect(decoded.lighting).toBe(mockConfig.lighting);
      expect(decoded.width).toBe(mockConfig.width);
      expect(decoded.height).toBe(mockConfig.height);
    });

    it('should handle edge cases in round-trip', () => {
      const edgeCaseConfig = {
        ...mockConfig,
        accessories: [], // No accessories
        width: '33.25',   // Custom decimal width
        height: '48',     // Custom height
        lightOutput: '',  // Empty optional field
        colorTemperature: '' // Empty optional field
      };
      
      const searchParam = buildSearchParam(edgeCaseConfig, mockOptions, mockProductLine);
      const parsed = parsePartialSkuToQuery(searchParam, mockProductLine.sku_code!, mockOptions);
      const decoded = decodeQueryToSelection(queryToString(parsed!), mockOptions);
      
      expect(decoded.mirrorStyle).toBe(edgeCaseConfig.mirrorStyle);
      expect(decoded.lighting).toBe(edgeCaseConfig.lighting);
      expect(parseFloat(decoded.width!)).toBeCloseTo(33.25);
      expect(decoded.height).toBe('48');
      expect(decoded.accessories).toEqual([]);
    });
  });
});
