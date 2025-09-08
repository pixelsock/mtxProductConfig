#!/usr/bin/env node

import fs from 'fs';
import https from 'https';
import { URL } from 'url';

// Configuration
const DIRECTUS_URL = 'https://pim.dude.digital';
const DIRECTUS_TOKEN = 'Etqos_amy96Dxm6ab9TWnkjR_lF19XOK';
const BATCH_SIZE = 50; // Smaller batches for reliability

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

// Clear existing searchable SKUs
async function clearSearchableSkus() {
    console.log('🧹 Clearing existing searchable SKUs...');
    
    try {
        // Get all existing records
        const existingRecords = await fetchData('/items/searchable_skus?limit=-1&fields=id');
        
        if (existingRecords.length > 0) {
            console.log(`  Found ${existingRecords.length} existing records to clear`);
            
            // Delete in batches
            const deletePromises = [];
            for (let i = 0; i < existingRecords.length; i += BATCH_SIZE) {
                const batch = existingRecords.slice(i, i + BATCH_SIZE);
                const deleteIds = batch.map(record => record.id);
                
                const deletePromise = postData('/items/searchable_skus', {
                    delete: deleteIds
                }).catch(error => {
                    console.warn(`⚠️ Failed to delete batch ${i}: ${error.message}`);
                });
                
                deletePromises.push(deletePromise);
            }
            
            await Promise.all(deletePromises);
            console.log('✓ Existing records cleared');
        } else {
            console.log('✓ No existing records to clear');
        }
    } catch (error) {
        console.log('⚠️ Could not clear existing records:', error.message);
    }
}

// Insert searchable SKUs in batches
async function insertSearchableSkusBatch(skuRecords) {
    if (skuRecords.length === 0) return [];

    console.log(`  📝 Inserting batch of ${skuRecords.length} SKUs...`);
    
    try {
        const response = await postData('/items/searchable_skus', skuRecords);
        return response.data || [];
    } catch (error) {
        console.error('❌ Failed to insert SKUs batch:', error.message);
        throw error;
    }
}

// Fetch all required data (reuse existing logic)
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

        console.log('📊 Data fetched successfully');
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

// Reuse the existing smart generation logic
// (copying key functions from generate-smart-skus.mjs with minimal changes)

function evaluateCondition(condition, config) {
    if (!condition || typeof condition !== 'object') return true;

    if (condition._and && Array.isArray(condition._and)) {
        return condition._and.every(subCondition => evaluateCondition(subCondition, config));
    }

    if (condition._or && Array.isArray(condition._or)) {
        return condition._or.some(subCondition => evaluateCondition(subCondition, config));
    }

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

function applyRuleModifications(modifications, config) {
    const newConfig = { ...config };
    
    if (!modifications || typeof modifications !== 'object') return newConfig;

    if (modifications._and && Array.isArray(modifications._and)) {
        for (const subModification of modifications._and) {
            Object.assign(newConfig, applyRuleModifications(subModification, newConfig));
        }
        return newConfig;
    }

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
                continue;
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

// Main function to populate searchable SKUs
async function generateSearchableSkus() {
    console.log('🚀 Starting searchable SKU generation...');
    const startTime = Date.now();

    try {
        // 1. Clear existing data
        await clearSearchableSkus();

        // 2. Fetch all data
        const collections = await fetchAllData();

        // 3. Find Deco products
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
        let totalValidSkus = 0;
        let skuBatch = [];

        // 4. Process each product
        for (const [productIndex, product] of decoProducts.entries()) {
            console.log(`\n🔨 Processing product ${productIndex + 1}/${decoProducts.length}: ${product.name || product.id}`);
            
            // Generate combinations
            const combinations = generateSkuCombinationsForProduct(product, collections);
            console.log(`  Generated ${combinations.length} raw combinations`);
            
            totalCombinations += combinations.length;

            // Apply rules and build SKUs
            for (const combination of combinations) {
                let config = { ...combination };

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

                // Build SKU
                const sku = buildSkuFromConfig(config, collections);
                
                if (sku && sku.trim()) {
                    const productName = product.name || `Product ${product.id}`;
                    
                    skuBatch.push({
                        sku_code: sku,
                        product_name: productName,
                        configuration_json: config
                    });
                    
                    totalValidSkus++;

                    // Insert in batches
                    if (skuBatch.length >= BATCH_SIZE) {
                        await insertSearchableSkusBatch(skuBatch);
                        skuBatch = [];
                    }
                }
            }

            // Show progress
            if ((productIndex + 1) % 5 === 0) {
                console.log(`  Progress: ${productIndex + 1}/${decoProducts.length} products processed`);
                console.log(`  Total valid SKUs so far: ${totalValidSkus.toLocaleString()}`);
            }
        }

        // Insert remaining SKUs
        if (skuBatch.length > 0) {
            await insertSearchableSkusBatch(skuBatch);
        }

        const endTime = Date.now();

        console.log('\n🎉 Searchable SKU generation complete!');
        console.log(`  Total combinations processed: ${totalCombinations.toLocaleString()}`);
        console.log(`  Valid SKUs generated: ${totalValidSkus.toLocaleString()}`);
        console.log(`  Products processed: ${decoProducts.length}`);
        console.log(`  Duration: ${endTime - startTime}ms`);

        return {
            totalCombinations,
            validSkus: totalValidSkus,
            productsProcessed: decoProducts.length,
            duration: endTime - startTime
        };

    } catch (error) {
        console.error('❌ Searchable SKU generation failed:', error);
        throw error;
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    generateSearchableSkus()
        .then(result => {
            console.log('\n✅ Success!', result);
            process.exit(0);
        })
        .catch(error => {
            console.error('\n❌ Failed:', error);
            process.exit(1);
        });
}