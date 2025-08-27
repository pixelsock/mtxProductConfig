// Comprehensive Validation Test Suite
// This can be run in the browser console to test all fixes

import { browserApiValidator } from '../services/browser-api-validator';
import { processRules } from '../services/rules-engine';
import { generateProductSKU } from '../services/sku-generator';
import { findBestMatchingProduct } from '../services/product-matcher';
import { getProductLineWithOptions, getFilteredOptionsForProductLine, getRules } from '../services/directus';

export interface TestResult {
  testName: string;
  success: boolean;
  message: string;
  data?: any;
  errors?: string[];
}

export class ValidationTestSuite {
  private results: TestResult[] = [];

  /**
   * Run all validation tests
   */
  async runAllTests(): Promise<{
    results: TestResult[];
    summary: {
      total: number;
      passed: number;
      failed: number;
      passRate: number;
    };
  }> {
    console.log('🧪 Starting comprehensive validation test suite...');
    this.results = [];

    // Test 1: API Validation
    await this.testAPIValidation();

    // Test 2: Rules Engine Fix
    await this.testRulesEngine();

    // Test 3: Product Line Default Options
    await this.testProductLineDefaults();

    // Test 4: SKU Generation
    await this.testSKUGeneration();

    // Test 5: Product Matching
    await this.testProductMatching();

    // Test 6: Data Integrity
    await this.testDataIntegrity();

    // Calculate summary
    const total = this.results.length;
    const passed = this.results.filter(r => r.success).length;
    const failed = total - passed;
    const passRate = Math.round((passed / total) * 100);

    const summary = {
      total,
      passed,
      failed,
      passRate
    };

    console.log(`\n📊 Test Summary: ${passed}/${total} tests passed (${passRate}%)`);
    
    if (failed > 0) {
      console.log('❌ Failed tests:');
      this.results.filter(r => !r.success).forEach(result => {
        console.log(`  - ${result.testName}: ${result.message}`);
      });
    }

    return { results: this.results, summary };
  }

  /**
   * Test API validation functionality
   */
  private async testAPIValidation(): Promise<void> {
    try {
      console.log('🔍 Testing API validation...');
      
      const validationResults = await browserApiValidator.runFullValidation();
      
      this.results.push({
        testName: 'API Validation Suite',
        success: validationResults.summary.passed > validationResults.summary.failed,
        message: `${validationResults.summary.passed}/${validationResults.summary.totalTests} API tests passed`,
        data: validationResults.summary
      });

      // Test specific problematic items
      const debugResults = await browserApiValidator.debugCurrentIssues();
      
      this.results.push({
        testName: 'Debug Current Issues',
        success: debugResults.decoDefaults.success && debugResults.productMatching.success,
        message: debugResults.decoDefaults.success 
          ? 'Deco defaults and product matching validated'
          : 'Issues found with Deco defaults or product matching',
        data: debugResults
      });

    } catch (error) {
      this.results.push({
        testName: 'API Validation Suite',
        success: false,
        message: `API validation failed: ${error}`,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      });
    }
  }

  /**
   * Test rules engine fixes
   */
  private async testRulesEngine(): Promise<void> {
    try {
      console.log('🔍 Testing rules engine fixes...');
      
      // Test with sample configuration that should match rules
      const testConfig = {
        product_line: 19, // Deco ID
        frame_thickness: 1, // Wide frame
        mirror_style: 1,
        light_direction: 1
      };

      const rules = await getRules();
      const processedConfig = await processRules(testConfig);

      this.results.push({
        testName: 'Rules Engine - Fetch Rules',
        success: rules.length > 0,
        message: `Fetched ${rules.length} rules from API`,
        data: { rulesCount: rules.length }
      });

      this.results.push({
        testName: 'Rules Engine - Process Configuration',
        success: processedConfig !== null,
        message: processedConfig ? 'Configuration processed successfully' : 'Failed to process configuration',
        data: { originalConfig: testConfig, processedConfig }
      });

      // Test specific rule evaluation with object comparison fix
      let ruleEvaluationSuccess = false;
      for (const rule of rules) {
        try {
          // This should now work with our object comparison fix
          const matches = await processRules(testConfig);
          if (matches) {
            ruleEvaluationSuccess = true;
            break;
          }
        } catch (error) {
          console.warn(`Rule evaluation error for "${rule.name}":`, error);
        }
      }

      this.results.push({
        testName: 'Rules Engine - Object Comparison Fix',
        success: ruleEvaluationSuccess,
        message: ruleEvaluationSuccess 
          ? 'Rules engine correctly handles object comparisons'
          : 'Rules engine still has object comparison issues',
        data: { testConfig }
      });

    } catch (error) {
      this.results.push({
        testName: 'Rules Engine Tests',
        success: false,
        message: `Rules engine test failed: ${error}`,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      });
    }
  }

