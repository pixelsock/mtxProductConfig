/**
 * Polished Mirrors Specific Test
 * 
 * This script tests the ordered SKU system with the specific Polished Mirrors product
 * MIRR-C to verify that all option sets are properly rendered.
 */

import { getAllProducts, getActiveProductLines, getFilteredOptionsForProductLine } from '../services/directus';
import { getSkuCodeOrder } from '../services/sku-code-order';
import { buildOrderedSku, getCurrentConfigurationDisplay } from '../utils/ordered-sku-builder';

// The specific Polished Mirrors product from your example
const POLISHED_MIRRORS_PRODUCT = {
  "id": 1859,
  "name": "MIRR-C",
  "description": "Product for MIRR.pdf",
  "active": true,
  "sort": null,
  "light_direction": null,
  "revit_file": "8d83aedf-fd8d-472f-8695-4517ec767147",
  "spec_sheet": "885ea906-6c71-415a-a193-f5c97155b51f",
  "mirror_style": null,
  "webflow_id": null,
  "horizontal_image": "67354716-bf47-413c-b5a6-166d340929c5",
  "product_line": 23,
  "vertical_image": "ea044592-bbe2-4022-947e-a51efd0b6498",
  "frame_thickness": null,
  "sku_code": "MIRR-C",
  "hanging_technique": "2772f29e-1ea7-4069-8762-de40e940c201",
  "options_overrides": [],
  "additional_images": [261, 262, 263, 264, 265, 266, 267, 268]
};

