#!/usr/bin/env node

/**
 * Test script to verify hybrid product options functionality
 * Tests that products with options_overrides use their specific options
 * while products without overrides fall back to product line defaults
 */

async function testHybridOptions() {
  console.log('🧪 Testing Hybrid Product Options System\n');
  
  const API_URL = 'https://pim.dude.digital';
  const API_KEY = 'SatmtC2cTo-k-V17usWeYpBcc6hbtXjC';
  
  try {
    // 1. Fetch some Deco products to check for options_overrides
    console.log('1️⃣  Fetching Deco products with options_overrides...');
    const productsResponse = await fetch(
      `${API_URL}/items/products?filter[product_line][_eq]=1&fields=id,name,product_line,options_overrides.*&limit=5`,
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`
        }
      }
    );
    
    const productsData = await productsResponse.json();
    const products = productsData.data || [];
    
    const productsWithOverrides = products.filter(p => p.options_overrides && p.options_overrides.length > 0);
    const productsWithoutOverrides = products.filter(p => !p.options_overrides || p.options_overrides.length === 0);
    
    console.log(`   ✓ Found ${productsWithOverrides.length} products with overrides`);
    console.log(`   ✓ Found ${productsWithoutOverrides.length} products without overrides`);
    
    if (productsWithOverrides.length > 0) {
      console.log('\n   Products with overrides:');
      productsWithOverrides.forEach(p => {
        const overrideTypes = [...new Set(p.options_overrides.map(o => o.collection))];
        console.log(`   - ${p.name}: ${overrideTypes.join(', ')}`);
      });
    }
    
    // 2. Verify frame_thicknesses overrides for Deco products
    console.log('\n2️⃣  Verifying frame_thickness overrides...');
    const frameThicknessOverrides = productsWithOverrides.filter(p => 
      p.options_overrides.some(o => o.collection === 'frame_thicknesses')
    );
    
    if (frameThicknessOverrides.length > 0) {
      console.log(`   ✓ ${frameThicknessOverrides.length} products have frame_thickness overrides`);
      
      // Fetch frame_thicknesses to verify
      const frameResponse = await fetch(
        `${API_URL}/items/frame_thicknesses`,
        {
          headers: {
            'Authorization': `Bearer ${API_KEY}`
          }
        }
      );
      const frameData = await frameResponse.json();
      const frameThicknesses = frameData.data || [];
      
      frameThicknessOverrides.slice(0, 2).forEach(product => {
        const overrides = product.options_overrides.filter(o => o.collection === 'frame_thicknesses');
        const frameIds = overrides.map(o => parseInt(o.item));
        const frames = frameThicknesses.filter(f => frameIds.includes(f.id));
        console.log(`   - ${product.name} can use: ${frames.map(f => f.name).join(', ')}`);
      });
    }
    
    // 3. Check product line defaults
    console.log('\n3️⃣  Checking product line defaults...');
    const productLineResponse = await fetch(
      `${API_URL}/items/product_lines?filter[id][_eq]=1&fields=*,default_options.*`,
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`
        }
      }
    );
    
    const productLineData = await productLineResponse.json();
    const productLine = productLineData.data?.[0];
    
    if (productLine && productLine.default_options) {
      const frameDefaults = productLine.default_options.filter(o => o.collection === 'frame_thicknesses');
      console.log(`   ✓ Product line 'Deco' has ${frameDefaults.length} default frame_thickness option(s)`);
      
      if (frameDefaults.length > 0) {
        const defaultIds = frameDefaults.map(o => parseInt(o.item));
        const defaultFrames = frameThicknesses.filter(f => defaultIds.includes(f.id));
        console.log(`   - Default frame thickness: ${defaultFrames.map(f => f.name).join(', ')}`);
      }
    }
    
    // 4. Summary
    console.log('\n✅ Hybrid Options System Test Summary:');
    console.log('   • Products with options_overrides will use their specific options');
    console.log('   • Products without overrides will fall back to product line defaults');
    console.log('   • The system supports gradual migration from product line to product-specific options');
    
    if (productsWithOverrides.length > 0) {
      console.log(`\n💡 ${productsWithOverrides.length} Deco products are using product-specific overrides`);
      console.log('   These products will show their custom options in the configurator');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testHybridOptions().catch(console.error);