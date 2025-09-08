/**
 * Debug Rules → URL Sync Issue
 * 
 * Issue: URL changes from T01D-2436-S-27-N-2-WF-NA to W-2436-S-27-N-2-WF-NA
 * Expected: Should be W01d-2436-S-27-N-2-WF-NA (keeping the 01d part)
 * 
 * To run in browser console:
 * 1. Navigate to localhost:5173
 * 2. Copy this entire file content and paste into console
 * 3. The test will auto-run
 */

async function debugRulesUrlSync() {
  console.log('🐛 DEBUG: Rules → URL Sync Issue');
  console.log('📍 Expected: T01D → W01d, but getting T01D → W');
  
  try {
    // Test configuration that should trigger T01D → W01d transformation
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
      accessories: [],
      width: '24',
      height: '36'
    };

    // Import required modules
    const { processRules } = await import('./services/rules-engine');
    const { buildFullSku } = await import('./utils/sku-builder');
    
    console.log('1️⃣ Test Configuration:', testConfig);
    
    // Mock product line data (like what we'd get from Directus)
    const mockProductLine = {
      id: 1,
      name: 'Vanity',
      sku_code: 'T01D'
    };
    
    // Mock options (simplified for testing)
    const mockOptions = {
      mirrorStyles: [{ id: 1, name: 'Style 1', sku_code: '01' }],
      lightingOptions: [{ id: 2, name: 'Lighting 2', sku_code: 'd' }],
      frameColors: [{ id: 1, name: 'Color 1', sku_code: 'WF' }],
      // ... other options would be here
    };
    
    console.log('2️⃣ Mock Product Line:', mockProductLine);
    
    // Build rules context
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
      accessories: []
    };

    console.log('3️⃣ Rules Context:', rulesContext);

    // Process rules to see what overrides we get
    const rulesResult = await processRules(rulesContext);
    console.log('4️⃣ Rules Engine Result:', rulesResult);
    
    // Extract overrides the way the app does
    const overrides = {
      productSkuOverride: rulesResult.sku_code || undefined,
      productLineSkuOverride: rulesResult.product_line_sku_code || undefined,
      mirrorStyleSkuOverride: rulesResult.mirror_style_sku_code || undefined,
      lightDirectionSkuOverride: rulesResult.light_direction_sku_code || undefined,
    };
    
    console.log('5️⃣ Extracted Overrides:', overrides);
    
    // Test SKU building WITHOUT overrides (original behavior)
    console.log('\\n--- WITHOUT OVERRIDES ---');
    const originalSku = buildFullSku(testConfig, mockOptions, mockProductLine);
    console.log('6️⃣ Original SKU (no overrides):', originalSku);
    
    // Test SKU building WITH overrides (new behavior)
    console.log('\\n--- WITH OVERRIDES ---');
    const overriddenSku = buildFullSku(testConfig, mockOptions, mockProductLine, overrides);
    console.log('7️⃣ Overridden SKU:', overriddenSku);
    
    // Analyze the issue
    console.log('\\n🔍 ANALYSIS:');
    
    if (overrides.productSkuOverride) {
      console.log(`❗ Product SKU Override: "${overrides.productSkuOverride}"`);
      console.log(`   This replaces the entire core (T01D + 01 + d = "T01d01d")`);
      console.log(`   Expected behavior: Override should be "W01d" to replace "T01D"`);
      console.log(`   Current behavior: Override is "${overrides.productSkuOverride}" but missing parts`);
    }
    
    console.log('\\n🎯 ROOT CAUSE ANALYSIS:');
    console.log('1. Rules engine returns sku_code override');
    console.log('2. buildFullSku uses this as the complete core');
    console.log('3. If override is just "W", we lose the "01d" parts');
    console.log('4. Expected: Rules should return complete core "W01d" not just "W"');
    
    return {
      success: true,
      testConfig,
      rulesResult,
      overrides,
      originalSku,
      overriddenSku,
      analysis: 'Rules engine override may be incomplete'
    };
    
  } catch (error) {
    console.error('❌ Debug test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Auto-run the debug test
console.log('🚀 Running Rules URL Debug Test...');
debugRulesUrlSync().then(result => {
  console.log('\\n🏁 DEBUG RESULTS:', result);
  
  if (result.success) {
    console.log('\\n💡 NEXT STEPS:');
    console.log('1. Check what the rules engine is actually returning for sku_code');
    console.log('2. Verify if rules should return complete core (W01d) or just product line (W)');
    console.log('3. Fix either the rules data or the SKU building logic');
  }
});
