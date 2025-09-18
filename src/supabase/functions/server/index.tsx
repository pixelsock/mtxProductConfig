import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Initialize Supabase client for direct database access with unlimited query settings
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  {
    db: {
      schema: 'public'
    },
    global: {
      headers: {
        // Request no row limits and exact counts
        'Prefer': 'count=exact',
        // Set a longer timeout for large queries
        'X-Client-Info': 'matrix-mirror-configurator'
      }
    }
  }
);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-8bb96920/health", (c) => {
  return c.json({ status: "ok" });
});

// Get product lines from normalized database structure - SIMPLIFIED VERSION
app.get("/make-server-8bb96920/product-lines", async (c) => {
  try {
    console.log('Loading product lines from normalized database structure...');
    
    // Simple, direct query for product lines
    console.log('Querying product_lines table...');
    const { data: productLinesData, error: productLinesError } = await supabase
      .from('product_lines')
      .select('*')
      .order('name', { ascending: true });
    
    if (productLinesError) {
      console.error('Failed to query product_lines table:', productLinesError);
      return c.json({ 
        error: 'Failed to access product_lines table', 
        details: productLinesError.message,
        suggestion: 'Check if product_lines table exists and is accessible'
      }, 500);
    }
    
    if (!productLinesData || productLinesData.length === 0) {
      console.log('No product lines found in product_lines table');
      return c.json({ 
        error: 'No product lines found in database despite table existing',
        productLines: [],
        totalSkus: 0,
        suggestion: 'Product_lines table exists but contains no data'
      }, 404);
    }
    
    console.log(`Found ${productLinesData.length} product lines in database:`, productLinesData.map(line => `${line.name} (ID: ${line.id})`));
    
    // Get SKU counts for each product line (in parallel for better performance)
    console.log('Getting SKU counts for each product line...');
    const productLineCountPromises = productLinesData.map(async (line) => {
      try {
        const { count: skuCount, error: countError } = await supabase
          .from('sku_index')
          .select('id', { count: 'exact', head: true })
          .eq('product_line_id', line.id);
        
        if (countError) {
          console.warn(`Failed to count SKUs for product line ${line.id} (${line.name}):`, countError.message);
          return {
            id: line.id,
            label: line.name || `Product Line ${line.id}`,
            value: line.id,
            count: 0,
            description: line.description || `${line.name || 'Product Line'} mirrors and configurations`,
            raw: line,
            error: countError.message
          };
        }
        
        return {
          id: line.id,
          label: line.name || `Product Line ${line.id}`,
          value: line.id,
          count: skuCount || 0,
          description: line.description || `${line.name || 'Product Line'} mirrors and configurations`,
          raw: line
        };
      } catch (error) {
        console.warn(`Exception counting SKUs for product line ${line.id}:`, error);
        return {
          id: line.id,
          label: line.name || `Product Line ${line.id}`,
          value: line.id,
          count: 0,
          description: line.description || `${line.name || 'Product Line'} mirrors and configurations`,
          raw: line,
          error: error.message
        };
      }
    });
    
    const productLinesWithCounts = await Promise.all(productLineCountPromises);
    const totalSkus = productLinesWithCounts.reduce((sum, line) => sum + line.count, 0);
    
    console.log(`Successfully loaded ${productLinesWithCounts.length} product lines with ${totalSkus} total SKUs`);
    console.log('Product line summary:', productLinesWithCounts.map(line => `${line.label}: ${line.count} SKUs${line.error ? ` (Error: ${line.error})` : ''}`));
    
    return c.json({ 
      productLines: productLinesWithCounts, 
      totalSkus,
      debugInfo: {
        totalProductLines: productLinesWithCounts.length,
        productLinesWithSkus: productLinesWithCounts.filter(line => line.count > 0).length,
        productLinesWithErrors: productLinesWithCounts.filter(line => line.error).length
      }
    });
    
  } catch (error) {
    console.error('Unexpected error loading product lines:', error);
    return c.json({ 
      error: 'Failed to load product lines from database', 
      details: error.message,
      stack: error.stack?.split('\\n').slice(0, 5).join('\\n')
    }, 500);
  }
});

