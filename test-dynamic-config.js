/**
 * Test Dynamic Configuration System
 * 
 * Tests the new dynamic configuration system that removes hardcoded mappings
 */

import { getDynamicMappings, getMappingForCollection, createDynamicConfig } from './src/services/dynamic-config.ts';
import { buildDynamicSku, validateDynamicConfig } from './src/services/dynamic-sku-builder.ts';
import { getActiveProductLines, getProductLineBySku } from './src/services/directus.ts';

async function testDynamicConfiguration() {
  console.log('🧪 Testing Dynamic Configuration System...\n');

  try {
    // Test 1: Load dynamic mappings
    console.log('1️⃣ Testing dynamic mappings...');
    const mappings = await getDynamicMappings();
    console.log(`   ✓ Loaded ${mappings.length} dynamic mappings:`);
    
    for (const mapping of mappings.slice(0, 5)) {  // Show first 5
      console.log(`     ${mapping.collection} -> ${mapping.configKey} (${mapping.uiType}, sort: ${mapping.sort})`);
    }
    
    // Test 2: Get specific mapping
    console.log('\n2️⃣ Testing specific collection mapping...');
    const frameColorsMapping = await getMappingForCollection('frame_colors');
    if (frameColorsMapping) {
      console.log(`   ✓ Frame colors mapping:`, frameColorsMapping);
    } else {
      console.log('   ❌ No mapping found for frame_colors');
    }

    // Test 3: Load product line and create dynamic config
    console.log('\n3️⃣ Testing dynamic config creation...');
    const decoLine = await getProductLineBySku('D');
    if (decoLine) {
      console.log(`   ✓ Found Deco product line:`, decoLine.name);
      
      const dynamicConfig = await createDynamicConfig(decoLine);
      console.log(`   ✓ Created dynamic config with ${Object.keys(dynamicConfig).length} keys:`);
      console.log('     Config keys:', Object.keys(dynamicConfig).join(', '));
    } else {
      console.log('   ❌ Deco product line not found');
    }

    // Test 4: Validate configuration
    console.log('\n4️⃣ Testing config validation...');
    if (decoLine) {
      const testConfig = await createDynamicConfig(decoLine);
      // Add some test values
      testConfig.frameColor = '1';  // Test with an ID
      testConfig.mirrorStyle = '2';
      
      const validation = await validateDynamicConfig(testConfig);
      console.log(`   Validation result:`, {
        isValid: validation.isValid,
        missingFields: validation.missingFields,
        errorCount: validation.errors.length
      });
    }

    // Test 5: Build dynamic SKU
    console.log('\n5️⃣ Testing dynamic SKU building...');
    if (decoLine) {
      const testConfig = await createDynamicConfig(decoLine);
      // Add minimal required values for testing
      testConfig.productLineId = decoLine.id;
      testConfig.frameColor = '1';
      testConfig.mirrorStyle = '1';
      testConfig.lighting = '1';
      
      const sku = await buildDynamicSku(testConfig);
      console.log(`   ✓ Built SKU: "${sku}" (length: ${sku.length})`);
    }

    console.log('\n✅ Dynamic configuration test completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Dynamic configuration test failed:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testDynamicConfiguration().catch(console.error);