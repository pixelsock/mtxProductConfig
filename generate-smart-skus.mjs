#!/usr/bin/env node

import fs from 'fs';
import https from 'https';
import { URL } from 'url';

// Configuration
const DIRECTUS_URL = 'https://pim.dude.digital';
const DIRECTUS_TOKEN = 'Etqos_amy96Dxm6ab9TWnkjR_lF19XOK';

// Helper function to make HTTP requests
async function fetchData(endpoint) {
    return new Promise((resolve, reject) => {
        const url = new URL(endpoint, DIRECTUS_URL);
        const options = {
            headers: {
                'Authorization': `Bearer ${DIRECTUS_TOKEN}`
            }
        };

        https.get(url, options, (res) => {
            let data = '';
            
            res.on('data', chunk => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    if (res.statusCode !== 200) {
                        reject(new Error(`HTTP ${res.statusCode}: ${data}`));
                        return;
                    }
                    
                    const json = JSON.parse(data);
                    const result = json.data || json;
                    resolve(result);
                } catch (e) {
                    reject(new Error(`JSON parse error: ${e.message}`));
                }
            });
        }).on('error', reject);
    });
}

// Fetch all required data
async function fetchAllData() {
    console.log('🔄 Fetching data from Directus...');
    
    try {
        const [
            products,
            productLines,
            rules,
            frameColors,
            sizes,
            lightOutputs,
            colorTemperatures,
            drivers,
            mountingOptions,
            accessories,
            skuCodeOrder,
            productsOptionsOverrides
        ] = await Promise.all([
            fetchData('/items/products?filter[active][_neq]=false&fields=*'),
            fetchData('/items/product_lines?filter[active][_eq]=true&fields=*,default_options.*'),
            fetchData('/items/rules'),
            fetchData('/items/frame_colors?filter[active][_eq]=true&sort=sort'),
            fetchData('/items/sizes?filter[active][_eq]=true&sort=sort'),
            fetchData('/items/light_outputs?filter[active][_eq]=true&sort=sort'),
            fetchData('/items/color_temperatures?filter[active][_eq]=true&sort=sort'),
            fetchData('/items/drivers?filter[active][_eq]=true&sort=sort'),
            fetchData('/items/mounting_options?filter[active][_eq]=true&sort=sort'),
            fetchData('/items/accessories?filter[active][_eq]=true&sort=sort'),
            fetchData('/items/sku_code_order'),
            fetchData('/items/products_options_overrides')
        ]);

        console.log('📊 Data fetched:');
        console.log(`  Products: ${products.length}`);
        console.log(`  Product Lines: ${productLines.length}`);
        console.log(`  Rules: ${rules.length}`);
        console.log(`  Frame Colors: ${frameColors.length}`);
        console.log(`  Sizes: ${sizes.length}`);
        console.log(`  Light Outputs: ${lightOutputs.length}`);
        console.log(`  Color Temperatures: ${colorTemperatures.length}`);
        console.log(`  Drivers: ${drivers.length}`);
        console.log(`  Mounting Options: ${mountingOptions.length}`);
        console.log(`  Accessories: ${accessories.length}`);
        console.log(`  SKU Code Order: ${skuCodeOrder.length}`);

        return {
            products,
            productLines,
            rules,
            frameColors,
            sizes,
            lightOutputs,
            colorTemperatures,
            drivers,
            mountingOptions,
            accessories,
            skuCodeOrder,
            productsOptionsOverrides
        };
    } catch (error) {
        console.error('❌ Failed to fetch data:', error);
        throw error;
    }
}

