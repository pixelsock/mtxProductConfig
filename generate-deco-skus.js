#!/usr/bin/env node

/**
 * Smart Deco SKU Generator
 * 
 * This script generates all valid SKU combinations for the Deco product line
 * using product constraints, business rules, and the configured SKU order.
 */

import fs from 'fs';
import path from 'path';

// Simulated data (in a real implementation, this would come from Directus API)
const MOCK_DECO_PRODUCTS = [
    { id: 1720, name: 'T01D', sku_code: 'T01D' },
    { id: 1724, name: 'T06I', sku_code: 'T06I' },
    { id: 1729, name: 'T25I', sku_code: 'T25I' },
    { id: 1733, name: 'W03D', sku_code: 'W03D' },
    { id: 1743, name: 'T11D', sku_code: 'T11D' }
];

const MOCK_FRAME_COLORS = [
    { id: 1, name: 'Black', sku_code: 'BLK' },
    { id: 2, name: 'White', sku_code: 'WHT' },
    { id: 3, name: 'Silver', sku_code: 'SLV' }
];

const MOCK_SIZES = [
    { id: 23, name: '24"x36"', sku_code: '2436', width: '24', height: '36' },
    { id: 24, name: '30"x40"', sku_code: '3040', width: '30', height: '40' },
    { id: 25, name: '36"x48"', sku_code: '3648', width: '36', height: '48' }
];

const MOCK_LIGHT_OUTPUTS = [
    { id: 1, name: 'Standard', sku_code: 'STD' },
    { id: 2, name: 'High Output', sku_code: 'HI' }
];

const MOCK_COLOR_TEMPERATURES = [
    { id: 1, name: '3000K', sku_code: '30K' },
    { id: 2, name: '4000K', sku_code: '40K' },
    { id: 3, name: 'Adjustable', sku_code: 'ADJ' }
];

const MOCK_DRIVERS = [
    { id: 1, name: 'Non-Dimming', sku_code: 'ND' },
    { id: 2, name: '0-10V Dimming', sku_code: '10V' }
];

const MOCK_MOUNTING_OPTIONS = [
    { id: 1, name: 'Portrait', sku_code: 'P' },
    { id: 2, name: 'Landscape', sku_code: 'L' }
];

const MOCK_ACCESSORIES = [
    { id: 1, name: 'Anti-Fog', sku_code: 'AF' },
    { id: 2, name: 'Nightlight', sku_code: 'NL' }
];

/**
 * Generate all possible combinations from option sets
 */
function generateAllCombinations(options) {
    const keys = Object.keys(options);
    const combinations = [];

    function generate(current, keyIndex) {
        if (keyIndex === keys.length) {
            combinations.push({ ...current });
            return;
        }

        const key = keys[keyIndex];
        const values = options[key];

        // Skip empty arrays
        if (!values || values.length === 0) {
            generate(current, keyIndex + 1);
            return;
        }

        for (const value of values) {
            const newCurrent = { ...current };
            newCurrent[key] = value;
            generate(newCurrent, keyIndex + 1);
        }
    }

    generate({}, 0);
    return combinations;
}

/**
 * Build a SKU from configuration (simplified version)
 */
function buildSKU(combination, product) {
    const parts = [];
    
    // Product code (base)
    parts.push(product.sku_code.substring(0, 3)); // T01, W03, etc.
    
    // Size
    if (combination.sizes) {
        parts.push(combination.sizes.sku_code);
    }
    
    // Frame color (if not frameless/default)
    if (combination.frameColors && combination.frameColors.sku_code !== 'NA') {
        parts.push(combination.frameColors.sku_code);
    }
    
    // Light output
    if (combination.lightOutputs && combination.lightOutputs.sku_code !== 'STD') {
        parts.push(combination.lightOutputs.sku_code);
    }
    
    // Color temperature
    if (combination.colorTemperatures) {
        parts.push(combination.colorTemperatures.sku_code);
    }
    
    // Driver
    if (combination.drivers && combination.drivers.sku_code !== 'ND') {
        parts.push(combination.drivers.sku_code);
    }
    
    // Mounting (if not default)
    if (combination.mountingOptions && combination.mountingOptions.sku_code !== 'P') {
        parts.push(combination.mountingOptions.sku_code);
    }
    
    // Accessories
    if (combination.accessories) {
        if (Array.isArray(combination.accessories)) {
            combination.accessories.forEach(acc => parts.push(acc.sku_code));
        } else {
            parts.push(combination.accessories.sku_code);
        }
    }
    
    return parts.join('-');
}

/**
 * Apply business rules to filter valid combinations
 */
