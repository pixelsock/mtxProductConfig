/**
 * Directus Custom Endpoint for SKU Generation
 * 
 * This file should be placed in your Directus extensions/endpoints directory
 * Example: extensions/endpoints/generate-skus/index.js
 */

import SKUGenerator from './sku-generator.js';

export default {
  id: 'generate-skus',
  handler: (router, { services, database, getSchema }) => {
    
    // Create a mock Directus client that uses the actual services
    class DirectusServiceClient {
      constructor(services, database, schema) {
        this.services = services;
        this.database = database;
        this.schema = schema;
      }

      items(collection) {
        return {
          readByQuery: async (query) => {
            const service = new this.services.ItemsService(collection, {
              database: this.database,
              schema: this.schema
            });
            return await service.readByQuery(query);
          },
          readOne: async (id, options) => {
            const service = new this.services.ItemsService(collection, {
              database: this.database,
              schema: this.schema
            });
            return await service.readOne(id, options);
          }
        };
      }
    }

    // GET /generate-skus?product_id=123
    // GET /generate-skus?product_line_id=456
    router.get('/', async (req, res) => {
      try {
        const { product_id, product_line_id, format = 'json' } = req.query;
        const schema = await getSchema();
        
        // Create service client
        const directusClient = new DirectusServiceClient(services, database, schema);
        const generator = new SKUGenerator(directusClient);
        await generator.initialize();

        let result;

        if (product_id) {
          // Generate SKUs for a specific product
          result = await generator.generateSKUsForProduct(parseInt(product_id));
        } else if (product_line_id) {
          // Generate SKUs for all products in a product line
          result = await generator.generateSKUsForProductLine(parseInt(product_line_id));
        } else {
          return res.status(400).json({
            error: 'Please provide either product_id or product_line_id parameter',
            usage: {
              single_product: '/generate-skus?product_id=123',
              product_line: '/generate-skus?product_line_id=456'
            }
          });
        }

        // Format response based on request
        if (format === 'csv' && result.skus) {
          // Return CSV format for single product
          const csvHeader = 'SKU,Product,Product Line,Size,Mounting,Hanging Technique\n';
          const csvRows = result.skus.map(sku => {
            const combo = sku.combination;
            return [
              sku.sku,
              combo.products?.name || '',
              result.productLine?.name || '',
              combo.sizes?.name || '',
              combo.mounting_options?.name || '',
              combo.hanging_techniques?.name || ''
            ].join(',');
          }).join('\n');
          
          res.setHeader('Content-Type', 'text/csv');
          res.setHeader('Content-Disposition', `attachment; filename="skus-${product_id || product_line_id}.csv"`);
          return res.send(csvHeader + csvRows);
        }

        // Default JSON response
        res.json({
          success: true,
          data: result,
          metadata: {
            generated_at: new Date().toISOString(),
            total_skus: Array.isArray(result) 
              ? result.reduce((sum, item) => sum + (item.skus?.length || 0), 0)
              : result.skus?.length || 0,
            query_params: { product_id, product_line_id, format }
          }
        });

      } catch (error) {
        console.error('SKU Generation endpoint error:', error);
        res.status(500).json({
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    });

    // POST /generate-skus (for bulk operations)
    router.post('/', async (req, res) => {
      try {
        const { product_ids = [], product_line_ids = [] } = req.body;
        const schema = await getSchema();
        
        if (product_ids.length === 0 && product_line_ids.length === 0) {
          return res.status(400).json({
            error: 'Please provide product_ids or product_line_ids in request body',
            example: {
              product_ids: [123, 456],
              product_line_ids: [789]
            }
          });
        }

        const directusClient = new DirectusServiceClient(services, database, schema);
        const generator = new SKUGenerator(directusClient);
        await generator.initialize();

        const results = [];

        // Process individual products
        for (const productId of product_ids) {
          try {
            const result = await generator.generateSKUsForProduct(productId);
            results.push({ type: 'product', id: productId, ...result });
          } catch (error) {
            results.push({ 
              type: 'product', 
              id: productId, 
              error: error.message,
              skus: []
            });
          }
        }

        // Process product lines
        for (const productLineId of product_line_ids) {
          try {
            const result = await generator.generateSKUsForProductLine(productLineId);
            results.push({ type: 'product_line', id: productLineId, products: result });
          } catch (error) {
            results.push({ 
              type: 'product_line', 
              id: productLineId, 
              error: error.message,
              products: []
            });
          }
        }

        const totalSKUs = results.reduce((sum, result) => {
          if (result.type === 'product') {
            return sum + (result.skus?.length || 0);
          } else {
            return sum + (result.products?.reduce((pSum, p) => pSum + (p.skus?.length || 0), 0) || 0);
          }
        }, 0);

        res.json({
          success: true,
          data: results,
          metadata: {
            generated_at: new Date().toISOString(),
            total_results: results.length,
            total_skus: totalSKUs,
            processed: {
              products: product_ids.length,
              product_lines: product_line_ids.length
            }
          }
        });

      } catch (error) {
        console.error('Bulk SKU Generation endpoint error:', error);
        res.status(500).json({
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    });
  }
};