// Evaluate a rule condition against a configuration (iterative approach)
function evaluateCondition(condition, config, collections) {
    if (!condition || typeof condition !== 'object') return true;

    // Stack for iterative processing to avoid recursion
    const stack = [{ condition, isAnd: null, isOr: null }];
    const results = [];

    while (stack.length > 0) {
        const { condition: currentCondition, isAnd, isOr } = stack.pop();
        
        if (!currentCondition || typeof currentCondition !== 'object') {
            results.push(true);
            continue;
        }

        // Handle _and operator
        if (currentCondition._and && Array.isArray(currentCondition._and)) {
            const subResults = [];
            for (const subCondition of currentCondition._and) {
                const result = evaluateConditionSimple(subCondition, config);
                subResults.push(result);
                if (!result) break; // Short circuit on first false
            }
            results.push(subResults.every(r => r));
            continue;
        }

        // Handle _or operator  
        if (currentCondition._or && Array.isArray(currentCondition._or)) {
            const subResults = [];
            for (const subCondition of currentCondition._or) {
                const result = evaluateConditionSimple(subCondition, config);
                subResults.push(result);
                if (result) break; // Short circuit on first true
            }
            results.push(subResults.some(r => r));
            continue;
        }

        // Handle simple field conditions
        results.push(evaluateConditionSimple(currentCondition, config));
    }

    return results.length > 0 ? results[results.length - 1] : true;
}

// Simple condition evaluation without recursion
function evaluateConditionSimple(condition, config) {
    if (!condition || typeof condition !== 'object') return true;

    // Handle field conditions
    for (const [field, fieldCondition] of Object.entries(condition)) {
        if (field.startsWith('_')) continue; // Skip operators
        
        const configValue = config[field];
        
        if (fieldCondition._eq !== undefined) {
            if (configValue != fieldCondition._eq) return false;
        }
        if (fieldCondition._neq !== undefined) {
            if (configValue == fieldCondition._neq) return false;
        }
        if (fieldCondition._in && Array.isArray(fieldCondition._in)) {
            if (!fieldCondition._in.includes(configValue)) return false;
        }
        if (fieldCondition._nin && Array.isArray(fieldCondition._nin)) {
            if (fieldCondition._nin.includes(configValue)) return false;
        }
        if (fieldCondition._empty !== undefined) {
            const isEmpty = !configValue || configValue === '' || 
                           (Array.isArray(configValue) && configValue.length === 0);
            if (fieldCondition._empty && !isEmpty) return false;
            if (!fieldCondition._empty && isEmpty) return false;
        }
    }

    return true;
}

// Apply rule modifications to a configuration
function applyRuleModifications(modifications, config, collections) {
    const newConfig = { ...config };
    
    if (!modifications || typeof modifications !== 'object') return newConfig;

    // Handle _and operator
    if (modifications._and && Array.isArray(modifications._and)) {
        for (const subModification of modifications._and) {
            Object.assign(newConfig, applyRuleModifications(subModification, newConfig, collections));
        }
        return newConfig;
    }

    // Handle direct field modifications
    for (const [field, modification] of Object.entries(modifications)) {
        if (field.startsWith('_')) continue; // Skip operators
        
        if (modification._eq !== undefined) {
            newConfig[field] = modification._eq;
        }
        if (modification.sku_code && modification.sku_code._eq !== undefined) {
            // For SKU code overrides, we need to store them specially
            newConfig[`${field}_sku_override`] = modification.sku_code._eq;
        }
    }

    return newConfig;
}

