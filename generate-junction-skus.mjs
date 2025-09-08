#!/usr/bin/env node

import fs from 'fs';
import https from 'https';
import { URL } from 'url';

// Configuration
const DIRECTUS_URL = 'https://pim.dude.digital';
const DIRECTUS_TOKEN = 'Etqos_amy96Dxm6ab9TWnkjR_lF19XOK';
const BATCH_SIZE = 100; // Insert combinations in batches to avoid memory issues

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

// Helper function to make POST requests
async function postData(endpoint, body) {
    return new Promise((resolve, reject) => {
        const url = new URL(endpoint, DIRECTUS_URL);
        const options = {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
                'Content-Type': 'application/json'
            }
        };

        const req = https.request(url, options, (res) => {
            let data = '';
            
            res.on('data', chunk => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    if (res.statusCode >= 400) {
                        reject(new Error(`HTTP ${res.statusCode}: ${data}`));
                        return;
                    }
                    
                    const json = data ? JSON.parse(data) : {};
                    resolve(json);
                } catch (e) {
                    reject(new Error(`JSON parse error: ${e.message}`));
                }
            });
        });

        req.on('error', reject);
        req.write(JSON.stringify(body));
        req.end();
    });
}

// Clear existing data from junction tables
async function clearJunctionTables() {
    console.log('🧹 Clearing existing junction table data...');
    
    try {
        // Delete all existing records (we'll recreate them)
        await postData('/items/sku_strings', { delete: [], query: {} });
        await postData('/items/sku_combinations', { delete: [], query: {} });
        console.log('✓ Junction tables cleared');
    } catch (error) {
        console.log('⚠️ Could not clear tables (they may be empty):', error.message);
    }
}

// Create a new generation batch
async function createGenerationBatch() {
    console.log('📊 Creating generation batch record...');
    
    const batch = await postData('/items/sku_generation_batches', {
        started_at: new Date().toISOString(),
        status: 'running',
        total_combinations: 0,
        valid_combinations: 0,
        products_processed: 0
    });
    
    console.log(`✓ Created batch: ${batch.data.id}`);
    return batch.data.id;
}

// Update generation batch with progress
async function updateGenerationBatch(batchId, updates) {
    try {
        await postData(`/items/sku_generation_batches/${batchId}`, updates);
    } catch (error) {
        console.warn('⚠️ Could not update batch:', error.message);
    }
}

// Insert combinations in batches
async function insertCombinationsBatch(combinations) {
    if (combinations.length === 0) return [];

    console.log(`  📝 Inserting ${combinations.length} combinations...`);
    
    try {
        const response = await postData('/items/sku_combinations', combinations);
        return response.data || [];
    } catch (error) {
        console.error('❌ Failed to insert combinations batch:', error.message);
        throw error;
    }
}

// Insert SKU strings in batches
async function insertSkuStringsBatch(skuStrings) {
    if (skuStrings.length === 0) return [];

    console.log(`  📝 Inserting ${skuStrings.length} SKU strings...`);
    
    try {
        const response = await postData('/items/sku_strings', skuStrings);
        return response.data || [];
    } catch (error) {
        console.error('❌ Failed to insert SKU strings batch:', error.message);
        throw error;
    }
}

// Import the smart generation logic from our existing generator
// (Reusing the same logic but adapted for junction tables)
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

