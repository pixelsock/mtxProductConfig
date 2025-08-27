// API Validation Agent for Directus Data Integrity
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Environment configuration
const DIRECTUS_URL = process.env.VITE_DIRECTUS_URL || 'https://pim.dude.digital';
const API_KEY = process.env.VITE_DIRECTUS_API_KEY || 'SatmtC2cTo-k-V17usWeYpBcc6hbtXjC';

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

export class APIValidator {
  private baseHeaders: string;

  constructor() {
    this.baseHeaders = `-H "Authorization: Bearer ${API_KEY}" -H "Content-Type: application/json"`;
  }

  /**
   * Execute a curl command and return parsed JSON result
   */
  private async executeCurl(curlCommand: string): Promise<any> {
    try {
      const { stdout, stderr } = await execAsync(curlCommand);
      
      if (stderr) {
        console.warn('Curl stderr:', stderr);
      }

      // Try to parse JSON response
      try {
        return JSON.parse(stdout);
      } catch (parseError) {
        console.error('Failed to parse JSON response:', stdout);
        throw new Error(`Invalid JSON response: ${parseError}`);
      }
    } catch (error) {
      console.error('Curl execution failed:', error);
      throw error;
    }
  }

  /**
   * Validate a specific collection exists and has expected structure
   */
  async validateCollection(collectionName: string, expectedFields?: string[]): Promise<ValidationResult> {
    try {
      const curlCommand = `curl -s ${this.baseHeaders} "${DIRECTUS_URL}/items/${collectionName}?limit=1"`;
      const response = await this.executeCurl(curlCommand);

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
      const curlCommand = `curl -s ${this.baseHeaders} "${DIRECTUS_URL}/items/${collectionName}/${itemId}"`;
      const response = await this.executeCurl(curlCommand);

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
      const curlCommand = `curl -s ${this.baseHeaders} "${DIRECTUS_URL}/items/rules"`;
      const response = await this.executeCurl(curlCommand);

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
      'mirror_control': 'mirror_controls',
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
      const curlCommand = `curl -s ${this.baseHeaders} "${DIRECTUS_URL}/items/product_lines_default_options?filter[product_lines_id][_eq]=${productLineId}"`;
      const response = await this.executeCurl(curlCommand);

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
      const curlCommand = `curl -s ${this.baseHeaders} "${DIRECTUS_URL}/items/products?filter[name][_eq]=${sku}"`;
      const response = await this.executeCurl(curlCommand);

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
        const partialCommand = `curl -s ${this.baseHeaders} "${DIRECTUS_URL}/items/products?filter[name][_contains]=${sku}"`;
        const partialResponse = await this.executeCurl(partialCommand);
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
   * Run comprehensive validation suite
   */
  async runFullValidation(): Promise<{
    collections: ValidationResult[];
    rules: RuleValidationResult[];
    productLines: ValidationResult[];
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
      this.validateItemExists('mirror_styles', 29), // Problematic item from logs
      this.validateItemExists('mirror_styles', 30), // Problematic item from logs
      this.validateItemExists('mirror_styles', 31), // Problematic item from logs
      this.validateItemExists('drivers', 4), // Problematic item from logs
      this.validateItemExists('drivers', 5)  // Problematic item from logs
    ]);

    // Calculate summary
    const allResults = [...collections, ...rules, ...productLines];
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
    }

    return {
      collections,
      rules,
      productLines,
      summary: {
        totalTests,
        passed,
        failed,
        criticalIssues: criticalIssues.slice(0, 10) // Limit to first 10 issues
      }
    };
  }
}

// Export singleton instance
export const apiValidator = new APIValidator();

// Export for browser console testing
if (typeof window !== 'undefined') {
  (window as any).apiValidator = apiValidator;
  console.log('💡 You can run apiValidator.runFullValidation() in the console to test API validation');
}