// Get configuration options with relational data, filtered by product line
app.get("/make-server-8bb96920/configurations/options", async (c) => {
  try {
    const productLineFilter = c.req.query('product_line');
    
    console.log(`Loading configuration options for product line: ${productLineFilter || 'all'}`);
    
    // First, debug the product line existence if filtering
    if (productLineFilter && productLineFilter !== '') {
      console.log(`Debug: Checking if product line ${productLineFilter} exists...`);
      
      const { data: productLineCheck, error: productLineError } = await supabase
        .from('product_lines')
        .select('id, name')
        .eq('id', productLineFilter);
      
      if (productLineError) {
        console.error('Error checking product line existence:', productLineError);
        return c.json({ error: `Failed to verify product line: ${productLineFilter}` }, 500);
      }
      
      if (!productLineCheck || productLineCheck.length === 0) {
        console.log(`Debug: Product line ${productLineFilter} does not exist in product_lines table`);
        return c.json({ 
          error: `Product line ${productLineFilter} not found in database`,
          productLineFilter,
          availableProductLines: 'Check /product-lines endpoint for valid IDs',
          options: {
            frameColors: [],
            sizes: [],
            lightOutputs: [],
            colorTemperatures: [],
            accessories: [],
            drivers: [],
            mountingOptions: [],
            hangingTechniques: [],
            mirrorStyles: [],
            products: []
          },
          totalSkus: 0
        }, 404);
      }
      
      console.log(`Debug: Product line ${productLineFilter} found: ${productLineCheck[0].name}`);
      
      // Check how many SKUs exist for this product line
      const { count: skuCountCheck, error: skuCountError } = await supabase
        .from('sku_index')
        .select('id', { count: 'exact', head: true })
        .eq('product_line_id', productLineFilter);
      
      if (skuCountError) {
        console.error('Error checking SKU count for product line:', skuCountError);
      } else {
        console.log(`Debug: Found ${skuCountCheck || 0} SKUs for product line ${productLineFilter}`);
      }
    }
    
    // Build query with all relational joins using the normalized structure
    // Based on actual schema validation - only select columns that exist
    let query = supabase
      .from('sku_index')
      .select(`
        id,
        sku_code,
        product_line_id,
        product_id,
        size_id,
        frame_color_id,
        light_output_id,
        color_temperature_id,
        accessory_id,
        driver_id,
        mounting_option_id,
        hanging_technique_id,
        mirror_style_id,
        frame_thickness_id,
        light_direction_id,
        product_lines!product_line_id (
          id,
          name,
          description
        ),
        products!product_id (
          id,
          name,
          description
        ),
        sizes!size_id (
          id,
          name,
          width,
          height
        ),
        frame_colors!frame_color_id (
          id,
          name,
          hex_code
        ),
        light_outputs!light_output_id (
          id,
          name
        ),
        color_temperatures!color_temperature_id (
          id,
          name
        ),
        accessories!accessory_id (
          id,
          name,
          description
        ),
        drivers!driver_id (
          id,
          name,
          description
        ),
        mounting_options!mounting_option_id (
          id,
          name,
          description
        ),
        hanging_techniques!hanging_technique_id (
          id,
          name,
          status
        ),
        mirror_styles!mirror_style_id (
          id,
          name,
          description
        )
      `);
    
    // Apply product line filter if specified
    if (productLineFilter && productLineFilter !== '') {
      query = query.eq('product_line_id', productLineFilter);
    }
    
    // Set a very high limit to get all rows without pagination complexity
    query = query.limit(100000);
    
    const { data: skuData, error } = await query;
    
    if (error) {
      console.error('Error fetching sku_index with relations:', error);
      return c.json({ error: 'Failed to fetch configuration options from database' }, 500);
    }
    
    if (!skuData || skuData.length === 0) {
      console.log(`No SKU data returned. Product line filter: ${productLineFilter}`);
      
      // Try a simpler query to see if we can get any data at all
      console.log('Debug: Trying simple sku_index query without relations...');
      const { data: simpleSkuData, error: simpleError, count: simpleCount } = await supabase
        .from('sku_index')
        .select('id, sku_code, product_line_id', { count: 'exact' })
        .limit(10);
      
      if (simpleError) {
        console.error('Simple SKU query failed:', simpleError);
      } else {
        console.log(`Simple SKU query found ${simpleCount || 0} total SKUs, retrieved ${simpleSkuData?.length || 0}:`, simpleSkuData?.slice(0, 3));
        
        if (productLineFilter && simpleSkuData && simpleSkuData.length > 0) {
          // Check if the product line filter is valid
          const matchingSkus = simpleSkuData.filter(sku => sku.product_line_id === productLineFilter);
          console.log(`Found ${matchingSkus.length} SKUs matching product line ${productLineFilter}`);
          
          if (matchingSkus.length === 0) {
            // Check what product line IDs actually exist
            const uniqueProductLineIds = [...new Set(simpleSkuData.map(sku => sku.product_line_id))];
            console.log('Available product line IDs in SKU data:', uniqueProductLineIds);
            
            return c.json({ 
              error: `Product line ${productLineFilter} has no SKUs`,
              productLineFilter,
              debugMessage: `Product line ${productLineFilter} exists but has no SKUs. Available product line IDs: ${uniqueProductLineIds.join(', ')}`,
              availableProductLineIds: uniqueProductLineIds,
              totalSkusInDatabase: simpleCount || 0,
              options: {
                frameColors: [],
                sizes: [],
                lightOutputs: [],
                colorTemperatures: [],
                accessories: [],
                drivers: [],
                mountingOptions: [],
                hangingTechniques: [],
                mirrorStyles: [],
                products: []
              },
              totalSkus: 0
            }, 404);
          }
        }
      }
      
      return c.json({ 
        error: productLineFilter 
          ? `No SKU data found for product line: ${productLineFilter}` 
          : 'No SKU data found in database with relational queries',
        productLineFilter,
        debugMessage: productLineFilter 
          ? `Product line ${productLineFilter} exists but relational query returned no data` 
          : 'Relational SKU query returned no data despite simple query showing SKUs exist',
        simpleQueryCount: simpleCount || 0,
        options: {
          frameColors: [],
          sizes: [],
          lightOutputs: [],
          colorTemperatures: [],
          accessories: [],
          drivers: [],
          mountingOptions: [],
          hangingTechniques: [],
          mirrorStyles: [],
          products: []
        },
        totalSkus: 0
      }, 404);
    }
    
    // Build comprehensive option mappings with full relational data based on actual schema
    const options = {
      frameColors: buildRelationalOptionMap(skuData, 'frame_colors', 'Frame Color'),
      sizes: buildRelationalOptionMap(skuData, 'sizes', 'Size'),
      lightOutputs: buildRelationalOptionMap(skuData, 'light_outputs', 'Light Output'),
      colorTemperatures: buildRelationalOptionMap(skuData, 'color_temperatures', 'Color Temperature'),
      accessories: buildRelationalOptionMap(skuData, 'accessories', 'Accessory'),
      drivers: buildRelationalOptionMap(skuData, 'drivers', 'Driver'),
      mountingOptions: buildRelationalOptionMap(skuData, 'mounting_options', 'Mounting Option'),
      hangingTechniques: buildRelationalOptionMap(skuData, 'hanging_techniques', 'Hanging Technique'),
      mirrorStyles: buildRelationalOptionMap(skuData, 'mirror_styles', 'Mirror Style'),
      products: buildRelationalOptionMap(skuData, 'products', 'Product')
    };
    
    console.log(`Built configuration options for ${productLineFilter || 'all product lines'}: ${skuData.length} SKUs`);
    
    // Warn if we're hitting the limit - indicates we need to increase it further
    if (skuData.length >= 100000) {
      console.warn(`WARNING: Retrieved exactly ${skuData.length} SKUs - may have hit the query limit. Consider increasing limit if more SKUs exist.`);
    }
    
    console.log(`Option counts for ${productLineFilter || 'all product lines'}:`, {
      frameColors: options.frameColors.length,
      sizes: options.sizes.length,
      lightOutputs: options.lightOutputs.length,
      colorTemperatures: options.colorTemperatures.length,
      accessories: options.accessories.length,
      drivers: options.drivers.length,
      mountingOptions: options.mountingOptions.length,
      hangingTechniques: options.hangingTechniques.length,
      mirrorStyles: options.mirrorStyles.length,
      products: options.products.length
    });
    
    return c.json({
      options,
      totalSkus: skuData.length,
      productLineFilter,
      message: `Configuration options built from ${skuData.length} SKUs` + (productLineFilter ? ` for product line: ${productLineFilter}` : '')
    });
    
  } catch (error) {
    console.error('Error building configuration options:', error);
    return c.json({ error: 'Failed to build configuration options' }, 500);
  }
});