// Generate SKU combinations using filtered available options
function generateSkuCombinationsForProduct(product, collections) {
    const { productLines, productsOptionsOverrides } = collections;
    
    // Find the product line for this product
    const productLine = productLines.find(pl => pl.id === product.product_line);
    if (!productLine) {
        throw new Error(`Product line not found for product ${product.id}`);
    }

    if (!productLine.default_options || !Array.isArray(productLine.default_options)) {
        console.log(`    ⚠️ No default_options found for product line ${productLine.name}`);
        return [];
    }

    console.log(`    Using ${productLine.default_options.length} default options from product line: ${productLine.name}`);
    
    // Base configuration from the product (these are FIXED for this product)
    const baseConfig = {
        product_id: product.id,
        product_line: product.product_line,
        mirror_style: product.mirror_style,
        light_direction: product.light_direction,
        frame_thickness: product.frame_thickness || null
    };

    // Step 1: Extract available option IDs from default_options, grouped by collection
    const availableOptionIdsByCollection = {};
    for (const option of productLine.default_options) {
        const collection = option.collection;
        const optionId = parseInt(option.item);
        
        if (!availableOptionIdsByCollection[collection]) {
            availableOptionIdsByCollection[collection] = [];
        }
        availableOptionIdsByCollection[collection].push(optionId);
    }

    console.log(`    Available options by collection:`, Object.keys(availableOptionIdsByCollection).map(col => 
        `${col}(${availableOptionIdsByCollection[col].length})`
    ).join(', '));

    // Step 2: Apply product-specific options_overrides
    const productOverrides = productsOptionsOverrides.filter(override => 
        override.products_id === product.id
    );

    if (productOverrides.length > 0) {
        console.log(`    Found ${productOverrides.length} product-specific option overrides`);
        
        // Group overrides by collection
        const overridesByCollection = {};
        for (const override of productOverrides) {
            const collection = override.collection;
            const optionId = parseInt(override.item);
            
            if (!overridesByCollection[collection]) {
                overridesByCollection[collection] = [];
            }
            overridesByCollection[collection].push(optionId);
        }

        // Apply overrides (replace default options for affected collections)
        for (const [collection, overrideIds] of Object.entries(overridesByCollection)) {
            console.log(`      Overriding ${collection}: ${overrideIds.join(',')}`);
            availableOptionIdsByCollection[collection] = overrideIds;
        }
    }

    // Step 3: Filter each collection to only include available option IDs
    const filteredCollections = {
        frameColors: collections.frameColors.filter(item => 
            availableOptionIdsByCollection.frame_colors?.includes(item.id) || false
        ),
        sizes: collections.sizes.filter(item => 
            availableOptionIdsByCollection.sizes?.includes(item.id) || false
        ),
        lightOutputs: collections.lightOutputs.filter(item => 
            availableOptionIdsByCollection.light_outputs?.includes(item.id) || false
        ),
        colorTemperatures: collections.colorTemperatures.filter(item => 
            availableOptionIdsByCollection.color_temperatures?.includes(item.id) || false
        ),
        drivers: collections.drivers.filter(item => 
            availableOptionIdsByCollection.drivers?.includes(item.id) || false
        ),
        mountingOptions: collections.mountingOptions.filter(item => 
            availableOptionIdsByCollection.mounting_options?.includes(item.id) || false
        ),
        accessories: collections.accessories.filter(item => 
            availableOptionIdsByCollection.accessories?.includes(item.id) || false
        )
    };

    console.log(`    Filtered collections:`, Object.entries(filteredCollections).map(([name, items]) => 
        `${name}(${items.length})`
    ).join(', '));

    // Step 4: Generate combinations from filtered available options
    const combinations = [];
    
    // Get all collection names that have available options
    const availableCollections = Object.entries(filteredCollections)
        .filter(([name, items]) => items.length > 0)
        .map(([name, items]) => name);

    if (availableCollections.length === 0) {
        console.log(`    No available options found for any collections`);
        return [];
    }

    function generateCombinations(collectionIndex, currentConfig) {
        if (collectionIndex === availableCollections.length) {
            // We have a complete configuration
            combinations.push({ ...currentConfig });
            return;
        }
        
        const collectionName = availableCollections[collectionIndex];
        const filteredItems = filteredCollections[collectionName];
        
        // Handle multi-select accessories separately
        if (collectionName === 'accessories') {
            // Generate all combinations of accessories (including empty set)
            const accessoryIds = filteredItems.map(item => item.id);
            const accessoryCombinations = generateAccessoryCombinations(accessoryIds);
            
            for (const accessoryCombo of accessoryCombinations) {
                const newConfig = { 
                    ...currentConfig,
                    accessory: accessoryCombo // Array of accessory IDs or empty array
                };
                generateCombinations(collectionIndex + 1, newConfig);
            }
        } else {
            // Single-select for all other collections
            for (const item of filteredItems) {
                const fieldName = getFieldNameForCollection(collectionName);
                const newConfig = { 
                    ...currentConfig,
                    [fieldName]: item.id
                };
                generateCombinations(collectionIndex + 1, newConfig);
            }
        }
    }

    generateCombinations(0, baseConfig);

    console.log(`    Generated ${combinations.length} combinations from filtered available options`);
    return combinations;
}

// Helper function to generate all combinations of accessories
function generateAccessoryCombinations(accessoryIds) {
    const combinations = [[]]; // Start with empty set
    
    for (const id of accessoryIds) {
        const newCombinations = [];
        for (const combo of combinations) {
            newCombinations.push([...combo, id]); // Add combinations with this accessory
        }
        combinations.push(...newCombinations);
    }
    
    return combinations;
}