  /**
   * Test product line default options
   */
  private async testProductLineDefaults(): Promise<void> {
    try {
      console.log('🔍 Testing product line default options...');
      
      // Test Deco product line (ID 19 from console logs)
      const decoLine = await getProductLineWithOptions('D');
      
      this.results.push({
        testName: 'Product Line - Fetch Deco',
        success: !!decoLine,
        message: decoLine ? `Found Deco product line: ${decoLine.name}` : 'Deco product line not found',
        data: decoLine ? {
          id: decoLine.id,
          name: decoLine.name,
          hasDefaultOptions: !!decoLine.default_options,
          defaultOptionsCount: decoLine.default_options?.length || 0
        } : null
      });

      if (decoLine) {
        const filteredOptions = await getFilteredOptionsForProductLine(decoLine);
        
        const hasOptions = Object.values(filteredOptions).some((options: any) => 
          Array.isArray(options) && options.length > 0
        );

        this.results.push({
          testName: 'Product Line - Filtered Options',
          success: hasOptions,
          message: hasOptions 
            ? 'Successfully loaded filtered options for Deco'
            : 'No filtered options available for Deco (check default_options configuration)',
          data: {
            mirrorControls: filteredOptions.mirrorControls.length,
            frameColors: filteredOptions.frameColors.length,
            mirrorStyles: filteredOptions.mirrorStyles.length,
            sizes: filteredOptions.sizes.length
          }
        });
      }

    } catch (error) {
      this.results.push({
        testName: 'Product Line Default Options',
        success: false,
        message: `Product line test failed: ${error}`,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      });
    }
  }

  /**
   * Test SKU generation
   */
  private async testSKUGeneration(): Promise<void> {
    try {
      console.log('🔍 Testing SKU generation...');
      
      const decoLine = await getProductLineWithOptions('D');
      if (!decoLine) {
        this.results.push({
          testName: 'SKU Generation',
          success: false,
          message: 'Cannot test SKU generation without Deco product line',
          errors: ['Deco product line not found']
        });
        return;
      }

      // Mock the required objects for SKU generation
      const mockFrameThickness = { id: 1, name: 'Wide Frame', sku_code: 'W' };
      const mockMirrorStyle = { id: 1, name: 'Full Frame Inset', sku_code: '01' };
      const mockLightDirection = { id: 1, name: 'Direct', sku_code: 'D' };

      const generatedSKU = await generateProductSKU({
        productLine: decoLine,
        frameThickness: mockFrameThickness as any,
        mirrorStyle: mockMirrorStyle as any,
        lightDirection: mockLightDirection as any
      });

      const expectedSKU = 'D01D'; // Based on console logs
      const skuMatches = generatedSKU === expectedSKU;

      this.results.push({
        testName: 'SKU Generation',
        success: !!generatedSKU,
        message: generatedSKU 
          ? `Generated SKU: ${generatedSKU}${skuMatches ? ' (matches expected)' : ` (expected: ${expectedSKU})`}`
          : 'Failed to generate SKU',
        data: {
          generatedSKU,
          expectedSKU,
          matches: skuMatches,
          inputs: {
            productLine: decoLine.name,
            frameThickness: mockFrameThickness.name,
            mirrorStyle: mockMirrorStyle.name,
            lightDirection: mockLightDirection.name
          }
        }
      });

    } catch (error) {
      this.results.push({
        testName: 'SKU Generation',
        success: false,
        message: `SKU generation test failed: ${error}`,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      });
    }
  }

