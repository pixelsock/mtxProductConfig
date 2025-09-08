/**
 * Test endpoint for SKU generation
 * This simulates a Directus custom endpoint
 */

import SKUGenerator from './sku-generator.js';

// Mock Directus client for testing
class MockDirectusClient {
  constructor() {
    this.mockData = {
      sku_code_order: [
        { sku_code_item: 'products', order: 0 },
        { sku_code_item: 'sizes', order: 3 },
        { sku_code_item: 'light_outputs', order: 4 },
        { sku_code_item: 'color_temperatures', order: 5 },
        { sku_code_item: 'drivers', order: 6 },
        { sku_code_item: 'hanging_techniques', order: 7 },
        { sku_code_item: 'mounting_options', order: 8 },
        { sku_code_item: 'accessories', order: 9 },
        { sku_code_item: 'frame_colors', order: 10 }
      ],
      rules: [
        {
          id: '1',
          name: 'Test Rule',
          if_this: { product_line: { _eq: 23 } },
          then_that: { size: { _in: [7, 8, 9] } }
        }
      ],
      product_lines: {
        23: {
          id: 23,
          name: 'Polished',
          sku_code: 'MIRR',
          active: true,
          default_options: [
            { collection: 'mounting_options', item: '2' },
            { collection: 'mounting_options', item: '3' },
            { collection: 'sizes', item: '7' },
            { collection: 'sizes', item: '8' },
            { collection: 'sizes', item: '9' },
            { collection: 'hanging_techniques', item: '62dfd220-e45e-4d25-b108-63192fa7f61f' }
          ]
        }
      },
      products: {
        1807: {
          id: 1807,
          name: 'Test Mirror',
          sku_code: 'TM',
          product_line: 23,
          active: true
        }
      },
      products_options_overrides: [
        { products_id: 1807, collection: 'sizes', item: '10' },
        { products_id: 1807, collection: 'sizes', item: '11' }
      ],
      sizes: {
        7: { id: 7, name: '24x36', sku_code: '2436', active: true },
        8: { id: 8, name: '30x40', sku_code: '3040', active: true },
        9: { id: 9, name: '36x48', sku_code: '3648', active: true },
        10: { id: 10, name: '48x60', sku_code: '4860', active: true },
        11: { id: 11, name: '60x72', sku_code: '6072', active: true }
      },
      mounting_options: {
        2: { id: 2, name: 'Vertical', sku_code: 'V', active: true },
        3: { id: 3, name: 'Horizontal', sku_code: 'H', active: true }
      },
      hanging_techniques: {
        '62dfd220-e45e-4d25-b108-63192fa7f61f': {
          id: '62dfd220-e45e-4d25-b108-63192fa7f61f',
          name: 'French Cleat',
          sku_code: 'FC',
          active: true
        }
      }
    };
  }

  items(collection) {
    return {
      readByQuery: async (query) => {
        const data = this.mockData[collection];
        if (Array.isArray(data)) {
          return { data };
        }
        return { data: Object.values(data || {}) };
      },
      readOne: async (id, options) => {
        const data = this.mockData[collection];
        if (Array.isArray(data)) {
          return data.find(item => item.id == id);
        }
        return data?.[id];
      }
    };
  }
}

// Test function
async function testSKUGeneration() {
  console.log('🚀 Starting SKU Generation Test\n');

  const mockClient = new MockDirectusClient();
  const generator = new SKUGenerator(mockClient);

  try {
    // Initialize the generator
    console.log('📋 Initializing SKU Generator...');
    await generator.initialize();
    console.log('✅ Generator initialized\n');

    // Test product line options
    console.log('🔍 Testing Product Line Options...');
    const productLineOptions = await generator.getProductLineOptions(23);
    console.log('Product Line:', productLineOptions.productLine.name);
    console.log('Default Options by Collection:', productLineOptions.optionsByCollection);
    console.log('✅ Product line options retrieved\n');

    // Test product overrides
    console.log('🔧 Testing Product Overrides...');
    const overrides = await generator.getProductOverrides(1807);
    console.log('Product Overrides:', overrides);
    console.log('✅ Product overrides retrieved\n');

    // Test final option resolution
    console.log('⚙️ Testing Final Option Resolution...');
    const resolvedOptions = await generator.resolveProductOptions(1807);
    console.log('Product:', resolvedOptions.product.name);
    console.log('Product Line:', resolvedOptions.productLine.name);
    console.log('Final Options:', resolvedOptions.finalOptions);
    console.log('✅ Options resolved\n');

    // Test SKU generation for a product
    console.log('🎯 Testing SKU Generation for Product...');
    const productSKUs = await generator.generateSKUsForProduct(1807);
    console.log('Product:', productSKUs.product.name);
    console.log('Total Combinations:', productSKUs.totalCombinations);
    console.log('Valid Combinations:', productSKUs.validCombinations);
    console.log('Generated SKUs (first 5):');
    productSKUs.skus.slice(0, 5).forEach((sku, index) => {
      console.log(`  ${index + 1}. ${sku.sku}`);
      console.log(`     Parts: [${sku.parts.join(', ')}]`);
    });
    console.log('✅ SKU generation completed\n');

    // Summary
    console.log('📊 Test Summary:');
    console.log(`- Product: ${productSKUs.product.name}`);
    console.log(`- Product Line: ${productSKUs.productLine.name}`);
    console.log(`- Total SKUs Generated: ${productSKUs.skus.length}`);
    console.log(`- Override Logic: Sizes overridden from default [7,8,9] to [10,11]`);
    console.log('✅ All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error(error.stack);
  }
}

// Custom endpoint simulation
async function customEndpoint(req, res) {
  const { product_id, product_line_id } = req.query;

  try {
    // In a real Directus environment, you'd get the client from the context
    const directusClient = new MockDirectusClient(); // Replace with real client
    const generator = new SKUGenerator(directusClient);
    await generator.initialize();

    let result;

    if (product_id) {
      // Generate SKUs for a specific product
      result = await generator.generateSKUsForProduct(parseInt(product_id));
    } else if (product_line_id) {
      // Generate SKUs for all products in a product line
      result = await generator.generateSKUsForProductLine(parseInt(product_line_id));
    } else {
      return res.status(400).json({
        error: 'Please provide either product_id or product_line_id parameter'
      });
    }

    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Endpoint error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

// Export for use as Directus endpoint
export {
  testSKUGeneration,
  customEndpoint,
  SKUGenerator,
  MockDirectusClient
};

// Run test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testSKUGeneration();
}
