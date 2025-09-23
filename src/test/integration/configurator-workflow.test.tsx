/**
 * Configurator Workflow Integration Test
 *
 * Tests the actual workflow that happens in the configurator to see
 * where product overrides might be failing.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useConfiguratorStore } from '../../store';
import { initializeFiltering } from '../../services/dynamic-filtering';

describe('Configurator Workflow Integration', () => {
  beforeEach(async () => {
    // Initialize the filtering cache
    await initializeFiltering();
  });

  describe('Product Selection Workflow', () => {
    it('should test the actual store workflow for circle product selection', async () => {
      console.log('🧪 Testing actual store workflow for circle product override');

      // Get store actions and state
      const {
        setCurrentProductLine,
        setCurrentProduct,
        loadProductLineOptions,
        currentProductLine,
        currentProduct,
        productOptions,
        availableProductLines
      } = useConfiguratorStore.getState();

      console.log('Initial state:', {
        currentProductLine: currentProductLine?.name,
        currentProduct: currentProduct?.name,
        hasProductOptions: !!productOptions
      });

      // Step 1: Load available product lines (simulate app initialization)
      const { setAvailableProductLines } = useConfiguratorStore.getState();

      // Mock product line data (normally loaded from Supabase)
      const mockProductLine = {
        id: 1,
        name: 'Deco Collection',
        active: true,
        default_options: []
      };

      setAvailableProductLines([mockProductLine]);

      // Step 2: Set product line (simulate user selection or default)
      console.log('🔄 Step 2: Setting product line...');
      setCurrentProductLine(mockProductLine);

      // Step 3: Load product line options (this currently doesn't have product context)
      console.log('🔄 Step 3: Loading product line options...');
      await loadProductLineOptions(mockProductLine);

      const optionsAfterProductLine = useConfiguratorStore.getState().productOptions;
      console.log('Options after product line load:', {
        sizes: optionsAfterProductLine?.sizes?.length || 0,
        sampleSizes: optionsAfterProductLine?.sizes?.slice(0, 3)?.map(s => `${s.id}:${s.name}`)
      });

      // Step 4: Simulate configuration that matches circle product B51B
      console.log('🔄 Step 4: Setting configuration that matches circle product...');

      // Circle product B51B configuration based on database
      const circleProductConfig = {
        id: 'test-config',
        productLineId: 1,
        productLineName: 'Deco Collection',
        mirrorControls: '',
        frameColor: '',
        frameThickness: '',
        mirrorStyle: '11', // This should match B51B mirror style
        lightDirection: 'd', // Direct
        width: '36',
        height: '36',
        mounting: '',
        lighting: '',
        colorTemperature: '',
        lightOutput: '',
        driver: '',
        accessories: [],
        quantity: 1
      };

      const { updateConfiguration } = useConfiguratorStore.getState();

      // Update configuration to match circle product
      Object.entries(circleProductConfig).forEach(([field, value]) => {
        if (field !== 'id') {
          updateConfiguration(field as any, value);
        }
      });

      // Step 5: Manually set circle product (simulating what App.tsx does)
      console.log('🔄 Step 5: Setting circle product B51B...');
      const circleProduct = {
        id: 1839, // B51B product ID
        name: 'B51b',
        sku_code: 'B51b',
        product_line: 1,
        mirror_style: 11,
        light_direction: 1, // Direct
        frame_thickness: null,
        vertical_image: null,
        horizontal_image: null
      };

      await setCurrentProduct(circleProduct);

      // Step 6: Check if options are now filtered
      const finalState = useConfiguratorStore.getState();
      console.log('Final state after product selection:', {
        currentProduct: finalState.currentProduct?.name,
        sizes: finalState.productOptions?.sizes?.length || 0,
        sampleSizes: finalState.productOptions?.sizes?.slice(0, 5)?.map(s => `${s.id}:${s.name}`)
      });

      // Verify if circle product override was applied
      const sizeCount = finalState.productOptions?.sizes?.length || 0;
      const sizeIds = finalState.productOptions?.sizes?.map(s => s.id) || [];

      console.log('Override verification:', {
        totalSizes: sizeCount,
        sizeIds: sizeIds,
        hasOnlyCircularSizes: sizeIds.length === 2 && sizeIds.includes(5) && sizeIds.includes(6),
        expectedCircularSizes: [5, 6]
      });

      if (sizeIds.length === 2 && sizeIds.includes(5) && sizeIds.includes(6)) {
        console.log('✅ SUCCESS: Circle product override applied in configurator!');
      } else {
        console.log('❌ ISSUE: Circle product override NOT applied in configurator');
        console.log('Expected: Only sizes 5 and 6');
        console.log('Actual:', sizeIds);
      }
    });

    it('should test the recomputeFiltering function directly', async () => {
      console.log('🧪 Testing recomputeFiltering with circle product');

      const store = useConfiguratorStore.getState();

      // Set up the store state
      const mockProductLine = {
        id: 1,
        name: 'Deco Collection',
        active: true,
        default_options: []
      };

      const mockConfig = {
        id: 'test-config',
        productLineId: 1,
        productLineName: 'Deco Collection',
        mirrorControls: '',
        frameColor: '',
        frameThickness: '',
        mirrorStyle: '11',
        lightDirection: 'd',
        width: '36',
        height: '36',
        mounting: '',
        lighting: '',
        colorTemperature: '',
        lightOutput: '',
        driver: '',
        accessories: [],
        quantity: 1
      };

      const circleProduct = {
        id: 1839,
        name: 'B51b',
        sku_code: 'B51b',
        product_line: 1,
        mirror_style: 11,
        light_direction: 1,
        frame_thickness: null,
        vertical_image: null,
        horizontal_image: null
      };

      // Set initial state
      store.setCurrentProductLine(mockProductLine);
      store.setCurrentProduct(circleProduct);

      // Set configuration
      Object.entries(mockConfig).forEach(([field, value]) => {
        if (field !== 'id') {
          store.updateConfiguration(field as any, value);
        }
      });

      // Call recomputeFiltering directly
      console.log('🔄 Calling recomputeFiltering directly...');
      await store.recomputeFiltering(mockProductLine, mockConfig);

      const finalOptions = store.productOptions;
      console.log('Options after recomputeFiltering:', {
        sizes: finalOptions?.sizes?.length || 0,
        sampleSizes: finalOptions?.sizes?.map(s => `${s.id}:${s.name}`)
      });
    });
  });
});
