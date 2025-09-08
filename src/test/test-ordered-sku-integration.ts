/**
 * Test Ordered SKU Integration
 * 
 * This script tests the ordered SKU system integration with actual product data
 * to verify that all option sets are properly rendered for Polished Mirrors.
 */

import { getAllProducts, getActiveProductLines, getFilteredOptionsForProductLine } from '../services/directus';
import { getSkuCodeOrder } from '../services/sku-code-order';
import { buildOrderedSku, getCurrentConfigurationDisplay } from '../utils/ordered-sku-builder';

async function testOrderedSkuIntegration() {
  console.log('🧪 Testing Ordered SKU Integration');
  console.log('==================================\n');

  try {
    // 1. Get all product lines to find Polished Mirrors
    console.log('1. Finding Polished Mirrors product line...');
    const productLines = await getActiveProductLines();
    const polishedMirrors = productLines.find(pl => 
      pl.name.toLowerCase().includes('polished') || 
      pl.name.toLowerCase().includes('mirror')
    );
    
    if (!polishedMirrors) {
      console.log('❌ Polished Mirrors product line not found');
      console.log('Available product lines:');
      productLines.forEach(pl => console.log(`  - ${pl.name} (ID: ${pl.id}, SKU: ${pl.sku_code})`));
      return;
    }

    console.log(`✅ Found: ${polishedMirrors.name} (ID: ${polishedMirrors.id}, SKU: ${polishedMirrors.sku_code})`);

    // 2. Get filtered options for Polished Mirrors
    console.log('\n2. Getting filtered options for Polished Mirrors...');
    const filteredOptions = await getFilteredOptionsForProductLine(polishedMirrors);
    
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

    // 4. Create a test configuration
    console.log('\n4. Creating test configuration...');
    const testConfig = {
      productLineId: polishedMirrors.id,
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
      hangingTechnique: '',
      frameColor: filteredOptions.frameColors[0]?.id.toString() || '',
      mirrorControls: filteredOptions.mirrorControls[0]?.id.toString() || ''
    };

    console.log('Test configuration:');
    Object.entries(testConfig).forEach(([key, value]) => {
      if (value) {
        console.log(`  ${key}: ${value}`);
      }
    });

    // 5. Convert to SimpleOptions format
    console.log('\n5. Converting to SimpleOptions format...');
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
      hangingTechniques: [],
      accessories: filteredOptions.accessories,
      frameColors: filteredOptions.frameColors,
      mirrorControls: filteredOptions.mirrorControls
    };

    // 6. Test ordered SKU building
    console.log('\n6. Testing ordered SKU building...');
    const skuResult = await buildOrderedSku(testConfig, simpleOptions, polishedMirrors);
    console.log(`Generated SKU: ${skuResult.sku}`);
    console.log(`Enabled parts: ${skuResult.enabledParts.join(', ')}`);
    console.log('Parts breakdown:');
    Object.entries(skuResult.parts).forEach(([key, value]) => {
      console.log(`  ${key}: ${value}`);
    });

    // 7. Test current configuration display
    console.log('\n7. Testing current configuration display...');
    const configDisplay = await getCurrentConfigurationDisplay(testConfig, simpleOptions, polishedMirrors);
    console.log('Configuration display:');
    Object.entries(configDisplay).forEach(([optionSet, option]) => {
      if (option) {
        console.log(`  ${optionSet}: ${option.name} (${option.sku_code})`);
      } else {
        console.log(`  ${optionSet}: —`);
      }
    });

    // 8. Analysis
    console.log('\n8. Analysis...');
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

    // 9. Check specific option set mappings
    console.log('\n9. Checking option set mappings...');
    const optionSetMappings = {
      'product_lines': 'productLineId',
      'sizes': 'size', 
      'light_outputs': 'lightOutput',
      'color_temperatures': 'colorTemperature',
      'drivers': 'driver',
      'mounting_options': 'mounting',
      'hanging_techniques': 'hangingTechnique',
      'accessories': 'accessories',
      'frame_colors': 'frameColor',
      'mirror_styles': 'mirrorStyle',
      'lighting_options': 'lighting',
      'frame_thickness': 'frameThickness'
    };

    console.log('Option set to config key mappings:');
    Object.entries(optionSetMappings).forEach(([optionSet, configKey]) => {
      const hasData = Object.keys(simpleOptions).includes(configKey) && 
        (simpleOptions as any)[configKey]?.length > 0;
      const isEnabled = enabledOptionSets.includes(optionSet);
      const isSelected = testConfig[configKey as keyof typeof testConfig] && 
        testConfig[configKey as keyof typeof testConfig] !== '';
      
      console.log(`  ${optionSet} -> ${configKey}:`);
      console.log(`    Has data: ${hasData ? '✅' : '❌'}`);
      console.log(`    Is enabled: ${isEnabled ? '✅' : '❌'}`);
      console.log(`    Is selected: ${isSelected ? '✅' : '❌'}`);
    });

    // 10. Summary
    console.log('\n10. Summary');
    console.log('===========');
    
    const totalEnabled = enabledOptionSets.length;
    const skuCount = skuResult.enabledParts.length;
    const configCount = Object.keys(configDisplay).length;
    
    console.log(`Total enabled option sets: ${totalEnabled}`);
    console.log(`SKU parts: ${skuCount}`);
    console.log(`Config display entries: ${configCount}`);
    
    if (skuCount === totalEnabled && configCount === totalEnabled) {
      console.log('✅ SUCCESS: All option sets are properly rendered!');
    } else {
      console.log('❌ ISSUE: Not all option sets are being rendered');
      console.log(`   Expected: ${totalEnabled}, SKU: ${skuCount}, Config: ${configCount}`);
    }

  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
if (import.meta.env.DEV) {
  testOrderedSkuIntegration();
}

export { testOrderedSkuIntegration };