// Helper function to build option maps from relational SKU data
function buildRelationalOptionMap(skuData, relationFieldName, displayName) {
  // Extract unique related objects, handling null relationships
  const relatedObjectsMap = new Map();
  
  skuData.forEach(sku => {
    const relatedObj = sku[relationFieldName];
    if (relatedObj && relatedObj.id) {
      if (!relatedObjectsMap.has(relatedObj.id)) {
        relatedObjectsMap.set(relatedObj.id, {
          ...relatedObj,
          count: 0,
          sampleSkus: []
        });
      }
      const existing = relatedObjectsMap.get(relatedObj.id);
      existing.count++;
      if (existing.sampleSkus.length < 5) {
        existing.sampleSkus.push(sku.sku_code || sku.id);
      }
    }
  });
  
  // Convert to array format expected by frontend
  return Array.from(relatedObjectsMap.values()).map(obj => {
    const result = {
      id: obj.id,
      label: obj.name || `${displayName} ${obj.id}`,
      value: obj.id,
      count: obj.count,
      sampleSkus: obj.sampleSkus,
      displayName: displayName,
      // Include additional fields specific to each type based on actual schema
      ...(obj.hex_code && { hexCode: obj.hex_code }),
      ...(obj.width && { width: obj.width, height: obj.height }),
      ...(obj.status && { status: obj.status })
    };
    
    // Only include description if it actually exists and is not empty
    if (obj.description && obj.description.trim() !== '') {
      result.description = obj.description;
    } else if (obj.status && obj.status.trim() !== '') {
      // Use status as description for items like hanging techniques
      result.description = `Status: ${obj.status}`;
    }
    // If no description exists, don't include the field at all
    
    return result;
  }).sort((a, b) => b.count - a.count); // Sort by popularity
}