// Helper function to get field name for collection
function getFieldNameForCollection(collectionName) {
    const fieldMap = {
        frameColors: 'frame_color',
        sizes: 'size',
        lightOutputs: 'light_output',
        colorTemperatures: 'color_temperature',
        drivers: 'driver',
        mountingOptions: 'mounting_option',
        accessories: 'accessory'
    };
    return fieldMap[collectionName] || collectionName;
}

// Apply rules to filter and modify combinations
function applyRulesToCombinations(combinations, rules, collections) {
    console.log(`🔧 Applying ${rules.length} rules to ${combinations.length} combinations...`);
    
    const validCombinations = [];
    let rulesApplied = 0;
    const batchSize = 1000; // Process in batches to avoid stack overflow
    const totalBatches = Math.ceil(combinations.length / batchSize);

    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
        const start = batchIndex * batchSize;
        const end = Math.min(start + batchSize, combinations.length);
        const batch = combinations.slice(start, end);
        
        if (batchIndex % 10 === 0) {
            console.log(`  Processing batch ${batchIndex + 1}/${totalBatches} (${start}-${end})`);
        }

        for (const combination of batch) {
            let config = { ...combination };
            let isValid = true;

            // Apply each rule in order
            for (const rule of rules) {
                if (!rule.if_this || !rule.then_that) continue;

                try {
                    // Check if rule condition matches
                    if (evaluateCondition(rule.if_this, config, collections)) {
                        // Apply rule modifications
                        config = applyRuleModifications(rule.then_that, config, collections);
                        rulesApplied++;
                    }
                } catch (error) {
                    // Skip rule if it causes an error
                    console.warn(`  ⚠️ Rule ${rule.id} caused error: ${error.message}`);
                    continue;
                }
            }

            if (isValid) {
                validCombinations.push(config);
            }
        }
    }

    console.log(`  ✓ Rules applied: ${rulesApplied}`);
    console.log(`  ✓ Valid combinations: ${validCombinations.length}`);
    
    return validCombinations;
}

