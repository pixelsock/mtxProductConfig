/**
 * Test the SKU building fix
 * 
 * Issue: Rules return "W" as productSkuOverride, but we need "W01d"
 * Fix: Check if override is partial and build complete core
 * 
 * Run in browser console after navigating to localhost:5173
 */

async function testSkuFix() {
  console.log('🔧 Testing SKU Building Fix');
  
  try {
    const { buildFullSku } = await import('./src/utils/sku-builder');
    
    // Mock data
    const config = {
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
    
    const options = {
      mirrorStyles: [{ id: 1, name: 'Style 1', sku_code: '01' }],
      lightingOptions: [{ id: 2, name: 'Lighting 2', sku_code: 'd' }],
      frameColors: [{ id: 1, name: 'Color 1', sku_code: 'WF' }],
      sizes: [],
      lightOutputs: [{ id: 1, name: 'Output 1', sku_code: 'S' }],
      colorTemperatures: [{ id: 1, name: 'Temp 1', sku_code: '27' }],
      drivers: [{ id: 1, name: 'Driver 1', sku_code: 'N' }],
      mountingOptions: [{ id: 1, name: 'Mount 1', sku_code: '2' }],
      accessoryOptions: [{ id: 1, name: 'Accessory 1', sku_code: 'NA' }]
    };
    
    const productLine = {
      id: 1,
      name: 'Vanity',
      sku_code: 'T01D'
    };
    
    console.log('Test 1: Original behavior (no overrides)');
    const original = buildFullSku(config, options, productLine);
    console.log('Result:', original);
    console.log('Expected core: T01D01d');
    
    console.log('\nTest 2: Problematic override (just "W")');
    const overrides1 = { productSkuOverride: 'W' };
    const withPartialOverride = buildFullSku(config, options, productLine, overrides1);
    console.log('Result:', withPartialOverride);
    console.log('Expected core: W01d (W + 01 + d)');
    
    console.log('\nTest 3: Complete override (full core)');
    const overrides2 = { productSkuOverride: 'CUSTOM123' };
    const withCompleteOverride = buildFullSku(config, options, productLine, overrides2);
    console.log('Result:', withCompleteOverride);
    console.log('Expected core: CUSTOM123 (use as-is)');
    
    // Verify the fix
    const isFixed = withPartialOverride.parts.core === 'W01d';
    console.log(`\n${isFixed ? '✅' : '❌'} Fix ${isFixed ? 'SUCCESSFUL' : 'FAILED'}`);
    
    if (isFixed) {
      console.log('🎉 The URL should now show W01d-2436... instead of W-2436...');
    } else {
      console.log('❌ Core is still:', withPartialOverride.parts.core);
    }
    
    return {
      success: true,
      isFixed,
      original,
      withPartialOverride,
      withCompleteOverride
    };
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return { success: false, error: error.message };
  }
}

// Auto-run
console.log('🚀 Testing SKU building fix...');
testSkuFix().then(result => {
  console.log('\n🏁 Test Complete:', result);
});
