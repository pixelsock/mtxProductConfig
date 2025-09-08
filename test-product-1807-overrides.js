#!/usr/bin/env node

// Test script to verify product 1807 options_overrides functionality
import { getAllProducts, getActiveProductLines, getFilteredOptionsForProduct } from './src/services/directus.ts';

async function testProduct1807Overrides() {
  console.log('🧪 Testing Product 1807 options_overrides functionality...\n');

  try {
    // 1. Get all products and find product 1807
    console.log('1. Fetching all products...');
    const allProducts = await getAllProducts();
    const product1807 = allProducts.find(p => p.id === '1807' || p.id === 1807);
    
    if (!product1807) {
      console.error('❌ Product 1807 not found!');
      return;
    }

    console.log('✓ Found product 1807:', {
      id: product1807.id,
      name: product1807.name,
      product_line: product1807.product_line,
      options_overrides: product1807.options_overrides
    });

    // 2. Get the product line for product 1807
    console.log('\n2. Fetching product lines...');
    const productLines = await getActiveProductLines();
    const productLine = productLines.find(pl => pl.id === product1807.product_line);
    
    if (!productLine) {
      console.error('❌ Product line not found for product 1807!');
      return;
    }

    console.log('✓ Found product line:', {
      id: productLine.id,
      name: productLine.name,
      sku_code: productLine.sku_code,
      default_options: productLine.default_options ? productLine.default_options.length + ' options' : 'none'
    });

    // 3. Test the new override-aware function
    console.log('\n3. Testing override-aware filtering...');
    const filteredOptions = await getFilteredOptionsForProduct(product1807, productLine);
    
    console.log('✓ Override-aware filtering results:');
    Object.entries(filteredOptions).forEach(([key, options]) => {
      if (Array.isArray(options) && options.length > 0) {
        console.log(`  - ${key}: ${options.length} options`);
        options.slice(0, 3).forEach(opt => {
          console.log(`    * ${opt.name || opt.id} (ID: ${opt.id})`);
        });
        if (options.length > 3) {
          console.log(`    ... and ${options.length - 3} more`);
        }
      }
    });

    // 4. Verify specific overrides
    if (product1807.options_overrides && product1807.options_overrides.length > 0) {
      console.log('\n4. Verifying specific overrides are applied...');
      const overrideIds = product1807.options_overrides;
      console.log('Expected override IDs:', overrideIds);
      
      // Check each collection to see if only override IDs are included
      let foundOverrides = [];
      Object.entries(filteredOptions).forEach(([collectionName, options]) => {
        if (Array.isArray(options)) {
          const optionIds = options.map(opt => opt.id);
          const matchingIds = overrideIds.filter(id => optionIds.includes(id));
          if (matchingIds.length > 0) {
            foundOverrides.push({
              collection: collectionName,
              matchingIds,
              totalOptions: options.length
            });
          }
        }
      });

      if (foundOverrides.length > 0) {
        console.log('✅ Found options matching override IDs:');
        foundOverrides.forEach(({ collection, matchingIds, totalOptions }) => {
          console.log(`  - ${collection}: ${matchingIds.length}/${totalOptions} options match overrides (${matchingIds.join(', ')})`);
        });
      } else {
        console.log('⚠️ No options found matching override IDs - this might indicate an issue');
      }
    } else {
      console.log('\n4. No options_overrides found for product 1807');
    }

    console.log('\n🎉 Test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error(error.stack);
  }
}

testProduct1807Overrides();