// SKU matching endpoint - find SKUs matching configuration criteria
app.post("/make-server-8bb96920/skus/match", async (c) => {
  try {
    const config = await c.req.json();
    console.log('Finding matching SKUs for configuration:', config);
    
    // Build query based on configuration criteria
    let query = supabase
      .from('sku_index')
      .select(`
        id,
        sku_code,
        product_line_id,
        product_id,
        size_id,
        frame_color_id,
        light_output_id,
        color_temperature_id,
        accessory_id,
        driver_id,
        mounting_option_id,
        hanging_technique_id,
        mirror_style_id,
        frame_thickness_id,
        light_direction_id,
        product_lines!product_line_id (
          id,
          name
        ),
        products!product_id (
          id,
          name
        ),
        sizes!size_id (
          id,
          name,
          width,
          height
        ),
        frame_colors!frame_color_id (
          id,
          name,
          hex_code
        ),
        light_outputs!light_output_id (
          id,
          name
        ),
        color_temperatures!color_temperature_id (
          id,
          name
        ),
        accessories!accessory_id (
          id,
          name
        ),
        drivers!driver_id (
          id,
          name
        ),
        mounting_options!mounting_option_id (
          id,
          name
        ),
        hanging_techniques!hanging_technique_id (
          id,
          name,
          status
        ),
        mirror_styles!mirror_style_id (
          id,
          name
        )
      `);
    
    // Apply filters based on configuration (using the correct foreign key field names)
    if (config.product && config.product !== '') {
      query = query.eq('product_line_id', config.product); // Filter by product line
    }
    if (config.size && config.size !== '') {
      query = query.eq('size_id', config.size);
    }
    if (config.frameColor && config.frameColor !== '') {
      query = query.eq('frame_color_id', config.frameColor);
    }
    if (config.lightOutput && config.lightOutput !== '') {
      query = query.eq('light_output_id', config.lightOutput);
    }
    if (config.colorTemperature && config.colorTemperature !== '') {
      query = query.eq('color_temperature_id', config.colorTemperature);
    }
    if (config.accessory && config.accessory !== '') {
      query = query.eq('accessory_id', config.accessory);
    }
    if (config.driver && config.driver !== '') {
      query = query.eq('driver_id', config.driver);
    }
    if (config.mounting && config.mounting !== '') {
      query = query.eq('mounting_option_id', config.mounting);
    }
    if (config.hangingTechnique && config.hangingTechnique !== '') {
      query = query.eq('hanging_technique_id', config.hangingTechnique);
    }
    if (config.mirrorStyle && config.mirrorStyle !== '') {
      query = query.eq('mirror_style_id', config.mirrorStyle);
    }
    // Add new columns from actual schema
    if (config.frameThickness && config.frameThickness !== '') {
      query = query.eq('frame_thickness_id', config.frameThickness);
    }
    if (config.lightDirection && config.lightDirection !== '') {
      query = query.eq('light_direction_id', config.lightDirection);
    }
    
    // Set high limit to get all matching SKUs
    query = query.limit(50000);
    
    const { data: matchingSkus, error } = await query;
    
    if (error) {
      console.error('Error finding matching SKUs:', error);
      return c.json({ error: 'Failed to find matching SKUs' }, 500);
    }
    
    console.log(`Found ${matchingSkus?.length || 0} matching SKUs`);
    
    // Warn if we're hitting the limit - indicates we need to increase it further
    if (matchingSkus && matchingSkus.length >= 50000) {
      console.warn(`WARNING: Retrieved exactly ${matchingSkus.length} matching SKUs - may have hit the query limit. Consider increasing limit if more SKUs exist.`);
    }
    
    return c.json({
      skus: matchingSkus || [],
      count: matchingSkus?.length || 0,
      config: config,
      message: `Found ${matchingSkus?.length || 0} matching SKUs`
    });
  } catch (error) {
    console.error('Error in SKU matching endpoint:', error);
    return c.json({ error: 'Failed to match SKUs' }, 500);
  }
});

