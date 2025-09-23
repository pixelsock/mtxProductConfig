/**
 * Test Data Manager
 *
 * Provides both real fixture data and mock utilities
 * Use real data for integration tests, mocks for isolated unit tests
 */

import { vi } from 'vitest';

// Import real data fixtures (when available)
let realFixtures: any = null;
try {
  realFixtures = require('../fixtures/generated-fixtures').testFixtures;
} catch {
  console.warn('⚠️ Real fixtures not found. Run "npm run generate-fixtures" first.');
}

export class TestDataManager {
  /**
   * Get real Supabase data for integration tests
   */
  static getRealData() {
    if (!realFixtures) {
      throw new Error('Real fixtures not available. Run "npm run generate-fixtures" first.');
    }
    return realFixtures;
  }

  /**
   * Create mock with real data structure
   */
  static createRealisticMock<T>(template: T, overrides: Partial<T> = {}): T {
    return { ...template, ...overrides };
  }

  /**
   * Mock Supabase service with real or custom data
   */
  static mockSupabaseService(customData?: any) {
    const data = customData || this.getRealData();

    return {
      getProductLines: vi.fn().mockResolvedValue(data.productLines),
      getProducts: vi.fn().mockResolvedValue(data.products),
      getRules: vi.fn().mockResolvedValue(data.rules),
      getConfigurationUI: vi.fn().mockResolvedValue(data.configurationUI),
    };
  }

  /**
   * Validate that test data matches expected schema
   */
  static validateDataStructure(data: any, expectedKeys: string[]) {
    for (const key of expectedKeys) {
      if (!(key in data)) {
        throw new Error(`Missing expected key: ${key}`);
      }
    }
    return true;
  }
}

// Convenience exports
export const { getRealData, createRealisticMock, mockSupabaseService } = TestDataManager;
