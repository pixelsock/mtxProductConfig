/**
 * SKU Correlation Analysis Script for Story 0.1
 * 
 * This script analyzes the current SKU generation logic, particularly focusing on:
 * 1. How buildFullSku() handles productSkuOverride vs productLineSkuOverride
 * 2. How Deco product line (NULL SKU) behaves in SKU generation
 * 3. How frame thickness selection impacts the first character of SKU codes
 * 4. The relationship between currentProduct vs currentProductLine and SKU generation
 */

import { buildFullSku, type CurrentConfigLike, type SimpleOptions, type SkuOverrides } from '../utils/sku-builder';
import { processRules, getSKUOverride } from '../services/rules-engine';
import { getAllProducts, getActiveProductLines, getProductLineWithOptions } from '../services/directus';
import type { ProductLine } from '../services/directus';

// Mock data for testing - in real usage, this would come from Directus
const mockOptions: SimpleOptions = {
  mirrorControls: [
    { id: 1, name: 'Standard', sku_code: 'S' },
    { id: 2, name: 'Premium', sku_code: 'P' }
  ],
  frameColors: [
    { id: 1, name: 'Black', sku_code: 'B' },
    { id: 2, name: 'White', sku_code: 'W' },
    { id: 3, name: 'Silver', sku_code: 'S' }
  ],
  frameThickness: [
    { id: 1, name: 'Wide Frame', sku_code: 'W' },
    { id: 2, name: 'Thin Frame', sku_code: 'T' }
  ],
  mirrorStyles: [
    { id: 1, name: 'Rectangle', sku_code: 'R' },
    { id: 2, name: 'Oval', sku_code: 'O' }
  ],
  mountingOptions: [
    { id: 1, name: 'Vertical', sku_code: 'V' },
    { id: 2, name: 'Horizontal', sku_code: 'H' }
  ],
  lightingOptions: [
    { id: 1, name: 'Direct', sku_code: 'D' },
    { id: 2, name: 'Indirect', sku_code: 'I' }
  ],
  colorTemperatures: [
    { id: 1, name: 'Warm', sku_code: 'W' },
    { id: 2, name: 'Cool', sku_code: 'C' }
  ],
  lightOutputs: [
    { id: 1, name: 'Low', sku_code: 'L' },
    { id: 2, name: 'High', sku_code: 'H' }
  ],
  drivers: [
    { id: 1, name: 'Standard', sku_code: 'S' },
    { id: 2, name: 'Dimmable', sku_code: 'D' }
  ],
  accessoryOptions: [
    { id: 1, name: 'Nightlight', sku_code: 'NL' },
    { id: 2, name: 'Anti-Fog', sku_code: 'AF' }
  ],
  sizes: [
    { id: 1, name: '24x36', sku_code: '2436', width: 24, height: 36 },
    { id: 2, name: '30x40', sku_code: '3040', width: 30, height: 40 }
  ]
};

// Mock product lines for testing
const mockProductLines: ProductLine[] = [
  {
    id: 1,
    name: 'Deco',
    sku_code: null, // This is the key issue - NULL SKU for Deco
    active: true,
    default_options: []
  },
  {
    id: 2,
    name: 'Classic',
    sku_code: 'CL',
    active: true,
    default_options: []
  },
  {
    id: 3,
    name: 'Modern',
    sku_code: 'MD',
    active: true,
    default_options: []
  }
];

/**
 * Test SKU generation with different frame thickness selections
 */