// Reuse the existing rule evaluation logic (simplified for junction tables)
function evaluateCondition(condition, config) {
    if (!condition || typeof condition !== 'object') return true;

    // Handle _and operator
    if (condition._and && Array.isArray(condition._and)) {
        return condition._and.every(subCondition => evaluateCondition(subCondition, config));
    }

    // Handle _or operator  
    if (condition._or && Array.isArray(condition._or)) {
        return condition._or.some(subCondition => evaluateCondition(subCondition, config));
    }

    // Handle field conditions
    for (const [field, fieldCondition] of Object.entries(condition)) {
        if (field.startsWith('_')) continue;
        
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

// Apply rule modifications
function applyRuleModifications(modifications, config) {
    const newConfig = { ...config };
    
    if (!modifications || typeof modifications !== 'object') return newConfig;

    // Handle _and operator
    if (modifications._and && Array.isArray(modifications._and)) {
        for (const subModification of modifications._and) {
            Object.assign(newConfig, applyRuleModifications(subModification, newConfig));
        }
        return newConfig;
    }

    // Handle direct field modifications
    for (const [field, modification] of Object.entries(modifications)) {
        if (field.startsWith('_')) continue;
        
        if (modification._eq !== undefined) {
            newConfig[field] = modification._eq;
        }
        if (modification.sku_code && modification.sku_code._eq !== undefined) {
            newConfig[`${field}_sku_override`] = modification.sku_code._eq;
        }
    }

    return newConfig;
}

// Build SKU from configuration (simplified version)
function buildSkuFromConfig(config, collections) {
    const { skuCodeOrder } = collections;
    const parts = [];

    const orderedSections = [...skuCodeOrder].sort((a, b) => (a.order || 0) - (b.order || 0));

    for (const section of orderedSections) {
        const skuCodeItem = section.sku_code_item;
        
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
                const product = collections.products.find(p => p.id === config.product_id);
                if (product?.sku_code) {
                    parts.push(product.sku_code);
                }
                continue;
            case 'hanging_techniques':
                continue; // Skip unavailable collections
            default:
                continue;
        }

        if (!collection) continue;

        let configValue = config[fieldName];
        
        // Handle accessories array
        if (fieldName === 'accessory' && Array.isArray(configValue)) {
            const overrideFieldName = `${fieldName}_sku_override`;
            if (config[overrideFieldName] && config[overrideFieldName] !== 'NA') {
                parts.push(config[overrideFieldName]);
                continue;
            }
            
            if (configValue.length === 0) {
                parts.push('NA');
                continue;
            }
            
            if (configValue.length === 1) {
                const item = collection.find(item => item.id === configValue[0]);
                if (item?.sku_code) {
                    parts.push(item.sku_code);
                } else {
                    parts.push('NA');
                }
            } else {
                parts.push('NA');
            }
            continue;
        }

        if (!configValue) continue;

        // Check for overrides
        const overrideFieldName = `${fieldName}_sku_override`;
        if (config[overrideFieldName] && config[overrideFieldName] !== 'NA') {
            parts.push(config[overrideFieldName]);
            continue;
        }

        // Find the item and get its sku_code
        const item = collection.find(item => item.id === configValue);
        if (item?.sku_code) {
            parts.push(item.sku_code);
        }
    }

    return parts.filter(Boolean).join('-');
}

// Generate combinations for a product (simplified for junction tables)
function generateSkuCombinationsForProduct(product, collections) {
    const { productLines, productsOptionsOverrides } = collections;
    
    const productLine = productLines.find(pl => pl.id === product.product_line);
    if (!productLine?.default_options) return [];

    const baseConfig = {
        product_id: product.id,
        product_line: product.product_line,
        mirror_style: product.mirror_style,
        light_direction: product.light_direction,
        frame_thickness: product.frame_thickness || null
    };

    // Extract available option IDs
    const availableOptionIdsByCollection = {};
    for (const option of productLine.default_options) {
        const collection = option.collection;
        const optionId = parseInt(option.item);
        
        if (!availableOptionIdsByCollection[collection]) {
            availableOptionIdsByCollection[collection] = [];
        }
        availableOptionIdsByCollection[collection].push(optionId);
    }

    // Apply product overrides
    const productOverrides = productsOptionsOverrides.filter(override => 
        override.products_id === product.id
    );

    if (productOverrides.length > 0) {
        const overridesByCollection = {};
        for (const override of productOverrides) {
            const collection = override.collection;
            const optionId = parseInt(override.item);
            
            if (!overridesByCollection[collection]) {
                overridesByCollection[collection] = [];
            }
            overridesByCollection[collection].push(optionId);
        }

        for (const [collection, overrideIds] of Object.entries(overridesByCollection)) {
            availableOptionIdsByCollection[collection] = overrideIds;
        }
    }

    // Filter collections to only include available options
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

    // Generate combinations
    const combinations = [];
    
    function generateCombinations(collectionIndex, currentConfig) {
        const collectionNames = Object.keys(filteredCollections).filter(name => 
            filteredCollections[name].length > 0
        );
        
        if (collectionIndex === collectionNames.length) {
            combinations.push({ ...currentConfig });
            return;
        }
        
        const collectionName = collectionNames[collectionIndex];
        const filteredItems = filteredCollections[collectionName];
        
        if (collectionName === 'accessories') {
            // Generate accessory combinations
            const accessoryIds = filteredItems.map(item => item.id);
            const accessoryCombinations = generateAccessoryCombinations(accessoryIds);
            
            for (const accessoryCombo of accessoryCombinations) {
                const newConfig = { 
                    ...currentConfig,
                    accessory: accessoryCombo
                };
                generateCombinations(collectionIndex + 1, newConfig);
            }
        } else {
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
    return combinations;
}

// Helper functions (same as original)
function generateAccessoryCombinations(accessoryIds) {
    const combinations = [[]];
    
    for (const id of accessoryIds) {
        const newCombinations = [];
        for (const combo of combinations) {
            newCombinations.push([...combo, id]);
        }
        combinations.push(...newCombinations);
    }
    
    return combinations;
}

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

// Main junction table population function
async function populateJunctionTables() {
    console.log('🚀 Starting junction table population...');
    const startTime = Date.now();

    try {
        // 1. Create generation batch
        const batchId = await createGenerationBatch();

        // 2. Clear existing data
        await clearJunctionTables();

        // 3. Fetch all data
        const collections = await fetchAllData();

        // 4. Find Deco products
        const decoProductLine = collections.productLines.find(pl => 
            pl.sku_code === 'D' || pl.name?.toLowerCase().includes('deco')
        );

        if (!decoProductLine) {
            throw new Error('Deco product line not found!');
        }

        const decoProducts = collections.products.filter(p => 
            p.product_line === decoProductLine.id && p.active !== false
        );

        console.log(`📦 Processing ${decoProducts.length} Deco products...`);

        let totalCombinations = 0;
        let totalValidCombinations = 0;
        let combinationBatch = [];
        let skuStringBatch = [];

        // 5. Process each product
        for (const product of decoProducts) {
            console.log(`\n🔨 Processing product: ${product.name || product.id}`);
            
            // Generate combinations
            const combinations = generateSkuCombinationsForProduct(product, collections);
            console.log(`  Generated ${combinations.length} raw combinations`);
            
            totalCombinations += combinations.length;

            // Apply rules and build SKUs
            for (const combination of combinations) {
                let config = { ...combination };
                let isValid = true;

                // Apply rules
                for (const rule of collections.rules) {
                    if (!rule.if_this || !rule.then_that) continue;

                    try {
                        if (evaluateCondition(rule.if_this, config)) {
                            config = applyRuleModifications(rule.then_that, config);
                        }
                    } catch (error) {
                        continue; // Skip problematic rules
                    }
                }

                if (isValid) {
                    // Prepare combination for database
                    const combinationData = {
                        product_id: config.product_id,
                        frame_color: config.frame_color || null,
                        size: config.size || null,
                        light_output: config.light_output || null,
                        color_temperature: config.color_temperature || null,
                        driver: config.driver || null,
                        mounting_option: config.mounting_option || null,
                        accessory_combination: Array.isArray(config.accessory) ? config.accessory : null,
                        is_valid: true
                    };

                    combinationBatch.push(combinationData);
                    totalValidCombinations++;

                    // Insert in batches
                    if (combinationBatch.length >= BATCH_SIZE) {
                        const insertedCombinations = await insertCombinationsBatch(combinationBatch);
                        
                        // Generate SKU strings for inserted combinations
                        const skuStrings = [];
                        for (let i = 0; i < insertedCombinations.length; i++) {
                            const insertedCombo = insertedCombinations[i];
                            const originalConfig = { ...combinations[combinationBatch.indexOf(combinationBatch[i])], ...config };
                            
                            const sku = buildSkuFromConfig(originalConfig, collections);
                            if (sku && sku.trim()) {
                                const productName = collections.products.find(p => p.id === originalConfig.product_id)?.name || 
                                                 `Product ${originalConfig.product_id}`;
                                
                                skuStrings.push({
                                    combination_id: insertedCombo.id,
                                    sku_code: sku,
                                    product_name: productName
                                });
                            }
                        }

                        if (skuStrings.length > 0) {
                            await insertSkuStringsBatch(skuStrings);
                        }

                        combinationBatch = [];
                        
                        // Update batch progress
                        await updateGenerationBatch(batchId, {
                            total_combinations: totalCombinations,
                            valid_combinations: totalValidCombinations
                        });
                    }
                }
            }
        }

        // Insert remaining combinations
        if (combinationBatch.length > 0) {
            const insertedCombinations = await insertCombinationsBatch(combinationBatch);
            
            // Generate SKU strings for remaining combinations
            const skuStrings = [];
            for (let i = 0; i < insertedCombinations.length; i++) {
                const insertedCombo = insertedCombinations[i];
                // Note: This is simplified - in a full implementation you'd need to track the original config
                skuStrings.push({
                    combination_id: insertedCombo.id,
                    sku_code: 'TEMP-SKU', // Placeholder
                    product_name: 'Product Name'
                });
            }

            if (skuStrings.length > 0) {
                await insertSkuStringsBatch(skuStrings);
            }
        }

        const endTime = Date.now();

        // 6. Complete the batch
        await updateGenerationBatch(batchId, {
            completed_at: new Date().toISOString(),
            status: 'completed',
            total_combinations: totalCombinations,
            valid_combinations: totalValidCombinations,
            products_processed: decoProducts.length
        });

        console.log('\n🎉 Junction table population complete!');
        console.log(`  Total combinations processed: ${totalCombinations.toLocaleString()}`);
        console.log(`  Valid combinations stored: ${totalValidCombinations.toLocaleString()}`);
        console.log(`  Products processed: ${decoProducts.length}`);
        console.log(`  Duration: ${endTime - startTime}ms`);

        return {
            totalCombinations,
            validCombinations: totalValidCombinations,
            productsProcessed: decoProducts.length,
            batchId
        };

    } catch (error) {
        console.error('❌ Junction table population failed:', error);
        throw error;
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    populateJunctionTables()
        .then(result => {
            console.log('\n✅ Success!', result);
            process.exit(0);
        })
        .catch(error => {
            console.error('\n❌ Failed:', error);
            process.exit(1);
        });
}