// SKU data endpoints for database explorer
app.get("/make-server-8bb96920/skus", async (c) => {
  try {
    console.log('Getting basic SKU data...');
    
    const { data: skuData, error, count } = await supabase
      .from('sku_index')
      .select('*', { count: 'exact' })
      .limit(1000); // Reasonable limit for basic endpoint
    
    if (error) {
      console.error('Error getting SKU data:', error);
      return c.json({ error: 'Failed to get SKU data', details: error }, 500);
    }
    
    console.log(`SKU endpoint: Retrieved ${skuData?.length || 0} SKUs (total: ${count || 0})`);
    
    return c.json({
      data: skuData || [],
      tableName: 'sku_index',
      count: skuData?.length || 0,
      totalCount: count || 0,
      message: `Retrieved ${skuData?.length || 0} SKUs from sku_index table (${count || 0} total)`
    });
    
  } catch (error) {
    console.error('Error in SKU endpoint:', error);
    return c.json({ error: 'Failed to get SKU data', details: error.message }, 500);
  }
});

app.get("/make-server-8bb96920/skus/all", async (c) => {
  try {
    const limitParam = c.req.query('limit');
    const limit = limitParam ? parseInt(limitParam) : 500; // Default limit for performance
    
    console.log(`Getting all SKUs with limit: ${limit}...`);
    
    const { data: allSkuData, error, count } = await supabase
      .from('sku_index')
      .select('*', { count: 'exact' })
      .limit(limit);
    
    if (error) {
      console.error('Error getting all SKU data:', error);
      return c.json({ error: 'Failed to get all SKU data', details: error }, 500);
    }
    
    console.log(`All SKUs endpoint: Retrieved ${allSkuData?.length || 0} SKUs (total: ${count || 0})`);
    
    return c.json({
      data: allSkuData || [],
      count: allSkuData?.length || 0,
      totalCount: count || 0,
      limit: limit,
      message: `Retrieved ${allSkuData?.length || 0} SKUs from sku_index table (${count || 0} total)`
    });
    
  } catch (error) {
    console.error('Error in all SKUs endpoint:', error);
    return c.json({ error: 'Failed to get all SKU data', details: error.message }, 500);
  }
});

