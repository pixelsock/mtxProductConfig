// Debug script to examine product SKU structure
// Run this in browser console at localhost:5173

async function debugProductSkuStructure() {
  console.log('🔍 Examining Product SKU Structure...\n');
  
  try {
    // Get the directus service
    const directusService = window.directusService;
    if (!directusService) {
      console.error('❌ Directus service not available');
      return;
    }

    // Fetch products
    console.log('📦 Fetching products...');
    const products = await directusService.getProducts();
    console.log(`✓ Found ${products.length} products\n`);

    // Group products by product line
    const productsByLine = {};
    products.forEach(product => {
      const lineName = product.product_line?.name || 'Unknown';
      const lineSkuCode = product.product_line?.sku_code || 'No SKU';
      
      if (!productsByLine[lineName]) {
        productsByLine[lineName] = {
          lineSkuCode,
          products: []
        };
      }
      productsByLine[lineName].products.push(product);
    });

    // Examine each product line
    Object.entries(productsByLine).forEach(([lineName, data]) => {
      console.log(`📋 Product Line: ${lineName}`);
      console.log(`   Line SKU Code: "${data.lineSkuCode}"`);
      console.log(`   Products: ${data.products.length}`);
      
      // Show first few products as examples
      const examples = data.products.slice(0, 5);
      examples.forEach(product => {
        const productSku = product.sku_code || 'No SKU';
        const firstChar = productSku.charAt(0);
        const matchesLine = firstChar === data.lineSkuCode;
        
        console.log(`     • ${product.name || 'Unnamed'}: "${productSku}" (first char: "${firstChar}", matches line: ${matchesLine ? '✓' : '✗'})`);
      });
      
      if (data.products.length > 5) {
        console.log(`     ... and ${data.products.length - 5} more products`);
      }
      console.log('');
    });

    // Focus on Deco products specifically
    console.log('🎯 Detailed Deco Product Analysis:');
    const decoProducts = products.filter(p => p.product_line?.name === 'Deco');
    
    if (decoProducts.length > 0) {
      const decoLineSkuCode = decoProducts[0].product_line.sku_code;
      console.log(`   Deco Line SKU Code: "${decoLineSkuCode}"`);
      
      // Group by first character
      const skuPatterns = {};
      decoProducts.forEach(product => {
        const sku = product.sku_code || 'No SKU';
        const firstChar = sku.charAt(0);
        
        if (!skuPatterns[firstChar]) {
          skuPatterns[firstChar] = [];
        }
        skuPatterns[firstChar].push({
          name: product.name,
          sku: sku,
          id: product.id
        });
      });
      
      Object.entries(skuPatterns).forEach(([firstChar, products]) => {
        console.log(`   First char "${firstChar}": ${products.length} products`);
        products.slice(0, 3).forEach(p => {
          console.log(`     • ${p.name}: ${p.sku} (ID: ${p.id})`);
        });
        if (products.length > 3) {
          console.log(`     ... and ${products.length - 3} more`);
        }
      });
    }

    // Look at other product lines for comparison
    console.log('\n📊 Summary by Product Line:');
    console.log('Line Name | Line SKU | Products | First Char Patterns');
    console.log('----------|----------|----------|--------------------');
    
    Object.entries(productsByLine).forEach(([lineName, data]) => {
      const firstChars = new Set();
      data.products.forEach(p => {
        const sku = p.sku_code || '';
        if (sku) firstChars.add(sku.charAt(0));
      });
      
      const patterns = Array.from(firstChars).sort().join(', ');
      console.log(`${lineName.padEnd(9)} | ${data.lineSkuCode.padEnd(8)} | ${data.products.length.toString().padEnd(8)} | ${patterns}`);
    });

  } catch (error) {
    console.error('❌ Error examining products:', error);
  }
}

// Auto-run if directus service is ready
if (window.directusService) {
  debugProductSkuStructure();
} else {
  console.log('⏳ Waiting for directus service to load...');
  setTimeout(debugProductSkuStructure, 2000);
}
