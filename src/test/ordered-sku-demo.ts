/**
 * Ordered SKU Demo
 * 
 * This script demonstrates how the ordered SKU system works
 * using the sku_code_order collection to determine SKU structure.
 */

import { buildOrderedSku, getCurrentConfigurationDisplay } from '../utils/ordered-sku-builder';

// Mock sku_code_order data (from your example)
const mockSkuCodeOrder = {
  items: [
    { id: 'f24ac8f4-1015-4950-a726-f09c040de579', sku_code_item: 'product_lines', order: 1 },
    { id: '43aa9bcd-c6cb-40fb-944e-b15894905006', sku_code_item: 'sizes', order: 2 },
    { id: '259c5673-ba56-42c1-aa01-9c78e950cc1c', sku_code_item: 'light_outputs', order: 3 },
    { id: '69b349b4-d535-4ba3-a6af-21c11a4cee1a', sku_code_item: 'color_temperatures', order: 4 },
    { id: '41e19b5b-847e-4474-ac82-ae4b9de4f4d4', sku_code_item: 'drivers', order: 5 },
    { id: 'e2e58b31-269f-498e-ad3b-145f8bd82b71', sku_code_item: 'mounting_options', order: 6 },
    { id: '40ebb49c-9e3c-44e7-8b42-10c9a4a449cf', sku_code_item: 'hanging_techniques', order: 7 },
    { id: '3a3141f0-e546-4fd6-81be-9337459a2d4c', sku_code_item: 'accessories', order: 8 },
    { id: '6cfb0c55-43da-4077-88d5-d5773b95b480', sku_code_item: 'frame_colors', order: 9 }
  ],
  enabledItems: new Set([
    'product_lines', 'sizes', 'light_outputs', 'color_temperatures',
    'drivers', 'mounting_options', 'hanging_techniques', 'accessories', 'frame_colors'
  ])
};

// Mock options data
const mockOptions = {
  productLines: [
    { id: 19, name: 'Deco', sku_code: 'D' }
  ],
  mirrorStyles: [
    { id: 13, name: 'Style 22', sku_code: '22' },
    { id: 1, name: 'Style 01', sku_code: '01' }
  ],
  lightingOptions: [
    { id: 1, name: 'Direct', sku_code: 'D' },
    { id: 2, name: 'Indirect', sku_code: 'i' }
  ],
  frameThickness: [
    { id: 1, name: 'Thin', sku_code: 'T' },
    { id: 2, name: 'Wide', sku_code: 'W' }
  ],
  sizes: [
    { id: 1, name: '24x36', sku_code: '2436', width: 24, height: 36 },
    { id: 2, name: '30x40', sku_code: '3040', width: 30, height: 40 }
  ],
  lightOutputs: [
    { id: 1, name: 'High', sku_code: 'H' },
    { id: 2, name: 'Medium', sku_code: 'M' }
  ],
  colorTemperatures: [
    { id: 1, name: '3000K', sku_code: '3K' },
    { id: 2, name: '4000K', sku_code: '4K' }
  ],
  drivers: [
    { id: 1, name: 'Standard', sku_code: 'STD' },
    { id: 2, name: 'Dimmable', sku_code: 'DIM' }
  ],
  mountingOptions: [
    { id: 1, name: 'Wall Mount', sku_code: 'WM' },
    { id: 2, name: 'Ceiling Mount', sku_code: 'CM' }
  ],
  hangingTechniques: [
    { id: 1, name: 'French Cleat', sku_code: 'FC' },
    { id: 2, name: 'Wire', sku_code: 'W' }
  ],
  accessories: [
    { id: 1, name: 'Remote Control', sku_code: 'RC' },
    { id: 2, name: 'Motion Sensor', sku_code: 'MS' }
  ],
  frameColors: [
    { id: 1, name: 'Black', sku_code: 'BLK' },
    { id: 2, name: 'White', sku_code: 'WHT' }
  ],
  mirrorControls: [],
  frameColors: []
};