// Quote endpoints
app.post("/make-server-8bb96920/quotes", async (c) => {
  try {
    const { quoteItems, customerInfo } = await c.req.json();
    
    const quoteId = `quote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Calculate total
    const totalPrice = quoteItems.reduce((sum, item) => sum + (item.price || 0), 0);
    
    const quoteData = {
      quoteId,
      customerInfo,
      items: quoteItems,
      totalPrice,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };
    
    await kv.set(quoteId, quoteData);
    
    console.log(`Quote created with ID: ${quoteId}, Total: $${totalPrice}`);
    return c.json({ quoteId, totalPrice, message: 'Quote created successfully' });
  } catch (error) {
    console.error('Error creating quote:', error);
    return c.json({ error: 'Failed to create quote' }, 500);
  }
});

// Configuration endpoints  
app.post("/make-server-8bb96920/configurations", async (c) => {
  try {
    const { productType, configuration } = await c.req.json();
    
    const configId = `config_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await kv.set(configId, {
      productType,
      configuration,
      savedAt: new Date().toISOString(),
      configId
    });
    
    console.log(`Configuration saved with ID: ${configId}`);
    return c.json({ configId, message: 'Configuration saved successfully' });
  } catch (error) {
    console.error('Error saving configuration:', error);
    return c.json({ error: 'Failed to save configuration' }, 500);
  }
});

// Legacy endpoints for backwards compatibility
app.post("/make-server-8bb96920/configurations/save", async (c) => {
  try {
    const { productType, configuration } = await c.req.json();
    
    const configId = `config_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await kv.set(configId, {
      productType,
      configuration,
      savedAt: new Date().toISOString(),
      configId
    });
    
    console.log(`Configuration saved with ID: ${configId}`);
    return c.json({ configId, message: 'Configuration saved successfully' });
  } catch (error) {
    console.error('Error saving configuration:', error);
    return c.json({ error: 'Failed to save configuration' }, 500);
  }
});

app.post("/make-server-8bb96920/quotes/create", async (c) => {
  try {
    const { quoteItems, customerInfo } = await c.req.json();
    
    const quoteId = `quote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Calculate total
    const totalPrice = quoteItems.reduce((sum, item) => sum + (item.price || 0), 0);
    
    const quoteData = {
      quoteId,
      customerInfo,
      items: quoteItems,
      totalPrice,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };
    
    await kv.set(quoteId, quoteData);
    
    console.log(`Quote created with ID: ${quoteId}, Total: $${totalPrice}`);
    return c.json({ quoteId, totalPrice, message: 'Quote created successfully' });
  } catch (error) {
    console.error('Error creating quote:', error);
    return c.json({ error: 'Failed to create quote' }, 500);
  }
});