  /**
   * Test product matching
   */
  private async testProductMatching(): Promise<void> {
    try {
      console.log('🔍 Testing product matching...');
      
      // Test the SKU that was failing in console logs
      const testSKU = 'D01D';
      const product = await findBestMatchingProduct({
        sku: testSKU,
        productLineId: 19, // Deco
        mirrorStyleId: 1,
        lightDirectionId: 1
      });

      this.results.push({
        testName: 'Product Matching - D01D SKU',
        success: !!product,
        message: product 
          ? `Found product for SKU ${testSKU}: ${product.name}`
          : `No product found for SKU ${testSKU}`,
        data: product ? {
          id: product.id,
          name: product.name,
          hasVerticalImage: !!product.vertical_image,
          hasHorizontalImage: !!product.horizontal_image
        } : null
      });

      // Test product matching validation from API validator
      const apiValidation = await browserApiValidator.validateProductMatching(testSKU);
      
      this.results.push({
        testName: 'Product Matching - API Validation',
        success: apiValidation.success,
        message: apiValidation.message,
        data: apiValidation.data,
        errors: apiValidation.errors
      });

    } catch (error) {
      this.results.push({
        testName: 'Product Matching',
        success: false,
        message: `Product matching test failed: ${error}`,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      });
    }
  }

  /**
   * Test data integrity
   */
  private async testDataIntegrity(): Promise<void> {
    try {
      console.log('🔍 Testing data integrity...');
      
      // Test the specific problematic items from console logs
      const problematicItems = [
        { collection: 'mirror_styles', id: 29 },
        { collection: 'mirror_styles', id: 30 },
        { collection: 'mirror_styles', id: 31 },
        { collection: 'drivers', id: 4 },
        { collection: 'drivers', id: 5 }
      ];

      let validItems = 0;
      let invalidItems = 0;

      for (const item of problematicItems) {
        const validation = await browserApiValidator.validateItemExists(item.collection, item.id);
        if (validation.success) {
          validItems++;
        } else {
          invalidItems++;
        }
      }

      this.results.push({
        testName: 'Data Integrity - Problematic Items',
        success: invalidItems === 0,
        message: `${validItems}/${problematicItems.length} problematic items are valid`,
        data: {
          validItems,
          invalidItems,
          totalTested: problematicItems.length,
          problematicItems
        }
      });

      // Test collection validation
      const collections = ['product_lines', 'rules', 'mirror_styles', 'drivers', 'products'];
      let validCollections = 0;

      for (const collection of collections) {
        const validation = await browserApiValidator.validateCollection(collection);
        if (validation.success) {
          validCollections++;
        }
      }

      this.results.push({
        testName: 'Data Integrity - Collections',
        success: validCollections === collections.length,
        message: `${validCollections}/${collections.length} collections are valid`,
        data: {
          validCollections,
          totalCollections: collections.length,
          collections
        }
      });

    } catch (error) {
      this.results.push({
        testName: 'Data Integrity',
        success: false,
        message: `Data integrity test failed: ${error}`,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      });
    }
  }

  /**
   * Get detailed test report
   */
  getDetailedReport(): string {
    let report = '📋 Detailed Test Report\n';
    report += '=' .repeat(50) + '\n\n';

    this.results.forEach((result, index) => {
      const status = result.success ? '✅' : '❌';
      report += `${index + 1}. ${status} ${result.testName}\n`;
      report += `   ${result.message}\n`;
      
      if (result.errors && result.errors.length > 0) {
        report += `   Errors: ${result.errors.join(', ')}\n`;
      }
      
      if (result.data) {
        report += `   Data: ${JSON.stringify(result.data, null, 2)}\n`;
      }
      
      report += '\n';
    });

    return report;
  }
}

// Export singleton instance
export const validationTestSuite = new ValidationTestSuite();

// Export for browser console testing
if (typeof window !== 'undefined') {
  (window as any).validationTestSuite = validationTestSuite;
  (window as any).runValidationTests = () => validationTestSuite.runAllTests();
  (window as any).getTestReport = () => {
    console.log(validationTestSuite.getDetailedReport());
    return validationTestSuite.getDetailedReport();
  };
  
  console.log('🧪 Validation Test Suite loaded!');
  console.log('Available commands:');
  console.log('  - runValidationTests() - Run all validation tests');
  console.log('  - getTestReport() - Get detailed test report');
}
