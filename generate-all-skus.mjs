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

        console.log(`  📡 Fetching: ${url.href}`);

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
                    console.log(`  ✓ Got ${Array.isArray(result) ? result.length : 1} items`);
                    resolve(result);
                } catch (e) {
                    console.log(`  ❌ JSON parse error: ${e.message}`);
                    console.log(`  Response: ${data.substring(0, 200)}...`);
                    reject(new Error(`JSON parse error: ${e.message}`));
                }
            });
        }).on('error', (err) => {
            console.log(`  ❌ Network error: ${err.message}`);
            reject(err);
        });
    });
}

// Fetch all collections
async function fetchAllCollections() {
    console.log('🔄 Fetching all collections...');
    
    try {
        const collections = await Promise.all([
            fetchData('/items/product_lines?filter[active][_eq]=true&sort=sort'),
            fetchData('/items/frame_colors?filter[active][_eq]=true&sort=sort'),
            fetchData('/items/mirror_styles?filter[active][_eq]=true&sort=sort'),
            fetchData('/items/mounting_options?filter[active][_eq]=true&sort=sort'),
            fetchData('/items/light_directions?filter[active][_eq]=true&sort=sort'),
            fetchData('/items/color_temperatures?filter[active][_eq]=true&sort=sort'),
            fetchData('/items/light_outputs?filter[active][_eq]=true&sort=sort'),
            fetchData('/items/drivers?filter[active][_eq]=true&sort=sort'),
            fetchData('/items/frame_thicknesses?filter[active][_eq]=true&sort=sort'),
            fetchData('/items/sizes?filter[active][_eq]=true&sort=sort'),
            fetchData('/items/accessories?filter[active][_eq]=true&sort=sort')
        ]);

        const [
            productLines,
            frameColors,
            mirrorStyles,
            mountingOptions,
            lightDirections,
            colorTemperatures,
            lightOutputs,
            drivers,
            frameThicknesses,
            sizes,
            accessories
        ] = collections;

        return {
            productLines,
            frameColors,
            mirrorStyles,
            mountingOptions,
            lightDirections,
            colorTemperatures,
            lightOutputs,
            drivers,
            frameThicknesses,
            sizes,
            accessories
        };
    } catch (error) {
        console.error('❌ Failed to fetch collections:', error);
        throw error;
    }
}

// Generate all combinations
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

// Simple SKU builder
function buildSKU(combination, productLine) {
    const parts = [];

    // Core: ProductLine + MirrorStyle + LightDirection
    const productLineCode = productLine?.sku_code || '';
    const mirrorStyleCode = combination.mirrorStyles?.sku_code || '';
    const lightDirectionCode = combination.lightDirections?.sku_code || '';
    const core = productLineCode + mirrorStyleCode + lightDirectionCode;
    if (core) parts.push(core);

    // Size
    if (combination.sizes?.sku_code) {
        parts.push(combination.sizes.sku_code);
    } else if (combination.sizes?.width && combination.sizes?.height) {
        const w = parseFloat(combination.sizes.width);
        const h = parseFloat(combination.sizes.height);
        if (!isNaN(w) && !isNaN(h)) {
            parts.push(`${w}${Math.round(h)}`);
        }
    }

    // Other segments
    if (combination.lightOutputs?.sku_code) parts.push(combination.lightOutputs.sku_code);
    if (combination.colorTemperatures?.sku_code) parts.push(combination.colorTemperatures.sku_code);
    if (combination.drivers?.sku_code) parts.push(combination.drivers.sku_code);
    if (combination.mountingOptions?.sku_code) parts.push(combination.mountingOptions.sku_code);
    if (combination.frameColors?.sku_code) parts.push(combination.frameColors.sku_code);
    if (combination.accessories?.sku_code) parts.push(combination.accessories.sku_code);

    return parts.filter(Boolean).join('-');
}

// Convert to CSV format
function arrayToCsv(data, headers) {
    const escape = (field) => {
        if (field === null || field === undefined) return '';
        const str = String(field);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    };

    const csvRows = [
        headers.join(','),
        ...data.map(row => headers.map(header => escape(row[header])).join(','))
    ];

    return csvRows.join('\n');
}

