/**
 * Refactored Architecture Test
 * 
 * Tests the new service-oriented architecture to ensure it maintains
 * all functionality from the original monolithic App.tsx component.
 */

import { SkuBuilderService } from '../services/core/SkuBuilderService';
import { ConfigurationService } from '../services/core/ConfigurationService';
import { ProductLineService } from '../services/core/ProductLineService';
import { RulesEngineService } from '../services/core/RulesEngineService';
import { UIConfigurationService } from '../services/core/UIConfigurationService';
import { ProductService } from '../services/core/ProductService';
import { ImageService } from '../services/core/ImageService';
import type { ProductConfiguration } from '../services/types/ServiceTypes';

interface TestResult {
  success: boolean;
  message: string;
  details?: any;
  error?: string;
}

class ArchitectureValidator {
  private skuBuilder: SkuBuilderService;
  private configService: ConfigurationService;
  private productLineService: ProductLineService;
  private rulesEngine: RulesEngineService;
  private uiConfigService: UIConfigurationService;
  private productService: ProductService;
  private imageService: ImageService;

  constructor() {
    this.skuBuilder = new SkuBuilderService();
    this.configService = new ConfigurationService();
    this.productLineService = new ProductLineService();
    this.rulesEngine = new RulesEngineService();
    this.uiConfigService = new UIConfigurationService();
    this.productService = new ProductService();
    this.imageService = new ImageService();
  }

