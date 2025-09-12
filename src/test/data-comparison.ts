// Data Comparison Test for Phase 3 Validation
// Compares API data outputs with expected static data structure

import {
  getActiveFrameColors,
  getActiveProductLines,
  getActiveMirrorStyles,
  getActiveMountingOptions,
  getActiveLightDirections,
  getActiveColorTemperatures,
  getActiveLightOutputs,
  getActiveDrivers,
  getActiveFrameThicknesses,
  getActiveSizes,
  getActiveAccessories,
  getProductLineBySku,
  checkDataConsistency
} from '../services/directus';

interface TestResult {
  collection: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  message: string;
  data?: any;
  expectedCount?: number;
  actualCount?: number;
}

export class DataComparisonTester {
  private results: TestResult[] = [];

  async runAllTests(): Promise<{ passed: number; failed: number; warnings: number; results: TestResult[] }> {
    console.log('🧪 Starting Phase 3 Data Comparison Tests...');
    
    this.results = [];

    // Test all collections
    await this.testFrameColors();
    await this.testProductLines();
    await this.testMirrorStyles();
    await this.testMountingOptions();
    await this.testLightDirections();
    await this.testColorTemperatures();
    await this.testLightOutputs();
    await this.testDrivers();
    await this.testFrameThicknesses();
    await this.testSizes();
    await this.testAccessories();
    
    // Test critical business logic
    await this.testDecoProductLine();
    await this.testDataConsistency();
    
    // Generate summary
    const summary = this.generateSummary();
    this.printResults();
    
    return summary;
  }

