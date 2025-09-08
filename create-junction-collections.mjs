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

// Create a collection
async function createCollection(collectionName, fields) {
    console.log(`📦 Creating collection: ${collectionName}`);
    
    try {
        // Create collection
        const collection = await makeRequest('POST', '/collections', {
            collection: collectionName,
            meta: {
                collection: collectionName,
                icon: 'inventory_2',
                note: `Junction table for SKU generation - ${collectionName}`,
                singleton: false,
                translations: [{
                    language: 'en-US',
                    translation: collectionName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                }]
            },
            schema: {
                name: collectionName
            }
        });
        
        console.log(`✓ Collection ${collectionName} created`);
        
        // Create fields
        for (const field of fields) {
            console.log(`  Adding field: ${field.field}`);
            await makeRequest('POST', `/fields/${collectionName}`, field);
        }
        
        console.log(`✓ All fields added to ${collectionName}`);
        return collection;
    } catch (error) {
        if (error.message.includes('already exists')) {
            console.log(`⚠️ Collection ${collectionName} already exists, skipping...`);
            return null;
        }
        throw error;
    }
}

// Main function to create all junction collections
async function createJunctionCollections() {
    console.log('🚀 Creating Directus junction collections for SKU system...');
    
    try {
        // 1. Create sku_combinations collection
        await createCollection('sku_combinations', [
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
                field: 'product_id',
                type: 'integer',
                schema: {
                    is_nullable: false
                },
                meta: {
                    interface: 'select-dropdown-m2o',
                    display: 'related-values',
                    display_options: {
                        template: '{{name}}'
                    },
                    note: 'Foreign key to products table'
                }
            },
            {
                field: 'frame_color',
                type: 'integer',
                schema: {
                    is_nullable: true
                },
                meta: {
                    interface: 'select-dropdown-m2o',
                    display: 'related-values',
                    display_options: {
                        template: '{{name}}'
                    },
                    note: 'Foreign key to frame_colors table'
                }
            },
            {
                field: 'size',
                type: 'integer',
                schema: {
                    is_nullable: true
                },
                meta: {
                    interface: 'select-dropdown-m2o',
                    display: 'related-values',
                    display_options: {
                        template: '{{name}}'
                    },
                    note: 'Foreign key to sizes table'
                }
            },
            {
                field: 'light_output',
                type: 'integer',
                schema: {
                    is_nullable: true
                },
                meta: {
                    interface: 'select-dropdown-m2o',
                    display: 'related-values',
                    display_options: {
                        template: '{{name}}'
                    },
                    note: 'Foreign key to light_outputs table'
                }
            },
            {
                field: 'color_temperature',
                type: 'integer',
                schema: {
                    is_nullable: true
                },
                meta: {
                    interface: 'select-dropdown-m2o',
                    display: 'related-values',
                    display_options: {
                        template: '{{name}}'
                    },
                    note: 'Foreign key to color_temperatures table'
                }
            },
            {
                field: 'driver',
                type: 'integer',
                schema: {
                    is_nullable: true
                },
                meta: {
                    interface: 'select-dropdown-m2o',
                    display: 'related-values',
                    display_options: {
                        template: '{{name}}'
                    },
                    note: 'Foreign key to drivers table'
                }
            },
            {
                field: 'mounting_option',
                type: 'integer',
                schema: {
                    is_nullable: true
                },
                meta: {
                    interface: 'select-dropdown-m2o',
                    display: 'related-values',
                    display_options: {
                        template: '{{name}}'
                    },
                    note: 'Foreign key to mounting_options table'
                }
            },
            {
                field: 'accessory_combination',
                type: 'json',
                schema: {
                    is_nullable: true
                },
                meta: {
                    interface: 'input-code',
                    options: {
                        language: 'json'
                    },
                    note: 'Array of accessory IDs for multi-select accessories'
                }
            },
            {
                field: 'is_valid',
                type: 'boolean',
                schema: {
                    default_value: true,
                    is_nullable: false
                },
                meta: {
                    interface: 'boolean',
                    note: 'Whether this combination passed business rules validation'
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
                    note: 'When this combination was generated'
                }
            }
        ]);

        // 2. Create sku_strings collection
        await createCollection('sku_strings', [
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
                field: 'combination_id',
                type: 'uuid',
                schema: {
                    is_nullable: false
                },
                meta: {
                    interface: 'select-dropdown-m2o',
                    display: 'related-values',
                    note: 'Foreign key to sku_combinations table'
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
                    note: 'The complete SKU string (e.g., D01D-24X36-H-35-N-2-AN-BF)'
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
                    note: 'Product name for display purposes'
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
                    note: 'When this SKU was generated'
                }
            }
        ]);

        // 3. Create sku_generation_batches collection
        await createCollection('sku_generation_batches', [
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
                field: 'started_at',
                type: 'timestamp',
                schema: {
                    default_value: 'now()',
                    is_nullable: false
                },
                meta: {
                    interface: 'datetime',
                    readonly: true,
                    note: 'When generation started'
                }
            },
            {
                field: 'completed_at',
                type: 'timestamp',
                schema: {
                    is_nullable: true
                },
                meta: {
                    interface: 'datetime',
                    readonly: true,
                    note: 'When generation completed'
                }
            },
            {
                field: 'total_combinations',
                type: 'integer',
                schema: {
                    default_value: 0,
                    is_nullable: false
                },
                meta: {
                    interface: 'input',
                    readonly: true,
                    note: 'Total combinations processed'
                }
            },
            {
                field: 'valid_combinations',
                type: 'integer',
                schema: {
                    default_value: 0,
                    is_nullable: false
                },
                meta: {
                    interface: 'input',
                    readonly: true,
                    note: 'Combinations that passed validation'
                }
            },
            {
                field: 'products_processed',
                type: 'integer',
                schema: {
                    default_value: 0,
                    is_nullable: false
                },
                meta: {
                    interface: 'input',
                    readonly: true,
                    note: 'Number of products processed'
                }
            },
            {
                field: 'status',
                type: 'string',
                schema: {
                    max_length: 50,
                    default_value: 'running',
                    is_nullable: false
                },
                meta: {
                    interface: 'select-dropdown',
                    options: {
                        choices: [
                            { text: 'Running', value: 'running' },
                            { text: 'Completed', value: 'completed' },
                            { text: 'Failed', value: 'failed' }
                        ]
                    },
                    note: 'Current status of the generation batch'
                }
            }
        ]);

        console.log('\n🎉 All junction collections created successfully!');
        console.log('\nCollections created:');
        console.log('  ✓ sku_combinations - Stores valid configuration combinations');
        console.log('  ✓ sku_strings - Pre-computed SKU strings with searchable codes');
        console.log('  ✓ sku_generation_batches - Tracks generation runs');
        
        console.log('\nNext steps:');
        console.log('  1. Create the junction table generator script');
        console.log('  2. Update HTML interface to use API calls');
        console.log('  3. Test with the full dataset');

    } catch (error) {
        console.error('❌ Failed to create collections:', error);
        throw error;
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    createJunctionCollections()
        .then(() => {
            console.log('\n✅ Collection creation completed successfully!');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n❌ Collection creation failed:', error);
            process.exit(1);
        });
}