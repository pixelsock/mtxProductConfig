/**
 * Polished Mirrors Diagnostic Script
 * 
 * This script investigates why only 2 out of 3 option sets are rendering
 * for Polished Mirrors in the current configuration and SKU sections.
 */

import { getAllProducts, getActiveProductLines, getFilteredOptionsForProductLine } from '../services/directus';
import { getSkuCodeOrder } from '../services/sku-code-order';
import { buildOrderedSku, getCurrentConfigurationDisplay } from '../utils/ordered-sku-builder';

async function diagnosePolishedMirrors() {
  console.log('🔍 Polished Mirrors Diagnostic');
  console.log('==============================\n');

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
    console.log(`   Default options: ${polishedMirrors.default_options?.length || 0} items`);

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
      mirrorControls: ''
    };

    console.log('Test configuration:');
    Object.entries(testConfig).forEach(([key, value]) => {
      if (value) {
        console.log(`  ${key}: ${value}`);
      }
    });

    // 5. Test ordered SKU building
    console.log('\n5. Testing ordered SKU building...');
    const skuResult = await buildOrderedSku(testConfig, filteredOptions, polishedMirrors);
    console.log(`Generated SKU: ${skuResult.sku}`);
    console.log(`Enabled parts: ${skuResult.enabledParts.join(', ')}`);
    console.log('Parts breakdown:');
    Object.entries(skuResult.parts).forEach(([key, value]) => {
      console.log(`  ${key}: ${value}`);
    });

    // 6. Test current configuration display
    console.log('\n6. Testing current configuration display...');
    const configDisplay = await getCurrentConfigurationDisplay(testConfig, filteredOptions, polishedMirrors);
    console.log('Configuration display:');
    Object.entries(configDisplay).forEach(([optionSet, option]) => {
      if (option) {
        console.log(`  ${optionSet}: ${option.name} (${option.sku_code})`);
      } else {
        console.log(`  ${optionSet}: —`);
      }
    });

    // 7. Check which option sets should be enabled
    console.log('\n7. Checking which option sets should be enabled...');
    const enabledOptionSets = skuCodeOrder.items
      .filter(item => skuCodeOrder.enabledItems.has(item.sku_code_item))
      .sort((a, b) => a.order - b.order)
      .map(item => item.sku_code_item);

    console.log('Enabled option sets from sku_code_order:');
    enabledOptionSets.forEach(optionSet => {
      console.log(`  - ${optionSet}`);
    });

    // 8. Check which option sets have data
    console.log('\n8. Checking which option sets have data...');
    const optionSetsWithData = Object.entries(filteredOptions)
      .filter(([key, options]) => options.length > 0)
      .map(([key]) => key);

    console.log('Option sets with data:');
    optionSetsWithData.forEach(optionSet => {
      console.log(`  - ${optionSet}`);
    });

    // 9. Check which option sets are selected in config
    console.log('\n9. Checking which option sets are selected in config...');
    const selectedOptionSets = Object.entries(testConfig)
      .filter(([key, value]) => value && value !== '')
      .map(([key, value]) => ({ key, value }));

    console.log('Selected option sets:');
    selectedOptionSets.forEach(({ key, value }) => {
      console.log(`  - ${key}: ${value}`);
    });

    // 10. Identify the issue
    console.log('\n10. Analysis...');
    console.log('================');
    
    const missingFromSku = enabledOptionSets.filter(optionSet => 
      !skuResult.enabledParts.includes(optionSet)
    );
    
    const missingFromConfig = enabledOptionSets.filter(optionSet => 
      !Object.keys(configDisplay).includes(optionSet)
    );

    if (missingFromSku.length > 0) {
      console.log(`❌ Missing from SKU: ${missingFromSku.join(', ')}`);
    }
    
    if (missingFromConfig.length > 0) {
      console.log(`❌ Missing from config display: ${missingFromConfig.join(', ')}`);
    }

    if (missingFromSku.length === 0 && missingFromConfig.length === 0) {
      console.log('✅ All enabled option sets are present in both SKU and config display');
    }

    // 11. Check specific option set mappings
    console.log('\n11. Checking option set mappings...');
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
      const hasData = optionSetsWithData.includes(configKey);
      const isEnabled = enabledOptionSets.includes(optionSet);
      const isSelected = selectedOptionSets.some(s => s.key === configKey);
      
      console.log(`  ${optionSet} -> ${configKey}:`);
      console.log(`    Has data: ${hasData ? '✅' : '❌'}`);
      console.log(`    Is enabled: ${isEnabled ? '✅' : '❌'}`);
      console.log(`    Is selected: ${isSelected ? '✅' : '❌'}`);
    });

  } catch (error) {
    console.error('Diagnostic failed:', error);
  }
}

// Run the diagnostic
if (import.meta.env.DEV) {
  diagnosePolishedMirrors();
}

export { diagnosePolishedMirrors };
