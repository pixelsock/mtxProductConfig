// Browser-Compatible API Validation Agent for Directus Data Integrity
// This version uses fetch instead of curl for browser compatibility

// Environment configuration
const DIRECTUS_URL = import.meta.env.VITE_DIRECTUS_URL || 'https://pim.dude.digital';
const API_KEY = import.meta.env.VITE_DIRECTUS_API_KEY || 'SatmtC2cTo-k-V17usWeYpBcc6hbtXjC';

export interface ValidationResult {
  success: boolean;
  message: string;
  data?: any;
  errors?: string[];
}

export interface RuleValidationResult extends ValidationResult {
  ruleId?: string;
  ruleName?: string;
  conditionValid?: boolean;
  actionValid?: boolean;
}

export class BrowserAPIValidator {
  private baseHeaders: HeadersInit;

  constructor() {
    this.baseHeaders = {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Execute a fetch request and return parsed JSON result
   */
  private async executeFetch(url: string, options: RequestInit = {}): Promise<any> {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.baseHeaders,
          ...options.headers
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Fetch execution failed:', error);
      throw error;
    }
  }

  /**
   * Validate a specific collection exists and has expected structure
   */
  async validateCollection(collectionName: string, expectedFields?: string[]): Promise<ValidationResult> {
    try {
      const url = `${DIRECTUS_URL}/items/${collectionName}?limit=1`;
      const response = await this.executeFetch(url);

      if (response.error) {
        return {
          success: false,
          message: `Collection ${collectionName} validation failed`,
          errors: [response.error.message || 'Unknown error']
        };
      }

      const items = response.data || [];
      if (items.length === 0) {
        return {
          success: false,
          message: `Collection ${collectionName} is empty`,
          errors: ['No items found in collection']
        };
      }

      // Validate expected fields if provided
      if (expectedFields && items.length > 0) {
        const firstItem = items[0];
        const missingFields = expectedFields.filter(field => !(field in firstItem));
        
        if (missingFields.length > 0) {
          return {
            success: false,
            message: `Collection ${collectionName} missing required fields`,
            errors: [`Missing fields: ${missingFields.join(', ')}`]
          };
        }
      }

      return {
        success: true,
        message: `Collection ${collectionName} validation passed`,
        data: { itemCount: items.length, sampleItem: items[0] }
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to validate collection ${collectionName}`,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Validate specific item exists by ID
   */
  async validateItemExists(collectionName: string, itemId: number | string): Promise<ValidationResult> {
    try {
      const url = `${DIRECTUS_URL}/items/${collectionName}/${itemId}`;
      const response = await this.executeFetch(url);

      if (response.error) {
        return {
          success: false,
          message: `Item ${itemId} not found in ${collectionName}`,
          errors: [response.error.message || 'Item not found']
        };
      }

      return {
        success: true,
        message: `Item ${itemId} exists in ${collectionName}`,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to validate item ${itemId} in ${collectionName}`,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Validate rules configuration and structure
   */
  async validateRules(): Promise<RuleValidationResult[]> {
    try {
      const url = `${DIRECTUS_URL}/items/rules`;
      const response = await this.executeFetch(url);

      if (response.error) {
        return [{
          success: false,
          message: 'Failed to fetch rules',
          errors: [response.error.message || 'Unknown error']
        }];
      }

      const rules = response.data || [];
      const results: RuleValidationResult[] = [];

      for (const rule of rules) {
        const result = await this.validateSingleRule(rule);
        results.push(result);
      }

      return results;
    } catch (error) {
      return [{
        success: false,
        message: 'Failed to validate rules',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      }];
    }
  }

  /**
   * Validate a single rule's structure and referenced IDs
   */
  private async validateSingleRule(rule: any): Promise<RuleValidationResult> {
    const result: RuleValidationResult = {
      success: true,
      message: `Rule "${rule.name}" validation passed`,
      ruleId: rule.id,
      ruleName: rule.name,
      conditionValid: true,
      actionValid: true,
      errors: []
    };

    // Validate rule structure
    if (!rule.if_this || !rule.than_that) {
      result.success = false;
      result.errors?.push('Rule missing if_this or than_that');
      return result;
    }

    // Validate condition references
    try {
      const conditionValidation = await this.validateRuleConditions(rule.if_this);
      if (!conditionValidation.success) {
        result.conditionValid = false;
        result.errors?.push(...(conditionValidation.errors || []));
      }
    } catch (error) {
      result.conditionValid = false;
      result.errors?.push(`Condition validation failed: ${error}`);
    }

    // Validate action structure
    try {
      const actionValidation = await this.validateRuleActions(rule.than_that);
      if (!actionValidation.success) {
        result.actionValid = false;
        result.errors?.push(...(actionValidation.errors || []));
      }
    } catch (error) {
      result.actionValid = false;
      result.errors?.push(`Action validation failed: ${error}`);
    }

    if (result.errors && result.errors.length > 0) {
      result.success = false;
      result.message = `Rule "${rule.name}" validation failed`;
    }

    return result;
  }

  /**
   * Validate rule conditions reference valid items
   */
  private async validateRuleConditions(conditions: any): Promise<ValidationResult> {
    const errors: string[] = [];

    // Recursively check for item ID references
    const checkConditions = async (obj: any, path: string = '') => {
      if (typeof obj !== 'object' || obj === null) return;

      for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key;

        if (key === '_eq' && typeof value === 'number') {
          // This might be an item ID reference
          const parentKey = path.split('.').pop();
          if (parentKey && this.isCollectionField(parentKey)) {
            const collectionName = this.getCollectionFromField(parentKey);
            if (collectionName) {
              const itemValidation = await this.validateItemExists(collectionName, value);
              if (!itemValidation.success) {
                errors.push(`Invalid ${parentKey} ID: ${value}`);
              }
            }
          }
        } else if (typeof value === 'object') {
          await checkConditions(value, currentPath);
        }
      }
    };

    await checkConditions(conditions);

    return {
      success: errors.length === 0,
      message: errors.length === 0 ? 'Rule conditions valid' : 'Rule conditions have errors',
      errors: errors.length > 0 ? errors : undefined
    };
  }

  /**
   * Validate rule actions structure
   */
  private async validateRuleActions(actions: any): Promise<ValidationResult> {
    const errors: string[] = [];

    // Check for common action patterns
    if (actions.product_line?.sku_code?._eq) {
      // SKU override action - validate it's a string
      if (typeof actions.product_line.sku_code._eq !== 'string') {
        errors.push('SKU override must be a string');
      }
    }

    if (actions.light_output?._eq) {
      // Light output override - validate item exists
      const itemValidation = await this.validateItemExists('light_outputs', actions.light_output._eq);
      if (!itemValidation.success) {
        errors.push(`Invalid light_output ID: ${actions.light_output._eq}`);
      }
    }

    return {
      success: errors.length === 0,
      message: errors.length === 0 ? 'Rule actions valid' : 'Rule actions have errors',
      errors: errors.length > 0 ? errors : undefined
    };
  }

  /**
   * Check if a field name corresponds to a collection reference
   */
  private isCollectionField(fieldName: string): boolean {
    const collectionFields = [
      'product_line', 'frame_thickness', 'mirror_style', 'light_direction',
      'frame_color', 'mirror_control', 'mounting_option', 'color_temperature',
      'light_output', 'driver', 'accessory'
    ];
    return collectionFields.includes(fieldName);
  }

  /**
   * Get collection name from field name
   */
  private getCollectionFromField(fieldName: string): string | null {
    const fieldToCollection: Record<string, string> = {
      'product_line': 'product_lines',
      'frame_thickness': 'frame_thicknesses',
      'mirror_style': 'mirror_styles',
      'light_direction': 'light_directions',
      'frame_color': 'frame_colors',
      'mounting_option': 'mounting_options',
      'color_temperature': 'color_temperatures',
      'light_output': 'light_outputs',
      'driver': 'drivers',
      'accessory': 'accessories'
    };
    return fieldToCollection[fieldName] || null;
  }

  /**
   * Validate product line default options configuration
   */
  async validateProductLineDefaults(productLineId: number): Promise<ValidationResult> {
    try {
      // Check if product line exists
      const productLineValidation = await this.validateItemExists('product_lines', productLineId);
      if (!productLineValidation.success) {
        return productLineValidation;
      }

      // Check default options junction table
      const url = `${DIRECTUS_URL}/items/product_lines_default_options?filter[product_lines_id][_eq]=${productLineId}`;
      const response = await this.executeFetch(url);

      if (response.error) {
        return {
          success: false,
          message: `Failed to fetch default options for product line ${productLineId}`,
          errors: [response.error.message || 'Unknown error']
        };
      }

      const defaultOptions = response.data || [];
      if (defaultOptions.length === 0) {
        return {
          success: false,
          message: `No default options configured for product line ${productLineId}`,
          errors: ['Default options must be configured in Directus']
        };
      }

      // Validate that referenced items exist
      const errors: string[] = [];
      for (const option of defaultOptions) {
        if (option.collection && option.item) {
          const itemValidation = await this.validateItemExists(option.collection, option.item);
          if (!itemValidation.success) {
            errors.push(`Invalid ${option.collection} item: ${option.item}`);
          }
        }
      }

      return {
        success: errors.length === 0,
        message: errors.length === 0 
          ? `Product line ${productLineId} default options valid` 
          : `Product line ${productLineId} has invalid default options`,
        data: { optionCount: defaultOptions.length, options: defaultOptions },
        errors: errors.length > 0 ? errors : undefined
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to validate product line ${productLineId} defaults`,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Validate product matching for a given SKU
   */
  async validateProductMatching(sku: string): Promise<ValidationResult> {
    try {
      const url = `${DIRECTUS_URL}/items/products?filter[name][_eq]=${sku}`;
      const response = await this.executeFetch(url);

      if (response.error) {
        return {
          success: false,
          message: `Failed to search for product with SKU ${sku}`,
          errors: [response.error.message || 'Unknown error']
        };
      }

      const products = response.data || [];
      if (products.length === 0) {
        // Try partial matching
        const partialUrl = `${DIRECTUS_URL}/items/products?filter[name][_contains]=${sku}`;
        const partialResponse = await this.executeFetch(partialUrl);
        const partialProducts = partialResponse.data || [];

        return {
          success: false,
          message: `No exact match found for SKU ${sku}`,
          data: { 
            exactMatches: 0, 
            partialMatches: partialProducts.length,
            partialProducts: partialProducts.slice(0, 5) // Show first 5 partial matches
          },
          errors: [`SKU ${sku} not found in products collection`]
        };
      }

      return {
        success: true,
        message: `Product found for SKU ${sku}`,
        data: { 
          exactMatches: products.length, 
          product: products[0],
          hasVerticalImage: !!products[0].vertical_image,
          hasHorizontalImage: !!products[0].horizontal_image
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to validate product matching for SKU ${sku}`,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Debug specific issues from console logs
   */
  async debugCurrentIssues(): Promise<{
    invalidMirrorStyles: ValidationResult[];
    invalidDrivers: ValidationResult[];
    productMatching: ValidationResult;
    decoDefaults: ValidationResult;
    rulesEvaluation: RuleValidationResult[];
  }> {
    console.log('🔍 Debugging current issues from console logs...');

    // Check the specific problematic items mentioned in console logs
    const invalidMirrorStyles = await Promise.all([
      this.validateItemExists('mirror_styles', 29),
      this.validateItemExists('mirror_styles', 30),
      this.validateItemExists('mirror_styles', 31)
    ]);

    const invalidDrivers = await Promise.all([
      this.validateItemExists('drivers', 4),
      this.validateItemExists('drivers', 5)
    ]);

    // Check the SKU that's failing to match
    const productMatching = await this.validateProductMatching('D01D');

    // Check Deco product line defaults (ID 19 from logs)
    const decoDefaults = await this.validateProductLineDefaults(19);

    // Check rules evaluation
    const rulesEvaluation = await this.validateRules();

    return {
      invalidMirrorStyles,
      invalidDrivers,
      productMatching,
      decoDefaults,
      rulesEvaluation
    };
  }

  /**
   * Run comprehensive validation suite
   */
  async runFullValidation(): Promise<{
    collections: ValidationResult[];
    rules: RuleValidationResult[];
    productLines: ValidationResult[];
    debugResults: any;
    summary: {
      totalTests: number;
      passed: number;
      failed: number;
      criticalIssues: string[];
    };
  }> {
    console.log('🔍 Running comprehensive API validation...');

    // Validate core collections
    const collections = await Promise.all([
      this.validateCollection('product_lines', ['id', 'name', 'sku_code']),
      this.validateCollection('rules', ['id', 'name', 'if_this', 'than_that']),
      this.validateCollection('mirror_styles', ['id', 'name', 'sku_code', 'active']),
      this.validateCollection('drivers', ['id', 'name', 'sku_code', 'active']),
      this.validateCollection('products', ['id', 'name']),
      this.validateCollection('frame_colors', ['id', 'name', 'hex_code']),
      this.validateCollection('mounting_options', ['id', 'name', 'sku_code'])
    ]);

    // Validate rules
    const rules = await this.validateRules();

    // Validate product line defaults (focusing on Deco - ID 19)
    const productLines = await Promise.all([
      this.validateProductLineDefaults(19), // Deco
      this.validateProductMatching('D01D'), // Test SKU from console logs
    ]);

    // Debug current specific issues
    const debugResults = await this.debugCurrentIssues();

    // Calculate summary
    const allResults = [
      ...collections, 
      ...rules, 
      ...productLines,
      ...debugResults.invalidMirrorStyles,
      ...debugResults.invalidDrivers,
      debugResults.productMatching,
      debugResults.decoDefaults
    ];
    
    const totalTests = allResults.length;
    const passed = allResults.filter(r => r.success).length;
    const failed = totalTests - passed;

    const criticalIssues: string[] = [];
    allResults.forEach(result => {
      if (!result.success && result.errors) {
        criticalIssues.push(...result.errors);
      }
    });

    console.log(`✅ Validation complete: ${passed}/${totalTests} tests passed`);
    if (criticalIssues.length > 0) {
      console.log(`❌ Critical issues found: ${criticalIssues.length}`);
      console.log('Top issues:', criticalIssues.slice(0, 5));
    }

    return {
      collections,
      rules,
      productLines,
      debugResults,
      summary: {
        totalTests,
        passed,
        failed,
        criticalIssues: criticalIssues.slice(0, 10) // Limit to first 10 issues
      }
    };
  }

  /**
   * Debug product matching issues by searching for specific SKUs
   */
  async debugProductMatching(testSKUs: string[] = ['W04D', 'D01D', 'T01D']): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];
    
    for (const sku of testSKUs) {
      try {
        // Test exact match
        const exactUrl = `${DIRECTUS_URL}/items/products?filter[name][_eq]=${sku}`;
        const exactResponse = await this.executeFetch(exactUrl);
        const exactProducts = exactResponse.data || [];
        
        // Test case-insensitive match
        const caseUrl = `${DIRECTUS_URL}/items/products?filter[name][_icontains]=${sku}`;
        const caseResponse = await this.executeFetch(caseUrl);
        const caseProducts = caseResponse.data || [];
        
        // Test partial match
        const partialUrl = `${DIRECTUS_URL}/items/products?filter[name][_contains]=${sku}`;
        const partialResponse = await this.executeFetch(partialUrl);
        const partialProducts = partialResponse.data || [];
        
        // Test with variations
        const variations = [sku, sku.toLowerCase(), sku.toUpperCase()];
        let variationMatches = 0;
        for (const variation of variations) {
          const varUrl = `${DIRECTUS_URL}/items/products?filter[name][_eq]=${variation}`;
          const varResponse = await this.executeFetch(varUrl);
          if (varResponse.data && varResponse.data.length > 0) {
            variationMatches += varResponse.data.length;
          }
        }
        
        results.push({
          success: exactProducts.length > 0 || caseProducts.length > 0 || partialProducts.length > 0,
          message: `SKU ${sku}: ${exactProducts.length} exact, ${caseProducts.length} case-insensitive, ${partialProducts.length} partial, ${variationMatches} variation matches`,
          data: {
            sku,
            exactMatches: exactProducts.length,
            caseMatches: caseProducts.length,
            partialMatches: partialProducts.length,
            variationMatches,
            exactProducts: exactProducts.slice(0, 3),
            caseProducts: caseProducts.slice(0, 3),
            partialProducts: partialProducts.slice(0, 3)
          }
        });
        
      } catch (error) {
        results.push({
          success: false,
          message: `Failed to test SKU ${sku}`,
          errors: [error instanceof Error ? error.message : 'Unknown error']
        });
      }
    }
    
    return results;
  }

  /**
   * Get sample of all products to understand naming patterns
   */
  async debugProductNaming(): Promise<ValidationResult> {
    try {
      const url = `${DIRECTUS_URL}/items/products?limit=20&fields=id,name,product_line,mirror_style,light_direction`;
      const response = await this.executeFetch(url);
      
      if (response.error) {
        return {
          success: false,
          message: 'Failed to fetch product samples',
          errors: [response.error.message || 'Unknown error']
        };
      }
      
      const products = response.data || [];
      
      // Analyze naming patterns
      const namingPatterns = {
        startsWithW: products.filter((p: any) => p.name?.startsWith('W')),
        startsWithD: products.filter((p: any) => p.name?.startsWith('D')),
        startsWithT: products.filter((p: any) => p.name?.startsWith('T')),
        containsNumbers: products.filter((p: any) => /\d/.test(p.name || '')),
        endsWithD: products.filter((p: any) => p.name?.endsWith('D')),
        fourCharacters: products.filter((p: any) => p.name?.length === 4)
      };
      
      return {
        success: true,
        message: `Analyzed ${products.length} product naming patterns`,
        data: {
          totalProducts: products.length,
          sampleProducts: products.slice(0, 10),
          namingPatterns: {
            startsWithW: namingPatterns.startsWithW.length,
            startsWithD: namingPatterns.startsWithD.length,
            startsWithT: namingPatterns.startsWithT.length,
            containsNumbers: namingPatterns.containsNumbers.length,
            endsWithD: namingPatterns.endsWithD.length,
            fourCharacters: namingPatterns.fourCharacters.length
          },
          examples: {
            wProducts: namingPatterns.startsWithW.slice(0, 5).map((p: any) => p.name),
            dProducts: namingPatterns.startsWithD.slice(0, 5).map((p: any) => p.name),
            tProducts: namingPatterns.startsWithT.slice(0, 5).map((p: any) => p.name)
          }
        }
      };
      
    } catch (error) {
      return {
        success: false,
        message: 'Failed to debug product naming',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Generate curl commands for manual testing
   */
  generateCurlCommands(): string[] {
    const commands = [
      // Test basic collections
      `curl -H "Authorization: Bearer ${API_KEY}" "${DIRECTUS_URL}/items/product_lines?limit=5"`,
      `curl -H "Authorization: Bearer ${API_KEY}" "${DIRECTUS_URL}/items/rules"`,
      
      // Test problematic items
      `curl -H "Authorization: Bearer ${API_KEY}" "${DIRECTUS_URL}/items/mirror_styles/29"`,
      `curl -H "Authorization: Bearer ${API_KEY}" "${DIRECTUS_URL}/items/mirror_styles/30"`,
      `curl -H "Authorization: Bearer ${API_KEY}" "${DIRECTUS_URL}/items/mirror_styles/31"`,
      `curl -H "Authorization: Bearer ${API_KEY}" "${DIRECTUS_URL}/items/drivers/4"`,
      `curl -H "Authorization: Bearer ${API_KEY}" "${DIRECTUS_URL}/items/drivers/5"`,
      
      // Test product matching with various approaches
      `curl -H "Authorization: Bearer ${API_KEY}" "${DIRECTUS_URL}/items/products?filter[name][_eq]=W04D"`,
      `curl -H "Authorization: Bearer ${API_KEY}" "${DIRECTUS_URL}/items/products?filter[name][_icontains]=W04D"`,
      `curl -H "Authorization: Bearer ${API_KEY}" "${DIRECTUS_URL}/items/products?filter[name][_contains]=W04"`,
      `curl -H "Authorization: Bearer ${API_KEY}" "${DIRECTUS_URL}/items/products?limit=20&fields=id,name"`,
      
      // Test default options
      `curl -H "Authorization: Bearer ${API_KEY}" "${DIRECTUS_URL}/items/product_lines_default_options?filter[product_lines_id][_eq]=19"`,
      
      // Test product line with relations
      `curl -H "Authorization: Bearer ${API_KEY}" "${DIRECTUS_URL}/items/product_lines/19?fields=*,default_options.*"`
    ];

    return commands;
  }
}

// Export singleton instance
export const browserApiValidator = new BrowserAPIValidator();

// Export for browser console testing
if (typeof window !== 'undefined') {
  (window as any).browserApiValidator = browserApiValidator;
  (window as any).validateAPI = () => browserApiValidator.runFullValidation();
  (window as any).debugIssues = () => browserApiValidator.debugCurrentIssues();
  (window as any).debugProductMatching = (skus?: string[]) => browserApiValidator.debugProductMatching(skus);
  (window as any).debugProductNaming = () => browserApiValidator.debugProductNaming();
  (window as any).getCurlCommands = () => {
    const commands = browserApiValidator.generateCurlCommands();
    console.log('🔧 Curl commands for manual testing:');
    commands.forEach((cmd, i) => console.log(`${i + 1}. ${cmd}`));
    return commands;
  };
  
  console.log('💡 Available validation commands:');
  console.log('  - validateAPI() - Run full validation suite');
  console.log('  - debugIssues() - Debug specific console log issues');
  console.log('  - debugProductMatching(["W04D", "D01D"]) - Debug specific SKU matching');
  console.log('  - debugProductNaming() - Analyze product naming patterns');
  console.log('  - getCurlCommands() - Get curl commands for manual testing');
}
