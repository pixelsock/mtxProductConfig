/**
 * SKU Simplification Demo
 * 
 * This script demonstrates the difference between the current complex SKU system
 * and the simplified approach that uses the product's existing sku_code field.
 */

import { getAllProducts } from '../services/directus';
import { buildFullSku } from '../utils/sku-builder';
import { createSimpleSKUDisplay } from '../services/simple-product-matcher';

// Mock data for demonstration
const mockOptions = {
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
  frameColors: [],
  mirrorControls: [],
  mountingOptions: [],
  colorTemperatures: [],
  lightOutputs: [],
  drivers: [],
  accessoryOptions: [],
  sizes: []
};

const mockProductLine = {
  id: 19,
  name: 'Deco',
  sku_code: 'W', // This is the problem - product line has 'W' but products have 'T'
  default_options: []
};

async function demonstrateSKUComplexity() {
  console.log('🔍 SKU Simplification Demo');
  console.log('========================\n');

  try {
    // Get the T22I product from your example
    const products = await getAllProducts();
    const t22iProduct = products.find(p => p.sku_code === 'T22i');
    
    if (!t22iProduct) {
      console.log('❌ T22I product not found. Available products:');
      products.slice(0, 5).forEach(p => {
        console.log(`  - ${p.name}: ${p.sku_code} (ID: ${p.id})`);
      });
      return;
    }

    console.log('📦 Product Found:');
    console.log(`  Name: ${t22iProduct.name}`);
    console.log(`  SKU Code: ${t22iProduct.sku_code}`);
    console.log(`  Product Line: ${t22iProduct.product_line}`);
    console.log(`  Mirror Style: ${t22iProduct.mirror_style}`);
    console.log(`  Light Direction: ${t22iProduct.light_direction}`);
    console.log(`  Frame Thickness: ${t22iProduct.frame_thickness}\n`);

    // Simulate the current complex system
    console.log('🔧 Current Complex System:');
    const complexConfig = {
      productLineId: t22iProduct.product_line,
      mirrorStyle: t22iProduct.mirror_style?.toString(),
      lighting: t22iProduct.light_direction?.toString(),
      frameThickness: t22iProduct.frame_thickness?.toString(),
      frameColor: '',
      mirrorControls: '',
      width: '',
      height: '',
      mounting: '',
      colorTemperature: '',
      lightOutput: '',
      driver: '',
      accessories: []
    };

    const complexResult = buildFullSku(complexConfig, mockOptions, mockProductLine);
    console.log(`  Generated SKU: ${complexResult.sku}`);
    console.log(`  Parts: ${JSON.stringify(complexResult.parts)}`);
    console.log(`  ❌ Problem: This doesn't match the actual product SKU!`);

    // Show the simplified approach
    console.log('\n✨ Simplified Approach:');
    const simpleResult = createSimpleSKUDisplay(t22iProduct);
    console.log(`  Product SKU: ${simpleResult.sku}`);
    console.log(`  Parts: ${JSON.stringify(simpleResult.parts)}`);
    console.log(`  ✅ Perfect: This matches the actual product SKU!`);

    // Show the difference
    console.log('\n📊 Comparison:');
    console.log(`  Complex System: ${complexResult.sku}`);
    console.log(`  Simplified:     ${simpleResult.sku}`);
    console.log(`  Actual Product: ${t22iProduct.sku_code}`);
    console.log(`  Match: ${simpleResult.sku === t22iProduct.sku_code ? '✅ YES' : '❌ NO'}`);

    // Show why the complex system fails
    console.log('\n🔍 Why Complex System Fails:');
    console.log('  1. Product line SKU code: "W" (Wide)');
    console.log('  2. Product actual SKU: "T22i" (Thin)');
    console.log('  3. Rules override: Changes T to W');
    console.log('  4. Result: User sees "W22i" but product is "T22i"');
    console.log('  5. This creates confusion and incorrect URLs');

    console.log('\n💡 Solution:');
    console.log('  - Use product.sku_code directly');
    console.log('  - Skip complex SKU generation');
    console.log('  - Skip rules-based overrides');
    console.log('  - Display actual product SKU to user');

  } catch (error) {
    console.error('Demo failed:', error);
  }
}

// Run the demo
if (import.meta.env.DEV) {
  demonstrateSKUComplexity();
}

export { demonstrateSKUComplexity };
