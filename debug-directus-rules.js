/**
 * Debug script to check what rules are configured in Directus
 * 
 * Run in browser console after navigating to localhost:5173
 */

async function debugDirectusRules() {
  console.log('🔍 Debugging Directus Rules Configuration');
  
  try {
    // Import the rules service
    const { getRules } = await import('./src/services/directus');
    
    console.log('1️⃣ Fetching rules from Directus...');
    const rules = await getRules();
    
    console.log(`2️⃣ Found ${rules.length} rules in Directus`);
    
    rules.forEach((rule, index) => {
      console.log(`\n📋 Rule ${index + 1}: "${rule.name}"`);
      console.log('   Priority:', rule.priority || 'not set');
      console.log('   Conditions (if_this):', JSON.stringify(rule.if_this, null, 2));
      
      // Get the actions (handle both than_that and then_that)
      const actions = rule.than_that || rule.then_that;
      console.log('   Actions (than_that):', JSON.stringify(actions, null, 2));
      
      // Check if this rule affects SKU codes
      if (actions && typeof actions === 'object') {
        const affectsSku = actions.sku_code || actions.product_line_sku_code || actions.mirror_style_sku_code;
        if (affectsSku) {
          console.log('   🎯 This rule affects SKU generation!');
        }
      }
    });
    
    // Test with our problematic configuration
    console.log('\n🧪 Testing with T01D configuration...');
    const testConfig = {
      product_line: 1,
      mirror_style: 1,
      light_direction: 2,
      frame_thickness: 1,
      mirror_control: 1,
      frame_color: 1,
      mounting: 1,
      driver: 1
    };
    
    const { processRules } = await import('./src/services/rules-engine');
    const result = await processRules(testConfig);
    
    console.log('3️⃣ Rules processing result for test config:');
    console.log('   Input:', testConfig);
    console.log('   Output:', result);
    
    // Check for SKU overrides
    const skuOverrides = {
      sku_code: result.sku_code,
      product_line_sku_code: result.product_line_sku_code,
      mirror_style_sku_code: result.mirror_style_sku_code,
      light_direction_sku_code: result.light_direction_sku_code
    };
    
    console.log('4️⃣ SKU overrides extracted:');
    Object.entries(skuOverrides).forEach(([key, value]) => {
      if (value) {
        console.log(`   ${key}: ${value}`);
      }
    });
    
    if (!Object.values(skuOverrides).some(v => v)) {
      console.log('   ℹ️  No SKU overrides found');
    }
    
    return {
      success: true,
      rulesCount: rules.length,
      rules: rules,
      testResult: result,
      skuOverrides: skuOverrides
    };
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Auto-run
console.log('🚀 Starting Directus Rules Debug...');
debugDirectusRules().then(result => {
  console.log('\n🏁 Debug Complete:', result.success ? 'SUCCESS' : 'FAILED');
  
  if (result.success) {
    console.log('\n💡 SUMMARY:');
    console.log(`- Found ${result.rulesCount} rules in Directus`);
    console.log('- Check the detailed output above to see what rules are configured');
    console.log('- Look for rules that set sku_code, product_line_sku_code, etc.');
  }
});