// Analytics endpoints
app.get("/make-server-8bb96920/analytics", async (c) => {
  try {
    // Get all quote data
    const allQuotes = await kv.getByPrefix('quote_');
    
    // Get all configuration data
    const allConfigs = await kv.getByPrefix('config_');
    
    // Calculate analytics
    const totalQuotes = allQuotes.length;
    const totalConfigurations = allConfigs.length;
    
    const totalRevenue = allQuotes.reduce((sum, quote) => {
      return sum + (quote.totalPrice || 0);
    }, 0);
    
    const averageQuoteValue = totalQuotes > 0 ? totalRevenue / totalQuotes : 0;
    
    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentQuotes = allQuotes.filter(quote => {
      return new Date(quote.createdAt) > sevenDaysAgo;
    });
    
    const recentConfigs = allConfigs.filter(config => {
      return new Date(config.savedAt) > sevenDaysAgo;
    });
    
    // Product type distribution
    const productTypes = {};
    allConfigs.forEach(config => {
      const productType = config.productType || 'Unknown';
      productTypes[productType] = (productTypes[productType] || 0) + 1;
    });
    
    // Quote status distribution
    const quoteStatuses = {};
    allQuotes.forEach(quote => {
      const status = quote.status || 'Unknown';
      quoteStatuses[status] = (quoteStatuses[status] || 0) + 1;
    });
    
    console.log(`Analytics: ${totalQuotes} quotes, ${totalConfigurations} configurations, $${totalRevenue} revenue`);
    
    return c.json({
      analytics: {
        totalQuotes,
        totalConfigurations,
        totalRevenue,
        averageQuoteValue,
        recentActivity: {
          quotes: recentQuotes.length,
          configurations: recentConfigs.length
        },
        distributions: {
          productTypes,
          quoteStatuses
        },
        metrics: {
          conversionRate: totalConfigurations > 0 ? (totalQuotes / totalConfigurations * 100).toFixed(2) : 0,
          averageItemsPerQuote: totalQuotes > 0 ? (allQuotes.reduce((sum, quote) => sum + (quote.items?.length || 0), 0) / totalQuotes).toFixed(1) : 0
        }
      }
    });
  } catch (error) {
    console.error('Error getting analytics:', error);
    return c.json({ error: 'Failed to get analytics' }, 500);
  }
});

// Database introspection endpoints for debugging
app.get("/make-server-8bb96920/database/tables", async (c) => {
  try {
    console.log('Getting database table information...');
    
    // Get basic table info
    const tableNames = [
      'product_lines', 'sku_index', 'products', 'sizes', 'frame_colors',
      'light_outputs', 'color_temperatures', 'accessories', 'drivers',
      'mounting_options', 'hanging_techniques', 'mirror_styles',
      'frame_thickness', 'light_direction'
    ];
    
    const tableInfo = [];
    
    for (const tableName of tableNames) {
      try {
        const { count, error } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true })
          .limit(1);
        
        if (error) {
          tableInfo.push({
            table_name: tableName,
            row_count: 0,
            status: 'error',
            error: error.message
          });
        } else {
          tableInfo.push({
            table_name: tableName,
            row_count: count || 0,
            status: 'accessible'
          });
        }
      } catch (e) {
        tableInfo.push({
          table_name: tableName,
          row_count: 0,
          status: 'exception',
          error: e.message
        });
      }
    }
    
    console.log('Database table info:', tableInfo);
    
    return c.json({
      tables: tableInfo,
      totalTables: tableInfo.length,
      accessibleTables: tableInfo.filter(t => t.status === 'accessible').length,
      totalRows: tableInfo.reduce((sum, t) => sum + t.row_count, 0)
    });
  } catch (error) {
    console.error('Error getting database tables:', error);
    return c.json({ error: 'Failed to get database tables' }, 500);
  }
});