  private async testFrameColors(): Promise<void> {
    try {
      const colors = await getActiveFrameColors();
      
      // Based on static data, we expected 3 colors, but API has more
      if (colors.length >= 3) {
        this.addResult('frame_colors', 'PASS', `Found ${colors.length} frame colors (expanded from static 3)`, colors);
      } else {
        this.addResult('frame_colors', 'FAIL', `Only ${colors.length} frame colors found, expected at least 3`);
      }

      // Validate hex codes
      const invalidHex = colors.filter(c => !c.hex_code.match(/^#[0-9A-Fa-f]{6}$/));
      if (invalidHex.length === 0) {
        this.addResult('frame_colors_validation', 'PASS', 'All hex codes valid');
      } else {
        this.addResult('frame_colors_validation', 'FAIL', `${invalidHex.length} invalid hex codes found`);
      }

    } catch (error) {
      this.addResult('frame_colors', 'FAIL', `Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async testProductLines(): Promise<void> {
    try {
      const lines = await getActiveProductLines();
      
      // Expected 12 product lines from static data
      if (lines.length >= 12) {
        this.addResult('product_lines', 'PASS', `Found ${lines.length} product lines (matches/exceeds static 12)`, lines);
      } else {
        this.addResult('product_lines', 'WARNING', `Only ${lines.length} product lines found, static had 12`);
      }

      // Check for required SKU codes
      const skuCodes = lines.map(l => l.sku_code);
      const requiredSkus = ['D', 'L', 'B', 'F']; // Key product lines
      const missingSkus = requiredSkus.filter(sku => !skuCodes.includes(sku));
      
      if (missingSkus.length === 0) {
        this.addResult('product_lines_skus', 'PASS', 'All required SKU codes present');
      } else {
        this.addResult('product_lines_skus', 'FAIL', `Missing SKU codes: ${missingSkus.join(', ')}`);
      }

    } catch (error) {
      this.addResult('product_lines', 'FAIL', `Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async testMirrorStyles(): Promise<void> {
    try {
      const styles = await getActiveMirrorStyles();
      
      // Expected 11 styles from static data
      if (styles.length >= 11) {
        this.addResult('mirror_styles', 'PASS', `Found ${styles.length} mirror styles (matches/exceeds static 11)`);
      } else {
        this.addResult('mirror_styles', 'WARNING', `Only ${styles.length} mirror styles found, static had 11`);
      }

    } catch (error) {
      this.addResult('mirror_styles', 'FAIL', `Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async testMountingOptions(): Promise<void> {
    try {
      const options = await getActiveMountingOptions();
      
      // Expected 2 mounting options (Portrait, Landscape)
      if (options.length >= 2) {
        this.addResult('mounting_options', 'PASS', `Found ${options.length} mounting options (matches/exceeds static 2)`);
      } else {
        this.addResult('mounting_options', 'WARNING', `Only ${options.length} mounting options found, static had 2`);
      }

    } catch (error) {
      this.addResult('mounting_options', 'FAIL', `Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async testLightDirections(): Promise<void> {
    try {
      const directions = await getActiveLightDirections();
      
      // Expected 3 directions (Direct, Indirect, Both)
      if (directions.length >= 3) {
        this.addResult('light_directions', 'PASS', `Found ${directions.length} light directions (matches/exceeds static 3)`);
      } else {
        this.addResult('light_directions', 'WARNING', `Only ${directions.length} light directions found, static had 3`);
      }

    } catch (error) {
      this.addResult('light_directions', 'FAIL', `Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async testColorTemperatures(): Promise<void> {
    try {
      const temps = await getActiveColorTemperatures();
      
      // Expected 6 temperature options
      if (temps.length >= 6) {
        this.addResult('color_temperatures', 'PASS', `Found ${temps.length} color temperatures (matches/exceeds static 6)`);
      } else {
        this.addResult('color_temperatures', 'WARNING', `Only ${temps.length} color temperatures found, static had 6`);
      }

    } catch (error) {
      this.addResult('color_temperatures', 'FAIL', `Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async testLightOutputs(): Promise<void> {
    try {
      const outputs = await getActiveLightOutputs();
      
      // Expected 2 output levels (Standard, High)
      if (outputs.length >= 2) {
        this.addResult('light_outputs', 'PASS', `Found ${outputs.length} light outputs (matches/exceeds static 2)`);
      } else {
        this.addResult('light_outputs', 'WARNING', `Only ${outputs.length} light outputs found, static had 2`);
      }

    } catch (error) {
      this.addResult('light_outputs', 'FAIL', `Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async testDrivers(): Promise<void> {
    try {
      const drivers = await getActiveDrivers();
      
      // Expected 3 driver types
      if (drivers.length >= 3) {
        this.addResult('drivers', 'PASS', `Found ${drivers.length} drivers (matches/exceeds static 3)`);
      } else {
        this.addResult('drivers', 'WARNING', `Only ${drivers.length} drivers found, static had 3`);
      }

    } catch (error) {
      this.addResult('drivers', 'FAIL', `Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async testFrameThicknesses(): Promise<void> {
    try {
      const thicknesses = await getActiveFrameThicknesses();
      
      // Expected 2 thickness options (Wide, Thin)
      if (thicknesses.length >= 2) {
        this.addResult('frame_thicknesses', 'PASS', `Found ${thicknesses.length} frame thicknesses (matches/exceeds static 2)`);
      } else {
        this.addResult('frame_thicknesses', 'WARNING', `Only ${thicknesses.length} frame thicknesses found, static had 2`);
      }

    } catch (error) {
      this.addResult('frame_thicknesses', 'FAIL', `Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async testSizes(): Promise<void> {
    try {
      const sizes = await getActiveSizes();
      
      // Expected 8 standard sizes
      if (sizes.length >= 8) {
        this.addResult('sizes', 'PASS', `Found ${sizes.length} sizes (matches/exceeds static 8)`);
      } else {
        this.addResult('sizes', 'WARNING', `Only ${sizes.length} sizes found, static had 8`);
      }

      // Validate dimensions
      const invalidSizes = sizes.filter(s => s.width <= 0 || s.height <= 0);
      if (invalidSizes.length === 0) {
        this.addResult('sizes_validation', 'PASS', 'All sizes have valid dimensions');
      } else {
        this.addResult('sizes_validation', 'FAIL', `${invalidSizes.length} sizes have invalid dimensions`);
      }

    } catch (error) {
      this.addResult('sizes', 'FAIL', `Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async testAccessories(): Promise<void> {
    try {
      const accessories = await getActiveAccessories();
      
      // Expected 12 accessories from static data
      if (accessories.length >= 12) {
        this.addResult('accessories', 'PASS', `Found ${accessories.length} accessories (matches/exceeds static 12)`);
      } else {
        this.addResult('accessories', 'WARNING', `Only ${accessories.length} accessories found, static had 12`);
      }

      // Check for Nightlight and Anti-Fog (required for business logic)
      const nightlight = accessories.some(a => a.name.toLowerCase().includes('nightlight') || a.name.toLowerCase().includes('night light'));
      const antiFog = accessories.some(a => a.name.toLowerCase().includes('anti-fog') || a.name.toLowerCase().includes('antifog'));
      
      if (nightlight && antiFog) {
        this.addResult('accessories_required', 'PASS', 'Required accessories (Nightlight, Anti-Fog) found');
      } else {
        const missing = [];
        if (!nightlight) missing.push('Nightlight');
        if (!antiFog) missing.push('Anti-Fog');
        this.addResult('accessories_required', 'FAIL', `Missing required accessories: ${missing.join(', ')}`);
      }

    } catch (error) {
      this.addResult('accessories', 'FAIL', `Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async testDecoProductLine(): Promise<void> {
    try {
      const decoLine = await getProductLineBySku('D');
      
      if (decoLine) {
        this.addResult('deco_product_line', 'PASS', `Deco product line found: ${decoLine.name}`, decoLine);
      } else {
        this.addResult('deco_product_line', 'FAIL', 'Deco product line (SKU: D) not found - CRITICAL for app functionality');
      }

    } catch (error) {
      this.addResult('deco_product_line', 'FAIL', `Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async testDataConsistency(): Promise<void> {
    try {
      const consistency = await checkDataConsistency();
      
      if (consistency.isValid) {
        this.addResult('data_consistency', 'PASS', 'All data consistency checks passed');
      } else {
        this.addResult('data_consistency', 'FAIL', 'Data consistency issues detected', consistency.report);
      }

    } catch (error) {
      this.addResult('data_consistency', 'FAIL', `Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private addResult(collection: string, status: 'PASS' | 'FAIL' | 'WARNING', message: string, data?: any): void {
    this.results.push({ collection, status, message, data });
  }

  private generateSummary(): { passed: number; failed: number; warnings: number; results: TestResult[] } {
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const warnings = this.results.filter(r => r.status === 'WARNING').length;

    return { passed, failed, warnings, results: this.results };
  }

  private printResults(): void {
    console.log('\n📊 Phase 3 Data Comparison Results:');
    console.log('=====================================');

    const summary = this.generateSummary();
    
    console.log(`✅ PASSED: ${summary.passed}`);
    console.log(`❌ FAILED: ${summary.failed}`);
    console.log(`⚠️  WARNINGS: ${summary.warnings}`);
    console.log(`📊 TOTAL TESTS: ${this.results.length}\n`);

    // Print detailed results
    this.results.forEach(result => {
      const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️';
      console.log(`${icon} ${result.collection}: ${result.message}`);
    });

    // Overall status
    if (summary.failed === 0) {
      console.log('\n🎉 All critical tests passed! Data migration successful.');
    } else {
      console.log('\n⚠️ Some tests failed. Review issues above.');
    }
  }
}

// Export for use in tests
export async function runDataComparisonTests(): Promise<void> {
  const tester = new DataComparisonTester();
  await tester.runAllTests();
}