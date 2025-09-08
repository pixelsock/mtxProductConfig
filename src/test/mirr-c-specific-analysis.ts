/**
 * MIRR-C Specific Analysis
 * 
 * This script analyzes the specific MIRR-C product to understand
 * which option sets should be available for Polished Mirrors.
 */

import { getAllProducts, getActiveProductLines, getFilteredOptionsForProductLine } from '../services/directus';
import { getSkuCodeOrder } from '../services/sku-code-order';
import { buildOrderedSku, getCurrentConfigurationDisplay } from '../utils/ordered-sku-builder';

// The specific MIRR-C product
const MIRR_C_PRODUCT = {
  "id": 1859,
  "name": "MIRR-C",
  "sku_code": "MIRR-C",
  "product_line": 23,
  "hanging_technique": "2772f29e-1ea7-4069-8762-de40e940c201",
  "light_direction": null,
  "mirror_style": null,
  "frame_thickness": null
};

async function analyzeMirrC() {
  console.log('🔍 MIRR-C Specific Analysis');
  console.log('==========================\n');

  try {
    // 1. Find the product line
    console.log('1. Finding product line 23...');
    const productLines = await getActiveProductLines();
    const productLine = productLines.find(pl => pl.id === 23);
    
    if (!productLine) {
      console.log('❌ Product line 23 not found');
      return;
    }

    console.log(`✅ Found: ${productLine.name} (ID: ${productLine.id}, SKU: ${productLine.sku_code})`);

    // 2. Get all products for this product line to understand the pattern
    console.log('\n2. Analyzing all products in product line 23...');
    const allProducts = await getAllProducts();
    const productsInLine = allProducts.filter(p => p.product_line === 23);
    
    console.log(`Found ${productsInLine.length} products in product line 23:`);
    productsInLine.slice(0, 5).forEach(product => {
      console.log(`  - ${product.name} (SKU: ${product.sku_code})`);
      console.log(`    Hanging Technique: ${product.hanging_technique || 'null'}`);
      console.log(`    Light Direction: ${product.light_direction || 'null'}`);
      console.log(`    Mirror Style: ${product.mirror_style || 'null'}`);
      console.log(`    Frame Thickness: ${product.frame_thickness || 'null'}`);
      console.log('');
    });

    // 3. Get filtered options for this product line
    console.log('3. Getting filtered options for product line 23...');
    const filteredOptions = await getFilteredOptionsForProductLine(productLine);
    
    console.log('Available option sets:');
    Object.entries(filteredOptions).forEach(([key, options]) => {
      console.log(`  - ${key}: ${options.length} options`);
      if (options.length > 0) {
        console.log(`    Sample: ${options[0].name} (${options[0].sku_code})`);
      }
    });

    // 4. Check sku_code_order collection
    console.log('\n4. Checking sku_code_order collection...');
    const skuCodeOrder = await getSkuCodeOrder();
    console.log('SKU Code Order:');
    skuCodeOrder.items.forEach(item => {
      console.log(`  ${item.order}. ${item.sku_code_item}`);
    });

    // 5. Analyze which option sets have data for this product line
    console.log('\n5. Analyzing option set availability...');
    
    const optionSetAnalysis = {
      'product_lines': { hasData: true, sample: productLine.sku_code },
      'sizes': { hasData: filteredOptions.sizes.length > 0, sample: filteredOptions.sizes[0]?.sku_code },
      'light_outputs': { hasData: filteredOptions.lightOutputs.length > 0, sample: filteredOptions.lightOutputs[0]?.sku_code },
      'color_temperatures': { hasData: filteredOptions.colorTemperatures.length > 0, sample: filteredOptions.colorTemperatures[0]?.sku_code },
      'drivers': { hasData: filteredOptions.drivers.length > 0, sample: filteredOptions.drivers[0]?.sku_code },
      'mounting_options': { hasData: filteredOptions.mountingOptions.length > 0, sample: filteredOptions.mountingOptions[0]?.sku_code },
      'hanging_techniques': { hasData: filteredOptions.hangingTechniques?.length > 0, sample: filteredOptions.hangingTechniques?.[0]?.sku_code },
      'accessories': { hasData: filteredOptions.accessories.length > 0, sample: filteredOptions.accessories[0]?.sku_code },
      'frame_colors': { hasData: filteredOptions.frameColors.length > 0, sample: filteredOptions.frameColors[0]?.sku_code },
      'mirror_styles': { hasData: filteredOptions.mirrorStyles.length > 0, sample: filteredOptions.mirrorStyles[0]?.sku_code },
      'lighting_options': { hasData: filteredOptions.lightingOptions.length > 0, sample: filteredOptions.lightingOptions[0]?.sku_code },
      'frame_thickness': { hasData: filteredOptions.frameThickness.length > 0, sample: filteredOptions.frameThickness[0]?.sku_code }
    };

    console.log('Option set analysis:');
    Object.entries(optionSetAnalysis).forEach(([optionSet, analysis]) => {
      const status = analysis.hasData ? '✅' : '❌';
      const sample = analysis.sample ? ` (${analysis.sample})` : '';
      console.log(`  ${status} ${optionSet}: ${analysis.hasData ? 'Available' : 'Not available'}${sample}`);
    });

    // 6. Create a realistic test configuration
    console.log('\n6. Creating realistic test configuration...');
    const testConfig = {
      productLineId: productLine.id,
      mirrorStyle: '', // Not available for this product line
      lighting: '', // Not available for this product line
      frameThickness: '', // Not available for this product line
      width: '24',
      height: '36',
      mounting: filteredOptions.mountingOptions[0]?.id.toString() || '',
      lightOutput: filteredOptions.lightOutputs[0]?.id.toString() || '',
      colorTemperature: filteredOptions.colorTemperatures[0]?.id.toString() || '',
      driver: filteredOptions.drivers[0]?.id.toString() || '',
      accessories: [],
      hangingTechnique: MIRR_C_PRODUCT.hanging_technique || '',
      frameColor: filteredOptions.frameColors[0]?.id.toString() || '',
      mirrorControls: ''
    };

    console.log('Test configuration:');
    Object.entries(testConfig).forEach(([key, value]) => {
      if (value) {
        console.log(`  ${key}: ${value}`);
      }
    });

    // 7. Convert to SimpleOptions format
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

    // 8. Test ordered SKU building
    console.log('\n7. Testing ordered SKU building...');
    const skuResult = await buildOrderedSku(testConfig, simpleOptions, productLine, {
      productSkuOverride: MIRR_C_PRODUCT.sku_code
    });
    console.log(`Generated SKU: ${skuResult.sku}`);
    console.log(`Enabled parts: ${skuResult.enabledParts.join(', ')}`);
    console.log('Parts breakdown:');
    Object.entries(skuResult.parts).forEach(([key, value]) => {
      console.log(`  ${key}: ${value}`);
    });

    // 9. Test current configuration display
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

    // 10. Summary
    console.log('\n9. Summary');
    console.log('===========');
    
    const enabledOptionSets = skuCodeOrder.items
      .filter(item => skuCodeOrder.enabledItems.has(item.sku_code_item))
      .sort((a, b) => a.order - b.order)
      .map(item => item.sku_code_item);

    const availableOptionSets = Object.entries(optionSetAnalysis)
      .filter(([_, analysis]) => analysis.hasData)
      .map(([optionSet, _]) => optionSet);

    console.log(`Total enabled option sets: ${enabledOptionSets.length}`);
    console.log(`Available option sets for this product line: ${availableOptionSets.length}`);
    console.log(`Option sets in SKU: ${skuResult.enabledParts.length}`);
    console.log(`Option sets in config display: ${Object.keys(configDisplay).length}`);

    console.log('\nAvailable option sets:');
    availableOptionSets.forEach(optionSet => {
      console.log(`  - ${optionSet}`);
    });

    console.log('\nEnabled option sets from sku_code_order:');
    enabledOptionSets.forEach(optionSet => {
      console.log(`  - ${optionSet}`);
    });

    // 11. Expected behavior
    console.log('\n10. Expected Behavior');
    console.log('=====================');
    console.log('For Polished Mirrors (MIRR-C), the system should show:');
    console.log('1. Product Line: MIRR (from product.sku_code)');
    console.log('2. Size: 24x36 (from dimensions)');
    console.log('3. Hanging Technique: (from product.hanging_technique)');
    console.log('4. Any other option sets that have data for this product line');
    
    const expectedOptionSets = ['product_lines', 'sizes', 'hanging_techniques'];
    const additionalOptionSets = availableOptionSets.filter(optionSet => 
      !expectedOptionSets.includes(optionSet)
    );
    
    if (additionalOptionSets.length > 0) {
      console.log('5. Additional option sets with data:');
      additionalOptionSets.forEach(optionSet => {
        console.log(`   - ${optionSet}`);
      });
    }

  } catch (error) {
    console.error('Analysis failed:', error);
  }
}

// Run the analysis
if (import.meta.env.DEV) {
  analyzeMirrC();
}

export { analyzeMirrC };