app.get("/make-server-8bb96920/database/schema/:tableName", async (c) => {
  try {
    const tableName = c.req.param('tableName');
    console.log(`Getting schema for table: ${tableName}`);
    
    // Try to get sample data to infer schema
    const { data: sampleData, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    if (error) {
      return c.json({ error: `Failed to access table ${tableName}: ${error.message}` }, 500);
    }
    
    const columns = sampleData && sampleData.length > 0 
      ? Object.keys(sampleData[0]).map(key => ({
          column_name: key,
          data_type: typeof sampleData[0][key],
          sample_value: sampleData[0][key]
        }))
      : [];
    
    return c.json({
      table: tableName,
      columns,
      sampleData: sampleData || []
    });
  } catch (error) {
    console.error(`Error getting schema for ${c.req.param('tableName')}:`, error);
    return c.json({ error: 'Failed to get table schema' }, 500);
  }
});

// Emergency database check endpoint
app.get("/make-server-8bb96920/database/emergency-check", async (c) => {
  try {
    console.log('Performing emergency database check...');
    
    const criticalTables = ['product_lines', 'sku_index'];
    const foundTables = [];
    const errors = [];
    
    for (const tableName of criticalTables) {
      try {
        const { count, error } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true })
          .limit(1);
        
        if (error) {
          errors.push({ table: tableName, error: error.message });
        } else {
          foundTables.push({ table_name: tableName, row_count: count || 0 });
        }
      } catch (e) {
        errors.push({ table: tableName, error: e.message });
      }
    }
    
    const isHealthy = foundTables.length === criticalTables.length && 
                     foundTables.every(table => table.row_count > 0);
    
    console.log('Emergency check results:', { foundTables, errors, isHealthy });
    
    return c.json({
      healthy: isHealthy,
      foundTables,
      errors,
      summary: `${foundTables.length}/${criticalTables.length} critical tables accessible`
    });
  } catch (error) {
    console.error('Emergency database check failed:', error);
    return c.json({ 
      healthy: false, 
      error: 'Emergency check failed', 
      details: error.message 
    }, 500);
  }
});

// Debug endpoints for troubleshooting
app.get("/make-server-8bb96920/debug/relational-sample", async (c) => {
  try {
    console.log('Getting relational sample data for debugging...');
    
    // Get a small sample of SKU data with all relations
    const { data: sampleData, error } = await supabase
      .from('sku_index')
      .select(`
        id,
        sku_code,
        product_line_id,
        product_id,
        product_lines!product_line_id (
          id,
          name
        ),
        products!product_id (
          id,
          name
        )
      `)
      .limit(5);
    
    if (error) {
      console.error('Debug relational sample failed:', error);
      return c.json({ error: 'Failed to get relational sample', details: error.message }, 500);
    }
    
    console.log('Debug relational sample data:', sampleData);
    
    return c.json({
      sampleData: sampleData || [],
      count: sampleData?.length || 0,
      message: 'Relational sample data retrieved successfully'
    });
  } catch (error) {
    console.error('Debug relational sample error:', error);
    return c.json({ error: 'Failed to get debug relational sample' }, 500);
  }
});

app.get("/make-server-8bb96920/debug/table-schema/:tableName", async (c) => {
  try {
    const tableName = c.req.param('tableName');
    console.log(`Debug: Getting detailed schema for table: ${tableName}`);
    
    const { data: sampleData, error, count } = await supabase
      .from(tableName)
      .select('*', { count: 'exact' })
      .limit(3);
    
    if (error) {
      return c.json({ 
        error: `Failed to access table ${tableName}`, 
        details: error.message,
        tableName 
      }, 500);
    }
    
    const schema = sampleData && sampleData.length > 0 
      ? Object.keys(sampleData[0]).map(key => ({
          column_name: key,
          data_type: typeof sampleData[0][key],
          sample_value: sampleData[0][key],
          is_null: sampleData[0][key] === null
        }))
      : [];
    
    return c.json({
      tableName,
      totalRows: count || 0,
      schema,
      sampleData: sampleData || [],
      hasData: (sampleData?.length || 0) > 0
    });
  } catch (error) {
    console.error(`Debug schema error for ${c.req.param('tableName')}:`, error);
    return c.json({ error: 'Failed to get debug table schema' }, 500);
  }
});

// Catch-all for undefined routes
app.all('*', (c) => {
  return c.json({ error: 'Route not found' }, 404);
});

// Start the server
Deno.serve(app.fetch);