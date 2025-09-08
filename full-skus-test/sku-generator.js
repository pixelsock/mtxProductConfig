/**
 * SKU Generator for Directus
 * Generates all possible SKU combinations based on product lines, products, rules, and SKU code order
 */

class SKUGenerator {
  constructor(directusClient) {
    this.directus = directusClient;
    this.skuOrder = [];
    this.rules = [];
  }

  /**
   * Initialize the generator by loading SKU order and rules
   */
  async initialize() {
    // Load SKU code order
    const skuOrderResponse = await this.directus.items('sku_code_order').readByQuery({
      sort: ['order'],
      fields: ['sku_code_item', 'order']
    });
    this.skuOrder = skuOrderResponse.data;

    // Load all rules
    const rulesResponse = await this.directus.items('rules').readByQuery({
      fields: ['*']
    });
    this.rules = rulesResponse.data;

    console.log('SKU Generator initialized with', this.skuOrder.length, 'order items and', this.rules.length, 'rules');
  }

  /**
   * Get all available options for a product line
   */
  async getProductLineOptions(productLineId) {
    const productLine = await this.directus.items('product_lines').readOne(productLineId, {
      fields: ['*', 'default_options.*']
    });

    if (!productLine) {
      throw new Error(`Product line ${productLineId} not found`);
    }

    // Group default options by collection
    const optionsByCollection = {};
    if (productLine.default_options) {
      for (const option of productLine.default_options) {
        if (!optionsByCollection[option.collection]) {
          optionsByCollection[option.collection] = [];
        }
        optionsByCollection[option.collection].push(option.item);
      }
    }

    return {
      productLine,
      optionsByCollection
    };
  }

  /**
   * Get product-specific option overrides
   */
  async getProductOverrides(productId) {
    const overrides = await this.directus.items('products_options_overrides').readByQuery({
      filter: { products_id: { _eq: productId } },
      fields: ['collection', 'item']
    });

    // Group overrides by collection
    const overridesByCollection = {};
    if (overrides.data) {
      for (const override of overrides.data) {
        if (!overridesByCollection[override.collection]) {
          overridesByCollection[override.collection] = [];
        }
        overridesByCollection[override.collection].push(override.item);
      }
    }

    return overridesByCollection;
  }

  /**
   * Resolve final options for a product (product line defaults + overrides)
   */
  async resolveProductOptions(productId) {
    // Get the product to find its product line
    const product = await this.directus.items('products').readOne(productId, {
      fields: ['*', 'product_line']
    });

    if (!product) {
      throw new Error(`Product ${productId} not found`);
    }

    // Get product line default options
    const { productLine, optionsByCollection } = await this.getProductLineOptions(product.product_line);

    // Get product-specific overrides
    const overrides = await this.getProductOverrides(productId);

    // Apply overrides (completely replace default options for that collection)
    const finalOptions = { ...optionsByCollection };
    for (const [collection, items] of Object.entries(overrides)) {
      finalOptions[collection] = items; // Complete replacement
    }

    return {
      product,
      productLine,
      finalOptions
    };
  }

  /**
   * Get actual option data for items in a collection
   */
  async getOptionData(collection, itemIds) {
    if (!itemIds || itemIds.length === 0) return [];

    const response = await this.directus.items(collection).readByQuery({
      filter: { id: { _in: itemIds } },
      fields: ['id', 'name', 'sku_code', 'active']
    });

    return response.data || [];
  }

  /**
   * Generate all possible SKU combinations for a product
   */
  async generateSKUsForProduct(productId) {
    const { product, productLine, finalOptions } = await this.resolveProductOptions(productId);

    // Get actual option data for each collection
    const optionData = {};
    for (const [collection, itemIds] of Object.entries(finalOptions)) {
      optionData[collection] = await this.getOptionData(collection, itemIds);
      // Filter out inactive options
      optionData[collection] = optionData[collection].filter(item => item.active !== false);
    }

    // Add the product itself to the options
    optionData.products = [product];

    // Generate all combinations
    const combinations = this.generateCombinations(optionData);

    // Apply rules to filter/modify combinations
    const validCombinations = this.applyRules(combinations);

    // Generate SKU codes based on order
    const skus = this.generateSKUCodes(validCombinations);

    return {
      product,
      productLine,
      totalCombinations: combinations.length,
      validCombinations: validCombinations.length,
      skus
    };
  }

  /**
   * Generate all possible combinations from option data
   */
  generateCombinations(optionData) {
    const collections = Object.keys(optionData);
    const combinations = [];

    function generateRecursive(currentCombination, collectionIndex) {
      if (collectionIndex >= collections.length) {
        combinations.push({ ...currentCombination });
        return;
      }

      const collection = collections[collectionIndex];
      const options = optionData[collection];

      if (!options || options.length === 0) {
        // Skip this collection if no options
        generateRecursive(currentCombination, collectionIndex + 1);
        return;
      }

      for (const option of options) {
        currentCombination[collection] = option;
        generateRecursive(currentCombination, collectionIndex + 1);
      }
    }

    generateRecursive({}, 0);
    return combinations;
  }

  /**
   * Apply rules to filter and modify combinations
   */
  applyRules(combinations) {
    let validCombinations = [...combinations];

    for (const rule of this.rules) {
      validCombinations = validCombinations.filter(combination => {
        return this.evaluateRule(rule, combination);
      });
    }

    return validCombinations;
  }

  /**
   * Evaluate a single rule against a combination
   */
  evaluateRule(rule, combination) {
    // This is a simplified rule evaluation
    // In a full implementation, you'd need to parse the complex if_this/then_that JSON structures
    
    // For now, just return true to allow all combinations
    // TODO: Implement full rule evaluation logic
    return true;
  }

  /**
   * Generate SKU codes based on the defined order
   */
  generateSKUCodes(combinations) {
    return combinations.map(combination => {
      const skuParts = [];

      // Build SKU according to the defined order
      for (const orderItem of this.skuOrder) {
        const collection = orderItem.sku_code_item;
        const option = combination[collection];

        if (option && option.sku_code) {
          skuParts.push(option.sku_code);
        }
      }

      return {
        sku: skuParts.join('-'),
        combination,
        parts: skuParts
      };
    });
  }

  /**
   * Generate SKUs for all products in a product line
   */
  async generateSKUsForProductLine(productLineId) {
    // Get all products in the product line
    const productsResponse = await this.directus.items('products').readByQuery({
      filter: { 
        product_line: { _eq: productLineId },
        active: { _eq: true }
      },
      fields: ['id', 'name', 'sku_code']
    });

    const results = [];
    for (const product of productsResponse.data) {
      try {
        const productSKUs = await this.generateSKUsForProduct(product.id);
        results.push(productSKUs);
      } catch (error) {
        console.error(`Error generating SKUs for product ${product.id}:`, error);
        results.push({
          product,
          error: error.message,
          skus: []
        });
      }
    }

    return results;
  }
}

export default SKUGenerator;
