/**
 * Simple test for dynamic configuration by checking API data
 */

console.log('🧪 Testing Dynamic Configuration API Access...');

// Test basic API connection
const testApiAccess = async () => {
  try {
    console.log('1️⃣ Testing product_lines access...');
    const response = await fetch('https://pim.dude.digital/items/product_lines?limit=5');
    if (response.ok) {
      const data = await response.json();
      console.log(`   ✅ Got ${data.data.length} product lines`);
      
      // Look for Deco line
      const decoLine = data.data.find(line => line.sku_code === 'D' || line.sku_code === 'W');
      if (decoLine) {
        console.log(`   ✅ Found Deco line: ${decoLine.name} (SKU: ${decoLine.sku_code})`);
      }
    } else {
      console.log(`   ❌ API request failed: ${response.status}`);
    }

    console.log('\n2️⃣ Testing configuration_ui access...');
    const configResponse = await fetch('https://pim.dude.digital/items/configuration_ui?limit=10');
    if (configResponse.ok) {
      const configData = await configResponse.json();
      console.log(`   ✅ Configuration UI has ${configData.data.length} items`);
      
      // Show first few mappings
      configData.data.slice(0, 3).forEach(item => {
        console.log(`     ${item.collection} -> UI: ${item.ui_type}, sort: ${item.sort}`);
      });
    } else {
      console.log(`   ❌ Configuration UI request failed: ${configResponse.status}`);
    }

    console.log('\n3️⃣ Testing sku_code_order access...');
    const skuResponse = await fetch('https://pim.dude.digital/items/sku_code_order?limit=20&sort=order');
    if (skuResponse.ok) {
      const skuData = await skuResponse.json();
      console.log(`   ✅ SKU code order has ${skuData.data.length} items`);
      
      // Show order
      skuData.data.slice(0, 5).forEach(item => {
        console.log(`     ${item.order}: ${item.sku_code_item}`);
      });
    } else {
      console.log(`   ❌ SKU code order request failed: ${skuResponse.status}`);
    }

    console.log('\n✅ API connectivity test completed!');
    
  } catch (error) {
    console.error('\n❌ API test failed:', error.message);
  }
};

testApiAccess();