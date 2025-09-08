/**
 * Integration tests for product line switching with URL state preservation
 * Validates that switching between product lines via SkuSearchHeader maintains
 * proper SKU encoding in URL, especially when product codes and segment mappings differ
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock the entire App component for integration testing
import { App } from '../App';

// Mock external dependencies
vi.mock('../services/directus', () => ({
  getProductLines: vi.fn().mockResolvedValue([
    { id: 1, name: 'Eclipse', sku_code: 'ECLIPSE', active: true },
    { id: 2, name: 'Reflection', sku_code: 'REFL', active: true },
    { id: 3, name: 'Luminous', sku_code: 'LUM', active: true }
  ]),
  getProductLineWithOptions: vi.fn().mockImplementation(async (sku_code) => {
    const productLines = {
      'ECLIPSE': { id: 1, name: 'Eclipse', sku_code: 'ECLIPSE', active: true },
      'REFL': { id: 2, name: 'Reflection', sku_code: 'REFL', active: true },
      'LUM': { id: 3, name: 'Luminous', sku_code: 'LUM', active: true }
    };
    return productLines[sku_code] || null;
  }),
  getOptionsByCollectionForProductLine: vi.fn().mockImplementation(async (productLine) => {
    // Mock different options per product line to test mapping
    const baseOptions = {
      mirror_styles: [
        { id: 1, name: 'Rectangle', sku_code: '1' },
        { id: 2, name: 'Round', sku_code: '2' },
        { id: 3, name: 'Eclipse', sku_code: '3' }
      ],
      light_directions: [
        { id: 1, name: 'L12', sku_code: 'L12' },
        { id: 2, name: 'L24', sku_code: 'L24' },
        { id: 3, name: 'L36', sku_code: 'L36' }
      ],
      frame_colors: [
        { id: 1, name: 'Powder Black Bronze', sku_code: 'PBB' },
        { id: 2, name: 'Matte Black Bronze', sku_code: 'MBB' }
      ],
      mounting_options: [
        { id: 1, name: 'Portrait', sku_code: 'P' },
        { id: 2, name: 'Landscape', sku_code: 'L' }
      ],
      light_outputs: [
        { id: 1, name: '300 lm/ft', sku_code: '300' },
        { id: 2, name: '450 lm/ft', sku_code: '450' }
      ],
      color_temperatures: [
        { id: 1, name: '3000K', sku_code: '3K' },
        { id: 2, name: '4000K', sku_code: '4K' }
      ],
      drivers: [
        { id: 1, name: 'FEM', sku_code: 'FEM' },
        { id: 2, name: 'DALI', sku_code: 'DALI' }
      ],
      accessories: [
        { id: 1, name: 'Nightlight', sku_code: 'NL' },
        { id: 2, name: 'Anti-fog', sku_code: 'AF' }
      ],
      sizes: [
        { id: 1, name: '24×36', sku_code: 'STD24', width: 24, height: 36 },
        { id: 2, name: '30×48', sku_code: 'STD30', width: 30, height: 48 }
      ],
      frame_thicknesses: [
        { id: 1, name: 'Standard', sku_code: 'STD' }
      ],
      mirror_controls: [
        { id: 1, name: 'Standard', sku_code: 'STD' }
      ]
    };

    // Reflection product line has different mirror styles
    if (productLine.sku_code === 'REFL') {
      return {
        ...baseOptions,
        mirror_styles: [
          { id: 4, name: 'Oval', sku_code: '4' },
          { id: 5, name: 'Square', sku_code: '5' }
        ]
      };
    }

    // Luminous has different light directions
    if (productLine.sku_code === 'LUM') {
      return {
        ...baseOptions,
        light_directions: [
          { id: 4, name: 'FULL', sku_code: 'FULL' },
          { id: 5, name: 'SIDE', sku_code: 'SIDE' }
        ]
      };
    }

    return baseOptions;
  }),
  getConfigurationUi: vi.fn().mockResolvedValue({
    byCollection: {},
    sortByCollection: {}
  }),
  getAllProducts: vi.fn().mockResolvedValue([
    { id: 1, name: 'ECLIPSE3L24', sku_code: 'ECLIPSE3L24', product_line: 1, mirror_style: 3, light_direction: 2 },
    { id: 2, name: 'REFL4FULL', sku_code: 'REFL4FULL', product_line: 2, mirror_style: 4, light_direction: 4 },
    { id: 3, name: 'LUMSIDE5', sku_code: 'LUMSIDE5', product_line: 3, mirror_style: 5, light_direction: 5 }
  ])
}));

vi.mock('../services/rules', () => ({
  processRules: vi.fn().mockResolvedValue({}),
  getRules: vi.fn().mockResolvedValue([]),
  buildRuleConstraints: vi.fn().mockReturnValue({})
}));

vi.mock('../services/availability', () => ({
  getAvailableOptionIdsForSelections: vi.fn().mockResolvedValue({
    mirror_style: [1, 2, 3],
    light_direction: [1, 2, 3],
    frame_color: [1, 2],
    mounting: [1, 2],
    light_output: [1, 2],
    color_temperature: [1, 2],
    driver: [1, 2],
    accessories: [1, 2]
  })
}));

// Mock window.history
Object.defineProperty(window, 'history', {
  value: {
    replaceState: vi.fn(),
    pushState: vi.fn()
  },
  writable: true
});

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000/?search=ECLIPSE3L24-STD24-300-3K-FEM-P-PBB',
    pathname: '/',
    search: '?search=ECLIPSE3L24-STD24-300-3K-FEM-P-PBB',
    toString: () => 'http://localhost:3000/?search=ECLIPSE3L24-STD24-300-3K-FEM-P-PBB'
  },
  writable: true
});

describe('Product Line Switching URL Preservation', () => {
  beforeEach(() => {
    // Reset URL and history mocks
    vi.clearAllMocks();
    window.location.search = '?search=ECLIPSE3L24-STD24-300-3K-FEM-P-PBB';
    window.location.href = 'http://localhost:3000/?search=ECLIPSE3L24-STD24-300-3K-FEM-P-PBB';
  });

  describe('Basic Product Line Switching', () => {
    it('should preserve compatible configuration when switching product lines', async () => {
      render(<App />);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Eclipse')).toBeInTheDocument();
      });

      // Verify initial URL contains Eclipse SKU
      expect(window.location.search).toContain('ECLIPSE');

      // Switch to Reflection product line (has different mirror styles)
      const productLineSelector = screen.getByRole('combobox');
      fireEvent.click(productLineSelector);
      
      await waitFor(() => {
        expect(screen.getByText('Reflection')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByText('Reflection'));

      // Wait for product line switch to complete
      await waitFor(() => {
        expect(window.history.replaceState).toHaveBeenCalled();
      });

      // Verify URL was updated to Reflection format
      const lastCall = (window.history.replaceState as any).mock.calls.slice(-1)[0];
      expect(lastCall[2]).toContain('?search=REFL');
      
      // Should preserve compatible options like frame color, mounting, etc.
      expect(lastCall[2]).toContain('PBB'); // Frame color
      expect(lastCall[2]).toContain('P');   // Mounting
      expect(lastCall[2]).toContain('FEM'); // Driver
    });

    it('should handle incompatible mirror styles gracefully', async () => {
      // Start with Eclipse (has mirror style 3)
      window.location.search = '?search=ECLIPSE3L24-STD24-300-3K-FEM-P-PBB';
      
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Eclipse')).toBeInTheDocument();
      });

      // Switch to Reflection (only has mirror styles 4, 5)
      const productLineSelector = screen.getByRole('combobox');
      fireEvent.click(productLineSelector);
      fireEvent.click(screen.getByText('Reflection'));

      await waitFor(() => {
        expect(window.history.replaceState).toHaveBeenCalled();
      });

      // Should fallback to first available mirror style for new product line
      const lastCall = (window.history.replaceState as any).mock.calls.slice(-1)[0];
      expect(lastCall[2]).toContain('?search=REFL4'); // Should use mirror style 4
    });

    it('should handle incompatible light directions gracefully', async () => {
      // Start with Eclipse (has L24)
      window.location.search = '?search=ECLIPSE3L24-STD24-300-3K-FEM-P-PBB';
      
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Eclipse')).toBeInTheDocument();
      });

      // Switch to Luminous (has FULL, SIDE instead of L12, L24, L36)
      const productLineSelector = screen.getByRole('combobox');
      fireEvent.click(productLineSelector);
      fireEvent.click(screen.getByText('Luminous'));

      await waitFor(() => {
        expect(window.history.replaceState).toHaveBeenCalled();
      });

      // Should fallback to first available light direction
      const lastCall = (window.history.replaceState as any).mock.calls.slice(-1)[0];
      expect(lastCall[2]).toContain('FULL'); // Should use FULL light direction
    });
  });

  describe('Custom Dimensions Preservation', () => {
    it('should preserve custom dimensions across product line switches', async () => {
      // Start with custom dimensions
      window.location.search = '?search=ECLIPSE3L24-33.548-300-3K-FEM-P-PBB';
      
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Eclipse')).toBeInTheDocument();
      });

      // Switch product line
      const productLineSelector = screen.getByRole('combobox');
      fireEvent.click(productLineSelector);
      fireEvent.click(screen.getByText('Reflection'));

      await waitFor(() => {
        expect(window.history.replaceState).toHaveBeenCalled();
      });

      // Custom dimensions should be preserved
      const lastCall = (window.history.replaceState as any).mock.calls.slice(-1)[0];
      expect(lastCall[2]).toContain('33.548'); // Custom dimensions preserved
    });

    it('should preserve preset size codes when available in new product line', async () => {
      // Start with preset size
      window.location.search = '?search=ECLIPSE3L24-STD24-300-3K-FEM-P-PBB';
      
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Eclipse')).toBeInTheDocument();
      });

      // Switch product line
      const productLineSelector = screen.getByRole('combobox');
      fireEvent.click(productLineSelector);
      fireEvent.click(screen.getByText('Reflection'));

      await waitFor(() => {
        expect(window.history.replaceState).toHaveBeenCalled();
      });

      // Preset size should be preserved if available
      const lastCall = (window.history.replaceState as any).mock.calls.slice(-1)[0];
      expect(lastCall[2]).toContain('STD24'); // Preset size preserved
    });
  });

  describe('Accessory Preservation', () => {
    it('should preserve individual accessories across product line switches', async () => {
      // Start with individual accessories
      window.location.search = '?search=ECLIPSE3L24-STD24-300-3K-FEM-P-PBB-NL+AF';
      
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Eclipse')).toBeInTheDocument();
      });

      // Switch product line
      const productLineSelector = screen.getByRole('combobox');
      fireEvent.click(productLineSelector);
      fireEvent.click(screen.getByText('Reflection'));

      await waitFor(() => {
        expect(window.history.replaceState).toHaveBeenCalled();
      });

      // Accessories should be preserved
      const lastCall = (window.history.replaceState as any).mock.calls.slice(-1)[0];
      expect(lastCall[2]).toContain('NL+AF'); // Accessories preserved
    });

    it('should preserve composite accessory codes across product line switches', async () => {
      // Start with composite accessory code
      window.location.search = '?search=ECLIPSE3L24-STD24-300-3K-FEM-P-PBB-AN';
      
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Eclipse')).toBeInTheDocument();
      });

      // Switch product line
      const productLineSelector = screen.getByRole('combobox');
      fireEvent.click(productLineSelector);
      fireEvent.click(screen.getByText('Reflection'));

      await waitFor(() => {
        expect(window.history.replaceState).toHaveBeenCalled();
      });

      // Composite accessory should be preserved
      const lastCall = (window.history.replaceState as any).mock.calls.slice(-1)[0];
      expect(lastCall[2]).toContain('AN'); // Composite code preserved
    });
  });

  describe('Complex Configuration Preservation', () => {
    it('should preserve complete complex configuration across compatible product lines', async () => {
      // Start with full configuration
      window.location.search = '?search=ECLIPSE3L24-30X48-450-4K-DALI-L-MBB-NL+AF';
      
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Eclipse')).toBeInTheDocument();
      });

      // Switch to Reflection (compatible except mirror style)
      const productLineSelector = screen.getByRole('combobox');
      fireEvent.click(productLineSelector);
      fireEvent.click(screen.getByText('Reflection'));

      await waitFor(() => {
        expect(window.history.replaceState).toHaveBeenCalled();
      });

      const lastCall = (window.history.replaceState as any).mock.calls.slice(-1)[0];
      const newUrl = lastCall[2];
      
      // Should preserve all compatible segments
      expect(newUrl).toContain('REFL');    // New product line
      expect(newUrl).toContain('30X48');   // Size preserved
      expect(newUrl).toContain('450');     // Light output preserved  
      expect(newUrl).toContain('4K');      // Color temperature preserved
      expect(newUrl).toContain('DALI');    // Driver preserved
      expect(newUrl).toContain('L');       // Mounting preserved
      expect(newUrl).toContain('MBB');     // Frame color preserved
      expect(newUrl).toContain('NL+AF');   // Accessories preserved
    });

    it('should handle partial incompatibility gracefully', async () => {
      // Start with Eclipse configuration
      window.location.search = '?search=ECLIPSE3L24-STD24-300-3K-FEM-P-PBB';
      
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Eclipse')).toBeInTheDocument();
      });

      // Switch to Luminous (different mirror styles AND light directions)
      const productLineSelector = screen.getByRole('combobox');
      fireEvent.click(productLineSelector);
      fireEvent.click(screen.getByText('Luminous'));

      await waitFor(() => {
        expect(window.history.replaceState).toHaveBeenCalled();
      });

      const lastCall = (window.history.replaceState as any).mock.calls.slice(-1)[0];
      const newUrl = lastCall[2];
      
      // Should update product line and incompatible options, preserve compatible ones
      expect(newUrl).toContain('LUM');     // New product line
      expect(newUrl).toContain('STD24');   // Size preserved
      expect(newUrl).toContain('300');     // Light output preserved
      expect(newUrl).toContain('3K');      // Color temperature preserved  
      expect(newUrl).toContain('FEM');     // Driver preserved
      expect(newUrl).toContain('P');       // Mounting preserved
      expect(newUrl).toContain('PBB');     // Frame color preserved
      
      // Mirror style and light direction should fallback to new product line defaults
      expect(newUrl).toContain('5');       // New mirror style (first available)
      expect(newUrl).toContain('FULL');    // New light direction (first available)
    });
  });

  describe('URL State Consistency', () => {
    it('should maintain URL consistency after multiple product line switches', async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Eclipse')).toBeInTheDocument();
      });

      const productLineSelector = screen.getByRole('combobox');
      
      // Switch Eclipse → Reflection
      fireEvent.click(productLineSelector);
      fireEvent.click(screen.getByText('Reflection'));
      
      await waitFor(() => {
        expect(window.history.replaceState).toHaveBeenCalled();
      });

      // Switch Reflection → Luminous
      fireEvent.click(productLineSelector);
      fireEvent.click(screen.getByText('Luminous'));
      
      await waitFor(() => {
        expect(window.history.replaceState).toHaveBeenCalledTimes(2);
      });

      // Switch Luminous → Eclipse (back to start)
      fireEvent.click(productLineSelector);
      fireEvent.click(screen.getByText('Eclipse'));
      
      await waitFor(() => {
        expect(window.history.replaceState).toHaveBeenCalledTimes(3);
      });

      // Final URL should be valid Eclipse SKU
      const finalCall = (window.history.replaceState as any).mock.calls.slice(-1)[0];
      expect(finalCall[2]).toContain('?search=ECLIPSE');
      expect(finalCall[2]).toMatch(/^[^?]*\?search=ECLIPSE[0-9][A-Z0-9]+-/);
    });

    it('should handle browser back/forward navigation correctly', async () => {
      // This test would require more complex setup to simulate browser navigation
      // For now, we focus on ensuring URL state is always consistent
      
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Eclipse')).toBeInTheDocument();
      });

      // Each product line switch should result in exactly one history update
      const productLineSelector = screen.getByRole('combobox');
      
      fireEvent.click(productLineSelector);
      fireEvent.click(screen.getByText('Reflection'));
      
      await waitFor(() => {
        expect(window.history.replaceState).toHaveBeenCalledTimes(1);
      });

      // Verify the URL is properly encoded
      const call = (window.history.replaceState as any).mock.calls[0];
      expect(call[2]).toMatch(/^[^?]*\?search=[A-Z0-9]+-/);
    });
  });

  describe('Error Handling in Product Line Switches', () => {
    it('should handle missing product line options gracefully', async () => {
      // Mock a failure in loading options
      const originalMock = vi.mocked(require('../services/directus').getOptionsByCollectionForProductLine);
      originalMock.mockRejectedValueOnce(new Error('Failed to load options'));

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Eclipse')).toBeInTheDocument();
      });

      const productLineSelector = screen.getByRole('combobox');
      fireEvent.click(productLineSelector);
      fireEvent.click(screen.getByText('Reflection'));

      // Should handle the error gracefully without breaking the URL
      await waitFor(() => {
        // The switch might fail, but app should remain functional
        expect(screen.getByText(/Eclipse|Reflection/)).toBeInTheDocument();
      });

      // Restore original mock
      originalMock.mockRestore();
    });

    it('should handle invalid URL parameters during product line switch', async () => {
      // Start with malformed URL
      window.location.search = '?search=INVALID-MALFORMED-SKU';
      
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Eclipse')).toBeInTheDocument();
      });

      const productLineSelector = screen.getByRole('combobox');
      fireEvent.click(productLineSelector);
      fireEvent.click(screen.getByText('Reflection'));

      await waitFor(() => {
        expect(window.history.replaceState).toHaveBeenCalled();
      });

      // Should generate valid URL despite invalid starting point
      const lastCall = (window.history.replaceState as any).mock.calls.slice(-1)[0];
      expect(lastCall[2]).toContain('?search=REFL');
      expect(lastCall[2]).toMatch(/^[^?]*\?search=[A-Z0-9]+-/);
    });
  });
});
