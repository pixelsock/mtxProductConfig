#!/usr/bin/env node

import fs from 'fs';
import https from 'https';
import { URL } from 'url';
import http from 'http';

// Configuration
const DIRECTUS_URL = 'https://pim.dude.digital';
const DIRECTUS_TOKEN = 'Etqos_amy96Dxm6ab9TWnkjR_lF19XOK';
const PORT = 3001;

// In-memory cache for performance
let dataCache = null;
let cacheExpiry = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Helper function to fetch data from Directus
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

// Fetch and cache all required data
async function getCachedData() {
    if (dataCache && Date.now() < cacheExpiry) {
        return dataCache;
    }

    console.log('🔄 Refreshing data cache...');
    
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

        dataCache = {
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
        
        cacheExpiry = Date.now() + CACHE_DURATION;
        console.log('✅ Data cache refreshed');
        return dataCache;
    } catch (error) {
        console.error('❌ Failed to refresh data cache:', error);
        throw error;
    }
}

// Simplified SKU generation functions (from previous work)
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
        
        if (fieldCondition._eq !== undefined && configValue != fieldCondition._eq) return false;
        if (fieldCondition._neq !== undefined && configValue == fieldCondition._neq) return false;
        if (fieldCondition._in && Array.isArray(fieldCondition._in) && !fieldCondition._in.includes(configValue)) return false;
        if (fieldCondition._nin && Array.isArray(fieldCondition._nin) && fieldCondition._nin.includes(configValue)) return false;
        if (fieldCondition._empty !== undefined) {
            const isEmpty = !configValue || configValue === '' || (Array.isArray(configValue) && configValue.length === 0);
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

// Generate SKUs on-demand based on search criteria
async function generateMatchingSKUs(searchQuery, limit = 50) {
    const collections = await getCachedData();
    
    // Find Deco product line
    const decoProductLine = collections.productLines.find(pl => 
        pl.sku_code === 'D' || pl.name?.toLowerCase().includes('deco')
    );

    if (!decoProductLine) {
        throw new Error('Deco product line not found!');
    }

    const decoProducts = collections.products.filter(p => 
        p.product_line === decoProductLine.id && p.active !== false
    );

    const matchingSKUs = [];
    let generated = 0;

    // If no search query, return some sample SKUs from different products
    if (!searchQuery || searchQuery.trim() === '') {
        // Generate a few SKUs from each of the first few products
        for (const product of decoProducts.slice(0, 5)) {
            if (matchingSKUs.length >= limit) break;
            
            // Generate 5-10 sample SKUs per product
            const sampleCombinations = generateSampleCombinationsForProduct(product, collections);
            
            for (const combination of sampleCombinations.slice(0, 10)) {
                if (matchingSKUs.length >= limit) break;
                
                let config = { ...combination };
                
                // Apply rules
                for (const rule of collections.rules) {
                    if (!rule.if_this || !rule.then_that) continue;
                    try {
                        if (evaluateCondition(rule.if_this, config)) {
                            config = applyRuleModifications(rule.then_that, config);
                        }
                    } catch (error) {
                        continue;
                    }
                }
                
                const sku = buildSkuFromConfig(config, collections);
                if (sku && sku.trim()) {
                    matchingSKUs.push({
                        sku: sku,
                        product_id: config.product_id,
                        product_name: product.name || `Product ${product.id}`,
                        config: config
                    });
                }
            }
        }
        return matchingSKUs;
    }

    // Generate SKUs that match the search query
    const searchUpper = searchQuery.toUpperCase();
    
    for (const product of decoProducts) {
        if (matchingSKUs.length >= limit) break;
        
        // Generate sample combinations and check if they match
        const combinations = generateSampleCombinationsForProduct(product, collections);
        
        for (const combination of combinations) {
            if (matchingSKUs.length >= limit) break;
            
            let config = { ...combination };
            
            // Apply rules
            for (const rule of collections.rules) {
                if (!rule.if_this || !rule.then_that) continue;
                try {
                    if (evaluateCondition(rule.if_this, config)) {
                        config = applyRuleModifications(rule.then_that, config);
                    }
                } catch (error) {
                    continue;
                }
            }
            
            const sku = buildSkuFromConfig(config, collections);
            if (sku && sku.trim() && sku.toUpperCase().includes(searchUpper)) {
                matchingSKUs.push({
                    sku: sku,
                    product_id: config.product_id,
                    product_name: product.name || `Product ${product.id}`,
                    config: config
                });
            }
            
            generated++;
            if (generated % 1000 === 0) {
                // Prevent timeout - if we've generated many without matches, break
                break;
            }
        }
    }

    return matchingSKUs;
}

// Generate a reasonable sample of combinations for a product (not all)
function generateSampleCombinationsForProduct(product, collections) {
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

    // Get available options (same logic as before but limit to reasonable samples)
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

    // Filter collections - LIMIT TO SAMPLES
    const filteredCollections = {
        frameColors: collections.frameColors.filter(item => 
            availableOptionIdsByCollection.frame_colors?.includes(item.id) || false
        ).slice(0, 3), // Max 3 colors
        sizes: collections.sizes.filter(item => 
            availableOptionIdsByCollection.sizes?.includes(item.id) || false
        ).slice(0, 5), // Max 5 sizes
        lightOutputs: collections.lightOutputs.filter(item => 
            availableOptionIdsByCollection.light_outputs?.includes(item.id) || false
        ).slice(0, 2), // Max 2 outputs
        colorTemperatures: collections.colorTemperatures.filter(item => 
            availableOptionIdsByCollection.color_temperatures?.includes(item.id) || false
        ).slice(0, 3), // Max 3 temps
        drivers: collections.drivers.filter(item => 
            availableOptionIdsByCollection.drivers?.includes(item.id) || false
        ).slice(0, 2), // Max 2 drivers
        mountingOptions: collections.mountingOptions.filter(item => 
            availableOptionIdsByCollection.mounting_options?.includes(item.id) || false
        ).slice(0, 2), // Max 2 mounting
        accessories: collections.accessories.filter(item => 
            availableOptionIdsByCollection.accessories?.includes(item.id) || false
        ).slice(0, 2) // Max 2 accessories
    };

    // Generate limited combinations
    const combinations = [];
    const maxCombinations = 100; // Limit total combinations per product
    
    function generateCombinations(collectionIndex, currentConfig) {
        if (combinations.length >= maxCombinations) return;
        
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
            // Only generate basic accessory combinations
            const accessoryIds = filteredItems.map(item => item.id);
            const basicCombos = [[], ...accessoryIds.map(id => [id])]; // Empty + individual accessories only
            
            for (const accessoryCombo of basicCombos) {
                if (combinations.length >= maxCombinations) return;
                const newConfig = { 
                    ...currentConfig,
                    accessory: accessoryCombo
                };
                generateCombinations(collectionIndex + 1, newConfig);
            }
        } else {
            for (const item of filteredItems) {
                if (combinations.length >= maxCombinations) return;
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

// Create HTTP server for API
function createSkuSearchAPI() {
    const server = http.createServer(async (req, res) => {
        // CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        
        if (req.method === 'OPTIONS') {
            res.writeHead(200);
            res.end();
            return;
        }

        try {
            const url = new URL(req.url, `http://localhost:${PORT}`);
            
            if (url.pathname === '/api/sku/search') {
                const searchQuery = url.searchParams.get('q') || '';
                const limit = parseInt(url.searchParams.get('limit')) || 50;
                
                console.log(`🔍 Searching for: "${searchQuery}" (limit: ${limit})`);
                
                const startTime = Date.now();
                const results = await generateMatchingSKUs(searchQuery, limit);
                const duration = Date.now() - startTime;
                
                console.log(`✅ Found ${results.length} SKUs in ${duration}ms`);
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    query: searchQuery,
                    results: results,
                    count: results.length,
                    duration: duration
                }));
                
            } else if (url.pathname === '/api/sku/stats') {
                const collections = await getCachedData();
                const decoProducts = collections.products.filter(p => {
                    const decoProductLine = collections.productLines.find(pl => 
                        pl.sku_code === 'D' || pl.name?.toLowerCase().includes('deco')
                    );
                    return p.product_line === decoProductLine?.id && p.active !== false;
                });
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    products_available: decoProducts.length,
                    rules_count: collections.rules.length,
                    cache_expires: new Date(cacheExpiry).toISOString()
                }));
                
            } else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Not found' }));
            }
            
        } catch (error) {
            console.error('❌ API Error:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
        }
    });

    server.listen(PORT, () => {
        console.log(`🚀 SKU Search API running on http://localhost:${PORT}`);
        console.log('📋 Available endpoints:');
        console.log(`  GET /api/sku/search?q=D01&limit=50 - Search SKUs`);
        console.log(`  GET /api/sku/stats - Get API stats`);
        console.log('');
        console.log('🔍 Example searches:');
        console.log(`  curl "http://localhost:${PORT}/api/sku/search?q=D01"`);
        console.log(`  curl "http://localhost:${PORT}/api/sku/search?q=24X36"`);
        console.log(`  curl "http://localhost:${PORT}/api/sku/stats"`);
    });

    return server;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    createSkuSearchAPI();
}