  // Test 1: Service Initialization
  async testServiceInitialization(): Promise<TestResult> {
    try {
      console.log('🔧 Testing service initialization...');
      
      const initResults = await Promise.allSettled([
        this.skuBuilder.initialize(),
        this.configService.initialize(),
        this.productLineService.initialize(),
        this.rulesEngine.initialize(),
        this.uiConfigService.initialize(),
        this.productService.initialize(),
        this.imageService.initialize()
      ]);

      const failures = initResults
        .map((result, index) => ({ result, index }))
        .filter(({ result }) => result.status === 'rejected' || (result.status === 'fulfilled' && !result.value.success))
        .map(({ result, index }) => {
          const serviceNames = ['SkuBuilder', 'Configuration', 'ProductLine', 'RulesEngine', 'UIConfiguration', 'Product', 'Image'];
          const serviceName = serviceNames[index];
          const error = result.status === 'rejected' ? result.reason : result.value.error;
          return `${serviceName}: ${error}`;
        });

      if (failures.length > 0) {
        return {
          success: false,
          message: 'Some services failed to initialize',
          error: failures.join('; ')
        };
      }

      return {
        success: true,
        message: 'All services initialized successfully',
        details: { servicesInitialized: initResults.length }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Service initialization test failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Test 2: API-Driven SKU Building
  async testApiDrivenSkuBuilding(): Promise<TestResult> {
    try {
      console.log('🏷️ Testing API-driven SKU building...');

      // Create a test configuration
      const testConfig: ProductConfiguration = {
        id: 'test-config-1',
        productLineId: '1', // Deco product line
        frameColor: '1',
        mirrorStyle: '1',
        lighting: '1',
        lightOutput: '1',
        colorTemperature: '1',
        driver: '1',
        mounting: '1',
        width: '24',
        height: '36',
        accessories: ['1'],
        customWidth: '',
        customHeight: '',
        quote: null
      };

      // Get product line data
      const productLineResult = await this.productLineService.getProductLines();
      if (!productLineResult.success || productLineResult.data.length === 0) {
        return {
          success: false,
          message: 'Failed to load product lines for SKU test',
          error: productLineResult.error || 'No product lines found'
        };
      }

      const productLine = productLineResult.data[0];

      // Build SKU using the new API-driven approach
      const skuResult = await this.skuBuilder.buildSku(testConfig, productLine, {});
      
      if (!skuResult.success) {
        return {
          success: false,
          message: 'API-driven SKU building failed',
          error: skuResult.error
        };
      }

      const { sku, segments, warnings } = skuResult.data;

      return {
        success: true,
        message: 'API-driven SKU building successful',
        details: {
          sku,
          segmentCount: segments.length,
          warnings: warnings.length,
          firstSegment: segments[0]
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'SKU building test failed with exception',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Test 3: Configuration UI Loading
  async testConfigurationUiLoading(): Promise<TestResult> {
    try {
      console.log('🎨 Testing configuration UI loading...');

      const uiConfigResult = await this.uiConfigService.getConfigurationUI('1');
      
      if (!uiConfigResult.success) {
        return {
          success: false,
          message: 'Failed to load configuration UI',
          error: uiConfigResult.error
        };
      }

      const uiConfig = uiConfigResult.data;
      
      return {
        success: true,
        message: 'Configuration UI loaded successfully',
        details: {
          itemCount: uiConfig.length,
          collections: uiConfig.map(item => item.collection).filter(Boolean),
          uiTypes: [...new Set(uiConfig.map(item => item.ui_type).filter(Boolean))]
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Configuration UI test failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Test 4: Rules Engine Functionality
  async testRulesEngine(): Promise<TestResult> {
    try {
      console.log('⚡ Testing rules engine functionality...');

      const rulesResult = await this.rulesEngine.getRules();
      
      if (!rulesResult.success) {
        return {
          success: false,
          message: 'Failed to load rules',
          error: rulesResult.error
        };
      }

      const rules = rulesResult.data;
      
      // Test rule processing with a sample configuration
      const testConfig: ProductConfiguration = {
        id: 'test-config-rules',
        productLineId: '1',
        frameColor: '1',
        mirrorStyle: '1',
        lighting: '1',
        lightOutput: '1',
        colorTemperature: '1',
        driver: '1',
        mounting: '1',
        width: '24',
        height: '36',
        accessories: [],
        customWidth: '',
        customHeight: '',
        quote: null
      };

      const processResult = await this.rulesEngine.processRules(testConfig, {});
      
      if (!processResult.success) {
        return {
          success: false,
          message: 'Rules processing failed',
          error: processResult.error
        };
      }

      return {
        success: true,
        message: 'Rules engine working correctly',
        details: {
          totalRules: rules.length,
          overrides: processResult.data?.overrides || {},
          processedSuccessfully: true
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Rules engine test failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Test 5: Product and Image Services
  async testProductAndImageServices(): Promise<TestResult> {
    try {
      console.log('📸 Testing product and image services...');

      // Test product loading
      const productsResult = await this.productService.getProducts();
      if (!productsResult.success) {
        return {
          success: false,
          message: 'Failed to load products',
          error: productsResult.error
        };
      }

      // Test image service
      const testConfig: ProductConfiguration = {
        id: 'test-config-images',
        productLineId: '1',
        frameColor: '1',
        mirrorStyle: '1',
        lighting: '1',
        lightOutput: '1',
        colorTemperature: '1',
        driver: '1',
        mounting: '1',
        width: '24',
        height: '36',
        accessories: [],
        customWidth: '',
        customHeight: '',
        quote: null
      };

      const imageResult = await this.imageService.getProductImages(testConfig);
      if (!imageResult.success) {
        return {
          success: false,
          message: 'Failed to get product images',
          error: imageResult.error
        };
      }

      return {
        success: true,
        message: 'Product and image services working correctly',
        details: {
          productCount: productsResult.data.length,
          primaryImage: imageResult.data.primary || 'none',
          additionalImages: imageResult.data.additional.length
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Product/image services test failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Run all tests
  async runAllTests(): Promise<{ passed: number; failed: number; results: TestResult[] }> {
    console.log('🧪 Starting refactored architecture validation...');
    console.log('='.repeat(60));

    const tests = [
      { name: 'Service Initialization', test: () => this.testServiceInitialization() },
      { name: 'API-Driven SKU Building', test: () => this.testApiDrivenSkuBuilding() },
      { name: 'Configuration UI Loading', test: () => this.testConfigurationUiLoading() },
      { name: 'Rules Engine Functionality', test: () => this.testRulesEngine() },
      { name: 'Product and Image Services', test: () => this.testProductAndImageServices() }
    ];

    const results: TestResult[] = [];
    let passed = 0;
    let failed = 0;

    for (const { name, test } of tests) {
      console.log(`\nRunning: ${name}`);
      console.log('-'.repeat(40));
      
      const result = await test();
      results.push(result);

      if (result.success) {
        passed++;
        console.log(`✅ ${result.message}`);
        if (result.details) {
          console.log(`   Details:`, JSON.stringify(result.details, null, 2));
        }
      } else {
        failed++;
        console.log(`❌ ${result.message}`);
        if (result.error) {
          console.log(`   Error: ${result.error}`);
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`🎯 Test Results: ${passed} passed, ${failed} failed`);
    
    if (failed === 0) {
      console.log('🎉 All tests passed! Refactored architecture is working correctly.');
    } else {
      console.log(`⚠️  ${failed} test(s) failed. Please review the issues above.`);
    }

    return { passed, failed, results };
  }
}

// Export the validator for use in other test files
export { ArchitectureValidator };

// Export a function to run the tests
export async function validateRefactoredArchitecture(): Promise<boolean> {
  const validator = new ArchitectureValidator();
  const { failed } = await validator.runAllTests();
  return failed === 0;
}

// Run tests if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  validateRefactoredArchitecture()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test execution failed:', error);
      process.exit(1);
    });
}