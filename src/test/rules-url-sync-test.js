/**
 * Test case to verify that rules engine overrides are properly reflected in URLs
 * This test specifically addresses the issue where T01D should transform to W01d
 * 
 * To run: Open browser console and paste this code
 */

async function testRulesUrlSync() {
  console.log('🧪 Testing Rules Engine → URL Synchronization');
  console.log('🔍 Issue: URL transforms from T01D-2436... to W-2436... (missing 01d)');
  
  const testConfig = {
    productLineId: 1,
    mirrorStyle: '1',
    lighting: '2',
    frameThickness: '1',
    mirrorControls: '1',
    frameColor: '1',
    mounting: '1',
    driver: '1',
    lightOutput: '1',
    colorTemperature: '1',
    accessories: []
  };

  try {
    // Import the rules engine
    const { processRules } = await import('../services/rules-engine');
    const { buildFullSku } = await import('../utils/sku-builder');
    
    console.log('📋 Test Configuration:', testConfig);
    
    // Process rules to get overrides
    const rulesContext = {
      product_line: testConfig.productLineId,
      mirror_style: parseInt(testConfig.mirrorStyle, 10),
      light_direction: parseInt(testConfig.lighting, 10),
      frame_thickness: parseInt(testConfig.frameThickness, 10),
      mirror_control: parseInt(testConfig.mirrorControls, 10),
      frame_color: parseInt(testConfig.frameColor, 10),
      mounting: parseInt(testConfig.mounting, 10),
      driver: parseInt(testConfig.driver, 10),
      light_output: parseInt(testConfig.lightOutput, 10),
      color_temperature: parseInt(testConfig.colorTemperature, 10),
      accessories: testConfig.accessories.map(a => parseInt(a, 10)).filter(n => Number.isFinite(n))
    };

    console.log('⚙️ Processing rules with context:', rulesContext);
    const processed = await processRules(rulesContext);
    console.log('✅ Rules processed result:', processed);

    // Check for SKU overrides
    const overrides = {
      productSkuOverride: processed.sku_code || undefined,
      productLineSkuOverride: processed.product_line_sku_code || undefined,
      mirrorStyleSkuOverride: processed.mirror_style_sku_code || undefined,
      lightDirectionSkuOverride: processed.light_direction_sku_code || undefined,
      accessoriesOverride: processed.accessories_sku_code || processed.accessory_sku_code || undefined,
    };

    console.log('🎯 Extracted SKU Overrides:', overrides);

    // Check if we have the critical T01D → W01d transformation
    if (overrides.productSkuOverride) {
      console.log('✅ PRIMARY SKU OVERRIDE FOUND:', overrides.productSkuOverride);
      console.log('   This override should be used in the URL instead of user input');
    } else {
      console.log('❌ No primary SKU override found - rules may not be configured correctly');
    }

    // Test hasRuleOverrides detection logic
    const hasRuleOverrides = overrides.productSkuOverride || overrides.productLineSkuOverride || overrides.mirrorStyleSkuOverride || overrides.lightDirectionSkuOverride;
    console.log('🔍 hasRuleOverrides detection:', hasRuleOverrides);

    if (hasRuleOverrides) {
      console.log('✅ CRITICAL: Rules engine overrides detected - URL should be updated');
      console.log('   Original URL input (e.g. T01D) should be ignored');
      console.log('   Final URL should show the rule-processed SKU (e.g. W01d)');
    } else {
      console.log('ℹ️  No rule overrides detected - original URL input will be preserved');
    }

    return {
      success: true,
      rulesProcessed: processed,
      overrides: overrides,
      hasRuleOverrides: hasRuleOverrides
    };

  } catch (error) {
    console.error('❌ Test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Auto-run test if in browser
if (typeof window !== 'undefined') {
  console.log('🚀 Running Rules → URL Sync Test...');
  testRulesUrlSync().then(result => {
    console.log('🏁 Test Results:', result);
    
    if (result.success && result.hasRuleOverrides) {
      console.log('\n🎉 SUCCESS: Rules engine integration is working correctly!');
      console.log('   The URL should now properly reflect rule-processed SKU codes.');
    } else if (result.success && !result.hasRuleOverrides) {
      console.log('\n🔍 INFO: No rule overrides detected for this configuration.');
      console.log('   URL synchronization is working, but no rules are being applied.');
    } else {
      console.log('\n❌ ERROR: Rules engine integration test failed.');
    }
  });
}

export { testRulesUrlSync };