async function testPolishedMirrorsSpecific() {
  console.log('🔍 Polished Mirrors Specific Test - MIRR-C');
  console.log('==========================================\n');

  try {
    // 1. Find the product line for this product (ID: 23)
    console.log('1. Finding product line 23...');
    const productLines = await getActiveProductLines();
    const productLine = productLines.find(pl => pl.id === 23);
    
    if (!productLine) {
      console.log('❌ Product line 23 not found');
      console.log('Available product lines:');
      productLines.forEach(pl => console.log(`  - ${pl.name} (ID: ${pl.id}, SKU: ${pl.sku_code})`));
      return;
    }

    console.log(`✅ Found product line: ${productLine.name} (ID: ${productLine.id}, SKU: ${productLine.sku_code})`);

    // 2. Get filtered options for this product line
    console.log('\n2. Getting filtered options for product line 23...');
    const filteredOptions = await getFilteredOptionsForProductLine(productLine);
    
    console.log('Available option sets:');
    Object.entries(filteredOptions).forEach(([key, options]) => {
      console.log(`  - ${key}: ${options.length} options`);
      if (options.length > 0) {
        console.log(`    Sample: ${options[0].name} (${options[0].sku_code})`);
      }
    });

    // 3. Check sku_code_order collection
    console.log('\n3. Checking sku_code_order collection...');
    const skuCodeOrder = await getSkuCodeOrder();
    console.log('SKU Code Order:');
    skuCodeOrder.items.forEach(item => {
      console.log(`  ${item.order}. ${item.sku_code_item}`);
    });

    // 4. Analyze the MIRR-C product
    console.log('\n4. Analyzing MIRR-C product...');
    console.log('Product data:');
    console.log(`  - ID: ${POLISHED_MIRRORS_PRODUCT.id}`);
    console.log(`  - Name: ${POLISHED_MIRRORS_PRODUCT.name}`);
    console.log(`  - SKU Code: ${POLISHED_MIRRORS_PRODUCT.sku_code}`);
    console.log(`  - Product Line: ${POLISHED_MIRRORS_PRODUCT.product_line}`);
    console.log(`  - Hanging Technique: ${POLISHED_MIRRORS_PRODUCT.hanging_technique}`);
    console.log(`  - Light Direction: ${POLISHED_MIRRORS_PRODUCT.light_direction}`);
    console.log(`  - Mirror Style: ${POLISHED_MIRRORS_PRODUCT.mirror_style}`);
    console.log(`  - Frame Thickness: ${POLISHED_MIRRORS_PRODUCT.frame_thickness}`);

    // 5. Create a test configuration based on available options
    console.log('\n5. Creating test configuration...');
    const testConfig = {
      productLineId: productLine.id,
      mirrorStyle: filteredOptions.mirrorStyles[0]?.id.toString() || '',
      lighting: filteredOptions.lightingOptions[0]?.id.toString() || '',
      frameThickness: filteredOptions.frameThickness[0]?.id.toString() || '',
      width: '24',
      height: '36',
      mounting: filteredOptions.mountingOptions[0]?.id.toString() || '',
      lightOutput: filteredOptions.lightOutputs[0]?.id.toString() || '',
      colorTemperature: filteredOptions.colorTemperatures[0]?.id.toString() || '',
      driver: filteredOptions.drivers[0]?.id.toString() || '',
      accessories: [],
      hangingTechnique: POLISHED_MIRRORS_PRODUCT.hanging_technique || '',
      frameColor: filteredOptions.frameColors[0]?.id.toString() || '',
      mirrorControls: filteredOptions.mirrorControls[0]?.id.toString() || ''
    };

    console.log('Test configuration:');
    Object.entries(testConfig).forEach(([key, value]) => {
      if (value) {
        console.log(`  ${key}: ${value}`);
      }
    });

    // 6. Convert to SimpleOptions format
    console.log('\n6. Converting to SimpleOptions format...');
    const simpleOptions = {
      productLines: [],
      mirrorStyles: filteredOptions.mirrorStyles,
      lightingOptions: filteredOptions.lightingOptions,
      frameThickness: filteredOptions.frameThickness,
      sizes: filteredOptions.sizes,
      lightOutputs: filteredOptions.lightOutputs,
      colorTemperatures: filteredOptions.colorTemperatures,
      drivers: filteredOptions.drivers,
      mountingOptions: filteredOptions.mountingOptions,
      hangingTechniques: filteredOptions.hangingTechniques || [],
      accessories: filteredOptions.accessories,
      frameColors: filteredOptions.frameColors,
      mirrorControls: filteredOptions.mirrorControls
    };

    // 7. Test ordered SKU building
    console.log('\n7. Testing ordered SKU building...');
    const skuResult = await buildOrderedSku(testConfig, simpleOptions, productLine, {
      productSkuOverride: POLISHED_MIRRORS_PRODUCT.sku_code
    });
    console.log(`Generated SKU: ${skuResult.sku}`);
    console.log(`Enabled parts: ${skuResult.enabledParts.join(', ')}`);
    console.log('Parts breakdown:');
    Object.entries(skuResult.parts).forEach(([key, value]) => {
      console.log(`  ${key}: ${value}`);
    });

    // 8. Test current configuration display
    console.log('\n8. Testing current configuration display...');
    const configDisplay = await getCurrentConfigurationDisplay(testConfig, simpleOptions, productLine);
    console.log('Configuration display:');
    Object.entries(configDisplay).forEach(([optionSet, option]) => {
      if (option) {
        console.log(`  ${optionSet}: ${option.name} (${option.sku_code})`);
      } else {
        console.log(`  ${optionSet}: —`);
      }
    });

    // 9. Analysis
    console.log('\n9. Analysis...');
    console.log('==============');
    
    const enabledOptionSets = skuCodeOrder.items
      .filter(item => skuCodeOrder.enabledItems.has(item.sku_code_item))
      .sort((a, b) => a.order - b.order)
      .map(item => item.sku_code_item);

    console.log(`Total enabled option sets: ${enabledOptionSets.length}`);
    console.log(`Option sets in SKU: ${skuResult.enabledParts.length}`);
    console.log(`Option sets in config display: ${Object.keys(configDisplay).length}`);

    const missingFromSku = enabledOptionSets.filter(optionSet => 
      !skuResult.enabledParts.includes(optionSet)
    );
    
    const missingFromConfig = enabledOptionSets.filter(optionSet => 
      !Object.keys(configDisplay).includes(optionSet)
    );

    if (missingFromSku.length > 0) {
      console.log(`❌ Missing from SKU: ${missingFromSku.join(', ')}`);
    } else {
      console.log('✅ All enabled option sets are present in SKU');
    }
    
    if (missingFromConfig.length > 0) {
      console.log(`❌ Missing from config display: ${missingFromConfig.join(', ')}`);
    } else {
      console.log('✅ All enabled option sets are present in config display');
    }

    // 10. Check specific option sets for Polished Mirrors
    console.log('\n10. Polished Mirrors Specific Analysis...');
    console.log('==========================================');
    
    // Check which option sets have data for this product line
    const optionSetsWithData = Object.entries(simpleOptions)
      .filter(([key, options]) => options && options.length > 0)
      .map(([key]) => key);

    console.log('Option sets with data for Polished Mirrors:');
    optionSetsWithData.forEach(optionSet => {
      console.log(`  - ${optionSet}`);
    });

    // Check which option sets are enabled in sku_code_order
    console.log('\nEnabled option sets from sku_code_order:');
    enabledOptionSets.forEach(optionSet => {
      console.log(`  - ${optionSet}`);
    });

    // Check which option sets are selected in our test config
    const selectedOptionSets = Object.entries(testConfig)
      .filter(([key, value]) => value && value !== '')
      .map(([key, value]) => ({ key, value }));

    console.log('\nSelected option sets in test config:');
    selectedOptionSets.forEach(({ key, value }) => {
      console.log(`  - ${key}: ${value}`);
    });

    // 11. Summary
    console.log('\n11. Summary');
    console.log('===========');
    
    const totalEnabled = enabledOptionSets.length;
    const skuCount = skuResult.enabledParts.length;
    const configCount = Object.keys(configDisplay).length;
    
    console.log(`Total enabled option sets: ${totalEnabled}`);
    console.log(`SKU parts: ${skuCount}`);
    console.log(`Config display entries: ${configCount}`);
    
    if (skuCount === totalEnabled && configCount === totalEnabled) {
      console.log('✅ SUCCESS: All option sets are properly rendered for Polished Mirrors!');
    } else {
      console.log('❌ ISSUE: Not all option sets are being rendered for Polished Mirrors');
      console.log(`   Expected: ${totalEnabled}, SKU: ${skuCount}, Config: ${configCount}`);
      
      if (missingFromSku.length > 0) {
        console.log(`   Missing from SKU: ${missingFromSku.join(', ')}`);
      }
      if (missingFromConfig.length > 0) {
        console.log(`   Missing from config: ${missingFromConfig.join(', ')}`);
      }
    }

    // 12. Product-specific insights
    console.log('\n12. Product-Specific Insights');
    console.log('=============================');
    console.log(`Product SKU: ${POLISHED_MIRRORS_PRODUCT.sku_code}`);
    console.log(`Product has hanging technique: ${POLISHED_MIRRORS_PRODUCT.hanging_technique ? 'Yes' : 'No'}`);
    console.log(`Product has light direction: ${POLISHED_MIRRORS_PRODUCT.light_direction ? 'Yes' : 'No'}`);
    console.log(`Product has mirror style: ${POLISHED_MIRRORS_PRODUCT.mirror_style ? 'Yes' : 'No'}`);
    console.log(`Product has frame thickness: ${POLISHED_MIRRORS_PRODUCT.frame_thickness ? 'Yes' : 'No'}`);

  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
if (import.meta.env.DEV) {
  testPolishedMirrorsSpecific();
}

export { testPolishedMirrorsSpecific };