function applyBusinessRules(combinations) {
    return combinations.filter(combo => {
        // Example rule: High output only available with adjustable color temperature
        if (combo.lightOutputs?.sku_code === 'HI' && combo.colorTemperatures?.sku_code !== 'ADJ') {
            return false;
        }
        
        // Example rule: Anti-fog requires specific driver
        if (combo.accessories?.sku_code === 'AF' && combo.drivers?.sku_code === 'ND') {
            return false;
        }
        
        // All other combinations are valid
        return true;
    });
}

/**
 * Main generation function
 */
async function generateDecoSKUs() {
    const startTime = Date.now();
    console.log('🚀 Starting Deco SKU generation...');
    
    // Define available options
    const allOptions = {
        frameColors: MOCK_FRAME_COLORS,
        sizes: MOCK_SIZES,
        lightOutputs: MOCK_LIGHT_OUTPUTS,
        colorTemperatures: MOCK_COLOR_TEMPERATURES,
        drivers: MOCK_DRIVERS,
        mountingOptions: MOCK_MOUNTING_OPTIONS,
        accessories: [...MOCK_ACCESSORIES, null] // null = no accessory
    };
    
    console.log('📊 Option counts:');
    Object.entries(allOptions).forEach(([key, values]) => {
        const count = Array.isArray(values) ? values.length : 0;
        console.log(`  ${key}: ${count} options`);
    });
    
    // Generate all possible combinations
    console.log('\n🔧 Generating combinations...');
    const allCombinations = generateAllCombinations(allOptions);
    console.log(`✓ Generated ${allCombinations.length.toLocaleString()} total combinations`);
    
    // Apply business rules
    console.log('\n📋 Applying business rules...');
    const validCombinations = applyBusinessRules(allCombinations);
    console.log(`✓ ${validCombinations.length.toLocaleString()} valid combinations after rules`);
    
    // Generate SKUs for each product
    console.log('\n🏷️ Generating SKUs...');
    const allSKUs = [];
    const uniqueSKUs = new Set();
    
    for (const product of MOCK_DECO_PRODUCTS) {
        for (const combination of validCombinations) {
            const sku = buildSKU(combination, product);
            const skuData = {
                sku: sku,
                product_id: product.id,
                product_name: product.name,
                config: {
                    frame_color: combination.frameColors?.name || null,
                    size: combination.sizes?.name || null,
                    light_output: combination.lightOutputs?.name || null,
                    color_temperature: combination.colorTemperatures?.name || null,
                    driver: combination.drivers?.name || null,
                    mounting_option: combination.mountingOptions?.name || null,
                    accessory: combination.accessories ? [combination.accessories.name] : []
                }
            };
            
            allSKUs.push(skuData);
            uniqueSKUs.add(sku);
        }
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Create summary
    const summary = {
        generatedAt: new Date().toISOString(),
        duration: duration,
        decoProductsProcessed: MOCK_DECO_PRODUCTS.length,
        totalValidCombinations: allSKUs.length,
        uniqueSKUs: uniqueSKUs.size,
        rulesAppliedCount: allCombinations.length - validCombinations.length,
        optionCounts: Object.fromEntries(
            Object.entries(allOptions).map(([key, values]) => [
                key, 
                Array.isArray(values) ? values.length : 0
            ])
        )
    };
    
    // Sample the SKUs for the JSON file (take first 100 for demo)
    const sampleSkus = allSKUs.slice(0, 100);
    
    // Create output data
    const outputData = {
        summary: summary,
        sampleSkus: sampleSkus,
        metadata: {
            description: 'Smart generated Deco SKUs with business rules applied',
            sampleSize: sampleSkus.length,
            totalSize: allSKUs.length,
            generatorVersion: '1.0.0'
        }
    };
    
    // Write to JSON file
    const filename = `smart-deco-skus-${new Date().toISOString().split('T')[0]}.json`;
    const filepath = path.resolve(filename);
    
    fs.writeFileSync(filepath, JSON.stringify(outputData, null, 2));
    
    console.log('\n🎉 Generation complete!');
    console.log(`  - Total combinations: ${allSKUs.length.toLocaleString()}`);
    console.log(`  - Unique SKUs: ${uniqueSKUs.size.toLocaleString()}`);
    console.log(`  - Generation time: ${duration}ms`);
    console.log(`  - Rules filtered: ${summary.rulesAppliedCount} invalid combinations`);
    console.log(`  - Output file: ${filename}`);
    console.log(`  - Sample size: ${sampleSkus.length} SKUs`);
    
    // Show some sample SKUs
    console.log('\n📋 Sample generated SKUs:');
    sampleSkus.slice(0, 10).forEach((item, i) => {
        console.log(`  ${i+1}. ${item.sku} (${item.product_name})`);
    });
    
    if (sampleSkus.length > 10) {
        console.log(`  ... and ${sampleSkus.length - 10} more`);
    }
    
    return outputData;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    generateDecoSKUs().catch(console.error);
}

export { generateDecoSKUs };