// Main function
async function generateAllDecoSKUs() {
    console.log('🚀 Starting Deco SKU generation...');
    const startTime = Date.now();

    try {
        // 1. Fetch all data
        const collections = await fetchAllCollections();
        
        console.log('📊 Collection counts:');
        Object.entries(collections).forEach(([name, items]) => {
            console.log(`  ${name}: ${items.length}`);
        });

        // 2. Find Deco product line
        const decoProductLine = collections.productLines.find(pl => 
            pl.sku_code === 'D' || pl.name?.toLowerCase().includes('deco')
        );

        if (!decoProductLine) {
            throw new Error('Deco product line not found!');
        }

        console.log(`✓ Found Deco product line: ${decoProductLine.name} (SKU: ${decoProductLine.sku_code})`);

        // 3. Prepare options (using all available options for now)
        const options = {
            mirrorStyles: collections.mirrorStyles,
            lightDirections: collections.lightDirections,
            frameColors: collections.frameColors,
            frameThicknesses: collections.frameThicknesses,
            sizes: collections.sizes.slice(0, 10), // Limit sizes to prevent explosion
            lightOutputs: collections.lightOutputs,
            colorTemperatures: collections.colorTemperatures,
            drivers: collections.drivers,
            mountingOptions: collections.mountingOptions,
            accessories: collections.accessories
        };

        console.log('🔧 Using options:');
        Object.entries(options).forEach(([name, items]) => {
            console.log(`  ${name}: ${items.length}`);
        });

        // 4. Generate combinations
        console.log('⚙️ Generating combinations...');
        const combinations = generateAllCombinations(options);
        console.log(`✓ Generated ${combinations.length.toLocaleString()} combinations`);

        // 5. Convert to SKUs
        console.log('🔨 Building SKUs...');
        const skuData = [];
        const uniqueSKUs = new Set();
        
        let processed = 0;
        for (const combination of combinations) {
            try {
                const sku = buildSKU(combination, decoProductLine);
                
                if (sku && sku.trim()) {
                    skuData.push({
                        sku: sku,
                        mirror_style: combination.mirrorStyles?.name || '',
                        light_direction: combination.lightDirections?.name || '',
                        frame_color: combination.frameColors?.name || '',
                        size: combination.sizes?.name || `${combination.sizes?.width}x${combination.sizes?.height}`,
                        light_output: combination.lightOutputs?.name || '',
                        color_temperature: combination.colorTemperatures?.name || '',
                        driver: combination.drivers?.name || '',
                        mounting: combination.mountingOptions?.name || '',
                        accessory: combination.accessories?.name || ''
                    });
                    uniqueSKUs.add(sku);
                }
            } catch (error) {
                // Skip failed combinations
            }
            
            processed++;
            if (processed % 10000 === 0) {
                console.log(`  Progress: ${processed.toLocaleString()} / ${combinations.length.toLocaleString()}`);
            }
        }

        const endTime = Date.now();
        console.log(`🎉 Generation complete!`);
        console.log(`  Total SKUs: ${skuData.length.toLocaleString()}`);
        console.log(`  Unique SKUs: ${uniqueSKUs.size.toLocaleString()}`);
        console.log(`  Duration: ${endTime - startTime}ms`);

        // 6. Save summary and sample to files (full dataset is too large for CSV)
        const summaryFilename = `deco-skus-summary-${new Date().toISOString().split('T')[0]}.txt`;
        const summaryContent = `
Deco SKU Generation Summary
==========================
Generated: ${new Date().toISOString()}
Total SKUs: ${skuData.length.toLocaleString()}
Unique SKUs: ${uniqueSKUs.size.toLocaleString()}
Duration: ${endTime - startTime}ms

Option Counts Used:
${Object.entries(options).map(([name, items]) => `  ${name}: ${items.length}`).join('\n')}

Sample SKUs (first 100):
${Array.from(uniqueSKUs).slice(0, 100).join('\n')}
`;
        
        fs.writeFileSync(summaryFilename, summaryContent);
        console.log(`📄 Saved summary to ${summaryFilename}`);

        // Save a reasonable sample to CSV (first 10,000 SKUs)
        const sampleData = skuData.slice(0, 10000);
        const csvHeaders = [
            'sku', 'mirror_style', 'light_direction', 'frame_color', 'size',
            'light_output', 'color_temperature', 'driver', 'mounting', 'accessory'
        ];
        
        const csvContent = arrayToCsv(sampleData, csvHeaders);
        const csvFilename = `deco-skus-sample-${new Date().toISOString().split('T')[0]}.csv`;
        
        fs.writeFileSync(csvFilename, csvContent);
        console.log(`📊 Saved sample of ${sampleData.length.toLocaleString()} SKUs to ${csvFilename}`);

        return {
            totalSKUs: skuData.length,
            uniqueSKUs: uniqueSKUs.size,
            filename: filename
        };

    } catch (error) {
        console.error('❌ Generation failed:', error);
        throw error;
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    generateAllDecoSKUs()
        .then(result => {
            console.log('\n✅ Success!', result);
            process.exit(0);
        })
        .catch(error => {
            console.error('\n❌ Failed:', error);
            process.exit(1);
        });
}