// Build SKU from configuration using sku_code_order
function buildSkuFromConfig(config, collections) {
    const { skuCodeOrder } = collections;
    const parts = [];

    console.log(`    DEBUG: sku_code_order has ${skuCodeOrder.length} entries`);
    console.log(`    DEBUG: First few sku_code_order entries:`, skuCodeOrder.slice(0, 3));

    // Sort sku_code_order by order field to get proper sequence
    const orderedSections = [...skuCodeOrder].sort((a, b) => (a.order || 0) - (b.order || 0));

    for (const section of orderedSections) {
        const skuCodeItem = section.sku_code_item;
        
        console.log(`      Processing sku_code_item: ${skuCodeItem} (order: ${section.order})`);
        
        // Find the appropriate collection and field
        let collection, fieldName;
        
        switch (skuCodeItem) {
            case 'frame_colors':
                collection = collections.frameColors;
                fieldName = 'frame_color';
                break;
            case 'sizes':
                collection = collections.sizes;
                fieldName = 'size';
                break;
            case 'light_outputs':
                collection = collections.lightOutputs;
                fieldName = 'light_output';
                break;
            case 'color_temperatures':
                collection = collections.colorTemperatures;
                fieldName = 'color_temperature';
                break;
            case 'drivers':
                collection = collections.drivers;
                fieldName = 'driver';
                break;
            case 'mounting_options':
                collection = collections.mountingOptions;
                fieldName = 'mounting_option';
                break;
            case 'accessories':
                collection = collections.accessories;
                fieldName = 'accessory';
                break;
            case 'products':
                // Use the product's own sku_code
                const product = collections.products.find(p => p.id === config.product_id);
                if (product?.sku_code) {
                    console.log(`      Found product sku_code: ${product.sku_code}`);
                    parts.push(product.sku_code);
                } else {
                    console.log(`      No sku_code found for product ${config.product_id}`);
                }
                continue;
            case 'hanging_techniques':
                // This collection doesn't exist in our data, skip it
                console.log(`      Skipping hanging_techniques (not available)`);
                continue;
            default:
                console.warn(`      Unknown sku_code_item: ${skuCodeItem}`);
                continue;
        }

        if (!collection) continue;

        // Get config value for this field
        let configValue = config[fieldName];
        
        // Handle accessories array (multi-select)
        if (fieldName === 'accessory' && Array.isArray(configValue)) {
            // For accessories, we need special handling for multi-select
            console.log(`      Processing accessory array: [${configValue.join(', ')}]`);
            
            // Check for field overrides first (from rules)
            const overrideFieldName = `${fieldName}_sku_override`;
            if (config[overrideFieldName] && config[overrideFieldName] !== 'NA') {
                console.log(`      Using accessory override: ${config[overrideFieldName]}`);
                parts.push(config[overrideFieldName]);
                continue;
            }
            
            // If empty array, use "NA"
            if (configValue.length === 0) {
                parts.push('NA');
                continue;
            }
            
            // Handle multiple accessories - could be combined into single code or individual codes
            // For now, try to find a combined code or use first accessory
            if (configValue.length === 1) {
                const item = collection.find(item => item.id === configValue[0]);
                if (item?.sku_code) {
                    console.log(`      Found single accessory sku_code: ${item.sku_code}`);
                    parts.push(item.sku_code);
                } else {
                    parts.push('NA');
                }
            } else {
                // Multiple accessories - rules should handle this via overrides
                console.log(`      Multiple accessories found, should be handled by rules`);
                parts.push('NA'); // Default for multiple accessories
            }
            continue;
        }

        if (!configValue) {
            console.log(`      No value found for ${fieldName} in config`);
            continue;
        }

        console.log(`      Looking for ${fieldName} with value: ${configValue}`);

        // Check for field overrides first (from rules)
        const overrideFieldName = `${fieldName}_sku_override`;
        if (config[overrideFieldName] && config[overrideFieldName] !== 'NA') {
            console.log(`      Using override: ${config[overrideFieldName]}`);
            parts.push(config[overrideFieldName]);
            continue;
        }

        // Find the item and get its sku_code
        const item = collection.find(item => item.id === configValue);
        if (item?.sku_code) {
            console.log(`      Found sku_code: ${item.sku_code}`);
            parts.push(item.sku_code);
        } else {
            console.log(`      No item found with id ${configValue} or no sku_code`);
        }
    }

    return parts.filter(Boolean).join('-');
}