async function testFrameThicknessImpact() {
  console.log('\n=== Testing Frame Thickness Impact on SKU Generation ===');
  
  const baseConfig: CurrentConfigLike = {
    productLineId: 1, // Deco product line
    mirrorControls: '1',
    frameColor: '1',
    frameThickness: '1', // Will be changed in tests
    mirrorStyle: '1',
    width: '24',
    height: '36',
    mounting: '1',
    lighting: '1',
    colorTemperature: '1',
    lightOutput: '1',
    driver: '1',
    accessories: []
  };

  // Test with wide frame
  console.log('\n--- Wide Frame Test ---');
  const wideConfig = { ...baseConfig, frameThickness: '1' }; // Wide frame
  const wideSku = buildFullSku(wideConfig, mockOptions, mockProductLines[0], undefined);
  console.log('Input config:', wideConfig);
  console.log('Generated SKU:', wideSku.sku);
  console.log('SKU parts:', wideSku.parts);
  console.log('First character analysis:', {
    productLineCode: mockProductLines[0].sku_code,
    mirrorStyleCode: mockOptions.mirrorStyles.find(ms => ms.id.toString() === wideConfig.mirrorStyle)?.sku_code,
    lightDirectionCode: mockOptions.lightingOptions.find(ld => ld.id.toString() === wideConfig.lighting)?.sku_code,
    frameThicknessCode: mockOptions.frameThickness.find(ft => ft.id.toString() === wideConfig.frameThickness)?.sku_code
  });

  // Test with thin frame
  console.log('\n--- Thin Frame Test ---');
  const thinConfig = { ...baseConfig, frameThickness: '2' }; // Thin frame
  const thinSku = buildFullSku(thinConfig, mockOptions, mockProductLines[0], undefined);
  console.log('Input config:', thinConfig);
  console.log('Generated SKU:', thinSku.sku);
  console.log('SKU parts:', thinSku.parts);
  console.log('First character analysis:', {
    productLineCode: mockProductLines[0].sku_code,
    mirrorStyleCode: mockOptions.mirrorStyles.find(ms => ms.id.toString() === thinConfig.mirrorStyle)?.sku_code,
    lightDirectionCode: mockOptions.lightingOptions.find(ld => ld.id.toString() === thinConfig.lighting)?.sku_code,
    frameThicknessCode: mockOptions.frameThickness.find(ft => ft.id.toString() === thinConfig.frameThickness)?.sku_code
  });

  return { wideSku, thinSku };
}

/**
 * Test SKU generation with different override scenarios
 */
async function testSkuOverrides() {
  console.log('\n=== Testing SKU Override Scenarios ===');
  
  const baseConfig: CurrentConfigLike = {
    productLineId: 1, // Deco product line
    mirrorControls: '1',
    frameColor: '1',
    frameThickness: '1',
    mirrorStyle: '1',
    width: '24',
    height: '36',
    mounting: '1',
    lighting: '1',
    colorTemperature: '1',
    lightOutput: '1',
    driver: '1',
    accessories: []
  };

  // Test 1: No overrides (baseline)
  console.log('\n--- No Overrides (Baseline) ---');
  const baselineSku = buildFullSku(baseConfig, mockOptions, mockProductLines[0], undefined);
  console.log('Generated SKU:', baselineSku.sku);
  console.log('SKU parts:', baselineSku.parts);

  // Test 2: Product SKU override
  console.log('\n--- Product SKU Override ---');
  const productOverride: SkuOverrides = {
    productSkuOverride: 'DECO-R-D' // Simulating a specific product code
  };
  const productOverrideSku = buildFullSku(baseConfig, mockOptions, mockProductLines[0], productOverride);
  console.log('Generated SKU:', productOverrideSku.sku);
  console.log('SKU parts:', productOverrideSku.parts);

  // Test 3: Product Line SKU override
  console.log('\n--- Product Line SKU Override ---');
  const productLineOverride: SkuOverrides = {
    productLineSkuOverride: 'DECO' // Simulating product line override
  };
  const productLineOverrideSku = buildFullSku(baseConfig, mockOptions, mockProductLines[0], productLineOverride);
  console.log('Generated SKU:', productLineOverrideSku.sku);
  console.log('SKU parts:', productLineOverrideSku.parts);

  // Test 4: Both overrides (productSkuOverride should take precedence)
  console.log('\n--- Both Overrides (Product should take precedence) ---');
  const bothOverrides: SkuOverrides = {
    productSkuOverride: 'DECO-R-D',
    productLineSkuOverride: 'DECO'
  };
  const bothOverrideSku = buildFullSku(baseConfig, mockOptions, mockProductLines[0], bothOverrides);
  console.log('Generated SKU:', bothOverrideSku.sku);
  console.log('SKU parts:', bothOverrideSku.parts);

  return { baselineSku, productOverrideSku, productLineOverrideSku, bothOverrideSku };
}

/**
 * Test how Deco product line (NULL SKU) behaves
 */