const mockProductLine = {
  id: 19,
  name: 'Deco',
  sku_code: 'D',
  default_options: []
};

async function demonstrateOrderedSKU() {
  console.log('🔍 Ordered SKU Demo');
  console.log('==================\n');

  try {
    // Test 1: Basic configuration with product SKU override
    console.log('📦 Test 1: Using Product SKU Override (T22i)');
    console.log('---------------------------------------------');
    
    const config1 = {
      productLineId: 19,
      mirrorStyle: '13',
      lighting: '2',
      frameThickness: '1',
      width: '24',
      height: '36',
      mounting: '1',
      lightOutput: '1',
      colorTemperature: '1',
      driver: '1',
      accessories: ['1', '2'],
      hangingTechnique: '1',
      frameColor: '1',
      mirrorControls: ''
    };

    const result1 = await buildOrderedSku(config1, mockOptions, mockProductLine, {
      productSkuOverride: 'T22i' // This overrides the core SKU
    });

    console.log(`  Generated SKU: ${result1.sku}`);
    console.log(`  Enabled Parts: ${result1.enabledParts.join(', ')}`);
    console.log(`  Parts: ${JSON.stringify(result1.parts, null, 2)}`);

    // Test 2: Configuration without product SKU override
    console.log('\n📦 Test 2: Generated SKU from Parts');
    console.log('-----------------------------------');
    
    const result2 = await buildOrderedSku(config1, mockOptions, mockProductLine);

    console.log(`  Generated SKU: ${result2.sku}`);
    console.log(`  Enabled Parts: ${result2.enabledParts.join(', ')}`);
    console.log(`  Parts: ${JSON.stringify(result2.parts, null, 2)}`);

    // Test 3: Minimal configuration (only core)
    console.log('\n📦 Test 3: Minimal Configuration');
    console.log('--------------------------------');
    
    const config3 = {
      productLineId: 19,
      mirrorStyle: '13',
      lighting: '2',
      frameThickness: '1',
      width: '',
      height: '',
      mounting: '',
      lightOutput: '',
      colorTemperature: '',
      driver: '',
      accessories: [],
      hangingTechnique: '',
      frameColor: '',
      mirrorControls: ''
    };

    const result3 = await buildOrderedSku(config3, mockOptions, mockProductLine, {
      productSkuOverride: 'T22i'
    });

    console.log(`  Generated SKU: ${result3.sku}`);
    console.log(`  Enabled Parts: ${result3.enabledParts.join(', ')}`);
    console.log(`  Parts: ${JSON.stringify(result3.parts, null, 2)}`);

    // Test 4: Current configuration display
    console.log('\n📦 Test 4: Current Configuration Display');
    console.log('----------------------------------------');
    
    const configDisplay = await getCurrentConfigurationDisplay(config1, mockOptions, mockProductLine);
    
    console.log('  Current Configuration:');
    Object.entries(configDisplay).forEach(([optionSet, option]) => {
      if (option) {
        console.log(`    ${optionSet}: ${option.name} (${option.sku_code})`);
      } else {
        console.log(`    ${optionSet}: —`);
      }
    });

    // Show the SKU code order
    console.log('\n📋 SKU Code Order:');
    console.log('-----------------');
    mockSkuCodeOrder.items.forEach(item => {
      console.log(`  ${item.order}. ${item.sku_code_item}`);
    });

    console.log('\n💡 Key Benefits:');
    console.log('  ✅ SKU order is defined by sku_code_order collection');
    console.log('  ✅ Only enabled option sets are included');
    console.log('  ✅ Product SKU override takes precedence');
    console.log('  ✅ Configuration display shows selected options');
    console.log('  ✅ Flexible and maintainable');

  } catch (error) {
    console.error('Demo failed:', error);
  }
}

// Run the demo
if (import.meta.env.DEV) {
  demonstrateOrderedSKU();
}

export { demonstrateOrderedSKU };
