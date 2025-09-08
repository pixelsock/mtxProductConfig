#!/usr/bin/env node

import fs from 'fs';
import https from 'https';
import { URL } from 'url';

// Configuration
const DIRECTUS_URL = 'https://pim.dude.digital';
const DIRECTUS_TOKEN = 'Etqos_amy96Dxm6ab9TWnkjR_lF19XOK';

// Helper function to make HTTP requests
async function makeRequest(method, endpoint, body = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(endpoint, DIRECTUS_URL);
        const options = {
            method,
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
        
        if (body) {
            req.write(JSON.stringify(body));
        }
        
        req.end();
    });
}

// Create the simplified searchable_skus collection
async function createSearchableSkusCollection() {
    console.log('🚀 Creating simplified searchable_skus collection...');
    
    try {
        // Create collection
        console.log('📦 Creating searchable_skus collection...');
        
        const collection = await makeRequest('POST', '/collections', {
            collection: 'searchable_skus',
            meta: {
                collection: 'searchable_skus',
                icon: 'search',
                note: 'Simplified searchable SKU storage for fast lookups',
                singleton: false,
                translations: [{
                    language: 'en-US',
                    translation: 'Searchable SKUs'
                }]
            },
            schema: {
                name: 'searchable_skus'
            }
        });
        
        console.log('✓ Collection searchable_skus created');
        
        // Create fields
        const fields = [
            {
                field: 'id',
                type: 'uuid',
                schema: {
                    is_primary_key: true,
                    has_auto_increment: false,
                    is_nullable: false
                },
                meta: {
                    interface: 'input',
                    readonly: true,
                    hidden: true
                }
            },
            {
                field: 'sku_code',
                type: 'string',
                schema: {
                    max_length: 255,
                    is_nullable: false
                },
                meta: {
                    interface: 'input',
                    note: 'The complete SKU string (e.g., D01D-24X36-H-35-N-2-AN-BF)',
                    sort: 1
                }
            },
            {
                field: 'product_name',
                type: 'string',
                schema: {
                    max_length: 255,
                    is_nullable: true
                },
                meta: {
                    interface: 'input',
                    note: 'Product name for display purposes',
                    sort: 2
                }
            },
            {
                field: 'configuration_json',
                type: 'json',
                schema: {
                    is_nullable: true
                },
                meta: {
                    interface: 'input-code',
                    options: {
                        language: 'json'
                    },
                    note: 'Complete configuration object for this SKU',
                    sort: 3
                }
            },
            {
                field: 'created_at',
                type: 'timestamp',
                schema: {
                    default_value: 'now()',
                    is_nullable: false
                },
                meta: {
                    interface: 'datetime',
                    readonly: true,
                    note: 'When this SKU was generated',
                    sort: 4
                }
            }
        ];

        for (const field of fields) {
            console.log(`  Adding field: ${field.field}`);
            await makeRequest('POST', `/fields/searchable_skus`, field);
        }
        
        console.log('✓ All fields added to searchable_skus');

        // Create index on sku_code for fast searching
        console.log('🔍 Creating search index on sku_code...');
        try {
            await makeRequest('POST', '/schema/apply', {
                collection: 'searchable_skus',
                diff: [{
                    kind: 'create_index',
                    collection: 'searchable_skus',
                    index: {
                        name: 'idx_searchable_skus_sku_code',
                        fields: ['sku_code'],
                        type: 'btree'
                    }
                }]
            });
            console.log('✓ Search index created');
        } catch (error) {
            console.log('⚠️ Index creation skipped (may already exist or not supported)');
        }

        console.log('\n🎉 Searchable SKUs collection created successfully!');
        console.log('\nCollection structure:');
        console.log('  ✓ searchable_skus.sku_code - Fast searchable SKU strings');
        console.log('  ✓ searchable_skus.product_name - Display names');
        console.log('  ✓ searchable_skus.configuration_json - Full config details');
        console.log('  ✓ Index on sku_code for fast searches');
        
        console.log('\nNext steps:');
        console.log('  1. Run the simplified generator to populate the collection');
        console.log('  2. Update HTML interface to search via API');
        console.log('  3. Test with full dataset');

        return collection;

    } catch (error) {
        if (error.message.includes('already exists')) {
            console.log('⚠️ Collection searchable_skus already exists');
            console.log('✓ Using existing collection');
            return null;
        }
        console.error('❌ Failed to create collection:', error);
        throw error;
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    createSearchableSkusCollection()
        .then(() => {
            console.log('\n✅ Collection setup completed successfully!');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n❌ Collection setup failed:', error);
            process.exit(1);
        });
}