// Main function
async function generateSmartDecoSKUs() {
    console.log('🚀 Starting Smart Deco SKU generation...');
    const startTime = Date.now();

    try {
        // 1. Fetch all data
        const collections = await fetchAllData();

        // 2. Find Deco product line and products
        const decoProductLine = collections.productLines.find(pl => 
            pl.sku_code === 'D' || pl.name?.toLowerCase().includes('deco')
        );

        if (!decoProductLine) {
            throw new Error('Deco product line not found!');
        }

        console.log(`✓ Found Deco product line: ${decoProductLine.name} (ID: ${decoProductLine.id})`);

        // 3. Filter products for Deco line
        const decoProducts = collections.products.filter(p => 
            p.product_line === decoProductLine.id && p.active !== false
        );

        console.log(`📦 Found ${decoProducts.length} Deco products`);

        // 4. Generate combinations for all Deco products
        const sampleProducts = decoProducts; // Process all Deco products
        console.log(`🔧 Processing all ${sampleProducts.length} Deco products...`);

        let allValidCombinations = [];
        let totalRawCombinations = 0;

        for (const product of sampleProducts) {
            console.log(`\n🔨 Processing product: ${product.name || product.id}`);
            console.log(`  Product constraints: mirror_style=${product.mirror_style}, light_direction=${product.light_direction}, frame_thickness=${product.frame_thickness}`);
            
            // Generate combinations from product line default options
            const combinations = generateSkuCombinationsForProduct(product, collections);
            console.log(`  Generated ${combinations.length} raw combinations from default options`);
            
            totalRawCombinations += combinations.length;

            // Apply rules to filter and modify combinations
            const validCombinations = applyRulesToCombinations(combinations, collections.rules, collections);
            
            allValidCombinations.push(...validCombinations);
        }

        console.log(`\n📊 Summary:`);
        console.log(`  Total raw combinations: ${totalRawCombinations.toLocaleString()}`);
        console.log(`  Total valid combinations: ${allValidCombinations.length.toLocaleString()}`);
        console.log(`  Rules reduced combinations by: ${((totalRawCombinations - allValidCombinations.length) / totalRawCombinations * 100).toFixed(1)}%`);

        // 5. Build SKUs from all valid combinations
        console.log('🔨 Building SKUs from all valid combinations...');
        const skus = [];
        const uniqueSkus = new Set();
        const totalCombinations = allValidCombinations.length; // Process ALL combinations

        for (let i = 0; i < totalCombinations; i++) {
            const config = allValidCombinations[i];
            
            // Only show debug for first 3 configs
            if (i < 3) {
                console.log(`  DEBUG: Building SKU for config ${i}:`, JSON.stringify(config, null, 2));
            }
            
            const sku = buildSkuFromConfig(config, collections);
            
            if (i < 3) {
                console.log(`  DEBUG: Generated SKU: "${sku}"`);
            }
            
            if (sku && sku.trim()) {
                const product = collections.products.find(p => p.id === config.product_id);
                skus.push({
                    sku: sku,
                    config: config,
                    product_id: config.product_id,
                    product_name: product?.name || `Product ${config.product_id}`
                });
                uniqueSkus.add(sku);
            }
            
            // Show progress every 10000 SKUs for better performance with large datasets
            if (i > 0 && i % 10000 === 0) {
                console.log(`    Progress: ${i.toLocaleString()}/${totalCombinations.toLocaleString()} SKUs processed`);
            }
        }

        const endTime = Date.now();
        console.log(`\n🎉 Generation complete!`);
        console.log(`  Total valid combinations: ${allValidCombinations.length.toLocaleString()}`);
        console.log(`  Total SKUs generated: ${skus.length.toLocaleString()}`);
        console.log(`  Unique SKUs generated: ${uniqueSkus.size.toLocaleString()}`);
        console.log(`  Duration: ${endTime - startTime}ms`);

        // 6. Show sample results
        console.log(`\n📋 Sample SKUs (first 20):`);
        skus.slice(0, 20).forEach((item, i) => {
            console.log(`  ${i+1}. ${item.sku} (${item.product_name})`);
        });

        // 7. Save ALL SKUs to file for comprehensive testing
        console.log(`\n💾 Preparing to save all ${skus.length.toLocaleString()} SKUs to JSON file...`);
        const outputData = {
            summary: {
                decoProductsProcessed: sampleProducts.length,
                totalRawCombinations: totalRawCombinations,
                totalValidCombinations: allValidCombinations.length,
                reductionPercentage: ((totalRawCombinations - allValidCombinations.length) / totalRawCombinations * 100),
                totalSkusGenerated: skus.length,
                uniqueSkusGenerated: uniqueSkus.size,
                duration: endTime - startTime,
                rulesAppliedCount: collections.rules.length
            },
            sampleSkus: skus, // Save ALL SKUs for comprehensive testing
            productSample: decoProducts.slice(0, 5).map(p => ({
                id: p.id,
                name: p.name,
                mirror_style: p.mirror_style,
                light_direction: p.light_direction,
                frame_thickness: p.frame_thickness
            })),
            rulesSample: collections.rules.slice(0, 10).map(r => ({
                id: r.id,
                name: r.name || 'Unnamed Rule',
                if_this: r.if_this,
                then_that: r.then_that
            }))
        };

        const filename = `smart-deco-skus-${new Date().toISOString().split('T')[0]}.json`;
        fs.writeFileSync(filename, JSON.stringify(outputData, null, 2));
        console.log(`\n💾 Saved results to ${filename}`);

        return {
            totalValidCombinations: allValidCombinations.length,
            totalSkus: skus.length,
            uniqueSkus: uniqueSkus.size,
            filename: filename
        };

    } catch (error) {
        console.error('❌ Generation failed:', error);
        throw error;
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    generateSmartDecoSKUs()
        .then(result => {
            console.log('\n✅ Success!', result);
            process.exit(0);
        })
        .catch(error => {
            console.error('\n❌ Failed:', error);
            process.exit(1);
        });
}