async function testDecoNullSkuBehavior() {
  console.log('\n=== Testing Deco Product Line NULL SKU Behavior ===');
  
  const config: CurrentConfigLike = {
    productLineId: 1, // Deco product line
    mirrorControls: '1',
    frameColor: '1',
    frameThickness: '1',
    mirrorStyle: '1',
    width: '24',
    height: '36',
    mounting: '1',
    lighting: '1',
    colorTemperature: '1',
    lightOutput: '1',
    driver: '1',
    accessories: []
  };

  // Test with NULL product line SKU
  console.log('Product line SKU code:', mockProductLines[0].sku_code);
  console.log('Is NULL?', mockProductLines[0].sku_code === null);
  
  const sku = buildFullSku(config, mockOptions, mockProductLines[0], undefined);
  console.log('Generated SKU:', sku.sku);
  console.log('SKU parts:', sku.parts);
  console.log('Core part (should be empty or fallback):', sku.parts.core);

  // Test with a product line that has a valid SKU code for comparison
  console.log('\n--- Comparison with Classic Product Line (has SKU code) ---');
  const classicSku = buildFullSku(config, mockOptions, mockProductLines[1], undefined);
  console.log('Classic product line SKU code:', mockProductLines[1].sku_code);
  console.log('Generated SKU:', classicSku.sku);
  console.log('SKU parts:', classicSku.parts);
  console.log('Core part:', classicSku.parts.core);

  return { decoSku: sku, classicSku };
}

/**
 * Test rules engine integration with SKU generation
 */
async function testRulesEngineIntegration() {
  console.log('\n=== Testing Rules Engine Integration ===');
  
  const config = {
    product_line: 1, // Deco
    frame_thickness: 1, // Wide frame
    mirror_style: 1,
    light_direction: 1,
    mirror_control: 1,
    frame_color: 1,
    mounting: 1,
    driver: 1,
    light_output: 1,
    color_temperature: 1,
    accessories: []
  };

  try {
    // Test rules processing
    console.log('Processing rules with config:', config);
    const processedConfig = await processRules(config);
    console.log('Processed config:', processedConfig);
    
    // Test SKU override extraction
    console.log('\n--- Testing SKU Override Extraction ---');
    const skuOverride = await getSKUOverride(config);
    console.log('SKU override from rules:', skuOverride);
    
  } catch (error) {
    console.error('Rules engine test failed:', error);
  }
}

/**
 * Main analysis function
 */
export async function runSkuCorrelationAnalysis() {
  console.log('🔍 Starting SKU Correlation Analysis for Story 0.1');
  console.log('================================================');
  
  try {
    // Run all test scenarios
    const frameThicknessResults = await testFrameThicknessImpact();
    const overrideResults = await testSkuOverrides();
    const decoResults = await testDecoNullSkuBehavior();
    const rulesResults = await testRulesEngineIntegration();
    
    // Generate summary
    console.log('\n=== ANALYSIS SUMMARY ===');
    console.log('1. Frame Thickness Impact:');
    console.log('   - Wide Frame SKU:', frameThicknessResults.wideSku.sku);
    console.log('   - Thin Frame SKU:', frameThicknessResults.thinSku.sku);
    console.log('   - Difference in first character:', 
      frameThicknessResults.wideSku.sku.charAt(0) !== frameThicknessResults.thinSku.sku.charAt(0) ? 'YES' : 'NO');
    
    console.log('\n2. Deco NULL SKU Behavior:');
    console.log('   - Deco SKU (NULL product line):', decoResults.decoSku.sku);
    console.log('   - Classic SKU (valid product line):', decoResults.classicSku.sku);
    console.log('   - Core part for Deco:', decoResults.decoSku.parts.core);
    console.log('   - Core part for Classic:', decoResults.classicSku.parts.core);
    
    console.log('\n3. Override Precedence:');
    console.log('   - Baseline SKU:', overrideResults.baselineSku.sku);
    console.log('   - Product Override SKU:', overrideResults.productOverrideSku.sku);
    console.log('   - Product Line Override SKU:', overrideResults.productLineOverrideSku.sku);
    console.log('   - Both Overrides SKU:', overrideResults.bothOverrideSku.sku);
    
    console.log('\n✅ SKU Correlation Analysis Complete');
    
  } catch (error) {
    console.error('❌ Analysis failed:', error);
  }
}

// Make it available globally for browser console testing
if (typeof window !== 'undefined') {
  (window as any).runSkuCorrelationAnalysis = runSkuCorrelationAnalysis;
  console.log('🔧 SKU Correlation Analysis available as window.runSkuCorrelationAnalysis()');
}